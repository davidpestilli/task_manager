import React from 'react'
import { cn } from '@/utils/helpers'

/**
 * Componente de barra de progresso reutilizável
 * @param {Object} props - Propriedades do componente
 * @param {number} props.value - Valor do progresso (0-100)
 * @param {number} props.max - Valor máximo (default: 100)
 * @param {string} props.size - Tamanho da barra ('sm', 'md', 'lg')
 * @param {string} props.variant - Variante de cor ('default', 'success', 'warning', 'danger')
 * @param {boolean} props.showLabel - Mostrar label com percentual
 * @param {string} props.label - Label customizada
 * @param {boolean} props.animated - Animação de progresso
 * @param {string} props.className - Classes CSS adicionais
 * @returns {JSX.Element}
 */
export function ProgressBar({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  animated = false,
  className,
  ...props
}) {
  // Garantir que o valor está dentro dos limites
  const normalizedValue = Math.min(Math.max(value, 0), max)
  const percentage = Math.round((normalizedValue / max) * 100)

  // Classes base para diferentes tamanhos
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  // Classes de cor baseadas na variante e valor
  const getVariantClasses = () => {
    if (variant === 'success') return 'bg-green-500'
    if (variant === 'warning') return 'bg-yellow-500'
    if (variant === 'danger') return 'bg-red-500'
    
    // Variante automática baseada no valor
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-blue-500'
    if (percentage >= 40) return 'bg-yellow-500'
    if (percentage >= 20) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // Classes para animação
  const animationClasses = animated 
    ? 'transition-all duration-500 ease-out'
    : 'transition-all duration-200'

  return (
    <div className={cn('w-full', className)}>
      {/* Label opcional */}
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">
            {label || 'Progresso'}
          </span>
          <span className="text-sm text-gray-500">
            {percentage}%
          </span>
        </div>
      )}

      {/* Container da barra */}
      <div 
        className={cn(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
        {...props}
      >
        {/* Barra de progresso */}
        <div
          className={cn(
            'h-full rounded-full transition-all',
            getVariantClasses(),
            animationClasses,
            animated && 'animate-pulse'
          )}
          style={{ 
            width: `${percentage}%`,
            minWidth: percentage > 0 ? '0.25rem' : '0'
          }}
          role="progressbar"
          aria-valuenow={normalizedValue}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || `Progresso: ${percentage}%`}
        />
      </div>

      {/* Indicador numérico adicional para barras pequenas */}
      {size === 'sm' && !showLabel && (
        <div className="text-xs text-gray-500 mt-1">
          {percentage}%
        </div>
      )}
    </div>
  )
}

/**
 * Componente de barra de progresso circular
 * @param {Object} props - Propriedades do componente
 * @param {number} props.value - Valor do progresso (0-100)
 * @param {number} props.size - Tamanho em pixels (default: 40)
 * @param {string} props.strokeWidth - Largura do stroke (default: 4)
 * @param {string} props.variant - Variante de cor
 * @param {boolean} props.showLabel - Mostrar percentual no centro
 * @returns {JSX.Element}
 */
export function CircularProgressBar({
  value = 0,
  size = 40,
  strokeWidth = 4,
  variant = 'default',
  showLabel = true,
  className
}) {
  const normalizedValue = Math.min(Math.max(value, 0), 100)
  const radius = (size - strokeWidth * 2) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference

  // Cores baseadas na variante
  const getStrokeColor = () => {
    if (variant === 'success') return '#10b981'
    if (variant === 'warning') return '#f59e0b'
    if (variant === 'danger') return '#ef4444'
    
    // Cores automáticas
    if (normalizedValue >= 80) return '#10b981'
    if (normalizedValue >= 60) return '#3b82f6'
    if (normalizedValue >= 40) return '#f59e0b'
    if (normalizedValue >= 20) return '#f97316'
    return '#ef4444'
  }

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {/* Label central */}
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-xs font-medium text-gray-700"
            style={{ fontSize: size * 0.25 }}
          >
            {Math.round(normalizedValue)}%
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Componente de múltiplas barras de progresso empilhadas
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.data - Array de objetos {label, value, color}
 * @param {string} props.size - Tamanho da barra
 * @param {boolean} props.showLabels - Mostrar labels
 * @returns {JSX.Element}
 */
export function StackedProgressBar({
  data = [],
  size = 'md',
  showLabels = true,
  className
}) {
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0)
  
  if (total === 0) {
    return (
      <ProgressBar 
        value={0} 
        size={size} 
        className={className}
        showLabel={showLabels}
        label="Sem dados"
      />
    )
  }

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="text-gray-700 font-medium">Total: {total}</span>
          <div className="flex gap-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600 text-xs">
                  {item.label}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barra empilhada */}
      <div className={cn(
        'w-full bg-gray-200 rounded-full overflow-hidden flex',
        sizeClasses[size]
      )}>
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100
          return (
            <div
              key={index}
              className="h-full transition-all duration-300"
              style={{ 
                width: `${percentage}%`,
                backgroundColor: item.color,
                minWidth: percentage > 0 ? '2px' : '0'
              }}
              title={`${item.label}: ${item.value} (${Math.round(percentage)}%)`}
            />
          )
        })}
      </div>
    </div>
  )
}