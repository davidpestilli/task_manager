/**
 * Utilitários para validação de operações no sistema
 */

/**
 * Valida se uma tarefa pode ser transferida para uma pessoa
 * @param {Object} options - Opções de validação
 * @param {Object} options.task - Tarefa a ser transferida
 * @param {String} options.sourcePersonId - ID da pessoa de origem
 * @param {String} options.targetPersonId - ID da pessoa de destino
 * @param {Array} options.people - Lista de pessoas do projeto
 * @param {String} options.projectId - ID do projeto
 * @param {Object} options.currentUser - Usuário atual
 * @returns {Object} Resultado da validação
 */
export const validateTaskTransfer = ({
  task,
  sourcePersonId,
  targetPersonId,
  people = [],
  projectId,
  currentUser
}) => {
  // Verificações básicas
  if (!task || !sourcePersonId || !targetPersonId) {
    return {
      isValid: false,
      reason: 'missing_data',
      message: 'Dados obrigatórios não fornecidos'
    }
  }

  // Verificar se não é a mesma pessoa
  if (sourcePersonId === targetPersonId) {
    return {
      isValid: false,
      reason: 'same_person',
      message: 'Tarefa já está atribuída a esta pessoa'
    }
  }

  // Encontrar pessoas
  const sourcePerson = people.find(p => p.id === sourcePersonId)
  const targetPerson = people.find(p => p.id === targetPersonId)

  if (!sourcePerson || !targetPerson) {
    return {
      isValid: false,
      reason: 'person_not_found',
      message: 'Pessoa não encontrada no projeto'
    }
  }

  // Verificar se a tarefa está concluída
  if (task.status === 'concluída') {
    return {
      isValid: false,
      reason: 'task_completed',
      message: 'Tarefas concluídas não podem ser transferidas'
    }
  }

  // Verificar se target é membro do projeto
  if (!targetPerson.project_members?.some(pm => pm.project_id === projectId)) {
    return {
      isValid: false,
      reason: 'not_project_member',
      message: `${targetPerson.full_name} não é membro do projeto`
    }
  }

  // Verificar capacidade da pessoa de destino
  const currentTasks = targetPerson.active_tasks || 0
  const maxTasks = 10 // Limite configurável

  if (currentTasks >= maxTasks) {
    return {
      isValid: false,
      reason: 'overloaded',
      message: `${targetPerson.full_name} já possui ${currentTasks} tarefas ativas`,
      currentTasks,
      maxTasks
    }
  }

  // Verificar dependências não resolvidas
  if (task.dependencies && task.dependencies.length > 0) {
    const hasUnresolvedDeps = task.dependencies.some(depId => {
      const dependency = task.project_tasks?.find(t => t.id === depId)
      return dependency && dependency.status !== 'concluída'
    })

    if (hasUnresolvedDeps) {
      return {
        isValid: false,
        reason: 'unresolved_dependencies',
        message: 'Tarefa possui dependências não concluídas',
        warning: true // Permite override com confirmação
      }
    }
  }

  // Verificar permissões do usuário atual
  if (currentUser) {
    const userPermissions = validateUserPermissions(currentUser, projectId, 'assign_tasks')
    if (!userPermissions.isValid) {
      return userPermissions
    }
  }

  // Verificar se a pessoa pode receber tarefas do tipo específico
  const taskTypeValidation = validateTaskTypeAssignment(task, targetPerson)
  if (!taskTypeValidation.isValid) {
    return taskTypeValidation
  }

  // Validação bem-sucedida
  return {
    isValid: true,
    reason: 'valid_transfer',
    message: `Pode transferir para ${targetPerson.full_name}`,
    targetCapacity: {
      current: currentTasks,
      max: maxTasks,
      remaining: maxTasks - currentTasks
    }
  }
}

/**
 * Valida permissões de usuário para uma operação
 * @param {Object} user - Usuário
 * @param {String} projectId - ID do projeto
 * @param {String} operation - Operação a validar
 * @returns {Object} Resultado da validação
 */
export const validateUserPermissions = (user, projectId, operation) => {
  if (!user || !projectId) {
    return {
      isValid: false,
      reason: 'missing_data',
      message: 'Dados de usuário ou projeto não fornecidos'
    }
  }

  // Verificar se usuário é membro do projeto
  const membership = user.project_members?.find(pm => pm.project_id === projectId)
  if (!membership) {
    return {
      isValid: false,
      reason: 'not_member',
      message: 'Usuário não é membro do projeto'
    }
  }

  // Verificar permissões específicas por operação
  switch (operation) {
    case 'assign_tasks':
      // Todos os membros podem atribuir tarefas (sistema democrático)
      return { isValid: true }

    case 'delete_tasks':
      // Apenas owner e admin podem deletar
      if (!['owner', 'admin'].includes(membership.role)) {
        return {
          isValid: false,
          reason: 'insufficient_role',
          message: 'Apenas administradores podem deletar tarefas'
        }
      }
      return { isValid: true }

    case 'manage_members':
      // Apenas owner e admin
      if (!['owner', 'admin'].includes(membership.role)) {
        return {
          isValid: false,
          reason: 'insufficient_role',
          message: 'Apenas administradores podem gerenciar membros'
        }
      }
      return { isValid: true }

    case 'delete_project':
      // Apenas owner
      if (membership.role !== 'owner') {
        return {
          isValid: false,
          reason: 'owner_only',
          message: 'Apenas o dono do projeto pode deletá-lo'
        }
      }
      return { isValid: true }

    default:
      return { isValid: true }
  }
}

/**
 * Valida se um tipo de tarefa pode ser atribuído a uma pessoa
 * @param {Object} task - Tarefa
 * @param {Object} person - Pessoa
 * @returns {Object} Resultado da validação
 */
export const validateTaskTypeAssignment = (task, person) => {
  // Verificações básicas
  if (!task || !person) {
    return {
      isValid: false,
      reason: 'missing_data',
      message: 'Dados de tarefa ou pessoa não fornecidos'
    }
  }

  // Se a tarefa requer habilidades específicas
  if (task.required_skills && task.required_skills.length > 0) {
    const personSkills = person.skills || []
    const hasRequiredSkills = task.required_skills.every(skill => 
      personSkills.includes(skill)
    )

    if (!hasRequiredSkills) {
      const missingSkills = task.required_skills.filter(skill => 
        !personSkills.includes(skill)
      )

      return {
        isValid: false,
        reason: 'missing_skills',
        message: `Requer habilidades: ${missingSkills.join(', ')}`,
        warning: true,
        missingSkills
      }
    }
  }

  // Se a tarefa tem restrições de nível
  if (task.required_level && person.level) {
    if (person.level < task.required_level) {
      return {
        isValid: false,
        reason: 'insufficient_level',
        message: `Requer nível ${task.required_level} (atual: ${person.level})`,
        warning: true
      }
    }
  }

  return { isValid: true }
}

/**
 * Valida dependências circulares
 * @param {String} taskId - ID da tarefa
 * @param {String} dependencyId - ID da dependência a adicionar
 * @param {Array} allTasks - Todas as tarefas
 * @returns {Object} Resultado da validação
 */
export const validateCircularDependency = (taskId, dependencyId, allTasks = []) => {
  if (taskId === dependencyId) {
    return {
      isValid: false,
      reason: 'self_dependency',
      message: 'Uma tarefa não pode depender de si mesma'
    }
  }

  // Verificar dependências circulares usando busca em profundidade
  const visited = new Set()
  const recursionStack = new Set()

  const hasCycle = (currentTaskId) => {
    if (recursionStack.has(currentTaskId)) {
      return true // Ciclo detectado
    }

    if (visited.has(currentTaskId)) {
      return false // Já verificado
    }

    visited.add(currentTaskId)
    recursionStack.add(currentTaskId)

    const currentTask = allTasks.find(t => t.id === currentTaskId)
    if (currentTask && currentTask.dependencies) {
      for (const depId of currentTask.dependencies) {
        if (hasCycle(depId)) {
          return true
        }
      }
    }

    recursionStack.delete(currentTaskId)
    return false
  }

  // Simular adição da nova dependência
  const taskWithNewDep = allTasks.find(t => t.id === taskId)
  if (taskWithNewDep) {
    const tempDependencies = [...(taskWithNewDep.dependencies || []), dependencyId]
    const tempTask = { ...taskWithNewDep, dependencies: tempDependencies }
    const tempAllTasks = allTasks.map(t => t.id === taskId ? tempTask : t)

    // Verificar ciclo começando da nova dependência
    if (hasCycle(dependencyId)) {
      return {
        isValid: false,
        reason: 'circular_dependency',
        message: 'Esta dependência criaria um ciclo'
      }
    }
  }

  return { isValid: true }
}

/**
 * Valida se uma tarefa pode ser deletada
 * @param {Object} task - Tarefa a ser deletada
 * @param {Array} allTasks - Todas as tarefas
 * @param {Object} user - Usuário atual
 * @returns {Object} Resultado da validação
 */
export const validateTaskDeletion = (task, allTasks = [], user) => {
  if (!task) {
    return {
      isValid: false,
      reason: 'missing_task',
      message: 'Tarefa não encontrada'
    }
  }

  // Verificar se existem tarefas dependentes
  const dependentTasks = allTasks.filter(t => 
    t.dependencies && t.dependencies.includes(task.id)
  )

  if (dependentTasks.length > 0) {
    return {
      isValid: false,
      reason: 'has_dependents',
      message: `${dependentTasks.length} tarefa(s) dependem desta`,
      dependentTasks: dependentTasks.map(t => ({ id: t.id, name: t.name }))
    }
  }

  // Verificar permissões
  const permissionValidation = validateUserPermissions(user, task.project_id, 'delete_tasks')
  if (!permissionValidation.isValid) {
    return permissionValidation
  }

  return { isValid: true }
}

/**
 * Valida dados de entrada para criação/edição de tarefa
 * @param {Object} taskData - Dados da tarefa
 * @param {Boolean} isEdit - Se é edição (true) ou criação (false)
 * @returns {Object} Resultado da validação
 */
export const validateTaskData = (taskData, isEdit = false) => {
  const errors = {}

  // Nome obrigatório
  if (!taskData.name || taskData.name.trim().length < 3) {
    errors.name = 'Nome deve ter pelo menos 3 caracteres'
  }

  if (taskData.name && taskData.name.length > 100) {
    errors.name = 'Nome não pode ter mais que 100 caracteres'
  }

  // Descrição
  if (taskData.description && taskData.description.length > 1000) {
    errors.description = 'Descrição não pode ter mais que 1000 caracteres'
  }

  // Atribuições
  if (!taskData.assigned_users || taskData.assigned_users.length === 0) {
    errors.assigned_users = 'Pelo menos uma pessoa deve ser atribuída'
  }

  // Etapas (apenas para criação)
  if (!isEdit && (!taskData.steps || taskData.steps.length === 0)) {
    errors.steps = 'Pelo menos uma etapa deve ser definida'
  }

  if (taskData.steps) {
    taskData.steps.forEach((step, index) => {
      if (!step.name || step.name.trim().length < 2) {
        errors[`step_${index}`] = `Etapa ${index + 1}: nome muito curto`
      }
    })
  }

  // Status
  const validStatuses = ['não_iniciada', 'em_andamento', 'pausada', 'concluída']
  if (taskData.status && !validStatuses.includes(taskData.status)) {
    errors.status = 'Status inválido'
  }

  const isValid = Object.keys(errors).length === 0

  return {
    isValid,
    errors,
    message: isValid ? 'Dados válidos' : 'Corrija os erros indicados'
  }
}

/**
 * Valida se um comentário pode ser adicionado
 * @param {Object} commentData - Dados do comentário
 * @param {Object} user - Usuário
 * @param {Object} task - Tarefa
 * @returns {Object} Resultado da validação
 */
export const validateComment = (commentData, user, task) => {
  if (!commentData.content || commentData.content.trim().length === 0) {
    return {
      isValid: false,
      reason: 'empty_content',
      message: 'Comentário não pode estar vazio'
    }
  }

  if (commentData.content.length > 2000) {
    return {
      isValid: false,
      reason: 'content_too_long',
      message: 'Comentário muito longo (máximo: 2000 caracteres)'
    }
  }

  // Verificar se usuário pode comentar na tarefa
  const permissionValidation = validateUserPermissions(user, task.project_id, 'comment_tasks')
  if (!permissionValidation.isValid) {
    return permissionValidation
  }

  return { isValid: true }
}