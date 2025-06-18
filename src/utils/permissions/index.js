// Sistema de permissões - Exportações principais

// Permissões de projeto
export {
  PROJECT_ROLES,
  PROJECT_ACTIONS,
  hasPermission,
  getRolePermissions,
  hasMultiplePermissions,
  usePermissionCheck,
  useProjectPermissions,
  getHighestRole,
  canPromoteToRole
} from './projectPermissions'

// Permissões de tarefa
export {
  TASK_STATUS,
  TASK_ACTIONS,
  canPerformTaskAction,
  canChangeTaskStatus,
  canAssignUserToTask,
  useTaskPermissions,
  getBulkTaskPermissions,
  canTransferTask
} from './taskPermissions'

/**
 * Utilitários gerais de permissão
 */

/**
 * Combina verificações de permissão de projeto e tarefa
 * 
 * @param {Object} user - Usuário
 * @param {string} projectAction - Ação no projeto
 * @param {string} taskAction - Ação na tarefa
 * @param {Object} task - Tarefa
 * @param {Object} project - Projeto
 * @returns {boolean}
 */
export const hasProjectAndTaskPermission = (user, projectAction, taskAction, task, project) => {
  const userMembership = project?.members?.find(member => member.user_id === user?.id)
  const userRole = userMembership?.role
  
  // Verificar permissão no projeto
  const hasProjectPerm = hasPermission(userRole, projectAction)
  if (!hasProjectPerm) return false
  
  // Verificar permissão na tarefa se especificada
  if (taskAction && task) {
    return canPerformTaskAction(user, taskAction, task, project)
  }
  
  return true
}

/**
 * Middleware de verificação de permissões para componentes React
 * 
 * @param {Object} permissions - Objeto com as permissões necessárias
 * @param {Object} user - Usuário atual
 * @param {Object} project - Projeto atual
 * @param {Object} task - Tarefa atual (opcional)
 * @returns {boolean}
 */
export const checkPermissions = (permissions, user, project, task = null) => {
  const { projectAction, taskAction, requireAll = false } = permissions
  
  // Se não há permissões especificadas, permitir
  if (!projectAction && !taskAction) return true
  
  const checks = []
  
  // Verificar permissão de projeto
  if (projectAction) {
    const userRole = project?.members?.find(m => m.user_id === user?.id)?.role
    checks.push(hasPermission(userRole, projectAction))
  }
  
  // Verificar permissão de tarefa
  if (taskAction && task) {
    checks.push(canPerformTaskAction(user, taskAction, task, project))
  }
  
  // Retornar baseado na estratégia (todos ou algum)
  return requireAll ? checks.every(Boolean) : checks.some(Boolean)
}

/**
 * Componente HOC para proteção de permissões
 * 
 * @param {React.Component} Component - Componente a ser protegido
 * @param {Object} permissions - Permissões necessárias
 * @returns {React.Component}
 */
export const withPermissions = (Component, permissions) => {
  return function PermissionWrappedComponent(props) {
    const { user, project, task, fallback = null } = props
    
    const hasAccess = checkPermissions(permissions, user, project, task)
    
    if (!hasAccess) {
      return fallback
    }
    
    return <Component {...props} />
  }
}

/**
 * Hook para verificação de múltiplas permissões
 * 
 * @param {Object} user - Usuário atual
 * @param {Object} project - Projeto atual
 * @param {Object} task - Tarefa atual (opcional)
 * @returns {Object} - Objeto com funções de verificação
 */
export const usePermissions = (user, project, task = null) => {
  const projectPermissions = useProjectPermissions(project, user)
  const taskPermissions = task ? useTaskPermissions(user, task, project) : null
  
  return {
    // Permissões de projeto
    project: projectPermissions,
    
    // Permissões de tarefa
    task: taskPermissions,
    
    // Verificações combinadas
    canManageProject: projectPermissions.can(PROJECT_ACTIONS.EDIT_PROJECT),
    canManageMembers: projectPermissions.can(PROJECT_ACTIONS.ADD_MEMBERS),
    canCreateTasks: projectPermissions.can(PROJECT_ACTIONS.CREATE_TASKS),
    canExportData: projectPermissions.can(PROJECT_ACTIONS.EXPORT_DATA),
    
    // Função helper para verificações complexas
    check: (permissions) => checkPermissions(permissions, user, project, task),
    
    // Informações contextuais
    isProjectMember: projectPermissions.hasAnyRole,
    isTaskAssigned: taskPermissions?.isAssigned || false,
    userRole: projectPermissions.userRole
  }
}

/**
 * Constantes para verificações rápidas
 */
export const PERMISSION_PRESETS = {
  // Permissões de visualização
  VIEW_ONLY: {
    projectAction: PROJECT_ACTIONS.VIEW_PROJECT,
    taskAction: TASK_ACTIONS.VIEW_TASK
  },
  
  // Permissões básicas de membro
  MEMBER_ACCESS: {
    projectAction: PROJECT_ACTIONS.CREATE_TASKS,
    taskAction: TASK_ACTIONS.ADD_COMMENT
  },
  
  // Permissões administrativas
  ADMIN_ACCESS: {
    projectAction: PROJECT_ACTIONS.ADD_MEMBERS,
    taskAction: TASK_ACTIONS.DELETE_TASK,
    requireAll: true
  },
  
  // Permissões de proprietário
  OWNER_ACCESS: {
    projectAction: PROJECT_ACTIONS.DELETE_PROJECT,
    requireAll: true
  }
}

/**
 * Função para debug de permissões (desenvolvimento)
 */
export const debugPermissions = (user, project, task = null) => {
  if (process.env.NODE_ENV !== 'development') return
  
  console.group('🔐 Debug de Permissões')
  
  console.log('👤 Usuário:', user?.id, user?.full_name)
  console.log('📁 Projeto:', project?.id, project?.name)
  if (task) console.log('✅ Tarefa:', task?.id, task?.name)
  
  const permissions = usePermissions(user, project, task)
  
  console.log('🔑 Role no projeto:', permissions.userRole)
  console.log('📋 Permissões de projeto:', permissions.project.permissions)
  
  if (task) {
    console.log('✅ Atribuído à tarefa:', permissions.task.isAssigned)
    console.log('👨‍💻 Criador da tarefa:', permissions.task.isCreator)
  }
  
  console.groupEnd()
}