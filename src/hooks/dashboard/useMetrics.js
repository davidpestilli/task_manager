import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/auth'
import { 
  getUserMetrics, 
  getWeeklyProgress, 
  getTaskStatusDistribution,
  getProjectProgress,
  getRecentActivities,
  getCompletionTimeMetrics 
} from '@/services/dashboard'
import { useToast } from '@/hooks/shared'

/**
 * Hook para gerenciar métricas pessoais do dashboard
 * 
 * Responsabilidades:
 * - Buscar métricas pessoais do usuário
 * - Gerenciar cache de dados de dashboard
 * - Refrescar dados automaticamente
 * - Tratar erros de carregamento
 */
export const useMetrics = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [refreshing, setRefreshing] = useState(false)

  // Query para métricas gerais
  const {
    data: metrics,
    isLoading: isLoadingMetrics,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['metrics', user?.id],
    queryFn: () => getUserMetrics(user.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
    cacheTime: 1000 * 60 * 15, // 15 minutos
    retry: 2,
    onError: (error) => {
      console.error('Erro ao carregar métricas:', error)
      showToast.error('Falha ao carregar métricas pessoais')
    }
  })

  // Query para progresso semanal
  const {
    data: weeklyProgress,
    isLoading: isLoadingWeekly,
    error: weeklyError
  } = useQuery({
    queryKey: ['weekly-progress', user?.id],
    queryFn: () => getWeeklyProgress(user.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutos
    retry: 2
  })

  // Query para distribuição de status
  const {
    data: statusDistribution,
    isLoading: isLoadingStatus,
    error: statusError
  } = useQuery({
    queryKey: ['status-distribution', user?.id],
    queryFn: () => getTaskStatusDistribution(user.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2
  })

  // Query para progresso dos projetos
  const {
    data: projectProgress,
    isLoading: isLoadingProjects,
    error: projectsError
  } = useQuery({
    queryKey: ['project-progress', user?.id],
    queryFn: () => getProjectProgress(user.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 3, // 3 minutos
    retry: 2
  })

  // Query para atividades recentes
  const {
    data: recentActivities,
    isLoading: isLoadingActivities,
    error: activitiesError
  } = useQuery({
    queryKey: ['recent-activities', user?.id],
    queryFn: () => getRecentActivities(user.id, 10),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: 2
  })

  // Query para métricas de tempo
  const {
    data: timeMetrics,
    isLoading: isLoadingTime,
    error: timeError
  } = useQuery({
    queryKey: ['time-metrics', user?.id],
    queryFn: () => getCompletionTimeMetrics(user.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 15, // 15 minutos
    retry: 2
  })

  // Estados derivados
  const isLoading = isLoadingMetrics || isLoadingWeekly || isLoadingStatus || 
                   isLoadingProjects || isLoadingActivities || isLoadingTime

  const hasError = metricsError || weeklyError || statusError || 
                  projectsError || activitiesError || timeError

  // Função para refresh manual de todos os dados
  const refreshAllMetrics = async () => {
    if (!user?.id || refreshing) return

    setRefreshing(true)
    try {
      await Promise.all([
        queryClient.invalidateQueries(['metrics', user.id]),
        queryClient.invalidateQueries(['weekly-progress', user.id]),
        queryClient.invalidateQueries(['status-distribution', user.id]),
        queryClient.invalidateQueries(['project-progress', user.id]),
        queryClient.invalidateQueries(['recent-activities', user.id]),
        queryClient.invalidateQueries(['time-metrics', user.id])
      ])
      
      showToast.success('Dados atualizados com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar métricas:', error)
      showToast.error('Falha ao atualizar dados')
    } finally {
      setRefreshing(false)
    }
  }

  // Função para invalidar métricas quando algo muda
  const invalidateMetrics = () => {
    if (!user?.id) return

    queryClient.invalidateQueries(['metrics', user.id])
    queryClient.invalidateQueries(['project-progress', user.id])
    queryClient.invalidateQueries(['recent-activities', user.id])
  }

  // Função para atualizar atividade recente manualmente
  const addRecentActivity = (activity) => {
    queryClient.setQueryData(['recent-activities', user?.id], (oldData) => {
      if (!oldData) return [activity]
      return [activity, ...oldData.slice(0, 9)] // Manter apenas 10 itens
    })
  }

  // Auto-refresh a cada 5 minutos para métricas importantes
  useEffect(() => {
    if (!user?.id) return

    const interval = setInterval(() => {
      queryClient.invalidateQueries(['metrics', user.id])
      queryClient.invalidateQueries(['recent-activities', user.id])
    }, 5 * 60 * 1000) // 5 minutos

    return () => clearInterval(interval)
  }, [user?.id, queryClient])

  return {
    // Dados
    metrics: metrics || {
      activeTasks: 0,
      completedThisMonth: 0,
      activeProjects: 0,
      averageProgress: 0,
      trend: { activeTasks: 0, completedTasks: 0, averageProgress: 0 }
    },
    weeklyProgress: weeklyProgress || [],
    statusDistribution: statusDistribution || [],
    projectProgress: projectProgress || [],
    recentActivities: recentActivities || [],
    timeMetrics: timeMetrics || {
      averageCompletionTime: 0,
      totalCompleted: 0,
      fastestCompletion: 0,
      slowestCompletion: 0
    },

    // Estados
    isLoading,
    refreshing,
    hasError,

    // Funções
    refreshAllMetrics,
    invalidateMetrics,
    addRecentActivity,

    // Refresh individual
    refetchMetrics
  }
}

/**
 * Hook simplificado para métricas básicas
 * Útil quando só precisamos das métricas principais
 */
export const useBasicMetrics = () => {
  const { user } = useAuth()

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['basic-metrics', user?.id],
    queryFn: () => getUserMetrics(user.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 3, // 3 minutos
    retry: 1
  })

  return {
    metrics: metrics || {
      activeTasks: 0,
      completedThisMonth: 0,
      activeProjects: 0,
      averageProgress: 0
    },
    isLoading,
    hasError: !!error
  }
}