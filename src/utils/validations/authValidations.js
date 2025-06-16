/**
 * Validações para autenticação e dados de usuário
 */

/**
 * Validar formato de email
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Validar força da senha
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      score: 0,
      feedback: ['Senha é obrigatória']
    }
  }

  const feedback = []
  let score = 0

  // Verificações básicas
  if (password.length < 6) {
    feedback.push('Deve ter pelo menos 6 caracteres')
  } else if (password.length >= 8) {
    score += 1
  }

  // Verificar se contém letra minúscula
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Deve conter pelo menos uma letra minúscula')
  }

  // Verificar se contém letra maiúscula
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Deve conter pelo menos uma letra maiúscula')
  }

  // Verificar se contém número
  if (/[0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('Deve conter pelo menos um número')
  }

  // Verificar se contém caractere especial
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('Deve conter pelo menos um caractere especial')
  }

  // Verificar senhas comuns
  const commonPasswords = [
    '123456', 'password', '123456789', '12345678', '12345',
    '1234567', '1234567890', 'qwerty', 'abc123', 'admin'
  ]
  
  if (commonPasswords.includes(password.toLowerCase())) {
    feedback.push('Não use senhas muito comuns')
    score = Math.max(0, score - 2)
  }

  return {
    isValid: password.length >= 6 && score >= 2,
    score: Math.min(5, score),
    feedback,
    strength: getPasswordStrengthLabel(score)
  }
}

/**
 * Validar nome completo
 */
export const validateFullName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') {
    return {
      isValid: false,
      message: 'Nome completo é obrigatório'
    }
  }

  const trimmedName = fullName.trim()

  if (trimmedName.length < 2) {
    return {
      isValid: false,
      message: 'Nome deve ter pelo menos 2 caracteres'
    }
  }

  if (trimmedName.length > 100) {
    return {
      isValid: false,
      message: 'Nome deve ter no máximo 100 caracteres'
    }
  }

  // Verificar se contém apenas letras, espaços e alguns caracteres especiais
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/
  if (!nameRegex.test(trimmedName)) {
    return {
      isValid: false,
      message: 'Nome deve conter apenas letras e espaços'
    }
  }

  return {
    isValid: true,
    message: null
  }
}

/**
 * Validar confirmação de senha
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) {
    return {
      isValid: false,
      message: 'Confirmação de senha é obrigatória'
    }
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      message: 'Senhas não conferem'
    }
  }

  return {
    isValid: true,
    message: null
  }
}

/**
 * Validar dados completos de registro
 */
export const validateRegistrationData = (data) => {
  const errors = {}

  // Validar nome
  const nameValidation = validateFullName(data.fullName)
  if (!nameValidation.isValid) {
    errors.fullName = nameValidation.message
  }

  // Validar email
  if (!validateEmail(data.email)) {
    errors.email = 'Formato de email inválido'
  }

  // Validar senha
  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.feedback[0] || 'Senha inválida'
  }

  // Validar confirmação de senha
  const confirmValidation = validatePasswordConfirmation(data.password, data.confirmPassword)
  if (!confirmValidation.isValid) {
    errors.confirmPassword = confirmValidation.message
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validar dados de login
 */
export const validateLoginData = (data) => {
  const errors = {}

  // Validar email
  if (!data.email || !data.email.trim()) {
    errors.email = 'Email é obrigatório'
  } else if (!validateEmail(data.email)) {
    errors.email = 'Formato de email inválido'
  }

  // Validar senha
  if (!data.password) {
    errors.password = 'Senha é obrigatória'
  } else if (data.password.length < 6) {
    errors.password = 'Senha deve ter pelo menos 6 caracteres'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Sanitizar email
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return ''
  }
  
  return email.trim().toLowerCase()
}

/**
 * Sanitizar nome
 */
export const sanitizeName = (name) => {
  if (!name || typeof name !== 'string') {
    return ''
  }
  
  return name.trim().replace(/\s+/g, ' ')
}

/**
 * Verificar se email é de domínio permitido
 */
export const isAllowedEmailDomain = (email, allowedDomains = []) => {
  if (allowedDomains.length === 0) {
    return true // Todos os domínios são permitidos se lista estiver vazia
  }

  const domain = email.split('@')[1]?.toLowerCase()
  return allowedDomains.includes(domain)
}

/**
 * Gerar sugestões de email corrigido
 */
export const suggestEmailCorrection = (email) => {
  const commonDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'live.com', 'icloud.com', 'uol.com.br', 'terra.com.br'
  ]

  const [localPart, domain] = email.split('@')
  if (!domain) return []

  const suggestions = []
  
  // Verificar domínios similares
  commonDomains.forEach(commonDomain => {
    if (domain !== commonDomain && isTypoLikely(domain, commonDomain)) {
      suggestions.push(`${localPart}@${commonDomain}`)
    }
  })

  return suggestions.slice(0, 3) // Máximo 3 sugestões
}

// Helpers internos
function getPasswordStrengthLabel(score) {
  const labels = {
    0: 'Muito fraca',
    1: 'Fraca',
    2: 'Regular',
    3: 'Boa',
    4: 'Forte',
    5: 'Muito forte'
  }
  
  return labels[score] || 'Muito fraca'
}

function isTypoLikely(input, target) {
  // Verificar se é possível erro de digitação
  if (Math.abs(input.length - target.length) > 2) return false
  
  let differences = 0
  const maxLength = Math.max(input.length, target.length)
  
  for (let i = 0; i < maxLength; i++) {
    if (input[i] !== target[i]) {
      differences++
      if (differences > 2) return false
    }
  }
  
  return differences <= 2
}