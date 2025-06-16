import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authService, sessionService } from '@/services/auth'

// Criar contexto de autenticação
const AuthContext = createContext({
  // Estado de autenticação
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  
  // Métodos de autenticação
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
  
  // Utilitários
  setRedirectPath: () => {},
  refreshSession: async () => {}
})

// Provider do contexto de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Estado computado
  const isAuthenticated = Boolean(user && session)

  /**
   * Inicializar estado de autenticação
   */
  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Verificar sessão existente
      const sessionResult = await authService.getCurrentSession()
      
      if (sessionResult.success && sessionResult.data) {
        setSession(sessionResult.data)
        setUser(sessionResult.data.user)
      } else {
        setSession(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Erro ao inicializar autenticação:', error)
      setSession(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Lidar com mudanças no estado de autenticação
   */
  const handleAuthStateChange = useCallback((event, session) => {
    switch (event) {
      case 'SIGNED_IN':
      case 'TOKEN_REFRESHED':
      case 'USER_UPDATED':
        setSession(session)
        setUser(session?.user || null)
        break
        
      case 'SIGNED_OUT':
        setSession(null)
        setUser(null)
        break
        
      default:
        console.log('Evento de auth:', event)
    }
    
    setIsLoading(false)
  }, [])

  /**
   * Login do usuário
   */
  const login = useCallback(async (credentials) => {
    try {
      setIsLoading(true)
      const result = await authService.login(credentials)
      
      if (result.success) {
        // O estado será atualizado automaticamente pelo listener
        return result
      } else {
        setIsLoading(false)
        return result
      }
    } catch (error) {
      setIsLoading(false)
      return { success: false, error: error.message }
    }
  }, [])

  /**
   * Registro de usuário
   */
  const register = useCallback(async (userData) => {
    try {
      setIsLoading(true)
      const result = await authService.register(userData)
      setIsLoading(false)
      return result
    } catch (error) {
      setIsLoading(false)
      return { success: false, error: error.message }
    }
  }, [])

  /**
   * Logout do usuário
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await authService.logout()
      
      // O estado será atualizado automaticamente pelo listener
      return result
    } catch (error) {
      setIsLoading(false)
      return { success: false, error: error.message }
    }
  }, [])

  /**
   * Esqueci minha senha
   */
  const forgotPassword = useCallback(async (email) => {
    try {
      return await authService.forgotPassword(email)
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  /**
   * Redefinir senha
   */
  const resetPassword = useCallback(async (newPassword) => {
    try {
      const result = await authService.resetPassword(newPassword)
      return result
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  /**
   * Atualizar perfil
   */
  const updateProfile = useCallback(async (updates) => {
    try {
      const result = await authService.updateProfile(updates)
      return result
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  /**
   * Definir caminho de redirecionamento
   */
  const setRedirectPath = useCallback((path) => {
    sessionService.setRedirectPath(path)
  }, [])

  /**
   * Renovar sessão
   */
  const refreshSession = useCallback(async () => {
    try {
      const result = await sessionService.refreshSession()
      return result
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  // Efeito para inicializar autenticação
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // Efeito para configurar listener de mudanças de autenticação
  useEffect(() => {
    const unsubscribe = sessionService.addSessionListener(handleAuthStateChange)
    
    return () => {
      unsubscribe()
    }
  }, [handleAuthStateChange])

  // Efeito para lidar com redirecionamentos
  useEffect(() => {
    const handleRedirect = (event, data) => {
      if (event === 'redirect_required' && data?.path) {
        // Aqui você pode usar seu router para redirecionar
        console.log('Redirecionamento necessário para:', data.path)
      }
    }

    const unsubscribe = sessionService.addSessionListener(handleRedirect)
    return () => unsubscribe()
  }, [])

  // Valor do contexto
  const contextValue = {
    // Estado
    user,
    session,
    isAuthenticated,
    isLoading,
    
    // Métodos
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    setRedirectPath,
    refreshSession
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar o contexto de autenticação
export const useAuthContext = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuthContext deve ser usado dentro de um AuthProvider')
  }
  
  return context
}

export default AuthContext