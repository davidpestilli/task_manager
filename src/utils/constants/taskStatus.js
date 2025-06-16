/**
 * Constantes para status de tarefas
 * 
 * Define todos os possíveis status de uma tarefa no sistema,
 * incluindo cores, ícones e comportamentos associados.
 */

// Status básicos das tarefas
export const TASK_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'paused',
  COMPLETED: 'completed'
}

// Configurações visuais para cada status
export const TASK_STATUS_CONFIG = {
  [TASK_STATUS.NOT_STARTED]: {
    label: 'Não Iniciada',
    color: '#6B7280', // gray-500
    bgColor: '#F3F4F6', // gray-100
    textColor: '#374151', // gray-700
    icon: 'Circle',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
    progressColor: '#E5E7EB',
    canEdit: true,
    canStart: true,
    canPause: false,
    canComplete: false
  },
  [TASK_STATUS.IN_PROGRESS]: {
    label: 'Em Andamento',
    color: '#3B82F6', // blue-500
    bgColor: '#DBEAFE', // blue-100
    textColor: '#1E40AF', // blue-800
    icon: 'Play',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    progressColor: '#3B82F6',
    canEdit: true,
    canStart: false,
    canPause: true,
    canComplete: true
  },
  [TASK_STATUS.PAUSED]: {
    label: 'Pausada',
    color: '#F59E0B', // amber-500
    bgColor: '#FEF3C7', // amber-100
    textColor: '#92400E', // amber-800
    icon: 'Pause',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    progressColor: '#F59E0B',
    canEdit: true,
    canStart: true,
    canPause: false,
    canComplete: false
  },
  [TASK_STATUS.COMPLETED]: {
    label: 'Concluída',
    color: '#10B981', // emerald-500
    bgColor: '#D1FAE5', // emerald-100
    textColor: '#065F46', // emerald-800
    icon: 'CheckCircle',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    progressColor: '#10B981',
    canEdit: false,
    canStart: false,
    canPause: false,
    canComplete: false
  }
}

// Transições válidas entre status
export const TASK_STATUS_TRANSITIONS = {
  [TASK_STATUS.NOT_STARTED]: [TASK_STATUS.IN_PROGRESS],
  [TASK_STATUS.IN_PROGRESS]: [TASK_STATUS.PAUSED, TASK_STATUS.COMPLETED],
  [TASK_STATUS.PAUSED]: [TASK_STATUS.IN_PROGRESS],
  [TASK_STATUS.COMPLETED]: [] // Status final, sem transições
}

// Prioridades de tarefas
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
}

// Configurações visuais para prioridades
export const TASK_PRIORITY_CONFIG = {
  [TASK_PRIORITY.LOW]: {
    label: 'Baixa',
    color: '#10B981',
    bgColor: '#D1FAE5',
    textColor: '#065F46',
    icon: 'ArrowDown',
    badgeClass: 'bg-emerald-100 text-emerald-800',
    order: 1
  },
  [TASK_PRIORITY.MEDIUM]: {
    label: 'Média',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    textColor: '#92400E',
    icon: 'Minus',
    badgeClass: 'bg-amber-100 text-amber-800',
    order: 2
  },
  [TASK_PRIORITY.HIGH]: {
    label: 'Alta',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    textColor: '#991B1B',
    icon: 'ArrowUp',
    badgeClass: 'bg-red-100 text-red-800',
    order: 3
  },
  [TASK_PRIORITY.URGENT]: {
    label: 'Urgente',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    textColor: '#7F1D1D',
    icon: 'AlertTriangle',
    badgeClass: 'bg-red-200 text-red-900 animate-pulse',
    order: 4
  }
}

// Tipos de tarefa
export const TASK_TYPE = {
  TASK: 'task',
  MILESTONE: 'milestone',
  BUG: 'bug',
  FEATURE: 'feature',
  IMPROVEMENT: 'improvement'
}

// Configurações para tipos de tarefa
export const TASK_TYPE_CONFIG = {
  [TASK_TYPE.TASK]: {
    label: 'Tarefa',
    icon: 'CheckSquare',
    color: '#6B7280',
    badgeClass: 'bg-gray-100 text-gray-800'
  },
  [TASK_TYPE.MILESTONE]: {
    label: 'Marco',
    icon: 'Flag',
    color: '#8B5CF6',
    badgeClass: 'bg-purple-100 text-purple-800'
  },
  [TASK_TYPE.BUG]: {
    label: 'Bug',
    icon: 'Bug',
    color: '#EF4444',
    badgeClass: 'bg-red-100 text-red-800'
  },
  [TASK_TYPE.FEATURE]: {
    label: 'Funcionalidade',
    icon: 'Star',
    color: '#3B82F6',
    badgeClass: 'bg-blue-100 text-blue-800'
  },
  [TASK_TYPE.IMPROVEMENT]: {
    label: 'Melhoria',
    icon: 'TrendingUp',
    color: '#10B981',
    badgeClass: 'bg-emerald-100 text-emerald-800'
  }
}

// Funções utilitárias para trabalhar com status
export const taskStatusUtils = {
  /**
   * Verifica se uma transição de status é válida
   */
  isValidTransition: (fromStatus, toStatus) => {
    const validTransitions = TASK_STATUS_TRANSITIONS[fromStatus] || []
    return validTransitions.includes(toStatus)
  },

  /**
   * Obtém as próximas transições válidas para um status
   */
  getValidTransitions: (currentStatus) => {
    return TASK_STATUS_TRANSITIONS[currentStatus] || []
  },

  /**
   * Verifica se uma tarefa pode ser editada
   */
  canEdit: (status) => {
    return TASK_STATUS_CONFIG[status]?.canEdit ?? false
  },

  /**
   * Verifica se uma tarefa pode ser iniciada
   */
  canStart: (status) => {
    return TASK_STATUS_CONFIG[status]?.canStart ?? false
  },

  /**
   * Verifica se uma tarefa pode ser pausada
   */
  canPause: (status) => {
    return TASK_STATUS_CONFIG[status]?.canPause ?? false
  },

  /**
   * Verifica se uma tarefa pode ser concluída
   */
  canComplete: (status) => {
    return TASK_STATUS_CONFIG[status]?.canComplete ?? false
  },

  /**
   * Calcula o progresso baseado nas etapas
   */
  calculateProgress: (totalSteps, completedSteps) => {
    if (totalSteps === 0) return 0
    return Math.round((completedSteps / totalSteps) * 100)
  },

  /**
   * Determina o status baseado no progresso
   */
  getStatusFromProgress: (progress, currentStatus) => {
    if (progress === 100) return TASK_STATUS.COMPLETED
    if (progress > 0 && currentStatus === TASK_STATUS.NOT_STARTED) {
      return TASK_STATUS.IN_PROGRESS
    }
    return currentStatus
  },

  /**
   * Obtém a configuração visual de um status
   */
  getStatusConfig: (status) => {
    return TASK_STATUS_CONFIG[status] || TASK_STATUS_CONFIG[TASK_STATUS.NOT_STARTED]
  },

  /**
   * Obtém a configuração visual de uma prioridade
   */
  getPriorityConfig: (priority) => {
    return TASK_PRIORITY_CONFIG[priority] || TASK_PRIORITY_CONFIG[TASK_PRIORITY.MEDIUM]
  },

  /**
   * Obtém a configuração de um tipo de tarefa
   */
  getTypeConfig: (type) => {
    return TASK_TYPE_CONFIG[type] || TASK_TYPE_CONFIG[TASK_TYPE.TASK]
  },

  /**
   * Ordena tarefas por prioridade
   */
  sortByPriority: (tasks) => {
    return tasks.sort((a, b) => {
      const priorityA = TASK_PRIORITY_CONFIG[a.priority]?.order || 0
      const priorityB = TASK_PRIORITY_CONFIG[b.priority]?.order || 0
      return priorityB - priorityA // Maior prioridade primeiro
    })
  },

  /**
   * Filtra tarefas por status
   */
  filterByStatus: (tasks, statuses) => {
    if (!Array.isArray(statuses)) statuses = [statuses]
    return tasks.filter(task => statuses.includes(task.status))
  }
}

// Arrays para facilitar iteração e seleção
export const TASK_STATUS_OPTIONS = Object.entries(TASK_STATUS_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
  color: config.color,
  icon: config.icon
}))

export const TASK_PRIORITY_OPTIONS = Object.entries(TASK_PRIORITY_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
  color: config.color,
  icon: config.icon,
  order: config.order
})).sort((a, b) => a.order - b.order)

export const TASK_TYPE_OPTIONS = Object.entries(TASK_TYPE_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
  icon: config.icon,
  color: config.color
}))

// Export default com todas as constantes
export default {
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
}