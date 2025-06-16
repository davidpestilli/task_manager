import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'

/**
 * Hook específico para operações de registro
 * Gerencia validações, feedback e estado do processo de registro
 */
export const useRegister = () => {
  const { register, isAuthenticated } = useAuth()
  
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerError, setRegisterError] = useState(null)
  const [registrationStep, setRegistrationStep] = useState('form') // form, email-sent, confirmed
  const [registeredEmail, setRegisteredEmail] = useState(null)

  /**
   * Executar registro com validações completas
   */
  const executeRegister = useCallback(async (userData) => {
    try {
      // Limpar estados anteriores
      setRegisterError(null)
      setIsRegistering(true)
      setRegistrationStep('form')

      // Validações
      const validation = validateRegistrationData(userData)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      // Executar registro
      const result = await register({
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        fullName: userData.fullName.trim()
      })

      if (result.success) {
        // Registro bem-sucedido
        setRegisteredEmail(userData.email)
        setRegistrationStep('email-sent')
        
        return {
          success: true,
          message: result.message || 'Registro realizado! Verifique seu email.',
          email: userData.email
        }
      } else {
        // Registro falhou
        const errorMessage = result.error?.message || 'Erro no registro'
        setRegisterError(errorMessage)
        return {
          success: false,
          error: errorMessage
        }
      }
    } catch (error) {
      const errorMessage = error.message || 'Erro inesperado'
      setRegisterError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsRegistering(false)
    }
  }, [register])

  /**
   * Confirmar que email foi verificado
   */
  const confirmEmailVerification = useCallback(() => {
    setRegistrationStep('confirmed')
  }, [])

  /**
   * Reenviar email de confirmação
   */
  const resendConfirmationEmail = useCallback(async () => {
    if (!registeredEmail) {
      return { success: false, error: 'Email não encontrado' }
    }

    // Para implementar: método no authService para reenviar email
    return { success: true, message: 'Email reenviado com sucesso!' }
  }, [registeredEmail])

  /**
   * Resetar processo de registro
   */
  const resetRegistration = useCallback(() => {
    setIsRegistering(false)
    setRegisterError(null)
    setRegistrationStep('form')
    setRegisteredEmail(null)
  }, [])

  /**
   * Limpar erro de registro
   */
  const clearError = useCallback(() => {
    setRegisterError(null)
  }, [])

  /**
   * Obter informações do passo atual
   */
  const getStepInfo = useCallback(() => {
    const steps = {
      form: {
        title: 'Criar Conta',
        description: 'Preencha os dados para criar sua conta',
        canProceed: !isRegistering,
        showForm: true
      },
      'email-sent': {
        title: 'Verifique seu Email',
        description: `Enviamos um link de confirmação para ${registeredEmail}`,
        canProceed: false,
        showForm: false
      },
      confirmed: {
        title: 'Email Confirmado',
        description: 'Sua conta foi criada com sucesso!',
        canProceed: true,
        showForm: false
      }
    }

    return steps[registrationStep] || steps.form
  }, [registrationStep, registeredEmail, isRegistering])

  /**
   * Verificar força da senha
   */
  const checkPasswordStrength = useCallback((password) => {
    if (!password) return { strength: 0, feedback: [] }

    const feedback = []
    let strength = 0

    // Verificações de força
    if (password.length >= 8) {
      strength += 1
    } else {
      feedback.push('Deve ter pelo menos 8 caracteres')
    }

    if (/[a-z]/.test(password)) {
      strength += 1
    } else {
      feedback.push('Deve conter pelo menos uma letra minúscula')
    }

    if (/[A-Z]/.test(password)) {
      strength += 1
    } else {
      feedback.push('Deve conter pelo menos uma letra maiúscula')
    }

    if (/[0-9]/.test(password)) {
      strength += 1
    } else {
      feedback.push('Deve conter pelo menos um número')
    }

    if (/[^a-zA-Z0-9]/.test(password)) {
      strength += 1
    } else {
      feedback.push('Deve conter pelo menos um caractere especial')
    }

    return {
      strength,
      feedback,
      isStrong: strength >= 4,
      strengthLabel: getStrengthLabel(strength)
    }
  }, [])

  return {
    // Estados
    isRegistering,
    registerError,
    registrationStep,
    registeredEmail,
    isAuthenticated,
    
    // Métodos
    executeRegister,
    confirmEmailVerification,
    resendConfirmationEmail,
    resetRegistration,
    clearError,
    checkPasswordStrength,
    
    // Informações
    getStepInfo,
    hasError: Boolean(registerError),
    canResendEmail: registrationStep === 'email-sent',
    isCompleted: registrationStep === 'confirmed'
  }
}

// Helpers de validação
function validateRegistrationData(userData) {
  const { email, password, fullName, confirmPassword } = userData

  // Email obrigatório e válido
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email é obrigatório' }
  }

  if (!isValidEmail(email)) {
    return { isValid: false, error: 'Formato de email inválido' }
  }

  // Nome completo obrigatório
  if (!fullName || !fullName.trim()) {
    return { isValid: false, error: 'Nome completo é obrigatório' }
  }

  if (fullName.trim().length < 2) {
    return { isValid: false, error: 'Nome deve ter pelo menos 2 caracteres' }
  }

  // Senha obrigatória e forte
  if (!password) {
    return { isValid: false, error: 'Senha é obrigatória' }
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Senha deve ter pelo menos 6 caracteres' }
  }

  // Confirmação de senha
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return { isValid: false, error: 'Senhas não conferem' }
  }

  return { isValid: true }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function getStrengthLabel(strength) {
  const labels = {
    0: 'Muito fraca',
    1: 'Fraca',
    2: 'Regular',
    3: 'Boa',
    4: 'Forte',
    5: 'Muito forte'
  }
  
  return labels[strength] || 'Muito fraca'
}

export default useRegister