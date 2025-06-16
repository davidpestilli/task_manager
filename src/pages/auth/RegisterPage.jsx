import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RegisterForm } from '@/components/auth'
import { useAuth } from '@/hooks/auth'

/**
 * Página de Registro
 */
const RegisterPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  /**
   * Lidar com sucesso no registro
   */
  const handleRegisterSuccess = (result) => {
    console.log('Registro realizado com sucesso:', result.email)
    
    // O componente RegisterForm já trata a exibição do estado "email-sent"
    // Aqui você pode adicionar lógica adicional se necessário
    
    // Exemplo: enviar evento de analytics
    // analytics.track('user_registered', { email: result.email })
  }

  /**
   * Lidar com erro no registro
   */
  const handleRegisterError = (error) => {
    console.error('Erro no registro:', error)
    
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
            Crie sua conta e comece a organizar suas tarefas
          </p>
        </div>

        {/* Formulário de registro */}
        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onError={handleRegisterError}
          showLoginLink={true}
        />

        {/* Links adicionais */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            Ao criar uma conta, você concorda com nossos{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-500">
              Termos de Uso
            </a>
            {' '}e{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-500">
              Política de Privacidade
            </a>
          </p>
        </div>

        {/* Benefícios do registro */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Por que se registrar?
          </h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Gerencie tarefas de forma colaborativa</li>
            <li>• Acompanhe progresso em tempo real</li>
            <li>• Organize projetos com sua equipe</li>
            <li>• Receba notificações de atualizações</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage