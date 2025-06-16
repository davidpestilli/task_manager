import { apiClient, handleApiError, handleApiSuccess, withRetry } from '@/services/api'

class AuthService {
  /**
   * Registrar novo usuário
   */
  async register({ email, password, fullName }) {
    try {
      const { data, error } = await withRetry(() =>
        apiClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              display_name: fullName
            }
          }
        })
      )

      if (error) throw error

      return handleApiSuccess(data, 'Usuário registrado com sucesso! Verifique seu email.')
    } catch (error) {
      return handleApiError(error, 'register')
    }
  }

  /**
   * Login do usuário
   */
  async login({ email, password, rememberMe = false }) {
    try {
      const { data, error } = await withRetry(() =>
        apiClient.auth.signInWithPassword({
          email,
          password
        })
      )

      if (error) throw error

      // Se "lembrar-me" está ativo, atualizar configuração da sessão
      if (rememberMe) {
        await this.setPersistentSession(true)
      }

      return handleApiSuccess(data, 'Login realizado com sucesso!')
    } catch (error) {
      return handleApiError(error, 'login')
    }
  }

  /**
   * Logout do usuário
   */
  async logout() {
    try {
      const { error } = await apiClient.auth.signOut()
      if (error) throw error

      return handleApiSuccess(null, 'Logout realizado com sucesso!')
    } catch (error) {
      return handleApiError(error, 'logout')
    }
  }

  /**
   * Recuperação de senha
   */
  async forgotPassword(email) {
    try {
      const { data, error } = await withRetry(() =>
        apiClient.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`
        })
      )

      if (error) throw error

      return handleApiSuccess(data, 'Email de recuperação enviado!')
    } catch (error) {
      return handleApiError(error, 'forgotPassword')
    }
  }

  /**
   * Redefinir senha
   */
  async resetPassword(newPassword) {
    try {
      const { data, error } = await apiClient.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      return handleApiSuccess(data, 'Senha redefinida com sucesso!')
    } catch (error) {
      return handleApiError(error, 'resetPassword')
    }
  }

  /**
   * Obter usuário atual
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await apiClient.auth.getUser()
      if (error) throw error

      return handleApiSuccess(user)
    } catch (error) {
      return handleApiError(error, 'getCurrentUser')
    }
  }

  /**
   * Obter sessão atual
   */
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await apiClient.auth.getSession()
      if (error) throw error

      return handleApiSuccess(session)
    } catch (error) {
      return handleApiError(error, 'getCurrentSession')
    }
  }

  /**
   * Atualizar perfil do usuário
   */
  async updateProfile(updates) {
    try {
      const { data, error } = await apiClient.auth.updateUser({
        data: updates
      })

      if (error) throw error

      return handleApiSuccess(data, 'Perfil atualizado com sucesso!')
    } catch (error) {
      return handleApiError(error, 'updateProfile')
    }
  }

  /**
   * Verificar se usuário está autenticado
   */
  async isAuthenticated() {
    try {
      const sessionResult = await this.getCurrentSession()
      return sessionResult.success && sessionResult.data !== null
    } catch (error) {
      return false
    }
  }

  /**
   * Configurar persistência da sessão
   */
  async setPersistentSession(persist = true) {
    try {
      // Esta configuração já é definida no cliente, mas pode ser usada para configurações específicas
      localStorage.setItem('supabase.auth.persistent', persist.toString())
      return true
    } catch (error) {
      console.error('Erro ao configurar persistência:', error)
      return false
    }
  }

  /**
   * Listener para mudanças de autenticação
   */
  onAuthStateChange(callback) {
    return apiClient.auth.onAuthStateChange((event, session) => {
      callback(event, session)
    })
  }
}

// Instância singleton do serviço
export const authService = new AuthService()
export default authService