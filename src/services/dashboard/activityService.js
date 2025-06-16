import { supabase } from '@/config/supabase'

/**
 * Serviço para gerenciamento de log de atividades
 * Rastreia todas as ações realizadas pelos usuários no sistema
 */
class ActivityService {
  /**
   * Registra uma nova atividade no log
   * @param {Object} activityData - Dados da atividade
   * @returns {Promise<Object>} Atividade registrada
   */
  async logActivity(activityData) {
    try {
      const { data: currentUser } = await supabase.auth.getUser()
      if (!currentUser?.user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('activity_log')
        .insert({
          user_id: currentUser.user.id,
          task_id: activityData.taskId || null,
          project_id: activityData.projectId || null,
          action: activityData.action,
          details: activityData.details || {}
        })
        .select(`
          id,
          action,
          details,
          timestamp,
          user_id,
          task_id,
          project_id,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            email
          ),
          tasks (
            id,
            name
          ),
          projects (
            id,
            name
          )
        `)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao registrar atividade:', error)
      // Não propagar erro para não afetar operação principal
      return null
    }
  }

  /**
   * Busca atividades de um usuário específico
   * @param {string} userId - ID do usuário
   * @param {Object} options - Opções de busca
   * @returns {Promise<Array>} Lista de atividades
   */
  async getUserActivities(userId, options = {}) {
    try {
      const { 
        limit = 50, 
        offset = 0, 
        projectId = null,
        taskId = null,
        startDate = null,
        endDate = null
      } = options

      let query = supabase
        .from('activity_log')
        .select(`
          id,
          action,
          details,
          timestamp,
          user_id,
          task_id,
          project_id,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            email
          ),
          tasks (
            id,
            name
          ),
          projects (
            id,
            name
          )
        `)
        .eq('user_id', userId)

      // Filtros opcionais
      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      if (taskId) {
        query = query.eq('task_id', taskId)
      }

      if (startDate) {
        query = query.gte('timestamp', startDate)
      }

      if (endDate) {
        query = query.lte('timestamp', endDate)
      }

      const { data, error } = await query
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar atividades do usuário:', error)
      return []
    }
  }

  /**
   * Busca atividades de um projeto
   * @param {string} projectId - ID do projeto
   * @param {Object} options - Opções de busca
   * @returns {Promise<Array>} Lista de atividades do projeto
   */
  async getProjectActivities(projectId, options = {}) {
    try {
      const { 
        limit = 50, 
        offset = 0,
        userId = null,
        startDate = null,
        endDate = null
      } = options

      let query = supabase
        .from('activity_log')
        .select(`
          id,
          action,
          details,
          timestamp,
          user_id,
          task_id,
          project_id,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            email
          ),
          tasks (
            id,
            name
          ),
          projects (
            id,
            name
          )
        `)
        .eq('project_id', projectId)

      // Filtros opcionais
      if (userId) {
        query = query.eq('user_id', userId)
      }

      if (startDate) {
        query = query.gte('timestamp', startDate)
      }

      if (endDate) {
        query = query.lte('timestamp', endDate)
      }

      const { data, error } = await query
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar atividades do projeto:', error)
      return []
    }
  }

  /**
   * Busca atividades de uma tarefa específica
   * @param {string} taskId - ID da tarefa
   * @param {Object} options - Opções de busca
   * @returns {Promise<Array>} Lista de atividades da tarefa
   */
  async getTaskActivities(taskId, options = {}) {
    try {
      const { limit = 50, offset = 0 } = options

      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          id,
          action,
          details,
          timestamp,
          user_id,
          task_id,
          project_id,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            email
          ),
          tasks (
            id,
            name
          ),
          projects (
            id,
            name
          )
        `)
        .eq('task_id', taskId)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar atividades da tarefa:', error)
      return []
    }
  }

  /**
   * Busca atividades recentes do sistema
   * @param {Object} options - Opções de busca
   * @returns {Promise<Array>} Lista de atividades recentes
   */
  async getRecentActivities(options = {}) {
    try {
      const { limit = 20, projectIds = [] } = options

      let query = supabase
        .from('activity_log')
        .select(`
          id,
          action,
          details,
          timestamp,
          user_id,
          task_id,
          project_id,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            email
          ),
          tasks (
            id,
            name
          ),
          projects (
            id,
            name
          )
        `)

      // Filtrar por projetos específicos se fornecido
      if (projectIds.length > 0) {
        query = query.in('project_id', projectIds)
      }

      const { data, error } = await query
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error)
      return []
    }
  }

  /**
   * Busca estatísticas de atividades de um usuário
   * @param {string} userId - ID do usuário
   * @param {Object} options - Opções de busca
   * @returns {Promise<Object>} Estatísticas de atividades
   */
  async getUserActivityStats(userId, options = {}) {
    try {
      const { 
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
        endDate = new Date()
      } = options

      const { data, error } = await supabase
        .from('activity_log')
        .select('action, timestamp')
        .eq('user_id', userId)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())

      if (error) throw error

      const activities = data || []
      
      // Calcular estatísticas
      const stats = {
        total: activities.length,
        byAction: {},
        byDay: {},
        mostActiveDay: null,
        averagePerDay: 0
      }

      // Agrupar por ação
      activities.forEach(activity => {
        stats.byAction[activity.action] = (stats.byAction[activity.action] || 0) + 1
      })

      // Agrupar por dia
      activities.forEach(activity => {
        const day = new Date(activity.timestamp).toDateString()
        stats.byDay[day] = (stats.byDay[day] || 0) + 1
      })

      // Encontrar dia mais ativo
      const daysSorted = Object.entries(stats.byDay)
        .sort(([,a], [,b]) => b - a)
      
      if (daysSorted.length > 0) {
        stats.mostActiveDay = {
          date: daysSorted[0][0],
          count: daysSorted[0][1]
        }
      }

      // Calcular média por dia
      const dayCount = Object.keys(stats.byDay).length
      stats.averagePerDay = dayCount > 0 ? Math.round(stats.total / dayCount * 10) / 10 : 0

      return stats
    } catch (error) {
      console.error('Erro ao buscar estatísticas de atividades:', error)
      return {
        total: 0,
        byAction: {},
        byDay: {},
        mostActiveDay: null,
        averagePerDay: 0
      }
    }
  }

  /**
   * Formata ação para exibição
   * @param {string} action - Ação a ser formatada
   * @param {Object} details - Detalhes da ação
   * @returns {string} Ação formatada
   */
  formatAction(action, details = {}) {
    const actionMap = {
      'task_created': 'criou a tarefa',
      'task_updated': 'atualizou a tarefa',
      'task_completed': 'concluiu a tarefa',
      'task_assigned': 'foi atribuído à tarefa',
      'task_unassigned': 'foi removido da tarefa',
      'step_completed': 'concluiu uma etapa',
      'step_uncompleted': 'desmarcou uma etapa',
      'comment_added': 'comentou na tarefa',
      'comment_updated': 'editou um comentário',
      'comment_deleted': 'removeu um comentário',
      'dependency_added': 'adicionou dependência',
      'dependency_removed': 'removeu dependência',
      'project_created': 'criou o projeto',
      'project_updated': 'atualizou o projeto',
      'member_added': 'adicionou membro ao projeto',
      'member_removed': 'removeu membro do projeto'
    }

    return actionMap[action] || action
  }

  /**
   * Gera timeline de atividades agrupadas por data
   * @param {Array} activities - Lista de atividades
   * @returns {Array} Timeline agrupada por data
   */
  generateActivityTimeline(activities) {
    const grouped = {}

    activities.forEach(activity => {
      const date = new Date(activity.timestamp).toDateString()
      
      if (!grouped[date]) {
        grouped[date] = []
      }
      
      grouped[date].push({
        ...activity,
        formattedAction: this.formatAction(activity.action, activity.details)
      })
    })

    return Object.entries(grouped)
      .map(([date, items]) => ({
        date,
        activities: items,
        count: items.length
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }
}

export const activityService = new ActivityService()
export default activityService