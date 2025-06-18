// Utilitários de performance e otimização

import { useCallback, useMemo, useRef, useEffect } from 'react'

/**
 * Debounce para funções
 * 
 * @param {Function} func - Função a ser debounced
 * @param {number} wait - Tempo de espera em ms
 * @param {boolean} immediate - Executar na primeira chamada
 * @returns {Function}
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

/**
 * Throttle para funções
 * 
 * @param {Function} func - Função a ser throttled
 * @param {number} limit - Limite de tempo em ms
 * @returns {Function}
 */
export const throttle = (func, limit) => {
  let inThrottle
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Hook de debounce para React
 * 
 * @param {any} value - Valor a ser debounced
 * @param {number} delay - Delay em ms
 * @returns {any} - Valor debounced
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}

/**
 * Hook de throttle para React
 * 
 * @param {Function} callback - Função callback
 * @param {number} delay - Delay em ms
 * @returns {Function} - Função throttled
 */
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now())
  
  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args)
      lastRun.current = Date.now()
    }
  }, [callback, delay])
}

/**
 * Hook para lazy loading de componentes
 * 
 * @param {Function} importFunc - Função de import dinâmico
 * @returns {Object} - {Component, loading, error}
 */
export const useLazyComponent = (importFunc) => {
  const [state, setState] = useState({
    Component: null,
    loading: true,
    error: null
  })
  
  useEffect(() => {
    let mounted = true
    
    importFunc()
      .then(module => {
        if (mounted) {
          setState({
            Component: module.default || module,
            loading: false,
            error: null
          })
        }
      })
      .catch(error => {
        if (mounted) {
          setState({
            Component: null,
            loading: false,
            error
          })
        }
      })
    
    return () => {
      mounted = false
    }
  }, [importFunc])
  
  return state
}

/**
 * Hook para intersection observer (lazy loading de conteúdo)
 * 
 * @param {Object} options - Opções do IntersectionObserver
 * @returns {Array} - [ref, isIntersecting]
 */
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef()
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, {
      threshold: 0.1,
      ...options
    })
    
    observer.observe(element)
    
    return () => {
      observer.unobserve(element)
    }
  }, [options])
  
  return [ref, isIntersecting]
}

/**
 * Hook para memoização avançada com dependências customizadas
 * 
 * @param {Function} factory - Função factory
 * @param {Array} deps - Dependências
 * @param {Function} compareFn - Função de comparação customizada
 * @returns {any}
 */
export const useAdvancedMemo = (factory, deps, compareFn) => {
  const ref = useRef()
  
  if (!ref.current || (compareFn ? !compareFn(ref.current.deps, deps) : !shallowEqual(ref.current.deps, deps))) {
    ref.current = {
      value: factory(),
      deps
    }
  }
  
  return ref.current.value
}

/**
 * Comparação shallow de arrays/objetos
 */
const shallowEqual = (a, b) => {
  if (a === b) return true
  if (!a || !b) return false
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => item === b[index])
  }
  
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  
  if (keysA.length !== keysB.length) return false
  
  return keysA.every(key => a[key] === b[key])
}

/**
 * Hook para virtual scrolling
 * 
 * @param {Array} items - Lista de itens
 * @param {number} itemHeight - Altura de cada item
 * @param {number} containerHeight - Altura do container
 * @returns {Object}
 */
export const useVirtualScroll = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0)
  
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const totalHeight = items.length * itemHeight
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length)
  
  const visibleItems = useMemo(() => 
    items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }))
  , [items, startIndex, endIndex, itemHeight])
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
  }, [])
  
  return {
    visibleItems,
    totalHeight,
    handleScroll,
    startIndex,
    endIndex
  }
}

/**
 * Performance monitor para desenvolvimento
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.observers = []
  }
  
  /**
   * Marcar início de uma operação
   */
  mark(name) {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-start`)
    }
    this.metrics.set(name, { startTime: Date.now() })
  }
  
  /**
   * Marcar fim de uma operação e calcular duração
   */
  measure(name) {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
    }
    
    const metric = this.metrics.get(name)
    if (metric) {
      metric.duration = Date.now() - metric.startTime
      metric.endTime = Date.now()
      
      // Notificar observers
      this.observers.forEach(observer => observer(name, metric))
    }
    
    return metric
  }
  
  /**
   * Adicionar observer para métricas
   */
  addObserver(callback) {
    this.observers.push(callback)
  }
  
  /**
   * Obter todas as métricas
   */
  getMetrics() {
    return Object.fromEntries(this.metrics)
  }
  
  /**
   * Limpar métricas
   */
  clear() {
    this.metrics.clear()
    if (typeof performance !== 'undefined') {
      performance.clearMarks()
      performance.clearMeasures()
    }
  }
}

// Instância global do monitor
export const performanceMonitor = new PerformanceMonitor()

/**
 * Hook para monitoramento de performance de componentes
 */
export const usePerformanceMonitor = (componentName) => {
  useEffect(() => {
    performanceMonitor.mark(`${componentName}-render`)
    
    return () => {
      performanceMonitor.measure(`${componentName}-render`)
    }
  })
  
  const measureAsync = useCallback(async (operationName, operation) => {
    const fullName = `${componentName}-${operationName}`
    performanceMonitor.mark(fullName)
    
    try {
      const result = await operation()
      performanceMonitor.measure(fullName)
      return result
    } catch (error) {
      performanceMonitor.measure(fullName)
      throw error
    }
  }, [componentName])
  
  return { measureAsync }
}

/**
 * Otimizações para listas grandes
 */
export const optimizeListRendering = {
  /**
   * Chunking de arrays grandes
   */
  chunkArray: (array, chunkSize = 50) => {
    const chunks = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  },
  
  /**
   * Processamento em lotes com requestIdleCallback
   */
  processInBatches: async (items, processor, batchSize = 10) => {
    const results = []
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      const batchResults = await new Promise(resolve => {
        const processBatch = () => {
          const processed = batch.map(processor)
          resolve(processed)
        }
        
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(processBatch)
        } else {
          setTimeout(processBatch, 0)
        }
      })
      
      results.push(...batchResults)
    }
    
    return results
  }
}

/**
 * Cache em memória com LRU
 */
export class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize
    this.cache = new Map()
  }
  
  get(key) {
    if (this.cache.has(key)) {
      // Mover para o final (mais recente)
      const value = this.cache.get(key)
      this.cache.delete(key)
      this.cache.set(key, value)
      return value
    }
    return undefined
  }
  
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // Remover o mais antigo (primeiro)
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, value)
  }
  
  clear() {
    this.cache.clear()
  }
  
  size() {
    return this.cache.size
  }
}

/**
 * Hook para cache com TTL
 */
export const useCache = (maxSize = 50, defaultTTL = 5 * 60 * 1000) => {
  const cache = useRef(new Map())
  
  const set = useCallback((key, value, ttl = defaultTTL) => {
    const expireTime = Date.now() + ttl
    cache.current.set(key, { value, expireTime })
    
    // Limpar cache se exceder tamanho máximo
    if (cache.current.size > maxSize) {
      const firstKey = cache.current.keys().next().value
      cache.current.delete(firstKey)
    }
  }, [maxSize, defaultTTL])
  
  const get = useCallback((key) => {
    const item = cache.current.get(key)
    if (!item) return undefined
    
    if (Date.now() > item.expireTime) {
      cache.current.delete(key)
      return undefined
    }
    
    return item.value
  }, [])
  
  const clear = useCallback(() => {
    cache.current.clear()
  }, [])
  
  return { get, set, clear }
}

// Configurações de performance para desenvolvimento
if (process.env.NODE_ENV === 'development') {
  // Log de renders demorados
  performanceMonitor.addObserver((name, metric) => {
    if (metric.duration > 16) { // 16ms = 60fps
      console.warn(`⚡ Performance: ${name} took ${metric.duration}ms`)
    }
  })
}