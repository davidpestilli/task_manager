import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'

/**
 * Hook específico para operações de login
 * Gerencia estado de loading, erros e validações
 */
export const useLogin = () => {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [isLogging, setIsLogging] = useState(false)
  const [loginError, setLoginError] = useState(null)
  const [lastAttempt, setLastAttempt] = useState(null)

  /**
   * Executar login com validações e feedback
   */
  const executeLogin = useCallback(async (credentials) => {
    try {
      // Limpar estados anteriores
      setLoginError(null)
      setIsLogging(true)

      // Validações básicas
      if (!credentials.email || !credentials.password) {
        throw new Error('Email e senha são obrigatórios')
      }

      if (!isValidEmail(credentials.email)) {
        throw new Error('Formato de email inválido')
      }

      // Registrar tentativa
      setLastAttempt({
        email: credentials.email,
        timestamp: new Date(),
        success: false
      })

      // Executar login
      const result = await login(credentials)

      if (result.success) {
        // Login bem-sucedido
        setLastAttempt(prev => ({ ...prev, success: true }))
        return {
          success: true,
          user: result.user,
          message: result.message || 'Login realizado com sucesso!'
        }
      } else {
        // Login falhou
        const errorMessage = result.error?.message || 'Erro no login'
        setLoginError(errorMessage)
        return {
          success: false,
          error: errorMessage
        }
      }
    } catch (error) {
      const errorMessage = error.message || 'Erro inesperado'
      setLoginError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsLogging(false)
    }
  }, [login])

  /**
   * Login rápido com dados salvos (se disponível)
   */
  const quickLogin = useCallback(async () => {
    if (!lastAttempt?.email) {
      return { success: false, error: 'Nenhuma tentativa anterior encontrada' }
    }

    // Para implementar: buscar credenciais salvas de forma segura
    return { success: false, error: 'Login rápido não implementado' }
  }, [lastAttempt])

  /**
   * Limpar estado de erro
   */
  const clearError = useCallback(() => {
    setLoginError(null)
  }, [])

  /**
   * Verificar se pode fazer nova tentativa
   */
  const canRetry = useCallback(() => {
    if (!lastAttempt) return true
    
    const timeSinceLastAttempt = Date.now() - lastAttempt.timestamp.getTime()
    const minimumWaitTime = 1000 // 1 segundo entre tentativas
    
    return timeSinceLastAttempt >= minimumWaitTime
  }, [lastAttempt])

  /**
   * Obter informações da última tentativa
   */
  const getLastAttemptInfo = useCallback(() => {
    if (!lastAttempt) return null

    const timeSince = Date.now() - lastAttempt.timestamp.getTime()
    
    return {
      email: lastAttempt.email,
      success: lastAttempt.success,
      timeAgo: formatTimeAgo(timeSince),
      canRetry: canRetry()
    }
  }, [lastAttempt, canRetry])

  return {
    // Estados
    isLogging,
    loginError,
    isAuthenticated,
    isLoading: authLoading || isLogging,
    
    // Métodos
    executeLogin,
    quickLogin,
    clearError,
    
    // Informações
    canRetry,
    getLastAttemptInfo,
    hasError: Boolean(loginError),
    lastAttemptEmail: lastAttempt?.email || null
  }
}

// Helpers
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function formatTimeAgo(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000)
  
  if (seconds < 60) return `há ${seconds} segundos`
  
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `há ${minutes} minutos`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours} horas`
  
  const days = Math.floor(hours / 24)
  return `há ${days} dias`
}

export default useLogin