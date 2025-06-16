import React from 'react'
import { Bell, BellRing } from 'lucide-react'

/**
 * Badge de notificações para exibir contador de não lidas
 */
export function NotificationBadge({ 
  count = 0, 
  onClick, 
  size = 'md',
  showZero = false,
  animated = true,
  className = '',
  ...props 
}) {
  const hasNotifications = count > 0

  // Configurações por tamanho
  const sizeConfig = {
    sm: {
      icon: 'h-4 w-4',
      badge: 'h-4 w-4 text-xs min-w-[1rem]',
      container: 'p-1'
    },
    md: {
      icon: 'h-5 w-5',
      badge: 'h-5 w-5 text-xs min-w-[1.25rem]',
      container: 'p-2'
    },
    lg: {
      icon: 'h-6 w-6',
      badge: 'h-6 w-6 text-sm min-w-[1.5rem]',
      container: 'p-2'
    }
  }

  const config = sizeConfig[size] || sizeConfig.md

  // Limitar exibição do número
  const displayCount = count > 99 ? '99+' : count.toString()

  return (
    <div className="relative inline-flex">
      <button
        onClick={onClick}
        className={`
          relative rounded-lg transition-all duration-200
          ${config.container}
          ${hasNotifications 
            ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' 
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${className}
        `}
        aria-label={`Notificações${hasNotifications ? ` (${count} não lidas)` : ''}`}
        {...props}
      >
        {/* Ícone do sino */}
        {hasNotifications ? (
          <BellRing 
            className={`
              ${config.icon}
              ${animated ? 'animate-pulse' : ''}
            `} 
          />
        ) : (
          <Bell className={config.icon} />
        )}

        {/* Badge de contador */}
        {(hasNotifications || showZero) && (
          <span 
            className={`
              absolute -top-1 -right-1 
              ${config.badge}
              bg-red-500 text-white
              rounded-full flex items-center justify-center
              font-medium leading-none
              ${animated && hasNotifications ? 'animate-bounce' : ''}
              transition-all duration-200
            `}
            style={{
              animation: animated && hasNotifications 
                ? 'notification-pop 0.6s ease-out' 
                : 'none'
            }}
          >
            {displayCount}
          </span>
        )}

        {/* Indicador de pulse para novas notificações */}
        {hasNotifications && animated && (
          <span className="absolute -top-1 -right-1 h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          </span>
        )}
      </button>
    </div>
  )
}

/**
 * Badge simples de notificação (apenas número)
 */
export function SimpleBadge({ 
  count = 0, 
  size = 'sm',
  color = 'red',
  showZero = false,
  className = '' 
}) {
  if (!showZero && count === 0) return null

  const sizeClasses = {
    xs: 'h-3 w-3 text-xs',
    sm: 'h-4 w-4 text-xs',
    md: 'h-5 w-5 text-sm',
    lg: 'h-6 w-6 text-sm'
  }

  const colorClasses = {
    red: 'bg-red-500 text-white',
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    yellow: 'bg-yellow-500 text-black',
    gray: 'bg-gray-500 text-white'
  }

  const displayCount = count > 99 ? '99+' : count.toString()

  return (
    <span 
      className={`
        inline-flex items-center justify-center
        ${sizeClasses[size] || sizeClasses.sm}
        ${colorClasses[color] || colorClasses.red}
        rounded-full font-medium leading-none
        min-w-max px-1
        ${className}
      `}
    >
      {displayCount}
    </span>
  )
}

/**
 * Badge de status (online/offline)
 */
export function StatusBadge({ 
  online = false, 
  size = 'sm',
  showLabel = false,
  className = '' 
}) {
  const sizeClasses = {
    xs: 'h-2 w-2',
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span 
        className={`
          rounded-full flex-shrink-0
          ${sizeClasses[size] || sizeClasses.sm}
          ${online 
            ? 'bg-green-400 animate-pulse' 
            : 'bg-gray-300'
          }
        `}
        aria-label={online ? 'Online' : 'Offline'}
      />
      
      {showLabel && (
        <span className="text-sm text-gray-600">
          {online ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  )
}

export default NotificationBadge

// CSS adicional necessário (adicionar ao globals.css)
const styles = `
@keyframes notification-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
`