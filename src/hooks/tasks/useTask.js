import { useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

// Services
import { getTaskById, updateTask, calculateTaskProgress } from '@/services/tasks'
import { getTaskAssignments, assignUserToTask, removeUserFromTask } from '@/services/tasks'

// Context
import { useTaskContext } from '@/context/TaskContext'

/**
 * Hook para gerenciar uma tarefa específica
 * @param {string} taskId - ID da tarefa
 * @returns {Object} Operações e estado da tarefa
 */
export const useTask = (taskId) => {
  const queryClient = useQueryClient()
  const { 
    selectedTask,
    setSelectedTask,
    clearSelectedTask,
    updateTask: updateTaskInContext,
    updateTaskAssignments,
    setLoading,
    setError,
    clearError
  } = useTaskContext()

  // Query key para a tarefa
  const taskQueryKey = ['task', taskId]
  const assignmentsQueryKey = ['task-assignments', taskId]

  /**
   * Query para buscar dados completos da tarefa
   */
  const {
    data: task,
    isLoading: isLoadingTask,
    error: taskError,
    refetch: refetchTask
  } = useQuery({
    queryKey: taskQueryKey,
    queryFn: () => getTaskById(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 2, // 2 minutos
    onSuccess: (data) => {
      setSelectedTask(data)
      clearError('selectedTask')
    },
    onError: (error) => {
      console.error('Erro ao carregar tarefa:', error)
      setError('selectedTask', error.message)
      clearSelectedTask()
    }
  })

  /**
   * Query para buscar atribuições da tarefa
   */
  const {
    data: assignments = [],
    isLoading: isLoadingAssignments,
    refetch: refetchAssignments
  } = useQuery({
    queryKey: assignmentsQueryKey,
    queryFn: () => getTaskAssignments(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60, // 1 minuto
    onSuccess: (data) => {
      updateTaskAssignments(taskId, data)
    },
    onError: (error) => {
      console.error('Erro ao carregar atribuições:', error)
      toast.error('Erro ao carregar atribuições')
    }
  })

  /**
   * Mutation para atualizar dados básicos da tarefa
   */
  const updateTaskMutation = useMutation({
    mutationFn: (updates) => updateTask(taskId, updates),
    onMutate: () => {
      setLoading('updating', true)
      clearError('update')
    },
    onSuccess: (updatedTask) => {
      // Atualizar cache da tarefa específica
      queryClient.setQueryData(taskQueryKey, (oldTask) => ({
        ...oldTask,
        ...updatedTask
      }))

      // Atualizar cache da lista de tarefas do projeto
      const projectId = task?.project_id
      if (projectId) {
        queryClient.setQueryData(['tasks', projectId], (oldTasks = []) =>
          oldTasks.map(t => t.id === taskId ? { ...t, ...updatedTask } : t)
        )

        // Atualizar contexto
        updateTaskInContext(projectId, { id: taskId, ...updatedTask })
      }

      setLoading('updating', false)
      toast.success('Tarefa atualizada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar tarefa:', error)
      setError('update', error.message)
      setLoading('updating', false)
      toast.error(error.message || 'Erro ao atualizar tarefa')
    }
  })

  /**
   * Mutation para atribuir usuário à tarefa
   */
  const assignUserMutation = useMutation({
    mutationFn: ({ userId, assignedBy }) => assignUserToTask({
      task_id: taskId,
      user_id: userId,
      assigned_by: assignedBy
    }),
    onSuccess: (newAssignment) => {
      // Atualizar cache de atribuições
      queryClient.setQueryData(assignmentsQueryKey, (oldAssignments = []) => [
        ...oldAssignments,
        newAssignment
      ])

      // Atualizar contexto
      const updatedAssignments = [...assignments, newAssignment]
      updateTaskAssignments(taskId, updatedAssignments)

      toast.success('Usuário atribuído com sucesso!')
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries(['tasks'])
    },
    onError: (error) => {
      console.error('Erro ao atribuir usuário:', error)
      toast.error(error.message || 'Erro ao atribuir usuário')
    }
  })

  /**
   * Mutation para remover atribuição de usuário
   */
  const removeAssignmentMutation = useMutation({
    mutationFn: (userId) => removeUserFromTask(taskId, userId),
    onSuccess: (_, userId) => {
      // Atualizar cache de atribuições
      queryClient.setQueryData(assignmentsQueryKey, (oldAssignments = []) =>
        oldAssignments.filter(assignment => assignment.user_id !== userId)
      )

      // Atualizar contexto
      const updatedAssignments = assignments.filter(a => a.user_id !== userId)
      updateTaskAssignments(taskId, updatedAssignments)

      toast.success('Atribuição removida com sucesso!')
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries(['tasks'])
    },
    onError: (error) => {
      console.error('Erro ao remover atribuição:', error)
      toast.error(error.message || 'Erro ao remover atribuição')
    }
  })

  // Limpar tarefa selecionada quando o hook é desmontado
  useEffect(() => {
    return () => {
      if (!taskId) {
        clearSelectedTask()
      }
    }
  }, [taskId, clearSelectedTask])

  // Funções auxiliares
  const updateTaskData = useCallback((updates) => {
    updateTaskMutation.mutate(updates)
  }, [updateTaskMutation])

  const assignUser = useCallback((userId, assignedBy) => {
    assignUserMutation.mutate({ userId, assignedBy })
  }, [assignUserMutation])

  const removeAssignment = useCallback((userId) => {
    if (window.confirm('Tem certeza que deseja remover esta atribuição?')) {
      removeAssignmentMutation.mutate(userId)
    }
  }, [removeAssignmentMutation])

  const updateStatus = useCallback((newStatus) => {
    updateTaskData({ status: newStatus })
  }, [updateTaskData])

  const updateBasicInfo = useCallback((name, description) => {
    const updates = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    updateTaskData(updates)
  }, [updateTaskData])

  // Calcular progresso se a tarefa tem etapas
  const progressPercentage = task?.task_steps ? calculateTaskProgress(task.task_steps) : 0

  // Estatísticas da tarefa
  const taskStats = {
    totalSteps: task?.task_steps?.length || 0,
    completedSteps: task?.task_steps?.filter(step => step.is_completed).length || 0,
    totalAssignments: assignments.length,
    progressPercentage,
    canMarkCompleted: progressPercentage === 100,
    isCompleted: task?.status === 'concluída'
  }

  return {
    // Dados
    task: task || selectedTask,
    assignments,
    taskStats,
    
    // Estados de loading
    isLoading: isLoadingTask,
    isLoadingAssignments,
    isUpdating: updateTaskMutation.isLoading,
    isAssigning: assignUserMutation.isLoading,
    isRemovingAssignment: removeAssignmentMutation.isLoading,
    
    // Erros
    error: taskError,
    
    // Operações básicas
    updateTask: updateTaskData,
    updateStatus,
    updateBasicInfo,
    refetchTask,
    
    // Operações de atribuição
    assignUser,
    removeAssignment,
    refetchAssignments,
    
    // Estados das mutations
    updateMutation: updateTaskMutation,
    assignMutation: assignUserMutation,
    removeMutation: removeAssignmentMutation,
    
    // Utilitários
    hasTask: !!task,
    progressPercentage,
    
    // Verificações de estado
    canEdit: !!task && task.status !== 'concluída',
    isCompleted: task?.status === 'concluída',
    isPaused: task?.status === 'pausada',
    isInProgress: task?.status === 'em_andamento',
    isNotStarted: task?.status === 'não_iniciada'
  }
}