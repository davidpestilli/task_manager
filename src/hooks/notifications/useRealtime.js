import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/auth'
import { useProject } from '@/hooks/projects'
import { realtimeService } from '@/services/notifications'
import { useToast } from '@/hooks/shared'

/**
 * Hook para gerenciar conexões em tempo real
 */
export function useRealtime(options = {}) {
  const { user } = useAuth()
  const { currentProject } = useProject()
  const { showToast } = useToast()
  
  const {
    enableNotifications = true,
    enableProjectActivities = true,
    onNewNotification,
    onTaskActivity,
    onCommentActivity,
    onTaskStepActivity
  } = options

  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    activeChannels: [],
    totalChannels: 0
  })

  // Refs para callbacks para evitar re-renders desnecessários
  const callbacksRef = useRef({
    onNewNotification,
    onTaskActivity,
    onCommentActivity,
    onTaskStepActivity
  })

  // Atualizar callbacks
  useEffect(() => {
    callbacksRef.current = {
      onNewNotification,
      onTaskActivity,
      onCommentActivity,
      onTaskStepActivity
    }
  }, [onNewNotification, onTaskActivity, onCommentActivity, onTaskStepActivity])

  /**
   * Conectar ao canal de notificações
   */
  const connectToNotifications = useCallback(() => {
    if (!user?.id || !enableNotifications) return

    const callbacks = {
      onConnected: () => {
        console.log('Conectado ao canal de notificações')
        updateConnectionStatus()
      },

      onNewNotification: (notification) => {
        callbacksRef.current.onNewNotification?.(notification)
      },

      onNotificationUpdated: (notification) => {
        // Callback para notificação atualizada
      },

      onUnreadCountChanged: () => {
        // Callback para mudança no contador
      },

      onShowToast: ({ type, title, message, icon }) => {
        showToast(message, { 
          type, 
          title: `${icon} ${title}`,
          duration: 5000
        })
      },

      onError: (error) => {
        console.error('Erro no canal de notificações:', error)
        showToast('Erro na conexão de notificações', { type: 'error' })
      }
    }

    realtimeService.subscribeToNotifications(user.id, callbacks)
  }, [user?.id, enableNotifications, showToast])

  /**
   * Conectar ao canal de atividades do projeto
   */
  const connectToProjectActivities = useCallback(() => {
    if (!currentProject?.id || !enableProjectActivities) return

    const callbacks = {
      onConnected: () => {
        console.log(`Conectado às atividades do projeto: ${currentProject.name}`)
        updateConnectionStatus()
      },

      onTaskActivity: (activity) => {
        callbacksRef.current.onTaskActivity?.(activity)
        
        // Toast para atividades importantes
        if (activity.type === 'UPDATE' && activity.changes?.status) {
          const statusMessages = {
            'concluída': '✅ Tarefa concluída',
            'em_andamento': '🔄 Tarefa iniciada',
            'pausada': '⏸️ Tarefa pausada'
          }
          
          const message = statusMessages[activity.changes.status.to]
          if (message) {
            showToast(`${message}: ${activity.task.name}`, { type: 'info' })
          }
        }
      },

      onTaskStepActivity: (activity) => {
        callbacksRef.current.onTaskStepActivity?.(activity)
        
        // Toast para etapas concluídas
        if (activity.type === 'UPDATE' && activity.changes?.is_completed?.to === true) {
          showToast(`✅ Etapa concluída: ${activity.step.name}`, { type: 'success' })
        }
      },

      onCommentActivity: (activity) => {
        callbacksRef.current.onCommentActivity?.(activity)
        
        // Toast para novos comentários
        if (activity.type === 'INSERT') {
          showToast(`💬 Novo comentário adicionado`, { type: 'info' })
        }
      },

      onError: (error) => {
        console.error('Erro no canal de atividades:', error)
        showToast('Erro na conexão de atividades', { type: 'error' })
      }
    }

    realtimeService.subscribeToProjectActivities(currentProject.id, callbacks)
  }, [currentProject?.id, enableProjectActivities, showToast])

  /**
   * Atualizar status da conexão
   */
  const updateConnectionStatus = useCallback(() => {
    const status = realtimeService.getConnectionStatus()
    setConnectionStatus(status)
  }, [])

  /**
   * Desconectar de todos os canais
   */
  const disconnectAll = useCallback(() => {
    realtimeService.disconnectAll()
    setConnectionStatus({
      connected: false,
      activeChannels: [],
      totalChannels: 0
    })
  }, [])

  /**
   * Reconectar todos os canais
   */
  const reconnectAll = useCallback(() => {
    disconnectAll()
    setTimeout(() => {
      connectToNotifications()
      connectToProjectActivities()
    }, 1000)
  }, [connectToNotifications, connectToProjectActivities, disconnectAll])

  /**
   * Verificar se está conectado a um tipo específico de canal
   */
  const isConnectedTo = useCallback((channelType) => {
    return connectionStatus.activeChannels.some(channel => 
      channel.includes(channelType)
    )
  }, [connectionStatus.activeChannels])

  // Conectar quando usuário faz login
  useEffect(() => {
    if (user?.id && enableNotifications) {
      connectToNotifications()
    }

    return () => {
      if (user?.id) {
        realtimeService.unsubscribeFromNotifications(user.id)
      }
    }
  }, [user?.id, enableNotifications, connectToNotifications])

  // Conectar/desconectar atividades do projeto
  useEffect(() => {
    if (currentProject?.id && enableProjectActivities) {
      connectToProjectActivities()
    }

    return () => {
      if (currentProject?.id) {
        realtimeService.unsubscribeFromProjectActivities(currentProject.id)
      }
    }
  }, [currentProject?.id, enableProjectActivities, connectToProjectActivities])

  // Atualizar status periodicamente
  useEffect(() => {
    const interval = setInterval(updateConnectionStatus, 10000) // A cada 10 segundos
    return () => clearInterval(interval)
  }, [updateConnectionStatus])

  // Cleanup geral na desmontagem
  useEffect(() => {
    return () => {
      disconnectAll()
    }
  }, [disconnectAll])

  return {
    // Status da conexão
    connectionStatus,
    isConnected: connectionStatus.connected,
    activeChannels: connectionStatus.activeChannels,
    totalChannels: connectionStatus.totalChannels,
    
    // Verificações específicas
    isConnectedToNotifications: isConnectedTo('notifications'),
    isConnectedToProjectActivities: isConnectedTo('project_activities'),
    
    // Ações
    disconnectAll,
    reconnectAll,
    connectToNotifications,
    connectToProjectActivities,
    
    // Utilidades
    isConnectedTo
  }
}

export default useRealtime