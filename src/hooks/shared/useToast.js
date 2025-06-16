import { useState, useCallback } from 'react'

/**
 * Hook para gerenciar sistema de toast/notificações temporárias
 */
export function useToast() {
  const [toasts, setToasts] = useState([])

  /**
   * Adicionar um novo toast
   */
  const showToast = useCallback((message, options = {}) => {
    const {
      type = 'info',
      title,
      icon,
      duration = 5000,
      closable = true,
      actions = [],
      id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    } = options

    const toast = {
      id,
      type,
      title,
      message,
      icon,
      duration,
      closable,
      actions,
      createdAt: new Date()
    }

    setToasts(current => [toast, ...current])

    return id
  }, [])

  /**
   * Remover um toast específico
   */
  const removeToast = useCallback((id) => {
    setToasts(current => current.filter(toast => toast.id !== id))
  }, [])

  /**
   * Limpar todos os toasts
   */
  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  /**
   * Atualizar um toast existente
   */
  const updateToast = useCallback((id, updates) => {
    setToasts(current => 
      current.map(toast => 
        toast.id === id 
          ? { ...toast, ...updates }
          : toast
      )
    )
  }, [])

  /**
   * Atalhos para tipos específicos de toast
   */
  const showSuccess = useCallback((message, options = {}) => {
    return showToast(message, { ...options, type: 'success' })
  }, [showToast])

  const showError = useCallback((message, options = {}) => {
    return showToast(message, { ...options, type: 'error' })
  }, [showToast])

  const showWarning = useCallback((message, options = {}) => {
    return showToast(message, { ...options, type: 'warning' })
  }, [showToast])

  const showInfo = useCallback((message, options = {}) => {
    return showToast(message, { ...options, type: 'info' })
  }, [showToast])

  /**
   * Toast de loading com funcionalidade de atualização
   */
  const showLoading = useCallback((message, options = {}) => {
    return showToast(message, {
      ...options,
      type: 'info',
      icon: '⏳',
      duration: 0, // Não remove automaticamente
      closable: false
    })
  }, [showToast])

  /**
   * Atualizar toast de loading para sucesso
   */
  const resolveLoading = useCallback((id, message, options = {}) => {
    updateToast(id, {
      type: 'success',
      message,
      icon: '✅',
      duration: 3000,
      closable: true,
      ...options
    })
  }, [updateToast])

  /**
   * Atualizar toast de loading para erro
   */
  const rejectLoading = useCallback((id, message, options = {}) => {
    updateToast(id, {
      type: 'error',
      message,
      icon: '❌',
      duration: 5000,
      closable: true,
      ...options
    })
  }, [updateToast])

  /**
   * Toast de confirmação com ações
   */
  const showConfirmation = useCallback((message, options = {}) => {
    const {
      title = 'Confirmação',
      onConfirm,
      onCancel,
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      ...restOptions
    } = options

    const id = showToast(message, {
      ...restOptions,
      type: 'warning',
      title,
      duration: 0, // Não remove automaticamente
      actions: [
        {
          label: confirmText,
          variant: 'primary',
          onClick: () => {
            onConfirm?.()
            removeToast(id)
          }
        },
        {
          label: cancelText,
          variant: 'secondary',
          onClick: () => {
            onCancel?.()
            removeToast(id)
          }
        }
      ]
    })

    return id
  }, [showToast, removeToast])

  /**
   * Toast de ação com botão de desfazer
   */
  const showActionToast = useCallback((message, action, options = {}) => {
    const {
      actionText = 'Desfazer',
      duration = 8000,
      ...restOptions
    } = options

    return showToast(message, {
      ...restOptions,
      duration,
      actions: [
        {
          label: actionText,
          variant: 'primary',
          onClick: action
        }
      ]
    })
  }, [showToast])

  /**
   * Verificar se tem toasts visíveis
   */
  const hasToasts = toasts.length > 0

  /**
   * Contar toasts por tipo
   */
  const getToastCount = useCallback((type) => {
    if (type) {
      return toasts.filter(toast => toast.type === type).length
    }
    return toasts.length
  }, [toasts])

  return {
    // Estado
    toasts,
    hasToasts,
    
    // Ações básicas
    showToast,
    removeToast,
    clearAllToasts,
    updateToast,
    
    // Atalhos por tipo
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Toasts especiais
    showLoading,
    resolveLoading,
    rejectLoading,
    showConfirmation,
    showActionToast,
    
    // Utilidades
    getToastCount
  }
}

export default useToast