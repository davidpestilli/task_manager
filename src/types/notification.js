/**
 * Tipos e interfaces para o sistema de notificações
 */

export const NOTIFICATION_TYPES = {
  // Notificações de tarefa
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMPLETED: 'task_completed', 
  TASK_UPDATED: 'task_updated',
  TASK_STATUS_CHANGED: 'task_status_changed',
  TASK_STEP_ADDED: 'task_step_added',
  
  // Notificações de comentário
  COMMENT_REPLY: 'comment_reply',
  COMMENT_MENTION: 'comment_mention',
  COMMENT_ADDED: 'comment_added',
  
  // Notificações de dependência
  DEPENDENCY_RESOLVED: 'dependency_resolved',
  DEPENDENCY_ADDED: 'dependency_added'
}

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium', 
  HIGH: 'high',
  URGENT: 'urgent'
}

export const NOTIFICATION_STATUS = {
  UNREAD: 'unread',
  READ: 'read',
  ARCHIVED: 'archived'
}

/**
 * Interface base para notificação
 */
export const createNotification = ({
  id,
  type,
  title,
  message,
  userId,
  taskId = null,
  projectId = null,
  triggeredBy = null,
  priority = NOTIFICATION_PRIORITIES.MEDIUM,
  isRead = false,
  createdAt = new Date().toISOString(),
  data = {}
}) => ({
  id,
  type,
  title,
  message,
  userId,
  taskId,
  projectId,
  triggeredBy,
  priority,
  isRead,
  createdAt,
  data
})

/**
 * Templates de notificação por tipo
 */
export const NOTIFICATION_TEMPLATES = {
  [NOTIFICATION_TYPES.TASK_ASSIGNED]: {
    title: 'Nova tarefa atribuída',
    getMessage: (data) => `Você foi atribuído à tarefa "${data.taskName}" no projeto "${data.projectName}"`,
    priority: NOTIFICATION_PRIORITIES.HIGH
  },
  
  [NOTIFICATION_TYPES.TASK_COMPLETED]: {
    title: 'Tarefa concluída',
    getMessage: (data) => `A tarefa "${data.taskName}" foi concluída por ${data.completedBy}`,
    priority: NOTIFICATION_PRIORITIES.MEDIUM
  },
  
  [NOTIFICATION_TYPES.TASK_UPDATED]: {
    title: 'Tarefa atualizada',
    getMessage: (data) => `A tarefa "${data.taskName}" foi atualizada por ${data.updatedBy}`,
    priority: NOTIFICATION_PRIORITIES.LOW
  },
  
  [NOTIFICATION_TYPES.TASK_STATUS_CHANGED]: {
    title: 'Status da tarefa alterado',
    getMessage: (data) => `A tarefa "${data.taskName}" foi ${data.newStatus} por ${data.changedBy}`,
    priority: NOTIFICATION_PRIORITIES.MEDIUM
  },
  
  [NOTIFICATION_TYPES.TASK_STEP_ADDED]: {
    title: 'Nova etapa adicionada',
    getMessage: (data) => `${data.addedBy} adicionou uma nova etapa à tarefa "${data.taskName}"`,
    priority: NOTIFICATION_PRIORITIES.LOW
  },
  
  [NOTIFICATION_TYPES.COMMENT_REPLY]: {
    title: 'Resposta ao seu comentário',
    getMessage: (data) => `${data.repliedBy} respondeu seu comentário na tarefa "${data.taskName}"`,
    priority: NOTIFICATION_PRIORITIES.HIGH
  },
  
  [NOTIFICATION_TYPES.COMMENT_MENTION]: {
    title: 'Você foi mencionado',
    getMessage: (data) => `${data.mentionedBy} mencionou você na tarefa "${data.taskName}"`,
    priority: NOTIFICATION_PRIORITIES.HIGH
  },
  
  [NOTIFICATION_TYPES.COMMENT_ADDED]: {
    title: 'Novo comentário',
    getMessage: (data) => `${data.commentedBy} comentou na tarefa "${data.taskName}"`,
    priority: NOTIFICATION_PRIORITIES.MEDIUM
  },
  
  [NOTIFICATION_TYPES.DEPENDENCY_RESOLVED]: {
    title: 'Dependência resolvida',
    getMessage: (data) => `A tarefa "${data.dependencyTask}" que bloqueava "${data.taskName}" foi concluída`,
    priority: NOTIFICATION_PRIORITIES.HIGH
  },
  
  [NOTIFICATION_TYPES.DEPENDENCY_ADDED]: {
    title: 'Nova dependência',
    getMessage: (data) => `Sua tarefa "${data.taskName}" agora depende de "${data.dependencyTask}"`,
    priority: NOTIFICATION_PRIORITIES.MEDIUM
  }
}

/**
 * Configurações de exibição por tipo
 */
export const NOTIFICATION_DISPLAY_CONFIG = {
  [NOTIFICATION_TYPES.TASK_ASSIGNED]: {
    icon: '📋',
    color: 'blue',
    showToast: true,
    playSound: true
  },
  
  [NOTIFICATION_TYPES.TASK_COMPLETED]: {
    icon: '✅',
    color: 'green', 
    showToast: true,
    playSound: false
  },
  
  [NOTIFICATION_TYPES.TASK_UPDATED]: {
    icon: '📝',
    color: 'yellow',
    showToast: false,
    playSound: false
  },
  
  [NOTIFICATION_TYPES.TASK_STATUS_CHANGED]: {
    icon: '🔄',
    color: 'purple',
    showToast: true,
    playSound: false
  },
  
  [NOTIFICATION_TYPES.TASK_STEP_ADDED]: {
    icon: '➕',
    color: 'indigo',
    showToast: false,
    playSound: false
  },
  
  [NOTIFICATION_TYPES.COMMENT_REPLY]: {
    icon: '💬',
    color: 'blue',
    showToast: true,
    playSound: true
  },
  
  [NOTIFICATION_TYPES.COMMENT_MENTION]: {
    icon: '👋',
    color: 'red',
    showToast: true,
    playSound: true
  },
  
  [NOTIFICATION_TYPES.COMMENT_ADDED]: {
    icon: '💭',
    color: 'gray',
    showToast: false,
    playSound: false
  },
  
  [NOTIFICATION_TYPES.DEPENDENCY_RESOLVED]: {
    icon: '🔓',
    color: 'green',
    showToast: true,
    playSound: true
  },
  
  [NOTIFICATION_TYPES.DEPENDENCY_ADDED]: {
    icon: '🔗',
    color: 'orange',
    showToast: true,
    playSound: false
  }
}