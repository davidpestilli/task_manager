import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/auth'
import { FullPageSpinner } from '@/components/shared/ui'

/**
 * Componente para proteger rotas que requerem autenticação
 */
const ProtectedRoute = ({ 
  children, 
  redirectTo = '/auth/login',
  requireAuth = true,
  roles = [],
  fallback = null
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    hasPermission,
    setRedirectPath 
  } = useAuth()
  
  const location = useLocation()

  // Salvar caminho atual para redirecionamento após login
  useEffect(() => {
    if (!isAuthenticated && requireAuth) {
      setRedirectPath(location.pathname + location.search)
    }
  }, [isAuthenticated, requireAuth, location, setRedirectPath])

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return fallback || <FullPageSpinner text="Verificando autenticação..." />
  }

  // Verificar se requer autenticação
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Verificar se não deve estar autenticado (ex: páginas de login)
  if (!requireAuth && isAuthenticated) {
    // Se já está logado e tenta acessar login, redirecionar para dashboard
    return <Navigate to="/dashboard" replace />
  }

  // Verificar permissões/roles se especificadas
  if (requireAuth && roles.length > 0) {
    const hasRequiredRole = roles.some(role => hasPermission(role))
    
    if (!hasRequiredRole) {
      return <UnauthorizedAccess userRoles={user?.roles || []} requiredRoles={roles} />
    }
  }

  // Verificar se usuário precisa confirmar email
  if (requireAuth && user && !user.emailConfirmed) {
    return <EmailVerificationRequired email={user.email} />
  }

  // Tudo ok, renderizar componente protegido
  return children
}

/**
 * Componente para acesso não autorizado
 */
const UnauthorizedAccess = ({ userRoles, requiredRoles }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
      <div className="text-center">
        {/* Ícone de erro */}
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
          <ExclamationIcon className="w-8 h-8 text-red-600" />
        </div>
        
        {/* Título e mensagem */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Acesso Negado
        </h2>
        <p className="text-gray-600 mb-4">
          Você não tem permissão para acessar esta página.
        </p>
        
        {/* Informações de permissão */}
        <div className="bg-gray-50 rounded-md p-3 mb-4">
          <p className="text-xs text-gray-500 mb-1">Permissões necessárias:</p>
          <p className="text-sm font-medium text-gray-700">
            {requiredRoles.join(', ')}
          </p>
          
          {userRoles.length > 0 && (
            <>
              <p className="text-xs text-gray-500 mb-1 mt-2">Suas permissões:</p>
              <p className="text-sm text-gray-600">
                {userRoles.join(', ')}
              </p>
            </>
          )}
        </div>
        
        {/* Ações */}
        <div className="space-y-2">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Ir para Dashboard
          </button>
        </div>
      </div>
    </div>
  </div>
)

/**
 * Componente para verificação de email pendente
 */
const EmailVerificationRequired = ({ email }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
      <div className="text-center">
        {/* Ícone de email */}
        <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <EmailIcon className="w-8 h-8 text-yellow-600" />
        </div>
        
        {/* Título e mensagem */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Confirme seu Email
        </h2>
        <p className="text-gray-600 mb-4">
          Enviamos um email de confirmação para:
        </p>
        <p className="text-sm font-medium text-gray-900 mb-4">
          {email}
        </p>
        
        {/* Instruções */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <p className="text-xs text-blue-800">
            Clique no link do email para continuar usando o sistema.
          </p>
        </div>
        
        {/* Ações */}
        <div className="space-y-2">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Já confirmei
          </button>
          <button
            onClick={() => {/* Implementar reenvio de email */}}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Reenviar Email
          </button>
        </div>
      </div>
    </div>
  </div>
)

/**
 * HOC para proteger componentes
 */
export const withAuth = (Component, options = {}) => {
  return (props) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  )
}

/**
 * Hook para verificar se rota atual requer autenticação
 */
export const useRouteAuth = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  
  // Rotas públicas que não requerem autenticação
  const publicRoutes = [
    '/auth/login',
    '/auth/register', 
    '/auth/forgot-password',
    '/auth/reset-password',
    '/',
    '/about',
    '/contact',
    '/terms',
    '/privacy'
  ]
  
  const isPublicRoute = publicRoutes.includes(location.pathname)
  const requiresAuth = !isPublicRoute
  
  return {
    isPublicRoute,
    requiresAuth,
    isAuthenticated,
    isLoading,
    canAccess: isPublicRoute || isAuthenticated
  }
}

// Ícones
const ExclamationIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
)

const EmailIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

export default ProtectedRoute