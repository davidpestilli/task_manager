import React from 'react'

/**
 * Componente Badge reutilizável
 * 
 * Fornece badges coloridos para status, categorias
 * e outras informações visuais
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'medium',
  className = '',
  rounded = true,
  ...props
}) => {
  // Variantes de cores
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-600',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-cyan-100 text-cyan-800',
    
    // Variantes para status de tarefas
    'não_iniciada': 'bg-gray-100 text-gray-800',
    'em_andamento': 'bg-blue-100 text-blue-800',
    'pausada': 'bg-yellow-100 text-yellow-800',
    'concluída': 'bg-green-100 text-green-800',
    
    // Variantes sólidas
    solidDefault: 'bg-gray-600 text-white',
    solidPrimary: 'bg-blue-600 text-white',
    solidSecondary: 'bg-gray-500 text-white',
    solidSuccess: 'bg-green-600 text-white',
    solidWarning: 'bg-yellow-600 text-white',
    solidDanger: 'bg-red-600 text-white',
    solidInfo: 'bg-cyan-600 text-white',

    // Variantes outline
    outlineDefault: 'border border-gray-300 text-gray-700',
    outlinePrimary: 'border border-blue-300 text-blue-700',
    outlineSecondary: 'border border-gray-300 text-gray-500',
    outlineSuccess: 'border border-green-300 text-green-700',
    outlineWarning: 'border border-yellow-300 text-yellow-700',
    outlineDanger: 'border border-red-300 text-red-700',
    outlineInfo: 'border border-cyan-300 text-cyan-700'
  }

  // Tamanhos
  const sizes = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-2.5 py-1 text-sm',
    large: 'px-3 py-1.5 text-base'
  }

  return (
    <span
      className={`
        inline-flex items-center font-medium
        ${variants[variant] || variants.default}
        ${sizes[size]}
        ${rounded ? 'rounded-full' : 'rounded'}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  )
}

/**
 * Badge com ícone à esquerda
 */
export const BadgeWithIcon = ({
  children,
  icon: Icon,
  iconSize = 'w-3 h-3',
  ...props
}) => (
  <Badge {...props}>
    <div className="flex items-center space-x-1">
      {Icon && <Icon className={`${iconSize} mr-1`} />}
      <span>{children}</span>
    </div>
  </Badge>
)

/**
 * Badge com ponto colorido
 */
export const BadgeWithDot = ({
  children,
  dotColor = 'bg-gray-400',
  ...props
}) => (
  <Badge {...props}>
    <div className="flex items-center space-x-1.5">
      <div className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span>{children}</span>
    </div>
  </Badge>
)

/**
 * Badge contador
 */
export const CounterBadge = ({
  count,
  maxCount = 99,
  showZero = false,
  variant = 'danger',
  size = 'small',
  ...props
}) => {
  // Não mostrar se count é 0 e showZero é false
  if (count === 0 && !showZero) return null

  const displayCount = count > maxCount ? `${maxCount}+` : count

  return (
    <Badge variant={variant} size={size} {...props}>
      {displayCount}
    </Badge>
  )
}

/**
 * Badge de status para tarefas
 */
export const TaskStatusBadge = ({ status, ...props }) => {
  const statusLabels = {
    'não_iniciada': 'Não Iniciada',
    'em_andamento': 'Em Andamento',
    'pausada': 'Pausada',
    'concluída': 'Concluída'
  }

  return (
    <Badge variant={status} {...props}>
      {statusLabels[status] || status}
    </Badge>
  )
}

/**
 * Badge de prioridade
 */
export const PriorityBadge = ({ priority, ...props }) => {
  const priorityConfig = {
    baixa: { variant: 'success', label: 'Baixa' },
    media: { variant: 'warning', label: 'Média' },
    alta: { variant: 'danger', label: 'Alta' },
    urgente: { variant: 'solidDanger', label: 'Urgente' }
  }

  const config = priorityConfig[priority] || priorityConfig.media

  return (
    <Badge variant={config.variant} {...props}>
      {config.label}
    </Badge>
  )
}

/**
 * Badge de progresso
 */
export const ProgressBadge = ({ 
  percentage, 
  showPercentage = true,
  ...props 
}) => {
  let variant = 'default'
  
  if (percentage >= 100) variant = 'success'
  else if (percentage >= 75) variant = 'primary'
  else if (percentage >= 50) variant = 'warning'
  else if (percentage > 0) variant = 'info'

  return (
    <Badge variant={variant} {...props}>
      {showPercentage ? `${percentage}%` : 'Em progresso'}
    </Badge>
  )
}

/**
 * Badge removível
 */
export const RemovableBadge = ({
  children,
  onRemove,
  removeLabel = 'Remover',
  ...props
}) => (
  <Badge {...props}>
    <div className="flex items-center space-x-1">
      <span>{children}</span>
      <button
        type="button"
        onClick={onRemove}
        className="
          ml-1 text-current opacity-70 hover:opacity-100
          focus:outline-none focus:opacity-100
        "
        aria-label={removeLabel}
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  </Badge>
)

export default Badge