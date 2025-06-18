import React from 'react'
import { cn } from '@/utils/helpers'

/**
 * Componente FormCheckbox - Checkbox customizado para formulários
 * 
 * @param {Object} props
 * @param {string} props.label - Label do checkbox
 * @param {string} props.description - Descrição opcional
 * @param {boolean} props.checked - Estado do checkbox
 * @param {Function} props.onChange - Callback de mudança
 * @param {boolean} props.disabled - Se o checkbox está desabilitado
 * @param {string} props.size - Tamanho do checkbox (sm, md, lg)
 * @param {string} props.error - Mensagem de erro
 * @param {string} props.className - Classes CSS adicionais
 * @param {string} props.name - Nome do campo
 * @param {string} props.value - Valor do checkbox
 * @param {boolean} props.required - Se o campo é obrigatório
 */
const FormCheckbox = ({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  error,
  className,
  name,
  value,
  required = false,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const labelSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.checked, e)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={name}
            name={name}
            type="checkbox"
            value={value}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            className={cn(
              // Base styles
              'rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500',
              // Size variants
              sizeClasses[size],
              // States
              {
                'bg-gray-100 cursor-not-allowed': disabled,
                'border-red-300 text-red-600 focus:ring-red-500': error,
                'cursor-pointer': !disabled
              }
            )}
            aria-describedby={
              description ? `${name}-description` : error ? `${name}-error` : undefined
            }
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          />
        </div>
        
        <div className="ml-3 text-sm">
          {label && (
            <label
              htmlFor={name}
              className={cn(
                'font-medium text-gray-700',
                labelSizeClasses[size],
                {
                  'text-gray-400 cursor-not-allowed': disabled,
                  'cursor-pointer': !disabled,
                  'text-red-700': error
                }
              )}
            >
              {label}
              {required && (
                <span className="ml-1 text-red-500" aria-label="Campo obrigatório">
                  *
                </span>
              )}
            </label>
          )}
          
          {description && (
            <p
              id={`${name}-description`}
              className={cn(
                'text-gray-500 mt-1',
                {
                  'text-xs': size === 'sm',
                  'text-sm': size === 'md',
                  'text-base': size === 'lg',
                  'text-gray-400': disabled
                }
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      
      {error && (
        <p
          id={`${name}-error`}
          className="mt-2 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Componente FormCheckboxGroup - Grupo de checkboxes
 * 
 * @param {Object} props
 * @param {string} props.label - Label do grupo
 * @param {Array} props.options - Array de opções
 * @param {Array} props.value - Array de valores selecionados
 * @param {Function} props.onChange - Callback de mudança
 * @param {string} props.name - Nome do grupo
 * @param {boolean} props.disabled - Se o grupo está desabilitado
 * @param {string} props.error - Mensagem de erro
 * @param {boolean} props.required - Se o campo é obrigatório
 * @param {string} props.direction - Direção do layout (vertical, horizontal)
 */
export const FormCheckboxGroup = ({
  label,
  options = [],
  value = [],
  onChange,
  name,
  disabled = false,
  error,
  required = false,
  direction = 'vertical',
  className,
  ...props
}) => {
  const handleOptionChange = (optionValue, checked) => {
    if (!onChange) return

    let newValue
    if (checked) {
      newValue = [...value, optionValue]
    } else {
      newValue = value.filter(v => v !== optionValue)
    }
    
    onChange(newValue)
  }

  return (
    <fieldset className={cn('space-y-3', className)}>
      {label && (
        <legend className="text-base font-medium text-gray-700">
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-label="Campo obrigatório">
              *
            </span>
          )}
        </legend>
      )}
      
      <div
        className={cn({
          'space-y-3': direction === 'vertical',
          'flex flex-wrap gap-4': direction === 'horizontal'
        })}
        role="group"
        aria-labelledby={label ? `${name}-label` : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        {options.map((option, index) => {
          const optionValue = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? option : option.label
          const optionDisabled = disabled || (option.disabled || false)
          
          return (
            <FormCheckbox
              key={optionValue || index}
              name={`${name}-${index}`}
              value={optionValue}
              label={optionLabel}
              checked={value.includes(optionValue)}
              onChange={(checked) => handleOptionChange(optionValue, checked)}
              disabled={optionDisabled}
              {...props}
            />
          )
        })}
      </div>
      
      {error && (
        <p
          id={`${name}-error`}
          className="mt-2 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </fieldset>
  )
}

export default FormCheckbox