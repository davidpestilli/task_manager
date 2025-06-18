// Sistema de permissões para projetos

/**
 * Níveis de acesso no projeto
 */
export const PROJECT_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin', 
  MEMBER: 'member',
  VIEWER: 'viewer'
}

/**
 * Ações disponíveis no projeto
 */
export const PROJECT_ACTIONS = {
  // Gestão do projeto
  VIEW_PROJECT: 'view_project',
  EDIT_PROJECT: 'edit_project',
  DELETE_PROJECT: 'delete_project',
  
  // Gestão de membros
  VIEW_MEMBERS: 'view_members',
  ADD_MEMBERS: 'add_members',
  REMOVE_MEMBERS: 'remove_members',
  CHANGE_MEMBER_ROLE: 'change_member_role',
  
  // Gestão de tarefas
  VIEW_TASKS: 'view_tasks',
  CREATE_TASKS: 'create_tasks',
  EDIT_TASKS: 'edit_tasks',
  DELETE_TASKS: 'delete_tasks',
  ASSIGN_TASKS: 'assign_tasks',
  
  // Comentários
  VIEW_COMMENTS: 'view_comments',
  CREATE_COMMENTS: 'create_comments',
  EDIT_COMMENTS: 'edit_comments',
  DELETE_COMMENTS: 'delete_comments',
  
  // Configurações avançadas
  MANAGE_WEBHOOKS: 'manage_webhooks',
  EXPORT_DATA: 'export_data',
  VIEW_ANALYTICS: 'view_analytics'
}

/**
 * Matriz de permissões por role
 */
const PERMISSIONS_MATRIX = {
  [PROJECT_ROLES.OWNER]: [
    // Todas as permissões
    ...Object.values(PROJECT_ACTIONS)
  ],
  
  [PROJECT_ROLES.ADMIN]: [
    // Gestão do projeto (exceto deletar)
    PROJECT_ACTIONS.VIEW_PROJECT,
    PROJECT_ACTIONS.EDIT_PROJECT,
    
    // Gestão de membros
    PROJECT_ACTIONS.VIEW_MEMBERS,
    PROJECT_ACTIONS.ADD_MEMBERS,
    PROJECT_ACTIONS.REMOVE_MEMBERS,
    // Não pode alterar role de outros admins/owner
    
    // Gestão de tarefas
    PROJECT_ACTIONS.VIEW_TASKS,
    PROJECT_ACTIONS.CREATE_TASKS,
    PROJECT_ACTIONS.EDIT_TASKS,
    PROJECT_ACTIONS.DELETE_TASKS,
    PROJECT_ACTIONS.ASSIGN_TASKS,
    
    // Comentários
    PROJECT_ACTIONS.VIEW_COMMENTS,
    PROJECT_ACTIONS.CREATE_COMMENTS,
    PROJECT_ACTIONS.EDIT_COMMENTS,
    PROJECT_ACTIONS.DELETE_COMMENTS,
    
    // Configurações avançadas
    PROJECT_ACTIONS.MANAGE_WEBHOOKS,
    PROJECT_ACTIONS.EXPORT_DATA,
    PROJECT_ACTIONS.VIEW_ANALYTICS
  ],
  
  [PROJECT_ROLES.MEMBER]: [
    // Visualização do projeto
    PROJECT_ACTIONS.VIEW_PROJECT,
    
    // Visualização de membros
    PROJECT_ACTIONS.VIEW_MEMBERS,
    
    // Gestão de tarefas (modelo colaborativo)
    PROJECT_ACTIONS.VIEW_TASKS,
    PROJECT_ACTIONS.CREATE_TASKS,
    PROJECT_ACTIONS.EDIT_TASKS,
    PROJECT_ACTIONS.ASSIGN_TASKS,
    
    // Comentários
    PROJECT_ACTIONS.VIEW_COMMENTS,
    PROJECT_ACTIONS.CREATE_COMMENTS,
    PROJECT_ACTIONS.EDIT_COMMENTS, // Apenas próprios comentários
    
    // Exportação básica
    PROJECT_ACTIONS.EXPORT_DATA
  ],
  
  [PROJECT_ROLES.VIEWER]: [
    // Apenas visualização
    PROJECT_ACTIONS.VIEW_PROJECT,
    PROJECT_ACTIONS.VIEW_MEMBERS,
    PROJECT_ACTIONS.VIEW_TASKS,
    PROJECT_ACTIONS.VIEW_COMMENTS
  ]
}

/**
 * Verifica se usuário tem permissão para executar uma ação
 * 
 * @param {string} userRole - Role do usuário no projeto
 * @param {string} action - Ação a ser verificada
 * @param {Object} context - Contexto adicional (usuário, recurso, etc.)
 * @returns {boolean}
 */
export const hasPermission = (userRole, action, context = {}) => {
  if (!userRole || !action) return false
  
  const rolePermissions = PERMISSIONS_MATRIX[userRole] || []
  
  // Verificação básica de permissão
  if (!rolePermissions.includes(action)) {
    return false
  }
  
  // Verificações contextuais específicas
  return checkContextualPermissions(userRole, action, context)
}

/**
 * Verificações contextuais específicas
 * 
 * @param {string} userRole - Role do usuário
 * @param {string} action - Ação
 * @param {Object} context - Contexto
 * @returns {boolean}
 */
const checkContextualPermissions = (userRole, action, context) => {
  const { user, targetUser, resource, project } = context
  
  switch (action) {
    case PROJECT_ACTIONS.REMOVE_MEMBERS:
      // Owner pode remover qualquer um
      if (userRole === PROJECT_ROLES.OWNER) return true
      
      // Admin não pode remover owner ou outros admins
      if (userRole === PROJECT_ROLES.ADMIN && targetUser) {
        return targetUser.role === PROJECT_ROLES.MEMBER || targetUser.role === PROJECT_ROLES.VIEWER
      }
      
      return false
      
    case PROJECT_ACTIONS.CHANGE_MEMBER_ROLE:
      // Apenas owner pode alterar roles
      return userRole === PROJECT_ROLES.OWNER
      
    case PROJECT_ACTIONS.EDIT_COMMENTS:
    case PROJECT_ACTIONS.DELETE_COMMENTS:
      // Usuários podem editar/deletar apenas próprios comentários
      // Admins e owners podem editar/deletar qualquer comentário
      if (userRole === PROJECT_ROLES.OWNER || userRole === PROJECT_ROLES.ADMIN) {
        return true
      }
      
      if (resource && user) {
        return resource.user_id === user.id
      }
      
      return false
      
    case PROJECT_ACTIONS.DELETE_TASKS:
      // Apenas admins e owners podem deletar tarefas
      return userRole === PROJECT_ROLES.OWNER || userRole === PROJECT_ROLES.ADMIN
      
    default:
      return true
  }
}

/**
 * Retorna todas as permissões de um role
 * 
 * @param {string} role - Role do usuário
 * @returns {Array<string>}
 */
export const getRolePermissions = (role) => {
  return PERMISSIONS_MATRIX[role] || []
}

/**
 * Verifica se usuário pode executar múltiplas ações
 * 
 * @param {string} userRole - Role do usuário
 * @param {Array<string>} actions - Array de ações
 * @param {Object} context - Contexto
 * @returns {Object} - Objeto com resultado para cada ação
 */
export const hasMultiplePermissions = (userRole, actions, context = {}) => {
  return actions.reduce((acc, action) => {
    acc[action] = hasPermission(userRole, action, context)
    return acc
  }, {})
}

/**
 * Middleware para verificação de permissões em componentes
 * 
 * @param {string} requiredPermission - Permissão necessária
 * @param {string} userRole - Role do usuário
 * @param {Object} context - Contexto
 * @returns {boolean}
 */
export const usePermissionCheck = (requiredPermission, userRole, context = {}) => {
  return hasPermission(userRole, requiredPermission, context)
}

/**
 * Hook para verificar permissões em tempo real
 * 
 * @param {Object} project - Projeto atual
 * @param {Object} user - Usuário atual
 * @returns {Object} - Objeto com funções de verificação
 */
export const useProjectPermissions = (project, user) => {
  const userMembership = project?.members?.find(member => member.user_id === user?.id)
  const userRole = userMembership?.role || null
  
  return {
    userRole,
    can: (action, context = {}) => hasPermission(userRole, action, { user, project, ...context }),
    canAny: (actions, context = {}) => actions.some(action => hasPermission(userRole, action, { user, project, ...context })),
    canAll: (actions, context = {}) => actions.every(action => hasPermission(userRole, action, { user, project, ...context })),
    permissions: getRolePermissions(userRole),
    isOwner: userRole === PROJECT_ROLES.OWNER,
    isAdmin: userRole === PROJECT_ROLES.ADMIN,
    isMember: userRole === PROJECT_ROLES.MEMBER,
    isViewer: userRole === PROJECT_ROLES.VIEWER,
    hasAnyRole: Boolean(userRole)
  }
}

/**
 * Determina o role mais alto entre dois roles
 * 
 * @param {string} role1 - Primeiro role
 * @param {string} role2 - Segundo role
 * @returns {string} - Role com maior permissão
 */
export const getHighestRole = (role1, role2) => {
  const roleHierarchy = [
    PROJECT_ROLES.VIEWER,
    PROJECT_ROLES.MEMBER,
    PROJECT_ROLES.ADMIN,
    PROJECT_ROLES.OWNER
  ]
  
  const index1 = roleHierarchy.indexOf(role1)
  const index2 = roleHierarchy.indexOf(role2)
  
  return index1 > index2 ? role1 : role2
}

/**
 * Verifica se um role pode promover outro role
 * 
 * @param {string} promoterRole - Role de quem está promovendo
 * @param {string} currentRole - Role atual do usuário
 * @param {string} targetRole - Role desejado
 * @returns {boolean}
 */
export const canPromoteToRole = (promoterRole, currentRole, targetRole) => {
  // Apenas owners podem alterar roles
  if (promoterRole !== PROJECT_ROLES.OWNER) return false
  
  // Não pode promover para owner
  if (targetRole === PROJECT_ROLES.OWNER) return false
  
  // Não pode promover um owner
  if (currentRole === PROJECT_ROLES.OWNER) return false
  
  return true
}