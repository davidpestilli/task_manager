/**
 * Utilitários para trabalhar com cores no sistema
 */

/**
 * Paletas de cores do sistema baseadas no Tailwind CSS
 */
export const colorPalettes = {
  // Cores primárias do sistema
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  
  // Cores de status
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b'
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },
  
  // Cores neutras
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
}

/**
 * Mapeia cores de status para valores do sistema
 */
export const statusColors = {
  'não_iniciada': {
    color: colorPalettes.gray[500],
    bg: colorPalettes.gray[100],
    name: 'Não Iniciada'
  },
  'em_andamento': {
    color: colorPalettes.primary[600],
    bg: colorPalettes.primary[100],
    name: 'Em Andamento'
  },
  'pausada': {
    color: colorPalettes.warning[600],
    bg: colorPalettes.warning[100],
    name: 'Pausada'
  },
  'concluída': {
    color: colorPalettes.success[600],
    bg: colorPalettes.success[100],
    name: 'Concluída'
  }
}

/**
 * Obtém cor para um status específico
 * @param {string} status - Status da tarefa
 * @param {string} type - Tipo de cor ('color', 'bg')
 * @returns {string} Código da cor
 */
export const getStatusColor = (status, type = 'color') => {
  const statusConfig = statusColors[status]
  if (!statusConfig) return colorPalettes.gray[500]
  
  return statusConfig[type] || statusConfig.color
}

/**
 * Obtém classe CSS do Tailwind para um status
 * @param {string} status - Status da tarefa
 * @param {string} type - Tipo ('text', 'bg', 'border')
 * @returns {string} Classe CSS
 */
export const getStatusClass = (status, type = 'text') => {
  const statusClasses = {
    'não_iniciada': {
      text: 'text-gray-600',
      bg: 'bg-gray-100',
      border: 'border-gray-300'
    },
    'em_andamento': {
      text: 'text-blue-600',
      bg: 'bg-blue-100',
      border: 'border-blue-300'
    },
    'pausada': {
      text: 'text-yellow-600',
      bg: 'bg-yellow-100',
      border: 'border-yellow-300'
    },
    'concluída': {
      text: 'text-green-600',
      bg: 'bg-green-100',
      border: 'border-green-300'
    }
  }
  
  return statusClasses[status]?.[type] || statusClasses['não_iniciada'][type]
}

/**
 * Gera cor baseada em porcentagem de progresso
 * @param {number} percentage - Porcentagem (0-100)
 * @returns {Object} Objeto com cor e classe CSS
 */
export const getProgressColor = (percentage) => {
  if (percentage >= 100) {
    return {
      color: colorPalettes.success[500],
      class: 'text-green-600 bg-green-100',
      name: 'success'
    }
  } else if (percentage >= 75) {
    return {
      color: colorPalettes.success[400],
      class: 'text-green-500 bg-green-50',
      name: 'success'
    }
  } else if (percentage >= 50) {
    return {
      color: colorPalettes.primary[500],
      class: 'text-blue-600 bg-blue-100',
      name: 'primary'
    }
  } else if (percentage >= 25) {
    return {
      color: colorPalettes.warning[500],
      class: 'text-yellow-600 bg-yellow-100',
      name: 'warning'
    }
  } else {
    return {
      color: colorPalettes.error[500],
      class: 'text-red-600 bg-red-100',
      name: 'error'
    }
  }
}

/**
 * Converte hex para RGB
 * @param {string} hex - Cor em formato hex (#ffffff)
 * @returns {Object} Objeto com r, g, b
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Converte RGB para hex
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Cor em formato hex
 */
export const rgbToHex = (r, g, b) => {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }).join("")
}

/**
 * Gera tons mais claros ou escuros de uma cor
 * @param {string} color - Cor base em hex
 * @param {number} amount - Quantidade para clarear (+) ou escurecer (-)
 * @returns {string} Nova cor em hex
 */
export const shadeColor = (color, amount) => {
  const usePound = color[0] === "#"
  const col = usePound ? color.slice(1) : color
  const num = parseInt(col, 16)
  
  let r = (num >> 16) + amount
  let g = (num >> 8 & 0x00FF) + amount
  let b = (num & 0x0000FF) + amount
  
  if (r > 255) r = 255
  else if (r < 0) r = 0
  
  if (g > 255) g = 255
  else if (g < 0) g = 0
  
  if (b > 255) b = 255
  else if (b < 0) b = 0
  
  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16)
}

/**
 * Determina se uma cor é clara ou escura
 * @param {string} color - Cor em hex
 * @returns {boolean} true se for clara, false se for escura
 */
export const isLightColor = (color) => {
  const rgb = hexToRgb(color)
  if (!rgb) return true
  
  // Fórmula de luminância
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance > 0.5
}

/**
 * Obtém cor de texto adequada para um fundo
 * @param {string} backgroundColor - Cor de fundo em hex
 * @returns {string} Cor do texto (#000000 ou #ffffff)
 */
export const getContrastTextColor = (backgroundColor) => {
  return isLightColor(backgroundColor) ? '#000000' : '#ffffff'
}

/**
 * Gera cores baseadas em string (útil para avatars, etc.)
 * @param {string} str - String para gerar cor
 * @returns {Object} Objeto com cor de fundo e texto
 */
export const generateColorFromString = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const hue = Math.abs(hash) % 360
  const saturation = 65 + (Math.abs(hash) % 20) // 65-85%
  const lightness = 45 + (Math.abs(hash) % 20)  // 45-65%
  
  const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`
  const textColor = lightness > 55 ? '#000000' : '#ffffff'
  
  return {
    backgroundColor,
    textColor,
    hue,
    saturation,
    lightness
  }
}

/**
 * Aplica transparência a uma cor
 * @param {string} color - Cor em hex
 * @param {number} opacity - Opacidade (0-1)
 * @returns {string} Cor com transparência (rgba)
 */
export const addOpacity = (color, opacity) => {
  const rgb = hexToRgb(color)
  if (!rgb) return color
  
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
}

/**
 * Obtém paleta completa para um tema
 * @param {string} theme - Nome do tema
 * @returns {Object} Paleta de cores do tema
 */
export const getThemePalette = (theme = 'blue') => {
  const themes = {
    blue: colorPalettes.primary,
    green: colorPalettes.success,
    yellow: colorPalettes.warning,
    red: colorPalettes.error,
    gray: colorPalettes.gray
  }
  
  return themes[theme] || themes.blue
}