import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

// Services
import { 
  getTaskSteps,
  createTaskStep,
  updateTaskStep,
  deleteTaskStep,
  toggleTaskStepCompletion,
  reorderTaskSteps,
  addMultipleSteps,
  calculateStepsStats
} from '@/services/tasks'

// Context
import { useTaskContext } from '@/context/TaskContext'
import { useAuth } from '@/context/AuthContext'

/**
 * Hook para gerenciar etapas de uma tarefa
 * @param {string} taskId - ID da tarefa
 * @returns {Object} Operações e estado das etapas
 */
export const useTaskSteps = (taskId) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { updateTaskSteps, updateTask } = useTaskContext()

  // Query key para as etapas
  const stepsQueryKey = ['task-steps', taskId]
  const taskQueryKey = ['task', taskId]

  /**
   * Query para buscar etapas da tarefa
   */
  const {
    data: steps = [],
    isLoading: isLoadingSteps,
    error: stepsError,
    refetch: refetchSteps
  } = useQuery({
    queryKey: stepsQueryKey,
    queryFn: () => getTaskSteps(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60, // 1 minuto
    onSuccess: (data) => {
      // Atualizar contexto
      updateTaskSteps(taskId, data)
    },
    onError: (error) => {
      console.error('Erro ao carregar etapas:', error)
      toast.error('Erro ao carregar etapas')
    }
  })

  /**
   * Mutation para criar nova etapa
   */
  const createStepMutation = useMutation({
    mutationFn: createTaskStep,
    onSuccess: (newStep) => {
      // Atualizar cache
      queryClient.setQueryData(stepsQueryKey, (oldSteps = []) => {
        const updatedSteps = [...oldSteps, newStep].sort((a, b) => a.step_order - b.step_order)
        updateTaskSteps(taskId, updatedSteps)
        return updatedSteps
      })

      toast.success('Etapa criada com sucesso!')
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries(taskQueryKey)
    },
    onError: (error) => {
      console.error('Erro ao criar etapa:', error)
      toast.error(error.message || 'Erro ao criar etapa')
    }
  })

  /**
   * Mutation para atualizar etapa
   */
  const updateStepMutation = useMutation({
    mutationFn: ({ stepId, updates }) => updateTaskStep(stepId, updates),
    onSuccess: (updatedStep, { stepId }) => {
      // Atualizar cache
      queryClient.setQueryData(stepsQueryKey, (oldSteps = []) => {
        const updatedSteps = oldSteps.map(step => 
          step.id === stepId ? updatedStep : step
        )
        updateTaskSteps(taskId, updatedSteps)
        return updatedSteps
      })

      toast.success('Etapa atualizada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar etapa:', error)
      toast.error(error.message || 'Erro ao atualizar etapa')
    }
  })

  /**
   * Mutation para alterar status de conclusão da etapa
   */
  const toggleCompletionMutation = useMutation({
    mutationFn: ({ stepId, isCompleted }) => 
      toggleTaskStepCompletion(stepId, isCompleted, user.id),
    onSuccess: (updatedStep, { stepId }) => {
      // Atualizar cache das etapas
      queryClient.setQueryData(stepsQueryKey, (oldSteps = []) => {
        const updatedSteps = oldSteps.map(step => 
          step.id === stepId ? updatedStep : step
        )
        updateTaskSteps(taskId, updatedSteps)
        return updatedSteps
      })

      // Atualizar status da tarefa baseado no progresso
      const allSteps = queryClient.getQueryData(stepsQueryKey) || []
      const stats = calculateStepsStats(allSteps)
      
      if (stats.isCompleted) {
        // Todas as etapas concluídas - marcar tarefa como concluída
        updateTask(taskId, { status: 'concluída' })
        toast.success('Tarefa concluída! 🎉')
      } else if (stats.completed > 0 && stats.completed < stats.total) {
        // Algumas etapas concluídas - marcar como em andamento
        updateTask(taskId, { status: 'em_andamento' })
      }

      // Invalidar queries relacionadas
      queryClient.invalidateQueries(taskQueryKey)
      queryClient.invalidateQueries(['tasks'])
    },
    onError: (error) => {
      console.error('Erro ao alterar status da etapa:', error)
      toast.error(error.message || 'Erro ao alterar status da etapa')
    }
  })

  /**
   * Mutation para excluir etapa
   */
  const deleteStepMutation = useMutation({
    mutationFn: deleteTaskStep,
    onSuccess: (_, stepId) => {
      // Atualizar cache
      queryClient.setQueryData(stepsQueryKey, (oldSteps = []) => {
        const updatedSteps = oldSteps.filter(step => step.id !== stepId)
        updateTaskSteps(taskId, updatedSteps)
        return updatedSteps
      })

      toast.success('Etapa excluída com sucesso!')
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries(taskQueryKey)
    },
    onError: (error) => {
      console.error('Erro ao excluir etapa:', error)
      toast.error(error.message || 'Erro ao excluir etapa')
    }
  })

  /**
   * Mutation para reordenar etapas
   */
  const reorderStepsMutation = useMutation({
    mutationFn: ({ stepIds }) => reorderTaskSteps(taskId, stepIds),
    onSuccess: (reorderedSteps) => {
      // Atualizar cache
      queryClient.setQueryData(stepsQueryKey, reorderedSteps)
      updateTaskSteps(taskId, reorderedSteps)

      toast.success('Etapas reordenadas com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao reordenar etapas:', error)
      toast.error(error.message || 'Erro ao reordenar etapas')
    }
  })

  /**
   * Mutation para adicionar múltiplas etapas
   */
  const addMultipleStepsMutation = useMutation({
    mutationFn: (newSteps) => addMultipleSteps(taskId, newSteps),
    onSuccess: (addedSteps) => {
      // Atualizar cache
      queryClient.setQueryData(stepsQueryKey, (oldSteps = []) => {
        const updatedSteps = [...oldSteps, ...addedSteps].sort((a, b) => a.step_order - b.step_order)
        updateTaskSteps(taskId, updatedSteps)
        return updatedSteps
      })

      toast.success(`${addedSteps.length} etapas adicionadas com sucesso!`)
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries(taskQueryKey)
    },
    onError: (error) => {
      console.error('Erro ao adicionar etapas:', error)
      toast.error(error.message || 'Erro ao adicionar etapas')
    }
  })

  // Funções auxiliares
  const createStep = useCallback((stepData) => {
    createStepMutation.mutate({
      task_id: taskId,
      ...stepData
    })
  }, [taskId, createStepMutation])

  const updateStep = useCallback((stepId, updates) => {
    updateStepMutation.mutate({ stepId, updates })
  }, [updateStepMutation])

  const toggleStepCompletion = useCallback((stepId, isCompleted) => {
    toggleCompletionMutation.mutate({ stepId, isCompleted })
  }, [toggleCompletionMutation])

  const deleteStep = useCallback((stepId) => {
    if (window.confirm('Tem certeza que deseja excluir esta etapa?')) {
      deleteStepMutation.mutate(stepId)
    }
  }, [deleteStepMutation])

  const reorderSteps = useCallback((stepIds) => {
    reorderStepsMutation.mutate({ stepIds })
  }, [reorderStepsMutation])

  const addMultipleStepsToTask = useCallback((newSteps) => {
    addMultipleStepsMutation.mutate(newSteps)
  }, [addMultipleStepsMutation])

  const markStepCompleted = useCallback((stepId) => {
    toggleStepCompletion(stepId, true)
  }, [toggleStepCompletion])

  const markStepIncomplete = useCallback((stepId) => {
    toggleStepCompletion(stepId, false)
  }, [toggleStepCompletion])

  // Calcular estatísticas das etapas
  const stats = calculateStepsStats(steps)

  // Etapas organizadas por status
  const stepsByStatus = {
    completed: steps.filter(step => step.is_completed),
    pending: steps.filter(step => !step.is_completed),
    all: steps
  }

  return {
    // Dados
    steps,
    stepsByStatus,
    stats,
    
    // Estados de loading
    isLoading: isLoadingSteps,
    isCreating: createStepMutation.isLoading,
    isUpdating: updateStepMutation.isLoading,
    isTogglingCompletion: toggleCompletionMutation.isLoading,
    isDeleting: deleteStepMutation.isLoading,
    isReordering: reorderStepsMutation.isLoading,
    isAddingMultiple: addMultipleStepsMutation.isLoading,
    
    // Erros
    error: stepsError,
    
    // Operações básicas
    createStep,
    updateStep,
    deleteStep,
    refetchSteps,
    
    // Operações de status
    toggleStepCompletion,
    markStepCompleted,
    markStepIncomplete,
    
    // Operações avançadas
    reorderSteps,
    addMultipleStepsToTask,
    
    // Estados das mutations
    createMutation: createStepMutation,
    updateMutation: updateStepMutation,
    toggleMutation: toggleCompletionMutation,
    deleteMutation: deleteStepMutation,
    reorderMutation: reorderStepsMutation,
    addMultipleMutation: addMultipleStepsMutation,
    
    // Utilitários
    hasSteps: steps.length > 0,
    hasTask: !!taskId,
    
    // Verificações úteis
    canAddStep: !!taskId,
    canReorder: steps.length > 1,
    isAllCompleted: stats.isCompleted,
    hasCompletedSteps: stats.completed > 0,
    completionPercentage: stats.percentage
  }
}