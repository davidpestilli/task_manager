import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

// Services
import { 
  getTasksByProject, 
  getTasksWithFilters,
  createTask, 
  updateTask, 
  deleteTask,
  calculateTaskProgress
} from '@/services/tasks'

// Context
import { useTaskContext } from '@/context/TaskContext'
import { useProjectContext } from '@/context/ProjectContext'

/**
 * Hook para gerenciar operações de tarefas
 * @param {string} projectId - ID do projeto (opcional)
 * @returns {Object} Operações e estado das tarefas
 */
export const useTasks = (projectId = null) => {
  const queryClient = useQueryClient()
  const { 
    tasksByProject, 
    filters,
    loading,
    errors,
    setTasks, 
    addTask, 
    updateTask: updateTaskInContext, 
    removeTask,
    setLoading,
    setError,
    clearError,
    getFilteredTasks,
    getQuickStats
  } = useTaskContext()
  
  const { selectedProject } = useProjectContext()
  
  // Usar projectId passado ou projeto selecionado no contexto
  const currentProjectId = projectId || selectedProject?.id

  // Query key para as tarefas
  const tasksQueryKey = ['tasks', currentProjectId]

  /**
   * Query para buscar tarefas do projeto
   */
  const {
    data: tasks = [],
    isLoading: isLoadingTasks,
    error: tasksError,
    refetch: refetchTasks
  } = useQuery({
    queryKey: tasksQueryKey,
    queryFn: () => getTasksByProject(currentProjectId),
    enabled: !!currentProjectId,
    staleTime: 1000 * 60 * 2, // 2 minutos
    onSuccess: (data) => {
      setTasks(currentProjectId, data)
      clearError('tasks')
    },
    onError: (error) => {
      console.error('Erro ao carregar tarefas:', error)
      setError('tasks', error.message)
      toast.error('Erro ao carregar tarefas')
    }
  })

  /**
   * Query para buscar tarefas filtradas
   */
  const {
    data: filteredTasks = [],
    isLoading: isLoadingFiltered,
    refetch: refetchFiltered
  } = useQuery({
    queryKey: ['tasks', currentProjectId, 'filtered', filters],
    queryFn: () => getTasksWithFilters(currentProjectId, filters),
    enabled: !!currentProjectId && Object.values(filters).some(v => v !== null && v !== '' && v !== 'all'),
    staleTime: 1000 * 30, // 30 segundos
    onError: (error) => {
      console.error('Erro ao filtrar tarefas:', error)
      toast.error('Erro ao filtrar tarefas')
    }
  })

  /**
   * Mutation para criar nova tarefa
   */
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onMutate: () => {
      setLoading('creating', true)
      clearError('create')
    },
    onSuccess: (newTask) => {
      // Atualizar cache
      queryClient.setQueryData(tasksQueryKey, (oldTasks = []) => [newTask, ...oldTasks])
      
      // Atualizar contexto
      addTask(currentProjectId, newTask)
      
      setLoading('creating', false)
      toast.success('Tarefa criada com sucesso!')
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries(['tasks', currentProjectId])
    },
    onError: (error) => {
      console.error('Erro ao criar tarefa:', error)
      setError('create', error.message)
      setLoading('creating', false)
      toast.error(error.message || 'Erro ao criar tarefa')
    }
  })

  /**
   * Mutation para atualizar tarefa
   */
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }) => updateTask(taskId, updates),
    onMutate: () => {
      setLoading('updating', true)
      clearError('update')
    },
    onSuccess: (updatedTask, { taskId }) => {
      // Atualizar cache
      queryClient.setQueryData(tasksQueryKey, (oldTasks = []) =>
        oldTasks.map(task => task.id === taskId ? { ...task, ...updatedTask } : task)
      )
      
      // Atualizar contexto
      updateTaskInContext(currentProjectId, updatedTask)
      
      setLoading('updating', false)
      toast.success('Tarefa atualizada com sucesso!')
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries(['task', taskId])
    },
    onError: (error) => {
      console.error('Erro ao atualizar tarefa:', error)
      setError('update', error.message)
      setLoading('updating', false)
      toast.error(error.message || 'Erro ao atualizar tarefa')
    }
  })

  /**
   * Mutation para excluir tarefa
   */
  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onMutate: (taskId) => {
      setLoading('updating', true)
    },
    onSuccess: (_, taskId) => {
      // Atualizar cache
      queryClient.setQueryData(tasksQueryKey, (oldTasks = []) =>
        oldTasks.filter(task => task.id !== taskId)
      )
      
      // Atualizar contexto
      removeTask(currentProjectId, taskId)
      
      setLoading('updating', false)
      toast.success('Tarefa excluída com sucesso!')
      
      // Invalidar queries relacionadas
      queryClient.removeQueries(['task', taskId])
    },
    onError: (error) => {
      console.error('Erro ao excluir tarefa:', error)
      setLoading('updating', false)
      toast.error(error.message || 'Erro ao excluir tarefa')
    }
  })

  // Funções auxiliares
  const createNewTask = useCallback((taskData) => {
    if (!currentProjectId) {
      toast.error('Nenhum projeto selecionado')
      return
    }
    
    createTaskMutation.mutate({
      ...taskData,
      project_id: currentProjectId
    })
  }, [currentProjectId, createTaskMutation])

  const updateTaskData = useCallback((taskId, updates) => {
    updateTaskMutation.mutate({ taskId, updates })
  }, [updateTaskMutation])

  const deleteTaskData = useCallback((taskId) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteTaskMutation.mutate(taskId)
    }
  }, [deleteTaskMutation])

  // Buscar tarefas do contexto (com cache local)
  const contextTasks = currentProjectId ? tasksByProject[currentProjectId] || [] : []
  
  // Usar filtros do contexto se aplicáveis
  const finalTasks = Object.values(filters).some(v => v !== null && v !== '' && v !== 'all')
    ? getFilteredTasks(currentProjectId)
    : contextTasks.length > 0 ? contextTasks : tasks

  // Processar tarefas com progresso calculado
  const tasksWithProgress = finalTasks.map(task => ({
    ...task,
    progressPercentage: calculateTaskProgress(task.task_steps)
  }))

  // Estatísticas rápidas
  const stats = getQuickStats(currentProjectId)

  return {
    // Dados
    tasks: tasksWithProgress,
    filteredTasks,
    stats,
    
    // Estados de loading
    isLoading: isLoadingTasks || loading.tasks,
    isLoadingFiltered,
    isCreating: loading.creating,
    isUpdating: loading.updating,
    
    // Erros
    error: tasksError || errors.tasks,
    createError: errors.create,
    updateError: errors.update,
    
    // Operações
    createTask: createNewTask,
    updateTask: updateTaskData,
    deleteTask: deleteTaskData,
    refetchTasks,
    refetchFiltered,
    
    // Estados das mutations
    isCreatingTask: createTaskMutation.isLoading,
    isUpdatingTask: updateTaskMutation.isLoading,
    isDeletingTask: deleteTaskMutation.isLoading,
    
    // Utilitários
    calculateProgress: calculateTaskProgress,
    hasProject: !!currentProjectId
  }
}