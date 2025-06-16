import React from 'react'
import { Input } from '@/components/shared/ui'

/**
 * Componente de campo de formulário reutilizável
 * Wrapper para Input com label, erro e estilos consistentes
 */
export const FormField = ({
  label,
  error,
  required = false,
  hint,
  className = '',
  labelClassName = '',
  children,
  ...props
}) => {
  const fieldId = props.id || props.name

  return (
    <div className={`form-field ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={fieldId}
          className={`
            block text-sm font-medium text-gray-700 mb-1
            ${required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}
            ${labelClassName}
          `}
        >
          {label}
        </label>
      )}

      {/* Campo */}
      <div className="field-container">
        {children || (
          <Input
            id={fieldId}
            error={!!error}
            {...props}
          />
        )}
      </div>

      {/* Texto de ajuda */}
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-500">
          {hint}
        </p>
      )}

      {/* Mensagem de erro */}
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <svg 
            className="w-3 h-3 mr-1 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField