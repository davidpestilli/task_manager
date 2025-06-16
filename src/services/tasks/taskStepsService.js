import { supabase } from '@/config/supabase'

/**
 * Serviço para operações CRUD de etapas das tarefas
 * Responsável por gerenciar as etapas individuais de cada tarefa
 */

/**
 * Busca todas as etapas de uma tarefa
 * @param {string} taskId - ID da tarefa
 * @returns {Promise<Array>} Lista de etapas ordenadas
 */
export const getTaskSteps = async (taskId) => {
  if (!taskId) {
    throw new Error('ID da tarefa é obrigatório')
  }

  const { data, error } = await supabase
    .from('task_steps')
    .select(`
      *,
      completed_by_profile:profiles!task_steps_completed_by_fkey(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('task_id', taskId)
    .order('step_order', { ascending: true })

  if (error) {
    console.error('Erro ao buscar etapas:', error)
    throw new Error(`Erro ao buscar etapas: ${error.message}`)
  }

  return data || []
}

/**
 * Cria uma nova etapa para uma tarefa
 * @param {Object} stepData - Dados da etapa
 * @param {string} stepData.task_id - ID da tarefa
 * @param {string} stepData.name - Nome da etapa
 * @param {string} stepData.description - Descrição da etapa
 * @param {number} stepData.step_order - Ordem da etapa
 * @returns {Promise<Object>} Etapa criada
 */
export const createTaskStep = async (stepData) => {
  const { task_id, name, description, step_order } = stepData

  if (!task_id || !name) {
    throw new Error('ID da tarefa e nome da etapa são obrigatórios')
  }

  const { data, error } = await supabase
    .from('task_steps')
    .insert({
      task_id,
      name: name.trim(),
      description: description?.trim() || null,
      step_order: step_order || 1,
      is_completed: false
    })
    .select(`
      *,
      completed_by_profile:profiles!task_steps_completed_by_fkey(
        id,
        full_name,
        avatar_url
      )
    `)
    .single()

  if (error) {
    console.error('Erro ao criar etapa:', error)
    throw new Error(`Erro ao criar etapa: ${error.message}`)
  }

  return data
}

/**
 * Atualiza uma etapa existente
 * @param {string} stepId - ID da etapa
 * @param {Object} updates - Dados para atualizar
 * @returns {Promise<Object>} Etapa atualizada
 */
export const updateTaskStep = async (stepId, updates) => {
  if (!stepId) {
    throw new Error('ID da etapa é obrigatório')
  }

  const allowedFields = ['name', 'description', 'step_order']
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

  const { data, error } = await supabase
    .from('task_steps')
    .update(cleanUpdates)
    .eq('id', stepId)
    .select(`
      *,
      completed_by_profile:profiles!task_steps_completed_by_fkey(
        id,
        full_name,
        avatar_url
      )
    `)
    .single()

  if (error) {
    console.error('Erro ao atualizar etapa:', error)
    throw new Error(`Erro ao atualizar etapa: ${error.message}`)
  }

  return data
}

/**
 * Marca uma etapa como concluída ou não concluída
 * @param {string} stepId - ID da etapa
 * @param {boolean} isCompleted - Se a etapa está concluída
 * @param {string} userId - ID do usuário que está marcando
 * @returns {Promise<Object>} Etapa atualizada
 */
export const toggleTaskStepCompletion = async (stepId, isCompleted, userId) => {
  if (!stepId || !userId) {
    throw new Error('ID da etapa e ID do usuário são obrigatórios')
  }

  const updates = {
    is_completed: isCompleted,
    completed_by: isCompleted ? userId : null,
    completed_at: isCompleted ? new Date().toISOString() : null
  }

  const { data, error } = await supabase
    .from('task_steps')
    .update(updates)
    .eq('id', stepId)
    .select(`
      *,
      completed_by_profile:profiles!task_steps_completed_by_fkey(
        id,
        full_name,
        avatar_url
      )
    `)
    .single()

  if (error) {
    console.error('Erro ao atualizar status da etapa:', error)
    throw new Error(`Erro ao atualizar status da etapa: ${error.message}`)
  }

  return data
}

/**
 * Exclui uma etapa
 * @param {string} stepId - ID da etapa
 * @returns {Promise<boolean>} True se excluída com sucesso
 */
export const deleteTaskStep = async (stepId) => {
  if (!stepId) {
    throw new Error('ID da etapa é obrigatório')
  }

  const { error } = await supabase
    .from('task_steps')
    .delete()
    .eq('id', stepId)

  if (error) {
    console.error('Erro ao excluir etapa:', error)
    throw new Error(`Erro ao excluir etapa: ${error.message}`)
  }

  return true
}

/**
 * Reordena as etapas de uma tarefa
 * @param {string} taskId - ID da tarefa
 * @param {Array} stepIds - Array com IDs das etapas na nova ordem
 * @returns {Promise<Array>} Etapas reordenadas
 */
export const reorderTaskSteps = async (taskId, stepIds) => {
  if (!taskId || !Array.isArray(stepIds)) {
    throw new Error('ID da tarefa e array de IDs são obrigatórios')
  }

  try {
    // Atualizar ordem de cada etapa
    const updatePromises = stepIds.map((stepId, index) => 
      supabase
        .from('task_steps')
        .update({ step_order: index + 1 })
        .eq('id', stepId)
        .eq('task_id', taskId) // Validação adicional de segurança
    )

    await Promise.all(updatePromises)

    // Buscar etapas atualizadas
    return await getTaskSteps(taskId)

  } catch (error) {
    console.error('Erro ao reordenar etapas:', error)
    throw new Error(`Erro ao reordenar etapas: ${error.message}`)
  }
}

/**
 * Adiciona múltiplas etapas a uma tarefa
 * @param {string} taskId - ID da tarefa
 * @param {Array} steps - Array de etapas a serem criadas
 * @returns {Promise<Array>} Etapas criadas
 */
export const addMultipleSteps = async (taskId, steps) => {
  if (!taskId || !Array.isArray(steps) || steps.length === 0) {
    throw new Error('ID da tarefa e array de etapas são obrigatórios')
  }

  // Buscar maior ordem atual
  const { data: existingSteps } = await supabase
    .from('task_steps')
    .select('step_order')
    .eq('task_id', taskId)
    .order('step_order', { ascending: false })
    .limit(1)

  const nextOrder = existingSteps && existingSteps.length > 0 
    ? existingSteps[0].step_order + 1 
    : 1

  const stepsToInsert = steps.map((step, index) => ({
    task_id: taskId,
    name: step.name.trim(),
    description: step.description?.trim() || null,
    step_order: nextOrder + index,
    is_completed: false
  }))

  const { data, error } = await supabase
    .from('task_steps')
    .insert(stepsToInsert)
    .select(`
      *,
      completed_by_profile:profiles!task_steps_completed_by_fkey(
        id,
        full_name,
        avatar_url
      )
    `)

  if (error) {
    console.error('Erro ao adicionar etapas:', error)
    throw new Error(`Erro ao adicionar etapas: ${error.message}`)
  }

  return data || []
}

/**
 * Calcula estatísticas das etapas de uma tarefa
 * @param {Array} steps - Lista de etapas
 * @returns {Object} Estatísticas das etapas
 */
export const calculateStepsStats = (steps = []) => {
  const total = steps.length
  const completed = steps.filter(step => step.is_completed).length
  const remaining = total - completed
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return {
    total,
    completed,
    remaining,
    percentage,
    isEmpty: total === 0,
    isCompleted: total > 0 && completed === total
  }
}

/**
 * Busca etapas pendentes de múltiplas tarefas
 * @param {Array} taskIds - Array de IDs das tarefas
 * @returns {Promise<Object>} Etapas pendentes agrupadas por tarefa
 */
export const getPendingStepsByTasks = async (taskIds) => {
  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    return {}
  }

  const { data, error } = await supabase
    .from('task_steps')
    .select(`
      *,
      task:tasks(id, name)
    `)
    .in('task_id', taskIds)
    .eq('is_completed', false)
    .order('step_order', { ascending: true })

  if (error) {
    console.error('Erro ao buscar etapas pendentes:', error)
    throw new Error(`Erro ao buscar etapas pendentes: ${error.message}`)
  }

  // Agrupar por tarefa
  const groupedSteps = {}
  data.forEach(step => {
    if (!groupedSteps[step.task_id]) {
      groupedSteps[step.task_id] = []
    }
    groupedSteps[step.task_id].push(step)
  })

  return groupedSteps
}