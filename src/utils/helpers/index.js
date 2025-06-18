// Utilitários e helpers - Exportações finais completas

// Formatação de datas
export {
  formatDateBR,
  formatRelativeTime,
  formatDuration,
  isValidDate,
  parseDate,
  addDays,
  subtractDays,
  isSameDay,
  isToday,
  isYesterday,
  formatTimeAgo,
  formatDateRange,
  getWeekDays,
  getMonthDays
} from './dateFormatter'

// Formatação de strings
export {
  capitalize,
  slugify,
  truncate,
  removeAccents,
  sanitizeHtml,
  extractEmails,
  extractUrls,
  pluralize,
  camelToKebab,
  kebabToCamel,
  generateSlug,
  maskEmail,
  maskPhone,
  highlightText
} from './stringUtils'

// Formatação de números
export {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatBytes,
  parseNumber,
  isValidNumber,
  clamp,
  randomBetween,
  round,
  formatCompactNumber,
  formatOrdinal
} from './numberUtils'

// Utilitários de cores
export {
  hexToRgb,
  rgbToHex,
  lighten,
  darken,
  getContrastColor,
  generateColorPalette,
  isValidColor,
  colorToRgba,
  getStatusColor,
  getProgressColor,
  generateAvatarColor
} from './colorUtils'

// Utilitários do fluxograma
export {
  layoutNodes,
  validateDependencies,
  findCircularDependencies,
  topologicalSort,
  getNodePositions,
  calculateEdgePositions,
  optimizeLayout,
  detectCollisions,
  createFlowData,
  exportFlowImage
} from './flowUtils'

// Validador de dependências
export {
  validateTaskDependencies,
  checkCircularDependency,
  findDependencyPath,
  getDependencyChain,
  canAddDependency,
  resolveDependencyConflicts,
  optimizeDependencyGraph,
  calculateCriticalPath
} from './dependencyValidator'

// Utilitários de busca
export {
  searchItems,
  fuzzySearch,
  highlightMatches,
  createSearchIndex,
  searchInFields,
  sortSearchResults,
  filterByRelevance,
  debounceSearch,
  createSearchFilter,
  normalizeSearchQuery
} from './searchUtils'

// Utilitários de highlight
export {
  highlightSearchTerm,
  escapeRegex,
  wrapMatches,
  highlightMultipleTerms,
  removeHighlight,
  getMatchPositions,
  smartHighlight,
  preserveHtmlHighlight
} from './highlightUtils'

// Utilitários de gráficos
export {
  prepareChartData,
  generateColors,
  formatChartTooltip,
  calculateChartDimensions,
  createGradient,
  animateChart,
  exportChart,
  resizeChart,
  createResponsiveChart,
  formatChartLabels
} from './chartUtils'

// Utilitários de performance
export {
  debounce,
  throttle,
  useDebounce,
  useThrottle,
  useLazyComponent,
  useIntersectionObserver,
  useAdvancedMemo,
  useVirtualScroll,
  PerformanceMonitor,
  performanceMonitor,
  usePerformanceMonitor,
  optimizeListRendering,
  LRUCache,
  useCache
} from './performanceUtils'

// Função de combinação de classes CSS
export { cn } from './cn'

/**
 * Utilitários gerais
 */

/**
 * Deep clone de objetos
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * Comparação profunda de objetos
 */
export const deepEqual = (a, b) => {
  if (a === b) return true
  if (a == null || b == null) return false
  if (a.constructor !== b.constructor) return false

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((val, index) => deepEqual(val, b[index]))
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    
    if (keysA.length !== keysB.length) return false
    
    return keysA.every(key => 
      keysB.includes(key) && deepEqual(a[key], b[key])
    )
  }

  return false
}

/**
 * Flatten de arrays aninhados
 */
export const flatten = (arr, depth = Infinity) => {
  return depth > 0 ? arr.reduce((acc, val) => 
    acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val), []
  ) : arr.slice()
}

/**
 * Unique de arrays
 */
export const unique = (arr, key = null) => {
  if (key) {
    const seen = new Set()
    return arr.filter(item => {
      const value = typeof key === 'function' ? key(item) : item[key]
      if (seen.has(value)) return false
      seen.add(value)
      return true
    })
  }
  return [...new Set(arr)]
}

/**
 * Group by para arrays
 */
export const groupBy = (arr, key) => {
  return arr.reduce((groups, item) => {
    const group = typeof key === 'function' ? key(item) : item[key]
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
}

/**
 * Sort by múltiplos campos
 */
export const sortBy = (arr, ...keys) => {
  return arr.sort((a, b) => {
    for (let key of keys) {
      let direction = 1
      
      if (key.startsWith('-')) {
        direction = -1
        key = key.slice(1)
      }
      
      const aVal = typeof key === 'function' ? key(a) : a[key]
      const bVal = typeof key === 'function' ? key(b) : b[key]
      
      if (aVal < bVal) return -1 * direction
      if (aVal > bVal) return 1 * direction
    }
    return 0
  })
}

/**
 * Pick de propriedades de objeto
 */
export const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key]
    }
    return result
  }, {})
}

/**
 * Omit de propriedades de objeto
 */
export const omit = (obj, keys) => {
  const keysToOmit = new Set(keys)
  return Object.keys(obj).reduce((result, key) => {
    if (!keysToOmit.has(key)) {
      result[key] = obj[key]
    }
    return result
  }, {})
}

/**
 * Merge profundo de objetos
 */
export const deepMerge = (target, ...sources) => {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * Verificar se é objeto
 */
const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Gerar ID único
 */
export const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 9)
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`
}

/**
 * Retry para promises
 */
export const retry = async (fn, maxAttempts = 3, delay = 1000) => {
  let attempt = 1
  
  while (attempt <= maxAttempts) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxAttempts) throw error
      
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
      attempt++
    }
  }
}

/**
 * Timeout para promises
 */
export const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms)
  )
  
  return Promise.race([promise, timeout])
}

/**
 * Sleep/delay
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Detectar tipo de dispositivo
 */
export const deviceDetector = {
  isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isTablet: () => /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768,
  isDesktop: () => !deviceDetector.isMobile() && !deviceDetector.isTablet(),
  isTouchDevice: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  getViewport: () => ({
    width: window.innerWidth,
    height: window.innerHeight
  }),
  getBreakpoint: () => {
    const width = window.innerWidth
    if (width < 640) return 'sm'
    if (width < 768) return 'md'
    if (width < 1024) return 'lg'
    if (width < 1280) return 'xl'
    return '2xl'
  }
}

/**
 * LocalStorage helpers
 */
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return defaultValue
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Error writing to localStorage:', error)
      return false
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Error removing from localStorage:', error)
      return false
    }
  },
  
  clear: () => {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  }
}

/**
 * Clipboard helpers
 */
export const clipboard = {
  copy: async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      // Fallback para browsers antigos
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    }
  },
  
  read: async () => {
    try {
      return await navigator.clipboard.readText()
    } catch (error) {
      console.error('Error reading from clipboard:', error)
      return null
    }
  }
}

/**
 * URL helpers
 */
export const urlUtils = {
  getParams: () => Object.fromEntries(new URLSearchParams(window.location.search)),
  
  setParam: (key, value) => {
    const url = new URL(window.location)
    url.searchParams.set(key, value)
    window.history.pushState({}, '', url)
  },
  
  removeParam: (key) => {
    const url = new URL(window.location)
    url.searchParams.delete(key)
    window.history.pushState({}, '', url)
  },
  
  buildUrl: (base, params = {}) => {
    const url = new URL(base)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, value)
      }
    })
    return url.toString()
  }
}

/**
 * Validadores comuns
 */
export const validators = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  url: (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },
  phone: (phone) => /^\+?[\d\s-()]+$/.test(phone),
  cpf: (cpf) => {
    cpf = cpf.replace(/\D/g, '')
    if (cpf.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cpf)) return false
    
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i)
    }
    let digit = 11 - (sum % 11)
    if (digit > 9) digit = 0
    if (parseInt(cpf.charAt(9)) !== digit) return false
    
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i)
    }
    digit = 11 - (sum % 11)
    if (digit > 9) digit = 0
    
    return parseInt(cpf.charAt(10)) === digit
  }
}