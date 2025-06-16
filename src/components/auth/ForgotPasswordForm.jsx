// ForgotPasswordForm.jsximport React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/auth'
import { Button, Input, Card } from '@/components/shared/ui'
import { validateEmail } from '@/utils/validations/authValidations'

/**
 * Formulário de Recuperação de Senha
 */
const ForgotPasswordForm = ({ 
  onSuccess, 
  onError,
  showBackToLogin = true 
}) => {
  const { forgotPassword } = useAuth()
  
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [step, setStep] = useState('form') // form, email-sent
  const [sentEmail, setSentEmail] = useState('')

  /**
   * Validar email
   */
  const validateForm = () => {
    if (!email.trim()) {
      setError('Email é obrigatório')
      return false
    }

    if (!validateEmail(email)) {
      setError('Formato de email inválido')
      return false
    }

    return true
  }

  /**
   * Submeter formulário
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validar formulário
    if (!validateForm()) {
      return
    }

    try {
      setIsLoading(true)
      
      // Executar recuperação de senha
      const result = await forgotPassword(email.trim().toLowerCase())

      if (result.success) {
        // Email enviado com sucesso
        setSentEmail(email)
        setStep('email-sent')
        onSuccess?.(result)
      } else {
        // Falha ao enviar email
        setError(result.error?.message || 'Erro ao enviar email de recuperação')
        onError?.(result.error)
      }
    } catch (error) {
      const errorMessage = error.message || 'Erro inesperado'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Tentar com outro email
   */
  const handleTryAgain = () => {
    setStep('form')
    setEmail('')
    setSentEmail('')
    setError(null)
  }

  /**
   * Reenviar email
   */
  const handleResendEmail = async () => {
    try {
      setIsLoading(true)
      const result = await forgotPassword(sentEmail)
      
      if (result.success) {
        // Feedback de sucesso (pode ser um toast)
        console.log('Email reenviado com sucesso!')
      }
    } catch (error) {
      setError('Erro ao reenviar email')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Renderizar conteúdo baseado no step
   */
  const renderContent = () => {
    switch (step) {
      case 'email-sent':
        return (
          <div className="text-center space-y-4">
            {/* Ícone */}
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <EmailIcon className="w-8 h-8 text-blue-600" />
            </div>
            
            {/* Título e descrição */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Email Enviado!
              </h3>
              <p className="text-sm text-gray-600">
                Enviamos instruções de recuperação para:
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {sentEmail}
              </p>
            </div>

            {/* Instruções */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-xs text-blue-800">
                Verifique sua caixa de entrada e spam. O link expira em 1 hora.
              </p>
            </div>

            {/* Ações */}
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendEmail}
                loading={isLoading}
                fullWidth
              >
                Reenviar Email
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTryAgain}
                fullWidth
              >
                Tentar com outro email
              </Button>
            </div>
          </div>
        )

      default:
        return (
          <>
            {/* Descrição */}
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600">
                Digite seu email e enviaremos instruções para redefinir sua senha.
              </p>
            </div>

            {/* Erro */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError(null)
                }}
                error={null}
                required
                autoComplete="email"
                autoFocus
              />

              <Button
                type="submit"
                fullWidth
                loading={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar Instruções'}
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
          <Card.Title size="lg">
            {step === 'email-sent' ? 'Verifique seu Email' : 'Recuperar Senha'}
          </Card.Title>
          {step === 'form' && (
            <Card.Subtitle>
              Esqueceu sua senha? Sem problemas!
            </Card.Subtitle>
          )}
        </div>
      </Card.Header>

      <Card.Content>
        {renderContent()}
      </Card.Content>

      {/* Link para voltar ao login */}
      {showBackToLogin && (
        <Card.Footer divider justify="center">
          <div className="flex items-center space-x-2">
            <ArrowLeftIcon className="w-4 h-4 text-gray-400" />
            <Link
              to="/auth/login"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Voltar ao Login
            </Link>
          </div>
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

const ArrowLeftIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

export default ForgotPasswordForm