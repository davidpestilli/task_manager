/**
 * Utilitários para formatação de texto
 */

/**
 * Trunca texto para um tamanho máximo
 * @param {string} text - Texto para truncar
 * @param {number} maxLength - Tamanho máximo
 * @param {string} suffix - Sufixo para textos truncados (default: '...')
 * @returns {string} Texto truncado
 */
export function truncateText(text, maxLength, suffix = '...') {
  if (!text || typeof text !== 'string') {
    return ''
  }

  if (text.length <= maxLength) {
    return text
  }

  return text.slice(0, maxLength - suffix.length) + suffix
}

/**
 * Converte texto para Title Case (Primeira Letra De Cada Palavra)
 * @param {string} text - Texto para converter
 * @returns {string} Texto em Title Case
 */
export function toTitleCase(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return text.toLowerCase().replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.slice(1)
  })
}

/**
 * Converte texto para camelCase
 * @param {string} text - Texto para converter
 * @returns {string} Texto em camelCase
 */
export function toCamelCase(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
}

/**
 * Converte texto para kebab-case
 * @param {string} text - Texto para converter
 * @returns {string} Texto em kebab-case
 */
export function toKebabCase(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Converte texto para snake_case
 * @param {string} text - Texto para converter
 * @returns {string} Texto em snake_case
 */
export function toSnakeCase(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/**
 * Remove acentos de um texto
 * @param {string} text - Texto para normalizar
 * @returns {string} Texto sem acentos
 */
export function removeAccents(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Gera iniciais de um nome
 * @param {string} name - Nome completo
 * @param {number} maxInitials - Número máximo de iniciais (default: 2)
 * @returns {string} Iniciais
 */
export function getInitials(name, maxInitials = 2) {
  if (!name || typeof name !== 'string') {
    return ''
  }

  const words = name.trim().split(/\s+/)
  const initials = words
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('')

  return initials
}

/**
 * Pluraliza palavra baseada em quantidade
 * @param {number} count - Quantidade
 * @param {string} singular - Forma singular
 * @param {string} plural - Forma plural (opcional, adiciona 's' se não fornecido)
 * @returns {string} Palavra no plural/singular correto
 */
export function pluralize(count, singular, plural) {
  if (!singular || typeof singular !== 'string') {
    return ''
  }

  const pluralForm = plural || singular + 's'
  return count === 1 ? singular : pluralForm
}

/**
 * Formata texto de contagem com pluralização
 * @param {number} count - Quantidade
 * @param {string} singular - Forma singular
 * @param {string} plural - Forma plural (opcional)
 * @param {boolean} includeCount - Incluir número na string
 * @returns {string} Texto formatado
 */
export function formatCount(count, singular, plural, includeCount = true) {
  const word = pluralize(count, singular, plural)
  return includeCount ? `${count} ${word}` : word
}

/**
 * Capitaliza primeira letra de um texto
 * @param {string} text - Texto para capitalizar
 * @returns {string} Texto com primeira letra maiúscula
 */
export function capitalize(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Remove espaços extras e normaliza espaçamento
 * @param {string} text - Texto para normalizar
 * @returns {string} Texto normalizado
 */
export function normalizeSpacing(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return text.replace(/\s+/g, ' ').trim()
}

/**
 * Extrai palavras-chave de um texto
 * @param {string} text - Texto para extrair palavras
 * @param {number} minLength - Tamanho mínimo das palavras (default: 3)
 * @returns {string[]} Array de palavras-chave
 */
export function extractKeywords(text, minLength = 3) {
  if (!text || typeof text !== 'string') {
    return []
  }

  // Palavras comuns para filtrar (stop words básicas)
  const stopWords = new Set([
    'a', 'o', 'e', 'de', 'do', 'da', 'em', 'um', 'uma', 'para', 'com', 'por',
    'que', 'se', 'na', 'no', 'as', 'os', 'ao', 'dos', 'das', 'me', 'te', 'se',
    'nos', 'vos', 'lhe', 'lhes', 'meu', 'minha', 'seu', 'sua', 'nosso', 'nossa'
  ])

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length >= minLength && !stopWords.has(word))
    .filter((word, index, arr) => arr.indexOf(word) === index) // Remove duplicatas
}

/**
 * Destaca termos de busca em um texto
 * @param {string} text - Texto original
 * @param {string} searchTerm - Termo para destacar
 * @param {string} highlightClass - Classe CSS para destacar
 * @returns {string} Texto com termos destacados (HTML)
 */
export function highlightSearchTerm(text, searchTerm, highlightClass = 'highlight') {
  if (!text || !searchTerm || typeof text !== 'string' || typeof searchTerm !== 'string') {
    return text || ''
  }

  const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi')
  return text.replace(regex, `<span class="${highlightClass}">$1</span>`)
}

/**
 * Escapa caracteres especiais para regex
 * @param {string} string - String para escapar
 * @returns {string} String escapada
 */
export function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Gera slug a partir de texto
 * @param {string} text - Texto para converter em slug
 * @returns {string} Slug gerado
 */
export function generateSlug(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return removeAccents(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Calcula similaridade entre duas strings (algoritmo básico)
 * @param {string} str1 - Primeira string
 * @param {string} str2 - Segunda string
 * @returns {number} Valor entre 0 e 1 (1 = idênticas)
 */
export function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0
  if (str1 === str2) return 1

  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1

  const editDistance = getEditDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

/**
 * Calcula distância de edição entre duas strings (Levenshtein)
 * @param {string} str1 - Primeira string
 * @param {string} str2 - Segunda string
 * @returns {number} Distância de edição
 */
function getEditDistance(str1, str2) {
  const matrix = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substituição
          matrix[i][j - 1] + 1,     // inserção
          matrix[i - 1][j] + 1      // deleção
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * Converte quebras de linha em tags HTML <br>
 * @param {string} text - Texto com quebras de linha
 * @returns {string} Texto com tags <br>
 */
export function nl2br(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return text.replace(/\r?\n/g, '<br>')
}

/**
 * Remove tags HTML de um texto
 * @param {string} html - HTML para limpar
 * @returns {string} Texto sem tags HTML
 */
export function stripHtml(html) {
  if (!html || typeof html !== 'string') {
    return ''
  }

  return html.replace(/<[^>]*>/g, '')
}

/**
 * Formata número de telefone brasileiro
 * @param {string} phone - Número de telefone
 * @returns {string} Telefone formatado
 */
export function formatPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return ''
  }

  // Remove tudo que não for dígito
  const digits = phone.replace(/\D/g, '')

  // Formata baseado no número de dígitos
  if (digits.length === 11) {
    // Celular: (11) 99999-9999
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (digits.length === 10) {
    // Fixo: (11) 9999-9999
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  return phone
}

/**
 * Formata CPF brasileiro
 * @param {string} cpf - CPF para formatar
 * @returns {string} CPF formatado
 */
export function formatCPF(cpf) {
  if (!cpf || typeof cpf !== 'string') {
    return ''
  }

  const digits = cpf.replace(/\D/g, '')
  
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  return cpf
}

/**
 * Formata CNPJ brasileiro
 * @param {string} cnpj - CNPJ para formatar
 * @returns {string} CNPJ formatado
 */
export function formatCNPJ(cnpj) {
  if (!cnpj || typeof cnpj !== 'string') {
    return ''
  }

  const digits = cnpj.replace(/\D/g, '')
  
  if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  return cnpj
}