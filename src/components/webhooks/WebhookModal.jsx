import React, { useState, useEffect } from 'react'
import { Modal, Button, Input, Switch } from '@/components/shared/ui'
import { FormField } from '@/components/shared/forms'
import { EventSelector } from './EventSelector'
import { useWebhooks, useWebhook } from '@/hooks/webhooks'
import { useAuth } from '@/hooks/auth'
import { webhookValidations } from '@/utils/validations'
import { Save, Plus, Key, RotateCcw } from 'lucide-react'

/**
 * Modal para criar ou editar webhook
 */
export const WebhookModal = ({ 
  isOpen, 
  onClose, 
  webhookId = null, 
  projectId 
}) => {
  const { user } = useAuth()
  const { createWebhook, generateSecretKey } = useWebhooks(projectId)
  const { 
    webhook, 
    updateWebhook, 
    isLoading: isLoadingWebhook 
  } = useWebhook(webhookId)

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [],
    active: true,
    secret_key: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generateSecret, setGenerateSecret] = useState(false)

  const isEditing = !!webhookId

  // Reset form quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      if (isEditing && webhook) {
        setFormData({
          name: webhook.name || '',
          url: webhook.url || '',
          events: webhook.events || [],
          active: webhook.active ?? true,
          secret_key: webhook.secret_key || ''
        })
        setGenerateSecret(!!webhook.secret_key)
      } else {
        setFormData({
          name: '',
          url: '',
          events: [],
          active: true,
          secret_key: ''
        })
        setGenerateSecret(false)
      }
      setErrors({})
    }
  }, [isOpen, isEditing, webhook])

  // Valida formulário
  const validateForm = () => {
    const validation = webhookValidations.validateWebhookData(formData)
    setErrors(validation.errors)
    return validation.isValid
  }

  // Handle mudanças nos campos
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Remove erro do campo quando usuário corrige
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // Gera nova chave secreta
  const handleGenerateSecret = () => {
    const newSecret = generateSecretKey()
    handleChange('secret_key', newSecret)
  }

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      const webhookData = {
        ...formData,
        secret_key: generateSecret ? formData.secret_key : null
      }

      if (isEditing) {
        await updateWebhook(webhookId, webhookData)
      } else {
        await createWebhook({
          ...webhookData,
          project_id: projectId,
          created_by: user.id
        })
      }
      
      onClose()
    } catch (error) {
      console.error('Erro ao salvar webhook:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle close
  const handleClose = () => {
    if (isSubmitting) return
    onClose()
  }

  const modalTitle = isEditing ? 'Editar Webhook' : 'Criar Novo Webhook'
  const submitText = isEditing ? 'Salvar Alterações' : 'Criar Webhook'

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Loading state para edição */}
        {isEditing && isLoadingWebhook ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Informações básicas */}
            <div className="space-y-4">
              <FormField
                label="Nome do Webhook"
                error={errors.name}
                required
              >
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ex: Slack Notificações"
                  maxLength={100}
                  autoFocus
                />
              </FormField>

              <FormField
                label="URL de Destino"
                error={errors.url}
                required
                helpText="URL que receberá os webhooks quando eventos ocorrerem"
              >
                <Input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                />
              </FormField>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Webhook Ativo</p>
                  <p className="text-sm text-gray-500">
                    Ative ou desative este webhook
                  </p>
                </div>
                <Switch
                  checked={formData.active}
                  onChange={(checked) => handleChange('active', checked)}
                />
              </div>
            </div>

            {/* Eventos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Eventos para Monitorar
                <span className="text-red-500 ml-1">*</span>
              </label>
              <EventSelector
                selectedEvents={formData.events}
                onChange={(events) => handleChange('events', events)}
                error={errors.events}
              />
            </div>

            {/* Segurança */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Chave Secreta</p>
                  <p className="text-sm text-gray-500">
                    Assina payloads com HMAC SHA256 para segurança
                  </p>
                </div>
                <Switch
                  checked={generateSecret}
                  onChange={setGenerateSecret}
                />
              </div>

              {generateSecret && (
                <div className="space-y-3">
                  <FormField label="Chave Secreta">
                    <div className="flex gap-2">
                      <Input
                        value={formData.secret_key}
                        onChange={(e) => handleChange('secret_key', e.target.value)}
                        placeholder="Chave secreta para assinar payloads"
                        className="font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGenerateSecret}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormField>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateSecret}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Gerar Chave Aleatória
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Ações */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting || (isEditing && isLoadingWebhook)}
          >
            {isEditing ? (
              <Save className="h-4 w-4 mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? 'Salvando...' : submitText}
          </Button>
        </div>
      </form>
    </Modal>
  )
}