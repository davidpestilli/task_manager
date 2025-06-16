/**
 * Definições de tipos para projetos
 * Serve como documentação e referência para estruturas de dados
 */

/**
 * @typedef {Object} Project
 * @property {string} id - ID único do projeto
 * @property {string} name - Nome do projeto
 * @property {string|null} description - Descrição do projeto
 * @property {string} owner_id - ID do proprietário
 * @property {string} created_at - Data de criação (ISO string)
 * @property {string} updated_at - Data da última atualização (ISO string)
 * @property {User} owner - Dados do proprietário
 * @property {ProjectMember[]} members - Lista de membros
 * @property {number} memberCount - Número de membros
 * @property {number} taskCount - Número de tarefas
 * @property {string} userRole - Role do usuário atual no projeto
 * @property {boolean} isActive - Se é o projeto ativo
 */

/**
 * @typedef {Object} ProjectMember
 * @property {string} project_id - ID do projeto
 * @property {string} user_id - ID do usuário
 * @property {ProjectRole} role - Role do membro
 * @property {string} joined_at - Data que entrou no projeto (ISO string)
 * @property {User} user - Dados do usuário
 */

/**
 * @typedef {'owner'|'admin'|'member'} ProjectRole
 * Roles disponíveis em um projeto:
 * - owner: Proprietário (controle total)
 * - admin: Administrador (gerenciar membros, editar projeto)
 * - member: Membro (criar/editar tarefas, comentar)
 */

/**
 * @typedef {Object} ProjectStats
 * @property {number} memberCount - Total de membros
 * @property {number} taskCount - Total de tarefas
 * @property {number} completedTasks - Tarefas concluídas
 * @property {number} progressPercentage - Porcentagem de progresso geral
 * @property {number} activeTasks - Tarefas ativas (em andamento)
 * @property {number} pausedTasks - Tarefas pausadas
 */

/**
 * @typedef {Object} ProjectCreateData
 * @property {string} name - Nome do projeto (obrigatório)
 * @property {string} [description] - Descrição do projeto (opcional)
 */

/**
 * @typedef {Object} ProjectUpdateData
 * @property {string} [name] - Novo nome do projeto
 * @property {string} [description] - Nova descrição do projeto
 */

/**
 * @typedef {Object} ProjectInvite
 * @property {string} id - ID do convite
 * @property {string} project_id - ID do projeto
 * @property {string} email - Email do convidado
 * @property {ProjectRole} role - Role oferecido
 * @property {string} invited_by - ID de quem convidou
 * @property {string} created_at - Data do convite (ISO string)
 * @property {string|null} accepted_at - Data da aceitação (ISO string)
 * @property {boolean} is_accepted - Se foi aceito
 * @property {boolean} is_expired - Se expirou
 */

/**
 * @typedef {Object} ProjectFilter
 * @property {string} [search] - Termo de busca
 * @property {ProjectRole} [role] - Filtrar por role do usuário
 * @property {string} [owner] - Filtrar por proprietário
 * @property {Date} [createdAfter] - Criados após data
 * @property {Date} [createdBefore] - Criados antes da data
 * @property {boolean} [hasActiveTasks] - Com tarefas ativas
 */

/**
 * @typedef {Object} ProjectSort
 * @property {ProjectSortField} field - Campo para ordenar
 * @property {'asc'|'desc'} order - Ordem da classificação
 */

/**
 * @typedef {'name'|'created_at'|'updated_at'|'memberCount'|'taskCount'} ProjectSortField
 * Campos disponíveis para ordenação de projetos
 */

// Constantes úteis
export const PROJECT_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member'
}

export const PROJECT_PERMISSIONS = {
  VIEW: 'view',
  CREATE_TASK: 'create_task',
  EDIT_TASK: 'edit_task',
  COMMENT: 'comment',
  EDIT_PROJECT: 'edit_project',
  ADD_MEMBER: 'add_member',
  REMOVE_MEMBER: 'remove_member',
  CHANGE_MEMBER_ROLE: 'change_member_role',
  DELETE_PROJECT: 'delete_project',
  CHANGE_OWNER: 'change_owner'
}

export const PROJECT_SORT_FIELDS = {
  NAME: 'name',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
  MEMBER_COUNT: 'memberCount',
  TASK_COUNT: 'taskCount'
}

// Helpers para validação de tipos
export const isValidProjectRole = (role) => {
  return Object.values(PROJECT_ROLES).includes(role)
}

export const isValidProjectPermission = (permission) => {
  return Object.values(PROJECT_PERMISSIONS).includes(permission)
}

export const isValidProjectSortField = (field) => {
  return Object.values(PROJECT_SORT_FIELDS).includes(field)
}

// Mappers para transformar dados da API
export const mapProjectFromAPI = (apiProject) => {
  return {
    ...apiProject,
    memberCount: apiProject.project_members_count?.[0]?.count || 0,
    taskCount: apiProject.tasks_count?.[0]?.count || 0,
    owner: apiProject.profiles,
    members: apiProject.project_members?.map(mapProjectMemberFromAPI) || []
  }
}

export const mapProjectMemberFromAPI = (apiMember) => {
  return {
    ...apiMember,
    user: apiMember.profiles
  }
}

// Funções utilitárias
export const getProjectRoleLabel = (role) => {
  const labels = {
    [PROJECT_ROLES.OWNER]: 'Proprietário',
    [PROJECT_ROLES.ADMIN]: 'Administrador',
    [PROJECT_ROLES.MEMBER]: 'Membro'
  }
  return labels[role] || role
}

export const getProjectRoleBadgeColor = (role) => {
  const colors = {
    [PROJECT_ROLES.OWNER]: 'bg-purple-100 text-purple-800',
    [PROJECT_ROLES.ADMIN]: 'bg-blue-100 text-blue-800',
    [PROJECT_ROLES.MEMBER]: 'bg-gray-100 text-gray-800'
  }
  return colors[role] || colors[PROJECT_ROLES.MEMBER]
}