/**
 * Utilitários para manipulação de números
 * 
 * Fornece funções para formatação, validação
 * e cálculos com números no sistema
 */

/**
 * Formata número como porcentagem
 * @param {number} value - Valor para formatação
 * @param {number} decimals - Casas decimais (padrão: 1)
 * @returns {string} Porcentagem formatada
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0%'
  
  const percentage = Number(value)
  return `${percentage.toFixed(decimals)}%`
}

/**
 * Calcula porcentagem de um valor
 * @param {number} part - Parte do total
 * @param {number} total - Total
 * @param {number} decimals - Casas decimais (padrão: 1)
 * @returns {number} Porcentagem calculada
 */
export const calculatePercentage = (part, total, decimals = 1) => {
  if (!total || total === 0) return 0
  
  const percentage = (part / total) * 100
  return Number(percentage.toFixed(decimals))
}

/**
 * Formata número no padrão brasileiro
 * @param {number} value - Valor para formatação
 * @param {number} minimumFractionDigits - Mínimo de casas decimais
 * @param {number} maximumFractionDigits - Máximo de casas decimais
 * @returns {string} Número formatado
 */
export const formatNumber = (value, minimumFractionDigits = 0, maximumFractionDigits = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '0'
  
  return Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits,
    maximumFractionDigits
  })
}

/**
 * Formata valor monetário em reais
 * @param {number} value - Valor para formatação
 * @returns {string} Valor formatado em reais
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'R$ 0,00'
  
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

/**
 * Arredonda número para casas decimais específicas
 * @param {number} value - Valor para arredondar
 * @param {number} decimals - Número de casas decimais
 * @returns {number} Número arredondado
 */
export const roundToDecimals = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return 0
  
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * Limita número dentro de um intervalo
 * @param {number} value - Valor para limitar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Valor limitado
 */
export const clamp = (value, min, max) => {
  if (value === null || value === undefined || isNaN(value)) return min
  
  return Math.min(Math.max(value, min), max)
}

/**
 * Gera número aleatório dentro de um intervalo
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @param {boolean} includeMax - Incluir valor máximo (padrão: false)
 * @returns {number} Número aleatório
 */
export const randomBetween = (min, max, includeMax = false) => {
  const random = Math.random() * (max - min)
  return includeMax 
    ? Math.floor(random) + min 
    : Math.floor(random + min)
}

/**
 * Verifica se número está dentro de um intervalo
 * @param {number} value - Valor para verificar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @param {boolean} inclusive - Incluir limites (padrão: true)
 * @returns {boolean} True se estiver no intervalo
 */
export const isInRange = (value, min, max, inclusive = true) => {
  if (value === null || value === undefined || isNaN(value)) return false
  
  return inclusive 
    ? value >= min && value <= max
    : value > min && value < max
}

/**
 * Formata tamanho de arquivo
 * @param {number} bytes - Tamanho em bytes
 * @param {number} decimals - Casas decimais (padrão: 2)
 * @returns {string} Tamanho formatado
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/**
 * Calcula média de array de números
 * @param {number[]} numbers - Array de números
 * @returns {number} Média calculada
 */
export const average = (numbers) => {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0
  
  const validNumbers = numbers.filter(n => !isNaN(n) && n !== null && n !== undefined)
  if (validNumbers.length === 0) return 0
  
  const sum = validNumbers.reduce((acc, num) => acc + Number(num), 0)
  return sum / validNumbers.length
}

/**
 * Encontra valor máximo em array
 * @param {number[]} numbers - Array de números
 * @returns {number} Valor máximo
 */
export const max = (numbers) => {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0
  
  const validNumbers = numbers.filter(n => !isNaN(n) && n !== null && n !== undefined)
  if (validNumbers.length === 0) return 0
  
  return Math.max(...validNumbers)
}

/**
 * Encontra valor mínimo em array
 * @param {number[]} numbers - Array de números
 * @returns {number} Valor mínimo
 */
export const min = (numbers) => {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0
  
  const validNumbers = numbers.filter(n => !isNaN(n) && n !== null && n !== undefined)
  if (validNumbers.length === 0) return 0
  
  return Math.min(...validNumbers)
}

/**
 * Soma array de números
 * @param {number[]} numbers - Array de números
 * @returns {number} Soma total
 */
export const sum = (numbers) => {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0
  
  return numbers
    .filter(n => !isNaN(n) && n !== null && n !== undefined)
    .reduce((acc, num) => acc + Number(num), 0)
}

/**
 * Converte string para número com fallback
 * @param {string|number} value - Valor para converter
 * @param {number} fallback - Valor de fallback (padrão: 0)
 * @returns {number} Número convertido
 */
export const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback
  
  const num = Number(value)
  return isNaN(num) ? fallback : num
}

/**
 * Formata número ordinal (1º, 2º, 3º...)
 * @param {number} num - Número para formatação
 * @returns {string} Número ordinal
 */
export const formatOrdinal = (num) => {
  if (!num || isNaN(num)) return '0º'
  
  return `${num}º`
}