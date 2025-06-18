import webhooksService from './webhooksService'
import { webhookUtils, WEBHOOK_HEADERS, WEBHOOK_EVENTS } from '@/utils/constants/webhookEvents'

/**
 * Dispatcher responsável por enviar webhooks quando eventos ocorrem
 * Atualizado para usar o sistema completo de webhooks
 */
class WebhookDispatcher {
  constructor() {
    this.eventQueue = []
    this.isProcessing = false
    this.maxRetries = 3
    this.timeout = 15000 // 15 segundos
  }

  /**
   * Adiciona um evento à fila de processamento
   */
  async dispatch(eventType, eventData) {
    const event = {
      type: eventType,
      data: eventData,
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID()
    }

    this.eventQueue.push(event)
    
    if (!this.isProcessing) {
      this._processQueue()
    }
  }

  /**
   * Processa a fila de eventos
   */
  async _processQueue() {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return
    }

    this.isProcessing = true

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()
      
      try {
        await this._processEvent(event)
      } catch (error) {
        console.error('Erro ao processar evento webhook:', error)
      }
    }

    this.isProcessing = false
  }

  /**
   * Processa um evento específico
   */
  async _processEvent(event) {
    const { type, data, timestamp } = event

    // Busca webhooks ativos para o projeto e evento
    const projectId = this._extractProjectId(data)
    if (!projectId) {
      console.warn('Projeto não encontrado no evento:', event)
      return
    }

    const { data: webhooks, error } = await webhooksService.getActiveWebhooksForEvent(
      projectId, 
      type
    )

    if (error || !webhooks?.length) {
      return
    }

    // Envia webhook para cada endpoint configurado
    const promises = webhooks.map(webhook => 
      this._sendWebhook(webhook, type, data, timestamp)
    )

    await Promise.allSettled(promises)
  }

  /**
   * Envia webhook para um endpoint específico
   */
  async _sendWebhook(webhook, eventType, eventData, timestamp) {
    const deliveryId = webhookUtils.generateDeliveryId()
    let attempt = 0

    while (attempt < this.maxRetries) {
      try {
        const payload = this._buildPayload(eventType, eventData, timestamp, deliveryId)
        
        const headers = {
          [WEBHOOK_HEADERS.CONTENT_TYPE]: 'application/json',
          [WEBHOOK_HEADERS.USER_AGENT]: 'TaskManager-Webhook/1.0',
          [WEBHOOK_HEADERS.EVENT_TYPE]: eventType,
          [WEBHOOK_HEADERS.DELIVERY_ID]: deliveryId
        }

        // Adiciona assinatura se chave secreta estiver configurada
        if (webhook.secret_key) {
          headers[WEBHOOK_HEADERS.SIGNATURE] = await this._generateSignature(
            payload, 
            webhook.secret_key
          )
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        // Log do resultado
        console.log(`Webhook ${webhook.name} enviado (tentativa ${attempt + 1}):`, {
          status: response.status,
          event: eventType,
          url: webhook.url,
          deliveryId,
          success: response.ok
        })

        if (response.ok) {
          return { success: true, status: response.status, deliveryId }
        }

        // Se não for erro 5xx, não tenta novamente
        if (response.status < 500) {
          return { 
            success: false, 
            status: response.status, 
            deliveryId,
            error: `HTTP ${response.status}: ${response.statusText}`
          }
        }

        attempt++
        if (attempt < this.maxRetries) {
          await this._delay(Math.pow(2, attempt) * 1000) // Backoff exponencial
        }

      } catch (error) {
        attempt++
        console.error(`Erro ao enviar webhook ${webhook.name} (tentativa ${attempt}):`, error)
        
        if (attempt < this.maxRetries) {
          await this._delay(Math.pow(2, attempt) * 1000)
        }
      }
    }

    return { 
      success: false, 
      deliveryId,
      error: `Falhou após ${this.maxRetries} tentativas`
    }
  }

  /**
   * Delay helper para retry
   */
  async _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Constrói o payload do webhook baseado no tipo de evento
   */
  _buildPayload(eventType, eventData, timestamp, deliveryId) {
    // Usa o utilitário do webhookEvents para criar payload estruturado
    const payload = webhookUtils.createPayload(eventType, eventData)
    
    if (payload) {
      // Sobrescreve timestamp e deliveryId se fornecidos
      payload.timestamp = timestamp
      payload.delivery_id = deliveryId
      return payload
    }

    // Fallback para eventos customizados não mapeados
    return {
      event: eventType,
      timestamp,
      delivery_id: deliveryId,
      data: eventData
    }
  }

  /**
   * Extrai o project_id do evento
   */
  _extractProjectId(eventData) {
    return eventData.project?.id || 
           eventData.task?.project_id || 
           eventData.project_id
  }

  /**
   * Gera assinatura HMAC SHA256
   */
  async _generateSignature(payload, secret) {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const messageData = encoder.encode(JSON.stringify(payload))
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign('HMAC', key, messageData)
    const hashArray = Array.from(new Uint8Array(signature))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    return `sha256=${hashHex}`
  }

  /**
   * Métodos de conveniência para eventos específicos
   */
  async taskCreated(task, user, project) {
    await this.dispatch(WEBHOOK_EVENTS.TASK_CREATED, { task, user, project })
  }

  async taskUpdated(task, previousData, user, project) {
    const changes = this._detectChanges(previousData, task)
    await this.dispatch(WEBHOOK_EVENTS.TASK_UPDATED, { 
      task, 
      changes, 
      user, 
      project 
    })
  }

  async taskCompleted(task, user, project) {
    await this.dispatch(WEBHOOK_EVENTS.TASK_COMPLETED, { task, user, project })
  }

  async taskAssigned(task, assignedTo, assignedBy, project) {
    await this.dispatch(WEBHOOK_EVENTS.TASK_ASSIGNED, { 
      task, 
      assigned_to: assignedTo, 
      assigned_by: assignedBy, 
      project 
    })
  }

  async taskStatusChanged(task, oldStatus, newStatus, user, project) {
    await this.dispatch(WEBHOOK_EVENTS.TASK_STATUS_CHANGED, {
      task,
      status: { old_status: oldStatus, new_status: newStatus },
      user,
      project
    })
  }

  async commentAdded(comment, task, user, project) {
    await this.dispatch(WEBHOOK_EVENTS.COMMENT_ADDED, { comment, task, user, project })
  }

  async commentReplied(comment, parentComment, task, user, project) {
    await this.dispatch(WEBHOOK_EVENTS.COMMENT_REPLIED, { 
      comment, 
      parent_comment: parentComment,
      task, 
      user, 
      project 
    })
  }

  async projectCreated(project, user) {
    await this.dispatch(WEBHOOK_EVENTS.PROJECT_CREATED, { project, user })
  }

  async projectUpdated(project, previousData, user) {
    const changes = this._detectChanges(previousData, project)
    await this.dispatch(WEBHOOK_EVENTS.PROJECT_UPDATED, { project, changes, user })
  }

  async memberAdded(project, member, addedBy) {
    await this.dispatch(WEBHOOK_EVENTS.MEMBER_ADDED, {
      project,
      member,
      added_by: addedBy
    })
  }

  async memberRoleChanged(project, member, oldRole, newRole, changedBy) {
    await this.dispatch(WEBHOOK_EVENTS.MEMBER_ROLE_CHANGED, {
      project,
      member,
      role: { old_role: oldRole, new_role: newRole },
      changed_by: changedBy
    })
  }

  /**
   * Detecta mudanças entre objetos
   */
  _detectChanges(previous, current) {
    const changes = {}
    
    for (const key in current) {
      if (previous[key] !== current[key]) {
        changes[key] = {
          from: previous[key],
          to: current[key]
        }
      }
    }
    
    return changes
  }
}

export default new WebhookDispatcher()