/**
 * Utilitários para formatação de datas
 * 
 * Fornece funções consistentes para formatação de datas
 * em todo o sistema, incluindo formatação relativa e absoluta
 */

/**
 * Formata data para formato brasileiro (dd/mm/yyyy)
 * @param {Date|string} date - Data para formatação
 * @returns {string} Data formatada
 */
export const formatDateBR = (date) => {
  if (!date) return '-'
  
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return '-'
  
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Formata data e hora para formato brasileiro
 * @param {Date|string} date - Data para formatação
 * @returns {string} Data e hora formatadas
 */
export const formatDateTimeBR = (date) => {
  if (!date) return '-'
  
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return '-'
  
  return dateObj.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formata tempo relativo (ex: "há 5 minutos", "ontem")
 * @param {Date|string} date - Data para comparação
 * @returns {string} Tempo relativo formatado
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-'
  
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return '-'
  
  const now = new Date()
  const diffMs = now - dateObj
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffSeconds < 60) {
    return 'agora mesmo'
  } else if (diffMinutes < 60) {
    return `há ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`
  } else if (diffHours < 24) {
    return `há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
  } else if (diffDays < 7) {
    if (diffDays === 1) return 'ontem'
    return `há ${diffDays} dias`
  } else {
    return formatDateBR(date)
  }
}

/**
 * Formata apenas o horário (HH:mm)
 * @param {Date|string} date - Data para formatação
 * @returns {string} Horário formatado
 */
export const formatTime = (date) => {
  if (!date) return '-'
  
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return '-'
  
  return dateObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Verifica se uma data é hoje
 * @param {Date|string} date - Data para verificação
 * @returns {boolean} True se for hoje
 */
export const isToday = (date) => {
  if (!date) return false
  
  const dateObj = new Date(date)
  const today = new Date()
  
  return dateObj.toDateString() === today.toDateString()
}

/**
 * Verifica se uma data é de ontem
 * @param {Date|string} date - Data para verificação
 * @returns {boolean} True se for ontem
 */
export const isYesterday = (date) => {
  if (!date) return false
  
  const dateObj = new Date(date)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  return dateObj.toDateString() === yesterday.toDateString()
}

/**
 * Calcula diferença entre datas em dias
 * @param {Date|string} startDate - Data inicial
 * @param {Date|string} endDate - Data final (padrão: hoje)
 * @returns {number} Diferença em dias
 */
export const daysDifference = (startDate, endDate = new Date()) => {
  if (!startDate) return 0
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
  
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Formata duração em formato legível
 * @param {number} milliseconds - Duração em milissegundos
 * @returns {string} Duração formatada
 */
export const formatDuration = (milliseconds) => {
  if (!milliseconds || milliseconds < 0) return '0 segundos'
  
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days} ${days === 1 ? 'dia' : 'dias'}`
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hora' : 'horas'}`
  } else if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
  } else {
    return `${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}`
  }
}

/**
 * Formata período (de - até)
 * @param {Date|string} startDate - Data inicial
 * @param {Date|string} endDate - Data final
 * @returns {string} Período formatado
 */
export const formatPeriod = (startDate, endDate) => {
  if (!startDate && !endDate) return '-'
  if (!startDate) return `até ${formatDateBR(endDate)}`
  if (!endDate) return `desde ${formatDateBR(startDate)}`
  
  return `${formatDateBR(startDate)} - ${formatDateBR(endDate)}`
}