import React, { useState } from 'react'
import { cn } from '@/utils/helpers'

/**
 * Componente Input reutilizável com validação e estados
 */
const Input = React.forwardRef(({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  leftIcon,
  rightIcon,
  leftElement,
  rightElement,
  size = 'md',
  fullWidth = true,
  autoComplete,
  id,
  name,
  className,
  containerClassName,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Tamanhos
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  }

  // Estados visuais
  const getInputClasses = () => {
    return cn(
      // Base
      'block w-full rounded-md border transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      
      // Tamanho
      sizes[size],
      
      // Estados normais
      !error && !isFocused && 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      !error && isFocused && 'border-blue-500 ring-blue-500',
      
      // Estado de erro
      error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
      
      // Estados especiais
      disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
      readOnly && 'bg-gray-50',
      
      // Ajustes para ícones/elementos
      (leftIcon || leftElement) && 'pl-10',
      (rightIcon || rightElement) && 'pr-10',
      
      // Classes customizadas
      className
    )
  }

  // Handlers
  const handleFocus = (e) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Determinar tipo do input
  const inputType = type === 'password' && showPassword ? 'text' : type

  // ID único se não fornecido
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={cn('', fullWidth && 'w-full', containerClassName)}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium mb-1',
            error ? 'text-red-700' : 'text-gray-700'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Container do input */}
      <div className="relative">
        {/* Elemento/ícone da esquerda */}
        {(leftIcon || leftElement) && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftElement || (
              <span className={cn('text-gray-400', error && 'text-red-400')}>
                {leftIcon}
              </span>
            )}
          </div>
        )}

        {/* Input principal */}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete={autoComplete}
          className={getInputClasses()}
          {...props}
        />

        {/* Elemento/ícone da direita */}
        {(rightIcon || rightElement || type === 'password') && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {/* Botão de toggle de senha */}
            {type === 'password' && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            )}
            
            {/* Elemento customizado da direita */}
            {rightElement || (rightIcon && type !== 'password' && (
              <span className={cn('text-gray-400', error && 'text-red-400')}>
                {rightIcon}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Texto de ajuda ou erro */}
      {(error || helperText) && (
        <p className={cn(
          'mt-1 text-sm',
          error ? 'text-red-600' : 'text-gray-500'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

// Ícones para password toggle
const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
)

Input.displayName = 'Input'

// Variantes especializadas
export const PasswordInput = (props) => <Input type="password" {...props} />
export const EmailInput = (props) => <Input type="email" autoComplete="email" {...props} />
export const SearchInput = (props) => <Input type="search" {...props} />

export default Input