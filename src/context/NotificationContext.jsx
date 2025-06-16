import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useAuth } from '@/hooks/auth'
import { notificationsService, realtimeService } from '@/services/notifications'
import { useToast } from '@/hooks/shared'

/**
 * Estados possíveis para o sistema de notificações
 */
const NOTIFICATION_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  UPDATE_NOTIFICATION: 'UPDATE_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_FILTER: 'SET_FILTER'
}

/**
 * Estado inicial do contexto
 */
const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  connected: false,
  filter: {
    onlyUnread: false,
    type: null
  },
  pagination: {
    page: 0,
    limit: 20,
    hasMore: true
  }
}

/**
 * Reducer para gerenciar estado das notificações
 */
function notificationReducer(state, action) {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      }

    case NOTIFICATION_ACTIONS.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload.notifications,
        pagination: {
          ...state.pagination,
          hasMore: action.payload.hasMore || false
        },
        loading: false,
        error: null
      }

    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + (action.payload.is_read ? 0 : 1)
      }

    case NOTIFICATION_ACTIONS.UPDATE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id
            ? { ...notification, ...action.payload }
            : notification
        )
      }

    case NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION:
      const removedNotification = state.notifications.find(n => n.id === action.payload)
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: state.unreadCount - (removedNotification?.is_read ? 0 : 1)
      }

    case NOTIFICATION_ACTIONS.SET_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: action.payload
      }

    case NOTIFICATION_ACTIONS.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, is_read: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }

    case NOTIFICATION_ACTIONS.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          is_read: true
        })),
        unreadCount: 0
      }

    case NOTIFICATION_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      }

    case NOTIFICATION_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }

    case NOTIFICATION_ACTIONS.SET_FILTER:
      return {
        ...state,
        filter: {
          ...state.filter,
          ...action.payload
        }
      }

    default:
      return state
  }
}

/**
 * Context para notificações
 */
const NotificationContext = createContext()

/**
 * Provider do contexto de notificações
 */
export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState)
  const { user } = useAuth()
  const { showToast } = useToast()

  /**
   * Carregar notificações do usuário
   */
  const loadNotifications = async (options = {}) => {
    if (!user?.id) return

    try {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true })

      const { notifications, success, error } = await notificationsService.getUserNotifications(
        user.id,
        {
          limit: state.pagination.limit,
          offset: options.page ? options.page * state.pagination.limit : 0,
          onlyUnread: state.filter.onlyUnread,
          ...options
        }
      )

      if (success) {
        dispatch({
          type: NOTIFICATION_ACTIONS.SET_NOTIFICATIONS,
          payload: {
            notifications: options.page > 0 ? [...state.notifications, ...notifications] : notifications,
            hasMore: notifications.length === state.pagination.limit
          }
        })
      } else {
        dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: error })
      }
    } catch (error) {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: error.message })
    }
  }

  /**
   * Carregar contador de não lidas
   */
  const loadUnreadCount = async () => {
    if (!user?.id) return

    try {
      const { count, success } = await notificationsService.getUnreadCount(user.id)
      if (success) {
        dispatch({ type: NOTIFICATION_ACTIONS.SET_UNREAD_COUNT, payload: count })
      }
    } catch (error) {
      console.error('Erro ao carregar contador:', error)
    }
  }

  /**
   * Marcar notificação como lida
   */
  const markAsRead = async (notificationId) => {
    try {
      const { success } = await notificationsService.markAsRead(notificationId)
      if (success) {
        dispatch({ type: NOTIFICATION_ACTIONS.MARK_AS_READ, payload: notificationId })
      }
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  }

  /**
   * Marcar todas como lidas
   */
  const markAllAsRead = async () => {
    if (!user?.id) return

    try {
      const { success } = await notificationsService.markAllAsRead(user.id)
      if (success) {
        dispatch({ type: NOTIFICATION_ACTIONS.MARK_ALL_AS_READ })
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  /**
   * Deletar notificação
   */
  const deleteNotification = async (notificationId) => {
    try {
      const { success } = await notificationsService.deleteNotification(notificationId)
      if (success) {
        dispatch({ type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION, payload: notificationId })
      }
    } catch (error) {
      console.error('Erro ao deletar notificação:', error)
    }
  }

  /**
   * Aplicar filtros
   */
  const setFilter = (newFilter) => {
    dispatch({ type: NOTIFICATION_ACTIONS.SET_FILTER, payload: newFilter })
  }

  /**
   * Limpar erro
   */
  const clearError = () => {
    dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_ERROR })
  }

  // Configurar conexão em tempo real quando usuário logado
  useEffect(() => {
    if (!user?.id) return

    const callbacks = {
      onConnected: () => {
        console.log('Conectado ao sistema de notificações em tempo real')
      },
      
      onNewNotification: (notification) => {
        dispatch({ type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION, payload: notification })
      },
      
      onNotificationUpdated: (notification) => {
        dispatch({ type: NOTIFICATION_ACTIONS.UPDATE_NOTIFICATION, payload: notification })
      },
      
      onUnreadCountChanged: () => {
        loadUnreadCount()
      },
      
      onShowToast: ({ type, title, message, icon }) => {
        showToast(message, { type, title, icon })
      },
      
      onError: (error) => {
        console.error('Erro na conexão realtime:', error)
      }
    }

    // Conectar ao canal de notificações
    realtimeService.subscribeToNotifications(user.id, callbacks)

    // Cleanup na desmontagem
    return () => {
      realtimeService.unsubscribeFromNotifications(user.id)
    }
  }, [user?.id, showToast])

  // Carregar dados iniciais
  useEffect(() => {
    if (user?.id) {
      loadNotifications()
      loadUnreadCount()
    }
  }, [user?.id, state.filter])

  // Recarregar quando filtros mudarem
  useEffect(() => {
    if (user?.id) {
      loadNotifications()
    }
  }, [state.filter.onlyUnread, state.filter.type])

  const value = {
    ...state,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setFilter,
    clearError
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

/**
 * Hook para usar o contexto de notificações
 */
export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext deve ser usado dentro de NotificationProvider')
  }
  return context
}

export default NotificationContext