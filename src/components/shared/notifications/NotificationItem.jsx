import React from 'react'
import { X, ExternalLink, Clock, User } from 'lucide-react'
import { NOTIFICATION_DISPLAY_CONFIG } from '@/types/notification'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Avatar } from '@/components/shared/ui'

/**
 * Componente para exibir uma notificação individual
 */
export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
  showActions = true,
  compact = false,
  className = ''
}) {
  const {
    id,
    type,
    title,
    message,
    is_read: isRead,
    created_at: createdAt,
    triggered_by_profile: triggeredBy,
    task,
    project
  } = notification

  // Configuração de exibição baseada no tipo
  const displayConfig = NOTIFICATION_DISPLAY_CONFIG[type] || {
    icon: '📋',
    color: 'gray'
  }

  // Formatação de tempo relativo
  const timeAgo = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(createdAt), {
        addSuffix: true,
        locale: ptBR
      })
    } catch (error) {
      return 'Agora'
    }
  }, [createdAt])

  // Classes CSS baseadas no estado
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50', 
      border: 'border-green-200',
      icon: 'text-green-600'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200', 
      icon: 'text-red-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600'
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      icon: 'text-indigo-600'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600'
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: 'text-gray-600'
    }
  }

  const colors = colorClasses[displayConfig.color] || colorClasses.gray

  const handleClick = () => {
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(id)
    }
    onClick?.(notification)
  }

  const handleMarkAsRead = (e) => {
    e.stopPropagation()
    onMarkAsRead?.(id)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete?.(id)
  }

  return (
    <div
      className={`
        relative group cursor-pointer
        transition-all duration-200 ease-in-out
        ${isRead 
          ? 'bg-white border-gray-200' 
          : `${colors.bg} ${colors.border} border-l-4`
        }
        border rounded-lg p-4 hover:shadow-md
        ${compact ? 'p-3' : 'p-4'}
        ${className}
      `}
      onClick={handleClick}
    >
      {/* Indicador de não lida */}
      {!isRead && (
        <div className="absolute top-2 right-2 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
      )}

      <div className="flex items-start gap-3">
        {/* Avatar ou ícone */}
        <div className="flex-shrink-0">
          {triggeredBy?.avatar_url ? (
            <Avatar
              src={triggeredBy.avatar_url}
              alt={triggeredBy.full_name}
              size="sm"
              fallback={<User className="h-4 w-4" />}
            />
          ) : (
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${colors.bg} ${colors.border} border-2
            `}>
              <span className="text-sm">{displayConfig.icon}</span>
            </div>
          )}
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 min-w-0">
          {/* Cabeçalho */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className={`
                font-medium text-sm
                ${isRead ? 'text-gray-900' : 'text-gray-900'}
                ${compact ? 'text-xs' : 'text-sm'}
              `}>
                {title}
              </h4>
              
              {/* Usuário que triggou */}
              {triggeredBy && (
                <p className="text-xs text-gray-500 mt-1">
                  por {triggeredBy.full_name}
                </p>
              )}
            </div>

            {/* Tempo */}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>
          </div>

          {/* Mensagem */}
          <p className={`
            mt-2 text-gray-600 
            ${compact ? 'text-xs' : 'text-sm'}
            line-clamp-2
          `}>
            {message}
          </p>

          {/* Contexto (projeto/tarefa) */}
          {(project || task) && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              {project && (
                <span className="bg-gray-100 px-2 py-1 rounded">
                  📁 {project.name}
                </span>
              )}
              {task && (
                <span className="bg-blue-100 px-2 py-1 rounded">
                  📋 {task.name}
                </span>
              )}
            </div>
          )}

          {/* Ações */}
          {showActions && (
            <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isRead && (
                <button
                  onClick={handleMarkAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Marcar como lida
                </button>
              )}
              
              {(task || project) && (
                <button
                  onClick={handleClick}
                  className="text-xs text-gray-600 hover:text-gray-700 flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Ver detalhes
                </button>
              )}
              
              <button
                onClick={handleDelete}
                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 ml-auto"
              >
                <X className="h-3 w-3" />
                Remover
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Versão compacta para dropdown
 */
export function CompactNotificationItem({ notification, ...props }) {
  return (
    <NotificationItem 
      notification={notification}
      compact={true}
      showActions={false}
      {...props}
    />
  )
}

/**
 * Skeleton loader para notificação
 */
export function NotificationItemSkeleton({ compact = false }) {
  return (
    <div className={`
      border rounded-lg animate-pulse
      ${compact ? 'p-3' : 'p-4'}
    `}>
      <div className="flex items-start gap-3">
        {/* Avatar skeleton */}
        <div className="h-8 w-8 bg-gray-200 rounded-full flex-shrink-0" />
        
        {/* Conteúdo skeleton */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
          
          <div className="mt-2 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationItem