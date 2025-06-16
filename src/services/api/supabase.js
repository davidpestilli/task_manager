import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config/environment'

// Configurações do cliente Supabase
const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
}

// Cliente Supabase configurado
export const supabase = createClient(
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  supabaseConfig
)

// Configurações de autenticação
export const authConfig = {
  redirectTo: `${window.location.origin}/auth/callback`,
  emailRedirectTo: `${window.location.origin}/auth/callback`
}

// Helper para verificar se o cliente está conectado
export const isSupabaseConnected = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    return !error
  } catch (err) {
    console.error('Erro ao verificar conexão Supabase:', err)
    return false
  }
}

export default supabase