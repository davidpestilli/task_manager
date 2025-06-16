import { supabase } from '@/config/supabase'

/**
 * Service para gerenciamento de pessoas nos projetos
 */
export const peopleService = {
  /**
   * Busca todos os membros de um projeto específico
   * @param {string} projectId - ID do projeto
   * @returns {Promise<Array>} Lista de membros do projeto
   */
  async getProjectMembers(projectId) {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            email,
            avatar_url,
            created_at
          )
        `)
        .eq('project_id', projectId)
        .order('joined_at', { ascending: true })

      if (error) throw error
      
      return data.map(member => ({
        ...member.profiles,
        role: member.role,
        joinedAt: member.joined_at
      }))
    } catch (error) {
      console.error('Erro ao buscar membros do projeto:', error)
      throw new Error(`Falha ao carregar membros: ${error.message}`)
    }
  },

  /**
   * Busca detalhes específicos de uma pessoa
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Dados da pessoa
   */
  async getPersonDetails(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao buscar detalhes da pessoa:', error)
      throw new Error(`Falha ao carregar dados da pessoa: ${error.message}`)
    }
  },

  /**
   * Busca tarefas atribuídas a uma pessoa em um projeto específico
   * @param {string} userId - ID do usuário
   * @param {string} projectId - ID do projeto
   * @returns {Promise<Array>} Lista de tarefas da pessoa
   */
  async getPersonTasks(userId, projectId) {
    try {
      const { data, error } = await supabase
        .from('task_assignments')
        .select(`
          task_id,
          assigned_at,
          tasks:task_id (
            id,
            name,
            description,
            status,
            created_at,
            updated_at,
            task_steps (
              id,
              name,
              is_completed,
              step_order
            )
          )
        `)
        .eq('user_id', userId)
        .eq('tasks.project_id', projectId)
        .order('assigned_at', { ascending: false })

      if (error) throw error
      
      return data.map(assignment => {
        const task = assignment.tasks
        const steps = task.task_steps || []
        const completedSteps = steps.filter(step => step.is_completed).length
        const totalSteps = steps.length
        const completionPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

        return {
          id: task.id,
          name: task.name,
          description: task.description,
          status: task.status,
          completionPercentage: Math.round(completionPercentage),
          assignedAt: assignment.assigned_at,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          totalSteps,
          completedSteps
        }
      })
    } catch (error) {
      console.error('Erro ao buscar tarefas da pessoa:', error)
      throw new Error(`Falha ao carregar tarefas: ${error.message}`)
    }
  },

  /**
   * Adiciona uma nova pessoa ao projeto
   * @param {string} projectId - ID do projeto
   * @param {string} email - Email da pessoa
   * @param {string} role - Role da pessoa (default: 'member')
   * @returns {Promise<Object>} Dados da pessoa adicionada
   */
  async addPersonToProject(projectId, email, role = 'member') {
    try {
      // Primeiro, verificar se o usuário existe
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('email', email.toLowerCase())
        .single()

      if (userError && userError.code !== 'PGRST116') {
        throw userError
      }

      // Se usuário não existe, criar convite (para implementação futura)
      if (!existingUser) {
        throw new Error('Usuário não encontrado. Funcionalidade de convite será implementada em breve.')
      }

      // Verificar se já é membro do projeto
      const { data: existingMember, error: memberError } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', existingUser.id)
        .single()

      if (!memberError && existingMember) {
        throw new Error('Esta pessoa já é membro do projeto')
      }

      // Adicionar ao projeto
      const { data, error } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: existingUser.id,
          role
        })
        .select()
        .single()

      if (error) throw error

      return {
        ...existingUser,
        role,
        joinedAt: data.joined_at
      }
    } catch (error) {
      console.error('Erro ao adicionar pessoa ao projeto:', error)
      throw new Error(`Falha ao adicionar pessoa: ${error.message}`)
    }
  },

  /**
   * Remove uma pessoa do projeto
   * @param {string} projectId - ID do projeto
   * @param {string} userId - ID do usuário
   * @returns {Promise<void>}
   */
  async removePersonFromProject(projectId, userId) {
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao remover pessoa do projeto:', error)
      throw new Error(`Falha ao remover pessoa: ${error.message}`)
    }
  },

  /**
   * Atualiza o role de uma pessoa no projeto
   * @param {string} projectId - ID do projeto
   * @param {string} userId - ID do usuário
   * @param {string} newRole - Novo role
   * @returns {Promise<Object>} Dados atualizados
   */
  async updatePersonRole(projectId, userId, newRole) {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .update({ role: newRole })
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao atualizar role da pessoa:', error)
      throw new Error(`Falha ao atualizar role: ${error.message}`)
    }
  },

  /**
   * Busca estatísticas de uma pessoa em um projeto
   * @param {string} userId - ID do usuário
   * @param {string} projectId - ID do projeto
   * @returns {Promise<Object>} Estatísticas da pessoa
   */
  async getPersonStats(userId, projectId) {
    try {
      // Buscar todas as tarefas da pessoa no projeto
      const tasks = await this.getPersonTasks(userId, projectId)
      
      const stats = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(task => task.status === 'concluída').length,
        inProgressTasks: tasks.filter(task => task.status === 'em_andamento').length,
        notStartedTasks: tasks.filter(task => task.status === 'não_iniciada').length,
        pausedTasks: tasks.filter(task => task.status === 'pausada').length,
        averageCompletion: 0,
        tasksWithDependencies: 0
      }

      // Calcular média de conclusão
      if (tasks.length > 0) {
        const totalCompletion = tasks.reduce((sum, task) => sum + task.completionPercentage, 0)
        stats.averageCompletion = Math.round(totalCompletion / tasks.length)
      }

      return stats
    } catch (error) {
      console.error('Erro ao buscar estatísticas da pessoa:', error)
      throw new Error(`Falha ao carregar estatísticas: ${error.message}`)
    }
  },

  /**
   * Busca pessoas disponíveis para adicionar ao projeto
   * @param {string} projectId - ID do projeto
   * @param {string} searchTerm - Termo de busca
   * @returns {Promise<Array>} Lista de pessoas disponíveis
   */
  async searchAvailablePeople(projectId, searchTerm = '') {
    try {
      // Buscar usuários que não são membros do projeto
      const { data: currentMembers } = await supabase
        .from('project_members')
        .select('user_id')
        .eq('project_id', projectId)

      const memberIds = currentMembers?.map(m => m.user_id) || []

      let query = supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')

      if (memberIds.length > 0) {
        query = query.not('id', 'in', `(${memberIds.join(',')})`)
      }

      if (searchTerm.trim()) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query
        .limit(10)
        .order('full_name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar pessoas disponíveis:', error)
      throw new Error(`Falha na busca: ${error.message}`)
    }
  }
}