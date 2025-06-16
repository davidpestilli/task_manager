import { supabase } from '../api/supabase'

/**
 * Serviço para métricas pessoais e do dashboard
 * 
 * Responsabilidades:
 * - Buscar métricas pessoais do usuário
 * - Calcular estatísticas de produtividade
 * - Obter dados para gráficos e visualizações
 * - Gerenciar log de atividades
 */

/**
 * Busca métricas gerais do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} Métricas do usuário
 */
export const getUserMetrics = async (userId) => {
  try {
    // Buscar tarefas ativas
    const { data: activeTasks, error: activeError } = await supabase
      .from('task_assignments')
      .select(`
        task:tasks(
          id,
          name,
          status,
          created_at,
          task_steps(id, is_completed)
        )
      `)
      .eq('user_id', userId)
      .in('task.status', ['não_iniciada', 'em_andamento', 'pausada'])

    if (activeError) throw activeError

    // Buscar tarefas concluídas do mês atual
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: completedTasks, error: completedError } = await supabase
      .from('task_assignments')
      .select(`
        task:tasks(
          id,
          name,
          status,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)
      .eq('task.status', 'concluída')
      .gte('task.updated_at', startOfMonth.toISOString())

    if (completedError) throw completedError

    // Buscar projetos ativos do usuário
    const { data: activeProjects, error: projectsError } = await supabase
      .from('project_members')
      .select(`
        project:projects(
          id,
          name,
          created_at
        )
      `)
      .eq('user_id', userId)

    if (projectsError) throw projectsError

    // Calcular taxa de conclusão
    const totalActiveTasks = activeTasks?.length || 0
    const totalCompletedThisMonth = completedTasks?.length || 0
    const totalActiveProjects = activeProjects?.length || 0

    // Calcular progresso médio das tarefas ativas
    let averageProgress = 0
    if (activeTasks && activeTasks.length > 0) {
      const progressSum = activeTasks.reduce((sum, assignment) => {
        const task = assignment.task
        if (!task?.task_steps || task.task_steps.length === 0) return sum
        
        const completedSteps = task.task_steps.filter(step => step.is_completed).length
        const totalSteps = task.task_steps.length
        const taskProgress = (completedSteps / totalSteps) * 100
        
        return sum + taskProgress
      }, 0)
      
      averageProgress = Math.round(progressSum / activeTasks.length)
    }

    return {
      activeTasks: totalActiveTasks,
      completedThisMonth: totalCompletedThisMonth,
      activeProjects: totalActiveProjects,
      averageProgress,
      trend: {
        activeTasks: 0, // Será calculado comparando com período anterior
        completedTasks: 0,
        averageProgress: 0
      }
    }

  } catch (error) {
    console.error('Erro ao buscar métricas do usuário:', error)
    throw new Error('Falha ao carregar métricas pessoais')
  }
}

/**
 * Busca dados para gráfico de progresso semanal
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Dados do gráfico semanal
 */
export const getWeeklyProgress = async (userId) => {
  try {
    // Últimos 7 dias
    const today = new Date()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(today.getDate() - 7)

    const { data: weeklyData, error } = await supabase
      .from('activity_log')
      .select('action, timestamp')
      .eq('user_id', userId)
      .eq('action', 'task_completed')
      .gte('timestamp', sevenDaysAgo.toISOString())
      .order('timestamp', { ascending: true })

    if (error) throw error

    // Agrupar por dia
    const weeklyProgress = []
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(today.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDay = new Date(date)
      nextDay.setDate(date.getDate() + 1)
      
      const tasksCompletedThisDay = weeklyData?.filter(activity => {
        const activityDate = new Date(activity.timestamp)
        return activityDate >= date && activityDate < nextDay
      }).length || 0

      weeklyProgress.push({
        day: days[date.getDay()],
        date: date.toISOString().split('T')[0],
        completed: tasksCompletedThisDay
      })
    }

    return weeklyProgress

  } catch (error) {
    console.error('Erro ao buscar progresso semanal:', error)
    throw new Error('Falha ao carregar dados semanais')
  }
}

/**
 * Busca distribuição de tarefas por status
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Distribuição por status
 */
export const getTaskStatusDistribution = async (userId) => {
  try {
    const { data: tasks, error } = await supabase
      .from('task_assignments')
      .select(`
        task:tasks(status)
      `)
      .eq('user_id', userId)

    if (error) throw error

    // Contar por status
    const distribution = {
      'não_iniciada': 0,
      'em_andamento': 0,
      'pausada': 0,
      'concluída': 0
    }

    tasks?.forEach(assignment => {
      const status = assignment.task?.status
      if (status && distribution.hasOwnProperty(status)) {
        distribution[status]++
      }
    })

    // Converter para formato do gráfico
    return [
      { name: 'Não Iniciada', value: distribution['não_iniciada'], color: '#6B7280' },
      { name: 'Em Andamento', value: distribution['em_andamento'], color: '#3B82F6' },
      { name: 'Pausada', value: distribution['pausada'], color: '#F59E0B' },
      { name: 'Concluída', value: distribution['concluída'], color: '#10B981' }
    ]

  } catch (error) {
    console.error('Erro ao buscar distribuição de status:', error)
    throw new Error('Falha ao carregar distribuição de tarefas')
  }
}

/**
 * Busca progresso por projeto
 * @param {string} userId - ID do usuário
 * @returns {Promise<Array>} Lista de projetos com progresso
 */
export const getProjectProgress = async (userId) => {
  try {
    const { data: projects, error } = await supabase
      .from('project_members')
      .select(`
        project:projects(
          id,
          name,
          description,
          created_at,
          tasks(
            id,
            status,
            task_steps(id, is_completed),
            task_assignments!inner(user_id)
          )
        )
      `)
      .eq('user_id', userId)

    if (error) throw error

    return projects?.map(member => {
      const project = member.project
      if (!project) return null

      // Filtrar apenas tarefas atribuídas ao usuário
      const userTasks = project.tasks?.filter(task => 
        task.task_assignments?.some(assignment => assignment.user_id === userId)
      ) || []

      // Calcular progresso
      let totalSteps = 0
      let completedSteps = 0
      let completedTasks = 0

      userTasks.forEach(task => {
        if (task.status === 'concluída') {
          completedTasks++
        }

        if (task.task_steps && task.task_steps.length > 0) {
          totalSteps += task.task_steps.length
          completedSteps += task.task_steps.filter(step => step.is_completed).length
        }
      })

      const progressPercentage = totalSteps > 0 
        ? Math.round((completedSteps / totalSteps) * 100)
        : userTasks.length > 0 && completedTasks === userTasks.length 
        ? 100 
        : 0

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        totalTasks: userTasks.length,
        completedTasks,
        progress: progressPercentage,
        createdAt: project.created_at
      }
    }).filter(Boolean) || []

  } catch (error) {
    console.error('Erro ao buscar progresso dos projetos:', error)
    throw new Error('Falha ao carregar progresso dos projetos')
  }
}

/**
 * Busca atividades recentes do usuário
 * @param {string} userId - ID do usuário
 * @param {number} limit - Limite de atividades (padrão: 10)
 * @returns {Promise<Array>} Lista de atividades recentes
 */
export const getRecentActivities = async (userId, limit = 10) => {
  try {
    const { data: activities, error } = await supabase
      .from('activity_log')
      .select(`
        id,
        action,
        details,
        timestamp,
        task:tasks(id, name),
        project:projects(id, name)
      `)
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) throw error

    return activities?.map(activity => ({
      id: activity.id,
      action: activity.action,
      details: activity.details,
      timestamp: activity.timestamp,
      task: activity.task,
      project: activity.project,
      timeAgo: formatTimeAgo(activity.timestamp)
    })) || []

  } catch (error) {
    console.error('Erro ao buscar atividades recentes:', error)
    throw new Error('Falha ao carregar atividades recentes')
  }
}

/**
 * Calcula tempo médio de conclusão de tarefas
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} Métricas de tempo
 */
export const getCompletionTimeMetrics = async (userId) => {
  try {
    // Buscar tarefas concluídas dos últimos 30 dias
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: completedTasks, error } = await supabase
      .from('task_assignments')
      .select(`
        assigned_at,
        task:tasks(
          created_at,
          updated_at,
          status
        )
      `)
      .eq('user_id', userId)
      .eq('task.status', 'concluída')
      .gte('task.updated_at', thirtyDaysAgo.toISOString())

    if (error) throw error

    if (!completedTasks || completedTasks.length === 0) {
      return {
        averageCompletionTime: 0,
        totalCompleted: 0,
        fastestCompletion: 0,
        slowestCompletion: 0
      }
    }

    // Calcular tempos de conclusão
    const completionTimes = completedTasks.map(assignment => {
      const startDate = new Date(assignment.assigned_at)
      const endDate = new Date(assignment.task.updated_at)
      return Math.max(0, endDate - startDate) // em milissegundos
    })

    const averageTime = completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
    const fastestTime = Math.min(...completionTimes)
    const slowestTime = Math.max(...completionTimes)

    return {
      averageCompletionTime: Math.round(averageTime / (1000 * 60 * 60 * 24)), // em dias
      totalCompleted: completedTasks.length,
      fastestCompletion: Math.round(fastestTime / (1000 * 60 * 60 * 24)), // em dias
      slowestCompletion: Math.round(slowestTime / (1000 * 60 * 60 * 24)) // em dias
    }

  } catch (error) {
    console.error('Erro ao calcular métricas de tempo:', error)
    throw new Error('Falha ao calcular métricas de conclusão')
  }
}

/**
 * Utilitário para formatar tempo relativo
 * @param {string} timestamp - Timestamp ISO
 * @returns {string} Tempo formatado (ex: "há 2 horas")
 */
const formatTimeAgo = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now - time) / 1000)

  if (diffInSeconds < 60) {
    return 'há alguns segundos'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `há ${hours} hora${hours > 1 ? 's' : ''}`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `há ${days} dia${days > 1 ? 's' : ''}`
  }
}