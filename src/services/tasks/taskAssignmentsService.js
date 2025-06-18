import { supabase } from '@/config/supabase'

/**
 * Serviço para operações de atribuições de tarefas
 * Responsável por gerenciar quais usuários estão atribuídos a cada tarefa
 */

/**
 * Atribui um usuário a uma tarefa
 * @param {string} taskId - ID da tarefa
 * @param {string} userId - ID do usuário
 * @param {string} assignedBy - ID do usuário que está fazendo a atribuição
 * @returns {Promise<Object>} Atribuição criada
 */
export const assignTaskToUser = async (taskId, userId, assignedBy) => {
  if (!taskId || !userId || !assignedBy) {
    throw new Error('ID da tarefa, ID do usuário e ID do atribuidor são obrigatórios')
  }

  // Verificar se a atribuição já existe
  const { data: existingAssignment } = await supabase
    .from('task_assignments')
    .select('id')
    .eq('task_id', taskId)
    .eq('user_id', userId)
    .single()

  if (existingAssignment) {
    throw new Error('Usuário já está atribuído a esta tarefa')
  }

  const { data, error } = await supabase
    .from('task_assignments')
    .insert({
      task_id: taskId,
      user_id: userId,
      assigned_by: assignedBy,
      assigned_at: new Date().toISOString()
    })
    .select(`
      *,
      user:profiles!task_assignments_user_id_fkey(
        id,
        full_name,
        avatar_url,
        email
      ),
      assigned_by_profile:profiles!task_assignments_assigned_by_fkey(
        id,
        full_name,
        avatar_url
      ),
      task:tasks(
        id,
        name,
        status
      )
    `)
    .single()

  if (error) {
    console.error('Erro ao atribuir tarefa:', error)
    throw new Error(`Erro ao atribuir tarefa: ${error.message}`)
  }

  return data
}

/**
 * Remove a atribuição de um usuário de uma tarefa
 * @param {string} taskId - ID da tarefa
 * @param {string} userId - ID do usuário
 * @returns {Promise<boolean>} True se removida com sucesso
 */
export const unassignTaskFromUser = async (taskId, userId) => {
  if (!taskId || !userId) {
    throw new Error('ID da tarefa e ID do usuário são obrigatórios')
  }

  const { error } = await supabase
    .from('task_assignments')
    .delete()
    .eq('task_id', taskId)
    .eq('user_id', userId)

  if (error) {
    console.error('Erro ao remover atribuição:', error)
    throw new Error(`Erro ao remover atribuição: ${error.message}`)
  }

  return true
}

/**
 * Busca todas as atribuições de uma tarefa
 * @param {string} taskId - ID da tarefa
 * @returns {Promise<Array>} Lista de atribuições
 */
export const getTaskAssignments = async (taskId) => {
  if (!taskId) {
    throw new Error('ID da tarefa é obrigatório')
  }

  const { data, error } = await supabase
    .from('task_assignments')
    .select(`
      *,
      user:profiles!task_assignments_user_id_fkey(
        id,
        full_name,
        avatar_url,
        email
      ),
      assigned_by_profile:profiles!task_assignments_assigned_by_fkey(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('task_id', taskId)
    .order('assigned_at', { ascending: true })

  if (error) {
    console.error('Erro ao buscar atribuições da tarefa:', error)
    throw new Error(`Erro ao buscar atribuições: ${error.message}`)
  }

  return data || []
}

/**
 * Busca todas as atribuições de um usuário
 * @param {string} userId - ID do usuário
 * @param {Object} options - Opções de filtro
 * @returns {Promise<Array>} Lista de atribuições do usuário
 */
export const getUserTaskAssignments = async (userId, options = {}) => {
  if (!userId) {
    throw new Error('ID do usuário é obrigatório')
  }

  const { 
    projectId = null, 
    includeCompleted = true, 
    limit = null,
    orderBy = 'assigned_at',
    orderDirection = 'desc'
  } = options

  let query = supabase
    .from('task_assignments')
    .select(`
      *,
      task:tasks(
        id,
        name,
        description,
        status,
        created_at,
        updated_at,
        project:projects(
          id,
          name
        ),
        task_steps(
          id,
          name,
          is_completed
        )
      ),
      assigned_by_profile:profiles!task_assignments_assigned_by_fkey(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('user_id', userId)

  // Filtrar por projeto se especificado
  if (projectId) {
    query = query.eq('task.project_id', projectId)
  }

  // Filtrar tarefas completadas se necessário
  if (!includeCompleted) {
    query = query.neq('task.status', 'completed')
  }

  // Ordenação
  query = query.order(orderBy, { ascending: orderDirection === 'asc' })

  // Limite
  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar atribuições do usuário:', error)
    throw new Error(`Erro ao buscar atribuições: ${error.message}`)
  }

  return data || []
}

/**
 * Transfere a atribuição de uma tarefa de um usuário para outro
 * @param {string} taskId - ID da tarefa
 * @param {string} fromUserId - ID do usuário atual
 * @param {string} toUserId - ID do novo usuário
 * @param {string} transferredBy - ID do usuário que está fazendo a transferência
 * @returns {Promise<Object>} Nova atribuição
 */
export const transferTaskAssignment = async (taskId, fromUserId, toUserId, transferredBy) => {
  if (!taskId || !fromUserId || !toUserId || !transferredBy) {
    throw new Error('Todos os IDs são obrigatórios para transferência')
  }

  if (fromUserId === toUserId) {
    throw new Error('Usuário de origem e destino não podem ser iguais')
  }

  try {
    // Verificar se a atribuição atual existe
    const { data: currentAssignment } = await supabase
      .from('task_assignments')
      .select('id')
      .eq('task_id', taskId)
      .eq('user_id', fromUserId)
      .single()

    if (!currentAssignment) {
      throw new Error('Atribuição atual não encontrada')
    }

    // Verificar se o novo usuário já está atribuído
    const { data: existingAssignment } = await supabase
      .from('task_assignments')
      .select('id')
      .eq('task_id', taskId)
      .eq('user_id', toUserId)
      .single()

    if (existingAssignment) {
      throw new Error('Usuário de destino já está atribuído a esta tarefa')
    }

    // Remover atribuição atual
    await unassignTaskFromUser(taskId, fromUserId)

    // Criar nova atribuição
    const newAssignment = await assignTaskToUser(taskId, toUserId, transferredBy)

    return newAssignment

  } catch (error) {
    console.error('Erro ao transferir atribuição:', error)
    throw error
  }
}

/**
 * Atribui múltiplos usuários a uma tarefa
 * @param {string} taskId - ID da tarefa
 * @param {Array} userIds - Array de IDs dos usuários
 * @param {string} assignedBy - ID do usuário que está fazendo a atribuição
 * @returns {Promise<Array>} Lista de atribuições criadas
 */
export const assignMultipleUsers = async (taskId, userIds, assignedBy) => {
  if (!taskId || !Array.isArray(userIds) || userIds.length === 0 || !assignedBy) {
    throw new Error('ID da tarefa, array de usuários e ID do atribuidor são obrigatórios')
  }

  try {
    const assignments = []
    
    for (const userId of userIds) {
      try {
        const assignment = await assignTaskToUser(taskId, userId, assignedBy)
        assignments.push(assignment)
      } catch (error) {
        // Se o usuário já estiver atribuído, continue com os próximos
        if (error.message.includes('já está atribuído')) {
          console.warn(`Usuário ${userId} já está atribuído à tarefa ${taskId}`)
          continue
        }
        throw error
      }
    }

    return assignments

  } catch (error) {
    console.error('Erro ao atribuir múltiplos usuários:', error)
    throw error
  }
}

/**
 * Remove múltiplos usuários de uma tarefa
 * @param {string} taskId - ID da tarefa
 * @param {Array} userIds - Array de IDs dos usuários
 * @returns {Promise<boolean>} True se todas as remoções foram bem-sucedidas
 */
export const unassignMultipleUsers = async (taskId, userIds) => {
  if (!taskId || !Array.isArray(userIds) || userIds.length === 0) {
    throw new Error('ID da tarefa e array de usuários são obrigatórios')
  }

  const { error } = await supabase
    .from('task_assignments')
    .delete()
    .eq('task_id', taskId)
    .in('user_id', userIds)

  if (error) {
    console.error('Erro ao remover múltiplas atribuições:', error)
    throw new Error(`Erro ao remover atribuições: ${error.message}`)
  }

  return true
}

/**
 * Busca estatísticas de atribuições de um usuário
 * @param {string} userId - ID do usuário
 * @param {string} projectId - ID do projeto (opcional)
 * @returns {Promise<Object>} Estatísticas das atribuições
 */
export const getUserAssignmentStats = async (userId, projectId = null) => {
  if (!userId) {
    throw new Error('ID do usuário é obrigatório')
  }

  let query = supabase
    .from('task_assignments')
    .select(`
      task:tasks(
        id,
        status,
        project_id,
        task_steps(
          id,
          is_completed
        )
      )
    `)
    .eq('user_id', userId)

  if (projectId) {
    query = query.eq('task.project_id', projectId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar estatísticas:', error)
    throw new Error(`Erro ao buscar estatísticas: ${error.message}`)
  }

  if (!data) return null

  const stats = {
    totalTasks: data.length,
    todo: 0,
    in_progress: 0,
    review: 0,
    completed: 0,
    totalSteps: 0,
    completedSteps: 0
  }

  data.forEach(assignment => {
    const task = assignment.task
    if (task) {
      stats[task.status] = (stats[task.status] || 0) + 1
      
      if (task.task_steps) {
        stats.totalSteps += task.task_steps.length
        stats.completedSteps += task.task_steps.filter(step => step.is_completed).length
      }
    }
  })

  stats.overallProgress = stats.totalSteps > 0 
    ? Math.round((stats.completedSteps / stats.totalSteps) * 100) 
    : 0

  return stats
}

/**
 * Verifica se um usuário está atribuído a uma tarefa
 * @param {string} taskId - ID da tarefa
 * @param {string} userId - ID do usuário
 * @returns {Promise<boolean>} True se o usuário está atribuído
 */
export const isUserAssignedToTask = async (taskId, userId) => {
  if (!taskId || !userId) {
    throw new Error('ID da tarefa e ID do usuário são obrigatórios')
  }

  const { data, error } = await supabase
    .from('task_assignments')
    .select('id')
    .eq('task_id', taskId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao verificar atribuição:', error)
    throw new Error(`Erro ao verificar atribuição: ${error.message}`)
  }

  return !!data
}

/**
 * Busca usuários disponíveis para atribuição em um projeto
 * @param {string} projectId - ID do projeto
 * @param {string} taskId - ID da tarefa (opcional, para excluir já atribuídos)
 * @returns {Promise<Array>} Lista de usuários disponíveis
 */
export const getAvailableUsersForAssignment = async (projectId, taskId = null) => {
  if (!projectId) {
    throw new Error('ID do projeto é obrigatório')
  }

  // Buscar membros do projeto
  const { data: projectMembers, error: membersError } = await supabase
    .from('project_members')
    .select(`
      user:profiles!project_members_user_id_fkey(
        id,
        full_name,
        avatar_url,
        email
      )
    `)
    .eq('project_id', projectId)

  if (membersError) {
    console.error('Erro ao buscar membros do projeto:', membersError)
    throw new Error(`Erro ao buscar membros: ${membersError.message}`)
  }

  let availableUsers = projectMembers?.map(member => member.user) || []

  // Se taskId fornecido, remover usuários já atribuídos
  if (taskId) {
    const assignedUsers = await getTaskAssignments(taskId)
    const assignedUserIds = assignedUsers.map(assignment => assignment.user_id)
    
    availableUsers = availableUsers.filter(user => 
      !assignedUserIds.includes(user.id)
    )
  }

  return availableUsers
}

/**
 * Busca histórico de atribuições de uma tarefa
 * @param {string} taskId - ID da tarefa
 * @returns {Promise<Array>} Histórico de atribuições
 */
export const getTaskAssignmentHistory = async (taskId) => {
  if (!taskId) {
    throw new Error('ID da tarefa é obrigatório')
  }

  // Nota: Esta função assume que você tem uma tabela de histórico
  // Por enquanto, retorna as atribuições atuais
  return await getTaskAssignments(taskId)
}