/**
 * Validações para webhooks
 */

// Regex para validação de URL
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/

// Eventos válidos
const VALID_EVENTS = [
  'task.created',
  'task.updated',
  'task.completed',
  'task.assigned',
  'comment.added',
  'comment.reply',
  'project.updated',
  'dependency.resolved'
]

/**
 * Valida os dados de um webhook
 */
export const validateWebhookData = (data) => {
  const errors = {}

  // Nome
  if (!data.name?.trim()) {
    errors.name = 'Nome é obrigatório'
  } else if (data.name.trim().length < 3) {
    errors.name = 'Nome deve ter pelo menos 3 caracteres'
  } else if (data.name.trim().length > 100) {
    errors.name = 'Nome deve ter no máximo 100 caracteres'
  }

  // URL
  if (!data.url?.trim()) {
    errors.url = 'URL é obrigatória'
  } else if (!URL_REGEX.test(data.url.trim())) {
    errors.url = 'URL deve ser um endereço válido (http:// ou https://)'
  } else if (data.url.trim().length > 500) {
    errors.url = 'URL deve ter no máximo 500 caracteres'
  }

  // Eventos
  if (!data.events || !Array.isArray(data.events) || data.events.length === 0) {
    errors.events = 'Selecione pelo menos um evento para monitorar'
  } else {
    // Verifica se todos os eventos são válidos
    const invalidEvents = data.events.filter(event => !VALID_EVENTS.includes(event))
    if (invalidEvents.length > 0) {
      errors.events = `Eventos inválidos: ${invalidEvents.join(', ')}`
    }
  }

  // Chave secreta (opcional, mas se fornecida deve ser válida)
  if (data.secret_key && typeof data.secret_key === 'string') {
    if (data.secret_key.length < 8) {
      errors.secret_key = 'Chave secreta deve ter pelo menos 8 caracteres'
    } else if (data.secret_key.length > 256) {
      errors.secret_key = 'Chave secreta deve ter no máximo 256 caracteres'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Valida URL de webhook
 */
export const validateWebhookUrl = (url) => {
  if (!url?.trim()) {
    return { isValid: false, error: 'URL é obrigatória' }
  }

  if (!URL_REGEX.test(url.trim())) {
    return { isValid: false, error: 'URL deve ser um endereço válido' }
  }

  // Verifica se não é localhost em produção
  if (import.meta.env.PROD && (url.includes('localhost') || url.includes('127.0.0.1'))) {
    return { isValid: false, error: 'URLs localhost não são permitidas em produção' }
  }

  return { isValid: true, error: null }
}

/**
 * Valida array de eventos
 */
export const validateWebhookEvents = (events) => {
  if (!events || !Array.isArray(events)) {
    return { isValid: false, error: 'Eventos deve ser um array' }
  }

  if (events.length === 0) {
    return { isValid: false, error: 'Selecione pelo menos um evento' }
  }

  if (events.length > 20) {
    return { isValid: false, error: 'Máximo de 20 eventos permitidos' }
  }

  const invalidEvents = events.filter(event => !VALID_EVENTS.includes(event))
  if (invalidEvents.length > 0) {
    return { 
      isValid: false, 
      error: `Eventos inválidos: ${invalidEvents.join(', ')}` 
    }
  }

  // Verifica duplicatas
  const uniqueEvents = [...new Set(events)]
  if (uniqueEvents.length !== events.length) {
    return { isValid: false, error: 'Eventos duplicados não são permitidos' }
  }

  return { isValid: true, error: null }
}

/**
 * Valida chave secreta
 */
export const validateSecretKey = (secretKey) => {
  if (!secretKey) {
    return { isValid: true, error: null } // Chave secreta é opcional
  }

  if (typeof secretKey !== 'string') {
    return { isValid: false, error: 'Chave secreta deve ser uma string' }
  }

  if (secretKey.length < 8) {
    return { isValid: false, error: 'Chave secreta deve ter pelo menos 8 caracteres' }
  }

  if (secretKey.length > 256) {
    return { isValid: false, error: 'Chave secreta deve ter no máximo 256 caracteres' }
  }

  // Verifica se contém caracteres válidos (alfanuméricos e alguns símbolos)
  const validChars = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/
  if (!validChars.test(secretKey)) {
    return { isValid: false, error: 'Chave secreta contém caracteres inválidos' }
  }

  return { isValid: true, error: null }
}

/**
 * Valida payload de webhook antes de enviar
 */
export const validateWebhookPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, error: 'Payload deve ser um objeto' }
  }

  if (!payload.event) {
    return { isValid: false, error: 'Payload deve conter um evento' }
  }

  if (!payload.timestamp) {
    return { isValid: false, error: 'Payload deve conter timestamp' }
  }

  // Verifica tamanho do payload (limite de 10MB)
  const payloadSize = JSON.stringify(payload).length
  if (payloadSize > 10 * 1024 * 1024) {
    return { isValid: false, error: 'Payload muito grande (máximo 10MB)' }
  }

  return { isValid: true, error: null }
}

/**
 * Sanitiza dados de webhook antes de salvar
 */
export const sanitizeWebhookData = (data) => {
  return {
    name: data.name?.trim() || '',
    url: data.url?.trim() || '',
    events: Array.isArray(data.events) ? [...new Set(data.events)] : [],
    active: Boolean(data.active),
    secret_key: data.secret_key?.trim() || null
  }
}

export default {
  validateWebhookData,
  validateWebhookUrl,
  validateWebhookEvents,
  validateSecretKey,
  validateWebhookPayload,
  sanitizeWebhookData,
  VALID_EVENTS
}