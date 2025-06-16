import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LoginForm } from '@/components/auth'
import { useAuth } from '@/hooks/auth'

/**
 * Página de Login
 */
const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = location.state?.from?.pathname || '/dashboard'
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  /**
   * Lidar com sucesso no login
   */
  const handleLoginSuccess = (result) => {
    console.log('Login realizado com sucesso:', result.user?.email)
    
    // Obter caminho de redirecionamento
    const redirectTo = location.state?.from?.pathname || '/dashboard'
    
    // Redirecionar após pequeno delay para feedback visual
    setTimeout(() => {
      navigate(redirectTo, { replace: true })
    }, 500)
  }

  /**
   * Lidar com erro no login
   */
  const handleLoginError = (error) => {
    console.error('Erro no login:', error)
    
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
            Gerencie suas tarefas de forma colaborativa
          </p>
        </div>

        {/* Formulário de login */}
        <LoginForm
          onSuccess={handleLoginSuccess}
          onError={handleLoginError}
          showRegisterLink={true}
          showForgotPassword={true}
        />

        {/* Links adicionais */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            Ao fazer login, você concorda com nossos{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-500">
              Termos de Uso
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage