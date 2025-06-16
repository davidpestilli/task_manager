import { supabase } from '@/config/supabase'

/**
 * Serviço para operações com membros de projetos
 * Responsável por gerenciar usuários dentro dos projetos
 */
export const projectMembersService = {
  /**
   * Busca todos os membros de um projeto
   * @param {string} projectId - ID do projeto
   * @returns {Promise<Array>} Lista de membros
   */
  async getProjectMembers(projectId) {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url,
            email
          )
        `)
        .eq('project_id', projectId)
        .order('joined_at', { ascending: true })

      if (error) throw error

      return data?.map(member => ({
        ...member,
        user: member.profiles
      })) || []
    } catch (error) {
      console.error('Erro ao buscar membros:', error)
      throw new Error('Falha ao carregar membros')
    }
  },

  /**
   * Adiciona um membro ao projeto
   * @param {string} projectId - ID do projeto
   * @param {string} userEmail - Email do usuário
   * @param {string} role - Role do usuário (member, admin)
   * @returns {Promise<Object>} Membro adicionado
   */
  async addProjectMember(projectId, userEmail, role = 'member') {
    try {
      // Primeiro, buscar o usuário pelo email
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('email', userEmail)
        .single()

      if (userError || !user) {
        throw new Error('Usuário não encontrado')
      }

      // Verificar se já é membro
      const { data: existingMember } = await supabase
        .from('project_members')
        .select('user_id')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single()

      if (existingMember) {
        throw new Error('Usuário já é membro do projeto')
      }

      // Adicionar como membro
      const { data: member, error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: user.id,
          role
        })
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url,
            email
          )
        `)
        .single()

      if (memberError) throw memberError

      return {
        ...member,
        user: member.profiles
      }
    } catch (error) {
      console.error('Erro ao adicionar membro:', error)
      throw new Error(error.message || 'Falha ao adicionar membro')
    }
  },

  /**
   * Remove um membro do projeto
   * @param {string} projectId - ID do projeto
   * @param {string} userId - ID do usuário
   * @returns {Promise<void>}
   */
  async removeProjectMember(projectId, userId) {
    try {
      // Verificar se não é o owner
      const { data: project } = await supabase
        .from('projects')
        .select('owner_id')
        .eq('id', projectId)
        .single()

      if (project?.owner_id === userId) {
        throw new Error('Não é possível remover o owner do projeto')
      }

      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao remover membro:', error)
      throw new Error(error.message || 'Falha ao remover membro')
    }
  },

  /**
   * Atualiza o role de um membro
   * @param {string} projectId - ID do projeto
   * @param {string} userId - ID do usuário
   * @param {string} newRole - Novo role
   * @returns {Promise<Object>} Membro atualizado
   */
  async updateMemberRole(projectId, userId, newRole) {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .update({ role: newRole })
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url,
            email
          )
        `)
        .single()

      if (error) throw error

      return {
        ...data,
        user: data.profiles
      }
    } catch (error) {
      console.error('Erro ao atualizar role:', error)
      throw new Error('Falha ao atualizar permissões')
    }
  },

  /**
   * Verifica se usuário é membro de um projeto
   * @param {string} projectId - ID do projeto
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object|null>} Dados do membro ou null
   */
  async getUserMembership(projectId, userId) {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select('role, joined_at')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Erro ao verificar membership:', error)
      return null
    }
  },

  /**
   * Busca projetos onde usuário é membro
   * @param {string} userId - ID do usuário
   * @returns {Promise<Array>} Lista de projetos
   */
  async getUserProjects(userId) {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          role,
          joined_at,
          projects (
            *,
            profiles!projects_owner_id_fkey (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false })

      if (error) throw error

      return data?.map(item => ({
        ...item.projects,
        userRole: item.role,
        joinedAt: item.joined_at,
        owner: item.projects.profiles
      })) || []
    } catch (error) {
      console.error('Erro ao buscar projetos do usuário:', error)
      throw new Error('Falha ao carregar projetos')
    }
  },

  /**
   * Convida usuário para projeto via email
   * @param {string} projectId - ID do projeto
   * @param {string} userEmail - Email do usuário
   * @returns {Promise<Object>} Resultado do convite
   */
  async inviteUserByEmail(projectId, userEmail) {
    try {
      // Verificar se usuário existe
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('email', userEmail)
        .single()

      if (existingUser) {
        // Se existe, adicionar diretamente
        return await this.addProjectMember(projectId, userEmail)
      } else {
        // TODO: Implementar sistema de convites por email
        // Por enquanto, retornar erro
        throw new Error('Usuário não encontrado. Sistema de convites será implementado em breve.')
      }
    } catch (error) {
      console.error('Erro ao convidar usuário:', error)
      throw new Error(error.message || 'Falha ao enviar convite')
    }
  }
}