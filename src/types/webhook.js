/**
 * Definições de tipos para Webhooks
 */

/**
 * @typedef {Object} Webhook
 * @property {string} id - ID único do webhook
 * @property {string} project_id - ID do projeto ao qual o webhook pertence
 * @property {string} name - Nome do webhook
 * @property {string} url - URL de destino do webhook
 * @property {string[]} events - Lista de eventos que o webhook monitora
 * @property {boolean} active - Se o webhook está ativo
 * @property {string|null} secret_key - Chave secreta para assinatura HMAC
 * @property {string} created_by - ID do usuário que criou o webhook
 * @property {string} created_at - Data de criação
 * @property {string} updated_at - Data da última atualização
 * @property {Object} created_by_profile - Dados do usuário que criou
 * @property {Object} project - Dados do projeto (quando incluído)
 */

/**
 * @typedef {Object} WebhookCreateData
 * @property {string} project_id - ID do projeto
 * @property {string} name - Nome do webhook
 * @property {string} url - URL de destino
 * @property {string[]} events - Eventos para monitorar
 * @property {boolean} [active=true] - Se o webhook deve estar ativo
 * @property {string|null} [secret_key] - Chave secreta opcional
 * @property {string} created_by - ID do usuário criador
 */

/**
 * @typedef {Object} WebhookUpdateData
 * @property {string} [name] - Nome do webhook
 * @property {string} [url] - URL de destino
 * @property {string[]} [events] - Eventos para monitorar
 * @property {boolean} [active] - Se o webhook está ativo
 * @property {string|null} [secret_key] - Chave secreta
 */

/**
 * @typedef {Object} WebhookPayload
 * @property {string} event - Tipo do evento
 * @property {string} timestamp - Timestamp do evento
 * @property {string} webhook_id - ID único do webhook dispatch
 * @property {Object} [task] - Dados da tarefa (quando relevante)
 * @property {Object} [comment] - Dados do comentário (quando relevante)
 * @property {Object} [project] - Dados do projeto
 * @property {Object} [user] - Dados do usuário que disparou o evento
 * @property {Object} [changes] - Mudanças realizadas (para eventos de update)
 */

/**
 * @typedef {Object} WebhookTestResult
 * @property {boolean} success - Se o teste foi bem-sucedido
 * @property {number} [status] - Status HTTP da resposta
 * @property {string} [statusText] - Texto do status HTTP
 * @property {string} [error] - Mensagem de erro (se houver)
 */

/**
 * Eventos disponíveis para webhooks
 */
export const WEBHOOK_EVENTS = {
  // Eventos de tarefa
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_COMPLETED: 'task.completed',
  TASK_ASSIGNED: 'task.assigned',
  
  // Eventos de comentário
  COMMENT_ADDED: 'comment.added',
  COMMENT_REPLY: 'comment.reply',
  
  // Eventos de projeto
  PROJECT_UPDATED: 'project.updated',
  
  // Eventos de dependência
  DEPENDENCY_RESOLVED: 'dependency.resolved'
}

/**
 * Categorias de eventos para organização na UI
 */
export const WEBHOOK_EVENT_CATEGORIES = {
  'Tarefas': [
    WEBHOOK_EVENTS.TASK_CREATED,
    WEBHOOK_EVENTS.TASK_UPDATED,
    WEBHOOK_EVENTS.TASK_COMPLETED,
    WEBHOOK_EVENTS.TASK_ASSIGNED
  ],
  'Comentários': [
    WEBHOOK_EVENTS.COMMENT_ADDED,
    WEBHOOK_EVENTS.COMMENT_REPLY
  ],
  'Projetos': [
    WEBHOOK_EVENTS.PROJECT_UPDATED
  ],
  'Dependências': [
    WEBHOOK_EVENTS.DEPENDENCY_RESOLVED
  ]
}

/**
 * Labels amigáveis para eventos
 */
export const WEBHOOK_EVENT_LABELS = {
  [WEBHOOK_EVENTS.TASK_CREATED]: 'Tarefa Criada',
  [WEBHOOK_EVENTS.TASK_UPDATED]: 'Tarefa Atualizada',
  [WEBHOOK_EVENTS.TASK_COMPLETED]: 'Tarefa Concluída',
  [WEBHOOK_EVENTS.TASK_ASSIGNED]: 'Tarefa Atribuída',
  [WEBHOOK_EVENTS.COMMENT_ADDED]: 'Comentário Adicionado',
  [WEBHOOK_EVENTS.COMMENT_REPLY]: 'Resposta a Comentário',
  [WEBHOOK_EVENTS.PROJECT_UPDATED]: 'Projeto Atualizado',
  [WEBHOOK_EVENTS.DEPENDENCY_RESOLVED]: 'Dependência Resolvida'
}

/**
 * Descrições dos eventos
 */
export const WEBHOOK_EVENT_DESCRIPTIONS = {
  [WEBHOOK_EVENTS.TASK_CREATED]: 'Disparado quando uma nova tarefa é criada no projeto',
  [WEBHOOK_EVENTS.TASK_UPDATED]: 'Disparado quando uma tarefa existente é modificada',
  [WEBHOOK_EVENTS.TASK_COMPLETED]: 'Disparado quando uma tarefa é marcada como concluída',
  [WEBHOOK_EVENTS.TASK_ASSIGNED]: 'Disparado quando uma tarefa é atribuída a um usuário',
  [WEBHOOK_EVENTS.COMMENT_ADDED]: 'Disparado quando um comentário é adicionado a uma tarefa',
  [WEBHOOK_EVENTS.COMMENT_REPLY]: 'Disparado quando alguém responde a um comentário',
  [WEBHOOK_EVENTS.PROJECT_UPDATED]: 'Disparado quando informações do projeto são alteradas',
  [WEBHOOK_EVENTS.DEPENDENCY_RESOLVED]: 'Disparado quando uma dependência de tarefa é resolvida'
}

/**
 * Status de webhook
 */
export const WEBHOOK_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
}

/**
 * Utilitários para webhooks
 */
export const webhookUtils = {
  /**
   * Verifica se um evento é válido
   */
  isValidEvent: (event) => {
    return Object.values(WEBHOOK_EVENTS).includes(event)
  },

  /**
   * Obtém a categoria de um evento
   */
  getEventCategory: (event) => {
    for (const [category, events] of Object.entries(WEBHOOK_EVENT_CATEGORIES)) {
      if (events.includes(event)) {
        return category
      }
    }
    return 'Outros'
  },

  /**
   * Obtém o label amigável de um evento
   */
  getEventLabel: (event) => {
    return WEBHOOK_EVENT_LABELS[event] || event
  },

  /**
   * Obtém a descrição de um evento
   */
  getEventDescription: (event) => {
    return WEBHOOK_EVENT_DESCRIPTIONS[event] || 'Evento customizado'
  },

  /**
   * Formata URL para exibição
   */
  formatUrl: (url) => {
    try {
      const urlObj = new URL(url)
      return `${urlObj.hostname}${urlObj.pathname}`
    } catch {
      return url
    }
  },

  /**
   * Valida se URL é segura
   */
  isSecureUrl: (url) => {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }
}

export default {
  WEBHOOK_EVENTS,
  WEBHOOK_EVENT_CATEGORIES,
  WEBHOOK_EVENT_LABELS,
  WEBHOOK_EVENT_DESCRIPTIONS,
  WEBHOOK_STATUS,
  webhookUtils
}