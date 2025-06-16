import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { activityService } from '@/services/dashboard'
import { useAuth } from '@/hooks/auth'

/**
 * Hook para gerenciamento de log de atividades
 * @param {Object} options - Opções para filtros e configurações
 * @returns {Object} Estado e funções para gerenciar atividades
 */
export function useActivityLog(options = {}) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    userId = user?.id,
    projectId = null,
    taskId = null,
    autoRefresh = true,
    limit = 50
  } = options

  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    action: null,
    projectId: projectId,
    taskId: taskId
  })

  /**
   * Query para buscar atividades do usuário
   */
  const {
    data: userActivities = [],
    isLoading: isLoadingUserActivities,
    error: userActivitiesError,
    refetch: refetchUserActivities
  } = useQuery({
    queryKey: ['user-activities', userId, filters, limit],
    queryFn: () => activityService.getUserActivities(userId, {
      limit,
      projectId: filters.projectId,
      taskId: filters.taskId,
      startDate: filters.startDate,
      endDate: filters.endDate
    }),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutos
    cacheTime: 1000 * 60 * 10, // 10 minutos
    refetchInterval: autoRefresh ? 1000 * 60 * 2 : false // Auto-refresh a cada 2 minutos
  })

  /**
   * Query para buscar atividades de projeto
   */
  const {
    data: projectActivities = [],
    isLoading: isLoadingProjectActivities,
    error: projectActivitiesError,
    refetch: refetchProjectActivities
  } = useQuery({
    queryKey: ['project-activities', projectId, filters, limit],
    queryFn: () => activityService.getProjectActivities(projectId, {
      limit,
      userId: filters.userId,
      startDate: filters.startDate,
      endDate: filters.endDate
    }),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2
  })

  /**
   * Query para buscar atividades de tarefa
   */
  const {
    data: taskActivities = [],
    isLoading: isLoadingTaskActivities,
    error: taskActivitiesError,
    refetch: refetchTaskActivities
  } = useQuery({
    queryKey: ['task-activities', taskId, limit],
    queryFn: () => activityService.getTaskActivities(taskId, { limit }),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 2
  })

  /**
   * Query para buscar atividades recentes do sistema
   */
  const {
    data: recentActivities = [],
    isLoading: isLoadingRecentActivities,
    error: recentActivitiesError,
    refetch: refetchRecentActivities
  } = useQuery({
    queryKey: ['recent-activities', limit],
    queryFn: () => activityService.getRecentActivities({ limit }),
    staleTime: 1000 * 60, // 1 minuto
    refetchInterval: autoRefresh ? 1000 * 60 : false // Auto-refresh a cada minuto
  })

  /**
   * Query para buscar estatísticas de atividades
   */
  const {
    data: activityStats = null,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['activity-stats', userId, filters.startDate, filters.endDate],
    queryFn: () => activityService.getUserActivityStats(userId, {
      startDate: filters.startDate,
      endDate: filters.endDate
    }),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5 // 5 minutos
  })

  /**
   * Mutation para registrar nova atividade
   */
  const logActivityMutation = useMutation({
    mutationFn: (activityData) => activityService.logActivity(activityData),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries(['user-activities'])
      queryClient.invalidateQueries(['project-activities'])
      queryClient.invalidateQueries(['task-activities'])
      queryClient.invalidateQueries(['recent-activities'])
      queryClient.invalidateQueries(['activity-stats'])
    },
    onError: (error) => {
      console.error('Erro ao registrar atividade:', error)
    }
  })

  /**
   * Registra uma nova atividade
   */
  const logActivity = useCallback(async (activityData) => {
    try {
      await logActivityMutation.mutateAsync(activityData)
    } catch (error) {
      console.error('Falha ao registrar atividade:', error)
    }
  }, [logActivityMutation])

  /**
   * Atualiza filtros de atividades
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }))
  }, [])

  /**
   * Limpa todos os filtros
   */
  const clearFilters = useCallback(() => {
    setFilters({
      startDate: null,
      endDate: null,
      action: null,
      projectId: null,
      taskId: null
    })
  }, [])

  /**
   * Gera timeline de atividades
   */
  const generateTimeline = useCallback((activities) => {
    return activityService.generateActivityTimeline(activities)
  }, [])

  /**
   * Formata ação para exibição
   */
  const formatAction = useCallback((action, details) => {
    return activityService.formatAction(action, details)
  }, [])

  /**
   * Filtra atividades por período
   */
  const filterByDateRange = useCallback((startDate, endDate) => {
    updateFilters({ startDate, endDate })
  }, [updateFilters])

  /**
   * Filtra atividades por tipo de ação
   */
  const filterByAction = useCallback((action) => {
    updateFilters({ action })
  }, [updateFilters])

  /**
   * Filtra atividades por projeto
   */
  const filterByProject = useCallback((projectId) => {
    updateFilters({ projectId })
  }, [updateFilters])

  /**
   * Filtra atividades por tarefa
   */
  const filterByTask = useCallback((taskId) => {
    updateFilters({ taskId })
  }, [updateFilters])

  /**
   * Busca atividades dos últimos N dias
   */
  const getLastDaysActivities = useCallback((days) => {
    const endDate = new Date()
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    filterByDateRange(startDate, endDate)
  }, [filterByDateRange])

  /**
   * Obtém atividades mais relevantes baseado no contexto
   */
  const getRelevantActivities = useCallback(() => {
    if (taskId && taskActivities.length > 0) {
      return taskActivities
    }
    if (projectId && projectActivities.length > 0) {
      return projectActivities
    }
    if (userId && userActivities.length > 0) {
      return userActivities
    }
    return recentActivities
  }, [taskId, taskActivities, projectId, projectActivities, userId, userActivities, recentActivities])

  /**
   * Verifica se há atividades carregando
   */
  const isLoading = isLoadingUserActivities || 
                   isLoadingProjectActivities || 
                   isLoadingTaskActivities || 
                   isLoadingRecentActivities ||
                   isLoadingStats

  /**
   * Verifica se há algum erro
   */
  const hasError = userActivitiesError || 
                  projectActivitiesError || 
                  taskActivitiesError || 
                  recentActivitiesError ||
                  statsError

  return {
    // Dados das atividades
    userActivities,
    projectActivities,
    taskActivities,
    recentActivities,
    activityStats,

    // Estados de loading
    isLoading,
    isLoadingUserActivities,
    isLoadingProjectActivities,
    isLoadingTaskActivities,
    isLoadingRecentActivities,
    isLoadingStats,

    // Erros
    hasError,
    userActivitiesError,
    projectActivitiesError,
    taskActivitiesError,
    recentActivitiesError,
    statsError,

    // Filtros e configurações
    filters,
    updateFilters,
    clearFilters,

    // Ações
    logActivity,
    refetchUserActivities,
    refetchProjectActivities,
    refetchTaskActivities,
    refetchRecentActivities,
    refetchStats,

    // Utilidades
    generateTimeline,
    formatAction,
    getRelevantActivities,

    // Filtros específicos
    filterByDateRange,
    filterByAction,
    filterByProject,
    filterByTask,
    getLastDaysActivities,

    // Estados de mutação
    isLoggingActivity: logActivityMutation.isLoading
  }
}