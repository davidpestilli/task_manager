import { supabase } from './supabase'
import { searchUtils } from '@/utils/helpers'

/**
 * Serviço de busca global
 * Realiza buscas em projetos, pessoas e tarefas
 */

/**
 * Busca global em todos os tipos de conteúdo
 * @param {Object} params - Parâmetros da busca
 * @param {string} params.query - Termo de busca
 * @param {string} params.category - Categoria ('all', 'projects', 'people', 'tasks')
 * @param {number} params.limit - Limite de resultados
 * @returns {Promise<Array>} Array de resultados
 */
export const searchGlobal = async ({ query, category = 'all', limit = 15 }) => {
  if (!query || query.trim().length < 2) {
    return []
  }

  const searchTerm = query.trim().toLowerCase()
  const results = []

  try {
    // Buscar em paralelo baseado na categoria
    const searchPromises = []

    if (category === 'all' || category === 'projects') {
      searchPromises.push(searchProjects(searchTerm, limit))
    }

    if (category === 'all' || category === 'people') {
      searchPromises.push(searchPeople(searchTerm, limit))
    }

    if (category === 'all' || category === 'tasks') {
      searchPromises.push(searchTasks(searchTerm, limit))
    }

    const searchResults = await Promise.all(searchPromises)
    
    // Combinar todos os resultados
    searchResults.forEach(categoryResults => {
      if (Array.isArray(categoryResults)) {
        results.push(...categoryResults)
      }
    })

    // Calcular score de relevância e ordenar
    const scoredResults = results.map(item => ({
      ...item,
      relevance_score: searchUtils.calculateRelevanceScore(item, query)
    }))

    // Ordenar por relevância e limitar resultados
    return scoredResults
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, limit)

  } catch (error) {
    console.error('Erro na busca global:', error)
    throw new Error('Falha ao realizar busca. Tente novamente.')
  }
}

/**
 * Busca específica em projetos
 * @param {string} searchTerm - Termo de busca
 * @param {number} limit - Limite de resultados
 * @returns {Promise<Array>} Projetos encontrados
 */
const searchProjects = async (searchTerm, limit) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        description,
        created_at,
        updated_at,
        owner_id,
        profiles!projects_owner_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .limit(limit)

    if (error) throw error

    // Buscar contagens de tarefas e membros para cada projeto
    const projectsWithCounts = await Promise.all(
      data.map(async (project) => {
        const [tasksCount, membersCount] = await Promise.all([
          getProjectTasksCount(project.id),
          getProjectMembersCount(project.id)
        ])

        return {
          ...project,
          type: 'project',
          tasks_count: tasksCount,
          members_count: membersCount,
          owner: project.profiles
        }
      })
    )

    return projectsWithCounts

  } catch (error) {
    console.error('Erro ao buscar projetos:', error)
    return []
  }
}

/**
 * Busca específica em pessoas
 * @param {string} searchTerm - Termo de busca
 * @param {number} limit - Limite de resultados
 * @returns {Promise<Array>} Pessoas encontradas
 */
const searchPeople = async (searchTerm, limit) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        avatar_url,
        created_at,
        updated_at
      `)
      .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .limit(limit)

    if (error) throw error

    // Buscar contagens de projetos e tarefas para cada pessoa
    const peopleWithCounts = await Promise.all(
      data.map(async (person) => {
        const [projectsCount, activeTasksCount, lastActivity] = await Promise.all([
          getUserProjectsCount(person.id),
          getUserActiveTasksCount(person.id),
          getUserLastActivity(person.id)
        ])

        return {
          ...person,
          type: 'person',
          projects_count: projectsCount,
          active_tasks_count: activeTasksCount,
          last_activity: lastActivity
        }
      })
    )

    return peopleWithCounts

  } catch (error) {
    console.error('Erro ao buscar pessoas:', error)
    return []
  }
}

/**
 * Busca específica em tarefas
 * @param {string} searchTerm - Termo de busca
 * @param {number} limit - Limite de resultados
 * @returns {Promise<Array>} Tarefas encontradas
 */
const searchTasks = async (searchTerm, limit) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        id,
        name,
        description,
        status,
        created_at,
        updated_at,
        project_id,
        projects!tasks_project_id_fkey (
          name
        )
      `)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .limit(limit)

    if (error) throw error

    // Buscar informações adicionais para cada tarefa
    const tasksWithDetails = await Promise.all(
      data.map(async (task) => {
        const [completionPercentage, assignedUsers, hasDependencies, commentsCount] = await Promise.all([
          getTaskCompletionPercentage(task.id),
          getTaskAssignedUsers(task.id),
          checkTaskHasDependencies(task.id),
          getTaskCommentsCount(task.id)
        ])

        return {
          ...task,
          type: 'task',
          project_name: task.projects?.name,
          completion_percentage: completionPercentage,
          assigned_users: assignedUsers,
          has_dependencies: hasDependencies,
          comments_count: commentsCount
        }
      })
    )

    return tasksWithDetails

  } catch (error) {
    console.error('Erro ao buscar tarefas:', error)
    return []
  }
}

/**
 * Funções auxiliares para contagens e informações adicionais
 */

const getProjectTasksCount = async (projectId) => {
  try {
    const { count, error } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Erro ao contar tarefas do projeto:', error)
    return 0
  }
}

const getProjectMembersCount = async (projectId) => {
  try {
    const { count, error } = await supabase
      .from('project_members')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Erro ao contar membros do projeto:', error)
    return 0
  }
}

const getUserProjectsCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('project_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Erro ao contar projetos do usuário:', error)
    return 0
  }
}

const getUserActiveTasksCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('task_assignments')
      .select(`
        task_id,
        tasks!task_assignments_task_id_fkey (
          status
        )
      `, { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('tasks.status', ['não_iniciada', 'em_andamento', 'pausada'])

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Erro ao contar tarefas ativas do usuário:', error)
    return 0
  }
}

const getUserLastActivity = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('activity_log')
      .select('timestamp')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (error) return null
    return data?.timestamp || null
  } catch (error) {
    console.error('Erro ao buscar última atividade do usuário:', error)
    return null
  }
}

const getTaskCompletionPercentage = async (taskId) => {
  try {
    const { data: steps, error } = await supabase
      .from('task_steps')
      .select('is_completed')
      .eq('task_id', taskId)

    if (error) throw error

    if (!steps || steps.length === 0) return 0

    const completedSteps = steps.filter(step => step.is_completed).length
    return Math.round((completedSteps / steps.length) * 100)
  } catch (error) {
    console.error('Erro ao calcular porcentagem de conclusão:', error)
    return 0
  }
}

const getTaskAssignedUsers = async (taskId) => {
  try {
    const { data, error } = await supabase
      .from('task_assignments')
      .select(`
        profiles!task_assignments_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('task_id', taskId)

    if (error) throw error
    return data?.map(assignment => assignment.profiles) || []
  } catch (error) {
    console.error('Erro ao buscar usuários atribuídos à tarefa:', error)
    return []
  }
}

const checkTaskHasDependencies = async (taskId) => {
  try {
    const { count, error } = await supabase
      .from('task_dependencies')
      .select('*', { count: 'exact', head: true })
      .eq('task_id', taskId)

    if (error) throw error
    return (count || 0) > 0
  } catch (error) {
    console.error('Erro ao verificar dependências da tarefa:', error)
    return false
  }
}

const getTaskCommentsCount = async (taskId) => {
  try {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('task_id', taskId)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Erro ao contar comentários da tarefa:', error)
    return 0
  }
}

/**
 * Busca por sugestões baseadas no histórico do usuário
 * @param {string} userId - ID do usuário
 * @param {number} limit - Limite de sugestões
 * @returns {Promise<Array>} Sugestões de busca
 */
export const getSearchSuggestions = async (userId, limit = 5) => {
  try {
    // Buscar projetos recentes do usuário
    const { data: recentProjects, error: projectsError } = await supabase
      .from('project_members')
      .select(`
        projects (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .limit(limit)

    if (projectsError) throw projectsError

    // Buscar tarefas recentes do usuário
    const { data: recentTasks, error: tasksError } = await supabase
      .from('task_assignments')
      .select(`
        tasks (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .limit(limit)

    if (tasksError) throw tasksError

    const suggestions = []

    // Adicionar projetos recentes
    recentProjects?.forEach(item => {
      if (item.projects?.name) {
        suggestions.push({
          type: 'project',
          query: item.projects.name,
          display: item.projects.name
        })
      }
    })

    // Adicionar tarefas recentes
    recentTasks?.forEach(item => {
      if (item.tasks?.name) {
        suggestions.push({
          type: 'task',
          query: item.tasks.name,
          display: item.tasks.name
        })
      }
    })

    return suggestions.slice(0, limit)

  } catch (error) {
    console.error('Erro ao buscar sugestões:', error)
    return []
  }
}