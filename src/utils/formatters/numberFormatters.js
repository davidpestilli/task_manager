/**
 * Utilitários para formatação de números
 */

/**
 * Formata número com separadores de milhares (formato brasileiro)
 * @param {number} value - Número para formatar
 * @param {Object} options - Opções de formatação
 * @returns {string} Número formatado
 */
export function formatNumber(value, options = {}) {
  const {
    decimals = 0,
    thousandsSeparator = '.',
    decimalSeparator = ',',
    prefix = '',
    suffix = ''
  } = options

  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }

  const number = Number(value)
  const fixed = number.toFixed(decimals)
  const [integerPart, decimalPart] = fixed.split('.')

  // Adicionar separadores de milhares
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)
  
  let result = formattedInteger
  
  if (decimals > 0 && decimalPart) {
    result += decimalSeparator + decimalPart
  }

  return prefix + result + suffix
}

/**
 * Formata porcentagem
 * @param {number} value - Valor decimal (0.5 = 50%)
 * @param {Object} options - Opções de formatação
 * @returns {string} Porcentagem formatada
 */
export function formatPercentage(value, options = {}) {
  const {
    decimals = 1,
    multiplier = 100, // Para valores já em porcentagem, usar 1
    showSign = true
  } = options

  if (value === null || value === undefined || isNaN(value)) {
    return '0%'
  }

  const percentage = Number(value) * multiplier
  const formatted = formatNumber(percentage, { decimals })
  
  return formatted + (showSign ? '%' : '')
}

/**
 * Formata moeda brasileira (Real)
 * @param {number} value - Valor em reais
 * @param {Object} options - Opções de formatação
 * @returns {string} Valor formatado em reais
 */
export function formatCurrency(value, options = {}) {
  const {
    decimals = 2,
    showSymbol = true,
    symbolPosition = 'before' // 'before' ou 'after'
  } = options

  if (value === null || value === undefined || isNaN(value)) {
    return showSymbol ? 'R$ 0,00' : '0,00'
  }

  const number = Number(value)
  const isNegative = number < 0
  const absoluteValue = Math.abs(number)
  
  const formatted = formatNumber(absoluteValue, {
    decimals,
    thousandsSeparator: '.',
    decimalSeparator: ','
  })

  let result = formatted
  
  if (showSymbol) {
    const symbol = 'R$ '
    result = symbolPosition === 'before' ? symbol + result : result + ' ' + symbol.trim()
  }

  if (isNegative) {
    result = '-' + result
  }

  return result
}

/**
 * Formata números grandes com sufixos (K, M, B)
 * @param {number} value - Número para formatar
 * @param {Object} options - Opções de formatação
 * @returns {string} Número formatado com sufixo
 */
export function formatCompactNumber(value, options = {}) {
  const {
    decimals = 1,
    threshold = 1000 // A partir de qual valor usar sufixos
  } = options

  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }

  const number = Math.abs(Number(value))
  const isNegative = Number(value) < 0

  if (number < threshold) {
    return formatNumber(value, { decimals: 0 })
  }

  const suffixes = [
    { value: 1e12, suffix: 'T' }, // Trilhão
    { value: 1e9, suffix: 'B' },  // Bilhão
    { value: 1e6, suffix: 'M' },  // Milhão
    { value: 1e3, suffix: 'K' }   // Milhares
  ]

  for (const { value: suffixValue, suffix } of suffixes) {
    if (number >= suffixValue) {
      const compactValue = number / suffixValue
      const formatted = formatNumber(compactValue, { 
        decimals,
        decimalSeparator: ','
      })
      return (isNegative ? '-' : '') + formatted + suffix
    }
  }

  return formatNumber(value, { decimals: 0 })
}

/**
 * Formata bytes em unidades legíveis (KB, MB, GB)
 * @param {number} bytes - Número de bytes
 * @param {Object} options - Opções de formatação
 * @returns {string} Tamanho formatado
 */
export function formatBytes(bytes, options = {}) {
  const {
    decimals = 2,
    binary = false // true para base 1024, false para base 1000
  } = options

  if (bytes === 0) return '0 Bytes'
  if (bytes === null || bytes === undefined || isNaN(bytes)) {
    return '0 Bytes'
  }

  const base = binary ? 1024 : 1000
  const units = binary 
    ? ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
    : ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']

  const number = Math.abs(Number(bytes))
  const isNegative = Number(bytes) < 0
  
  if (number < base) {
    return (isNegative ? '-' : '') + number + ' ' + units[0]
  }

  const unitIndex = Math.floor(Math.log(number) / Math.log(base))
  const value = number / Math.pow(base, unitIndex)
  const formatted = formatNumber(value, { decimals, decimalSeparator: ',' })

  return (isNegative ? '-' : '') + formatted + ' ' + units[unitIndex]
}

/**
 * Formata duração em tempo legível
 * @param {number} seconds - Duração em segundos
 * @param {Object} options - Opções de formatação
 * @returns {string} Duração formatada
 */
export function formatDuration(seconds, options = {}) {
  const {
    format = 'auto', // 'auto', 'short', 'long'
    showZero = false
  } = options

  if (seconds === null || seconds === undefined || isNaN(seconds)) {
    return '0s'
  }

  const totalSeconds = Math.floor(Math.abs(Number(seconds)))
  const isNegative = Number(seconds) < 0

  const units = [
    { value: 31536000, short: 'a', long: 'ano', longPlural: 'anos' },
    { value: 2592000, short: 'M', long: 'mês', longPlural: 'meses' },
    { value: 86400, short: 'd', long: 'dia', longPlural: 'dias' },
    { value: 3600, short: 'h', long: 'hora', longPlural: 'horas' },
    { value: 60, short: 'm', long: 'minuto', longPlural: 'minutos' },
    { value: 1, short: 's', long: 'segundo', longPlural: 'segundos' }
  ]

  const parts = []
  let remaining = totalSeconds

  for (const unit of units) {
    const count = Math.floor(remaining / unit.value)
    
    if (count > 0 || (showZero && parts.length === 0)) {
      if (format === 'short') {
        parts.push(`${count}${unit.short}`)
      } else if (format === 'long') {
        const unitName = count === 1 ? unit.long : unit.longPlural
        parts.push(`${count} ${unitName}`)
      } else {
        // Auto: usar formato curto para valores grandes, longo para pequenos
        if (totalSeconds >= 3600) {
          parts.push(`${count}${unit.short}`)
        } else {
          const unitName = count === 1 ? unit.long : unit.longPlural
          parts.push(`${count} ${unitName}`)
        }
      }
      
      remaining %= unit.value
    }

    // Limitar a 2 unidades mais significativas
    if (parts.length >= 2) break
  }

  if (parts.length === 0) {
    return format === 'long' ? '0 segundos' : '0s'
  }

  const result = parts.join(' ')
  return isNegative ? '-' + result : result
}

/**
 * Formata número ordinal (1º, 2º, 3º, etc.)
 * @param {number} value - Número para converter
 * @param {string} gender - Gênero ('m' para masculino, 'f' para feminino)
 * @returns {string} Número ordinal
 */
export function formatOrdinal(value, gender = 'm') {
  if (value === null || value === undefined || isNaN(value)) {
    return '0º'
  }

  const number = Math.abs(Math.floor(Number(value)))
  const suffix = gender === 'f' ? 'ª' : 'º'
  
  return number + suffix
}

/**
 * Formata avaliação/rating (ex: 4.5/5.0 estrelas)
 * @param {number} value - Valor da avaliação
 * @param {Object} options - Opções de formatação
 * @returns {string} Avaliação formatada
 */
export function formatRating(value, options = {}) {
  const {
    max = 5,
    decimals = 1,
    showMax = true,
    symbol = '★'
  } = options

  if (value === null || value === undefined || isNaN(value)) {
    return showMax ? `0${symbol}/${max}${symbol}` : `0${symbol}`
  }

  const rating = Math.min(Math.max(Number(value), 0), max)
  const formatted = formatNumber(rating, { decimals, decimalSeparator: ',' })
  
  if (showMax) {
    return `${formatted}${symbol}/${max}${symbol}`
  }
  
  return `${formatted}${symbol}`
}

/**
 * Formata intervalo de números
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @param {Object} options - Opções de formatação
 * @returns {string} Intervalo formatado
 */
export function formatRange(min, max, options = {}) {
  const {
    separator = ' - ',
    decimals = 0,
    prefix = '',
    suffix = ''
  } = options

  const formatValue = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0'
    }
    return formatNumber(value, { decimals })
  }

  const formattedMin = formatValue(min)
  const formattedMax = formatValue(max)

  return prefix + formattedMin + separator + formattedMax + suffix
}

/**
 * Arredonda número para múltiplo específico
 * @param {number} value - Valor para arredondar
 * @param {number} multiple - Múltiplo para arredondar
 * @returns {number} Valor arredondado
 */
export function roundToMultiple(value, multiple) {
  if (multiple === 0) return value
  return Math.round(value / multiple) * multiple
}

/**
 * Clamp número entre valores mínimo e máximo
 * @param {number} value - Valor para limitar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Valor limitado
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(Number(value), min), max)
}