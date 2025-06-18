import React, { useState } from 'react'
import { Card, Badge, Button, Dropdown, Switch, Tooltip } from '@/components/shared/ui'
import { useWebhooks } from '@/hooks/webhooks'
import { webhookUtils, WEBHOOK_STATUS } from '@/utils/constants/webhookEvents'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Link2, 
  Settings, 
  TestTube, 
  Trash2, 
  MoreVertical,
  Key,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react'

/**
 * Card para exibir informações de um webhook
 */
export const WebhookCard = ({ 
  webhook, 
  projectId,
  onEdit,
  onConfigure 
}) => {
  const { toggleWebhook, deleteWebhook, testWebhook } = useWebhooks(projectId)
  const [isTestingLocal, setIsTestingLocal] = useState(false)
  const [lastTestResult, setLastTestResult] = useState(null)

  // Handle toggle status
  const handleToggleStatus = async () => {
    try {
      await toggleWebhook(webhook.id, !webhook.active)
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja remover o webhook "${webhook.name}"?`)) {
      return
    }

    try {
      await deleteWebhook(webhook.id)
    } catch (error) {
      console.error('Erro ao deletar webhook:', error)
    }
  }

  // Handle test
  const handleTest = async () => {
    setIsTestingLocal(true)
    setLastTestResult(null)
    
    try {
      const result = await testWebhook(webhook)
      setLastTestResult(result)
    } catch (error) {
      setLastTestResult({ success: false, error: error.message })
    } finally {
      setIsTestingLocal(false)
    }
  }

  // Formata a URL para exibição
  const getDisplayUrl = (url) => {
    try {
      const urlObj = new URL(url)
      return `${urlObj.hostname}${urlObj.pathname}`
    } catch {
      return url
    }
  }

  // Menu de ações
  const actionItems = [
    {
      label: 'Configurar',
      icon: Settings,
      onClick: () => onConfigure?.(webhook.id)
    },
    {
      label: 'Testar Webhook',
      icon: TestTube,
      onClick: handleTest,
      disabled: isTestingLocal
    },
    {
      label: 'Deletar',
      icon: Trash2,
      onClick: handleDelete,
      className: 'text-red-600 hover:text-red-700'
    }
  ]

  // Badge status usando configurações visuais
  const statusConfig = webhookUtils.getStatusConfig(
    webhook.active ? WEBHOOK_STATUS.ACTIVE : WEBHOOK_STATUS.INACTIVE
  )

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {webhook.name}
              </h3>
              <Badge className={statusConfig.badgeClass}>
                {statusConfig.label}
              </Badge>
              {webhook.secret_key && (
                <Tooltip content="Webhook assinado com chave secreta">
                  <Key className="h-4 w-4 text-gray-500" />
                </Tooltip>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link2 className="h-4 w-4" />
              <span className="truncate">
                {getDisplayUrl(webhook.url)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={webhook.active}
              onChange={handleToggleStatus}
              size="sm"
            />
            
            <Dropdown
              trigger={
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              }
              items={actionItems}
            />
          </div>
        </div>

        {/* Eventos */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Eventos monitorados ({webhook.events?.length || 0})
          </p>
          <div className="flex flex-wrap gap-1">
            {webhook.events?.slice(0, 3).map((event) => (
              <Badge key={event} variant="outline" size="sm">
                {event}
              </Badge>
            ))}
            {webhook.events?.length > 3 && (
              <Badge variant="outline" size="sm">
                +{webhook.events.length - 3} mais
              </Badge>
            )}
            {(!webhook.events || webhook.events.length === 0) && (
              <span className="text-sm text-gray-500">
                Nenhum evento configurado
              </span>
            )}
          </div>
        </div>

        {/* Status do último teste */}
        {(lastTestResult || isTestingLocal) && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {isTestingLocal ? (
                <>
                  <Clock className="h-4 w-4 text-blue-500 animate-spin" />
                  <span className="text-sm text-blue-600">
                    Enviando teste...
                  </span>
                </>
              ) : lastTestResult?.success ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">
                    Teste enviado com sucesso
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">
                    Falha no teste: {lastTestResult?.error}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            <p>
              Criado por {webhook.created_by_profile?.full_name}
            </p>
            <p>
              há {formatDistanceToNow(new Date(webhook.created_at), { 
                locale: ptBR,
                addSuffix: false 
              })}
            </p>
          </div>

          <div className="flex gap-2">
            <Tooltip content="Testar webhook">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={isTestingLocal}
              >
                <TestTube className="h-4 w-4" />
              </Button>
            </Tooltip>
            
            <Tooltip content="Configurar webhook">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onConfigure?.(webhook.id)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </Card>
  )
}