// notificationTypes.js/**
 //* Constantes para tipos de notificações
//* 
 /* Define todos os tipos de notificações do sistema, suas configurações
 * visuais e comportamentos associados.
 */

// Tipos básicos de notificação
export const NOTIFICATION_TYPES = {
  // Notificações de tarefa
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMPLETED: 'task_completed',
  TASK_STATUS_CHANGED: 'task_status_changed',
  TASK_OVERDUE: 'task_overdue',
  TASK_DUE_SOON: 'task_due_soon',
  TASK_STEP_COMPLETED: 'task_step_completed',
  TASK_COMMENT_ADDED: 'task_comment_added',
  TASK_DEPENDENCY_RESOLVED: 'task_dependency_resolved',

  // Notificações de projeto
  PROJECT_INVITATION: 'project_invitation',
  PROJECT_MEMBER_ADDED: 'project_member_added',
  PROJECT_MEMBER_REMOVED: 'project_member_removed',
  PROJECT_ROLE_CHANGED: 'project_role_changed',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_ARCHIVED: 'project_archived',

  // Notificações de comentário
  COMMENT_REPLY: 'comment_reply',
  COMMENT_MENTION: 'comment_mention',

  // Notificações de sistema
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SYSTEM_UPDATE: 'system_update',
  SYSTEM_ERROR: 'system_error',

  // Notificações de webhook
  WEBHOOK_FAILED: 'webhook_failed',
  WEBHOOK_SUCCESS: 'webhook_success'
}

// Configurações detalhadas das notificações
export const NOTIFICATION_CONFIG = {
  [NOTIFICATION_TYPES.TASK_ASSIGNED]: {
    title: 'Tarefa Atribuída',
    description: 'Você foi atribuído a uma nova tarefa',
    icon: 'UserPlus',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    priority: 'medium',
    sound: true,
    canDismiss: true,
    autoHide: false,
    category: 'task',
    template: 'Você foi atribuído à tarefa "{taskName}" no projeto "{projectName}"'
  },

  [NOTIFICATION_TYPES.TASK_COMPLETED]: {
    title: 'Tarefa Concluída',
    description: 'Uma tarefa que você acompanha foi concluída',
    icon: 'CheckCircle',
    color: '#10B981',
    bgColor: '#D1FAE5',
    priority: 'low',
    sound: false,
    canDismiss: true,
    autoHide: true,
    category: 'task',
    template: 'A tarefa "{taskName}" foi concluída por {userName}'
  },

  [NOTIFICATION_TYPES.TASK_STATUS_CHANGED]: {
    title: 'Status da Tarefa Alterado',
    description: 'O status de uma tarefa mudou',
    icon: 'RefreshCw',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    priority: 'low',
    sound: false,
    canDismiss: true,
    autoHide: true,
    category: 'task',
    template: 'A tarefa "{taskName}" mudou de status para {newStatus}'
  },

  [NOTIFICATION_TYPES.TASK_OVERDUE]: {
    title: 'Tarefa Atrasada',
    description: 'Uma de suas tarefas está atrasada',
    icon: 'AlertTriangle',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    priority: 'high',
    sound: true,
    canDismiss: true,
    autoHide: false,
    category: 'task',
    template: 'A tarefa "{taskName}" está atrasada em {daysOverdue} dias'
  },

  [NOTIFICATION_TYPES.TASK_DUE_SOON]: {
    title: 'Tarefa Vencendo',
    description: 'Uma tarefa vence em breve',
    icon: 'Clock',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    priority: 'medium',
    sound: false,
    canDismiss: true,
    autoHide: true,
    category: 'task',
    template: 'A tarefa "{taskName}" vence em {daysUntilDue} dias'
  },

  [NOTIFICATION_TYPES.TASK_STEP_COMPLETED]: {
    title: 'Etapa Concluída',
    description: 'Uma etapa da tarefa foi marcada como concluída',
    icon: 'CheckSquare',
    color: '#10B981',
    bgColor: '#D1FAE5',
    priority: 'low',
    sound: false,
    canDismiss: true,
    autoHide: true,
    category: 'task',
    template: 'A etapa "{stepName}" da tarefa "{taskName}" foi concluída'
  },

  [NOTIFICATION_TYPES.TASK_COMMENT_ADDED]: {
    title: 'Novo Comentário',
    description: 'Um comentário foi adicionado a uma tarefa',
    icon: 'MessageSquare',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    priority: 'medium',
    sound: false,
    canDismiss: true,
    autoHide: true,
    category: 'comment',
    template: '{userName} comentou na tarefa "{taskName}"'
  },

  [NOTIFICATION_TYPES.TASK_DEPENDENCY_RESOLVED]: {
    title: 'Dependência Resolvida',
    description: 'Uma dependência de tarefa foi resolvida',
    icon: 'Link',
    color: '#10B981',
    bgColor: '#D1FAE5',
    priority: 'medium',
    sound: false,
    canDismiss: true,
    autoHide: true,
    category: 'task',
    template: 'A tarefa "{dependencyTask}" que bloqueava "{taskName}" foi concluída'
  },

  [NOTIFICATION_TYPES.PROJECT_INVITATION]: {
    title: 'Convite para Projeto',
    description: 'Você foi convidado para participar de um projeto',
    icon: 'Mail',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    priority: 'high',
    sound: true,
    canDismiss: false,
    autoHide: false,
    category: 'project',
    template: 'Você foi convidado para o projeto "{projectName}" por {inviterName}'
  },

  [NOTIFICATION_TYPES.PROJECT_MEMBER_ADDED]: {
    title: 'Novo Membro',
    description: 'Um novo membro foi adicionado ao projeto',
    icon: 'UserPlus',
    color: '#10B981',
    bgColor: '#D1FAE5',
    priority: 'low',
    sound: false,
    canDismiss: true,
    autoHide: true,
    category: 'project',
    template: '{memberName} foi adicionado ao projeto "{projectName}"'
  },

  [NOTIFICATION_TYPES.PROJECT_ROLE_CHANGED]: {
    title: 'Papel Alterado',
    description: 'Seu papel no projeto foi alterado',
    icon: 'Shield',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    priority: 'medium',
    sound: false,
    canDismiss: true,
    autoHide: false,
    category: 'project',
    template: 'Seu papel no projeto "{projectName}" foi alterado para {newRole}'
  },

  [NOTIFICATION_TYPES.COMMENT_REPLY]: {
    title: 'Resposta ao Comentário',
    description: 'Alguém respondeu seu comentário',
    icon: 'Reply',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    priority: 'medium',
    sound: false,
    canDismiss: true,
    autoHide: true,
    category: 'comment',
    template: '{userName} respondeu seu comentário na tarefa "{taskName}"'
  },

  [NOTIFICATION_TYPES.COMMENT_MENTION]: {
    title: 'Menção em Comentário',
    description: 'Você foi mencionado em um comentário',
    icon: 'AtSign',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    priority: 'high',
    sound: true,
    canDismiss: true,
    autoHide: false,
    category: 'comment',
    template: '{userName} mencionou você em um comentário na tarefa "{taskName}"'
  },

  [NOTIFICATION_TYPES.SYSTEM_MAINTENANCE]: {
    title: 'Manutenção do Sistema',
    description: 'Manutenção programada do sistema',
    icon: 'Settings',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    priority: 'high',
    sound: false,
    canDismiss: true,
    autoHide: false,
    category: 'system',
    template: 'Manutenção programada em {maintenanceDate} das {startTime} às {endTime}'
  },

  [NOTIFICATION_TYPES.WEBHOOK_FAILED]: {
    title: 'Webhook Falhou',
    description: 'Falha na entrega de webhook',
    icon: 'AlertCircle',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    priority: 'medium',
    sound: false,
    canDismiss: true,
    autoHide: true,
    category: 'system',
    template: 'Falha na entrega do webhook "{webhookName}": {errorMessage}'
  }
}

// Prioridades das notificações
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
}

// Configurações visuais das prioridades
export const NOTIFICATION_PRIORITY_CONFIG = {
  [NOTIFICATION_PRIORITY.LOW]: {
    label: 'Baixa',
    color: '#10B981',
    bgColor: '#D1FAE5',
    borderColor: '#A7F3D0',
    icon: 'Minus',
    duration: 3000
  },
  [NOTIFICATION_PRIORITY.MEDIUM]: {
    label: 'Média',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    borderColor: '#93C5FD',
    icon: 'Equal',
    duration: 5000
  },
  [NOTIFICATION_PRIORITY.HIGH]: {
    label: 'Alta',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    borderColor: '#FCD34D',
    icon: 'Plus',
    duration: 8000
  },
  [NOTIFICATION_PRIORITY.URGENT]: {
    label: 'Urgente',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    icon: 'AlertTriangle',
    duration: 0, // Não esconde automaticamente
    pulse: true
  }
}

// Categorias de notificação
export const NOTIFICATION_CATEGORIES = {
  TASK: 'task',
  PROJECT: 'project',
  COMMENT: 'comment',
  SYSTEM: 'system'
}

// Configurações das categorias
export const NOTIFICATION_CATEGORY_CONFIG = {
  [NOTIFICATION_CATEGORIES.TASK]: {
    label: 'Tarefas',
    icon: 'CheckSquare',
    color: '#3B82F6',
    defaultEnabled: true
  },
  [NOTIFICATION_CATEGORIES.PROJECT]: {
    label: 'Projetos',
    icon: 'FolderOpen',
    color: '#8B5CF6',
    defaultEnabled: true
  },
  [NOTIFICATION_CATEGORIES.COMMENT]: {
    label: 'Comentários',
    icon: 'MessageSquare',
    color: '#10B981',
    defaultEnabled: true
  },
  [NOTIFICATION_CATEGORIES.SYSTEM]: {
    label: 'Sistema',
    icon: 'Settings',
    color: '#6B7280',
    defaultEnabled: false
  }
}

// Status das notificações
export const NOTIFICATION_STATUS = {
  UNREAD: 'unread',
  READ: 'read',
  DISMISSED: 'dismissed',
  ARCHIVED: 'archived'
}

// Configurações visuais dos status
export const NOTIFICATION_STATUS_CONFIG = {
  [NOTIFICATION_STATUS.UNREAD]: {
    label: 'Não lida',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    fontWeight: 'font-semibold'
  },
  [NOTIFICATION_STATUS.READ]: {
    label: 'Lida',
    color: '#6B7280',
    bgColor: '#F9FAFB',
    fontWeight: 'font-normal'
  },
  [NOTIFICATION_STATUS.DISMISSED]: {
    label: 'Dispensada',
    color: '#9CA3AF',
    bgColor: '#F3F4F6',
    fontWeight: 'font-normal',
    opacity: 'opacity-75'
  },
  [NOTIFICATION_STATUS.ARCHIVED]: {
    label: 'Arquivada',
    color: '#6B7280',
    bgColor: '#F9FAFB',
    fontWeight: 'font-normal',
    opacity: 'opacity-50'
  }
}

// Funções utilitárias para notificações
export const notificationUtils = {
  /**
   * Obtém configuração de um tipo de notificação
   */
  getTypeConfig: (type) => {
    return NOTIFICATION_CONFIG[type] || null
  },

  /**
   * Obtém configuração de prioridade
   */
  getPriorityConfig: (priority) => {
    return NOTIFICATION_PRIORITY_CONFIG[priority] || NOTIFICATION_PRIORITY_CONFIG[NOTIFICATION_PRIORITY.MEDIUM]
  },

  /**
   * Obtém configuração de categoria
   */
  getCategoryConfig: (category) => {
    return NOTIFICATION_CATEGORY_CONFIG[category] || null
  },

  /**
   * Obtém configuração de status
   */
  getStatusConfig: (status) => {
    return NOTIFICATION_STATUS_CONFIG[status] || NOTIFICATION_STATUS_CONFIG[NOTIFICATION_STATUS.UNREAD]
  },

  /**
   * Filtra notificações por categoria
   */
  filterByCategory: (notifications, category) => {
    return notifications.filter(notification => {
      const config = NOTIFICATION_CONFIG[notification.type]
      return config?.category === category
    })
  },

  /**
   * Filtra notificações por prioridade
   */
  filterByPriority: (notifications, priority) => {
    return notifications.filter(notification => {
      const config = NOTIFICATION_CONFIG[notification.type]
      return config?.priority === priority
    })
  },

  /**
   * Ordena notificações por prioridade e data
   */
  sortByPriorityAndDate: (notifications) => {
    const priorityOrder = {
      [NOTIFICATION_PRIORITY.URGENT]: 4,
      [NOTIFICATION_PRIORITY.HIGH]: 3,
      [NOTIFICATION_PRIORITY.MEDIUM]: 2,
      [NOTIFICATION_PRIORITY.LOW]: 1
    }

    return notifications.sort((a, b) => {
      const configA = NOTIFICATION_CONFIG[a.type]
      const configB = NOTIFICATION_CONFIG[b.type]
      
      const priorityA = priorityOrder[configA?.priority] || 0
      const priorityB = priorityOrder[configB?.priority] || 0
      
      if (priorityA !== priorityB) {
        return priorityB - priorityA // Maior prioridade primeiro
      }
      
      // Se prioridade igual, ordenar por data (mais recente primeiro)
      return new Date(b.created_at) - new Date(a.created_at)
    })
  },

  /**
   * Formata mensagem da notificação com dados
   */
  formatMessage: (type, data) => {
    const config = NOTIFICATION_CONFIG[type]
    if (!config?.template) return config?.description || ''

    let message = config.template
    Object.entries(data).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{${key}}`, 'g'), value)
    })
    
    return message
  },

  /**
   * Verifica se notificação deve ter som
   */
  shouldPlaySound: (type, userSettings = {}) => {
    const config = NOTIFICATION_CONFIG[type]
    const globalSoundEnabled = userSettings.soundEnabled ?? true
    const categorySoundEnabled = userSettings.categories?.[config?.category]?.sound ?? true
    
    return config?.sound && globalSoundEnabled && categorySoundEnabled
  },

  /**
   * Calcula tempo para auto-hide baseado na prioridade
   */
  getAutoHideDuration: (type) => {
    const config = NOTIFICATION_CONFIG[type]
    if (!config?.autoHide) return 0
    
    const priorityConfig = NOTIFICATION_PRIORITY_CONFIG[config.priority]
    return priorityConfig?.duration || 5000
  },

  /**
   * Agrupa notificações por data
   */
  groupByDate: (notifications) => {
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    
    return notifications.reduce((groups, notification) => {
      const date = new Date(notification.created_at).toDateString()
      let group
      
      if (date === today) {
        group = 'Hoje'
      } else if (date === yesterday) {
        group = 'Ontem'
      } else {
        group = new Date(date).toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        })
      }
      
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(notification)
      
      return groups
    }, {})
  }
}

// Arrays para facilitar iteração e seleção
export const NOTIFICATION_TYPE_OPTIONS = Object.entries(NOTIFICATION_CONFIG).map(([value, config]) => ({
  value,
  label: config.title,
  description: config.description,
  category: config.category,
  priority: config.priority,
  icon: config.icon,
  color: config.color
}))

export const NOTIFICATION_CATEGORY_OPTIONS = Object.entries(NOTIFICATION_CATEGORY_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
  icon: config.icon,
  color: config.color,
  defaultEnabled: config.defaultEnabled
}))

export const NOTIFICATION_PRIORITY_OPTIONS = Object.entries(NOTIFICATION_PRIORITY_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
  icon: config.icon,
  color: config.color
}))

// Export default com todas as constantes
export default {
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
}