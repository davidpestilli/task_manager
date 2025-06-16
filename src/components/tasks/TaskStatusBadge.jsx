import React from 'react'
import { Badge } from '@/components/shared/ui'

/**
 * Componente para exibir badge de status da tarefa
 * @param {Object} props
 * @param {string} props.status - Status da tarefa
 * @param {string} props.size - Tamanho do badge ('sm', 'md', 'lg')
 * @param {boolean} props.showIcon - Se deve mostrar ícone
 * @param {string} props.className - Classes CSS adicionais
 */
const TaskStatusBadge = ({ 
  status, 
  size = 'md', 
  showIcon = true, 
  className = '' 
}) => {
  // Configurações para cada status
  const statusConfig = {
    'não_iniciada': {
      label: 'Não Iniciada',
      color: 'gray',
      icon: '⏸️',
      bgClass: 'bg-gray-100 text-gray-800 border-gray-200',
      iconClass: 'text-gray-500'
    },
    'em_andamento': {
      label: 'Em Andamento',
      color: 'blue',
      icon: '🔄',
      bgClass: 'bg-blue-100 text-blue-800 border-blue-200',
      iconClass: 'text-blue-500'
    },
    'pausada': {
      label: 'Pausada',
      color: 'yellow',
      icon: '⏸️',
      bgClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      iconClass: 'text-yellow-500'
    },
    'concluída': {
      label: 'Concluída',
      color: 'green',
      icon: '✅',
      bgClass: 'bg-green-100 text-green-800 border-green-200',
      iconClass: 'text-green-500'
    }
  }

  // Configuração do status atual
  const config = statusConfig[status] || statusConfig['não_iniciada']

  // Classes de tamanho
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-base px-3 py-2'
  }

  return (
    <Badge
      variant={config.color}
      size={size}
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full border
        ${config.bgClass}
        ${sizeClasses[size]}
        ${className}
      `}
      aria-label={`Status: ${config.label}`}
    >
      {showIcon && (
        <span 
          className={`${config.iconClass} ${size === 'sm' ? 'text-xs' : 'text-sm'}`}
          aria-hidden="true"
        >
          {config.icon}
        </span>
      )}
      <span className="font-medium">
        {config.label}
      </span>
    </Badge>
  )
}

/**
 * Componente para selecionar status da tarefa
 */
export const TaskStatusSelector = ({ 
  currentStatus, 
  onStatusChange, 
  disabled = false,
  className = ''
}) => {
  const statuses = [
    'não_iniciada',
    'em_andamento', 
    'pausada',
    'concluída'
  ]

  const statusConfig = {
    'não_iniciada': { label: 'Não Iniciada', color: 'gray' },
    'em_andamento': { label: 'Em Andamento', color: 'blue' },
    'pausada': { label: 'Pausada', color: 'yellow' },
    'concluída': { label: 'Concluída', color: 'green' }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Status da Tarefa
      </label>
      <div className="grid grid-cols-2 gap-2">
        {statuses.map(status => (
          <button
            key={status}
            type="button"
            disabled={disabled}
            onClick={() => onStatusChange?.(status)}
            className={`
              p-3 rounded-lg border-2 transition-all duration-200
              ${currentStatus === status 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
              }
              ${disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'cursor-pointer hover:shadow-sm'
              }
            `}
          >
            <TaskStatusBadge 
              status={status} 
              size="sm" 
              className="w-full justify-center"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Hook para obter configuração de status
 */
export const useTaskStatusConfig = (status) => {
  const statusConfig = {
    'não_iniciada': {
      label: 'Não Iniciada',
      color: 'gray',
      icon: '⏸️',
      canEdit: true,
      nextStatuses: ['em_andamento']
    },
    'em_andamento': {
      label: 'Em Andamento',
      color: 'blue',
      icon: '🔄',
      canEdit: true,
      nextStatuses: ['pausada', 'concluída']
    },
    'pausada': {
      label: 'Pausada',
      color: 'yellow',
      icon: '⏸️',
      canEdit: true,
      nextStatuses: ['em_andamento']
    },
    'concluída': {
      label: 'Concluída',
      color: 'green',
      icon: '✅',
      canEdit: false,
      nextStatuses: []
    }
  }

  return statusConfig[status] || statusConfig['não_iniciada']
}

/**
 * Componente para transição rápida de status
 */
export const TaskStatusTransition = ({ 
  currentStatus, 
  onStatusChange, 
  disabled = false 
}) => {
  const config = useTaskStatusConfig(currentStatus)

  if (config.nextStatuses.length === 0) {
    return null
  }

  return (
    <div className="flex gap-2">
      {config.nextStatuses.map(nextStatus => {
        const nextConfig = useTaskStatusConfig(nextStatus)
        
        return (
          <button
            key={nextStatus}
            type="button"
            disabled={disabled}
            onClick={() => onStatusChange?.(nextStatus)}
            className={`
              inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium
              rounded-md border border-gray-300 bg-white
              hover:bg-gray-50 hover:border-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              transition-colors duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={`Alterar para ${nextConfig.label}`}
          >
            <span>{nextConfig.icon}</span>
            <span>{nextConfig.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default TaskStatusBadge