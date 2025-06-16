/**
 * Utilitários para sistema de drag & drop
 */

/**
 * Gera dados para preview de drag
 * @param {Object} task - Tarefa sendo arrastada
 * @param {String} sourcePersonId - ID da pessoa de origem
 * @returns {Object} Dados formatados para drag
 */
export const getDragPreviewData = (task, sourcePersonId) => {
  return {
    type: 'task',
    taskId: task.id,
    taskName: task.name,
    taskStatus: task.status,
    completionPercentage: task.completion_percentage || 0,
    sourcePersonId,
    timestamp: Date.now()
  }
}

/**
 * Formata feedback visual para zona de drop
 * @param {Object} validationResult - Resultado da validação
 * @param {String} personId - ID da pessoa target
 * @param {Array} people - Lista de pessoas
 * @returns {Object} Feedback formatado
 */
export const formatDropFeedback = (validationResult, personId, people) => {
  if (!validationResult) {
    return { isValid: false, message: '', className: '' }
  }

  const person = people.find(p => p.id === personId)
  const personName = person?.full_name || 'Pessoa'

  if (validationResult.isValid) {
    return {
      isValid: true,
      message: `Mover para ${personName}`,
      className: 'success'
    }
  }

  // Mensagens específicas por tipo de erro
  switch (validationResult.reason) {
    case 'same_person':
      return {
        isValid: false,
        message: 'Tarefa já está com esta pessoa',
        className: 'info'
      }

    case 'overloaded':
      return {
        isValid: false,
        message: `${personName} já tem muitas tarefas (${validationResult.currentTasks}/10)`,
        className: 'error'
      }

    case 'missing_permissions':
      return {
        isValid: false,
        message: 'Sem permissão para atribuir tarefas',
        className: 'error'
      }

    case 'unresolved_dependencies':
      return {
        isValid: false,
        message: 'Tarefa possui dependências não resolvidas',
        className: 'warning'
      }

    case 'not_project_member':
      return {
        isValid: false,
        message: `${personName} não é membro do projeto`,
        className: 'error'
      }

    case 'task_completed':
      return {
        isValid: false,
        message: 'Não é possível mover tarefa concluída',
        className: 'error'
      }

    default:
      return {
        isValid: false,
        message: validationResult.message || 'Movimento não permitido',
        className: 'error'
      }
  }
}

/**
 * Calcula estatísticas de carga de trabalho de uma pessoa
 * @param {Object} person - Dados da pessoa
 * @param {Array} tasks - Lista de tarefas da pessoa
 * @returns {Object} Estatísticas calculadas
 */
export const calculatePersonWorkload = (person, tasks = []) => {
  const activeTasks = tasks.filter(task => 
    task.status !== 'concluída' && task.status !== 'cancelada'
  )

  const inProgressTasks = tasks.filter(task => task.status === 'em_andamento')
  const notStartedTasks = tasks.filter(task => task.status === 'não_iniciada')
  const pausedTasks = tasks.filter(task => task.status === 'pausada')

  const totalCompletion = tasks.reduce((sum, task) => 
    sum + (task.completion_percentage || 0), 0
  )
  const averageCompletion = tasks.length > 0 ? totalCompletion / tasks.length : 0

  // Determinar nível de carga
  let workloadLevel = 'light'
  if (activeTasks.length >= 12) {
    workloadLevel = 'heavy'
  } else if (activeTasks.length >= 8) {
    workloadLevel = 'moderate'
  }

  return {
    totalTasks: tasks.length,
    activeTasks: activeTasks.length,
    inProgressTasks: inProgressTasks.length,
    notStartedTasks: notStartedTasks.length,
    pausedTasks: pausedTasks.length,
    averageCompletion: Math.round(averageCompletion),
    workloadLevel,
    canReceiveMoreTasks: activeTasks.length < 10
  }
}

/**
 * Verifica se uma pessoa pode receber uma nova tarefa
 * @param {Object} person - Dados da pessoa
 * @param {Array} currentTasks - Tarefas atuais da pessoa
 * @param {Object} options - Opções de verificação
 * @returns {Object} Resultado da verificação
 */
export const canPersonReceiveTask = (person, currentTasks = [], options = {}) => {
  const { maxTasks = 10, considerPriority = false } = options
  
  const workload = calculatePersonWorkload(person, currentTasks)
  
  if (workload.activeTasks >= maxTasks) {
    return {
      canReceive: false,
      reason: 'overloaded',
      message: `Pessoa já possui ${workload.activeTasks} tarefas ativas (máximo: ${maxTasks})`,
      currentLoad: workload.activeTasks,
      maxLoad: maxTasks
    }
  }

  // Verificações adicionais baseadas na prioridade
  if (considerPriority && workload.workloadLevel === 'heavy') {
    return {
      canReceive: false,
      reason: 'heavy_workload',
      message: 'Pessoa está sobrecarregada com tarefas de alta prioridade',
      currentLoad: workload.activeTasks,
      maxLoad: maxTasks
    }
  }

  return {
    canReceive: true,
    currentLoad: workload.activeTasks,
    maxLoad: maxTasks,
    workloadLevel: workload.workloadLevel
  }
}

/**
 * Analisa dependências de uma tarefa
 * @param {Object} task - Tarefa a ser analisada
 * @param {Array} allTasks - Todas as tarefas do projeto
 * @returns {Object} Análise de dependências
 */
export const analyzeTaskDependencies = (task, allTasks = []) => {
  // Encontrar tarefas das quais esta tarefa depende
  const dependencies = allTasks.filter(t => 
    task.dependencies?.includes(t.id)
  )

  // Encontrar tarefas que dependem desta tarefa
  const dependents = allTasks.filter(t => 
    t.dependencies?.includes(task.id)
  )

  // Verificar dependências não resolvidas
  const unresolvedDependencies = dependencies.filter(t => 
    t.status !== 'concluída'
  )

  // Verificar se pode ser movida
  const canBeMoved = unresolvedDependencies.length === 0

  return {
    dependencies,
    dependents,
    unresolvedDependencies,
    canBeMoved,
    blockingTasks: unresolvedDependencies.map(t => ({
      id: t.id,
      name: t.name,
      status: t.status,
      completion: t.completion_percentage || 0
    }))
  }
}

/**
 * Gera sugestões de pessoas para atribuir uma tarefa
 * @param {Object} task - Tarefa a ser atribuída
 * @param {Array} people - Lista de pessoas disponíveis
 * @param {Array} allTasks - Todas as tarefas do projeto
 * @returns {Array} Lista de sugestões ordenadas
 */
export const generateAssignmentSuggestions = (task, people = [], allTasks = []) => {
  return people
    .map(person => {
      // Tarefas atuais da pessoa
      const personTasks = allTasks.filter(t => 
        t.assigned_users?.includes(person.id)
      )

      const workload = calculatePersonWorkload(person, personTasks)
      const canReceive = canPersonReceiveTask(person, personTasks)

      // Calcular score de adequação
      let score = 100

      // Penalizar por carga de trabalho
      score -= workload.activeTasks * 5

      // Bonificar por experiência em tarefas similares
      const similarTasks = personTasks.filter(t => 
        t.category === task.category || 
        t.tags?.some(tag => task.tags?.includes(tag))
      )
      score += similarTasks.length * 10

      // Penalizar se não pode receber
      if (!canReceive.canReceive) {
        score = 0
      }

      return {
        person,
        score: Math.max(0, score),
        workload,
        canReceive,
        similarTasksCount: similarTasks.length,
        reason: canReceive.canReceive ? 
          `Carga: ${workload.workloadLevel}, ${workload.activeTasks} tarefas ativas` :
          canReceive.message
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5) // Top 5 sugestões
}

/**
 * Valida se um movimento de drag & drop é permitido
 * @param {Object} dragData - Dados do elemento arrastado
 * @param {String} targetId - ID do target
 * @param {Object} context - Contexto adicional
 * @returns {Object} Resultado da validação
 */
export const validateDragDrop = (dragData, targetId, context = {}) => {
  const { currentUser, permissions = {}, rules = {} } = context

  // Verificações básicas
  if (!dragData || !targetId) {
    return {
      isValid: false,
      reason: 'invalid_data',
      message: 'Dados inválidos para movimento'
    }
  }

  // Verificar se não é o mesmo elemento
  if (dragData.sourcePersonId === targetId) {
    return {
      isValid: false,
      reason: 'same_target',
      message: 'Não é possível mover para o mesmo local'
    }
  }

  // Verificar permissões do usuário
  if (!permissions.canAssignTasks) {
    return {
      isValid: false,
      reason: 'no_permission',
      message: 'Sem permissão para atribuir tarefas'
    }
  }

  // Verificações específicas por tipo
  if (dragData.type === 'task') {
    // Verificar se tarefa está concluída
    if (dragData.taskStatus === 'concluída') {
      return {
        isValid: false,
        reason: 'task_completed',
        message: 'Tarefas concluídas não podem ser movidas'
      }
    }
  }

  return {
    isValid: true,
    message: 'Movimento permitido'
  }
}

/**
 * Debounce para eventos de drag
 * @param {Function} func - Função a ser executada
 * @param {Number} delay - Delay em ms
 * @returns {Function} Função com debounce
 */
export const debounceDragEvent = (func, delay = 100) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

/**
 * Throttle para eventos de drag over
 * @param {Function} func - Função a ser executada
 * @param {Number} limit - Limite em ms
 * @returns {Function} Função com throttle
 */
export const throttleDragOver = (func, limit = 50) => {
  let inThrottle
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}