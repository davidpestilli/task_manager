import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/auth'
import { notificationsService } from '@/services/notifications'
import { useToast } from '@/hooks/shared'

/**
 * Hook para gerenciar notificações do usuário
 */
export function useNotifications(options = {}) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const {
    limit = 10,
    onlyUnread = false,
    autoRefresh = true,
    enabled = true
  } = options

  /**
   * Query para buscar notificações
   */
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notifications', user?.id, { limit, onlyUnread }],
    queryFn: () => notificationsService.getUserNotifications(user.id, { limit, onlyUnread }),
    enabled: enabled && !!user?.id,
    refetchInterval: autoRefresh ? 30000 : false, // Refetch a cada 30 segundos
    select: (data) => data.notifications || []
  })

  /**
   * Query para contar notificações não lidas
   */
  const {
    data: unreadCount = 0,
    refetch: refetchUnreadCount
  } = useQuery({
    queryKey: ['notifications', 'unread-count', user?.id],
    queryFn: () => notificationsService.getUnreadCount(user.id),
    enabled: !!user?.id,
    refetchInterval: autoRefresh ? 30000 : false,
    select: (data) => data.count || 0
  })

  /**
   * Mutation para marcar notificação como lida
   */
  const markAsReadMutation = useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: (data, notificationId) => {
      // Atualizar cache das notificações
      queryClient.setQueryData(
        ['notifications', user?.id, { limit, onlyUnread }],
        (oldData) => ({
          ...oldData,
          notifications: oldData?.notifications?.map(notification =>
            notification.id === notificationId
              ? { ...notification, is_read: true }
              : notification
          ) || []
        })
      )

      // Atualizar contador
      queryClient.setQueryData(
        ['notifications', 'unread-count', user?.id],
        (oldCount = 0) => Math.max(0, oldCount - 1)
      )
    },
    onError: (error) => {
      showToast('Erro ao marcar notificação como lida', { type: 'error' })
      console.error('Erro ao marcar como lida:', error)
    }
  })

  /**
   * Mutation para marcar todas como lidas
   */
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(user.id),
    onSuccess: () => {
      // Atualizar cache das notificações
      queryClient.setQueryData(
        ['notifications', user?.id, { limit, onlyUnread }],
        (oldData) => ({
          ...oldData,
          notifications: oldData?.notifications?.map(notification => ({
            ...notification,
            is_read: true
          })) || []
        })
      )

      // Zerar contador
      queryClient.setQueryData(
        ['notifications', 'unread-count', user?.id],
        0
      )

      showToast('Todas as notificações foram marcadas como lidas', { type: 'success' })
    },
    onError: (error) => {
      showToast('Erro ao marcar todas como lidas', { type: 'error' })
      console.error('Erro ao marcar todas como lidas:', error)
    }
  })

  /**
   * Mutation para deletar notificação
   */
  const deleteNotificationMutation = useMutation({
    mutationFn: notificationsService.deleteNotification,
    onSuccess: (data, notificationId) => {
      // Remover do cache
      queryClient.setQueryData(
        ['notifications', user?.id, { limit, onlyUnread }],
        (oldData) => ({
          ...oldData,
          notifications: oldData?.notifications?.filter(n => n.id !== notificationId) || []
        })
      )

      // Atualizar contador se necessário
      const deletedNotification = notifications.find(n => n.id === notificationId)
      if (deletedNotification && !deletedNotification.is_read) {
        queryClient.setQueryData(
          ['notifications', 'unread-count', user?.id],
          (oldCount = 0) => Math.max(0, oldCount - 1)
        )
      }

      showToast('Notificação removida', { type: 'success' })
    },
    onError: (error) => {
      showToast('Erro ao remover notificação', { type: 'error' })
      console.error('Erro ao deletar notificação:', error)
    }
  })

  /**
   * Mutation para criar notificação
   */
  const createNotificationMutation = useMutation({
    mutationFn: notificationsService.createNotification,
    onSuccess: () => {
      // Invalidar queries para recarregar
      queryClient.invalidateQueries(['notifications', user?.id])
    },
    onError: (error) => {
      console.error('Erro ao criar notificação:', error)
    }
  })

  /**
   * Funcões auxiliares
   */
  const markAsRead = (notificationId) => {
    markAsReadMutation.mutate(notificationId)
  }

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate()
  }

  const deleteNotification = (notificationId) => {
    deleteNotificationMutation.mutate(notificationId)
  }

  const createNotification = (notificationData) => {
    createNotificationMutation.mutate(notificationData)
  }

  const refresh = () => {
    refetch()
    refetchUnreadCount()
  }

  /**
   * Filtrar notificações por tipo
   */
  const getNotificationsByType = (type) => {
    return notifications.filter(notification => notification.type === type)
  }

  /**
   * Obter notificações não lidas
   */
  const getUnreadNotifications = () => {
    return notifications.filter(notification => !notification.is_read)
  }

  /**
   * Verificar se tem notificações não lidas
   */
  const hasUnreadNotifications = unreadCount > 0

  return {
    // Dados
    notifications,
    unreadCount,
    hasUnreadNotifications,
    
    // Estados
    isLoading,
    error,
    
    // Mutations
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
    isCreating: createNotificationMutation.isPending,
    
    // Ações
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refresh,
    
    // Utilidades
    getNotificationsByType,
    getUnreadNotifications
  }
}

export default useNotifications