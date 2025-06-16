import { supabase } from '@/config/supabase'

/**
 * Serviço para gerenciamento de comentários
 * Inclui funcionalidades para comentários aninhados e operações CRUD
 */
class CommentsService {
  /**
   * Busca comentários de uma tarefa com aninhamento
   * @param {string} taskId - ID da tarefa
   * @returns {Promise<Array>} Lista de comentários organizados hierarquicamente
   */
  async getTaskComments(taskId) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          parent_comment_id,
          user_id,
          task_id,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            email
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Organizar comentários em estrutura hierárquica
      return this.organizeCommentsHierarchy(data || [])
    } catch (error) {
      console.error('Erro ao buscar comentários:', error)
      throw new Error('Falha ao carregar comentários')
    }
  }

  /**
   * Organiza comentários em estrutura hierárquica
   * @param {Array} comments - Lista plana de comentários
   * @returns {Array} Comentários organizados hierarquicamente
   */
  organizeCommentsHierarchy(comments) {
    const commentMap = {}
    const rootComments = []

    // Criar mapa de comentários
    comments.forEach(comment => {
      commentMap[comment.id] = {
        ...comment,
        replies: []
      }
    })

    // Organizar hierarquia
    comments.forEach(comment => {
      if (comment.parent_comment_id) {
        // É uma resposta
        const parent = commentMap[comment.parent_comment_id]
        if (parent) {
          parent.replies.push(commentMap[comment.id])
        }
      } else {
        // É um comentário raiz
        rootComments.push(commentMap[comment.id])
      }
    })

    return rootComments
  }

  /**
   * Cria um novo comentário
   * @param {Object} commentData - Dados do comentário
   * @returns {Promise<Object>} Comentário criado
   */
  async createComment(commentData) {
    try {
      const { data: currentUser } = await supabase.auth.getUser()
      if (!currentUser?.user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: commentData.content,
          task_id: commentData.taskId,
          user_id: currentUser.user.id,
          parent_comment_id: commentData.parentCommentId || null
        })
        .select(`
          id,
          content,
          created_at,
          parent_comment_id,
          user_id,
          task_id,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            email
          )
        `)
        .single()

      if (error) throw error

      // Registrar atividade
      await this.logCommentActivity(data.id, 'comment_added', currentUser.user.id)

      return data
    } catch (error) {
      console.error('Erro ao criar comentário:', error)
      throw new Error('Falha ao criar comentário')
    }
  }

  /**
   * Atualiza um comentário existente
   * @param {string} commentId - ID do comentário
   * @param {string} content - Novo conteúdo
   * @returns {Promise<Object>} Comentário atualizado
   */
  async updateComment(commentId, content) {
    try {
      const { data: currentUser } = await supabase.auth.getUser()
      if (!currentUser?.user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('comments')
        .update({ 
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', currentUser.user.id) // Apenas o autor pode editar
        .select(`
          id,
          content,
          created_at,
          parent_comment_id,
          user_id,
          task_id,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            email
          )
        `)
        .single()

      if (error) throw error

      // Registrar atividade
      await this.logCommentActivity(commentId, 'comment_updated', currentUser.user.id)

      return data
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error)
      throw new Error('Falha ao atualizar comentário')
    }
  }

  /**
   * Remove um comentário
   * @param {string} commentId - ID do comentário
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async deleteComment(commentId) {
    try {
      const { data: currentUser } = await supabase.auth.getUser()
      if (!currentUser?.user) {
        throw new Error('Usuário não autenticado')
      }

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', currentUser.user.id) // Apenas o autor pode deletar

      if (error) throw error

      // Registrar atividade
      await this.logCommentActivity(commentId, 'comment_deleted', currentUser.user.id)

      return true
    } catch (error) {
      console.error('Erro ao deletar comentário:', error)
      throw new Error('Falha ao deletar comentário')
    }
  }

  /**
   * Busca respostas de um comentário específico
   * @param {string} parentCommentId - ID do comentário pai
   * @returns {Promise<Array>} Lista de respostas
   */
  async getCommentReplies(parentCommentId) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          parent_comment_id,
          user_id,
          task_id,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            email
          )
        `)
        .eq('parent_comment_id', parentCommentId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar respostas:', error)
      throw new Error('Falha ao carregar respostas')
    }
  }

  /**
   * Conta total de comentários de uma tarefa
   * @param {string} taskId - ID da tarefa
   * @returns {Promise<number>} Número total de comentários
   */
  async getCommentsCount(taskId) {
    try {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('task_id', taskId)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Erro ao contar comentários:', error)
      return 0
    }
  }

  /**
   * Registra atividade relacionada a comentário
   * @param {string} commentId - ID do comentário
   * @param {string} action - Ação realizada
   * @param {string} userId - ID do usuário
   */
  async logCommentActivity(commentId, action, userId) {
    try {
      // Buscar informações do comentário para contexto
      const { data: comment } = await supabase
        .from('comments')
        .select('task_id, content')
        .eq('id', commentId)
        .single()

      if (comment) {
        await supabase
          .from('activity_log')
          .insert({
            user_id: userId,
            task_id: comment.task_id,
            action,
            details: {
              comment_id: commentId,
              comment_preview: comment.content.substring(0, 100)
            }
          })
      }
    } catch (error) {
      console.error('Erro ao registrar atividade do comentário:', error)
      // Não propagar erro para não afetar operação principal
    }
  }

  /**
   * Busca comentários recentes do usuário
   * @param {string} userId - ID do usuário
   * @param {number} limit - Limite de resultados
   * @returns {Promise<Array>} Comentários recentes
   */
  async getUserRecentComments(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          task_id,
          tasks (
            id,
            name,
            project_id,
            projects (
              id,
              name
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar comentários recentes:', error)
      return []
    }
  }
}

export const commentsService = new CommentsService()
export default commentsService