import React from 'react'
import { cn } from '@/utils/helpers'

/**
 * Componente Button reutilizável com múltiplas variantes
 */
const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  type = 'button',
  onClick,
  ...props
}, ref) => {
  // Variantes de estilo
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300',
    outline: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
    success: 'bg-green-600 hover:bg-green-700 text-white border-transparent'
  }

  // Tamanhos
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }

  // Classes base
  const baseClasses = cn(
    // Layout e aparência base
    'inline-flex items-center justify-center',
    'font-medium rounded-md border',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    
    // Estados
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'disabled:hover:bg-current disabled:hover:text-current',
    
    // Variante
    variants[variant],
    
    // Tamanho
    sizes[size],
    
    // Largura total
    fullWidth && 'w-full',
    
    // Classes customizadas
    className
  )

  // Handler de clique com proteção contra múltiplos cliques
  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }

  return (
    <button
      ref={ref}
      type={type}
      className={baseClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {/* Ícone da esquerda */}
      {leftIcon && !loading && (
        <span className="mr-2 -ml-0.5">
          {leftIcon}
        </span>
      )}
      
      {/* Spinner de loading */}
      {loading && (
        <span className="mr-2 -ml-0.5">
          <LoadingSpinner size={size} />
        </span>
      )}
      
      {/* Conteúdo do botão */}
      <span>{children}</span>
      
      {/* Ícone da direita */}
      {rightIcon && !loading && (
        <span className="ml-2 -mr-0.5">
          {rightIcon}
        </span>
      )}
    </button>
  )
})

// Componente de loading spinner
const LoadingSpinner = ({ size }) => {
  const spinnerSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  }

  return (
    <svg 
      className={cn('animate-spin', spinnerSizes[size])} 
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

Button.displayName = 'Button'

// Variantes como componentes separados para conveniência
export const PrimaryButton = (props) => <Button variant="primary" {...props} />
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />
export const OutlineButton = (props) => <Button variant="outline" {...props} />
export const GhostButton = (props) => <Button variant="ghost" {...props} />
export const DangerButton = (props) => <Button variant="danger" {...props} />
export const SuccessButton = (props) => <Button variant="success" {...props} />

export default Button