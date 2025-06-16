import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ForgotPasswordForm } from '@/components/auth'
import { useAuth } from '@/hooks/auth'

/**
 * Página de Recuperação de Senha
 */
const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  /**
   * Lidar com sucesso no envio do email
   */
  const handleForgotPasswordSuccess = (result) => {
    console.log('Email de recuperação enviado com sucesso')
    
    // O componente ForgotPasswordForm já trata a exibição do estado "email-sent"
    // Aqui você pode adicionar lógica adicional se necessário
    
    // Exemplo: enviar evento de analytics
    // analytics.track('password_reset_requested')
  }

  /**
   * Lidar com erro no envio do email
   */
  const handleForgotPasswordError = (error) => {
    console.error('Erro ao enviar email de recuperação:', error)
    
    // Aqui você pode adicionar notificações de erro
    // Por exemplo, usando um toast ou contexto de notificações
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header da página */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Task Manager
          </h1>
          <p className="text-gray-600">
            Recupere o acesso à sua conta
          </p>
        </div>

        {/* Formulário de recuperação */}
        <ForgotPasswordForm
          onSuccess={handleForgotPasswordSuccess}
          onError={handleForgotPasswordError}
          showBackToLogin={true}
        />

        {/* Dicas de segurança */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-amber-900 mb-2">
            💡 Dicas de Segurança
          </h3>
          <ul className="text-xs text-amber-800 space-y-1">
            <li>• Verifique também a pasta de spam</li>
            <li>• O link expira em 1 hora por segurança</li>
            <li>• Use uma senha forte com letras, números e símbolos</li>
            <li>• Não compartilhe suas credenciais</li>
          </ul>
        </div>

        {/* Suporte */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Ainda com problemas?{' '}
            <a 
              href="mailto:suporte@taskmanager.com" 
              className="text-blue-600 hover:text-blue-500"
            >
              Entre em contato
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage