// Exportações dos componentes de formulário

// Componentes básicos
export { default as FormField } from './FormField'
export { default as FormSelect } from './FormSelect'
export { default as FormTextarea } from './FormTextarea'

// Componentes de seleção
export { default as FormCheckbox, FormCheckboxGroup } from './FormCheckbox'
export { default as FormRadio, FormRadioGroup, FormRadioCard } from './FormRadio'

// Tipos de formulário para validação
export const FORM_FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
  NUMBER: 'number',
  TEL: 'tel',
  URL: 'url',
  SEARCH: 'search',
  DATE: 'date',
  TIME: 'time',
  DATETIME_LOCAL: 'datetime-local',
  MONTH: 'month',
  WEEK: 'week',
  COLOR: 'color',
  RANGE: 'range',
  FILE: 'file',
  HIDDEN: 'hidden'
}

// Tamanhos padrão para componentes
export const FORM_SIZES = {
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg'
}

// Variantes de status
export const FORM_VARIANTS = {
  DEFAULT: 'default',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
}

// Direções de layout
export const LAYOUT_DIRECTIONS = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal'
}

// Utilitários para formulários
export const formUtils = {
  /**
   * Valida se um campo é obrigatório e está preenchido
   */
  validateRequired: (value, required = false) => {
    if (!required) return { isValid: true }
    
    if (value === null || value === undefined || value === '') {
      return { isValid: false, error: 'Este campo é obrigatório' }
    }
    
    return { isValid: true }
  },

  /**
   * Valida email básico
   */
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Email inválido' }
    }
    return { isValid: true }
  },

  /**
   * Valida senha com critérios mínimos
   */
  validatePassword: (password) => {
    if (password.length < 8) {
      return { isValid: false, error: 'Senha deve ter pelo menos 8 caracteres' }
    }
    return { isValid: true }
  },

  /**
   * Normaliza valor de formulário
   */
  normalizeValue: (value, type) => {
    switch (type) {
      case FORM_FIELD_TYPES.NUMBER:
        return value === '' ? null : Number(value)
      case FORM_FIELD_TYPES.TEXT:
      case FORM_FIELD_TYPES.EMAIL:
        return typeof value === 'string' ? value.trim() : value
      default:
        return value
    }
  },

  /**
   * Gera ID único para campo de formulário
   */
  generateFieldId: (name, prefix = 'field') => {
    return `${prefix}-${name}-${Math.random().toString(36).substr(2, 9)}`
  },

  /**
   * Converte objeto de erros para mensagens amigáveis
   */
  formatErrors: (errors) => {
    if (typeof errors === 'string') return errors
    if (Array.isArray(errors)) return errors.join(', ')
    if (typeof errors === 'object') {
      return Object.values(errors).flat().join(', ')
    }
    return 'Erro de validação'
  }
}