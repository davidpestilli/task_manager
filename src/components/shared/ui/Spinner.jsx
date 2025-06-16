import React from 'react'
import { cn } from '@/utils/helpers'

/**
 * Componente Spinner para indicação de loading
 */
const Spinner = ({
  size = 'md',
  color = 'primary',
  variant = 'circular',
  className,
  text,
  overlay = false,
  ...props
}) => {
  // Tamanhos do spinner
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  // Cores do spinner
  const colors = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    white: 'text-white'
  }

  // Renderizar spinner circular
  const CircularSpinner = () => (
    <svg 
      className={cn(
        'animate-spin',
        sizes[size],
        colors[color],
        className
      )}
      viewBox="0 0 24 24"
      {...props}
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

  // Renderizar spinner de dots
  const DotsSpinner = () => (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-pulse',
            colors[color],
            sizes[size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md'],
            'bg-current'
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  )

  // Renderizar spinner de barras
  const BarsSpinner = () => (
    <div className={cn('flex space-x-0.5', className)}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse bg-current',
            colors[color],
            'w-1',
            size === 'xs' && 'h-3',
            size === 'sm' && 'h-4',
            size === 'md' && 'h-6',
            size === 'lg' && 'h-8',
            size === 'xl' && 'h-12'
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1.2s'
          }}
        />
      ))}
    </div>
  )

  // Renderizar spinner de pulso
  const PulseSpinner = () => (
    <div
      className={cn(
        'rounded-full animate-ping bg-current',
        sizes[size],
        colors[color],
        className
      )}
    />
  )

  // Escolher tipo de spinner
  const SpinnerComponent = () => {
    switch (variant) {
      case 'dots':
        return <DotsSpinner />
      case 'bars':
        return <BarsSpinner />
      case 'pulse':
        return <PulseSpinner />
      default:
        return <CircularSpinner />
    }
  }

  // Spinner simples
  if (!text && !overlay) {
    return <SpinnerComponent />
  }

  // Spinner com texto
  if (text && !overlay) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <SpinnerComponent />
        <span className={cn('text-sm', colors[color])}>
          {text}
        </span>
      </div>
    )
  }

  // Spinner com overlay
  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
          <SpinnerComponent />
          {text && (
            <span className={cn('text-sm font-medium', colors[color])}>
              {text}
            </span>
          )}
        </div>
      </div>
    )
  }

  return <SpinnerComponent />
}

/**
 * Componente FullPageSpinner para loading de página
 */
export const FullPageSpinner = ({ text = 'Carregando...', ...props }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Spinner size="xl" {...props} />
      <p className="mt-4 text-gray-600 text-lg">{text}</p>
    </div>
  </div>
)

/**
 * Componente InlineSpinner para loading inline
 */
export const InlineSpinner = ({ text, className, ...props }) => (
  <div className={cn('flex items-center space-x-2', className)}>
    <Spinner size="sm" {...props} />
    {text && <span className="text-sm text-gray-600">{text}</span>}
  </div>
)

/**
 * Componente ButtonSpinner para botões
 */
export const ButtonSpinner = ({ size = 'sm', ...props }) => (
  <Spinner size={size} color="white" {...props} />
)

/**
 * HOC para adicionar loading a componentes
 */
export const withSpinner = (Component, spinnerProps = {}) => {
  return ({ loading, ...props }) => {
    if (loading) {
      return <Spinner {...spinnerProps} />
    }
    return <Component {...props} />
  }
}

Spinner.displayName = 'Spinner'

export default Spinner