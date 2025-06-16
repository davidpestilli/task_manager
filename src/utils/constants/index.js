/**
 * Export centralizado de todas as constantes utilitárias
 * 
 * Este arquivo centraliza todos os exports das constantes da aplicação,
 * facilitando imports e manutenção.
 */

// Export de status de tarefas
export {
  TASK_STATUS,
  TASK_STATUS_CONFIG,
  TASK_STATUS_TRANSITIONS,
  TASK_PRIORITY,
  TASK_PRIORITY_CONFIG,
  TASK_TYPE,
  TASK_TYPE_CONFIG,
  taskStatusUtils,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  TASK_TYPE_OPTIONS
} from './taskStatus'

// Export de papéis de usuário
export {
  USER_ROLES,
  USER_ROLES_CONFIG,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  userRoleUtils,
  USER_ROLES_OPTIONS,
  ASSIGNABLE_ROLES
} from './userRoles'

// Export de eventos de webhook
export {
  WEBHOOK_CATEGORIES,
  WEBHOOK_EVENTS,
  WEBHOOK_EVENTS_CONFIG,
  WEBHOOK_STATUS,
  WEBHOOK_STATUS_CONFIG,
  WEBHOOK_METHODS,
  WEBHOOK_HEADERS,
  webhookUtils,
  WEBHOOK_EVENTS_OPTIONS,
  WEBHOOK_CATEGORIES_OPTIONS,
  WEBHOOK_STATUS_OPTIONS
} from './webhookEvents'

// Export de tipos de notificação
export {
  NOTIFICATION_TYPES,
  NOTIFICATION_CONFIG,
  NOTIFICATION_PRIORITY,
  NOTIFICATION_PRIORITY_CONFIG,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_CONFIG,
  NOTIFICATION_STATUS,
  NOTIFICATION_STATUS_CONFIG,
  notificationUtils,
  NOTIFICATION_TYPE_OPTIONS,
  NOTIFICATION_CATEGORY_OPTIONS,
  NOTIFICATION_PRIORITY_OPTIONS
} from './notificationTypes'

// Export default agrupado por categoria para imports específicos
export default {
  // Tarefas
  task: {
    STATUS: {
      TASK_STATUS,
      TASK_STATUS_CONFIG,
      TASK_STATUS_TRANSITIONS,
      TASK_STATUS_OPTIONS
    },
    PRIORITY: {
      TASK_PRIORITY,
      TASK_PRIORITY_CONFIG,
      TASK_PRIORITY_OPTIONS
    },
    TYPE: {
      TASK_TYPE,
      TASK_TYPE_CONFIG,
      TASK_TYPE_OPTIONS
    },
    utils: {
      taskStatusUtils
    }
  },

  // Usuários e Papéis
  user: {
    ROLES: {
      USER_ROLES,
      USER_ROLES_CONFIG,
      USER_ROLES_OPTIONS,
      ASSIGNABLE_ROLES
    },
    PERMISSIONS: {
      ROLE_PERMISSIONS,
      ROLE_HIERARCHY
    },
    utils: {
      userRoleUtils
    }
  },

  // Webhooks
  webhook: {
    CATEGORIES: {
      WEBHOOK_CATEGORIES,
      WEBHOOK_CATEGORIES_OPTIONS
    },
    EVENTS: {
      WEBHOOK_EVENTS,
      WEBHOOK_EVENTS_CONFIG,
      WEBHOOK_EVENTS_OPTIONS
    },
    STATUS: {
      WEBHOOK_STATUS,
      WEBHOOK_STATUS_CONFIG,
      WEBHOOK_STATUS_OPTIONS
    },
    CONFIG: {
      WEBHOOK_METHODS,
      WEBHOOK_HEADERS
    },
    utils: {
      webhookUtils
    }
  },

  // Notificações
  notification: {
    TYPES: {
      NOTIFICATION_TYPES,
      NOTIFICATION_CONFIG,
      NOTIFICATION_TYPE_OPTIONS
    },
    PRIORITY: {
      NOTIFICATION_PRIORITY,
      NOTIFICATION_PRIORITY_CONFIG,
      NOTIFICATION_PRIORITY_OPTIONS
    },
    CATEGORIES: {
      NOTIFICATION_CATEGORIES,
      NOTIFICATION_CATEGORY_CONFIG,
      NOTIFICATION_CATEGORY_OPTIONS
    },
    STATUS: {
      NOTIFICATION_STATUS,
      NOTIFICATION_STATUS_CONFIG
    },
    utils: {
      notificationUtils
    }
  }
}

// Utilitários gerais para trabalhar com constantes
export const constantsUtils = {
  /**
   * Obtém todas as opções de um conjunto de constantes
   */
  getAllOptions: (configObject) => {
    return Object.entries(configObject).map(([value, config]) => ({
      value,
      label: config.label || config.name || value,
      ...config
    }))
  },

  /**
   * Busca configuração por valor em qualquer conjunto de constantes
   */
  findConfigByValue: (value, configObject) => {
    return configObject[value] || null
  },

  /**
   * Filtra opções baseado em uma propriedade
   */
  filterOptions: (options, property, filterValue) => {
    return options.filter(option => option[property] === filterValue)
  },

  /**
   * Ordena opções por uma propriedade específica
   */
  sortOptions: (options, property, order = 'asc') => {
    return [...options].sort((a, b) => {
      const valueA = a[property]
      const valueB = b[property]
      
      if (order === 'desc') {
        return valueB > valueA ? 1 : valueB < valueA ? -1 : 0
      }
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0
    })
  },

  /**
   * Agrupa opções por uma propriedade
   */
  groupOptions: (options, property) => {
    return options.reduce((groups, option) => {
      const key = option[property]
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(option)
      return groups
    }, {})
  },

  /**
   * Valida se um valor existe em um conjunto de constantes
   */
  isValidValue: (value, constantsObject) => {
    return Object.prototype.hasOwnProperty.call(constantsObject, value)
  },

  /**
   * Obtém valores únicos de uma propriedade em opções
   */
  getUniqueValues: (options, property) => {
    return [...new Set(options.map(option => option[property]))]
  }
}