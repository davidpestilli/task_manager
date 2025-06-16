/**
 * Validações para projetos
 * Centraliza todas as regras de validação relacionadas a projetos
 */

// Constantes de validação
const PROJECT_VALIDATION_RULES = {
  name: {
    minLength: 3,
    maxLength: 100,
    required: true
  },
  description: {
    maxLength: 500,
    required: false
  }
}

/**
 * Valida campo individual de projeto
 * @param {string} field - Nome do campo
 * @param {any} value - Valor do campo
 * @returns {Object} Objeto com erros do campo
 */
export const validateField = (field, value) => {
  const errors = {}
  const rules = PROJECT_VALIDATION_RULES[field]
  
  if (!rules) return errors

  // Verificar se campo é obrigatório
  if (rules.required && (!value || value.toString().trim().length === 0)) {
    errors[field] = `${getFieldLabel(field)} é obrigatório`
    return errors
  }

  // Se campo não é obrigatório e está vazio, não validar outras regras
  if (!rules.required && (!value || value.toString().trim().length === 0)) {
    return errors
  }

  const stringValue = value?.toString().trim() || ''

  // Validar comprimento mínimo
  if (rules.minLength && stringValue.length < rules.minLength) {
    errors[field] = `${getFieldLabel(field)} deve ter pelo menos ${rules.minLength} caracteres`
  }

  // Validar comprimento máximo
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    errors[field] = `${getFieldLabel(field)} deve ter no máximo ${rules.maxLength} caracteres`
  }

  return errors
}

/**
 * Valida todos os campos de um projeto
 * @param {Object} projectData - Dados do projeto
 * @returns {Object} Objeto com todos os erros encontrados
 */
export const validateProject = (projectData) => {
  const errors = {}
  
  // Validar cada campo
  Object.keys(PROJECT_VALIDATION_RULES).forEach(field => {
    const fieldErrors = validateField(field, projectData[field])
    Object.assign(errors, fieldErrors)
  })

  // Validações customizadas
  
  // Verificar caracteres especiais no nome
  if (projectData.name && projectData.name.trim()) {
    const name = projectData.name.trim()
    
    // Não permitir apenas números
    if (/^\d+$/.test(name)) {
      errors.name = 'Nome do projeto não pode conter apenas números'
    }
    
    // Verificar caracteres inválidos
    const invalidChars = /[<>:"/\\|?*]/.test(name)
    if (invalidChars) {
      errors.name = 'Nome do projeto contém caracteres inválidos'
    }
  }

  return errors
}

/**
 * Valida email para convite de membro
 * @param {string} email - Email a validar
 * @returns {string|null} Mensagem de erro ou null se válido
 */
export const validateMemberEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email é obrigatório'
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return 'Email deve ter um formato válido'
  }

  return null
}

/**
 * Valida role de membro
 * @param {string} role - Role a validar
 * @returns {string|null} Mensagem de erro ou null se válido
 */
export const validateMemberRole = (role) => {
  const validRoles = ['member', 'admin', 'owner']
  
  if (!role) {
    return 'Role é obrigatório'
  }

  if (!validRoles.includes(role)) {
    return 'Role deve ser member, admin ou owner'
  }

  return null
}

/**
 * Valida se usuário pode executar ação no projeto
 * @param {string} action - Ação a validar
 * @param {string} userRole - Role do usuário
 * @param {boolean} isOwner - Se usuário é owner
 * @returns {boolean} Se ação é permitida
 */
export const validateProjectPermission = (action, userRole, isOwner = false) => {
  const permissions = {
    // Ações que qualquer membro pode fazer
    'view': ['member', 'admin', 'owner'],
    'create_task': ['member', 'admin', 'owner'],
    'edit_task': ['member', 'admin', 'owner'],
    'comment': ['member', 'admin', 'owner'],
    
    // Ações que requerem admin ou owner
    'edit_project': ['admin', 'owner'],
    'add_member': ['admin', 'owner'],
    'remove_member': ['admin', 'owner'],
    'change_member_role': ['admin', 'owner'],
    
    // Ações que requerem apenas owner
    'delete_project': ['owner'],
    'change_owner': ['owner']
  }

  // Se é owner, pode tudo
  if (isOwner) return true

  // Verificar permissões específicas
  const allowedRoles = permissions[action] || []
  return allowedRoles.includes(userRole)
}

/**
 * Obter label amigável do campo
 * @param {string} field - Nome do campo
 * @returns {string} Label do campo
 */
const getFieldLabel = (field) => {
  const labels = {
    name: 'Nome do projeto',
    description: 'Descrição'
  }
  
  return labels[field] || field
}

/**
 * Validações específicas para bulk operations
 */
export const validateBulkProjectOperation = (projectIds, operation) => {
  if (!Array.isArray(projectIds) || projectIds.length === 0) {
    return 'Selecione pelo menos um projeto'
  }

  if (projectIds.length > 50) {
    return 'Máximo de 50 projetos por operação'
  }

  const validOperations = ['archive', 'delete', 'export']
  if (!validOperations.includes(operation)) {
    return 'Operação inválida'
  }

  return null
}

// Export default como objeto com todas as funções
export const projectValidations = {
  validateField,
  validateProject,
  validateMemberEmail,
  validateMemberRole,
  validateProjectPermission,
  validateBulkProjectOperation,
  PROJECT_VALIDATION_RULES
}