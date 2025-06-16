import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, MoreHorizontal, CheckCheck } from 'lucide-react'
import { NotificationBadge, CompactNotificationItem, NotificationItemSkeleton } from '@/components/shared/notifications'
import { Button } from '@/components/shared/ui'
import { useNotifications } from '@/hooks/notifications'
import { useAuth } from '@/hooks/auth'

/**
 * Dropdown de notificações no header
 */
export function NotificationDropdown({ className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState('all') // 'all', 'unread'
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh
  } = useNotifications({ 
    limit: 10, 
    onlyUnread: filter === 'unread',
    autoRefresh: isOpen 
  })

  // Fechar dropdown quando clica fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Fechar dropdown com Escape
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleNotificationClick = (notification) => {
    // Marcar como lida se não estiver
    if (!notification.is_read) {
      markAsRead(notification.id)
    }

    // Navegar para contexto relevante
    if (notification.task_id && notification.project_id) {
      navigate(`/projects/${notification.project_id}/tasks/${notification.task_id}`)
    } else if (notification.project_id) {
      navigate(`/projects/${notification.project_id}/people`)
    }

    setIsOpen(false)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const handleViewAll = () => {
    navigate('/notifications')
    setIsOpen(false)
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      // Refresh notifications when opening
      refresh()
    }
  }

  const filteredNotifications = React.useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.is_read)
    }
    return notifications
  }, [notifications, filter])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Badge trigger */}
      <NotificationBadge
        count={unreadCount}
        onClick={toggleDropdown}
        animated={true}
        aria-expanded={isOpen}
        aria-haspopup="true"
      />

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notificações
              </h3>
              
              <div className="flex items-center gap-2">
                {/* Filtros */}
                <div className="flex rounded-md border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setFilter('all')}
                    className={`
                      px-3 py-1 text-sm font-medium transition-colors
                      ${filter === 'all' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`
                      px-3 py-1 text-sm font-medium transition-colors border-l
                      ${filter === 'unread' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-gray-200'
                      }
                    `}
                  >
                    Não lidas
                    {unreadCount > 0 && (
                      <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Menu de ações */}
                <div className="relative">
                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Ações rápidas */}
            {unreadCount > 0 && (
              <div className="mt-2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs"
                  disabled={!unreadCount}
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Marcar todas como lidas
                </Button>
              </div>
            )}
          </div>

          {/* Lista de notificações */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              // Loading state
              <div className="p-2 space-y-2">
                {[...Array(3)].map((_, i) => (
                  <NotificationItemSkeleton key={i} compact={true} />
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              // Empty state
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <Settings className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-sm text-gray-600">
                  {filter === 'unread' 
                    ? 'Nenhuma notificação não lida' 
                    : 'Nenhuma notificação encontrada'
                  }
                </p>
                {filter === 'unread' && notifications.length > 0 && (
                  <button
                    onClick={() => setFilter('all')}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Ver todas as notificações
                  </button>
                )}
              </div>
            ) : (
              // Lista de notificações
              <div className="p-2 space-y-1">
                {filteredNotifications.map((notification) => (
                  <CompactNotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={handleNotificationClick}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    className="hover:bg-gray-50 rounded-md transition-colors"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
            <div className="flex items-center justify-between">
              <button
                onClick={handleViewAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todas as notificações
              </button>
              
              <button
                onClick={() => navigate('/settings/notifications')}
                className="text-sm text-gray-600 hover:text-gray-700 flex items-center gap-1"
              >
                <Settings className="h-4 w-4" />
                Configurações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Versão simplificada do dropdown
 */
export function SimpleNotificationDropdown({ maxItems = 5, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead
  } = useNotifications({ 
    limit: maxItems, 
    onlyUnread: true 
  })

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id)
    
    if (notification.task_id && notification.project_id) {
      navigate(`/projects/${notification.project_id}/tasks/${notification.task_id}`)
    }
    
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <NotificationBadge
        count={unreadCount}
        onClick={() => setIsOpen(!isOpen)}
        size="sm"
      />

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg border shadow-lg z-50">
          <div className="p-3 border-b">
            <h4 className="font-medium text-gray-900">Notificações</h4>
          </div>
          
          <div className="max-h-64 overflow-y-auto p-2">
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">
                Carregando...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Nenhuma notificação
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <CompactNotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={handleNotificationClick}
                    className="hover:bg-gray-50 rounded transition-colors"
                  />
                ))}
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t text-center">
              <button
                onClick={() => {
                  navigate('/notifications')
                  setIsOpen(false)
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Ver todas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown