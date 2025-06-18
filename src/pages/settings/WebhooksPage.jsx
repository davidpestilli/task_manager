import React from 'react'
import { WebhookList } from '@/components/webhooks'
import { useProject } from '@/hooks/projects'
import { Webhook, AlertCircle } from 'lucide-react'

/**
 * Página de configuração de webhooks do projeto
 */
export const WebhooksPage = ({ projectId }) => {
  const { project, isLoading, error } = useProject(projectId)

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="h-12 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 border rounded-lg">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erro ao carregar projeto
          </h3>
          <p className="text-gray-500 mb-4">
            Não foi possível carregar as informações do projeto
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  // Project not found
  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Webhook className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Projeto não encontrado
          </h3>
          <p className="text-gray-500">
            O projeto selecionado não existe ou você não tem acesso a ele
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header do projeto */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-3">
          <Webhook className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-900">
              Webhooks do Projeto: {project.name}
            </h3>
            <p className="text-sm text-blue-700">
              Configure integrações para receber notificações automáticas sobre eventos deste projeto
            </p>
          </div>
        </div>
      </div>

      {/* Documentação rápida */}
      <div className="mb-6 bg-gray-50 border rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">
          Como funcionam os webhooks?
        </h4>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            • Webhooks enviam dados em tempo real para URLs que você configurar quando eventos específicos ocorrem
          </p>
          <p>
            • Dados são enviados via POST em formato JSON com assinatura HMAC SHA256 (opcional)
          </p>
          <p>
            • Você pode configurar diferentes eventos: criação de tarefas, comentários, conclusões, etc.
          </p>
          <p>
            • Ideal para integrar com Slack, Discord, sistemas de CI/CD, ou APIs customizadas
          </p>
        </div>
      </div>

      {/* Lista de webhooks */}
      <WebhookList projectId={projectId} />
    </div>
  )
}