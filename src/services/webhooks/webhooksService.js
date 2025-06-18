import { supabase } from '@/config/supabase'

/**
 * Service para operações CRUD de webhooks
 */
class WebhooksService {
  /**
   * Busca todos os webhooks de um projeto
   */
  async getProjectWebhooks(projectId) {
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .select(`
          *,
          created_by_profile:created_by(id, full_name, email)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Erro ao buscar webhooks:', error)
      return { data: null, error }
    }
  }

  /**
   * Busca webhook por ID
   */
  async getWebhookById(webhookId) {
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .select(`
          *,
          created_by_profile:created_by(id, full_name, email),
          project:projects(id, name)
        `)
        .eq('id', webhookId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Erro ao buscar webhook:', error)
      return { data: null, error }
    }
  }

  /**
   * Cria um novo webhook
   */
  async createWebhook(webhookData) {
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .insert([{
          project_id: webhookData.project_id,
          name: webhookData.name,
          url: webhookData.url,
          events: webhookData.events,
          active: webhookData.active ?? true,
          secret_key: webhookData.secret_key || null,
          created_by: webhookData.created_by
        }])
        .select(`
          *,
          created_by_profile:created_by(id, full_name, email)
        `)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Erro ao criar webhook:', error)
      return { data: null, error }
    }
  }

  /**
   * Atualiza um webhook existente
   */
  async updateWebhook(webhookId, updates) {
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', webhookId)
        .select(`
          *,
          created_by_profile:created_by(id, full_name, email)
        `)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Erro ao atualizar webhook:', error)
      return { data: null, error }
    }
  }

  /**
   * Remove um webhook
   */
  async deleteWebhook(webhookId) {
    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', webhookId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Erro ao deletar webhook:', error)
      return { error }
    }
  }

  /**
   * Alterna o status ativo/inativo de um webhook
   */
  async toggleWebhookStatus(webhookId, active) {
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .update({ 
          active,
          updated_at: new Date().toISOString()
        })
        .eq('id', webhookId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Erro ao alterar status do webhook:', error)
      return { data: null, error }
    }
  }

  /**
   * Testa a conectividade de um webhook
   */
  async testWebhook(webhook) {
    try {
      const testPayload = {
        event: 'webhook.test',
        timestamp: new Date().toISOString(),
        webhook: {
          id: webhook.id,
          name: webhook.name
        },
        message: 'Este é um teste de conectividade do webhook'
      }

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhook.secret_key && {
            'X-Webhook-Signature': await this._generateSignature(testPayload, webhook.secret_key)
          })
        },
        body: JSON.stringify(testPayload)
      })

      const isSuccess = response.ok
      const responseData = {
        status: response.status,
        statusText: response.statusText,
        success: isSuccess
      }

      return { data: responseData, error: null }
    } catch (error) {
      console.error('Erro ao testar webhook:', error)
      return { 
        data: { 
          success: false, 
          error: error.message 
        }, 
        error: null 
      }
    }
  }

  /**
   * Busca webhooks ativos para um projeto e evento específico
   */
  async getActiveWebhooksForEvent(projectId, eventType) {
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('project_id', projectId)
        .eq('active', true)
        .contains('events', [eventType])

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Erro ao buscar webhooks ativos:', error)
      return { data: null, error }
    }
  }

  /**
   * Gera assinatura HMAC SHA256 para o payload
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
   * Gera uma chave secreta aleatória
   */
  generateSecretKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}

export default new WebhooksService()