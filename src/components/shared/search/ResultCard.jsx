import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, Clock, Users, CheckCircle, Calendar, Link2 } from 'lucide-react'
import { Card, Badge, ProgressBar, Avatar, Tooltip } from '@/components/shared/ui'
import { highlightUtils } from '@/utils/helpers'
import { cn } from '@/utils/helpers'

/**
 * Card reutilizável para exibir resultado individual de busca
 * Suporta diferentes tipos de resultado com layouts otimizados
 */
export const ResultCard = ({ 
  item, 
  query, 
  category,
  onClick,
  showMetadata = true,
  variant = 'default', // 'default', 'compact', 'detailed'
  className,
  ...props 
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick(item, category)
    } else {
      // Navegação padrão
      const url = getNavigationUrl(item, category)
      if (url) navigate(url)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  // Aplicar highlight no item
  const highlightedItem = highlightUtils.highlightSearchResult(item, query)

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:border-blue-300 hover:bg-blue-50/30',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        variant === 'compact' && 'p-3',
        variant === 'detailed' && 'p-5',
        variant === 'default' && 'p-4',
        className
      )}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`Abrir ${getCategoryLabel(category)}: ${item.name || item.full_name}`}
      {...props}
    >
      {/* Renderizar conteúdo baseado no tipo */}
      {category === 'projects' && (
        <ProjectCard 
          item={highlightedItem}
          variant={variant}
          showMetadata={showMetadata}
        />
      )}
      
      {category === 'people' && (
        <PersonCard 
          item={highlightedItem}
          variant={variant}
          showMetadata={showMetadata}
        />
      )}
      
      {category === 'tasks' && (
        <TaskCard 
          item={highlightedItem}
          variant={variant}
          showMetadata={showMetadata}
        />
      )}
    </Card>
  )
}

/**
 * Card específico para projetos
 */
const ProjectCard = ({ item, variant, showMetadata }) => {
  const isCompact = variant === 'compact'
  const isDetailed = variant === 'detailed'

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <span className={cn(
              isCompact ? 'text-lg' : 'text-2xl'
            )}>
              📁
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 
              className={cn(
                'font-semibold text-gray-900 truncate',
                isCompact ? 'text-sm' : 'text-base'
              )}
              dangerouslySetInnerHTML={{ 
                __html: item.name_highlighted || item.name 
              }}
            />
            
            {item.description && (
              <p 
                className={cn(
                  'text-gray-600 mt-1',
                  isCompact ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2'
                )}
                dangerouslySetInnerHTML={{ 
                  __html: item.description_excerpt || item.description_highlighted || item.description 
                }}
              />
            )}
          </div>
        </div>
        
        <div className="flex-shrink-0 ml-2">
          <ExternalLink className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Metadata */}
      {showMetadata && (
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            <span>{item.tasks_count || 0} tarefas</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{item.members_count || 0} membros</span>
          </div>
          
          {item.updated_at && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatRelativeDate(item.updated_at)}</span>
            </div>
          )}
        </div>
      )}

      {/* Detailed info */}
      {isDetailed && item.owner && (
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Criado por:</span>
            <Avatar 
              src={item.owner.avatar_url}
              alt={item.owner.full_name}
              size="xs"
              fallback={item.owner.full_name?.charAt(0)}
            />
            <span>{item.owner.full_name}</span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Card específico para pessoas
 */
const PersonCard = ({ item, variant, showMetadata }) => {
  const isCompact = variant === 'compact'
  const isDetailed = variant === 'detailed'

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar 
            src={item.avatar_url}
            alt={item.full_name}
            size={isCompact ? 'sm' : 'md'}
            fallback={item.full_name?.charAt(0) || '?'}
          />
          
          <div className="flex-1 min-w-0">
            <h3 
              className={cn(
                'font-semibold text-gray-900 truncate',
                isCompact ? 'text-sm' : 'text-base'
              )}
              dangerouslySetInnerHTML={{ 
                __html: item.full_name_highlighted || item.full_name 
              }}
            />
            
            {item.email && (
              <p className={cn(
                'text-gray-600 truncate',
                isCompact ? 'text-xs' : 'text-sm'
              )}>
                {item.email}
              </p>
            )}

            {item.role && !isCompact && (
              <Badge variant="secondary" size="sm" className="mt-1">
                {item.role}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex-shrink-0 ml-2">
          <ExternalLink className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Metadata */}
      {showMetadata && (
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <span className="text-blue-600">📁</span>
            <span>{item.projects_count || 0} projetos</span>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-green-600">✅</span>
            <span>{item.active_tasks_count || 0} tarefas ativas</span>
          </div>
          
          {item.last_activity && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Ativo {formatRelativeDate(item.last_activity)}</span>
            </div>
          )}
        </div>
      )}

      {/* Status de atividade */}
      {isDetailed && (
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                isUserActive(item.last_activity) ? 'bg-green-500' : 'bg-gray-400'
              )} />
              <span className="text-gray-600">
                {isUserActive(item.last_activity) ? 'Online' : 'Offline'}
              </span>
            </div>
            
            {item.completion_rate && (
              <span className="text-gray-500">
                {item.completion_rate}% taxa de conclusão
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Card específico para tarefas
 */
const TaskCard = ({ item, variant, showMetadata }) => {
  const isCompact = variant === 'compact'
  const isDetailed = variant === 'detailed'
  const statusConfig = getTaskStatusConfig(item.status)

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-0.5">
            <span className={cn(
              isCompact ? 'text-lg' : 'text-xl'
            )}>
              {statusConfig.icon}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 
                className={cn(
                  'font-semibold text-gray-900 truncate flex-1',
                  isCompact ? 'text-sm' : 'text-base'
                )}
                dangerouslySetInnerHTML={{ 
                  __html: item.name_highlighted || item.name 
                }}
              />
              
              <Badge 
                variant={statusConfig.variant} 
                size={isCompact ? 'xs' : 'sm'}
              >
                {statusConfig.label}
              </Badge>
            </div>
            
            {item.project_name && (
              <p className={cn(
                'text-gray-600 mb-2 truncate',
                isCompact ? 'text-xs' : 'text-sm'
              )}>
                📁 {item.project_name}
              </p>
            )}

            {item.description && !isCompact && (
              <p 
                className="text-gray-600 text-sm line-clamp-2"
                dangerouslySetInnerHTML={{ 
                  __html: item.description_excerpt || item.description_highlighted || item.description 
                }}
              />
            )}
          </div>
        </div>
        
        <div className="flex-shrink-0 ml-2">
          <ExternalLink className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Progress Bar */}
      {showMetadata && (
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Progresso</span>
              <span className="font-medium text-gray-700">
                {item.completion_percentage || 0}%
              </span>
            </div>
            <ProgressBar 
              value={item.completion_percentage || 0} 
              className={cn(
                isCompact ? 'h-1.5' : 'h-2'
              )}
              color={statusConfig.color}
            />
          </div>

          {/* Pessoas atribuídas */}
          {item.assigned_users && item.assigned_users.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Atribuído a:</span>
              <div className="flex -space-x-2">
                {item.assigned_users.slice(0, 3).map((user, index) => (
                  <Tooltip key={index} content={user.full_name}>
                    <Avatar
                      src={user.avatar_url}
                      alt={user.full_name}
                      size="xs"
                      fallback={user.full_name?.charAt(0) || '?'}
                      className="border-2 border-white"
                    />
                  </Tooltip>
                ))}
                {item.assigned_users.length > 3 && (
                  <Tooltip content={`+${item.assigned_users.length - 3} mais`}>
                    <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                      <span className="text-xs text-gray-600">
                        +{item.assigned_users.length - 3}
                      </span>
                    </div>
                  </Tooltip>
                )}
              </div>
            </div>
          )}

          {/* Metadata adicional */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {item.updated_at && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Atualizado {formatRelativeDate(item.updated_at)}</span>
              </div>
            )}
            
            {item.has_dependencies && (
              <Tooltip content="Esta tarefa possui dependências">
                <div className="flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  <span>Dependências</span>
                </div>
              </Tooltip>
            )}

            {item.comments_count > 0 && (
              <div className="flex items-center gap-1">
                <span>💬</span>
                <span>{item.comments_count} comentários</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed view: Due date e prioridade */}
      {isDetailed && (
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
          {item.due_date && (
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar className="h-3 w-3" />
              <span>Vence em {formatRelativeDate(item.due_date)}</span>
            </div>
          )}
          
          {item.priority && (
            <Badge 
              variant={getPriorityVariant(item.priority)}
              size="xs"
            >
              {getPriorityLabel(item.priority)}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Funções auxiliares
 */

const getCategoryLabel = (category) => {
  const labels = {
    'projects': 'projeto',
    'people': 'pessoa',
    'tasks': 'tarefa'
  }
  return labels[category] || 'item'
}

const getNavigationUrl = (item, category) => {
  switch (category) {
    case 'projects':
      return `/projects/${item.id}/people`
    case 'people':
      return `/people/${item.id}`
    case 'tasks':
      return `/projects/${item.project_id}/tasks/${item.id}`
    default:
      return null
  }
}

const getTaskStatusConfig = (status) => {
  const configs = {
    'não_iniciada': {
      icon: '⚪',
      label: 'Não iniciada',
      variant: 'secondary',
      color: 'gray'
    },
    'em_andamento': {
      icon: '🔵',
      label: 'Em andamento',
      variant: 'primary',
      color: 'blue'
    },
    'pausada': {
      icon: '🟡',
      label: 'Pausada',
      variant: 'warning',
      color: 'yellow'
    },
    'concluída': {
      icon: '🟢',
      label: 'Concluída',
      variant: 'success',
      color: 'green'
    }
  }
  return configs[status] || configs['não_iniciada']
}

const getPriorityVariant = (priority) => {
  const variants = {
    'low': 'secondary',
    'medium': 'warning',
    'high': 'danger'
  }
  return variants[priority] || 'secondary'
}

const getPriorityLabel = (priority) => {
  const labels = {
    'low': 'Baixa',
    'medium': 'Média',
    'high': 'Alta'
  }
  return labels[priority] || priority
}

const formatRelativeDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'hoje'
  if (diffDays === 1) return 'ontem'
  if (diffDays < 7) return `há ${diffDays} dias`
  if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`
  if (diffDays < 365) return `há ${Math.floor(diffDays / 30)} meses`
  return `há ${Math.floor(diffDays / 365)} anos`
}

const isUserActive = (lastActivity) => {
  if (!lastActivity) return false
  
  const lastActivityDate = new Date(lastActivity)
  const now = new Date()
  const diffMinutes = (now - lastActivityDate) / (1000 * 60)
  
  return diffMinutes < 30 // Considerado ativo se última atividade foi há menos de 30 min
}

export default ResultCard