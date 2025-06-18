import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { webhooksService } from '@/services/webhooks'
import { useToast } from '@/hooks/shared'

/**
 * Hook para gerenciar um webhook específico
 */
export const useWebhook = (webhookId) => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  // Query para buscar webhook específico
  const {
    data: webhook,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['webhook', webhookId],
    queryFn: async () => {
      if (!webhookId) return null
      
      const { data, error } = await webhooksService.getWebhookById(webhookId)
      if (error) throw error
      return data
    },
    enabled: !!webhookId
  })

  // Mutation para atualizar webhook
  const updateMutation = useMutation({
    mutationFn: (updates) => webhooksService.updateWebhook(webhookId, updates),
    onSuccess: (data) => {
      // Atualiza cache específico do webhook
      queryClient.setQueryData(['webhook', webhookId], data.data)
      
      // Invalida lista de webhooks do projeto
      if (webhook?.project_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['webhooks', webhook.project_id] 
        })
      }
      
      showToast('Webhook atualizado com sucesso!', 'success')
    },
    onError: (error) => {
      console.error('Erro ao atualizar webhook:', error)
      showToast('Erro ao atualizar webhook. Tente novamente.', 'error')
    }
  })

  // Mutation para deletar webhook
  const deleteMutation = useMutation({
    mutationFn: () => webhooksService.deleteWebhook(webhookId),
    onSuccess: () => {
      // Remove do cache
      queryClient.removeQueries({ queryKey: ['webhook', webhookId] })
      
      // Invalida lista de webhooks do projeto
      if (webhook?.project_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['webhooks', webhook.project_id] 
        })
      }
      
      showToast('Webhook removido com sucesso!', 'success')
    },
    onError: (error) => {
      console.error('Erro ao deletar webhook:', error)
      showToast('Erro ao remover webhook. Tente novamente.', 'error')
    }
  })

  // Mutation para alternar status
  const toggleStatusMutation = useMutation({
    mutationFn: (active) => webhooksService.toggleWebhookStatus(webhookId, active),
    onSuccess: (data) => {
      // Atualiza cache local
      queryClient.setQueryData(['webhook', webhookId], (old) => ({
        ...old,
        active: data.data?.active
      }))
      
      // Invalida lista de webhooks do projeto
      if (webhook?.project_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['webhooks', webhook.project_id] 
        })
      }
      
      const status = data.data?.active ? 'ativado' : 'desativado'
      showToast(`Webhook ${status} com sucesso!`, 'success')
    },
    onError: (error) => {
      console.error('Erro ao alterar status do webhook:', error)
      showToast('Erro ao alterar status do webhook.', 'error')
    }
  })

  // Mutation para testar webhook
  const testMutation = useMutation({
    mutationFn: () => webhooksService.testWebhook(webhook),
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
  const updateWebhook = (updates) => {
    return updateMutation.mutateAsync(updates)
  }

  const deleteWebhook = () => {
    return deleteMutation.mutateAsync()
  }

  const toggleStatus = () => {
    const newStatus = !webhook?.active
    return toggleStatusMutation.mutateAsync(newStatus)
  }

  const testWebhook = () => {
    if (!webhook) {
      showToast('Webhook não encontrado', 'error')
      return Promise.reject(new Error('Webhook não encontrado'))
    }
    return testMutation.mutateAsync()
  }

  // Função para regenerar chave secreta
  const regenerateSecretKey = () => {
    const newSecretKey = webhooksService.generateSecretKey()
    return updateWebhook({ secret_key: newSecretKey })
  }

  // Função para remover chave secreta
  const removeSecretKey = () => {
    return updateWebhook({ secret_key: null })
  }

  // Status computados
  const isActive = webhook?.active === true
  const hasSecretKey = !!webhook?.secret_key
  const eventCount = webhook?.events?.length || 0

  return {
    // Data
    webhook,
    isActive,
    hasSecretKey,
    eventCount,
    
    // Loading states
    isLoading,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleStatusMutation.isPending,
    isTesting: testMutation.isPending,
    
    // Error state
    error,
    
    // Actions
    updateWebhook,
    deleteWebhook,
    toggleStatus,
    testWebhook,
    regenerateSecretKey,
    removeSecretKey,
    refetch
  }
}