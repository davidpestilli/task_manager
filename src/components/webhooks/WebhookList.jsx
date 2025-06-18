import React, { useState } from 'react'
import { Button, Badge, Input, Dropdown } from '@/components/shared/ui'
import { WebhookCard } from './WebhookCard'
import { WebhookModal } from './WebhookModal'
import { WebhookConfig } from './WebhookConfig'
import { useWebhooks } from '@/hooks/webhooks'
import { useDebounce } from '@/hooks/shared'
import { 
  Plus, 
  Search, 
  Filter, 
  Webhook,
  Settings,
  CheckCircle,
  XCircle
} from 'lucide-react'

/**
 * Lista de webhooks do projeto
 */
export const WebhookList = ({ projectId }) => {
  const { webhooks, isLoading, stats } = useWebhooks(projectId)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingWebhookId, setEditingWebhookId] = useState(null)
  const [configuringWebhookId, setConfiguringWebhookId] = useState(null)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Filtros
  const statusOptions = [
    { value: 'all', label: 'Todos os Status', icon: Filter },
    { value: 'active', label: 'Apenas Ativos', icon: CheckCircle },
    { value: 'inactive', label: 'Apenas Inativos', icon: XCircle }
  ]

  // Webhooks filtrados
  const filteredWebhooks = webhooks.filter(webhook => {
    // Filtro por busca
    const matchesSearch = !debouncedSearchTerm || 
      webhook.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      webhook.url.toLowerCase().includes(debouncedSearchTerm.toLowerCase())

    // Filtro por status
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && webhook.active) ||
      (statusFilter === 'inactive' && !webhook.active)

    return matchesSearch && matchesStatus
  })

  // Handle ações
  const handleCreateWebhook = () => {
    setIsCreateModalOpen(true)
  }

  const handleEditWebhook = (webhookId) => {
    setEditingWebhookId(webhookId)
  }

  const handleConfigureWebhook = (webhookId) => {
    setConfiguringWebhookId(webhookId)
  }

  const handleCloseModals = () => {
    setIsCreateModalOpen(false)
    setEditingWebhookId(null)
  }

  const handleCloseConfig = () => {
    setConfiguringWebhookId(null)
  }

  // Se está configurando um webhook específico, mostra apenas ele
  if (configuringWebhookId) {
    return (
      <WebhookConfig
        webhookId={configuringWebhookId}
        onClose={handleCloseConfig}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Webhooks</h2>
          <p className="text-gray-600">
            Configure integrações para receber notificações em tempo real
          </p>
        </div>
        
        <Button onClick={handleCreateWebhook}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Webhook
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Webhook className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <XCircle className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar webhooks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dropdown
          trigger={
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {statusOptions.find(opt => opt.value === statusFilter)?.label}
            </Button>
          }
          items={statusOptions.map(option => ({
            label: option.label,
            icon: option.icon,
            onClick: () => setStatusFilter(option.value)
          }))}
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white p-6 rounded-lg border">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de webhooks */}
      {!isLoading && (
        <>
          {filteredWebhooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWebhooks.map((webhook) => (
                <WebhookCard
                  key={webhook.id}
                  webhook={webhook}
                  projectId={projectId}
                  onEdit={handleEditWebhook}
                  onConfigure={handleConfigureWebhook}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Webhook className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {webhooks.length === 0 ? 'Nenhum webhook configurado' : 'Nenhum webhook encontrado'}
              </h3>
              <p className="text-gray-500 mb-6">
                {webhooks.length === 0 
                  ? 'Configure webhooks para receber notificações em tempo real sobre eventos do projeto.'
                  : 'Tente ajustar os filtros para encontrar o webhook desejado.'
                }
              </p>
              {webhooks.length === 0 && (
                <Button onClick={handleCreateWebhook}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Webhook
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Modais */}
      <WebhookModal
        isOpen={isCreateModalOpen || !!editingWebhookId}
        onClose={handleCloseModals}
        webhookId={editingWebhookId}
        projectId={projectId}
      />
    </div>
  )
}