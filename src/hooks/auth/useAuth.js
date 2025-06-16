import { useAuthContext } from '@/context/AuthContext'
import { useCallback, useMemo } from 'react'

/**
 * Hook principal para autenticação
 * Fornece interface simplificada para operações de auth
 */
export const useAuth = () => {
  const authContext = useAuthContext()

  // Informações do usuário atual
  const userInfo = useMemo(() => {
    if (!authContext.user) return null

    const { user } = authContext
    return {
      id: user.id,
      email: user.email,
      fullName: user.user_metadata?.full_name || user.email,
      displayName: user.user_metadata?.display_name || user.email,
      avatar: user.user_metadata?.avatar_url || null,
      emailConfirmed: user.email_confirmed_at !== null,
      createdAt: user.created_at,
      lastLogin: authContext.session?.created_at || null
    }
  }, [authContext.user, authContext.session])

  // Informações da sessão
  const sessionInfo = useMemo(() => {
    if (!authContext.session) return null

    const { session } = authContext
    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at,
      expiresIn: session.expires_in,
      tokenType: session.token_type
    }
  }, [authContext.session])

  // Status de autenticação
  const authStatus = useMemo(() => ({
    isAuthenticated: authContext.isAuthenticated,
    isLoading: authContext.isLoading,
    hasSession: Boolean(authContext.session),
    hasUser: Boolean(authContext.user)
  }), [
    authContext.isAuthenticated,
    authContext.isLoading,
    authContext.session,
    authContext.user
  ])

  // Helper para verificar permissões
  const hasPermission = useCallback((permission) => {
    if (!authContext.user) return false
    
    // Implementar lógica de permissões conforme necessário
    const userRoles = authContext.user.user_metadata?.roles || []
    return userRoles.includes(permission)
  }, [authContext.user])

  // Helper para verificar se é admin
  const isAdmin = useCallback(() => {
    return hasPermission('admin')
  }, [hasPermission])

  // Helper para obter iniciais do nome
  const getUserInitials = useCallback(() => {
    if (!userInfo) return '??'
    
    const name = userInfo.fullName || userInfo.email
    const parts = name.split(' ')
    
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    
    return name.substring(0, 2).toUpperCase()
  }, [userInfo])

  // Helper para formatar nome de exibição
  const getDisplayName = useCallback(() => {
    if (!userInfo) return ''
    
    return userInfo.displayName || userInfo.fullName || userInfo.email
  }, [userInfo])

  // Helper para verificar se o email foi confirmado
  const isEmailConfirmed = useCallback(() => {
    return userInfo?.emailConfirmed || false
  }, [userInfo])

  // Métodos de autenticação com error handling melhorado
  const loginWithFeedback = useCallback(async (credentials) => {
    try {
      const result = await authContext.login(credentials)
      return {
        ...result,
        user: result.success ? userInfo : null
      }
    } catch (error) {
      return {
        success: false,
        error: { message: 'Erro inesperado no login' }
      }
    }
  }, [authContext.login, userInfo])

  const registerWithFeedback = useCallback(async (userData) => {
    try {
      const result = await authContext.register(userData)
      return result
    } catch (error) {
      return {
        success: false,
        error: { message: 'Erro inesperado no registro' }
      }
    }
  }, [authContext.register])

  const logoutWithFeedback = useCallback(async () => {
    try {
      const result = await authContext.logout()
      return result
    } catch (error) {
      return {
        success: false,
        error: { message: 'Erro inesperado no logout' }
      }
    }
  }, [authContext.logout])

  return {
    // Dados do usuário
    user: userInfo,
    session: sessionInfo,
    
    // Status
    ...authStatus,
    
    // Helpers de usuário
    getUserInitials,
    getDisplayName,
    isEmailConfirmed,
    hasPermission,
    isAdmin,
    
    // Métodos de autenticação
    login: loginWithFeedback,
    register: registerWithFeedback,
    logout: logoutWithFeedback,
    forgotPassword: authContext.forgotPassword,
    resetPassword: authContext.resetPassword,
    updateProfile: authContext.updateProfile,
    
    // Utilitários
    setRedirectPath: authContext.setRedirectPath,
    refreshSession: authContext.refreshSession
  }
}

export default useAuth