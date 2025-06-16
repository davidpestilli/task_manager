import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useContext, useMemo } from 'react'
import { peopleService } from '@/services/people'
import { ProjectContext } from '@/context'
import { toast } from 'react-hot-toast'

/**
 * Hook para gerenciamento de dados específicos de uma pessoa
 * @param {string} userId - ID do usuário
 * @param {Object} options - Opções do hook
 * @returns {Object} Dados e funções específicas da pessoa
 */
export function usePerson(userId, options = {}) {
  const { selectedProject } = useContext(ProjectContext)
  const queryClient = useQueryClient()
  
  const projectId = options.projectId || selectedProject?.id

  // Query para detalhes da pessoa
  const {
    data: person,
    isLoading: isLoadingPerson,
    error: personError
  } = useQuery({
    queryKey: ['person', userId],
    queryFn: () => peopleService.getPersonDetails(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutos
    cacheTime: 1000 * 60 * 15, // 15 minutos
    onError: (error) => {
      console.error('Erro ao carregar dados da pessoa:', error)
      if (!options.silent) {
        toast.error('Falha ao carregar dados da pessoa')
      }
    }
  })

  // Query para tarefas da pessoa no projeto
  const {
    data: tasks = [],
    isLoading: isLoadingTasks,
    error: tasksError,
    refetch: refetchTasks
  } = useQuery({
    queryKey: ['person-tasks', userId, projectId],
    queryFn: () => peopleService.getPersonTasks(userId, projectId),
    enabled: !!(userId && projectId),
    staleTime: 1000 * 60 * 2, // 2 minutos (dados mais dinâmicos)
    cacheTime: 1000 * 60 * 5, // 5 minutos
    onError: (error) => {
      console.error('Erro ao carregar tarefas da pessoa:', error)
      if (!options.silent) {
        toast.error('Falha ao carregar tarefas da pessoa')
      }
    }
  })

  // Query para estatísticas da pessoa
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery({
    queryKey: ['person-stats', userId, projectId],
    queryFn: () => peopleService.getPersonStats(userId, projectId),
    enabled: !!(userId && projectId),
    staleTime: 1000 * 60 * 5, // 5 minutos
    cacheTime: 1000 * 60 * 10, // 10 minutos
    onError: (error) => {
      console.error('Erro ao carregar estatísticas da pessoa:', error)
    }
  })

  // Dados computados da pessoa
  const personData = useMemo(() => {
    if (!person || !tasks) return null

    // Análise das tarefas
    const tasksByStatus = {
      'não_iniciada': tasks.filter(t => t.status === 'não_iniciada'),
      'em_andamento': tasks.filter(t => t.status === 'em_andamento'),
      'pausada': tasks.filter(t => t.status === 'pausada'),
      'concluída': tasks.filter(t => t.status === 'concluída')
    }

    // Calcular progresso médio
    const averageProgress = tasks.length > 0 
      ? Math.round(tasks.reduce((sum, task) => sum + task.completionPercentage, 0) / tasks.length)
      : 0

    // Tarefas recentes (últimas 5)
    const recentTasks = [...tasks]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)

    // Verificar carga de trabalho
    const activeTasks = tasks.filter(t => 
      t.status === 'em_andamento' || t.status === 'não_iniciada'
    ).length

    const workloadStatus = activeTasks >= 10 ? 'overloaded' : 
                          activeTasks >= 7 ? 'heavy' :
                          activeTasks >= 4 ? 'moderate' : 'light'

    return {
      ...person,
      tasks,
      tasksByStatus,
      averageProgress,
      recentTasks,
      activeTasks,
      workloadStatus,
      totalTasks: tasks.length
    }
  }, [person, tasks])

  // Função para filtrar tarefas da pessoa
  const filterTasks = (criteria = {}) => {
    let filtered = [...tasks]

    if (criteria.status && criteria.status !== 'all') {
      filtered = filtered.filter(task => task.status === criteria.status)
    }

    if (criteria.completion) {
      const { min = 0, max = 100 } = criteria.completion
      filtered = filtered.filter(task => 
        task.completionPercentage >= min && task.completionPercentage <= max
      )
    }

    if (criteria.search && criteria.search.trim()) {
      const searchTerm = criteria.search.toLowerCase().trim()
      filtered = filtered.filter(task =>
        task.name?.toLowerCase().includes(searchTerm) ||
        task.description?.toLowerCase().includes(searchTerm)
      )
    }

    if (criteria.dateRange) {
      const { start, end } = criteria.dateRange
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.assignedAt)
        return taskDate >= start && taskDate <= end
      })
    }

    return filtered
  }

  // Função para invalidar cache das tarefas
  const refreshPersonData = () => {
    queryClient.invalidateQueries(['person-tasks', userId, projectId])
    queryClient.invalidateQueries(['person-stats', userId, projectId])
  }

  // Estados de loading combinados
  const isLoading = isLoadingPerson || isLoadingTasks || isLoadingStats
  const hasError = !!(personError || tasksError || statsError)
  const error = personError || tasksError || statsError

  return {
    // Dados principais
    person: personData,
    rawPerson: person,
    tasks,
    stats,
    
    // Estados
    isLoading,
    isLoadingPerson,
    isLoadingTasks,
    isLoadingStats,
    hasError,
    error,
    
    // Funções
    filterTasks,
    refetchTasks,
    refreshPersonData,
    
    // Utilities
    isEmpty: !isLoading && (!person || tasks.length === 0),
    hasData: !!(person && tasks),
    
    // Estados específicos para UI
    canViewTasks: !!(userId && projectId),
    workloadColor: personData?.workloadStatus === 'overloaded' ? 'red' :
                   personData?.workloadStatus === 'heavy' ? 'yellow' :
                   personData?.workloadStatus === 'moderate' ? 'blue' : 'green'
  }
}