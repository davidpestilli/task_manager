/**
 * Constantes para eventos de webhooks
 * 
 * Define todos os eventos que podem ser monitorados via webhooks,
 * incluindo payload structure e configurações.
 */

// Categorias de eventos
export const WEBHOOK_CATEGORIES = {
  PROJECT: 'project',
  TASK: 'task',
  COMMENT: 'comment',
  MEMBER: 'member',
  NOTIFICATION: 'notification'
}

// Eventos básicos dos webhooks
export const WEBHOOK_EVENTS = {
  // Eventos de projeto
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
  PROJECT_DELETED: 'project.deleted',
  PROJECT_ARCHIVED: 'project.archived',

  // Eventos de tarefa
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_DELETED: 'task.deleted',
  TASK_STATUS_CHANGED: 'task.status_changed',
  TASK_ASSIGNED: 'task.assigned',
  TASK_UNASSIGNED: 'task.unassigned',
  TASK_COMPLETED: 'task.completed',
  TASK_STEP_ADDED: 'task.step_added',
  TASK_STEP_COMPLETED: 'task.step_completed',
  TASK_DEPENDENCY_ADDED: 'task.dependency_added',
  TASK_DEPENDENCY_REMOVED: 'task.dependency_removed',

  // Eventos de comentário
  COMMENT_ADDED: 'comment.added',
  COMMENT_UPDATED: 'comment.updated',
  COMMENT_DELETED: 'comment.deleted',
  COMMENT_REPLIED: 'comment.replied',

  // Eventos de membro
  MEMBER_ADDED: 'member.added',
  MEMBER_REMOVED: 'member.removed',
  MEMBER_ROLE_CHANGED: 'member.role_changed',

  // Eventos de notificação
  NOTIFICATION_CREATED: 'notification.created'
}

// Configurações detalhadas dos eventos
export const WEBHOOK_EVENTS_CONFIG = {
  [WEBHOOK_EVENTS.PROJECT_CREATED]: {
    category: WEBHOOK_CATEGORIES.PROJECT,
    label: 'Projeto Criado',
    description: 'Disparado quando um novo projeto é criado',
    icon: 'FolderPlus',
    color: '#10B981',
    payload: {
      project: ['id', 'name', 'description', 'owner_id', 'created_at'],
      user: ['id', 'name', 'email']
    }
  },

  [WEBHOOK_EVENTS.PROJECT_UPDATED]: {
    category: WEBHOOK_CATEGORIES.PROJECT,
    label: 'Projeto Atualizado',
    description: 'Disparado quando um projeto é modificado',
    icon: 'Edit',
    color: '#3B82F6',
    payload: {
      project: ['id', 'name', 'description', 'updated_at'],
      changes: ['field', 'old_value', 'new_value'],
      user: ['id', 'name', 'email']
    }
  },

  [WEBHOOK_EVENTS.PROJECT_DELETED]: {
    category: WEBHOOK_CATEGORIES.PROJECT,
    label: 'Projeto Excluído',
    description: 'Disparado quando um projeto é excluído',
    icon: 'Trash2',
    color: '#EF4444',
    payload: {
      project: ['id', 'name'],
      user: ['id', 'name', 'email']
    }
  },

  [WEBHOOK_EVENTS.PROJECT_ARCHIVED]: {
    category: WEBHOOK_CATEGORIES.PROJECT,
    label: 'Projeto Arquivado',
    description: 'Disparado quando um projeto é arquivado',
    icon: 'Archive',
    color: '#F59E0B',
    payload: {
      project: ['id', 'name', 'archived_at'],
      user: ['id', 'name', 'email']
    }
  },

  [WEBHOOK_EVENTS.TASK_CREATED]: {
    category: WEBHOOK_CATEGORIES.TASK,
    label: 'Tarefa Criada',
    description: 'Disparado quando uma nova tarefa é criada',
    icon: 'Plus',
    color: '#10B981',
    payload: {
      task: ['id', 'name', 'description', 'status', 'priority', 'created_at'],
      project: ['id', 'name'],
      user: ['id', 'name', 'email'],
      assigned_users: ['id', 'name', 'email']
    }
  },

  [WEBHOOK_EVENTS.TASK_UPDATED]: {
    category: WEBHOOK_CATEGORIES.TASK,
    label: 'Tarefa Atualizada',
    description: 'Disparado quando uma tarefa é modificada',
    icon: 'Edit',
    color: '#3B82F6',
    payload: {
      task: ['id', 'name', 'description', 'status', 'priority', 'updated_at'],
      changes: ['field', 'old_value', 'new_value'],
      project: ['id', 'name'],
      user: ['id', 'name', 'email']
    }
  },

  [WEBHOOK_EVENTS.TASK_COMPLETED]: {
    category: WEBHOOK_CATEGORIES.TASK,
    label: 'Tarefa Concluída',
    description: 'Disparado quando uma tarefa é marcada como concluída',
    icon: 'CheckCircle',
    color: '#10B981',
    payload: {
      task: ['id', 'name', 'completion_percentage', 'completed_at'],
      project: ['id', 'name'],
      user: ['id', 'name', 'email'],
      assigned_users: ['id', 'name', 'email']
    }
  },

  [WEBHOOK_EVENTS.TASK_ASSIGNED]: {
    category: WEBHOOK_CATEGORIES.TASK,
    label: 'Tarefa Atribuída',
    description: 'Disparado quando uma tarefa é atribuída a um usuário',
    icon: 'UserPlus',
    color: '#8B5CF6',
    payload: {
      task: ['id', 'name', 'status'],
      project: ['id', 'name'],
      assigned_to: ['id', 'name', 'email'],
      assigned_by: ['id', 'name', 'email']
    }
  },

  [WEBHOOK_EVENTS.TASK_STATUS_CHANGED]: {
    category: WEBHOOK_CATEGORIES.TASK,
    label: 'Status da Tarefa Alterado',
    description: 'Disparado quando o status de uma tarefa muda',
    icon: 'RefreshCw',
    color: '#F59E0B',
    payload: {
      task: ['id', 'name'],
      status: ['old_status', 'new_status'],
      project: ['id', 'name'],
      user: ['id', 'name', 'email']
    }
  },

  [WEBHOOK_EVENTS.COMMENT_ADDED]: {
    category: WEBHOOK_CATEGORIES.COMMENT,
    label: 'Comentário Adicionado',
    description: 'Disparado quando um comentário é adicionado a uma tarefa',
    icon: 'MessageSquare',
    color: '#3B82F6',
    payload: {
      comment: ['id', 'content', 'created_at'],
      task: ['id', 'name'],
      project: ['id', 'name'],
      user: ['id', 'name', 'email']
    }
  },

  [WEBHOOK_EVENTS.COMMENT_REPLIED]: {
    category: WEBHOOK_CATEGORIES.COMMENT,
    label: 'Comentário Respondido',
    description: 'Disparado quando alguém responde a um comentário',
    icon: 'Reply',
    color: '#8B5CF6',
    payload: {
      comment: ['id', 'content', 'created_at'],
      parent_comment: ['id', 'content'],
      task: ['id', 'name'],
      project: ['id', 'name'],
      user: ['id', 'name', 'email']
    }
  },

  [WEBHOOK_EVENTS.MEMBER_ADDED]: {
    category: WEBHOOK_CATEGORIES.MEMBER,
    label: 'Membro Adicionado',
    description: 'Disparado quando um novo membro é adicionado ao projeto',
    icon: 'UserPlus',
    color: '#10B981',
    payload: {
      project: ['id', 'name'],
      member: ['id', 'name', 'email', 'role'],
      added_by: ['id', 'name', 'email']
    }
  },

  [WEBHOOK_EVENTS.MEMBER_ROLE_CHANGED]: {
    category: WEBHOOK_CATEGORIES.MEMBER,
    label: 'Papel do Membro Alterado',
    description: 'Disparado quando o papel de um membro é modificado',
    icon: 'Shield',
    color: '#F59E0B',
    payload: {
      project: ['id', 'name'],
      member: ['id', 'name', 'email'],
      role: ['old_role', 'new_role'],
      changed_by: ['id', 'name', 'email']
    }
  }
}

// Status dos webhooks
export const WEBHOOK_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ERROR: 'error',
  TESTING: 'testing'
}

// Configurações visuais para status de webhook
export const WEBHOOK_STATUS_CONFIG = {
  [WEBHOOK_STATUS.ACTIVE]: {
    label: 'Ativo',
    color: '#10B981',
    bgColor: '#D1FAE5',
    icon: 'CheckCircle',
    badgeClass: 'bg-emerald-100 text-emerald-800'
  },
  [WEBHOOK_STATUS.INACTIVE]: {
    label: 'Inativo',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    icon: 'XCircle',
    badgeClass: 'bg-gray-100 text-gray-800'
  },
  [WEBHOOK_STATUS.ERROR]: {
    label: 'Erro',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    icon: 'AlertCircle',
    badgeClass: 'bg-red-100 text-red-800'
  },
  [WEBHOOK_STATUS.TESTING]: {
    label: 'Testando',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    icon: 'TestTube',
    badgeClass: 'bg-amber-100 text-amber-800'
  }
}

// Métodos HTTP para webhooks
export const WEBHOOK_METHODS = {
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH'
}

// Headers padrão para webhooks
export const WEBHOOK_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  USER_AGENT: 'User-Agent',
  SIGNATURE: 'X-Task-Manager-Signature',
  EVENT_TYPE: 'X-Task-Manager-Event',
  DELIVERY_ID: 'X-Task-Manager-Delivery'
}

// Funções utilitárias para webhooks
export const webhookUtils = {
  /**
   * Obtém configuração de um evento
   */
  getEventConfig: (event) => {
    return WEBHOOK_EVENTS_CONFIG[event] || null
  },

  /**
   * Filtra eventos por categoria
   */
  getEventsByCategory: (category) => {
    return Object.entries(WEBHOOK_EVENTS_CONFIG)
      .filter(([, config]) => config.category === category)
      .map(([event, config]) => ({ event, ...config }))
  },

  /**
   * Agrupa eventos por categoria
   */
  groupEventsByCategory: () => {
    const grouped = {}
    Object.entries(WEBHOOK_EVENTS_CONFIG).forEach(([event, config]) => {
      if (!grouped[config.category]) {
        grouped[config.category] = []
      }
      grouped[config.category].push({ event, ...config })
    })
    return grouped
  },

  /**
   * Valida URL de webhook
   */
  validateWebhookUrl: (url) => {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'https:' || urlObj.protocol === 'http:'
    } catch {
      return false
    }
  },

  /**
   * Gera ID único para entrega
   */
  generateDeliveryId: () => {
    return `delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  /**
   * Cria payload padrão para evento
   */
  createPayload: (event, data) => {
    const config = WEBHOOK_EVENTS_CONFIG[event]
    if (!config) return null

    const payload = {
      event,
      timestamp: new Date().toISOString(),
      delivery_id: webhookUtils.generateDeliveryId(),
      data: {}
    }

    // Adicionar dados baseados na configuração do payload
    Object.entries(config.payload).forEach(([key, fields]) => {
      if (data[key]) {
        payload.data[key] = {}
        fields.forEach(field => {
          if (data[key][field] !== undefined) {
            payload.data[key][field] = data[key][field]
          }
        })
      }
    })

    return payload
  },

  /**
   * Obtém configuração visual do status
   */
  getStatusConfig: (status) => {
    return WEBHOOK_STATUS_CONFIG[status] || WEBHOOK_STATUS_CONFIG[WEBHOOK_STATUS.INACTIVE]
  }
}

// Arrays para facilitar iteração e seleção
export const WEBHOOK_EVENTS_OPTIONS = Object.entries(WEBHOOK_EVENTS_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
  description: config.description,
  category: config.category,
  icon: config.icon,
  color: config.color
}))

export const WEBHOOK_CATEGORIES_OPTIONS = Object.entries(WEBHOOK_CATEGORIES).map(([key, value]) => ({
  value,
  label: key.charAt(0) + key.slice(1).toLowerCase(),
  events: WEBHOOK_EVENTS_OPTIONS.filter(event => event.category === value)
}))

export const WEBHOOK_STATUS_OPTIONS = Object.entries(WEBHOOK_STATUS_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
  color: config.color,
  icon: config.icon
}))

// Export default com todas as constantes
export default {
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
}