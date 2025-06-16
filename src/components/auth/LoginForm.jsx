import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLogin } from '@/hooks/auth'
import { Button, Input, Card } from '@/components/shared/ui'
import { validateEmail } from '@/utils/validations/authValidations'

/**
 * Formulário de Login
 */
const LoginForm = ({ 
  onSuccess, 
  onError,
  redirectTo = '/dashboard',
  showRegisterLink = true,
  showForgotPassword = true
}) => {
  const {
    executeLogin,
    isLogging,
    loginError,
    clearError,
    canRetry,
    getLastAttemptInfo
  } = useLogin()

  // Estado do formulário
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  // Limpar erro quando usuário digita
  useEffect(() => {
    if (loginError) {
      const timer = setTimeout(() => clearError(), 5000)
      return () => clearTimeout(timer)
    }
  }, [loginError, clearError])

  // Pré-preencher email se houver tentativa anterior
  useEffect(() => {
    const lastAttempt = getLastAttemptInfo()
    if (lastAttempt?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: lastAttempt.email }))
    }
  }, [getLastAttemptInfo, formData.email])

  /**
   * Atualizar dados do formulário
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Limpar erro do campo
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }

    // Limpar erro geral se usuário está digitando
    if (loginError) {
      clearError()
    }
  }

  /**
   * Validar formulário
   */
  const validateForm = () => {
    const errors = {}

    // Email obrigatório e válido
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório'
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Formato de email inválido'
    }

    // Senha obrigatória
    if (!formData.password) {
      errors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres'
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

    // Verificar se pode tentar novamente
    if (!canRetry()) {
      return
    }

    try {
      // Executar login
      const result = await executeLogin({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        rememberMe: formData.rememberMe
      })

      if (result.success) {
        // Login bem-sucedido
        onSuccess?.(result)
        
        // Redirecionar se necessário
        if (redirectTo) {
          window.location.href = redirectTo
        }
      } else {
        // Login falhou
        onError?.(result.error)
      }
    } catch (error) {
      onError?.(error.message)
    }
  }

  // Informações da última tentativa
  const lastAttemptInfo = getLastAttemptInfo()

  return (
    <Card className="w-full max-w-md mx-auto">
      <Card.Header>
        <div className="text-center w-full">
          <Card.Title size="lg">Entrar</Card.Title>
          <Card.Subtitle>
            Acesse sua conta para continuar
          </Card.Subtitle>
        </div>
      </Card.Header>

      <Card.Content>
        {/* Informação de tentativa anterior */}
        {lastAttemptInfo && !lastAttemptInfo.success && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Última tentativa: {lastAttemptInfo.email} ({lastAttemptInfo.timeAgo})
            </p>
          </div>
        )}

        {/* Erro geral */}
        {loginError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{loginError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            autoFocus
          />

          {/* Senha */}
          <Input
            type="password"
            name="password"
            label="Senha"
            placeholder="Sua senha"
            value={formData.password}
            onChange={handleInputChange}
            error={fieldErrors.password}
            required
            autoComplete="current-password"
          />

          {/* Lembrar-me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Lembrar-me
              </span>
            </label>

            {showForgotPassword && (
              <Link
                to="/auth/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Esqueci minha senha
              </Link>
            )}
          </div>

          {/* Botão de submit */}
          <Button
            type="submit"
            fullWidth
            loading={isLogging}
            disabled={!canRetry()}
          >
            {isLogging ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Card.Content>

      {/* Link para registro */}
      {showRegisterLink && (
        <Card.Footer divider justify="center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link
              to="/auth/register"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Criar conta
            </Link>
          </p>
        </Card.Footer>
      )}
    </Card>
  )
}

export default LoginForm