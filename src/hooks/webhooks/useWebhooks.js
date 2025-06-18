import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { webhooksService } from '@/services/webhooks'
import { useToast } from '@/hooks/shared'

/**
 * Hook para gerenciar webhooks de um projeto
 */
export const useWebhooks = (projectId) => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  // Query para buscar webhooks do projeto
  const {
    data: webhooks = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['webhooks', projectId],
    queryFn: async () => {
      if (!projectId) return []
      
      const { data, error } = await webhooksService.getProjectWebhooks(projectId)
      if (error) throw error
      return data || []
    },
    enabled: !!projectId
  })

  // Mutation para criar webhook
  const createWebhookMutation = useMutation({
    mutationFn: webhooksService.createWebhook,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', projectId] })
      showToast('Webhook criado com sucesso!', 'success')
    },
    onError: (error) => {
      console.error('Erro ao criar webhook:', error)
      showToast('Erro ao criar webhook. Tente novamente.', 'error')
    }
  })

  // Mutation para atualizar webhook
  const updateWebhookMutation = useMutation({
    mutationFn: ({ webhookId, updates }) => 
      webhooksService.updateWebhook(webhookId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', projectId] })
      showToast('Webhook atualizado com sucesso!', 'success')
    },
    onError: (error) => {
      console.error('Erro ao atualizar webhook:', error)
      showToast('Erro ao atualizar webhook. Tente novamente.', 'error')
    }
  })

  // Mutation para deletar webhook
  const deleteWebhookMutation = useMutation({
    mutationFn: webhooksService.deleteWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', projectId] })
      showToast('Webhook removido com sucesso!', 'success')
    },
    onError: (error) => {
      console.error('Erro ao deletar webhook:', error)
      showToast('Erro ao remover webhook. Tente novamente.', 'error')
    }
  })

  // Mutation para alternar status do webhook
  const toggleWebhookMutation = useMutation({
    mutationFn: ({ webhookId, active }) => 
      webhooksService.toggleWebhookStatus(webhookId, active),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', projectId] })
      const status = data.data?.active ? 'ativado' : 'desativado'
      showToast(`Webhook ${status} com sucesso!`, 'success')
    },
    onError: (error) => {
      console.error('Erro ao alterar status do webhook:', error)
      showToast('Erro ao alterar status do webhook.', 'error')
    }
  })

  // Mutation para testar webhook
  const testWebhookMutation = useMutation({
    mutationFn: webhooksService.testWebhook,
    onSuccess: (data) => {
      if (data.data?.success) {
        showToast('Teste de webhook enviado com sucesso!', 'success')
      } else {
        showToast(`Falha no teste: ${data.data?.error || 'Erro desconhecido'}`, 'error')
      }
    },
    onError: (error) => {
      console.error('Erro ao testar webhook:', error)
      showToast('Erro ao testar webhook. Verifique a URL.', 'error')
    }
  })

  // Funções de conveniência
  const createWebhook = (webhookData) => {
    return createWebhookMutation.mutateAsync({
      ...webhookData,
      project_id: projectId
    })
  }

  const updateWebhook = (webhookId, updates) => {
    return updateWebhookMutation.mutateAsync({ webhookId, updates })
  }

  const deleteWebhook = (webhookId) => {
    return deleteWebhookMutation.mutateAsync(webhookId)
  }

  const toggleWebhook = (webhookId, active) => {
    return toggleWebhookMutation.mutateAsync({ webhookId, active })
  }

  const testWebhook = (webhook) => {
    return testWebhookMutation.mutateAsync(webhook)
  }

  // Função para gerar chave secreta
  const generateSecretKey = () => {
    return webhooksService.generateSecretKey()
  }

  // Estatísticas dos webhooks
  const stats = {
    total: webhooks.length,
    active: webhooks.filter(w => w.active).length,
    inactive: webhooks.filter(w => !w.active).length
  }

  return {
    // Data
    webhooks,
    stats,
    
    // Loading states
    isLoading,
    isCreating: createWebhookMutation.isPending,
    isUpdating: updateWebhookMutation.isPending,
    isDeleting: deleteWebhookMutation.isPending,
    isToggling: toggleWebhookMutation.isPending,
    isTesting: testWebhookMutation.isPending,
    
    // Error state
    error,
    
    // Actions
    createWebhook,
    updateWebhook,
    deleteWebhook,
    toggleWebhook,
    testWebhook,
    generateSecretKey,
    refetch
  }
}