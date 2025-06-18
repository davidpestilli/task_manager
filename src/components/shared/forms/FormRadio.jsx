import React from 'react'
import { cn } from '@/utils/helpers'

/**
 * Componente FormRadio - Radio button customizado para formulários
 * 
 * @param {Object} props
 * @param {string} props.label - Label do radio button
 * @param {string} props.description - Descrição opcional
 * @param {boolean} props.checked - Estado do radio button
 * @param {Function} props.onChange - Callback de mudança
 * @param {boolean} props.disabled - Se o radio button está desabilitado
 * @param {string} props.size - Tamanho do radio button (sm, md, lg)
 * @param {string} props.error - Mensagem de erro
 * @param {string} props.className - Classes CSS adicionais
 * @param {string} props.name - Nome do campo
 * @param {string} props.value - Valor do radio button
 * @param {boolean} props.required - Se o campo é obrigatório
 */
const FormRadio = ({
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
    if (onChange && e.target.checked) {
      onChange(e.target.value, e)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={`${name}-${value}`}
            name={name}
            type="radio"
            value={value}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            className={cn(
              // Base styles
              'border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500',
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
              description ? `${name}-${value}-description` : error ? `${name}-error` : undefined
            }
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          />
        </div>
        
        <div className="ml-3 text-sm">
          {label && (
            <label
              htmlFor={`${name}-${value}`}
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
              id={`${name}-${value}-description`}
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
    </div>
  )
}

/**
 * Componente FormRadioGroup - Grupo de radio buttons
 * 
 * @param {Object} props
 * @param {string} props.label - Label do grupo
 * @param {Array} props.options - Array de opções
 * @param {string} props.value - Valor selecionado
 * @param {Function} props.onChange - Callback de mudança
 * @param {string} props.name - Nome do grupo
 * @param {boolean} props.disabled - Se o grupo está desabilitado
 * @param {string} props.error - Mensagem de erro
 * @param {boolean} props.required - Se o campo é obrigatório
 * @param {string} props.direction - Direção do layout (vertical, horizontal)
 * @param {string} props.size - Tamanho dos radio buttons
 */
export const FormRadioGroup = ({
  label,
  options = [],
  value,
  onChange,
  name,
  disabled = false,
  error,
  required = false,
  direction = 'vertical',
  size = 'md',
  className,
  ...props
}) => {
  const handleOptionChange = (optionValue) => {
    if (onChange) {
      onChange(optionValue)
    }
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
        role="radiogroup"
        aria-labelledby={label ? `${name}-label` : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-required={required}
      >
        {options.map((option, index) => {
          const optionValue = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? option : option.label
          const optionDescription = typeof option === 'object' ? option.description : undefined
          const optionDisabled = disabled || (typeof option === 'object' && option.disabled) || false
          
          return (
            <FormRadio
              key={optionValue || index}
              name={name}
              value={optionValue}
              label={optionLabel}
              description={optionDescription}
              checked={value === optionValue}
              onChange={handleOptionChange}
              disabled={optionDisabled}
              size={size}
              error={error}
              required={required}
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

/**
 * Componente FormRadioCard - Radio button em formato de card
 * Útil para opções mais complexas com mais informações
 */
export const FormRadioCard = ({
  label,
  description,
  icon: Icon,
  checked = false,
  onChange,
  disabled = false,
  name,
  value,
  className,
  ...props
}) => {
  const handleChange = (e) => {
    if (onChange && e.target.checked) {
      onChange(e.target.value, e)
    }
  }

  return (
    <label
      className={cn(
        'relative block cursor-pointer rounded-lg border p-4 focus:outline-none',
        {
          'border-blue-200 bg-blue-50 ring-1 ring-blue-500': checked,
          'border-gray-300 bg-white hover:bg-gray-50': !checked && !disabled,
          'border-gray-200 bg-gray-50 cursor-not-allowed': disabled
        },
        className
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      
      <div className="flex items-start">
        {Icon && (
          <Icon
            className={cn(
              'h-5 w-5 mt-0.5 mr-3',
              {
                'text-blue-600': checked,
                'text-gray-400': !checked && !disabled,
                'text-gray-300': disabled
              }
            )}
          />
        )}
        
        <div className="flex-1">
          <div
            className={cn(
              'text-sm font-medium',
              {
                'text-blue-900': checked,
                'text-gray-900': !checked && !disabled,
                'text-gray-500': disabled
              }
            )}
          >
            {label}
          </div>
          
          {description && (
            <div
              className={cn(
                'text-sm mt-1',
                {
                  'text-blue-700': checked,
                  'text-gray-500': !checked && !disabled,
                  'text-gray-400': disabled
                }
              )}
            >
              {description}
            </div>
          )}
        </div>
        
        {/* Indicador visual de seleção */}
        <div
          className={cn(
            'h-4 w-4 rounded-full border flex items-center justify-center',
            {
              'border-blue-600 bg-blue-600': checked,
              'border-gray-300': !checked && !disabled,
              'border-gray-200': disabled
            }
          )}
        >
          {checked && (
            <div className="h-2 w-2 rounded-full bg-white" />
          )}
        </div>
      </div>
    </label>
  )
}

export default FormRadio