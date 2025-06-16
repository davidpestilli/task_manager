import { authService } from './authService'

class SessionService {
  constructor() {
    this.sessionData = null
    this.listeners = new Set()
    this.initializeSession()
  }

  /**
   * Inicializar gestão de sessão
   */
  async initializeSession() {
    try {
      // Verificar sessão existente
      const sessionResult = await authService.getCurrentSession()
      
      if (sessionResult.success) {
        this.sessionData = sessionResult.data
        this.notifyListeners('session_restored', this.sessionData)
      }

      // Configurar listener para mudanças de auth
      authService.onAuthStateChange((event, session) => {
        this.handleAuthStateChange(event, session)
      })
    } catch (error) {
      console.error('Erro ao inicializar sessão:', error)
    }
  }

  /**
   * Lidar com mudanças no estado de autenticação
   */
  handleAuthStateChange(event, session) {
    const previousSession = this.sessionData
    this.sessionData = session

    switch (event) {
      case 'SIGNED_IN':
        this.handleSignIn(session)
        break
      case 'SIGNED_OUT':
        this.handleSignOut()
        break
      case 'TOKEN_REFRESHED':
        this.handleTokenRefresh(session)
        break
      case 'USER_UPDATED':
        this.handleUserUpdate(session)
        break
      default:
        console.log('Evento de auth não tratado:', event)
    }

    this.notifyListeners(event, session, previousSession)
  }

  /**
   * Tratar login
   */
  handleSignIn(session) {
    // Salvar última data de login
    this.setLastLoginTime()
    
    // Verificar se deve redirecionar
    const redirectTo = this.getRedirectPath()
    if (redirectTo) {
      this.clearRedirectPath()
      // Notificar componentes sobre redirecionamento necessário
      this.notifyListeners('redirect_required', { path: redirectTo })
    }

    console.log('Usuário logado:', session.user.email)
  }

  /**
   * Tratar logout
   */
  handleSignOut() {
    // Limpar dados de sessão local
    this.clearSessionData()
    console.log('Usuário deslogado')
  }

  /**
   * Tratar refresh de token
   */
  handleTokenRefresh(session) {
    console.log('Token renovado para:', session.user.email)
  }

  /**
   * Tratar atualização de usuário
   */
  handleUserUpdate(session) {
    console.log('Dados do usuário atualizados:', session.user.email)
  }

  /**
   * Obter dados da sessão atual
   */
  getSession() {
    return this.sessionData
  }

  /**
   * Obter usuário atual
   */
  getUser() {
    return this.sessionData?.user || null
  }

  /**
   * Verificar se está autenticado
   */
  isAuthenticated() {
    return this.sessionData !== null && this.sessionData.user !== null
  }

  /**
   * Obter token de acesso
   */
  getAccessToken() {
    return this.sessionData?.access_token || null
  }

  /**
   * Salvar caminho para redirecionamento após login
   */
  setRedirectPath(path) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_redirect_path', path)
    }
  }

  /**
   * Obter caminho de redirecionamento
   */
  getRedirectPath() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_redirect_path')
    }
    return null
  }

  /**
   * Limpar caminho de redirecionamento
   */
  clearRedirectPath() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_redirect_path')
    }
  }

  /**
   * Salvar última vez que fez login
   */
  setLastLoginTime() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('last_login_time', new Date().toISOString())
    }
  }

  /**
   * Obter última vez que fez login
   */
  getLastLoginTime() {
    if (typeof window !== 'undefined') {
      const time = localStorage.getItem('last_login_time')
      return time ? new Date(time) : null
    }
    return null
  }

  /**
   * Limpar dados de sessão local
   */
  clearSessionData() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('last_login_time')
      localStorage.removeItem('auth_redirect_path')
      localStorage.removeItem('supabase.auth.persistent')
    }
  }

  /**
   * Adicionar listener para mudanças de sessão
   */
  addSessionListener(callback) {
    this.listeners.add(callback)
    
    // Retornar função para remover listener
    return () => {
      this.listeners.delete(callback)
    }
  }

  /**
   * Notificar todos os listeners
   */
  notifyListeners(event, session, previousSession = null) {
    this.listeners.forEach(callback => {
      try {
        callback(event, session, previousSession)
      } catch (error) {
        console.error('Erro no listener de sessão:', error)
      }
    })
  }

  /**
   * Verificar se sessão está expirando
   */
  isSessionExpiring(bufferMinutes = 5) {
    if (!this.sessionData) return false

    const expiresAt = this.sessionData.expires_at
    if (!expiresAt) return false

    const expirationTime = new Date(expiresAt * 1000)
    const bufferTime = bufferMinutes * 60 * 1000
    const now = new Date()

    return (expirationTime.getTime() - now.getTime()) < bufferTime
  }

  /**
   * Forçar refresh da sessão
   */
  async refreshSession() {
    try {
      const { data, error } = await authService.auth.refreshSession()
      if (error) throw error
      
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao renovar sessão:', error)
      return { success: false, error }
    }
  }
}

// Instância singleton do serviço
export const sessionService = new SessionService()
export default sessionService