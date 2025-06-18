// taskPermissions.js// Sistema de permissões para tarefas

import { PROJECT_ROLES, hasPermission as hasProjectPermission, PROJECT_ACTIONS } from './projectPermissions'

/**
 * Estados das tarefas para controle de permissões
 */
export const TASK_STATUS = {
  NOT_STARTED: 'não_iniciada',
  IN_PROGRESS: 'em_andamento', 
  PAUSED: 'pausada',
  COMPLETED: 'concluída'
}

/**
 * Ações específicas de tarefas
 */
export const TASK_ACTIONS = {
  // CRUD básico
  VIEW_TASK: 'view_task',
  CREATE_TASK: 'create_task',
  EDIT_TASK: 'edit_task',
  DELETE_TASK: 'delete_task',
  
  // Atribuições
  ASSIGN_TASK: 'assign_task',
  UNASSIGN_TASK: 'unassign_task',
  TRANSFER_TASK: 'transfer_task',
  
  // Status e progresso
  CHANGE_STATUS: 'change_status',
  MARK_STEP_COMPLETE: 'mark_step_complete',
  ADD_STEPS: 'add_steps',
  EDIT_STEPS: 'edit_steps',
  DELETE_STEPS: 'delete_steps',
  
  // Dependências
  ADD_DEPENDENCY: 'add_dependency',
  REMOVE_DEPENDENCY: 'remove_dependency',
  
  // Comentários
  VIEW_TASK_COMMENTS: 'view_task_comments',
  ADD_COMMENT: 'add_comment',
  EDIT_COMMENT: 'edit_comment',
  DELETE_COMMENT: 'delete_comment',
  
  // Histórico
  VIEW_TASK_HISTORY: 'view_task_history'
}

/**
 * Verifica se usuário pode executar ação em uma tarefa
 * 
 * @param {Object} user - Usuário atual
 * @param {string} action - Ação a ser verificada
 * @param {Object} task - Tarefa em questão
 * @param {Object} project - Projeto da tarefa
 * @returns {boolean}
 */
export const canPerformTaskAction = (user, action, task, project) => {
  if (!user || !action || !task || !project) return false
  
  // Buscar role do usuário no projeto
  const userMembership = project.members?.find(member => member.user_id === user.id)
  const userRole = userMembership?.role
  
  if (!userRole) return false
  
  // Verificar se usuário está atribuído à tarefa
  const isAssigned = task.assignments?.some(assignment => assignment.user_id === user.id)
  const isCreator = task.created_by === user.id
  
  return checkTaskPermission(userRole, action, {
    user,
    task,
    project,
    isAssigned,
    isCreator
  })
}

/**
 * Verificações específicas de permissões de tarefa
 * 
 * @param {string} userRole - Role do usuário no projeto
 * @param {string} action - Ação a ser verificada
 * @param {Object} context - Contexto da verificação
 * @returns {boolean}
 */
const checkTaskPermission = (userRole, action, context) => {
  const { user, task, isAssigned, isCreator } = context
  
  switch (action) {
    case TASK_ACTIONS.VIEW_TASK:
    case TASK_ACTIONS.VIEW_TASK_COMMENTS:
    case TASK_ACTIONS.VIEW_TASK_HISTORY:
      // Todos os membros podem visualizar tarefas
      return hasProjectPermission(userRole, PROJECT_ACTIONS.VIEW_TASKS)
      
    case TASK_ACTIONS.CREATE_TASK:
      // Todos os membros podem criar tarefas (modelo colaborativo)
      return hasProjectPermission(userRole, PROJECT_ACTIONS.CREATE_TASKS)
      
    case TASK_ACTIONS.EDIT_TASK:
    case TASK_ACTIONS.ADD_STEPS:
    case TASK_ACTIONS.EDIT_STEPS:
      // Membros podem editar se estão atribuídos ou criaram a tarefa
      // Admins e owners podem editar qualquer tarefa
      if (userRole === PROJECT_ROLES.OWNER || userRole === PROJECT_ROLES.ADMIN) {
        return true
      }
      return (isAssigned || isCreator) && hasProjectPermission(userRole, PROJECT_ACTIONS.EDIT_TASKS)
      
    case TASK_ACTIONS.DELETE_TASK:
    case TASK_ACTIONS.DELETE_STEPS:
      // Apenas admins e owners podem deletar tarefas/etapas
      return userRole === PROJECT_ROLES.OWNER || userRole === PROJECT_ROLES.ADMIN
      
    case TASK_ACTIONS.ASSIGN_TASK:
    case TASK_ACTIONS.UNASSIGN_TASK:
    case TASK_ACTIONS.TRANSFER_TASK:
      // Todos os membros podem atribuir tarefas (modelo colaborativo)
      return hasProjectPermission(userRole, PROJECT_ACTIONS.ASSIGN_TASKS)
      
    case TASK_ACTIONS.CHANGE_STATUS:
      // Usuários atribuídos, criador, admins e owners podem alterar status
      if (userRole === PROJECT_ROLES.OWNER || userRole === PROJECT_ROLES.ADMIN) {
        return true
      }
      return (isAssigned || isCreator) && hasProjectPermission(userRole, PROJECT_ACTIONS.EDIT_TASKS)
      
    case TASK_ACTIONS.MARK_STEP_COMPLETE:
      // Usuários atribuídos podem marcar etapas como completas
      // Admins e owners também podem
      if (userRole === PROJECT_ROLES.OWNER || userRole === PROJECT_ROLES.ADMIN) {
        return true
      }
      return isAssigned
      
    case TASK_ACTIONS.ADD_DEPENDENCY:
    case TASK_ACTIONS.REMOVE_DEPENDENCY:
      // Apenas usuários com permissão de edição podem gerenciar dependências
      return checkTaskPermission(userRole, TASK_ACTIONS.EDIT_TASK, context)
      
    case TASK_ACTIONS.ADD_COMMENT:
      // Todos os membros podem comentar
      return hasProjectPermission(userRole, PROJECT_ACTIONS.CREATE_COMMENTS)
      
    case TASK_ACTIONS.EDIT_COMMENT:
    case TASK_ACTIONS.DELETE_COMMENT:
      // Verifica se é próprio comentário ou tem permissão administrativa
      if (userRole === PROJECT_ROLES.OWNER || userRole === PROJECT_ROLES.ADMIN) {
        return true
      }
      // Esta verificação precisa ser feita no contexto específico do comentário
      return false
      
    default:
      return false
  }
}

/**
 * Verifica se tarefa pode ter seu status alterado considerando dependências
 * 
 * @param {Object} task - Tarefa
 * @param {string} newStatus - Novo status desejado
 * @param {Array} allTasks - Todas as tarefas do projeto (para verificar dependências)
 * @returns {Object} - {allowed: boolean, reason?: string}
 */
export const canChangeTaskStatus = (task, newStatus, allTasks = []) => {
  // Se não está mudando para "em andamento", permitir
  if (newStatus !== TASK_STATUS.IN_PROGRESS) {
    return { allowed: true }
  }
  
  // Verificar se todas as dependências foram concluídas
  if (task.dependencies && task.dependencies.length > 0) {
    const dependentTasks = allTasks.filter(t => 
      task.dependencies.includes(t.id)
    )
    
    const incompleteDependencies = dependentTasks.filter(t => 
      t.status !== TASK_STATUS.COMPLETED
    )
    
    if (incompleteDependencies.length > 0) {
      return {
        allowed: false,
        reason: `Esta tarefa depende de ${incompleteDependencies.length} tarefa(s) que ainda não foram concluídas`,
        blockedBy: incompleteDependencies.map(t => t.name)
      }
    }
  }
  
  return { allowed: true }
}

/**
 * Verifica se usuário pode ser atribuído a uma tarefa
 * 
 * @param {Object} user - Usuário a ser atribuído
 * @param {Object} task - Tarefa
 * @param {Object} project - Projeto
 * @returns {Object} - {allowed: boolean, reason?: string}
 */
export const canAssignUserToTask = (user, task, project) => {
  // Verificar se usuário é membro do projeto
  const isMember = project.members?.some(member => member.user_id === user.id)
  
  if (!isMember) {
    return {
      allowed: false,
      reason: 'Usuário não é membro do projeto'
    }
  }
  
  // Verificar se usuário já está atribuído
  const isAlreadyAssigned = task.assignments?.some(assignment => assignment.user_id === user.id)
  
  if (isAlreadyAssigned) {
    return {
      allowed: false,
      reason: 'Usuário já está atribuído a esta tarefa'
    }
  }
  
  // Verificar limite de tarefas por usuário (opcional)
  const userActiveTasks = project.tasks?.filter(t => 
    t.status !== TASK_STATUS.COMPLETED && 
    t.assignments?.some(a => a.user_id === user.id)
  ).length || 0
  
  const MAX_ACTIVE_TASKS = 10 // Configurável
  
  if (userActiveTasks >= MAX_ACTIVE_TASKS) {
    return {
      allowed: false,
      reason: `Usuário já possui ${userActiveTasks} tarefas ativas (limite: ${MAX_ACTIVE_TASKS})`
    }
  }
  
  return { allowed: true }
}

/**
 * Hook para permissões de tarefa
 * 
 * @param {Object} user - Usuário atual
 * @param {Object} task - Tarefa atual
 * @param {Object} project - Projeto atual
 * @returns {Object} - Objeto com funções de verificação
 */
export const useTaskPermissions = (user, task, project) => {
  const can = (action, context = {}) => {
    return canPerformTaskAction(user, action, task, project, context)
  }
  
  const canChangeStatus = (newStatus, allTasks = []) => {
    return canChangeTaskStatus(task, newStatus, allTasks)
  }
  
  const canAssignUser = (targetUser) => {
    return canAssignUserToTask(targetUser, task, project)
  }
  
  // Informações contextuais
  const isAssigned = task?.assignments?.some(assignment => assignment.user_id === user?.id) || false
  const isCreator = task?.created_by === user?.id || false
  const userMembership = project?.members?.find(member => member.user_id === user?.id)
  const userRole = userMembership?.role
  
  return {
    can,
    canChangeStatus,
    canAssignUser,
    isAssigned,
    isCreator,
    userRole,
    isOwner: userRole === PROJECT_ROLES.OWNER,
    isAdmin: userRole === PROJECT_ROLES.ADMIN,
    canEdit: can(TASK_ACTIONS.EDIT_TASK),
    canDelete: can(TASK_ACTIONS.DELETE_TASK),
    canComment: can(TASK_ACTIONS.ADD_COMMENT),
    canMarkSteps: can(TASK_ACTIONS.MARK_STEP_COMPLETE),
    canManageDependencies: can(TASK_ACTIONS.ADD_DEPENDENCY)
  }
}

/**
 * Calcula permissões em lote para múltiplas tarefas
 * 
 * @param {Object} user - Usuário
 * @param {Array} tasks - Lista de tarefas
 * @param {Object} project - Projeto
 * @returns {Object} - Mapa taskId -> permissões
 */
export const getBulkTaskPermissions = (user, tasks, project) => {
  return tasks.reduce((acc, task) => {
    acc[task.id] = useTaskPermissions(user, task, project)
    return acc
  }, {})
}

/**
 * Verifica se usuário pode transferir tarefa entre pessoas
 * 
 * @param {Object} user - Usuário executando a transferência
 * @param {Object} task - Tarefa
 * @param {Object} fromUser - Usuário atual da tarefa
 * @param {Object} toUser - Usuário destino
 * @param {Object} project - Projeto
 * @returns {Object}
 */
export const canTransferTask = (user, task, fromUser, toUser, project) => {
  // Verificar permissão básica de transferência
  if (!canPerformTaskAction(user, TASK_ACTIONS.TRANSFER_TASK, task, project)) {
    return {
      allowed: false,
      reason: 'Sem permissão para transferir tarefas'
    }
  }
  
  // Verificar se usuário destino pode receber a tarefa
  const assignmentCheck = canAssignUserToTask(toUser, task, project)
  if (!assignmentCheck.allowed) {
    return assignmentCheck
  }
  
  return { allowed: true }
}