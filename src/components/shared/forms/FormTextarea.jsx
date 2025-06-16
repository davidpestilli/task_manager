import React from 'react'
import { FormField } from './FormField'

/**
 * Componente textarea para formulários
 * Wrapper para textarea com estilos consistentes e features extras
 */
export const FormTextarea = ({
  error,
  className = '',
  rows = 4,
  maxLength,
  showCharCount = false,
  autoResize = false,
  value = '',
  onChange,
  ...props
}) => {
  const textareaClassName = `
    w-full px-3 py-2 border rounded-lg shadow-sm resize-y
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error ? 'border-red-300 text-red-900' : 'border-gray-300 text-gray-900'}
    ${autoResize ? 'resize-none overflow-hidden' : ''}
    ${className}
  `

  // Auto-resize da textarea
  const handleChange = (e) => {
    if (autoResize) {
      e.target.style.height = 'auto'
      e.target.style.height = `${e.target.scrollHeight}px`
    }
    
    onChange?.(e)
  }

  // Calcular caracteres restantes
  const charCount = value.length
  const charRemaining = maxLength ? maxLength - charCount : null
  const isNearLimit = maxLength && charCount > maxLength * 0.8

  return (
    <FormField error={error} {...props}>
      <div className="textarea-container">
        <textarea
          className={textareaClassName}
          rows={rows}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          {...props}
        />

        {/* Contador de caracteres */}
        {(showCharCount || maxLength) && (
          <div className="flex justify-between items-center mt-1 text-xs">
            {showCharCount && (
              <span className="text-gray-500">
                {charCount} caracteres
              </span>
            )}
            
            {maxLength && (
              <span 
                className={`
                  ${isNearLimit ? 'text-orange-600' : 'text-gray-500'}
                  ${charCount > maxLength ? 'text-red-600 font-medium' : ''}
                `}
              >
                {charRemaining >= 0 ? charRemaining : 0} restantes
              </span>
            )}
          </div>
        )}
      </div>
    </FormField>
  )
}

// Variação para descrições de projeto/tarefa
export const DescriptionTextarea = ({ value, onChange, ...props }) => {
  return (
    <FormTextarea
      value={value}
      onChange={onChange}
      rows={3}
      maxLength={500}
      showCharCount={true}
      autoResize={true}
      placeholder="Descreva o projeto, objetivos e informações importantes..."
      {...props}
    />
  )
}

// Variação para comentários
export const CommentTextarea = ({ value, onChange, ...props }) => {
  return (
    <FormTextarea
      value={value}
      onChange={onChange}
      rows={2}
      maxLength={1000}
      autoResize={true}
      placeholder="Escreva seu comentário..."
      {...props}
    />
  )
}

export default FormTextarea