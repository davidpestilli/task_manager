/**
 * Constantes para papéis e permissões de usuários
 * 
 * Define os diferentes papéis de usuário no sistema e suas respectivas
 * permissões para projetos e tarefas.
 */

// Papéis básicos no sistema
export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer'
}

// Configurações visuais e informações dos papéis
export const USER_ROLES_CONFIG = {
  [USER_ROLES.OWNER]: {
    label: 'Proprietário',
    description: 'Criador do projeto com acesso total',
    color: '#7C3AED', // purple-600
    bgColor: '#EDE9FE', // purple-100
    textColor: '#5B21B6', // purple-800
    icon: 'Crown',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    level: 4,
    isTransferable: true,
    canBeRemoved: false
  },
  [USER_ROLES.ADMIN]: {
    label: 'Administrador',
    description: 'Gerencia projeto e membros',
    color: '#DC2626', // red-600
    bgColor: '#FEE2E2', // red-100
    textColor: '#991B1B', // red-800
    icon: 'Shield',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
    level: 3,
    isTransferable: false,
    canBeRemoved: true
  },
  [USER_ROLES.MEMBER]: {
    label: 'Membro',
    description: 'Participa ativamente do projeto',
    color: '#3B82F6', // blue-600
    bgColor: '#DBEAFE', // blue-100
    textColor: '#1E40AF', // blue-800
    icon: 'User',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    level: 2,
    isTransferable: false,
    canBeRemoved: true
  },
  [USER_ROLES.VIEWER]: {
    label: 'Visualizador',
    description: 'Acesso somente leitura',
    color: '#6B7280', // gray-500
    bgColor: '#F3F4F6', // gray-100
    textColor: '#374151', // gray-700
    icon: 'Eye',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
    level: 1,
    isTransferable: false,
    canBeRemoved: true
  }
}

// Permissões específicas por papel
export const ROLE_PERMISSIONS = {
  [USER_ROLES.OWNER]: {
    // Projeto
    project: {
      view: true,
      edit: true,
      delete: true,
      archive: true,
      settings: true,
      export: true
    },
    // Membros
    members: {
      view: true,
      invite: true,
      remove: true,
      changeRole: true,
      transferOwnership: true
    },
    // Tarefas
    tasks: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      assign: true,
      changeStatus: true,
      addSteps: true,
      editSteps: true,
      deleteSteps: true
    },
    // Comentários
    comments: {
      view: true,
      create: true,
      edit: true, // próprios comentários
      delete: true, // próprios comentários
      deleteOthers: true
    },
    // Dependências
    dependencies: {
      view: true,
      create: true,
      edit: true,
      delete: true
    },
    // Webhooks
    webhooks: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      test: true
    },
    // Notificações
    notifications: {
      view: true,
      configure: true
    },
    // Exportação
    export: {
      pdf: true,
      csv: true,
      json: true
    }
  },

  [USER_ROLES.ADMIN]: {
    // Projeto
    project: {
      view: true,
      edit: true,
      delete: false,
      archive: true,
      settings: true,
      export: true
    },
    // Membros
    members: {
      view: true,
      invite: true,
      remove: true,
      changeRole: true,
      transferOwnership: false
    },
    // Tarefas
    tasks: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      assign: true,
      changeStatus: true,
      addSteps: true,
      editSteps: true,
      deleteSteps: true
    },
    // Comentários
    comments: {
      view: true,
      create: true,
      edit: true, // próprios comentários
      delete: true, // próprios comentários
      deleteOthers: false
    },
    // Dependências
    dependencies: {
      view: true,
      create: true,
      edit: true,
      delete: true
    },
    // Webhooks
    webhooks: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      test: true
    },
    // Notificações
    notifications: {
      view: true,
      configure: true
    },
    // Exportação
    export: {
      pdf: true,
      csv: true,
      json: true
    }
  },

  [USER_ROLES.MEMBER]: {
    // Projeto
    project: {
      view: true,
      edit: false,
      delete: false,
      archive: false,
      settings: false,
      export: true
    },
    // Membros
    members: {
      view: true,
      invite: false,
      remove: false,
      changeRole: false,
      transferOwnership: false
    },
    // Tarefas
    tasks: {
      view: true,
      create: true,
      edit: true,
      delete: false, // apenas próprias tarefas criadas
      assign: true,
      changeStatus: true,
      addSteps: true,
      editSteps: true,
      deleteSteps: false
    },
    // Comentários
    comments: {
      view: true,
      create: true,
      edit: true, // próprios comentários
      delete: true, // próprios comentários
      deleteOthers: false
    },
    // Dependências
    dependencies: {
      view: true,
      create: true,
      edit: true,
      delete: false
    },
    // Webhooks
    webhooks: {
      view: false,
      create: false,
      edit: false,
      delete: false,
      test: false
    },
    // Notificações
    notifications: {
      view: true,
      configure: true
    },
    // Exportação
    export: {
      pdf: true,
      csv: true,
      json: false
    }
  },

  [USER_ROLES.VIEWER]: {
    // Projeto
    project: {
      view: true,
      edit: false,
      delete: false,
      archive: false,
      settings: false,
      export: false
    },
    // Membros
    members: {
      view: true,
      invite: false,
      remove: false,
      changeRole: false,
      transferOwnership: false
    },
    // Tarefas
    tasks: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      assign: false,
      changeStatus: false,
      addSteps: false,
      editSteps: false,
      deleteSteps: false
    },
    // Comentários
    comments: {
      view: true,
      create: false,
      edit: false,
      delete: false,
      deleteOthers: false
    },
    // Dependências
    dependencies: {
      view: true,
      create: false,
      edit: false,
      delete: false
    },
    // Webhooks
    webhooks: {
      view: false,
      create: false,
      edit: false,
      delete: false,
      test: false
    },
    // Notificações
    notifications: {
      view: true,
      configure: false
    },
    // Exportação
    export: {
      pdf: false,
      csv: false,
      json: false
    }
  }
}

// Hierarquia de papéis (para comparações)
export const ROLE_HIERARCHY = {
  [USER_ROLES.OWNER]: 4,
  [USER_ROLES.ADMIN]: 3,
  [USER_ROLES.MEMBER]: 2,
  [USER_ROLES.VIEWER]: 1
}

// Funções utilitárias para trabalhar com papéis
export const userRoleUtils = {
  /**
   * Verifica se um usuário tem permissão específica
   */
  hasPermission: (userRole, category, action) => {
    const permissions = ROLE_PERMISSIONS[userRole]
    return permissions?.[category]?.[action] ?? false
  },

  /**
   * Verifica se um papel tem nível superior a outro
   */
  isHigherRole: (role1, role2) => {
    return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2]
  },

  /**
   * Verifica se um papel tem nível igual ou superior a outro
   */
  isEqualOrHigherRole: (role1, role2) => {
    return ROLE_HIERARCHY[role1] >= ROLE_HIERARCHY[role2]
  },

  /**
   * Obtém a configuração visual de um papel
   */
  getRoleConfig: (role) => {
    return USER_ROLES_CONFIG[role] || USER_ROLES_CONFIG[USER_ROLES.VIEWER]
  },

  /**
   * Obtém papéis que um usuário pode atribuir a outros
   */
  getAssignableRoles: (currentUserRole) => {
    const currentLevel = ROLE_HIERARCHY[currentUserRole]
    return Object.entries(ROLE_HIERARCHY)
      .filter(([role, level]) => level < currentLevel)
      .map(([role]) => role)
  },

  /**
   * Verifica se um papel pode ser removido do projeto
   */
  canBeRemoved: (role) => {
    return USER_ROLES_CONFIG[role]?.canBeRemoved ?? true
  },

  /**
   * Verifica se um papel pode ser transferido
   */
  canBeTransferred: (role) => {
    return USER_ROLES_CONFIG[role]?.isTransferable ?? false
  },

  /**
   * Filtra ações baseadas nas permissões do usuário
   */
  filterActions: (userRole, actions) => {
    return actions.filter(action => {
      if (!action.permission) return true
      const [category, permission] = action.permission.split('.')
      return userRoleUtils.hasPermission(userRole, category, permission)
    })
  },

  /**
   * Verifica se pode gerenciar outro usuário
   */
  canManageUser: (managerRole, targetRole) => {
    // Owner pode gerenciar todos
    if (managerRole === USER_ROLES.OWNER) return true
    
    // Admin pode gerenciar membros e viewers
    if (managerRole === USER_ROLES.ADMIN) {
      return [USER_ROLES.MEMBER, USER_ROLES.VIEWER].includes(targetRole)
    }
    
    return false
  },

  /**
   * Obtém papel padrão para novos membros
   */
  getDefaultRole: () => {
    return USER_ROLES.MEMBER
  }
}

// Arrays para facilitar iteração e seleção
export const USER_ROLES_OPTIONS = Object.entries(USER_ROLES_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
  description: config.description,
  icon: config.icon,
  color: config.color,
  level: config.level
})).sort((a, b) => b.level - a.level) // Ordenar por nível descendente

// Papéis que podem ser atribuídos (excluindo owner)
export const ASSIGNABLE_ROLES = USER_ROLES_OPTIONS.filter(role => 
  role.value !== USER_ROLES.OWNER
)

// Export default com todas as constantes
export default {
  USER_ROLES,
  USER_ROLES_CONFIG,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  userRoleUtils,
  USER_ROLES_OPTIONS,
  ASSIGNABLE_ROLES
}