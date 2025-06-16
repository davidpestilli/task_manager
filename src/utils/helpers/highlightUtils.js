/**
 * Utilitários para destacar texto em resultados de busca
 */

/**
 * Destaca termos de busca em um texto
 * @param {string} text - Texto original
 * @param {string} query - Termo de busca
 * @param {Object} options - Opções de configuração
 * @returns {string} HTML com texto destacado
 */
export const highlightText = (text, query, options = {}) => {
  if (!text || !query) return text

  const {
    className = 'bg-yellow-200 text-yellow-900 px-1 rounded',
    caseSensitive = false,
    wholeWords = false,
    maxHighlights = 10
  } = options

  const flags = caseSensitive ? 'g' : 'gi'
  const searchTerm = wholeWords ? `\\b${escapeRegex(query)}\\b` : escapeRegex(query)
  
  try {
    const regex = new RegExp(searchTerm, flags)
    let highlightCount = 0
    
    return text.replace(regex, (match) => {
      if (highlightCount >= maxHighlights) return match
      highlightCount++
      return `<mark class="${className}">${match}</mark>`
    })
  } catch (error) {
    console.warn('Erro ao destacar texto:', error)
    return text
  }
}

/**
 * Destaca múltiplos termos de busca
 * @param {string} text - Texto original
 * @param {Array} queries - Array de termos de busca
 * @param {Object} options - Opções de configuração
 * @returns {string} HTML com texto destacado
 */
export const highlightMultipleTerms = (text, queries, options = {}) => {
  if (!text || !Array.isArray(queries) || queries.length === 0) {
    return text
  }

  const {
    className = 'bg-yellow-200 text-yellow-900 px-1 rounded',
    caseSensitive = false,
    wholeWords = false
  } = options

  let highlightedText = text

  // Aplicar highlight para cada termo
  queries.forEach((query, index) => {
    if (!query.trim()) return

    // Usar classes diferentes para termos diferentes
    const termClassName = `${className} highlight-term-${index % 3}`
    
    highlightedText = highlightText(highlightedText, query, {
      className: termClassName,
      caseSensitive,
      wholeWords
    })
  })

  return highlightedText
}

/**
 * Extrai e destaca trecho relevante do texto
 * @param {string} text - Texto completo
 * @param {string} query - Termo de busca
 * @param {Object} options - Opções de configuração
 * @returns {Object} Objeto com trecho e texto destacado
 */
export const extractAndHighlight = (text, query, options = {}) => {
  if (!text || !query) {
    return {
      excerpt: text,
      highlighted: text,
      hasMatch: false
    }
  }

  const {
    excerptLength = 150,
    contextPadding = 30,
    className = 'bg-yellow-200 text-yellow-900 px-1 rounded'
  } = options

  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()
  const matchIndex = textLower.indexOf(queryLower)

  if (matchIndex === -1) {
    // Não encontrou match, retornar início do texto
    const excerpt = text.length > excerptLength 
      ? text.substring(0, excerptLength) + '...'
      : text

    return {
      excerpt,
      highlighted: excerpt,
      hasMatch: false
    }
  }

  // Calcular posição do trecho
  const startPos = Math.max(0, matchIndex - contextPadding)
  const endPos = Math.min(text.length, startPos + excerptLength)
  
  let excerpt = text.substring(startPos, endPos)
  
  // Adicionar ellipsis se necessário
  if (startPos > 0) excerpt = '...' + excerpt
  if (endPos < text.length) excerpt = excerpt + '...'

  // Destacar termo no trecho
  const highlighted = highlightText(excerpt, query, { className })

  return {
    excerpt,
    highlighted,
    hasMatch: true,
    matchIndex: matchIndex - startPos + (startPos > 0 ? 3 : 0) // Ajustar por ellipsis
  }
}

/**
 * Escapa caracteres especiais para regex
 * @param {string} string - String a ser escapada
 * @returns {string} String escapada
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Cria componente React para texto destacado
 * @param {string} text - Texto original
 * @param {string} query - Termo de busca
 * @param {Object} options - Opções de configuração
 * @returns {Object} Propriedades para componente React
 */
export const createHighlightProps = (text, query, options = {}) => {
  const highlighted = highlightText(text, query, options)
  
  return {
    dangerouslySetInnerHTML: { __html: highlighted },
    className: 'search-highlighted-text'
  }
}

/**
 * Função para usar com React (hook-like)
 * @param {string} text - Texto a ser destacado
 * @param {string} query - Termo de busca
 * @param {Object} options - Opções de configuração
 * @returns {Object} Objeto com métodos de highlight
 */
export const useTextHighlight = (text, query, options = {}) => {
  const highlight = (customOptions = {}) => {
    return highlightText(text, query, { ...options, ...customOptions })
  }

  const extractRelevant = (customOptions = {}) => {
    return extractAndHighlight(text, query, { ...options, ...customOptions })
  }

  const getProps = (customOptions = {}) => {
    return createHighlightProps(text, query, { ...options, ...customOptions })
  }

  return {
    highlight,
    extractRelevant,
    getProps,
    hasMatch: text && query && text.toLowerCase().includes(query.toLowerCase())
  }
}

/**
 * Destaca termos em resultados estruturados
 * @param {Object} result - Resultado da busca
 * @param {string} query - Termo de busca
 * @returns {Object} Resultado com campos destacados
 */
export const highlightSearchResult = (result, query) => {
  if (!result || !query) return result

  const fieldsToHighlight = ['name', 'title', 'description', 'full_name']
  const highlighted = { ...result }

  fieldsToHighlight.forEach(field => {
    if (result[field]) {
      highlighted[`${field}_highlighted`] = highlightText(
        result[field], 
        query,
        { className: 'bg-yellow-200 text-yellow-900 px-1 rounded' }
      )

      // Também criar versão com trecho relevante para campos longos
      if (field === 'description' && result[field].length > 100) {
        const extracted = extractAndHighlight(result[field], query, {
          excerptLength: 100,
          contextPadding: 20
        })
        highlighted[`${field}_excerpt`] = extracted.highlighted
      }
    }
  })

  return highlighted
}

/**
 * Configurações de estilo para diferentes tipos de highlight
 */
export const highlightStyles = {
  default: 'bg-yellow-200 text-yellow-900 px-1 rounded',
  primary: 'bg-blue-200 text-blue-900 px-1 rounded',
  success: 'bg-green-200 text-green-900 px-1 rounded',
  warning: 'bg-yellow-200 text-yellow-900 px-1 rounded',
  danger: 'bg-red-200 text-red-900 px-1 rounded',
  subtle: 'bg-gray-200 text-gray-900 px-1 rounded'
}

/**
 * Gera CSS para classes de highlight
 * @returns {string} CSS classes
 */
export const generateHighlightCSS = () => {
  return `
    .search-highlighted-text mark {
      background-color: #fef3c7;
      color: #92400e;
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
      font-weight: 500;
    }
    
    .highlight-term-0 {
      background-color: #fef3c7;
      color: #92400e;
    }
    
    .highlight-term-1 {
      background-color: #dbeafe;
      color: #1e40af;
    }
    
    .highlight-term-2 {
      background-color: #dcfce7;
      color: #166534;
    }
  `
}

// Objeto principal exportado
export const highlightUtils = {
  highlightText,
  highlightMultipleTerms,
  extractAndHighlight,
  createHighlightProps,
  useTextHighlight,
  highlightSearchResult,
  highlightStyles,
  generateHighlightCSS
}