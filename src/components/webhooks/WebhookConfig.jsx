import React, { useState, useEffect } from 'react'
import { Card, Button, Input, Switch, Badge, Tooltip } from '@/components/shared/ui'
import { FormField, FormTextarea } from '@/components/shared/forms'
import { EventSelector } from './EventSelector'
import { useWebhook } from '@/hooks/webhooks'
import { webhookValidations } from '@/utils/validations'
import { WEBHOOK_EVENTS, webhookUtils, WEBHOOK_STATUS } from '@/utils/constants/webhookEvents'
import { 
  Settings, 
  TestTube, 
  Key, 
  RotateCcw, 
  Save, 
  AlertTriangle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'

/**
 * Componente para configuração de um webhook específico
 */
export const WebhookConfig = ({ webhookId, onClose }) => {
  const {
    webhook,
    isLoading,
    isUpdating,
    isTesting,
    updateWebhook,
    toggleStatus,
    testWebhook,
    regenerateSecretKey,
    removeSecretKey
  } = useWebhook(webhookId)

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [],
    active: true,
    secret_key: ''
  })
  const [errors, setErrors] = useState({})
  const [showSecret, setShowSecret] = useState(false)
  const [lastTestResult, setLastTestResult] = useState(null)

  // Carrega dados do webhook quando disponível
  useEffect(() => {
    if (webhook) {
      setFormData({
        name: webhook.name || '',
        url: webhook.url || '',
        events: webhook.events || [],
        active: webhook.active ?? true,
        secret_key: webhook.secret_key || ''
      })
    }
  }, [webhook])

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

  // Salva alterações
  const handleSave = async () => {
    if (!validateForm()) return

    try {
      const updates = {
        name: formData.name,
        url: formData.url,
        events: formData.events,
        active: formData.active
      }

      // Só inclui secret_key se foi alterado
      if (formData.secret_key !== webhook?.secret_key) {
        updates.secret_key = formData.secret_key || null
      }

      await updateWebhook(updates)
    } catch (error) {
      console.error('Erro ao salvar webhook:', error)
    }
  }

  // Testa webhook
  const handleTest = async () => {
    try {
      const result = await testWebhook()
      setLastTestResult(result)
    } catch (error) {
      setLastTestResult({ success: false, error: error.message })
    }
  }

  // Gera nova chave secreta
  const handleRegenerateSecret = async () => {
    if (confirm('Tem certeza que deseja regenerar a chave secreta? A chave atual será invalidada.')) {
      try {
        await regenerateSecretKey()
      } catch (error) {
        console.error('Erro ao regenerar chave:', error)
      }
    }
  }

  // Remove chave secreta
  const handleRemoveSecret = async () => {
    if (confirm('Tem certeza que deseja remover a chave secreta? O webhook não será mais assinado.')) {
      try {
        await removeSecretKey()
        setFormData(prev => ({ ...prev, secret_key: '' }))
      } catch (error) {
        console.error('Erro ao remover chave:', error)
      }
    }
  }

  // Copia chave secreta
  const handleCopySecret = () => {
    navigator.clipboard.writeText(formData.secret_key)
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </Card>
    )
  }

  if (!webhook) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
          <p>Webhook não encontrado</p>
        </div>
      </Card>
    )
  }

  const hasChanges = JSON.stringify(formData) !== JSON.stringify({
    name: webhook.name || '',
    url: webhook.url || '',
    events: webhook.events || [],
    active: webhook.active ?? true,
    secret_key: webhook.secret_key || ''
  })

  // Status config
  const statusConfig = webhookUtils.getStatusConfig(
    webhook.active ? WEBHOOK_STATUS.ACTIVE : WEBHOOK_STATUS.INACTIVE
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-gray-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Configurar Webhook
            </h2>
            <p className="text-sm text-gray-500">
              Configure como e quando este webhook será disparado
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={statusConfig.badgeClass}>
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      {/* Configurações básicas */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Configurações Básicas
        </h3>
        
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
            />
          </FormField>

          <FormField
            label="URL de Destino"
            error={errors.url}
            required
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
      </Card>

      {/* Eventos */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Eventos Monitorados
        </h3>
        
        <EventSelector
          selectedEvents={formData.events}
          onChange={(events) => handleChange('events', events)}
          error={errors.events}
        />
      </Card>

      {/* Segurança */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Configurações de Segurança
        </h3>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            A chave secreta é usada para assinar o payload com HMAC SHA256, 
            permitindo verificar a autenticidade do webhook.
          </p>
          
          {formData.secret_key ? (
            <div className="space-y-3">
              <FormField label="Chave Secreta">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      type={showSecret ? 'text' : 'password'}
                      value={formData.secret_key}
                      readOnly
                      className="pr-20"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <Tooltip content={showSecret ? 'Ocultar' : 'Mostrar'}>
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </Tooltip>
                      <Tooltip content="Copiar chave">
                        <button
                          type="button"
                          onClick={handleCopySecret}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Copy size={16} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </FormField>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateSecret}
                  disabled={isUpdating}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Regenerar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveSecret}
                  disabled={isUpdating}
                >
                  Remover Chave
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 mb-3">
                Nenhuma chave secreta configurada. O webhook não será assinado.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={regenerateSecretKey}
                disabled={isUpdating}
              >
                <Key className="h-4 w-4 mr-2" />
                Gerar Chave Secreta
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Teste */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Testar Webhook
        </h3>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Envie um payload de teste para verificar se o webhook está funcionando corretamente.
          </p>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={isTesting || !formData.url}
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isTesting ? 'Testando...' : 'Enviar Teste'}
            </Button>
            
            {lastTestResult && (
              <div className="flex items-center gap-2">
                {lastTestResult.success ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Teste enviado com sucesso</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Falha no teste</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Ações */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={onClose}
        >
          Cancelar
        </Button>
        
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isUpdating}
          >
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </div>
  )
}