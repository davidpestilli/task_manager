import { supabase } from '@/config/supabase'

/**
 * Busca uma tarefa específica por ID
 * @param {string} taskId - ID da tarefa
 * @returns {Promise<Object>} Dados da tarefa
 */
export const getTask = async (taskId) => {
  if (!taskId) {
    throw new Error('ID da tarefa é obrigatório')
  }

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      created_by_profile:profiles!tasks_created_by_fkey(
        id,
        full_name,
        avatar_url,
        email
      ),
      task_assignments(
        id,
        assigned_at,
        assigned_by,
        user:profiles!task_assignments_user_id_fkey(
          id,
          full_name,
          avatar_url,
          email
        )
      ),
      task_steps(
        id,
        name,
        description,
        is_completed,
        step_order,
        completed_by,
        completed_at,
        completed_by_profile:profiles!task_steps_completed_by_fkey(
          id,
          full_name,
          avatar_url
        )
      ),
      project:projects(
        id,
        name,
        description
      )
    `)
    .eq('id', taskId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Tarefa não encontrada')
    }
    console.error('Erro ao buscar tarefa:', error)
    throw new Error(`Erro ao buscar tarefa: ${error.message}`)
  }

  return data
}

/**
 * Busca todas as tarefas (com paginação opcional)
 * @param {Object} options - Opções de busca
 * @returns {Promise<Array>} Lista de tarefas
 */
export const getTasks = async (options = {}) => {
  const { 
    page = 1, 
    limit = 50, 
    orderBy = 'created_at', 
    orderDirection = 'desc',
    includeCompleted = true 
  } = options

  let query = supabase
    .from('tasks')
    .select(`
      *,
      created_by_profile:profiles!tasks_created_by_fkey(
        id,
        full_name,
        avatar_url
      ),
      task_assignments(
        id,
        user:profiles!task_assignments_user_id_fkey(
          id,
          full_name,
          avatar_url
        )
      ),
      task_steps(
        id,
        name,
        is_completed,
        step_order
      ),
      project:projects(
        id,
        name
      )
    `)

  // Filtrar tarefas concluídas se necessário
  if (!includeCompleted) {
    query = query.neq('status', 'completed')
  }

  // Ordenação
  query = query.order(orderBy, { ascending: orderDirection === 'asc' })

  // Paginação
  if (limit > 0) {
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar tarefas:', error)
    throw new Error(`Erro ao buscar tarefas: ${error.message}`)
  }

  return data || []
}

/**
 * Busca tarefas de um projeto específico
 * @param {string} projectId - ID do projeto
 * @param {Object} filters - Filtros opcionais
 * @returns {Promise<Array>} Lista de tarefas do projeto
 */
export const getTasksByProject = async (projectId, filters = {}) => {
  if (!projectId) {
    throw new Error('ID do projeto é obrigatório')
  }

  let query = supabase
    .from('tasks')
    .select(`
      *,
      created_by_profile:profiles!tasks_created_by_fkey(
        id,
        full_name,
        avatar_url
      ),
      task_assignments(
        id,
        user:profiles!task_assignments_user_id_fkey(
          id,
          full_name,
          avatar_url
        )
      ),
      task_steps(
        id,
        name,
        is_completed,
        step_order
      )
    `)
    .eq('project_id', projectId)

  // Aplicar filtros
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters.search && filters.search.trim()) {
    query = query.or(`name.ilike.%${filters.search.trim()}%,description.ilike.%${filters.search.trim()}%`)
  }

  if (filters.assignedUser) {
    // Filtrar por usuário atribuído
    const { data: assignments } = await supabase
      .from('task_assignments')
      .select('task_id')
      .eq('user_id', filters.assignedUser)
    
    if (assignments && assignments.length > 0) {
      const taskIds = assignments.map(a => a.task_id)
      query = query.in('id', taskIds)
    } else {
      // Se não há assignments, retorna array vazio
      return []
    }
  }

  // Ordenação
  const orderBy = filters.orderBy || 'created_at'
  const orderDirection = filters.orderDirection || 'desc'
  query = query.order(orderBy, { ascending: orderDirection === 'asc' })

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar tarefas do projeto:', error)
    throw new Error(`Erro ao buscar tarefas: ${error.message}`)
  }

  return data || []
}

/**
 * Busca tarefas atribuídas a um usuário específico
 * @param {string} userId - ID do usuário
 * @param {Object} options - Opções de busca
 * @returns {Promise<Array>} Lista de tarefas do usuário
 */
export const getTasksByUser = async (userId, options = {}) => {
  if (!userId) {
    throw new Error('ID do usuário é obrigatório')
  }

  const { includeCompleted = true, projectId = null } = options

  // Primeiro busca as tarefas atribuídas ao usuário
  let assignmentsQuery = supabase
    .from('task_assignments')
    .select('task_id')
    .eq('user_id', userId)

  const { data: assignments, error: assignmentsError } = await assignmentsQuery

  if (assignmentsError) {
    console.error('Erro ao buscar atribuições:', assignmentsError)
    throw new Error(`Erro ao buscar tarefas do usuário: ${assignmentsError.message}`)
  }

  if (!assignments || assignments.length === 0) {
    return []
  }

  const taskIds = assignments.map(a => a.task_id)

  let query = supabase
    .from('tasks')
    .select(`
      *,
      created_by_profile:profiles!tasks_created_by_fkey(
        id,
        full_name,
        avatar_url
      ),
      task_assignments(
        id,
        user:profiles!task_assignments_user_id_fkey(
          id,
          full_name,
          avatar_url
        )
      ),
      task_steps(
        id,
        name,
        is_completed,
        step_order
      ),
      project:projects(
        id,
        name
      )
    `)
    .in('id', taskIds)

  // Filtros opcionais
  if (!includeCompleted) {
    query = query.neq('status', 'completed')
  }

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar tarefas do usuário:', error)
    throw new Error(`Erro ao buscar tarefas: ${error.message}`)
  }

  return data || []
}

/**
 * Cria uma nova tarefa
 * @param {Object} taskData - Dados da tarefa
 * @returns {Promise<Object>} Tarefa criada
 */
export const createTask = async (taskData) => {
  const { 
    name, 
    description, 
    project_id, 
    created_by, 
    assignedUsers = [], 
    steps = [],
    status = 'todo'
  } = taskData

  if (!name || !project_id || !created_by) {
    throw new Error('Nome, projeto e criador são obrigatórios')
  }

  if (assignedUsers.length === 0) {
    throw new Error('Pelo menos um usuário deve ser atribuído à tarefa')
  }

  if (steps.length === 0) {
    throw new Error('Pelo menos uma etapa deve ser criada')
  }

  try {
    // Criar a tarefa
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        project_id,
        created_by,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (taskError) {
      console.error('Erro ao criar tarefa:', taskError)
      throw new Error(`Erro ao criar tarefa: ${taskError.message}`)
    }

    // Criar atribuições
    const assignments = assignedUsers.map(userId => ({
      task_id: task.id,
      user_id: userId,
      assigned_by: created_by,
      assigned_at: new Date().toISOString()
    }))

    const { error: assignmentsError } = await supabase
      .from('task_assignments')
      .insert(assignments)

    if (assignmentsError) {
      console.error('Erro ao criar atribuições:', assignmentsError)
      throw new Error(`Erro ao atribuir usuários: ${assignmentsError.message}`)
    }

    // Criar etapas
    const taskSteps = steps.map((step, index) => ({
      task_id: task.id,
      name: step.name.trim(),
      description: step.description?.trim() || null,
      step_order: index + 1,
      is_completed: false,
      created_at: new Date().toISOString()
    }))

    const { error: stepsError } = await supabase
      .from('task_steps')
      .insert(taskSteps)

    if (stepsError) {
      console.error('Erro ao criar etapas:', stepsError)
      throw new Error(`Erro ao criar etapas: ${stepsError.message}`)
    }

    // Retornar a tarefa criada com os dados relacionados
    return await getTask(task.id)

  } catch (error) {
    console.error('Erro no processo de criação da tarefa:', error)
    throw error
  }
}

/**
 * Atualiza uma tarefa
 * @param {string} taskId - ID da tarefa
 * @param {Object} updates - Dados para atualizar
 * @returns {Promise<Object>} Tarefa atualizada
 */
export const updateTask = async (taskId, updates) => {
  if (!taskId) {
    throw new Error('ID da tarefa é obrigatório')
  }

  const allowedFields = ['name', 'description', 'status']
  const cleanUpdates = {}

  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key) && updates[key] !== undefined) {
      if (key === 'name' || key === 'description') {
        cleanUpdates[key] = updates[key]?.trim() || null
      } else {
        cleanUpdates[key] = updates[key]
      }
    }
  })

  if (Object.keys(cleanUpdates).length === 0) {
    throw new Error('Nenhum campo válido para atualizar')
  }

  cleanUpdates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('tasks')
    .update(cleanUpdates)
    .eq('id', taskId)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar tarefa:', error)
    throw new Error(`Erro ao atualizar tarefa: ${error.message}`)
  }

  return data
}

/**
 * Atualiza o status de uma tarefa
 * @param {string} taskId - ID da tarefa
 * @param {string} status - Novo status
 * @returns {Promise<Object>} Tarefa atualizada
 */
export const updateTaskStatus = async (taskId, status) => {
  if (!taskId) {
    throw new Error('ID da tarefa é obrigatório')
  }

  if (!status) {
    throw new Error('Status é obrigatório')
  }

  const validStatuses = ['todo', 'in_progress', 'review', 'completed']
  if (!validStatuses.includes(status)) {
    throw new Error('Status inválido')
  }

  return await updateTask(taskId, { status })
}

/**
 * Exclui uma tarefa
 * @param {string} taskId - ID da tarefa
 * @returns {Promise<boolean>} True se excluída com sucesso
 */
export const deleteTask = async (taskId) => {
  if (!taskId) {
    throw new Error('ID da tarefa é obrigatório')
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    console.error('Erro ao excluir tarefa:', error)
    throw new Error(`Erro ao excluir tarefa: ${error.message}`)
  }

  return true
}

/**
 * Calcula o percentual de conclusão de uma tarefa
 * @param {Array} steps - Lista de etapas da tarefa
 * @returns {number} Percentual de conclusão (0-100)
 */
export const calculateTaskProgress = (steps = []) => {
  if (steps.length === 0) return 0
  
  const completedSteps = steps.filter(step => step.is_completed).length
  return Math.round((completedSteps / steps.length) * 100)
}

/**
 * Busca estatísticas de tarefas de um projeto
 * @param {string} projectId - ID do projeto
 * @returns {Promise<Object>} Estatísticas das tarefas
 */
export const getTasksStats = async (projectId) => {
  if (!projectId) {
    throw new Error('ID do projeto é obrigatório')
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('status, task_steps(is_completed)')
    .eq('project_id', projectId)

  if (error) {
    console.error('Erro ao buscar estatísticas:', error)
    throw new Error(`Erro ao buscar estatísticas: ${error.message}`)
  }

  if (!data) return null

  const stats = {
    total: data.length,
    todo: 0,
    in_progress: 0,
    review: 0,
    completed: 0,
    totalSteps: 0,
    completedSteps: 0
  }

  data.forEach(task => {
    stats[task.status] = (stats[task.status] || 0) + 1
    
    if (task.task_steps) {
      stats.totalSteps += task.task_steps.length
      stats.completedSteps += task.task_steps.filter(step => step.is_completed).length
    }
  })

  stats.overallProgress = stats.totalSteps > 0 
    ? Math.round((stats.completedSteps / stats.totalSteps) * 100) 
    : 0

  return stats
}