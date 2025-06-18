/**
 * Configuração centralizada de variáveis de ambiente
 * 
 * Este arquivo centraliza todas as variáveis de ambiente da aplicação,
 * fornecendo valores padrão e validação quando necessário.
 */

// Utilitário para obter variáveis de ambiente com valor padrão
const getEnvVar = (key, defaultValue = '') => {
  return import.meta.env[key] || defaultValue
}

// Utilitário para obter boolean de variáveis de ambiente
const getEnvBoolean = (key, defaultValue = false) => {
  const value = getEnvVar(key)
  if (value === '') return defaultValue
  return value === 'true' || value === '1'
}

// Utilitário para obter número de variáveis de ambiente
const getEnvNumber = (key, defaultValue = 0) => {
  const value = getEnvVar(key)
  if (value === '') return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

// EXPORTAÇÕES DIRETAS para compatibilidade com imports existentes
export const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL')
export const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY')

// Configurações do Supabase
export const SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  isConfigured: () => {
    return !!(SUPABASE_URL && SUPABASE_ANON_KEY)
  }
}

// Configurações da aplicação
export const APP_CONFIG = {
  name: getEnvVar('VITE_APP_NAME', 'Task Manager'),
  version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  description: getEnvVar('VITE_APP_DESCRIPTION', 'Sistema colaborativo de gerenciamento de tarefas'),
  baseUrl: getEnvVar('VITE_BASE_URL', '/'),
  environment: getEnvVar('VITE_ENV', 'development')
}

// Configurações de features
export const FEATURES = {
  notifications: getEnvBoolean('VITE_ENABLE_NOTIFICATIONS', true),
  webhooks: getEnvBoolean('VITE_ENABLE_WEBHOOKS', true),
  export: getEnvBoolean('VITE_ENABLE_EXPORT', true),
  realtime: getEnvBoolean('VITE_ENABLE_REALTIME', true),
  devMode: getEnvBoolean('VITE_DEV_MODE', false),
  debugMode: getEnvBoolean('VITE_DEBUG_MODE', false)
}

// Configurações de desenvolvimento
export const DEV_CONFIG = {
  isProduction: APP_CONFIG.environment === 'production',
  isDevelopment: APP_CONFIG.environment === 'development',
  isTest: APP_CONFIG.environment === 'test',
  enableLogging: FEATURES.devMode || FEATURES.debugMode,
  enableMocks: getEnvBoolean('VITE_ENABLE_MOCKS', false)
}

// Configurações de API
export const API_CONFIG = {
  timeout: getEnvNumber('VITE_API_TIMEOUT', 30000),
  maxFileSize: getEnvNumber('VITE_MAX_FILE_SIZE', 5242880), // 5MB
  paginationSize: getEnvNumber('VITE_PAGINATION_SIZE', 20),
  retryAttempts: 3,
  retryDelay: 1000
}

// Configurações de notificações
export const NOTIFICATION_CONFIG = {
  soundEnabled: getEnvBoolean('VITE_NOTIFICATION_SOUND', true),
  duration: getEnvNumber('VITE_NOTIFICATION_DURATION', 5000),
  maxVisible: 5,
  position: 'top-right'
}

// Configurações de exportação
export const EXPORT_CONFIG = {
  maxRecords: getEnvNumber('VITE_MAX_EXPORT_RECORDS', 1000),
  formats: ['pdf', 'csv', 'json'],
  timeout: 60000 // 1 minuto
}

// Configurações de serviços externos
export const EXTERNAL_SERVICES = {
  sentry: {
    dsn: getEnvVar('VITE_SENTRY_DSN'),
    enabled: !!getEnvVar('VITE_SENTRY_DSN')
  },
  analytics: {
    googleAnalyticsId: getEnvVar('VITE_GOOGLE_ANALYTICS_ID'),
    enabled: !!getEnvVar('VITE_GOOGLE_ANALYTICS_ID')
  }
}

// Configurações de segurança
export const SECURITY_CONFIG = {
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutos
  passwordMinLength: 8,
  requirePasswordComplexity: true
}

// Configurações de cache
export const CACHE_CONFIG = {
  defaultStaleTime: 5 * 60 * 1000, // 5 minutos
  defaultCacheTime: 10 * 60 * 1000, // 10 minutos
  maxRetries: 3,
  retryDelay: 1000
}

// Validação de configurações críticas
export const validateConfig = () => {
  const errors = []

  // Validar Supabase
  if (!SUPABASE_CONFIG.isConfigured()) {
    errors.push('Configurações do Supabase não encontradas (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY)')
  }

  // Validar URL base
  if (!APP_CONFIG.baseUrl.startsWith('/')) {
    errors.push('VITE_BASE_URL deve começar com "/"')
  }

  // Validar timeout
  if (API_CONFIG.timeout < 1000) {
    errors.push('VITE_API_TIMEOUT deve ser pelo menos 1000ms')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Logger condicional para desenvolvimento
export const logger = {
  log: (...args) => {
    if (DEV_CONFIG.enableLogging) {
      console.log('[Task Manager]', ...args)
    }
  },
  warn: (...args) => {
    if (DEV_CONFIG.enableLogging) {
      console.warn('[Task Manager]', ...args)
    }
  },
  error: (...args) => {
    if (DEV_CONFIG.enableLogging) {
      console.error('[Task Manager]', ...args)
    }
  },
  debug: (...args) => {
    if (FEATURES.debugMode) {
      console.debug('[Task Manager Debug]', ...args)
    }
  }
}

// Export default com todas as configurações
export default {
  SUPABASE_CONFIG,
  APP_CONFIG,
  FEATURES,
  DEV_CONFIG,
  API_CONFIG,
  NOTIFICATION_CONFIG,
  EXPORT_CONFIG,
  EXTERNAL_SERVICES,
  SECURITY_CONFIG,
  CACHE_CONFIG,
  validateConfig,
  logger
}