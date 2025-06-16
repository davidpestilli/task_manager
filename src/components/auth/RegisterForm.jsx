import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRegister } from '@/hooks/auth'
import { Button, Input, Card } from '@/components/shared/ui'
import { validateEmail } from '@/utils/validations/authValidations'

/**
 * Formulário de Registro
 */
const RegisterForm = ({ 
  onSuccess, 
  onError,
  showLoginLink = true 
}) => {
  const {
    executeRegister,
    isRegistering,
    registerError,
    registrationStep,
    registeredEmail,
    clearError,
    checkPasswordStrength,
    getStepInfo,
    resendConfirmationEmail,
    canResendEmail,
    resetRegistration
  } = useRegister()

  // Estado do formulário
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, feedback: [] })
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  // Informações do step atual
  const stepInfo = getStepInfo()

  /**
   * Atualizar dados do formulário
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Limpar erro do campo
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }

    // Verificar força da senha
    if (name === 'password') {
      const strength = checkPasswordStrength(value)
      setPasswordStrength(strength)
    }

    // Limpar erro geral se usuário está digitando
    if (registerError) {
      clearError()
    }
  }

  /**
   * Validar formulário
   */
  const validateForm = () => {
    const errors = {}

    // Nome completo obrigatório
    if (!formData.fullName.trim()) {
      errors.fullName = 'Nome completo é obrigatório'
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Nome deve ter pelo menos 2 caracteres'
    }

    // Email obrigatório e válido
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório'
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Formato de email inválido'
    }

    // Senha obrigatória e forte
    if (!formData.password) {
      errors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    // Confirmação de senha
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Senhas não conferem'
    }

    // Aceitar termos
    if (!agreeToTerms) {
      errors.terms = 'Você deve aceitar os termos de uso'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  /**
   * Submeter formulário
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar formulário
    if (!validateForm()) {
      return
    }

    try {
      // Executar registro
      const result = await executeRegister({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      })

      if (result.success) {
        // Registro bem-sucedido
        onSuccess?.(result)
      } else {
        // Registro falhou
        onError?.(result.error)
      }
    } catch (error) {
      onError?.(error.message)
    }
  }

  /**
   * Reenviar email de confirmação
   */
  const handleResendEmail = async () => {
    try {
      const result = await resendConfirmationEmail()
      if (result.success) {
        // Mostrar feedback de sucesso
      }
    } catch (error) {
      console.error('Erro ao reenviar email:', error)
    }
  }

  // Renderizar baseado no step
  const renderContent = () => {
    switch (registrationStep) {
      case 'email-sent':
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <EmailIcon className="w-8 h-8 text-blue-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Verifique seu Email
              </h3>
              <p className="text-sm text-gray-600">
                Enviamos um link de confirmação para:
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {registeredEmail}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                Clique no link do email para ativar sua conta
              </p>
              
              {canResendEmail && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResendEmail}
                  fullWidth
                >
                  Reenviar Email
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={resetRegistration}
                fullWidth
              >
                Tentar com outro email
              </Button>
            </div>
          </div>
        )

      case 'confirmed':
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckIcon className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Conta Criada!
              </h3>
              <p className="text-sm text-gray-600">
                Sua conta foi criada com sucesso. Você já pode fazer login.
              </p>
            </div>

            <Link to="/auth/login">
              <Button fullWidth>
                Fazer Login
              </Button>
            </Link>
          </div>
        )

      default:
        return (
          <>
            {/* Erro geral */}
            {registerError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{registerError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome completo */}
              <Input
                type="text"
                name="fullName"
                label="Nome Completo"
                placeholder="Seu nome completo"
                value={formData.fullName}
                onChange={handleInputChange}
                error={fieldErrors.fullName}
                required
                autoComplete="name"
                autoFocus
              />

              {/* Email */}
              <Input
                type="email"
                name="email"
                label="Email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                error={fieldErrors.email}
                required
                autoComplete="email"
              />

              {/* Senha */}
              <div>
                <Input
                  type="password"
                  name="password"
                  label="Senha"
                  placeholder="Crie uma senha forte"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={fieldErrors.password}
                  required
                  autoComplete="new-password"
                />
                
                {/* Indicador de força da senha */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${
                            level <= passwordStrength.strength
                              ? passwordStrength.strength <= 2
                                ? 'bg-red-500'
                                : passwordStrength.strength <= 3
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {passwordStrength.strengthLabel}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirmar senha */}
              <Input
                type="password"
                name="confirmPassword"
                label="Confirmar Senha"
                placeholder="Digite a senha novamente"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={fieldErrors.confirmPassword}
                required
                autoComplete="new-password"
              />

              {/* Aceitar termos */}
              <div>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Concordo com os{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                      Termos de Uso
                    </Link>
                    {' '}e{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                      Política de Privacidade
                    </Link>
                  </span>
                </label>
                {fieldErrors.terms && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.terms}</p>
                )}
              </div>

              {/* Botão de submit */}
              <Button
                type="submit"
                fullWidth
                loading={isRegistering}
                disabled={!agreeToTerms}
              >
                {isRegistering ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>
          </>
        )
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <Card.Header>
        <div className="text-center w-full">
          <Card.Title size="lg">{stepInfo.title}</Card.Title>
          <Card.Subtitle>{stepInfo.description}</Card.Subtitle>
        </div>
      </Card.Header>

      <Card.Content>
        {renderContent()}
      </Card.Content>

      {/* Link para login */}
      {showLoginLink && registrationStep === 'form' && (
        <Card.Footer divider justify="center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link
              to="/auth/login"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Fazer login
            </Link>
          </p>
        </Card.Footer>
      )}
    </Card>
  )
}

// Ícones
const EmailIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

export default RegisterForm