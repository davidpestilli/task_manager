import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/shared'
import { tasksService } from '@/services/tasks'
import { validateTaskTransfer } from '@/utils/helpers/validationUtils'

/**
 * Hook especializado para transferência e compartilhamento de tarefas
 * 
 * @param {String} projectId - ID do projeto
 * @param {Object} options - Opções de configuração
 * @returns {Object} Estado e funções para transferência de tarefas
 */
export const useTaskTransfer = (projectId, options = {}) => {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  
  const {
    onSuccess,
    onError,
    enableAnalytics = false,
    autoRefresh = true
  } = options

  // Estados locais
  const [transferHistory, setTransferHistory] = useState([])
  const [validationCache, setValidationCache] = useState(new Map())

  /**
   * Mutation para transferir tarefa
   */
  const transferMutation = useMutation({
    mutationFn: async ({ taskId, fromUserId, toUserId, options = {} }) => {
      const result = await tasksService.transferTask(taskId, fromUserId, toUserId, options)
      
      // Registrar no histórico
      if (enableAnalytics) {
        setTransferHistory(prev => [...prev, {
          taskId,
          fromUserId,
          toUserId,
          timestamp: new Date(),
          type: 'transfer'
        }])
      }

      return result
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      if (autoRefresh) {
        queryClient.invalidateQueries(['tasks', projectId])
        queryClient.invalidateQueries(['people', projectId])
        queryClient.invalidateQueries(['user-metrics'])
      }

      // Limpar cache de validação
      setValidationCache(new Map())

      // Callback customizado
      onSuccess?.(data, variables)

      // Toast de sucesso
      showToast.success('Tarefa transferida com sucesso!')
    },
    onError: (error, variables) => {
      console.error('Erro ao transferir tarefa:', error)
      
      // Callback customizado
      onError?.(error, variables)

      // Toast de erro
      showToast.error('Erro ao transferir tarefa. Tente novamente.')
    }
  })

  /**
   * Mutation para compartilhar tarefa
   */
  const shareMutation = useMutation({
    mutationFn: async ({ taskId, userId, options = {} }) => {
      const result = await tasksService.shareTask(taskId, userId, options)
      
      // Registrar no histórico
      if (enableAnalytics) {
        setTransferHistory(prev => [...prev, {
          taskId,
          userId,
          timestamp: new Date(),
          type: 'share'
        }])
      }

      return result
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      if (autoRefresh) {
        queryClient.invalidateQueries(['tasks', projectId])
        queryClient.invalidateQueries(['people', projectId])
      }

      // Callback customizado
      onSuccess?.(data, variables)

      // Toast de sucesso
      showToast.success('Tarefa compartilhada com sucesso!')
    },
    onError: (error, variables) => {
      console.error('Erro ao compartilhar tarefa:', error)
      
      // Callback customizado
      onError?.(error, variables)

      // Toast de erro
      showToast.error('Erro ao compartilhar tarefa. Tente novamente.')
    }
  })

  /**
   * Validação com cache para melhor performance
   */
  const validateTransfer = useCallback((task, sourcePersonId, targetPersonId, people) => {
    const cacheKey = `${task.id}-${sourcePersonId}-${targetPersonId}`
    
    // Verificar cache primeiro
    if (validationCache.has(cacheKey)) {
      return validationCache.get(cacheKey)
    }

    // Executar validação
    const result = validateTaskTransfer({
      task,
      sourcePersonId,
      targetPersonId,
      people,
      projectId
    })

    // Armazenar no cache por 30 segundos
    setValidationCache(prev => {
      const newCache = new Map(prev)
      newCache.set(cacheKey, result)
      
      // Limpar cache após 30 segundos
      setTimeout(() => {
        setValidationCache(current => {
          const updated = new Map(current)
          updated.delete(cacheKey)
          return updated
        })
      }, 30000)
      
      return newCache
    })

    return result
  }, [validationCache, projectId])

  /**
   * Transferir tarefa com validação automática
   */
  const transferTask = useCallback(async (task, sourcePersonId, targetPersonId, people) => {
    // Validar antes de transferir
    const validation = validateTransfer(task, sourcePersonId, targetPersonId, people)
    
    if (!validation.isValid) {
      showToast.error(validation.message || 'Transferência não permitida')
      return { success: false, error: validation }
    }

    try {
      await transferMutation.mutateAsync({
        taskId: task.id,
        fromUserId: sourcePersonId,
        toUserId: targetPersonId
      })
      
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }, [transferMutation, validateTransfer, showToast])

  /**
   * Compartilhar tarefa com validação automática
   */
  const shareTask = useCallback(async (task, targetPersonId, people) => {
    // Validar se pessoa pode receber a tarefa
    const validation = validateTransfer(task, null, targetPersonId, people)
    
    if (!validation.isValid) {
      showToast.error(validation.message || 'Compartilhamento não permitido')
      return { success: false, error: validation }
    }

    try {
      await shareMutation.mutateAsync({
        taskId: task.id,
        userId: targetPersonId
      })
      
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }, [shareMutation, validateTransfer, showToast])

  /**
   * Transferir múltiplas tarefas
   */
  const transferMultipleTasks = useCallback(async (transfers) => {
    const results = []
    
    for (const transfer of transfers) {
      try {
        const result = await transferTask(
          transfer.task,
          transfer.sourcePersonId,
          transfer.targetPersonId,
          transfer.people
        )
        results.push({ ...transfer, result })
      } catch (error) {
        results.push({ ...transfer, result: { success: false, error } })
      }
    }

    const successful = results.filter(r => r.result.success).length
    const failed = results.length - successful

    if (successful > 0) {
      showToast.success(`${successful} tarefa(s) transferida(s) com sucesso`)
    }
    
    if (failed > 0) {
      showToast.error(`${failed} tarefa(s) falharam na transferência`)
    }

    return results
  }, [transferTask, showToast])

  /**
   * Obter estatísticas de transferência
   */
  const getTransferStats = useCallback(() => {
    if (!enableAnalytics) return null

    const totalTransfers = transferHistory.length
    const transfers = transferHistory.filter(h => h.type === 'transfer').length
    const shares = transferHistory.filter(h => h.type === 'share').length
    
    // Análise por período
    const today = new Date()
    const todayTransfers = transferHistory.filter(h => {
      const transferDate = new Date(h.timestamp)
      return transferDate.toDateString() === today.toDateString()
    }).length

    const thisWeek = transferHistory.filter(h => {
      const transferDate = new Date(h.timestamp)
      const diffTime = today - transferDate
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 7
    }).length

    return {
      total: totalTransfers,
      transfers,
      shares,
      today: todayTransfers,
      thisWeek,
      history: transferHistory
    }
  }, [transferHistory, enableAnalytics])

  /**
   * Limpar histórico e cache
   */
  const clearHistory = useCallback(() => {
    setTransferHistory([])
    setValidationCache(new Map())
  }, [])

  return {
    // Estados
    isTransferring: transferMutation.isPending,
    isSharing: shareMutation.isPending,
    transferHistory,
    
    // Funções principais
    transferTask,
    shareTask,
    transferMultipleTasks,
    validateTransfer,
    
    // Funções de análise
    getTransferStats,
    clearHistory,
    
    // Mutations raw (para uso avançado)
    transferMutation,
    shareMutation,
    
    // Estados de loading
    isPending: transferMutation.isPending || shareMutation.isPending
  }
}