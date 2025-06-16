/**
 * Definições de tipos para usuários
 * Serve como documentação e referência para estruturas de dados de usuários
 */

/**
 * @typedef {Object} User
 * @property {string} id - ID único do usuário (UUID do Supabase Auth)
 * @property {string} full_name - Nome completo do usuário
 * @property {string} email - Email do usuário
 * @property {string|null} avatar_url - URL do avatar do usuário
 * @property {string} created_at - Data de criação da conta (ISO string)
 * @property {string} updated_at - Data da última atualização (ISO string)
 */

/**
 * @typedef {Object} AuthUser
 * Usuário autenticado do Supabase Auth
 * @property {string} id - ID único do usuário
 * @property {string} email - Email do usuário
 * @property {Object} user_metadata - Metadados do usuário
 * @property {string} created_at - Data de criação
 * @property {string} last_sign_in_at - Último login
 * @property {string} role - Role do usuário (authenticated)
 */

/**
 * @typedef {Object} UserProfile
 * Perfil estendido do usuário
 * @property {string} id - ID do usuário
 * @property {string} full_name - Nome completo
 * @property {string} email - Email
 * @property {string|null} avatar_url - URL do avatar
 * @property {string|null} bio - Biografia do usuário
 * @property {string|null} timezone - Fuso horário
 * @property {string|null} language - Idioma preferido
 * @property {UserPreferences} preferences - Preferências do usuário
 * @property {string} created_at - Data de criação
 * @property {string} updated_at - Última atualização
 */

/**
 * @typedef {Object} UserPreferences
 * Preferências do usuário
 * @property {boolean} email_notifications - Receber notificações por email
 * @property {boolean} push_notifications - Receber notificações push
 * @property {string} theme - Tema da interface ('light'|'dark'|'auto')
 * @property {string} date_format - Formato de data preferido
 * @property {string} time_format - Formato de hora (12h|24h)
 * @property {boolean} show_completed_tasks - Mostrar tarefas concluídas
 * @property {number} tasks_per_page - Tarefas por página
 */

/**
 * @typedef {Object} UserStats
 * Estatísticas do usuário
 * @property {number} totalProjects - Total de projetos
 * @property {number} ownedProjects - Projetos que possui
 * @property {number} totalTasks - Total de tarefas atribuídas
 * @property {number} completedTasks - Tarefas concluídas
 * @property {number} activeTasks - Tarefas em andamento
 * @property {number} overdueTasks - Tarefas atrasadas
 * @property {number} completionRate - Taxa de conclusão (%)
 * @property {number} avgTaskTime - Tempo médio de conclusão (horas)
 */

/**
 * @typedef {Object} UserActivity
 * Atividade do usuário
 * @property {string} id - ID da atividade
 * @property {string} user_id - ID do usuário
 * @property {string} action - Ação realizada
 * @property {string} entity_type - Tipo de entidade (project|task|comment)
 * @property {string} entity_id - ID da entidade
 * @property {Object} metadata - Dados adicionais da ação
 * @property {string} timestamp - Data/hora da ação (ISO string)
 */

/**
 * @typedef {Object} UserCreateData
 * Dados para criação de usuário
 * @property {string} full_name - Nome completo (obrigatório)
 * @property {string} email - Email (obrigatório)
 * @property {string} password - Senha (obrigatório)
 * @property {string} [avatar_url] - URL do avatar (opcional)
 */

/**
 * @typedef {Object} UserUpdateData
 * Dados para atualização de perfil
 * @property {string} [full_name] - Novo nome completo
 * @property {string} [avatar_url] - Nova URL do avatar
 * @property {string} [bio] - Nova biografia
 * @property {string} [timezone] - Novo fuso horário
 * @property {string} [language] - Novo idioma
 * @property {UserPreferences} [preferences] - Novas preferências
 */

/**
 * @typedef {Object} UserSearchResult
 * Resultado de busca de usuários
 * @property {string} id - ID do usuário
 * @property {string} full_name - Nome completo
 * @property {string} email - Email
 * @property {string|null} avatar_url - URL do avatar
 * @property {boolean} is_member - Se já é membro do projeto atual
 */

// Constantes úteis
export const USER_THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
}

export const DATE_FORMATS = {
  'DD/MM/YYYY': 'DD/MM/YYYY',
  'MM/DD/YYYY': 'MM/DD/YYYY',
  'YYYY-MM-DD': 'YYYY-MM-DD'
}

export const TIME_FORMATS = {
  '12h': '12h',
  '24h': '24h'
}

export const ACTIVITY_TYPES = {
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_DELETED: 'project_deleted',
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_COMPLETED: 'task_completed',
  TASK_ASSIGNED: 'task_assigned',
  COMMENT_ADDED: 'comment_added',
  MEMBER_ADDED: 'member_added',
  MEMBER_REMOVED: 'member_removed'
}

// Helpers para validação
export const isValidTheme = (theme) => {
  return Object.values(USER_THEMES).includes(theme)
}

export const isValidDateFormat = (format) => {
  return Object.values(DATE_FORMATS).includes(format)
}

export const isValidTimeFormat = (format) => {
  return Object.values(TIME_FORMATS).includes(format)
}

// Funções utilitárias
export const getUserDisplayName = (user) => {
  if (!user) return 'Usuário desconhecido'
  return user.full_name || user.email || 'Usuário'
}

export const getUserInitials = (user) => {
  if (!user?.full_name) return '?'
  
  return user.full_name
    .split(' ')
    .map(name => name.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export const getUserAvatarUrl = (user) => {
  if (user?.avatar_url) return user.avatar_url
  
  // Fallback para Gravatar
  if (user?.email) {
    const hash = btoa(user.email.toLowerCase().trim())
    return `https://www.gravatar.com/avatar/${hash}?d=identicon`
  }
  
  return null
}

export const formatUserRole = (role) => {
  const roleLabels = {
    owner: 'Proprietário',
    admin: 'Administrador',
    member: 'Membro'
  }
  return roleLabels[role] || role
}

// Mappers para transformar dados da API
export const mapUserFromAuth = (authUser) => {
  return {
    id: authUser.id,
    email: authUser.email,
    full_name: authUser.user_metadata?.full_name || authUser.email,
    avatar_url: authUser.user_metadata?.avatar_url || null,
    created_at: authUser.created_at,
    updated_at: authUser.updated_at || authUser.created_at
  }
}

export const mapUserFromProfile = (profile) => {
  return {
    ...profile,
    displayName: getUserDisplayName(profile),
    initials: getUserInitials(profile),
    avatarUrl: getUserAvatarUrl(profile)
  }
}

// Funções para estatísticas
export const calculateCompletionRate = (completed, total) => {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export const formatTaskTime = (hours) => {
  if (hours < 1) return `${Math.round(hours * 60)}min`
  if (hours < 24) return `${Math.round(hours)}h`
  const days = Math.round(hours / 24)
  return `${days}d`
}

// Validações
export const validateUserName = (name) => {
  if (!name || name.trim().length < 2) {
    return 'Nome deve ter pelo menos 2 caracteres'
  }
  if (name.trim().length > 100) {
    return 'Nome deve ter no máximo 100 caracteres'
  }
  return null
}

export const validateUserEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email é obrigatório'
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return 'Email deve ter um formato válido'
  }
  
  return null
}