import { supabase } from './supabase'

// Configurações padrão para requests
const defaultConfig = {
  timeout: 10000,
  retries: 3,
  retryDelay: 1000
}

// Helper para tratamento de erros padronizado
export const handleApiError = (error, context = '') => {
  console.error(`Erro na API ${context}:`, error)
  
  // Mapear erros comuns do Supabase
  const errorMap = {
    'Invalid login credentials': 'Credenciais inválidas',
    'Email not confirmed': 'Email não confirmado',
    'User already registered': 'Usuário já cadastrado',
    'Password should be at least 6 characters': 'Senha deve ter pelo menos 6 caracteres',
    'Unable to validate email address': 'Email inválido',
    'Network request failed': 'Erro de conexão'
  }

  const message = errorMap[error.message] || error.message || 'Erro inesperado'
  
  return {
    success: false,
    error: {
      message,
      code: error.code || 'UNKNOWN_ERROR',
      details: error
    }
  }
}

// Helper para formatação de respostas de sucesso
export const handleApiSuccess = (data, message = '') => {
  return {
    success: true,
    data,
    message
  }
}

// Helper para timeout de requests
export const withTimeout = (promise, ms = defaultConfig.timeout) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), ms)
  )
  
  return Promise.race([promise, timeout])
}

// Helper para retry automático
export const withRetry = async (fn, retries = defaultConfig.retries) => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0 && error.message !== 'Request timeout') {
      await new Promise(resolve => setTimeout(resolve, defaultConfig.retryDelay))
      return withRetry(fn, retries - 1)
    }
    throw error
  }
}

// Client configurado do Supabase
export const apiClient = {
  auth: supabase.auth,
  from: (table) => supabase.from(table),
  storage: supabase.storage,
  realtime: supabase.realtime,
  rpc: (fn, params) => supabase.rpc(fn, params)
}

export default apiClient