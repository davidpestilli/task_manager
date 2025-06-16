import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  createTaskDependency,
  removeTaskDependency,
  getTaskDependencies,
  getTaskDependents,
  getProjectDependencyFlow,
  validateCircularDependency,
  checkTaskBlocked,
  resolveDependencies
} from '@/services/tasks/taskDependenciesService'

/**
 * Hook para gerenciar dependências de tarefas
 * 
 * Funcionalidades:
 * - CRUD de dependências
 * - Validação em tempo real
 * - Cache inteligente
 * - Estados de loading/error
 */

/**
 * Hook principal para dependências de tarefas
 * @param {string} taskId - ID da tarefa (opcional)
 * @param {string} projectId - ID do projeto (opcional)
 */
export const useTaskDependencies = (taskId = null, projectId = null) => {
  const queryClient = useQueryClient()
  const [isValidating, setIsValidating] = useState(false)

  // Query para dependências de uma tarefa específica
  const {
    data: dependencies = [],
    isLoading: isDependenciesLoading,
    error: dependenciesError,
    refetch: refetchDependencies
  } = useQuery({
    queryKey: ['task-dependencies', taskId],
    queryFn: () => getTaskDependencies(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 2 // 2 minutos
  })

  // Query para tarefas dependentes
  const {
    data: dependents = [],
    isLoading: isDependentsLoading,
    error: dependentsError,
    refetch: refetchDependents
  } = useQuery({
    queryKey: ['task-dependents', taskId],
    queryFn: () => getTaskDependents(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 2
  })

  // Query para fluxo de dependências do projeto
  const {
    data: projectFlow = { nodes: [], edges: [] },
    isLoading: isFlowLoading,
    error: flowError,
    refetch: refetchFlow
  } = useQuery({
    queryKey: ['project-dependency-flow', projectId],
    queryFn: () => getProjectDependencyFlow(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5 // 5 minutos
  })

  // Query para status de bloqueio da tarefa
  const {
    data: blockStatus = { isBlocked: false, blockedByTasks: [], totalDependencies: 0 },
    isLoading: isBlockStatusLoading,
    refetch: refetchBlockStatus
  } = useQuery({
    queryKey: ['task-block-status', taskId],
    queryFn: () => checkTaskBlocked(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 30 // 30 segundos
  })

  // Mutation para criar dependência
  const createDependencyMutation = useMutation({
    mutationFn: ({ taskId, dependsOnTaskId }) => 
      createTaskDependency(taskId, dependsOnTaskId),
    onSuccess: (data, variables) => {
      toast.success('Dependência criada com sucesso!')
      
      // Invalidar caches relacionados
      queryClient.invalidateQueries({ queryKey: ['task-dependencies', variables.taskId] })
      queryClient.invalidateQueries({ queryKey: ['task-dependents', variables.dependsOnTaskId] })
      queryClient.invalidateQueries({ queryKey: ['task-block-status', variables.taskId] })
      queryClient.invalidateQueries({ queryKey: ['project-dependency-flow'] })
      
      // Atualizar cache de tarefas se necessário
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error) => {
      console.error('Erro ao criar dependência:', error)
      toast.error(error.message || 'Erro ao criar dependência')
    }
  })

  // Mutation para remover dependência
  const removeDependencyMutation = useMutation({
    mutationFn: removeTaskDependency,
    onSuccess: () => {
      toast.success('Dependência removida com sucesso!')
      
      // Invalidar todos os caches de dependência
      queryClient.invalidateQueries({ queryKey: ['task-dependencies'] })
      queryClient.invalidateQueries({ queryKey: ['task-dependents'] })
      queryClient.invalidateQueries({ queryKey: ['task-block-status'] })
      queryClient.invalidateQueries({ queryKey: ['project-dependency-flow'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error) => {
      console.error('Erro ao remover dependência:', error)
      toast.error('Erro ao remover dependência')
    }
  })

  // Função para validar dependência circular
  const validateDependency = useCallback(async (fromTaskId, toTaskId) => {
    setIsValidating(true)
    try {
      const isCircular = await validateCircularDependency(fromTaskId, toTaskId)
      return !isCircular
    } catch (error) {
      console.error('Erro ao validar dependência:', error)
      return false
    } finally {
      setIsValidating(false)
    }
  }, [])

  // Função para resolver dependências após conclusão de tarefa
  const resolveDependenciesAfterCompletion = useCallback(async (completedTaskId) => {
    try {
      const unblockedTasks = await resolveDependencies(completedTaskId)
      
      if (unblockedTasks.length > 0) {
        toast.success(
          `${unblockedTasks.length} tarefa(s) foram desbloqueadas!`,
          { duration: 6000 }
        )
      }

      // Invalidar caches
      queryClient.invalidateQueries({ queryKey: ['task-dependents'] })
      queryClient.invalidateQueries({ queryKey: ['task-block-status'] })
      
      return unblockedTasks
    } catch (error) {
      console.error('Erro ao resolver dependências:', error)
      return []
    }
  }, [queryClient])

  // Função para adicionar dependência com validação
  const addDependency = useCallback(async (taskId, dependsOnTaskId) => {
    // Validar antes de criar
    const isValid = await validateDependency(taskId, dependsOnTaskId)
    
    if (!isValid) {
      toast.error('Esta dependência criaria um ciclo circular')
      return false
    }

    // Criar dependência
    await createDependencyMutation.mutateAsync({ taskId, dependsOnTaskId })
    return true
  }, [createDependencyMutation, validateDependency])

  // Função para remover dependência
  const removeDependency = useCallback(async (dependencyId) => {
    await removeDependencyMutation.mutateAsync(dependencyId)
  }, [removeDependencyMutation])

  // Função para atualizar todos os dados
  const refreshDependencies = useCallback(() => {
    if (taskId) {
      refetchDependencies()
      refetchDependents()
      refetchBlockStatus()
    }
    if (projectId) {
      refetchFlow()
    }
  }, [
    taskId,
    projectId,
    refetchDependencies,
    refetchDependents,
    refetchBlockStatus,
    refetchFlow
  ])

  // Estados derivados
  const isLoading = isDependenciesLoading || isDependentsLoading || 
                   isFlowLoading || isBlockStatusLoading
  
  const error = dependenciesError || dependentsError || flowError
  
  const isCreating = createDependencyMutation.isPending
  const isRemoving = removeDependencyMutation.isPending
  
  const hasDependencies = dependencies.length > 0
  const hasDependents = dependents.length > 0

  return {
    // Dados
    dependencies,
    dependents,
    projectFlow,
    blockStatus,
    
    // Estados de loading
    isLoading,
    isCreating,
    isRemoving,
    isValidating,
    
    // Erros
    error,
    
    // Estados derivados
    hasDependencies,
    hasDependents,
    isBlocked: blockStatus.isBlocked,
    
    // Ações
    addDependency,
    removeDependency,
    validateDependency,
    resolveDependenciesAfterCompletion,
    refreshDependencies,
    
    // Refetch individuais
    refetchDependencies,
    refetchDependents,
    refetchFlow,
    refetchBlockStatus
  }
}

/**
 * Hook simplificado para verificar se tarefa está bloqueada
 * @param {string} taskId - ID da tarefa
 */
export const useTaskBlockStatus = (taskId) => {
  const { data: blockStatus, isLoading, refetch } = useQuery({
    queryKey: ['task-block-status', taskId],
    queryFn: () => checkTaskBlocked(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 30,
    refetchOnMount: true
  })

  return {
    isBlocked: blockStatus?.isBlocked || false,
    blockedByTasks: blockStatus?.blockedByTasks || [],
    totalDependencies: blockStatus?.totalDependencies || 0,
    isLoading,
    refetch
  }
}

/**
 * Hook para fluxo de dependências do projeto
 * @param {string} projectId - ID do projeto
 */
export const useProjectDependencyFlow = (projectId) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['project-dependency-flow', projectId],
    queryFn: () => getProjectDependencyFlow(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5
  })

  return {
    nodes: data?.nodes || [],
    edges: data?.edges || [],
    isLoading,
    error,
    refetch
  }
}