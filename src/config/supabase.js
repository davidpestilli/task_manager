import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from './environment.js'

// Configurações do Supabase (usando environment.js)
const supabaseUrl = SUPABASE_CONFIG.url
const supabaseAnonKey = SUPABASE_CONFIG.anonKey

// Validação das variáveis de ambiente
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is required')
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is required')
}

// Configurações customizadas do cliente
const supabaseConfig = {
  auth: {
    // Configurações de autenticação
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Configurações de segurança
    flowType: 'pkce', // Mais seguro para SPAs
  },
  // Configurações de tempo limite
  global: {
    headers: {
      'x-application-name': 'task-manager',
    },
  },
  // Configurações de realtime
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  // Configurações de schema
  db: {
    schema: 'public',
  },
}

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseConfig)

// Configurações específicas para tabelas
export const TABLES = {
  PROFILES: 'profiles',
  PROJECTS: 'projects',
  PROJECT_MEMBERS: 'project_members',
  TASKS: 'tasks',
  TASK_STEPS: 'task_steps',
  TASK_ASSIGNMENTS: 'task_assignments',
  TASK_DEPENDENCIES: 'task_dependencies',
  COMMENTS: 'comments',
  NOTIFICATIONS: 'notifications',
  WEBHOOKS: 'webhooks',
  ACTIVITY_LOG: 'activity_log'
}

// Configurações de política RLS
export const RLS_POLICIES = {
  ENABLE_RLS: true,
  POLICIES: {
    SELECT: 'select',
    INSERT: 'insert',
    UPDATE: 'update',
    DELETE: 'delete'
  }
}

// Configurações de realtime
export const REALTIME_CONFIG = {
  CHANNELS: {
    PROJECTS: 'projects',
    TASKS: 'tasks',
    NOTIFICATIONS: 'notifications',
    COMMENTS: 'comments'
  },
  EVENTS: {
    INSERT: 'INSERT',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE'
  }
}

// Funções utilitárias para Supabase
export const supabaseUtils = {
  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated: () => {
    const { data: { user } } = supabase.auth.getUser()
    return !!user
  },

  /**
   * Obtém o usuário atual
   */
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  /**
   * Formata erro do Supabase para exibição
   */
  formatError: (error) => {
    if (!error) return 'Erro desconhecido'
    
    // Erros de autenticação
    if (error.message?.includes('Invalid login credentials')) {
      return 'Email ou senha incorretos'
    }
    
    if (error.message?.includes('Email not confirmed')) {
      return 'Email não confirmado. Verifique sua caixa de entrada.'
    }
    
    if (error.message?.includes('User already registered')) {
      return 'Este email já está cadastrado'
    }
    
    // Erros de rede
    if (error.message?.includes('Failed to fetch')) {
      return 'Erro de conexão. Verifique sua internet.'
    }
    
    return error.message || 'Erro desconhecido'
  },

  /**
   * Configuração de timeout para operações
   */
  withTimeout: (promise, timeout = 30000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Operação expirou')), timeout)
      )
    ])
  }
}

export default supabase