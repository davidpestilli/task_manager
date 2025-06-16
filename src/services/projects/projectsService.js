import { supabase } from '@/config/supabase'

/**
 * Serviço para operações com projetos
 * Responsável por todas as operações CRUD de projetos
 */
export const projectsService = {
  /**
   * Busca todos os projetos do usuário atual
   * @returns {Promise<Array>} Lista de projetos
   */
  async getProjects() {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members!inner (
            user_id,
            role
          ),
          profiles!projects_owner_id_fkey (
            full_name,
            avatar_url
          ),
          project_members_count:project_members(count),
          tasks_count:tasks(count)
        `)
        .eq('project_members.user_id', user.user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Formatar dados para incluir contadores
      const formattedProjects = data?.map(project => ({
        ...project,
        memberCount: project.project_members_count?.[0]?.count || 0,
        taskCount: project.tasks_count?.[0]?.count || 0,
        owner: project.profiles
      })) || []

      return formattedProjects
    } catch (error) {
      console.error('Erro ao buscar projetos:', error)
      throw new Error('Falha ao carregar projetos')
    }
  },

  /**
   * Busca um projeto específico por ID
   * @param {string} projectId - ID do projeto
   * @returns {Promise<Object>} Dados do projeto
   */
  async getProject(projectId) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!projects_owner_id_fkey (
            id,
            full_name,
            avatar_url,
            email
          ),
          project_members (
            user_id,
            role,
            joined_at,
            profiles (
              id,
              full_name,
              avatar_url,
              email
            )
          )
        `)
        .eq('id', projectId)
        .single()

      if (error) throw error

      return {
        ...data,
        owner: data.profiles,
        members: data.project_members || []
      }
    } catch (error) {
      console.error('Erro ao buscar projeto:', error)
      throw new Error('Projeto não encontrado')
    }
  },

  /**
   * Cria um novo projeto
   * @param {Object} projectData - Dados do projeto
   * @returns {Promise<Object>} Projeto criado
   */
  async createProject(projectData) {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) throw new Error('Usuário não autenticado')

      // Criar projeto
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          description: projectData.description,
          owner_id: user.user.id
        })
        .select()
        .single()

      if (projectError) throw projectError

      // Adicionar criador como membro owner
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: project.id,
          user_id: user.user.id,
          role: 'owner'
        })

      if (memberError) throw memberError

      return project
    } catch (error) {
      console.error('Erro ao criar projeto:', error)
      throw new Error('Falha ao criar projeto')
    }
  },

  /**
   * Atualiza um projeto existente
   * @param {string} projectId - ID do projeto
   * @param {Object} updates - Dados para atualizar
   * @returns {Promise<Object>} Projeto atualizado
   */
  async updateProject(projectId, updates) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error)
      throw new Error('Falha ao atualizar projeto')
    }
  },

  /**
   * Deleta um projeto
   * @param {string} projectId - ID do projeto
   * @returns {Promise<void>}
   */
  async deleteProject(projectId) {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao deletar projeto:', error)
      throw new Error('Falha ao deletar projeto')
    }
  },

  /**
   * Verifica se usuário é owner do projeto
   * @param {string} projectId - ID do projeto
   * @param {string} userId - ID do usuário
   * @returns {Promise<boolean>} True se é owner
   */
  async isProjectOwner(projectId, userId) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('owner_id')
        .eq('id', projectId)
        .single()

      if (error) throw error
      return data.owner_id === userId
    } catch (error) {
      console.error('Erro ao verificar ownership:', error)
      return false
    }
  },

  /**
   * Busca projetos por termo de busca
   * @param {string} searchTerm - Termo para buscar
   * @returns {Promise<Array>} Projetos encontrados
   */
  async searchProjects(searchTerm) {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members!inner (user_id),
          profiles!projects_owner_id_fkey (full_name, avatar_url)
        `)
        .eq('project_members.user_id', user.user.id)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar projetos:', error)
      throw new Error('Falha na busca')
    }
  }
}