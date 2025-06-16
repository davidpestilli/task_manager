import { supabase } from '@/config/supabase'
import { 
  NOTIFICATION_TYPES, 
  NOTIFICATION_TEMPLATES,
  createNotification 
} from '@/types/notification'

/**
 * Serviço para gerenciar notificações
 */
class NotificationsService {
  /**
   * Buscar notificações do usuário
   */
  async getUserNotifications(userId, { limit = 10, offset = 0, onlyUnread = false } = {}) {
    try {
      let query = supabase
        .from('notifications')
        .select(`
          *,
          triggered_by_profile:triggered_by(
            id,
            full_name,
            avatar_url
          ),
          task:tasks(
            id,
            name,
            project_id
          ),
          project:projects(
            id,
            name
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (onlyUnread) {
        query = query.eq('is_read', false)
      }

      if (limit) {
        query = query.range(offset, offset + limit - 1)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        notifications: data || [],
        success: true
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
      return {
        notifications: [],
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Contar notificações não lidas
   */
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error

      return {
        count: count || 0,
        success: true
      }
    } catch (error) {
      console.error('Erro ao contar notificações não lidas:', error)
      return {
        count: 0,
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Marcar notificação como lida
   */
  async markAsRead(notificationId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()

      if (error) throw error

      return {
        notification: data?.[0],
        success: true
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Marcar todas as notificações como lidas
   */
  async markAllAsRead(userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select()

      if (error) throw error

      return {
        updated: data?.length || 0,
        success: true
      }
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Criar nova notificação
   */
  async createNotification({ 
    type, 
    userId, 
    taskId = null, 
    projectId = null, 
    triggeredBy = null,
    data = {} 
  }) {
    try {
      // Buscar dados necessários para construir a mensagem
      const notificationData = await this._buildNotificationData(type, taskId, projectId, data)
      
      if (!notificationData) {
        throw new Error('Não foi possível construir os dados da notificação')
      }

      const template = NOTIFICATION_TEMPLATES[type]
      if (!template) {
        throw new Error(`Template não encontrado para o tipo: ${type}`)
      }

      const notification = createNotification({
        type,
        title: template.title,
        message: template.getMessage(notificationData),
        userId,
        taskId,
        projectId,
        triggeredBy
      })

      const { data: insertedData, error } = await supabase
        .from('notifications')
        .insert([{
          type: notification.type,
          title: notification.title,
          message: notification.message,
          user_id: notification.userId,
          task_id: notification.taskId,
          project_id: notification.projectId,
          triggered_by: notification.triggeredBy,
          is_read: false
        }])
        .select()

      if (error) throw error

      return {
        notification: insertedData?.[0],
        success: true
      }
    } catch (error) {
      console.error('Erro ao criar notificação:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Criar notificações em lote para múltiplos usuários
   */
  async createBulkNotifications({ type, userIds, taskId = null, projectId = null, triggeredBy = null, data = {} }) {
    try {
      const results = await Promise.allSettled(
        userIds.map(userId => 
          this.createNotification({ type, userId, taskId, projectId, triggeredBy, data })
        )
      )

      const successful = results.filter(result => result.status === 'fulfilled' && result.value.success)
      const failed = results.filter(result => result.status === 'rejected' || !result.value.success)

      return {
        successful: successful.length,
        failed: failed.length,
        success: true
      }
    } catch (error) {
      console.error('Erro ao criar notificações em lote:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Deletar notificação
   */
  async deleteNotification(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Erro ao deletar notificação:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Limpar notificações antigas (mais de 30 dias)
   */
  async cleanupOldNotifications(userId, daysOld = 30) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .lt('created_at', cutoffDate.toISOString())
        .select('id')

      if (error) throw error

      return {
        deleted: data?.length || 0,
        success: true
      }
    } catch (error) {
      console.error('Erro ao limpar notificações antigas:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Construir dados para a notificação baseado no tipo
   */
  async _buildNotificationData(type, taskId, projectId, extraData = {}) {
    try {
      const data = { ...extraData }

      // Buscar dados da tarefa se necessário
      if (taskId) {
        const { data: task } = await supabase
          .from('tasks')
          .select(`
            id,
            name,
            project:projects(name)
          `)
          .eq('id', taskId)
          .single()

        if (task) {
          data.taskName = task.name
          data.projectName = task.project?.name
        }
      }

      // Buscar dados do projeto se necessário  
      if (projectId && !data.projectName) {
        const { data: project } = await supabase
          .from('projects')
          .select('name')
          .eq('id', projectId)
          .single()

        if (project) {
          data.projectName = project.name
        }
      }

      return data
    } catch (error) {
      console.error('Erro ao construir dados da notificação:', error)
      return null
    }
  }
}

export const notificationsService = new NotificationsService()
export default notificationsService