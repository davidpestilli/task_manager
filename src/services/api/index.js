/**
 * @fileoverview Exports centralizados dos serviços de API
 */

// Cliente Supabase base
export { supabase, createSupabaseClient } from './supabase'
export { apiClient } from './client'

// Serviços de autenticação (assumindo que já existem)
export * from '../auth'

// Serviços de projetos (assumindo que já existem)
export * from '../projects'

// Serviços de tarefas (assumindo que já existem)
export * from '../tasks'

// Serviços de pessoas (assumindo que já existem)
export * from '../people'

// Serviços de notificações (assumindo que já existem)
export * from '../notifications'

// Serviços de dashboard (assumindo que já existem)
export * from '../dashboard'

// Serviços de comentários (assumindo que já existem)
export * from '../comments'

// Serviços de webhooks (assumindo que já existem)
export * from '../webhooks'

// Serviços de exportação (assumindo que já existem)
export * from '../export'

// NOVO: Serviços de busca global
export { 
  searchGlobal, 
  getSearchSuggestions 
} from './searchService'