import { supabase } from '@/config/supabase'

/**
 * Serviço para operações CRUD de tarefas
 * Responsável por todas as operações relacionadas às tarefas no Supabase
 */

/**
 * Busca todas as tarefas de um projeto
 * @param {string} projectId - ID do projeto
 * @returns {Promise<Array>} Lista de tarefas com dados relacionados
 */
export const getTasksByProject = async (projectId) => {
  if (!projectId) {
    throw new Error('ID do projeto é obrigatório')
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
        ),
        assigned_by_profile:profiles!task_assignments_assigned_by_fkey(
          id,
          full_name
        )
      ),
      task_steps(
        id,
        name,
        description,
        is_completed,
        step_order,
        completed_by,
        completed_at
      )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar tarefas:', error)
    throw new Error(`Erro ao buscar tarefas: ${error.message}`)
  }

  return data || []
}

/**
 * Busca uma tarefa específica por ID
 * @param {string} taskId - ID da tarefa
 * @returns {Promise<Object>} Dados completos da tarefa
 */
export const getTaskById = async (taskId) => {
  if (!taskId) {
    throw new Error('ID da tarefa é obrigatório')
  }

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      project:projects(
        id,
        name,
        description
      ),
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
 * Cria uma nova tarefa
 * @param {Object} taskData - Dados da tarefa
 * @param {string} taskData.name - Nome da tarefa
 * @param {string} taskData.description - Descrição da tarefa
 * @param {string} taskData.project_id - ID do projeto
 * @param {string} taskData.created_by - ID do usuário criador
 * @param {Array} taskData.assignedUsers - IDs dos usuários atribuídos
 * @param {Array} taskData.steps - Lista de etapas da tarefa
 * @returns {Promise<Object>} Tarefa criada
 */
export const createTask = async (taskData) => {
  const { name, description, project_id, created_by, assignedUsers = [], steps = [] } = taskData

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
    // Iniciar transação
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        project_id,
        created_by,
        status: 'não_iniciada'
      })
      .select()
      .single()

    if (taskError) {
      throw new Error(`Erro ao criar tarefa: ${taskError.message}`)
    }

    // Criar atribuições
    if (assignedUsers.length > 0) {
      const assignments = assignedUsers.map(userId => ({
        task_id: task.id,
        user_id: userId,
        assigned_by: created_by
      }))

      const { error: assignmentError } = await supabase
        .from('task_assignments')
        .insert(assignments)

      if (assignmentError) {
        // Rollback: deletar tarefa criada
        await supabase.from('tasks').delete().eq('id', task.id)
        throw new Error(`Erro ao atribuir usuários: ${assignmentError.message}`)
      }
    }

    // Criar etapas
    if (steps.length > 0) {
      const taskSteps = steps.map((step, index) => ({
        task_id: task.id,
        name: step.name.trim(),
        description: step.description?.trim() || null,
        step_order: index + 1,
        is_completed: false
      }))

      const { error: stepsError } = await supabase
        .from('task_steps')
        .insert(taskSteps)

      if (stepsError) {
        // Rollback: deletar tarefa e atribuições
        await supabase.from('task_assignments').delete().eq('task_id', task.id)
        await supabase.from('tasks').delete().eq('id', task.id)
        throw new Error(`Erro ao criar etapas: ${stepsError.message}`)
      }
    }

    // Buscar tarefa completa
    return await getTaskById(task.id)

  } catch (error) {
    console.error('Erro ao criar tarefa:', error)
    throw error
  }
}

/**
 * Atualiza uma tarefa existente
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
 * Busca tarefas com filtros
 * @param {string} projectId - ID do projeto
 * @param {Object} filters - Filtros a aplicar
 * @returns {Promise<Array>} Lista de tarefas filtradas
 */
export const getTasksWithFilters = async (projectId, filters = {}) => {
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
    // Filtrar por usuário atribuído usando inner join
    query = query.in('id', 
      supabase
        .from('task_assignments')
        .select('task_id')
        .eq('user_id', filters.assignedUser)
    )
  }

  // Ordenação
  const orderBy = filters.orderBy || 'created_at'
  const orderDirection = filters.orderDirection || 'desc'
  query = query.order(orderBy, { ascending: orderDirection === 'asc' })

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar tarefas com filtros:', error)
    throw new Error(`Erro ao buscar tarefas: ${error.message}`)
  }

  return data || []
}