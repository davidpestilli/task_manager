import { supabase } from '@/config/supabase'

/**
 * Serviço para gerenciar dependências entre tarefas
 * 
 * Funcionalidades:
 * - CRUD de dependências
 * - Validação de dependências circulares
 * - Busca de cadeias de dependência
 * - Resolução automática de bloqueios
 */

/**
 * Cria uma nova dependência entre tarefas
 * @param {string} taskId - ID da tarefa que depende
 * @param {string} dependsOnTaskId - ID da tarefa da qual depende
 * @returns {Object} Dependência criada
 */
export const createTaskDependency = async (taskId, dependsOnTaskId) => {
  try {
    // Validar se não é auto-dependência
    if (taskId === dependsOnTaskId) {
      throw new Error('Uma tarefa não pode depender de si mesma')
    }

    // Verificar se dependência já existe
    const { data: existing } = await supabase
      .from('task_dependencies')
      .select('id')
      .eq('task_id', taskId)
      .eq('depends_on_task_id', dependsOnTaskId)
      .single()

    if (existing) {
      throw new Error('Esta dependência já existe')
    }

    // Validar dependência circular antes de criar
    const isCircular = await validateCircularDependency(taskId, dependsOnTaskId)
    if (isCircular) {
      throw new Error('Esta dependência criaria um ciclo circular')
    }

    // Criar dependência
    const { data, error } = await supabase
      .from('task_dependencies')
      .insert({
        task_id: taskId,
        depends_on_task_id: dependsOnTaskId
      })
      .select(`
        *,
        depends_on_task:tasks!depends_on_task_id(
          id,
          name,
          status,
          project_id
        )
      `)
      .single()

    if (error) throw error

    // Log da atividade
    await logDependencyActivity(taskId, 'dependency_added', {
      depends_on_task_id: dependsOnTaskId
    })

    return data
  } catch (error) {
    console.error('Erro ao criar dependência:', error)
    throw error
  }
}

/**
 * Remove uma dependência específica
 * @param {string} dependencyId - ID da dependência
 * @returns {boolean} Sucesso da operação
 */
export const removeTaskDependency = async (dependencyId) => {
  try {
    // Buscar dependência antes de deletar para log
    const { data: dependency } = await supabase
      .from('task_dependencies')
      .select('task_id, depends_on_task_id')
      .eq('id', dependencyId)
      .single()

    const { error } = await supabase
      .from('task_dependencies')
      .delete()
      .eq('id', dependencyId)

    if (error) throw error

    // Log da atividade
    if (dependency) {
      await logDependencyActivity(dependency.task_id, 'dependency_removed', {
        depends_on_task_id: dependency.depends_on_task_id
      })
    }

    return true
  } catch (error) {
    console.error('Erro ao remover dependência:', error)
    throw error
  }
}

/**
 * Busca todas as dependências de uma tarefa
 * @param {string} taskId - ID da tarefa
 * @returns {Array} Lista de dependências
 */
export const getTaskDependencies = async (taskId) => {
  try {
    const { data, error } = await supabase
      .from('task_dependencies')
      .select(`
        *,
        depends_on_task:tasks!depends_on_task_id(
          id,
          name,
          status,
          project_id
        )
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Erro ao buscar dependências da tarefa:', error)
    throw error
  }
}

/**
 * Busca tarefas que dependem de uma tarefa específica
 * @param {string} taskId - ID da tarefa
 * @returns {Array} Lista de tarefas dependentes
 */
export const getTaskDependents = async (taskId) => {
  try {
    const { data, error } = await supabase
      .from('task_dependencies')
      .select(`
        *,
        task:tasks!task_id(
          id,
          name,
          status,
          project_id
        )
      `)
      .eq('depends_on_task_id', taskId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Erro ao buscar tarefas dependentes:', error)
    throw error
  }
}

/**
 * Busca todas as dependências de um projeto para o fluxograma
 * @param {string} projectId - ID do projeto
 * @returns {Object} Nós e arestas para o fluxograma
 */
export const getProjectDependencyFlow = async (projectId) => {
  try {
    // Buscar todas as tarefas do projeto
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        id,
        name,
        status,
        project_id,
        assignments:task_assignments(
          user:profiles(full_name, avatar_url)
        )
      `)
      .eq('project_id', projectId)

    if (tasksError) throw tasksError

    // Buscar todas as dependências do projeto
    const { data: dependencies, error: depsError } = await supabase
      .from('task_dependencies')
      .select(`
        id,
        task_id,
        depends_on_task_id
      `)
      .in('task_id', tasks.map(t => t.id))

    if (depsError) throw depsError

    // Converter para formato de nós e arestas
    const nodes = tasks.map(task => ({
      id: task.id,
      type: 'task',
      data: {
        id: task.id,
        name: task.name,
        status: task.status,
        assignees: task.assignments?.map(a => a.user) || []
      },
      position: { x: 0, y: 0 } // Será calculado pelo algoritmo de layout
    }))

    const edges = dependencies.map(dep => ({
      id: dep.id,
      source: dep.depends_on_task_id,
      target: dep.task_id,
      type: 'dependency',
      animated: false
    }))

    return { nodes, edges }
  } catch (error) {
    console.error('Erro ao buscar fluxo de dependências:', error)
    throw error
  }
}

/**
 * Valida se uma nova dependência criaria um ciclo circular
 * @param {string} taskId - Tarefa que vai depender
 * @param {string} dependsOnTaskId - Tarefa da qual vai depender
 * @returns {boolean} True se criaria ciclo circular
 */
export const validateCircularDependency = async (taskId, dependsOnTaskId) => {
  try {
    // Se a tarefa "dependsOn" já depende da tarefa atual, seria circular
    const path = await findDependencyPath(dependsOnTaskId, taskId)
    return path.length > 0
  } catch (error) {
    console.error('Erro ao validar dependência circular:', error)
    return false
  }
}

/**
 * Encontra caminho de dependência entre duas tarefas
 * @param {string} fromTaskId - Tarefa origem
 * @param {string} toTaskId - Tarefa destino
 * @returns {Array} Caminho de dependências
 */
export const findDependencyPath = async (fromTaskId, toTaskId, visited = new Set()) => {
  try {
    // Evitar loops infinitos
    if (visited.has(fromTaskId)) return []
    visited.add(fromTaskId)

    // Se chegou ao destino, encontrou o caminho
    if (fromTaskId === toTaskId) return [fromTaskId]

    // Buscar dependências da tarefa atual
    const { data: dependencies } = await supabase
      .from('task_dependencies')
      .select('depends_on_task_id')
      .eq('task_id', fromTaskId)

    if (!dependencies || dependencies.length === 0) return []

    // Buscar recursivamente em cada dependência
    for (const dep of dependencies) {
      const path = await findDependencyPath(
        dep.depends_on_task_id, 
        toTaskId, 
        new Set(visited)
      )
      if (path.length > 0) {
        return [fromTaskId, ...path]
      }
    }

    return []
  } catch (error) {
    console.error('Erro ao encontrar caminho de dependência:', error)
    return []
  }
}

/**
 * Verifica se uma tarefa pode ser iniciada (dependências resolvidas)
 * @param {string} taskId - ID da tarefa
 * @returns {Object} Status de bloqueio
 */
export const checkTaskBlocked = async (taskId) => {
  try {
    const { data: dependencies, error } = await supabase
      .from('task_dependencies')
      .select(`
        depends_on_task:tasks!depends_on_task_id(
          id,
          name,
          status
        )
      `)
      .eq('task_id', taskId)

    if (error) throw error

    const blockedBy = dependencies?.filter(
      dep => dep.depends_on_task.status !== 'concluída'
    ) || []

    return {
      isBlocked: blockedBy.length > 0,
      blockedByTasks: blockedBy.map(dep => dep.depends_on_task),
      totalDependencies: dependencies?.length || 0
    }
  } catch (error) {
    console.error('Erro ao verificar bloqueio da tarefa:', error)
    return { isBlocked: false, blockedByTasks: [], totalDependencies: 0 }
  }
}

/**
 * Resolve dependências automaticamente quando tarefa é concluída
 * @param {string} completedTaskId - ID da tarefa concluída
 * @returns {Array} Tarefas desbloqueadas
 */
export const resolveDependencies = async (completedTaskId) => {
  try {
    // Buscar tarefas que dependem da tarefa concluída
    const dependents = await getTaskDependents(completedTaskId)
    const unblockedTasks = []

    for (const dependent of dependents) {
      const blockStatus = await checkTaskBlocked(dependent.task.id)
      
      // Se não está mais bloqueada, adicionar à lista de desbloqueadas
      if (!blockStatus.isBlocked) {
        unblockedTasks.push(dependent.task)
      }
    }

    return unblockedTasks
  } catch (error) {
    console.error('Erro ao resolver dependências:', error)
    return []
  }
}

/**
 * Registra atividade relacionada a dependências
 * @param {string} taskId - ID da tarefa
 * @param {string} action - Ação realizada
 * @param {Object} details - Detalhes da ação
 */
const logDependencyActivity = async (taskId, action, details = {}) => {
  try {
    // Buscar informações da tarefa para o log
    const { data: task } = await supabase
      .from('tasks')
      .select('project_id')
      .eq('id', taskId)
      .single()

    if (!task) return

    // Buscar usuário atual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('activity_log')
      .insert({
        user_id: user.id,
        task_id: taskId,
        project_id: task.project_id,
        action,
        details
      })
  } catch (error) {
    console.error('Erro ao registrar atividade de dependência:', error)
  }
}