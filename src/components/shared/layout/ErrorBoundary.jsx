import React from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/shared/ui'

/**
 * ErrorBoundary avançado para captura e tratamento de erros
 * 
 * Funcionalidades:
 * - Captura erros de JavaScript
 * - Diferentes tipos de fallback baseado no erro
 * - Integração com sistema de logging
 * - Retry automático para erros temporários
 * - Feedback para desenvolvimento
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    }
    
    this.maxRetries = props.maxRetries || 3
    this.retryDelay = props.retryDelay || 1000
  }

  static getDerivedStateFromError(error) {
    // Gerar ID único para o erro
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    
    // Logging do erro
    this.logError(error, errorInfo)
    
    // Notificar serviços de monitoramento em produção
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo)
    }
  }

  /**
   * Log detalhado do erro
   */
  logError = (error, errorInfo) => {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.props.user?.id,
      projectId: this.props.project?.id,
      errorId: this.state.errorId
    }

    console.group('🔥 Error Boundary - Erro Capturado')
    console.error('Erro:', error)
    console.error('Detalhes:', errorDetails)
    console.error('Component Stack:', errorInfo.componentStack)
    console.groupEnd()

    // Salvar no localStorage para debug posterior
    try {
      const existingErrors = JSON.parse(localStorage.getItem('errorBoundary_logs') || '[]')
      existingErrors.push(errorDetails)
      
      // Manter apenas os últimos 10 erros
      const recentErrors = existingErrors.slice(-10)
      localStorage.setItem('errorBoundary_logs', JSON.stringify(recentErrors))
    } catch (e) {
      console.warn('Não foi possível salvar erro no localStorage:', e)
    }
  }

  /**
   * Reportar erro para serviços de monitoramento
   */
  reportError = (error, errorInfo) => {
    // Integração com Sentry, LogRocket, etc.
    // Por enquanto, apenas console.log em produção
    console.error('Production Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })
  }

  /**
   * Determinar tipo de erro e estratégia de recuperação
   */
  getErrorType = (error) => {
    if (error.name === 'ChunkLoadError') {
      return 'chunk_load'
    }
    
    if (error.message.includes('fetch')) {
      return 'network'
    }
    
    if (error.message.includes('hydrat')) {
      return 'hydration'
    }
    
    if (error.stack?.includes('Supabase')) {
      return 'database'
    }
    
    return 'unknown'
  }

  /**
   * Retry com delay progressivo
   */
  handleRetry = () => {
    const { retryCount } = this.state
    
    if (retryCount >= this.maxRetries) {
      console.warn('Máximo de tentativas atingido')
      return
    }

    const delay = this.retryDelay * Math.pow(2, retryCount) // Exponential backoff
    
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1
      })
    }, delay)
  }

  /**
   * Reset completo do estado
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    })
  }

  /**
   * Voltar para página inicial
   */
  handleGoHome = () => {
    this.handleReset()
    window.location.href = '/'
  }

  /**
   * Recarregar página completamente
   */
  handleReload = () => {
    window.location.reload()
  }

  /**
   * Renderizar diferentes fallbacks baseado no tipo de erro
   */
  renderErrorFallback = () => {
    const { error, retryCount, errorId } = this.state
    const { children, fallback } = this.props
    
    // Fallback customizado do componente pai
    if (fallback) {
      return fallback(error, this.handleRetry, this.handleReset)
    }
    
    const errorType = this.getErrorType(error)
    const canRetry = retryCount < this.maxRetries
    
    // Fallback específico para erro de carregamento de chunk
    if (errorType === 'chunk_load') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <RefreshCw className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Atualizando aplicação
            </h1>
            <p className="text-gray-600 mb-6">
              Uma nova versão está disponível. Recarregando...
            </p>
            <Button 
              onClick={this.handleReload}
              className="w-full"
            >
              Recarregar agora
            </Button>
          </div>
        </div>
      )
    }
    
    // Fallback padrão
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full">
          <div className="text-center mb-6">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Ops! Algo deu errado
            </h1>
            <p className="text-gray-600">
              Ocorreu um erro inesperado. Nossa equipe foi notificada.
            </p>
          </div>
          
          <div className="space-y-3">
            {canRetry && (
              <Button 
                onClick={this.handleRetry}
                className="w-full"
                variant="primary"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            )}
            
            <Button 
              onClick={this.handleGoHome}
              className="w-full"
              variant="outline"
            >
              <Home className="h-4 w-4 mr-2" />
              Voltar ao início
            </Button>
            
            <Button 
              onClick={this.handleReload}
              className="w-full"
              variant="ghost"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar página
            </Button>
          </div>
          
          {/* Informações de debug em desenvolvimento */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <summary className="font-medium text-red-800 cursor-pointer flex items-center">
                <Bug className="h-4 w-4 mr-2" />
                Detalhes do erro (desenvolvimento)
              </summary>
              
              <div className="mt-3 space-y-2">
                <div>
                  <strong>ID do erro:</strong> <code className="text-xs">{errorId}</code>
                </div>
                <div>
                  <strong>Tentativas:</strong> {retryCount}/{this.maxRetries}
                </div>
                <div>
                  <strong>Tipo:</strong> {errorType}
                </div>
                <div>
                  <strong>Mensagem:</strong>
                  <pre className="mt-1 text-xs bg-white p-2 border rounded overflow-x-auto">
                    {error?.message}
                  </pre>
                </div>
                {error?.stack && (
                  <div>
                    <strong>Stack trace:</strong>
                    <pre className="mt-1 text-xs bg-white p-2 border rounded overflow-x-auto max-h-32">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
          
          <div className="mt-4 text-center text-sm text-gray-500">
            Se o problema persistir, entre em contato com o suporte.
          </div>
        </div>
      </div>
    )
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorFallback()
    }

    return this.props.children
  }
}

/**
 * Hook para capturar erros assíncronos
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null)
  
  const captureError = React.useCallback((error, errorInfo = {}) => {
    console.error('Async error captured:', error)
    setError({ error, errorInfo })
  }, [])
  
  const clearError = React.useCallback(() => {
    setError(null)
  }, [])
  
  // Renderizar erro se houver
  React.useEffect(() => {
    if (error) {
      throw new Error(error.error?.message || 'Async error')
    }
  }, [error])
  
  return { captureError, clearError, hasError: !!error }
}

/**
 * HOC para adicionar tratamento de erro a componentes
 */
export const withErrorBoundary = (Component, fallback) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

export default ErrorBoundary