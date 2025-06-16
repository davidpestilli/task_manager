import React, { useState, useMemo } from 'react'
import { Button, Avatar, Badge, Spinner } from '@/components/shared/ui'
import { useActivityLog } from '@/hooks/dashboard'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  History, 
  Filter, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  Play,
  Pause,
  Edit,
  Trash2,
  Link,
  UserPlus,
  UserMinus
} from 'lucide-react'

/**
 * Componente para exibir histórico completo de uma tarefa
 * @param {Object} props - Props do componente
 * @param {string} props.taskId - ID da tarefa
 * @param {string} props.taskName - Nome da tarefa
 * @param {boolean} props.collapsed - Se deve iniciar colapsado
 * @param {boolean} props.showFilters - Se deve mostrar filtros
 * @param {number} props.maxItems - Máximo de itens a exibir
 * @param {string} props.className - Classes CSS adicionais
 */
export function TaskHistory({
  taskId,
  taskName,
  collapsed = false,
  showFilters = true,
  maxItems = 20,
  className = ''
}) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showAll, setShowAll] = useState(false)

  const {
    taskActivities,
    isLoadingTaskActivities,
    taskActivitiesError,
    refetchTaskActivities,
    formatAction
  } = useActivityLog({ taskId })

  /**
   * Atividades filtradas
   */
  const filteredActivities = useMemo(() => {
    if (selectedFilter === 'all') {
      return taskActivities
    }
    
    return taskActivities.filter(activity => {
      switch (selectedFilter) {
        case 'status':
          return ['task_updated', 'task_completed', 'step_completed', 'step_uncompleted'].includes(activity.action)
        case 'comments':
          return ['comment_added', 'comment_updated', 'comment_deleted'].includes(activity.action)
        case 'assignments':
          return ['task_assigned', 'task_unassigned'].includes(activity.action)
        case 'dependencies':
          return ['dependency_added', 'dependency_removed'].includes(activity.action)
        default:
          return true
      }
    })
  }, [taskActivities, selectedFilter])

  /**
   * Atividades a serem exibidas
   */
  const displayedActivities = useMemo(() => {
    if (showAll || filteredActivities.length <= maxItems) {
      return filteredActivities
    }
    return filteredActivities.slice(0, maxItems)
  }, [filteredActivities, showAll, maxItems])

  const hasHiddenActivities = filteredActivities.length > maxItems && !showAll

  /**
   * Opções de filtro
   */
  const filterOptions = [
    { value: 'all', label: 'Todas atividades', icon: History },
    { value: 'status', label: 'Status e progresso', icon: CheckCircle },
    { value: 'comments', label: 'Comentários', icon: MessageSquare },
    { value: 'assignments', label: 'Atribuições', icon: UserPlus },
    { value: 'dependencies', label: 'Dependências', icon: Link }
  ]

  /**
   * Ícones por tipo de ação
   */
  const getActionIcon = (action) => {
    const iconMap = {
      'task_created': Play,
      'task_updated': Edit,
      'task_completed': CheckCircle,
      'task_assigned': UserPlus,
      'task_unassigned': UserMinus,
      'step_completed': CheckCircle,
      'step_uncompleted': Clock,
      'comment_added': MessageSquare,
      'comment_updated': Edit,
      'comment_deleted': Trash2,
      'dependency_added': Link,
      'dependency_removed': Link
    }
    
    const Icon = iconMap[action] || History
    return Icon
  }

  /**
   * Cores por tipo de ação
   */
  const getActionColor = (action) => {
    const colorMap = {
      'task_created': 'text-green-600',
      'task_updated': 'text-blue-600',
      'task_completed': 'text-green-600',
      'task_assigned': 'text-blue-600',
      'task_unassigned': 'text-orange-600',
      'step_completed': 'text-green-600',
      'step_uncompleted': 'text-gray-600',
      'comment_added': 'text-purple-600',
      'comment_updated': 'text-blue-600',
      'comment_deleted': 'text-red-600',
      'dependency_added': 'text-indigo-600',
      'dependency_removed': 'text-orange-600'
    }
    
    return colorMap[action] || 'text-gray-600'
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
   * Toggle de colapso
   */
  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  /**
   * Atualiza histórico
   */
  const handleRefresh = () => {
    refetchTaskActivities()
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={handleToggleCollapse}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <History className="w-5 h-5" />
          <span className="font-medium">Histórico de Atividades</span>
          
          {filteredActivities.length > 0 && (
            <Badge variant="secondary" size="sm">
              {filteredActivities.length}
            </Badge>
          )}
          
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>

        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoadingTaskActivities}
              className="text-gray-500 hover:text-gray-700"
              title="Atualizar histórico"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingTaskActivities ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      {!isCollapsed && (
        <div className="p-4">
          {/* Filtros */}
          {showFilters && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSelectedFilter(option.value)}
                      className={`flex items-center space-x-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
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
            </div>
          )}

          {/* Lista de atividades */}
          {isLoadingTaskActivities ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <ActivityItemSkeleton key={i} />
              ))}
            </div>
          ) : taskActivitiesError ? (
            <div className="text-center py-6">
              <div className="text-red-600 text-sm mb-2">
                Erro ao carregar histórico
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
          ) : displayedActivities.length > 0 ? (
            <>
              <div className="space-y-4">
                {displayedActivities.map((activity, index) => {
                  const Icon = getActionIcon(activity.action)
                  const iconColor = getActionColor(activity.action)
                  
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      {/* Linha temporal */}
                      <div className="flex flex-col items-center">
                        <div className={`p-2 rounded-full bg-white border-2 ${iconColor.replace('text-', 'border-')}`}>
                          <Icon className={`w-4 h-4 ${iconColor}`} />
                        </div>
                        {index < displayedActivities.length - 1 && (
                          <div className="w-px h-6 bg-gray-200 mt-2" />
                        )}
                      </div>

                      {/* Conteúdo da atividade */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Avatar
                            src={activity.profiles?.avatar_url}
                            alt={activity.profiles?.full_name}
                            size="sm"
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">
                                {activity.profiles?.full_name}
                              </span>
                              <span className="text-sm text-gray-600">
                                {formatAction(activity.action, activity.details)}
                              </span>
                            </div>
                            
                            <div className="text-xs text-gray-500 mt-1">
                              {formatTime(activity.timestamp)}
                            </div>
                          </div>
                        </div>

                        {/* Detalhes adicionais */}
                        {activity.details && Object.keys(activity.details).length > 0 && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                            {activity.details.step_name && (
                              <div>Etapa: {activity.details.step_name}</div>
                            )}
                            {activity.details.comment_preview && (
                              <div>"{activity.details.comment_preview}..."</div>
                            )}
                            {activity.details.dependency_task && (
                              <div>Tarefa: {activity.details.dependency_task}</div>
                            )}
                            {activity.details.old_status && activity.details.new_status && (
                              <div>
                                {activity.details.old_status} → {activity.details.new_status}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Botão mostrar mais */}
              {hasHiddenActivities && (
                <div className="text-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAll(true)}
                    className="text-gray-600"
                  >
                    Mostrar mais {filteredActivities.length - maxItems} atividade
                    {filteredActivities.length - maxItems !== 1 ? 's' : ''}
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                {selectedFilter === 'all' 
                  ? 'Nenhuma atividade registrada ainda'
                  : 'Nenhuma atividade encontrada para este filtro'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Skeleton para item de atividade
 */
function ActivityItemSkeleton() {
  return (
    <div className="flex items-start space-x-3 animate-pulse">
      <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded w-48" />
            <div className="h-3 bg-gray-200 rounded w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Versão compacta para exibição em cards
 */
export function TaskHistoryCompact({ 
  taskId, 
  maxItems = 3,
  onClick,
  className = '' 
}) {
  const { taskActivities, isLoadingTaskActivities } = useActivityLog({ taskId })

  const recentActivities = taskActivities.slice(0, maxItems)

  if (isLoadingTaskActivities) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="text-sm font-medium text-gray-700 mb-2">Atividade Recente</div>
        <ActivityItemSkeleton />
      </div>
    )
  }

  if (recentActivities.length === 0) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <History className="w-6 h-6 text-gray-300 mx-auto mb-1" />
        <p className="text-xs text-gray-500">Sem atividades</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-gray-700">Atividade Recente</div>
        {onClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Ver tudo
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        {recentActivities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-2 text-xs">
            <Avatar
              src={activity.profiles?.avatar_url}
              alt={activity.profiles?.full_name}
              size="xs"
            />
            <div className="flex-1 truncate">
              <span className="font-medium">{activity.profiles?.full_name}</span>
              {' '}
              <span className="text-gray-600">
                {activity.action === 'comment_added' ? 'comentou' : 
                 activity.action === 'step_completed' ? 'concluiu etapa' :
                 activity.action === 'task_updated' ? 'atualizou' : 'agiu'}
              </span>
            </div>
            <div className="text-gray-400 text-xs">
              {formatDistanceToNow(new Date(activity.timestamp), { 
                addSuffix: true, 
                locale: ptBR 
              }).replace('aproximadamente ', '')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskHistory