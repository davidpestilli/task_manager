/**
 * Utilitários para formatação de datas
 */

// Mapas de localização em português
const MONTH_NAMES = {
  short: [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ],
  long: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
}

const DAY_NAMES = {
  short: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  long: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
}

/**
 * Converte string ou timestamp para objeto Date
 * @param {string|number|Date} date - Data para converter
 * @returns {Date} Objeto Date válido
 */
export function parseDate(date) {
  if (!date) return new Date()
  if (date instanceof Date) return date
  return new Date(date)
}

/**
 * Formata data para formato brasileiro (DD/MM/AAAA)
 * @param {string|number|Date} date - Data para formatar
 * @param {Object} options - Opções de formatação
 * @returns {string} Data formatada
 */
export function formatDateBR(date, options = {}) {
  const {
    includeTime = false,
    includeSeconds = false,
    separator = '/'
  } = options

  const dateObj = parseDate(date)
  
  if (isNaN(dateObj.getTime())) {
    return 'Data inválida'
  }

  const day = String(dateObj.getDate()).padStart(2, '0')
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const year = dateObj.getFullYear()
  
  let formatted = `${day}${separator}${month}${separator}${year}`

  if (includeTime) {
    const hours = String(dateObj.getHours()).padStart(2, '0')
    const minutes = String(dateObj.getMinutes()).padStart(2, '0')
    
    formatted += ` ${hours}:${minutes}`
    
    if (includeSeconds) {
      const seconds = String(dateObj.getSeconds()).padStart(2, '0')
      formatted += `:${seconds}`
    }
  }

  return formatted
}

/**
 * Formata data para formato ISO (AAAA-MM-DD)
 * @param {string|number|Date} date - Data para formatar
 * @param {boolean} includeTime - Incluir horário
 * @returns {string} Data formatada em ISO
 */
export function formatDateISO(date, includeTime = false) {
  const dateObj = parseDate(date)
  
  if (isNaN(dateObj.getTime())) {
    return ''
  }

  if (includeTime) {
    return dateObj.toISOString()
  }
  
  return dateObj.toISOString().split('T')[0]
}

/**
 * Formata data por extenso (ex: "15 de Janeiro de 2024")
 * @param {string|number|Date} date - Data para formatar
 * @param {Object} options - Opções de formatação
 * @returns {string} Data por extenso
 */
export function formatDateLong(date, options = {}) {
  const {
    includeDayName = false,
    includeTime = false,
    monthFormat = 'long' // 'short' ou 'long'
  } = options

  const dateObj = parseDate(date)
  
  if (isNaN(dateObj.getTime())) {
    return 'Data inválida'
  }

  const day = dateObj.getDate()
  const month = MONTH_NAMES[monthFormat][dateObj.getMonth()]
  const year = dateObj.getFullYear()
  
  let formatted = `${day} de ${month} de ${year}`

  if (includeDayName) {
    const dayName = DAY_NAMES.long[dateObj.getDay()]
    formatted = `${dayName}, ${formatted}`
  }

  if (includeTime) {
    const hours = String(dateObj.getHours()).padStart(2, '0')
    const minutes = String(dateObj.getMinutes()).padStart(2, '0')
    formatted += ` às ${hours}:${minutes}`
  }

  return formatted
}

/**
 * Calcula tempo relativo (ex: "há 2 horas", "em 3 dias")
 * @param {string|number|Date} date - Data para comparar
 * @param {string|number|Date} baseDate - Data base (default: agora)
 * @returns {string} Tempo relativo
 */
export function formatDistanceToNow(date, baseDate = new Date()) {
  const dateObj = parseDate(date)
  const baseDateObj = parseDate(baseDate)
  
  if (isNaN(dateObj.getTime()) || isNaN(baseDateObj.getTime())) {
    return 'Data inválida'
  }

  const diffMs = baseDateObj.getTime() - dateObj.getTime()
  const diffSeconds = Math.floor(Math.abs(diffMs) / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  const isFuture = diffMs < 0
  const prefix = isFuture ? 'em ' : 'há '
  
  if (diffSeconds < 60) {
    return isFuture ? 'em alguns segundos' : 'agora mesmo'
  }
  
  if (diffMinutes < 60) {
    const unit = diffMinutes === 1 ? 'minuto' : 'minutos'
    return `${prefix}${diffMinutes} ${unit}`
  }
  
  if (diffHours < 24) {
    const unit = diffHours === 1 ? 'hora' : 'horas'
    return `${prefix}${diffHours} ${unit}`
  }
  
  if (diffDays < 7) {
    const unit = diffDays === 1 ? 'dia' : 'dias'
    return `${prefix}${diffDays} ${unit}`
  }
  
  if (diffWeeks < 4) {
    const unit = diffWeeks === 1 ? 'semana' : 'semanas'
    return `${prefix}${diffWeeks} ${unit}`
  }
  
  if (diffMonths < 12) {
    const unit = diffMonths === 1 ? 'mês' : 'meses'
    return `${prefix}${diffMonths} ${unit}`
  }
  
  const unit = diffYears === 1 ? 'ano' : 'anos'
  return `${prefix}${diffYears} ${unit}`
}

/**
 * Formata apenas o horário (HH:MM ou HH:MM:SS)
 * @param {string|number|Date} date - Data para extrair horário
 * @param {boolean} includeSeconds - Incluir segundos
 * @returns {string} Horário formatado
 */
export function formatTime(date, includeSeconds = false) {
  const dateObj = parseDate(date)
  
  if (isNaN(dateObj.getTime())) {
    return 'Horário inválido'
  }

  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')
  
  let formatted = `${hours}:${minutes}`
  
  if (includeSeconds) {
    const seconds = String(dateObj.getSeconds()).padStart(2, '0')
    formatted += `:${seconds}`
  }
  
  return formatted
}

/**
 * Verifica se uma data é hoje
 * @param {string|number|Date} date - Data para verificar
 * @returns {boolean} Se é hoje
 */
export function isToday(date) {
  const dateObj = parseDate(date)
  const today = new Date()
  
  return dateObj.toDateString() === today.toDateString()
}

/**
 * Verifica se uma data é ontem
 * @param {string|number|Date} date - Data para verificar
 * @returns {boolean} Se é ontem
 */
export function isYesterday(date) {
  const dateObj = parseDate(date)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  return dateObj.toDateString() === yesterday.toDateString()
}

/**
 * Verifica se uma data é amanhã
 * @param {string|number|Date} date - Data para verificar
 * @returns {boolean} Se é amanhã
 */
export function isTomorrow(date) {
  const dateObj = parseDate(date)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return dateObj.toDateString() === tomorrow.toDateString()
}

/**
 * Formata data de forma inteligente baseada na proximidade
 * @param {string|number|Date} date - Data para formatar
 * @param {Object} options - Opções de formatação
 * @returns {string} Data formatada de forma inteligente
 */
export function formatDateSmart(date, options = {}) {
  const { includeTime = false } = options
  
  if (isToday(date)) {
    return includeTime ? `Hoje às ${formatTime(date)}` : 'Hoje'
  }
  
  if (isYesterday(date)) {
    return includeTime ? `Ontem às ${formatTime(date)}` : 'Ontem'
  }
  
  if (isTomorrow(date)) {
    return includeTime ? `Amanhã às ${formatTime(date)}` : 'Amanhã'
  }
  
  const dateObj = parseDate(date)
  const now = new Date()
  const diffDays = Math.abs(Math.floor((now - dateObj) / (1000 * 60 * 60 * 24)))
  
  // Se for dentro de uma semana, mostrar dia da semana
  if (diffDays <= 7) {
    const dayName = DAY_NAMES.short[dateObj.getDay()]
    return includeTime ? `${dayName} às ${formatTime(date)}` : dayName
  }
  
  // Se for no mesmo ano, não mostrar ano
  if (dateObj.getFullYear() === now.getFullYear()) {
    const day = dateObj.getDate()
    const month = MONTH_NAMES.short[dateObj.getMonth()]
    const formatted = `${day} ${month}`
    return includeTime ? `${formatted} às ${formatTime(date)}` : formatted
  }
  
  // Data completa para datas mais antigas
  return formatDateBR(date, { includeTime })
}

/**
 * Adiciona dias a uma data
 * @param {string|number|Date} date - Data base
 * @param {number} days - Número de dias para adicionar
 * @returns {Date} Nova data
 */
export function addDays(date, days) {
  const dateObj = parseDate(date)
  dateObj.setDate(dateObj.getDate() + days)
  return dateObj
}

/**
 * Subtrai dias de uma data
 * @param {string|number|Date} date - Data base
 * @param {number} days - Número de dias para subtrair
 * @returns {Date} Nova data
 */
export function subtractDays(date, days) {
  return addDays(date, -days)
}

/**
 * Obtém início do dia (00:00:00)
 * @param {string|number|Date} date - Data
 * @returns {Date} Início do dia
 */
export function startOfDay(date) {
  const dateObj = parseDate(date)
  dateObj.setHours(0, 0, 0, 0)
  return dateObj
}

/**
 * Obtém fim do dia (23:59:59)
 * @param {string|number|Date} date - Data
 * @returns {Date} Fim do dia
 */
export function endOfDay(date) {
  const dateObj = parseDate(date)
  dateObj.setHours(23, 59, 59, 999)
  return dateObj
}