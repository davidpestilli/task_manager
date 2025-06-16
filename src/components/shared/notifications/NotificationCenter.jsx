import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Filter, 
  Search, 
  CheckCheck, 
  Trash2, 
  Settings,
  Bell,
  BellOff,
  Archive,
  RefreshCw
} from 'lucide-react'
import { NotificationItem, NotificationItemSkeleton } from '@/components/shared/notifications'
import { Button, Input, Dropdown, Badge } from '@/components/shared/ui'
import { useNotifications } from '@/hooks/notifications'
import { useDebounce } from '@/hooks/shared'
import { NOTIFICATION_TYPES, NOTIFICATION_DISPLAY_CONFIG } from '@/types/notification'

/**
 * Centro de notificações - página completa para gerenciar notificações
 */
export function NotificationCenter({ className = '' }) {
  const navigate = useNavigate()
  const [selectedNotifications, setSelectedNotifications] = useState(new Set())
  const [filter, setFilter] = useState({
    status: 'all', // 'all', 'unread', 'read'
    type: 'all', // 'all' ou tipos específicos
    search: ''
  })
  const [sortBy, setSortBy] = useState('newest') // 'newest', 'oldest', 'type'

  // Debounce da busca
  const debouncedSearch = useDebounce(filter.search, 300)

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh
  } = useNotifications({ 
    limit: 50,
    onlyUnread: filter.status === 'unread',
    autoRefresh: true
  })

  // Filtrar e ordenar notificações
  const filteredNotifications = useMemo(() => {
    let filtered = notifications

    // Filtro por status
    if (filter.status === 'unread') {
      filtered = filtered.filter(n => !n.is_read)
    } else if (filter.status === 'read') {
      filtered = filtered.filter(n => n.is_read)
    }

    // Filtro por tipo
    if (filter.type !== 'all') {
      filtered = filtered.filter(n => n.type === filter.type)
    }

    // Filtro por busca
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase()
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchLower) ||
        n.message.toLowerCase().includes(searchLower) ||
        n.triggered_by_profile?.full_name?.toLowerCase().includes(searchLower)
      )
    }

    // Ordenação
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'type':
          return a.type.localeCompare(b.type)
        case 'newest':
        default:
          return new Date(b.created_at) - new Date(a.created_at)
      }
    })

    return sorted
  }, [notifications, filter, debouncedSearch, sortBy])

  // Estatísticas
  const stats = useMemo(() => {
    const total = notifications.length
    const unread = notifications.filter(n => !n.is_read).length
    const byType = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1
      return acc
    }, {})

    return { total, unread, byType }
  }, [notifications])

  // Handlers para seleção
  const handleSelectNotification = (id, selected) => {
    const newSelected = new Set(selectedNotifications)
    if (selected) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedNotifications(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set())
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)))
    }
  }

  // Ações em lote
  const handleBulkMarkAsRead = async () => {
    const promises = Array.from(selectedNotifications).map(id => markAsRead(id))
    await Promise.all(promises)
    setSelectedNotifications(new Set())
  }

  const handleBulkDelete = async () => {
    if (window.confirm(`Remover ${selectedNotifications.size} notificação(ões)?`)) {
      const promises = Array.from(selectedNotifications).map(id => deleteNotification(id))
      await Promise.all(promises)
      setSelectedNotifications(new Set())
    }
  }

  const handleNotificationClick = (notification) => {
    // Marcar como lida
    if (!notification.is_read) {
      markAsRead(notification.id)
    }

    // Navegar para contexto
    if (notification.task_id && notification.project_id) {
      navigate(`/projects/${notification.project_id}/tasks/${notification.task_id}`)
    } else if (notification.project_id) {
      navigate(`/projects/${notification.project_id}/people`)
    }
  }

  // Opções de filtro
  const typeOptions = [
    { value: 'all', label: 'Todos os tipos' },
    ...Object.entries(NOTIFICATION_TYPES).map(([key, value]) => ({
      value,
      label: NOTIFICATION_DISPLAY_CONFIG[value]?.icon + ' ' + key.replace(/_/g, ' '),
    }))
  ]

  const statusOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'unread', label: 'Não lidas' },
    { value: 'read', label: 'Lidas' }
  ]

  const sortOptions = [
    { value: 'newest', label: 'Mais recentes' },
    { value: 'oldest', label: 'Mais antigas' },
    { value: 'type', label: 'Por tipo' }
  ]

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Central de Notificações
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie todas as suas notificações
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/settings/notifications')}
            >
              <Settings className="h-4 w-4 mr-1" />
              Configurações
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Não lidas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
              </div>
              <BellOff className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lidas</p>
                <p className="text-2xl font-bold text-green-600">{stats.total - stats.unread}</p>
              </div>
              <Archive className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa lida</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.total > 0 ? Math.round(((stats.total - stats.unread) / stats.total) * 100) : 0}%
                </p>
              </div>
              <CheckCheck className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e busca */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar notificações..."
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <Dropdown
              trigger={
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Status: {statusOptions.find(o => o.value === filter.status)?.label}
                </Button>
              }
              items={statusOptions.map(option => ({
                label: option.label,
                onClick: () => setFilter(prev => ({ ...prev, status: option.value }))
              }))}
            />

            <Dropdown
              trigger={
                <Button variant="outline" size="sm">
                  Tipo: {typeOptions.find(o => o.value === filter.type)?.label}
                </Button>
              }
              items={typeOptions.map(option => ({
                label: option.label,
                onClick: () => setFilter(prev => ({ ...prev, type: option.value }))
              }))}
            />

            <Dropdown
              trigger={
                <Button variant="outline" size="sm">
                  Ordenar: {sortOptions.find(o => o.value === sortBy)?.label}
                </Button>
              }
              items={sortOptions.map(option => ({
                label: option.label,
                onClick: () => setSortBy(option.value)
              }))}
            />
          </div>
        </div>

        {/* Ações em lote */}
        {selectedNotifications.size > 0 && (
          <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-800">
              {selectedNotifications.size} notificação(ões) selecionada(s)
            </span>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkMarkAsRead}
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Marcar como lidas
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remover
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de notificações */}
      <div className="space-y-2">
        {/* Seleção múltipla */}
        {filteredNotifications.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={selectedNotifications.size === filteredNotifications.length}
              onChange={handleSelectAll}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">
              Selecionar todas ({filteredNotifications.length})
            </span>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <NotificationItemSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredNotifications.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border">
            <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma notificação encontrada
            </h3>
            <p className="text-gray-600 mb-4">
              {filter.search || filter.status !== 'all' || filter.type !== 'all'
                ? 'Tente ajustar os filtros para encontrar notificações.'
                : 'Você não tem notificações no momento.'}
            </p>
            
            {(filter.search || filter.status !== 'all' || filter.type !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilter({ status: 'all', type: 'all', search: '' })
                  setSortBy('newest')
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        )}

        {/* Lista */}
        {!isLoading && filteredNotifications.map((notification) => (
          <div key={notification.id} className="flex items-start gap-3 bg-white p-2 rounded-lg border">
            <input
              type="checkbox"
              checked={selectedNotifications.has(notification.id)}
              onChange={(e) => handleSelectNotification(notification.id, e.target.checked)}
              className="mt-2 rounded border-gray-300"
            />
            
            <div className="flex-1">
              <NotificationItem
                notification={notification}
                onClick={handleNotificationClick}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                showActions={true}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Actions footer */}
      {stats.unread > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-3">
            Você tem {stats.unread} notificação(ões) não lidas
          </p>
          <Button onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar todas como lidas
          </Button>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter