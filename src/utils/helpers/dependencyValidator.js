/**
 * Validador de dependências entre tarefas
 * 
 * Funcionalidades:
 * - Validação de dependências circulares
 * - Verificação de regras de negócio
 * - Validação de integridade
 * - Detecção de problemas potenciais
 */

/**
 * Regras de validação para dependências
 */
export const DEPENDENCY_RULES = {
  MAX_DEPENDENCY_DEPTH: 10,      // Máximo de níveis de dependência
  MAX_DEPENDENCIES_PER_TASK: 20, // Máximo de dependências por tarefa
  ALLOW_CROSS_PROJECT: false,    // Permitir dependências entre projetos
  REQUIRE_SAME_OWNER: false      // Exigir mesmo proprietário
}

/**
 * Tipos de erro de validação
 */
export const VALIDATION_ERRORS = {
  CIRCULAR_DEPENDENCY: 'circular_dependency',
  SELF_DEPENDENCY: 'self_dependency',
  MAX_DEPTH_EXCEEDED: 'max_depth_exceeded',
  TOO_MANY_DEPENDENCIES: 'too_many_dependencies',
  CROSS_PROJECT_NOT_ALLOWED: 'cross_project_not_allowed',
  DEPENDENCY_ALREADY_EXISTS: 'dependency_already_exists',
  INVALID_TASK_STATUS: 'invalid_task_status',
  SAME_OWNER_REQUIRED: 'same_owner_required'
}

/**
 * Mensagens de erro em português
 */
export const ERROR_MESSAGES = {
  [VALIDATION_ERRORS.CIRCULAR_DEPENDENCY]: 'Esta dependência criaria um ciclo circular',
  [VALIDATION_ERRORS.SELF_DEPENDENCY]: 'Uma tarefa não pode depender de si mesma',
  [VALIDATION_ERRORS.MAX_DEPTH_EXCEEDED]: `Profundidade máxima de ${DEPENDENCY_RULES.MAX_DEPENDENCY_DEPTH} níveis excedida`,
  [VALIDATION_ERRORS.TOO_MANY_DEPENDENCIES]: `Máximo de ${DEPENDENCY_RULES.MAX_DEPENDENCIES_PER_TASK} dependências por tarefa`,
  [VALIDATION_ERRORS.CROSS_PROJECT_NOT_ALLOWED]: 'Dependências entre projetos diferentes não são permitidas',
  [VALIDATION_ERRORS.DEPENDENCY_ALREADY_EXISTS]: 'Esta dependência já existe',
  [VALIDATION_ERRORS.INVALID_TASK_STATUS]: 'Status da tarefa não permite criar dependências',
  [VALIDATION_ERRORS.SAME_OWNER_REQUIRED]: 'Tarefas devem ter o mesmo proprietário'
}

/**
 * Valida se uma dependência pode ser criada
 * @param {Object} params - Parâmetros da validação
 * @param {string} params.taskId - Tarefa que vai depender
 * @param {string} params.dependsOnTaskId - Tarefa da qual vai depender
 * @param {Object} params.taskData - Dados da tarefa dependente
 * @param {Object} params.dependsOnTaskData - Dados da tarefa dependência
 * @param {Array} params.existingDependencies - Dependências existentes
 * @param {Array} params.allDependencies - Todas as dependências do projeto
 * @returns {Object} Resultado da validação
 */
export const validateDependency = (params) => {
  const {
    taskId,
    dependsOnTaskId,
    taskData,
    dependsOnTaskData,
    existingDependencies = [],
    allDependencies = []
  } = params

  const validationResult = {
    isValid: true,
    errors: [],
    warnings: []
  }

  // Validação 1: Auto-dependência
  if (taskId === dependsOnTaskId) {
    addError(validationResult, VALIDATION_ERRORS.SELF_DEPENDENCY)
    return validationResult
  }

  // Validação 2: Dependência já existe
  const dependencyExists = existingDependencies.some(
    dep => dep.depends_on_task_id === dependsOnTaskId
  )
  if (dependencyExists) {
    addError(validationResult, VALIDATION_ERRORS.DEPENDENCY_ALREADY_EXISTS)
    return validationResult
  }

  // Validação 3: Projetos diferentes
  if (DEPENDENCY_RULES.ALLOW_CROSS_PROJECT === false) {
    if (taskData?.project_id !== dependsOnTaskData?.project_id) {
      addError(validationResult, VALIDATION_ERRORS.CROSS_PROJECT_NOT_ALLOWED)
    }
  }

  // Validação 4: Mesmo proprietário
  if (DEPENDENCY_RULES.REQUIRE_SAME_OWNER) {
    if (taskData?.created_by !== dependsOnTaskData?.created_by) {
      addError(validationResult, VALIDATION_ERRORS.SAME_OWNER_REQUIRED)
    }
  }

  // Validação 5: Máximo de dependências
  if (existingDependencies.length >= DEPENDENCY_RULES.MAX_DEPENDENCIES_PER_TASK) {
    addError(validationResult, VALIDATION_ERRORS.TOO_MANY_DEPENDENCIES)
  }

  // Validação 6: Status inválido
  if (taskData?.status === 'concluída') {
    addWarning(validationResult, 'Adicionando dependência a tarefa já concluída')
  }

  // Validação 7: Dependência circular
  const circularCheck = checkCircularDependency(
    taskId,
    dependsOnTaskId,
    allDependencies
  )
  if (circularCheck.hasCircular) {
    addError(validationResult, VALIDATION_ERRORS.CIRCULAR_DEPENDENCY)
  }

  // Validação 8: Profundidade máxima
  const depthCheck = checkDependencyDepth(
    dependsOnTaskId,
    allDependencies
  )
  if (depthCheck.depth >= DEPENDENCY_RULES.MAX_DEPENDENCY_DEPTH) {
    addError(validationResult, VALIDATION_ERRORS.MAX_DEPTH_EXCEEDED)
  }

  return validationResult
}

/**
 * Verifica dependência circular usando DFS
 * @param {string} taskId - Tarefa que vai depender
 * @param {string} dependsOnTaskId - Tarefa da qual vai depender
 * @param {Array} allDependencies - Todas as dependências
 * @returns {Object} Resultado da verificação
 */
export const checkCircularDependency = (taskId, dependsOnTaskId, allDependencies) => {
  const visited = new Set()
  const recursionStack = new Set()
  const dependencyMap = buildDependencyMap(allDependencies)

  // Adicionar a nova dependência temporariamente
  if (!dependencyMap.has(taskId)) {
    dependencyMap.set(taskId, new Set())
  }
  dependencyMap.get(taskId).add(dependsOnTaskId)

  const dfs = (currentTask) => {
    if (recursionStack.has(currentTask)) {
      return true // Ciclo encontrado
    }

    if (visited.has(currentTask)) {
      return false // Já visitado em outro caminho
    }

    visited.add(currentTask)
    recursionStack.add(currentTask)

    const dependencies = dependencyMap.get(currentTask) || new Set()
    for (const dep of dependencies) {
      if (dfs(dep)) {
        return true
      }
    }

    recursionStack.delete(currentTask)
    return false
  }

  const hasCircular = dfs(taskId)

  return {
    hasCircular,
    checked: visited.size
  }
}

/**
 * Calcula profundidade de dependência
 * @param {string} taskId - ID da tarefa
 * @param {Array} allDependencies - Todas as dependências
 * @returns {Object} Profundidade e caminho
 */
export const checkDependencyDepth = (taskId, allDependencies) => {
  const dependencyMap = buildDependencyMap(allDependencies)
  const visited = new Set()

  const dfs = (currentTask, currentDepth = 0, path = []) => {
    if (visited.has(currentTask)) {
      return { depth: currentDepth, path }
    }

    visited.add(currentTask)
    const newPath = [...path, currentTask]

    const dependencies = dependencyMap.get(currentTask) || new Set()
    if (dependencies.size === 0) {
      return { depth: currentDepth, path: newPath }
    }

    let maxDepth = currentDepth
    let longestPath = newPath

    for (const dep of dependencies) {
      const result = dfs(dep, currentDepth + 1, newPath)
      if (result.depth > maxDepth) {
        maxDepth = result.depth
        longestPath = result.path
      }
    }

    return { depth: maxDepth, path: longestPath }
  }

  return dfs(taskId)
}

/**
 * Constrói mapa de dependências para navegação eficiente
 * @param {Array} dependencies - Lista de dependências
 * @returns {Map} Mapa task_id → Set(dependencies)
 */
const buildDependencyMap = (dependencies) => {
  const map = new Map()

  dependencies.forEach(dep => {
    if (!map.has(dep.task_id)) {
      map.set(dep.task_id, new Set())
    }
    map.get(dep.task_id).add(dep.depends_on_task_id)
  })

  return map
}

/**
 * Adiciona erro ao resultado de validação
 */
const addError = (validationResult, errorType) => {
  validationResult.isValid = false
  validationResult.errors.push({
    type: errorType,
    message: ERROR_MESSAGES[errorType]
  })
}

/**
 * Adiciona aviso ao resultado de validação
 */
const addWarning = (validationResult, message) => {
  validationResult.warnings.push(message)
}

/**
 * Valida integridade de todas as dependências de um projeto
 * @param {Array} tasks - Todas as tarefas do projeto
 * @param {Array} dependencies - Todas as dependências
 * @returns {Object} Relatório de integridade
 */
export const validateProjectDependencyIntegrity = (tasks, dependencies) => {
  const report = {
    isValid: true,
    totalTasks: tasks.length,
    totalDependencies: dependencies.length,
    issues: [],
    suggestions: []
  }

  const taskIds = new Set(tasks.map(t => t.id))

  // Verificar dependências órfãs
  dependencies.forEach(dep => {
    if (!taskIds.has(dep.task_id)) {
      report.issues.push({
        type: 'orphan_dependency',
        message: `Dependência referencia tarefa inexistente: ${dep.task_id}`,
        dependencyId: dep.id
      })
      report.isValid = false
    }

    if (!taskIds.has(dep.depends_on_task_id)) {
      report.issues.push({
        type: 'orphan_dependency',
        message: `Dependência referencia tarefa inexistente: ${dep.depends_on_task_id}`,
        dependencyId: dep.id
      })
      report.isValid = false
    }
  })

  // Verificar ciclos
  const circularDependencies = findAllCircularDependencies(dependencies)
  if (circularDependencies.length > 0) {
    report.issues.push({
      type: 'circular_dependencies',
      message: `Encontrados ${circularDependencies.length} ciclos circulares`,
      cycles: circularDependencies
    })
    report.isValid = false
  }

  // Sugestões de otimização
  const isolatedTasks = tasks.filter(task => {
    const hasIncoming = dependencies.some(dep => dep.task_id === task.id)
    const hasOutgoing = dependencies.some(dep => dep.depends_on_task_id === task.id)
    return !hasIncoming && !hasOutgoing
  })

  if (isolatedTasks.length > 0) {
    report.suggestions.push({
      type: 'isolated_tasks',
      message: `${isolatedTasks.length} tarefas sem dependências poderiam ser agrupadas`,
      tasks: isolatedTasks.map(t => t.id)
    })
  }

  return report
}

/**
 * Encontra todos os ciclos circulares em um conjunto de dependências
 * @param {Array} dependencies - Lista de dependências
 * @returns {Array} Lista de ciclos encontrados
 */
export const findAllCircularDependencies = (dependencies) => {
  const dependencyMap = buildDependencyMap(dependencies)
  const visited = new Set()
  const cycles = []

  const dfs = (task, path, recursionStack) => {
    if (recursionStack.has(task)) {
      // Encontrou ciclo - extrair apenas o ciclo
      const cycleStart = path.indexOf(task)
      const cycle = path.slice(cycleStart)
      cycles.push([...cycle, task])
      return
    }

    if (visited.has(task)) return

    visited.add(task)
    recursionStack.add(task)

    const dependencies = dependencyMap.get(task) || new Set()
    for (const dep of dependencies) {
      dfs(dep, [...path, task], recursionStack)
    }

    recursionStack.delete(task)
  }

  // Explorar a partir de cada tarefa
  dependencyMap.forEach((deps, task) => {
    if (!visited.has(task)) {
      dfs(task, [], new Set())
    }
  })

  return cycles
}

/**
 * Sugere otimizações para estrutura de dependências
 * @param {Array} tasks - Tarefas do projeto
 * @param {Array} dependencies - Dependências do projeto
 * @returns {Array} Lista de sugestões
 */
export const suggestDependencyOptimizations = (tasks, dependencies) => {
  const suggestions = []

  // Sugestão 1: Reduzir dependências redundantes
  const redundantDeps = findRedundantDependencies(dependencies)
  if (redundantDeps.length > 0) {
    suggestions.push({
      type: 'remove_redundant',
      message: 'Dependências redundantes podem ser removidas',
      dependencies: redundantDeps
    })
  }

  // Sugestão 2: Paralelizar tarefas
  const parallelizableTasks = findParallelizableTasks(tasks, dependencies)
  if (parallelizableTasks.length > 0) {
    suggestions.push({
      type: 'parallelize',
      message: 'Estas tarefas podem ser executadas em paralelo',
      tasks: parallelizableTasks
    })
  }

  // Sugestão 3: Simplificar cadeias longas
  const longChains = findLongDependencyChains(dependencies)
  if (longChains.length > 0) {
    suggestions.push({
      type: 'simplify_chains',
      message: 'Cadeias de dependência muito longas podem ser simplificadas',
      chains: longChains
    })
  }

  return suggestions
}

/**
 * Encontra dependências redundantes (transitivas)
 */
const findRedundantDependencies = (dependencies) => {
  // Implementação simplificada - pode ser expandida
  return []
}

/**
 * Encontra tarefas que podem ser executadas em paralelo
 */
const findParallelizableTasks = (tasks, dependencies) => {
  const dependencyMap = buildDependencyMap(dependencies)
  const parallelizable = []

  // Tarefas sem dependências podem ser paralelas
  tasks.forEach(task => {
    const deps = dependencyMap.get(task.id)
    if (!deps || deps.size === 0) {
      parallelizable.push(task.id)
    }
  })

  return parallelizable
}

/**
 * Encontra cadeias de dependência muito longas
 */
const findLongDependencyChains = (dependencies) => {
  const longChains = []
  const dependencyMap = buildDependencyMap(dependencies)

  dependencyMap.forEach((deps, taskId) => {
    const depth = checkDependencyDepth(taskId, dependencies)
    if (depth.depth > 5) { // Arbitrário: > 5 níveis é "longo"
      longChains.push({
        startTask: taskId,
        depth: depth.depth,
        path: depth.path
      })
    }
  })

  return longChains
}