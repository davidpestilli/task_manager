import { supabase } from '@/config/supabase'
import { NOTIFICATION_DISPLAY_CONFIG } from '@/types/notification'

/**
 * Serviço para gerenciar conexões em tempo real via Supabase Realtime
 */
class RealtimeService {
  constructor() {
    this.channels = new Map()
    this.subscribers = new Map()
  }

  /**
   * Conectar ao canal de notificações do usuário
   */
  subscribeToNotifications(userId, callbacks = {}) {
    const channelName = `notifications:${userId}`
    
    // Se já existe um canal para este usuário, desconectar primeiro
    if (this.channels.has(channelName)) {
      this.unsubscribeFromNotifications(userId)
    }

    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'task_manager',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            const notification = payload.new
            this._handleNewNotification(notification, callbacks)
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'task_manager',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            const notification = payload.new
            this._handleNotificationUpdate(notification, callbacks)
          }
        )
        .subscribe((status) => {
          console.log(`Canal de notificações ${channelName}: ${status}`)
          
          if (status === 'SUBSCRIBED') {
            callbacks.onConnected?.()
          } else if (status === 'CHANNEL_ERROR') {
            callbacks.onError?.('Erro na conexão do canal')
          } else if (status === 'TIMED_OUT') {
            callbacks.onError?.('Conexão expirou')
          }
        })

      this.channels.set(channelName, channel)
      this.subscribers.set(channelName, callbacks)

      return channel
    } catch (error) {
      console.error('Erro ao conectar ao canal de notificações:', error)
      callbacks.onError?.(error.message)
      return null
    }
  }

  /**
   * Desconectar do canal de notificações
   */
  unsubscribeFromNotifications(userId) {
    const channelName = `notifications:${userId}`
    const channel = this.channels.get(channelName)

    if (channel) {
      supabase.removeChannel(channel)
      this.channels.delete(channelName)
      this.subscribers.delete(channelName)
      console.log(`Desconectado do canal: ${channelName}`)
    }
  }

  /**
   * Conectar ao canal de atividades do projeto
   */
  subscribeToProjectActivities(projectId, callbacks = {}) {
    const channelName = `project_activities:${projectId}`
    
    if (this.channels.has(channelName)) {
      this.unsubscribeFromProjectActivities(projectId)
    }

    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'task_manager',
            table: 'tasks',
            filter: `project_id=eq.${projectId}`
          },
          (payload) => {
            this._handleTaskActivity(payload, callbacks)
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'task_manager',
            table: 'task_steps',
          },
          (payload) => {
            // Verificar se a etapa pertence a uma tarefa do projeto
            this._handleTaskStepActivity(payload, projectId, callbacks)
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'task_manager',
            table: 'comments',
          },
          (payload) => {
            // Verificar se o comentário pertence a uma tarefa do projeto
            this._handleCommentActivity(payload, projectId, callbacks)
          }
        )
        .subscribe((status) => {
          console.log(`Canal de atividades do projeto ${channelName}: ${status}`)
          
          if (status === 'SUBSCRIBED') {
            callbacks.onConnected?.()
          } else if (status === 'CHANNEL_ERROR') {
            callbacks.onError?.('Erro na conexão do canal de atividades')
          }
        })

      this.channels.set(channelName, channel)
      this.subscribers.set(channelName, callbacks)

      return channel
    } catch (error) {
      console.error('Erro ao conectar ao canal de atividades:', error)
      callbacks.onError?.(error.message)
      return null
    }
  }

  /**
   * Desconectar do canal de atividades do projeto
   */
  unsubscribeFromProjectActivities(projectId) {
    const channelName = `project_activities:${projectId}`
    const channel = this.channels.get(channelName)

    if (channel) {
      supabase.removeChannel(channel)
      this.channels.delete(channelName)
      this.subscribers.delete(channelName)
      console.log(`Desconectado do canal: ${channelName}`)
    }
  }

  /**
   * Verificar status da conexão
   */
  getConnectionStatus() {
    return {
      connected: this.channels.size > 0,
      activeChannels: Array.from(this.channels.keys()),
      totalChannels: this.channels.size
    }
  }

  /**
   * Desconectar de todos os canais
   */
  disconnectAll() {
    for (const [channelName, channel] of this.channels) {
      supabase.removeChannel(channel)
      console.log(`Desconectado do canal: ${channelName}`)
    }
    
    this.channels.clear()
    this.subscribers.clear()
  }

  /**
   * Processar nova notificação recebida em tempo real
   */
  _handleNewNotification(notification, callbacks) {
    try {
      // Buscar configuração de exibição
      const displayConfig = NOTIFICATION_DISPLAY_CONFIG[notification.type] || {}
      
      // Chamar callback de nova notificação
      callbacks.onNewNotification?.(notification)
      
      // Mostrar toast se configurado
      if (displayConfig.showToast) {
        callbacks.onShowToast?.({
          type: 'info',
          title: notification.title,
          message: notification.message,
          icon: displayConfig.icon
        })
      }
      
      // Tocar som se configurado
      if (displayConfig.playSound) {
        this._playNotificationSound()
      }
      
      // Atualizar badge de contador
      callbacks.onUnreadCountChanged?.()
      
    } catch (error) {
      console.error('Erro ao processar nova notificação:', error)
    }
  }

  /**
   * Processar atualização de notificação
   */
  _handleNotificationUpdate(notification, callbacks) {
    try {
      callbacks.onNotificationUpdated?.(notification)
      
      // Se foi marcada como lida, atualizar contador
      if (notification.is_read) {
        callbacks.onUnreadCountChanged?.()
      }
    } catch (error) {
      console.error('Erro ao processar atualização de notificação:', error)
    }
  }

  /**
   * Processar atividade de tarefa
   */
  _handleTaskActivity(payload, callbacks) {
    try {
      const { eventType, new: newRecord, old: oldRecord } = payload
      
      callbacks.onTaskActivity?.({
        type: eventType,
        task: newRecord || oldRecord,
        changes: this._getChanges(oldRecord, newRecord)
      })
    } catch (error) {
      console.error('Erro ao processar atividade de tarefa:', error)
    }
  }

  /**
   * Processar atividade de etapa de tarefa
   */
  async _handleTaskStepActivity(payload, projectId, callbacks) {
    try {
      const { eventType, new: newRecord, old: oldRecord } = payload
      const step = newRecord || oldRecord
      
      // Verificar se a etapa pertence ao projeto
      const { data: task } = await supabase
        .from('tasks')
        .select('project_id')
        .eq('id', step.task_id)
        .single()
      
      if (task?.project_id === projectId) {
        callbacks.onTaskStepActivity?.({
          type: eventType,
          step,
          changes: this._getChanges(oldRecord, newRecord)
        })
      }
    } catch (error) {
      console.error('Erro ao processar atividade de etapa:', error)
    }
  }

  /**
   * Processar atividade de comentário
   */
  async _handleCommentActivity(payload, projectId, callbacks) {
    try {
      const { eventType, new: newRecord, old: oldRecord } = payload
      const comment = newRecord || oldRecord
      
      // Verificar se o comentário pertence ao projeto
      const { data: task } = await supabase
        .from('tasks')
        .select('project_id')
        .eq('id', comment.task_id)
        .single()
      
      if (task?.project_id === projectId) {
        callbacks.onCommentActivity?.({
          type: eventType,
          comment,
          changes: this._getChanges(oldRecord, newRecord)
        })
      }
    } catch (error) {
      console.error('Erro ao processar atividade de comentário:', error)
    }
  }

  /**
   * Calcular mudanças entre registros antigo e novo
   */
  _getChanges(oldRecord, newRecord) {
    if (!oldRecord || !newRecord) return {}
    
    const changes = {}
    
    for (const key in newRecord) {
      if (oldRecord[key] !== newRecord[key]) {
        changes[key] = {
          from: oldRecord[key],
          to: newRecord[key]
        }
      }
    }
    
    return changes
  }

  /**
   * Tocar som de notificação
   */
  _playNotificationSound() {
    try {
      // Som sutil para notificações
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+jyvmoeRJva5sdqGjzFvhUzMT2t0/LWaB05Xp+x59aBKQQOdMfz35BTF'
      )
      audio.volume = 0.3
      audio.play().catch(() => {
        // Ignorar erro se não conseguir tocar
      })
    } catch (error) {
      // Som não é crítico, apenas ignorar erros
    }
  }
}

export const realtimeService = new RealtimeService()
export default realtimeService