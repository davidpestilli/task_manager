import React, { useState, useMemo } from 'react'
import { Button, Avatar, Badge, Spinner } from '@/components/shared/ui'
import { useActivityLog } from '@/hooks/dashboard'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Clock, 
  Filter, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  User,
  CheckCircle,
  MessageSquare,
  Edit,
  Plus,
  TrendingUp,
  Target
} from 'lucide-react'

/**
 * Componente para exibir timeline de atividades
 * @param {Object} props - Props do componente
 * @param {string} props.userId - ID do usuário (opcional, padrão atual)
 * @param {string} props.projectId - ID do projeto para filtrar
 * @param {boolean} props.showFilters - Se deve mostrar filtros
 * @param {boolean} props.groupByDate - Se deve agrupar por data
 * @param {number} props.maxItems - Máximo de itens a exibir
 * @param {boolean} props.autoRefresh - Se deve atualizar automaticamente
 * @param {string} props.className - Classes CSS adicionais
 */
export function ActivityTimeline({
  userId,
  projectId,
  showFilters = true,
  groupByDate = true,
  maxItems = 50,
  autoRefresh = true,
  className = ''
}) {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [dateRange, setDateRange] = useState('week') // 'today', 'week', 'month', 'all'
  const [showAll, setShowAll] = useState(false)

  const {
    userActivities,
    projectActivities,
    recentActivities,
    isLoading,
    hasError,
    generateTimeline,
    formatAction,
    refetchUserActivities,
    refetchProjectActivities,
    refetchRecentActivities,
    filterByDateRange,
    getLastDaysActivities
  } = useActivityLog({ 
    userId, 
    projectId, 
    autoRefresh 
  })

  /**
   * Atividades relevantes baseado no contexto
   */
  const relevantActivities = useMemo(() => {
    if (projectId && projectActivities.length > 0) {
      return projectActivities
    }
    if (userId && userActivities.length > 0) {
      return userActivities
    }
    return recentActivities
  }, [projectId, projectActivities, userId, userActivities, recentActivities])

  /**
   * Atividades filtradas
   */
  const filteredActivities = useMemo(() => {
    let filtered = [...relevantActivities]

    // Filtrar por tipo de ação
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(activity => {
        switch (selectedFilter) {
          case 'tasks':
            return ['task_created', 'task_updated', 'task_completed', 'task_assigned'].includes(activity.action)
          case 'comments':
            return ['comment_added', 'comment_updated', 'comment_deleted'].includes(activity.action)
          case 'progress':
            return ['step_completed', 'step_uncompleted', 'task_completed'].includes(activity.action)
          case 'team':
            return ['task_assigned', 'task_unassigned', 'member_added', 'member_removed'].includes(activity.action)
          default:
            return true
        }
      })
    }

    // Filtrar por período
    if (dateRange !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()
      
      switch (dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setDate(now.getDate() - 30)
          break
        default:
          cutoffDate = null
      }

      if (cutoffDate) {
        filtered = filtered.filter(activity => 
          new Date(activity.timestamp) >= cutoffDate
        )
      }
    }

    return filtered
  }, [relevantActivities, selectedFilter, dateRange])

  /**
   * Atividades agrupadas por data (se solicitado)
   */
  const timelineData = useMemo(() => {
    if (!groupByDate) {
      return [{
        date: null,
        activities: showAll ? filteredActivities : filteredActivities.slice(0, maxItems),
        count: filteredActivities.length
      }]
    }

    const timeline = generateTimeline(filteredActivities)
    
    if (!showAll && timeline.length > 0) {
      let itemCount = 0
      const limitedTimeline = []
      
      for (const group of timeline) {
        if (itemCount >= maxItems) break
        
        const remainingSlots = maxItems - itemCount
        const activitiesToShow = group.activities.slice(0, remainingSlots)
        
        limitedTimeline.push({
          ...group,
          activities: activitiesToShow
        })
        
        itemCount += activitiesToShow.length
      }
      
      return limitedTimeline
    }
    
    return timeline
  }, [filteredActivities, groupByDate, generateTimeline, showAll, maxItems])

  const hasHiddenActivities = filteredActivities.length > maxItems && !showAll
  const totalActivities = filteredActivities.length

  /**
   * Opções de filtro por tipo
   */
  const filterOptions = [
    { value: 'all', label: 'Todas', icon: Clock },
    { value: 'tasks', label: 'Tarefas', icon: Target },
    { value: 'comments', label: 'Comentários', icon: MessageSquare },
    { value: 'progress', label: 'Progresso', icon: TrendingUp },
    { value: 'team', label: 'Equipe', icon: User }
  ]

  /**
   * Opções de filtro por período
   */
  const dateOptions = [
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mês' },
    { value: 'all', label: 'Tudo' }
  ]

  /**
   * Ícones por tipo de ação
   */
  const getActionIcon = (action) => {
    const iconMap = {
      'task_created': Plus,
      'task_updated': Edit,
      'task_completed': CheckCircle,
      'task_assigned': User,
      'step_completed': CheckCircle,
      'comment_added': MessageSquare,
      'comment_updated': Edit
    }
    
    return iconMap[action] || Clock
  }

  /**
   * Cores por tipo de ação
   */
  const getActionColor = (action) => {
    const colorMap = {
      'task_created': 'text-green-600 bg-green-50 border-green-200',
      'task_updated': 'text-blue-600 bg-blue-50 border-blue-200',
      'task_completed': 'text-green-600 bg-green-50 border-green-200',
      'task_assigned': 'text-purple-600 bg-purple-50 border-purple-200',
      'step_completed': 'text-green-600 bg-green-50 border-green-200',
      'comment_added': 'text-orange-600 bg-orange-50 border-orange-200',
      'comment_updated': 'text-blue-600 bg-blue-50 border-blue-200'
    }
    
    return colorMap[action] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  /**
   * Formata data do grupo
   */
  const formatGroupDate = (dateString) => {
    const date = new Date(dateString)
    
    if (isToday(date)) {
      return 'Hoje'
    }
    
    if (isYesterday(date)) {
      return 'Ontem'
    }
    
    return format(date, "d 'de' MMMM", { locale: ptBR })
  }

  /**
   * Formata tempo relativo
   */
  const formatTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: ptBR
      })
    } catch (error) {
      return 'há alguns momentos'
    }
  }

  /**
   * Atualiza atividades
   */
  const handleRefresh = () => {
    if (projectId) {
      refetchProjectActivities()
    } else if (userId) {
      refetchUserActivities()
    } else {
      refetchRecentActivities()
    }
  }

  /**
   * Muda filtro de período
   */
  const handleDateRangeChange = (range) => {
    setDateRange(range)
    if (range !== 'all') {
      const days = range === 'today' ? 1 : range === 'week' ? 7 : 30
      getLastDaysActivities(days)
    }
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Cabeçalho */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Timeline de Atividades</h3>
            
            {totalActivities > 0 && (
              <Badge variant="secondary" size="sm">
                {totalActivities}
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700"
            title="Atualizar timeline"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="space-y-3">
            {/* Filtros de tipo */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedFilter(option.value)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      selectedFilter === option.value
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Filtros de período */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div className="flex space-x-1">
                {dateOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleDateRangeChange(option.value)}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      dateRange === option.value
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <ActivityItemSkeleton key={i} />
            ))}
          </div>
        ) : hasError ? (
          <div className="text-center py-8">
            <div className="text-red-600 text-sm mb-2">
              Erro ao carregar atividades
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="text-red-600 border-red-300"
            >
              Tentar novamente
            </Button>
          </div>
        ) : timelineData.length > 0 ? (
          <div className="p-4">
            {timelineData.map((group, groupIndex) => (
              <div key={group.date || 'ungrouped'} className="mb-6 last:mb-0">
                {/* Cabeçalho do grupo (se agrupado por data) */}
                {groupByDate && group.date && (
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-sm font-medium text-gray-900">
                      {formatGroupDate(group.date)}
                    </div>
                    <div className="flex-1 h-px bg-gray-200" />
                    <div className="text-xs text-gray-500">
                      {group.count} atividade{group.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}

                {/* Lista de atividades */}
                <div className="space-y-3">
                  {group.activities.map((activity, index) => {
                    const Icon = getActionIcon(activity.action)
                    const colorClasses = getActionColor(activity.action)
                    
                    return (
                      <div key={activity.id} className="flex items-start space-x-3">
                        {/* Linha temporal */}
                        <div className="flex flex-col items-center">
                          <div className={`p-1.5 rounded-full border ${colorClasses}`}>
                            <Icon className="w-3 h-3" />
                          </div>
                          {index < group.activities.length - 1 && (
                            <div className="w-px h-4 bg-gray-200 mt-2" />
                          )}
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <Avatar
                              src={activity.profiles?.avatar_url}
                              alt={activity.profiles?.full_name}
                              size="sm"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <div className="text-sm">
                                <span className="font-medium text-gray-900">
                                  {activity.profiles?.full_name}
                                </span>
                                {' '}
                                <span className="text-gray-600">
                                  {formatAction(activity.action, activity.details)}
                                </span>
                                {activity.tasks?.name && (
                                  <>
                                    {' '}
                                    <span className="text-gray-500">em</span>
                                    {' '}
                                    <span className="font-medium text-gray-700">
                                      {activity.tasks.name}
                                    </span>
                                  </>
                                )}
                              </div>
                              
                              <div className="text-xs text-gray-500 mt-0.5">
                                {formatTime(activity.timestamp)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Botão mostrar mais */}
            {hasHiddenActivities && (
              <div className="text-center mt-6 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAll(true)}
                  className="text-gray-600"
                >
                  Mostrar mais {totalActivities - maxItems} atividade
                  {totalActivities - maxItems !== 1 ? 's' : ''}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {selectedFilter === 'all' && dateRange === 'all'
                ? 'Nenhuma atividade registrada ainda'
                : 'Nenhuma atividade encontrada para os filtros selecionados'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Skeleton para item de atividade
 */
function ActivityItemSkeleton() {
  return (
    <div className="flex items-start space-x-3 animate-pulse">
      <div className="w-6 h-6 bg-gray-200 rounded-full flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded w-64" />
            <div className="h-3 bg-gray-200 rounded w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Versão compacta para dashboard
 */
export function ActivityTimelineCompact({ 
  userId, 
  projectId, 
  maxItems = 5,
  className = '' 
}) {
  const { 
    userActivities, 
    projectActivities, 
    recentActivities, 
    isLoading,
    formatAction 
  } = useActivityLog({ userId, projectId, autoRefresh: false })

  const activities = useMemo(() => {
    if (projectId && projectActivities.length > 0) {
      return projectActivities.slice(0, maxItems)
    }
    if (userId && userActivities.length > 0) {
      return userActivities.slice(0, maxItems)
    }
    return recentActivities.slice(0, maxItems)
  }, [projectId, projectActivities, userId, userActivities, recentActivities, maxItems])

  if (isLoading) {
    return (
      <div className={className}>
        <div className="text-sm font-medium text-gray-700 mb-3">Atividade Recente</div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <ActivityItemSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-xs text-gray-500">Sem atividades recentes</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="text-sm font-medium text-gray-700 mb-3">Atividade Recente</div>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-2">
            <Avatar
              src={activity.profiles?.avatar_url}
              alt={activity.profiles?.full_name}
              size="xs"
            />
            
            <div className="flex-1 min-w-0">
              <div className="text-xs">
                <span className="font-medium text-gray-900">
                  {activity.profiles?.full_name}
                </span>
                {' '}
                <span className="text-gray-600">
                  {formatAction(activity.action, activity.details)}
                </span>
              </div>
              
              <div className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(activity.timestamp), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivityTimeline