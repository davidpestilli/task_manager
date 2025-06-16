/**
 * Utilitários para trabalhar com gráficos e visualizações
 */

/**
 * Converte dados para formato de gráfico de barras
 * @param {Array} data - Dados brutos
 * @param {string} labelKey - Chave para o label
 * @param {string} valueKey - Chave para o valor
 * @returns {Array} Dados formatados para gráfico de barras
 */
export const formatBarChartData = (data, labelKey = 'name', valueKey = 'value') => {
  if (!Array.isArray(data)) return []
  
  return data.map(item => ({
    name: item[labelKey] || 'N/A',
    value: Number(item[valueKey]) || 0,
    ...item
  }))
}

/**
 * Converte dados para formato de gráfico de pizza
 * @param {Array} data - Dados brutos
 * @param {string} labelKey - Chave para o label
 * @param {string} valueKey - Chave para o valor
 * @param {Array} colors - Array de cores
 * @returns {Array} Dados formatados para gráfico de pizza
 */
export const formatPieChartData = (data, labelKey = 'name', valueKey = 'value', colors = []) => {
  if (!Array.isArray(data)) return []
  
  return data.map((item, index) => ({
    name: item[labelKey] || 'N/A',
    value: Number(item[valueKey]) || 0,
    color: item.color || colors[index % colors.length] || '#8884d8',
    ...item
  }))
}

/**
 * Gera dados para gráfico de linha temporal
 * @param {Array} data - Dados com timestamps
 * @param {string} timeKey - Chave do timestamp
 * @param {string} valueKey - Chave do valor
 * @param {string} interval - Intervalo de agrupamento ('day', 'week', 'month')
 * @returns {Array} Dados agrupados por período
 */
export const formatTimeSeriesData = (data, timeKey = 'timestamp', valueKey = 'value', interval = 'day') => {
  if (!Array.isArray(data)) return []
  
  // Agrupar dados por período
  const groupedData = data.reduce((acc, item) => {
    const date = new Date(item[timeKey])
    let key
    
    switch (interval) {
      case 'day':
        key = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        key = date.toISOString().split('T')[0]
    }
    
    if (!acc[key]) {
      acc[key] = { date: key, value: 0, count: 0 }
    }
    
    acc[key].value += Number(item[valueKey]) || 0
    acc[key].count += 1
    
    return acc
  }, {})
  
  // Converter para array e ordenar
  return Object.values(groupedData)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(item => ({
      ...item,
      name: formatDateLabel(item.date, interval)
    }))
}

/**
 * Formata label de data baseado no intervalo
 * @param {string} dateString - String da data
 * @param {string} interval - Intervalo ('day', 'week', 'month')
 * @returns {string} Label formatado
 */
export const formatDateLabel = (dateString, interval) => {
  const date = new Date(dateString)
  
  switch (interval) {
    case 'day':
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    case 'week':
      return `Sem ${Math.ceil(date.getDate() / 7)}`
    case 'month':
      return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    default:
      return dateString
  }
}

/**
 * Calcula estatísticas básicas de um dataset
 * @param {Array} data - Array de números
 * @returns {Object} Estatísticas (média, mediana, min, max, soma)
 */
export const calculateStats = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return { mean: 0, median: 0, min: 0, max: 0, sum: 0, count: 0 }
  }
  
  const numbers = data.filter(n => typeof n === 'number' && !isNaN(n))
  
  if (numbers.length === 0) {
    return { mean: 0, median: 0, min: 0, max: 0, sum: 0, count: 0 }
  }
  
  const sorted = [...numbers].sort((a, b) => a - b)
  const sum = numbers.reduce((acc, val) => acc + val, 0)
  const mean = sum / numbers.length
  const median = numbers.length % 2 === 0
    ? (sorted[Math.floor(numbers.length / 2) - 1] + sorted[Math.floor(numbers.length / 2)]) / 2
    : sorted[Math.floor(numbers.length / 2)]
  
  return {
    mean: Math.round(mean * 100) / 100,
    median,
    min: Math.min(...numbers),
    max: Math.max(...numbers),
    sum,
    count: numbers.length
  }
}

/**
 * Gera paleta de cores para gráficos
 * @param {number} count - Número de cores necessárias
 * @param {string} type - Tipo de paleta ('default', 'status', 'gradient')
 * @returns {Array} Array de cores em hex
 */
export const generateColorPalette = (count, type = 'default') => {
  const palettes = {
    default: [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ],
    status: [
      '#6B7280', // Não iniciada (cinza)
      '#3B82F6', // Em andamento (azul)
      '#F59E0B', // Pausada (amarelo)
      '#10B981'  // Concluída (verde)
    ],
    gradient: [
      '#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'
    ]
  }
  
  const palette = palettes[type] || palettes.default
  
  // Se precisarmos de mais cores do que temos na paleta, gerar cores adicionais
  if (count > palette.length) {
    const additional = []
    for (let i = palette.length; i < count; i++) {
      const hue = (i * 137.508) % 360 // Golden angle para distribuição uniforme
      additional.push(`hsl(${hue}, 70%, 60%)`)
    }
    return [...palette, ...additional]
  }
  
  return palette.slice(0, count)
}

/**
 * Formata tooltip customizado para gráficos
 * @param {Object} params - Parâmetros do tooltip
 * @returns {Object} Configuração do tooltip
 */
export const createCustomTooltip = ({ 
  backgroundColor = '#fff',
  borderColor = '#e5e7eb',
  textColor = '#374151'
} = {}) => {
  return {
    contentStyle: {
      backgroundColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      color: textColor,
      fontSize: '12px'
    },
    cursor: {
      stroke: borderColor,
      strokeWidth: 1
    }
  }
}

/**
 * Converte dados de métricas para formato de comparação
 * @param {Object} current - Dados atuais
 * @param {Object} previous - Dados anteriores
 * @returns {Object} Dados de comparação com trends
 */
export const createComparisonData = (current, previous) => {
  const comparison = {}
  
  Object.keys(current).forEach(key => {
    const currentValue = Number(current[key]) || 0
    const previousValue = Number(previous?.[key]) || 0
    
    const change = currentValue - previousValue
    const percentChange = previousValue !== 0 
      ? Math.round((change / previousValue) * 100)
      : currentValue > 0 ? 100 : 0
    
    comparison[key] = {
      current: currentValue,
      previous: previousValue,
      change,
      percentChange,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    }
  })
  
  return comparison
}

/**
 * Aplica animações suaves para mudanças em gráficos
 * @param {string} type - Tipo de animação
 * @returns {Object} Configuração de animação
 */
export const getChartAnimations = (type = 'default') => {
  const animations = {
    default: {
      animationBegin: 0,
      animationDuration: 800,
      animationEasing: 'ease-out'
    },
    fast: {
      animationBegin: 0,
      animationDuration: 400,
      animationEasing: 'ease-out'
    },
    slow: {
      animationBegin: 0,
      animationDuration: 1200,
      animationEasing: 'ease-in-out'
    },
    none: {
      animationDuration: 0
    }
  }
  
  return animations[type] || animations.default
}