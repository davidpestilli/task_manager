import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/shared/ui'
import { ErrorLayout } from '@/components/shared/layout'
import { useAuth } from '@/hooks/auth'

/**
 * Página 404 - Não Encontrada
 * 
 * Exibe erro amigável quando usuário acessa rota inexistente
 */
const NotFoundPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const handleGoBack = () => {
    navigate(-1)
  }

  const homeLink = isAuthenticated ? '/dashboard' : '/'

  return (
    <ErrorLayout showHeader={isAuthenticated}>
      <div className="text-center px-4 max-w-lg mx-auto">
        {/* Ilustração 404 */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <svg 
              className="w-12 h-12 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-1.006-6-2.708A7.962 7.962 0 016 15c-2.34 0-4.5-1.006-6-2.708V12h.01L3 9.36c-.001-.337.325-.664.662-.664H3z" 
              />
            </svg>
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            404
          </h1>
        </div>

        {/* Mensagem principal */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Página não encontrada
          </h2>
          <p className="text-gray-600 mb-6">
            A página que você está procurando não existe ou foi movida. 
            Verifique a URL ou navegue para uma das páginas abaixo.
          </p>
        </div>

        {/* Ações */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleGoBack}
              variant="primary"
              className="flex-1 sm:flex-initial"
            >
              ← Voltar
            </Button>
            
            <Link to={homeLink}>
              <Button 
                variant="secondary"
                className="w-full sm:w-auto"
              >
                {isAuthenticated ? 'Ir para Dashboard' : 'Página Inicial'}
              </Button>
            </Link>
          </div>

          {/* Links úteis para usuários autenticados */}
          {isAuthenticated && (
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">
                Ou navegue para:
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  to="/projects" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Projetos
                </Link>
                <Link 
                  to="/notifications" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Notificações
                </Link>
                <Link 
                  to="/settings" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Configurações
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Informações adicionais */}
        <div className="mt-12 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Precisa de ajuda?</strong><br />
            Se você acredita que isso é um erro, entre em contato com o suporte em{' '}
            <a 
              href="mailto:support@taskmanager.com" 
              className="text-blue-600 hover:text-blue-700"
            >
              support@taskmanager.com
            </a>
          </p>
        </div>
      </div>
    </ErrorLayout>
  )
}

/**
 * Página 404 customizada para contextos específicos
 */
export const ProjectNotFoundPage = ({ projectId }) => (
  <ErrorLayout showHeader={true}>
    <div className="text-center px-4 max-w-lg mx-auto">
      <div className="mb-8">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg 
            className="w-8 h-8 text-red-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Projeto não encontrado
        </h1>
      </div>

      <div className="mb-8">
        <p className="text-gray-600 mb-6">
          O projeto {projectId ? `"${projectId}"` : ''} não foi encontrado ou você não tem permissão para acessá-lo.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/projects">
          <Button variant="primary">
            Ver Todos os Projetos
          </Button>
        </Link>
        
        <Link to="/dashboard">
          <Button variant="secondary">
            Ir para Dashboard
          </Button>
        </Link>
      </div>
    </div>
  </ErrorLayout>
)

/**
 * Página 404 para tarefas não encontradas
 */
export const TaskNotFoundPage = ({ taskId, projectId }) => (
  <ErrorLayout showHeader={true}>
    <div className="text-center px-4 max-w-lg mx-auto">
      <div className="mb-8">
        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <svg 
            className="w-8 h-8 text-yellow-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" 
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Tarefa não encontrada
        </h1>
      </div>

      <div className="mb-8">
        <p className="text-gray-600 mb-6">
          A tarefa {taskId ? `"${taskId}"` : ''} não foi encontrada ou foi removida.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {projectId ? (
          <Link to={`/projects/${projectId}/tasks`}>
            <Button variant="primary">
              Ver Tarefas do Projeto
            </Button>
          </Link>
        ) : (
          <Link to="/projects">
            <Button variant="primary">
              Ver Projetos
            </Button>
          </Link>
        )}
        
        <Link to="/dashboard">
          <Button variant="secondary">
            Ir para Dashboard
          </Button>
        </Link>
      </div>
    </div>
  </ErrorLayout>
)

/**
 * Página de acesso negado
 */
export const AccessDeniedPage = ({ message = 'Você não tem permissão para acessar esta página.' }) => (
  <ErrorLayout showHeader={true}>
    <div className="text-center px-4 max-w-lg mx-auto">
      <div className="mb-8">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg 
            className="w-8 h-8 text-red-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-6V9a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h3m4-10V9a2 2 0 012-2h3a2 2 0 012 2v10a2 2 0 01-2 2h-3" 
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Acesso Negado
        </h1>
      </div>

      <div className="mb-8">
        <p className="text-gray-600 mb-6">
          {message}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/dashboard">
          <Button variant="primary">
            Ir para Dashboard
          </Button>
        </Link>
        
        <Link to="/auth/login">
          <Button variant="secondary">
            Fazer Login
          </Button>
        </Link>
      </div>
    </div>
  </ErrorLayout>
)

export default NotFoundPage