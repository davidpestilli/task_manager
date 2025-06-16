import { supabase } from '@/config/supabase'

/**
 * Serviço para operações CRUD de atribuições de tarefas
 * Responsável por gerenciar quem está atribuído a cada tarefa
 */

/**
 * Busca todas as atribuições de uma tarefa
 * @param {string} taskId - ID da tarefa
 * @returns {Promise<Array>} Lista de usuários atribuídos
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
    console.error('Erro ao buscar atribuições:', error)
    throw new Error(`Erro ao buscar atribuições: ${error.message}`)
  }

  return data || []
}

/**
 * Busca todas as tarefas atribuídas a um usuário em um projeto
 * @param {string} userId - ID do usuário
 * @param {string} projectId - ID do projeto
 * @returns {Promise<Array>} Lista de tarefas atribuídas
 */
export const getUserTaskAssignments = async (userId, projectId) => {
  if (!userId || !projectId) {
    throw new Error('ID do usuário e ID do projeto são obrigatórios')
  }

  const { data, error } = await supabase
    .from('task_assignments')
    .select(`
      *,
      task:tasks!inner(
        id,
        name,
        description,
        status,
        created_at,
        updated_at,
        project_id,
        task_steps(
          id,
          name,
          is_completed,
          step_order
        )
      )
    `)
    .eq('user_id', userId)
    .eq('task.project_id', projectId)
    .order('assigned_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar tarefas do usuário:', error)
    throw new Error(`Erro ao buscar tarefas do usuário: ${error.message}`)
  }

  return data || []
}

/**
 * Atribui um usuário a uma tarefa
 * @param {Object} assignmentData - Dados da atribuição
 * @param {string} assignmentData.task_id - ID da tarefa
 * @param {string} assignmentData.user_id - ID do usuário
 * @param {string} assignmentData.assigned_by - ID de quem está atribuindo
 * @returns {Promise<Object>} Atribuição criada
 */
export const assignUserToTask = async (assignmentData) => {
  const { task_id, user_id, assigned_by } = assignmentData

  if (!task_id || !user_id || !assigned_by) {
    throw new Error('ID da tarefa, usuário e quem atribui são obrigatórios')
  }

  // Verificar se usuário já está atribuído
  const { data: existing } = await supabase
    .from('task_assignments')
    .select('id')
    .eq('task_id', task_id)
    .eq('user_id', user_id)
    .single()

  if (existing) {
    throw new Error('Usuário já está atribuído a esta tarefa')
  }

  const { data, error } = await supabase
    .from('task_assignments')
    .insert({
      task_id,
      user_id,
      assigned_by,
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
      )
    `)
    .single()

  if (error) {
    console.error('Erro ao atribuir usuário:', error)
    throw new Error(`Erro ao atribuir usuário: ${error.message}`)
  }

  return data
}

/**
 * Remove a atribuição de um usuário de uma tarefa
 * @param {string} taskId - ID da tarefa
 * @param {string} userId - ID do usuário
 * @returns {Promise<boolean>} True se removida com sucesso
 */
export const removeUserFromTask = async (taskId, userId) => {
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
 * Atribui múltiplos usuários a uma tarefa
 * @param {string} taskId - ID da tarefa
 * @param {Array} userIds - Array de IDs dos usuários
 * @param {string} assignedBy - ID de quem está atribuindo
 * @returns {Promise<Array>} Atribuições criadas
 */
export const assignMultipleUsersToTask = async (taskId, userIds, assignedBy) => {
  if (!taskId || !Array.isArray(userIds) || userIds.length === 0 || !assignedBy) {
    throw new Error('ID da tarefa, usuários e quem atribui são obrigatórios')
  }

  // Verificar quais usuários já estão atribuídos
  const { data: existingAssignments } = await supabase
    .from('task_assignments')
    .select('user_id')
    .eq('task_id', taskId)
    .in('user_id', userIds)

  const existingUserIds = existingAssignments?.map(a => a.user_id) || []
  const newUserIds = userIds.filter(id => !existingUserIds.includes(id))

  if (newUserIds.length === 0) {
    throw new Error('Todos os usuários já estão atribuídos a esta tarefa')
  }

  const assignments = newUserIds.map(userId => ({
    task_id: taskId,
    user_id: userId,
    assigned_by: assignedBy,
    assigned_at: new Date().toISOString()
  }))

  const { data, error } = await supabase
    .from('task_assignments')
    .insert(assignments)
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

  if (error) {
    console.error('Erro ao atribuir usuários:', error)
    throw new Error(`Erro ao atribuir usuários: ${error.message}`)
  }

  return data || []
}

/**
 * Transfere uma tarefa de um usuário para outro
 * @param {string} taskId - ID da tarefa
 * @param {string} fromUserId - ID do usuário atual
 * @param {string} toUserId - ID do novo usuário
 * @param {string} transferredBy - ID de quem está fazendo a transferência
 * @returns {Promise<Object>} Nova atribuição
 */
export const transferTaskAssignment = async (taskId, fromUserId, toUserId, transferredBy) => {
  if (!taskId || !fromUserId || !toUserId || !transferredBy) {
    throw new Error('Todos os parâmetros são obrigatórios')
  }

  if (fromUserId === toUserId) {
    throw new Error('Usuário de origem e destino não podem ser iguais')
  }

  try {
    // Verificar se o usuário de destino já está atribuído
    const { data: existingAssignment } = await supabase
      .from('task_assignments')
      .select('id')
      .eq('task_id', taskId)
      .eq('user_id', toUserId)
      .single()

    if (existingAssignment) {
      throw new Error('Usuário de destino já está atribuído a esta tarefa')
    }

    // Remover atribuição antiga
    await removeUserFromTask(taskId, fromUserId)

    // Criar nova atribuição
    const newAssignment = await assignUserToTask({
      task_id: taskId,
      user_id: toUserId,
      assigned_by: transferredBy
    })

    return newAssignment

  } catch (error) {
    console.error('Erro ao transferir tarefa:', error)
    throw error
  }
}

/**
 * Busca estatísticas de atribuições por projeto
 * @param {string} projectId - ID do projeto
 * @returns {Promise<Object>} Estatísticas de atribuições
 */
export const getAssignmentStatsByProject = async (projectId) => {
  if (!projectId) {
    throw new Error('ID do projeto é obrigatório')
  }

  const { data, error } = await supabase
    .from('task_assignments')
    .select(`
      id,
      user_id,
      task:tasks!inner(
        id,
        status,
        project_id,
        task_steps(
          id,
          is_completed
        )
      ),
      user:profiles!task_assignments_user_id_fkey(
        id,
        full_name
      )
    `)
    .eq('task.project_id', projectId)

  if (error) {
    console.error('Erro ao buscar estatísticas:', error)
    throw new Error(`Erro ao buscar estatísticas: ${error.message}`)
  }

  // Processar estatísticas
  const userStats = {}
  const totalTasks = new Set()

  data.forEach(assignment => {
    const userId = assignment.user_id
    const task = assignment.task

    totalTasks.add(task.id)

    if (!userStats[userId]) {
      userStats[userId] = {
        user: assignment.user,
        totalTasks: 0,
        completedTasks: 0,
        tasksInProgress: 0,
        totalSteps: 0,
        completedSteps: 0
      }
    }

    userStats[userId].totalTasks++

    if (task.status === 'concluída') {
      userStats[userId].completedTasks++
    } else if (task.status === 'em_andamento') {
      userStats[userId].tasksInProgress++
    }

    // Contar etapas
    if (task.task_steps) {
      userStats[userId].totalSteps += task.task_steps.length
      userStats[userId].completedSteps += task.task_steps.filter(step => step.is_completed).length
    }
  })

  // Calcular percentuais
  Object.values(userStats).forEach(stats => {
    stats.completionRate = stats.totalTasks > 0 
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
      : 0
    stats.stepCompletionRate = stats.totalSteps > 0 
      ? Math.round((stats.completedSteps / stats.totalSteps) * 100) 
      : 0
  })

  return {
    userStats: Object.values(userStats),
    totalTasks: totalTasks.size,
    totalAssignments: data.length
  }
}

/**
 * Verifica se um usuário pode ser atribuído a uma tarefa
 * @param {string} userId - ID do usuário
 * @param {string} taskId - ID da tarefa
 * @param {string} projectId - ID do projeto
 * @returns {Promise<Object>} Resultado da validação
 */
export const validateUserAssignment = async (userId, taskId, projectId) => {
  if (!userId || !taskId || !projectId) {
    throw new Error('Todos os parâmetros são obrigatórios')
  }

  try {
    // Verificar se usuário é membro do projeto
    const { data: membership } = await supabase
      .from('project_members')
      .select('id, role')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single()

    if (!membership) {
      return {
        canAssign: false,
        reason: 'Usuário não é membro do projeto'
      }
    }

    // Verificar se já está atribuído
    const { data: existingAssignment } = await supabase
      .from('task_assignments')
      .select('id')
      .eq('task_id', taskId)
      .eq('user_id', userId)
      .single()

    if (existingAssignment) {
      return {
        canAssign: false,
        reason: 'Usuário já está atribuído a esta tarefa'
      }
    }

    // Verificar carga de trabalho (opcional - limite de 10 tarefas ativas)
    const { data: activeTasks, count } = await supabase
      .from('task_assignments')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .in('task.status', ['não_iniciada', 'em_andamento'])

    if (count >= 10) {
      return {
        canAssign: true,
        reason: null,
        warning: 'Usuário já tem 10+ tarefas ativas. Considere a carga de trabalho.'
      }
    }

    return {
      canAssign: true,
      reason: null
    }

  } catch (error) {
    console.error('Erro ao validar atribuição:', error)
    return {
      canAssign: false,
      reason: 'Erro ao validar atribuição'
    }
  }
}