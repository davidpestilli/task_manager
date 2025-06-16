/**
 * Utilitários para manipulação de strings
 * 
 * Fornece funções comuns para formatação, validação
 * e manipulação de texto no sistema
 */

/**
 * Trunca string com reticências
 * @param {string} str - String para truncar
 * @param {number} maxLength - Comprimento máximo
 * @returns {string} String truncada
 */
export const truncate = (str, maxLength = 50) => {
  if (!str || typeof str !== 'string') return ''
  
  if (str.length <= maxLength) return str
  
  return str.slice(0, maxLength).trim() + '...'
}

/**
 * Capitaliza primeira letra
 * @param {string} str - String para capitalizar
 * @returns {string} String capitalizada
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return ''
  
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Converte para title case
 * @param {string} str - String para converter
 * @returns {string} String em title case
 */
export const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return ''
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')
}

/**
 * Remove acentos e caracteres especiais
 * @param {string} str - String para normalizar
 * @returns {string} String normalizada
 */
export const removeAccents = (str) => {
  if (!str || typeof str !== 'string') return ''
  
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/**
 * Gera slug a partir de string
 * @param {string} str - String para converter
 * @returns {string} Slug gerado
 */
export const generateSlug = (str) => {
  if (!str || typeof str !== 'string') return ''
  
  return removeAccents(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Extrai iniciais do nome
 * @param {string} name - Nome completo
 * @param {number} maxInitials - Máximo de iniciais (padrão: 2)
 * @returns {string} Iniciais
 */
export const getInitials = (name, maxInitials = 2) => {
  if (!name || typeof name !== 'string') return '??'
  
  const words = name.trim().split(/\s+/)
  const initials = words
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('')
  
  return initials || '??'
}

/**
 * Valida se string contém apenas letras
 * @param {string} str - String para validar
 * @returns {boolean} True se válida
 */
export const isAlpha = (str) => {
  if (!str || typeof str !== 'string') return false
  return /^[a-zA-ZàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚě\s]+$/.test(str)
}

/**
 * Valida se string contém apenas números
 * @param {string} str - String para validar
 * @returns {boolean} True se válida
 */
export const isNumeric = (str) => {
  if (!str || typeof str !== 'string') return false
  return /^\d+$/.test(str)
}

/**
 * Valida se string contém apenas letras e números
 * @param {string} str - String para validar
 * @returns {boolean} True se válida
 */
export const isAlphanumeric = (str) => {
  if (!str || typeof str !== 'string') return false
  return /^[a-zA-Z0-9àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚě\s]+$/.test(str)
}

/**
 * Limpa string removendo espaços extras
 * @param {string} str - String para limpar
 * @returns {string} String limpa
 */
export const cleanString = (str) => {
  if (!str || typeof str !== 'string') return ''
  
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
}

/**
 * Destaca termos de busca em string
 * @param {string} text - Texto original
 * @param {string} searchTerm - Termo para destacar
 * @returns {string} Texto com termos destacados
 */
export const highlightSearchTerm = (text, searchTerm) => {
  if (!text || !searchTerm) return text
  
  const regex = new RegExp(`(${searchTerm})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

/**
 * Conta palavras em uma string
 * @param {string} str - String para contar
 * @returns {number} Número de palavras
 */
export const wordCount = (str) => {
  if (!str || typeof str !== 'string') return 0
  
  return str.trim().split(/\s+/).filter(word => word.length > 0).length
}

/**
 * Valida se string é um email válido
 * @param {string} email - Email para validar
 * @returns {boolean} True se válido
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Formata número de telefone brasileiro
 * @param {string} phone - Telefone para formatação
 * @returns {string} Telefone formatado
 */
export const formatPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return ''
  
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  
  return phone
}

/**
 * Gera hash simples de string (para IDs temporários)
 * @param {string} str - String para hash
 * @returns {string} Hash gerado
 */
export const simpleHash = (str) => {
  if (!str || typeof str !== 'string') return '0'
  
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36)
}