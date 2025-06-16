/**
 * Exports centralizados dos utilitários helpers
 * 
 * Permite importação fácil de todas as funções
 * auxiliares do sistema
 */

// Date formatters
export * from './dateFormatter.js'

// String utilities
export * from './stringUtils.js'

// Number utilities
export * from './numberUtils.js'

// Named exports para importação específica
export {
  formatDateBR,
  formatDateTimeBR,
  formatRelativeTime,
  formatTime,
  isToday,
  isYesterday,
  daysDifference,
  formatDuration,
  formatPeriod
} from './dateFormatter.js'

export {
  truncate,
  capitalize,
  toTitleCase,
  removeAccents,
  generateSlug,
  getInitials,
  isAlpha,
  isNumeric,
  isAlphanumeric,
  cleanString,
  highlightSearchTerm,
  wordCount,
  isValidEmail,
  formatPhone,
  simpleHash
} from './stringUtils.js'

export {
  formatPercentage,
  calculatePercentage,
  formatNumber,
  formatCurrency,
  roundToDecimals,
  clamp,
  randomBetween,
  isInRange,
  formatFileSize,
  average,
  max,
  min,
  sum,
  toNumber,
  formatOrdinal
} from './numberUtils.js'