import React from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

/**
 * Componente Toast para notificações temporárias
 */
export function Toast({ 
  id,
  type = 'info', 
  title, 
  message, 
  icon, 
  duration = 5000,
  closable = true,
  onClose,
  actions = [],
  className = ''
}) {
  const [isVisible, setIsVisible] = React.useState(true)
  const [isLeaving, setIsLeaving] = React.useState(false)

  // Auto-close após duration
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.(id)
    }, 300) // Tempo da animação
  }

  if (!isVisible) return null

  // Configurações por tipo
  const typeConfig = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      textColor: 'text-green-800',
      icon: CheckCircle
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-800',
      icon: AlertCircle
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-800',
      icon: AlertTriangle
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800',
      icon: Info
    }
  }

  const config = typeConfig[type] || typeConfig.info
  const IconComponent = config.icon

  return (
    <div 
      className={`
        ${config.bgColor} ${config.borderColor}
        border rounded-lg p-4 shadow-lg max-w-md w-full
        transform transition-all duration-300 ease-in-out
        ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        ${className}
      `}
      role="alert"
    >
      <div className="flex items-start">
        {/* Ícone */}
        <div className="flex-shrink-0">
          {icon ? (
            <span className="text-lg mr-3">{icon}</span>
          ) : (
            <IconComponent className={`h-5 w-5 ${config.iconColor} mr-3`} />
          )}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`text-sm font-medium ${config.textColor} mb-1`}>
              {title}
            </h4>
          )}
          
          {message && (
            <p className={`text-sm ${config.textColor} break-words`}>
              {message}
            </p>
          )}

          {/* Ações */}
          {actions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`
                    text-sm font-medium px-3 py-1 rounded-md
                    ${action.variant === 'primary' 
                      ? `${config.textColor} hover:bg-white hover:bg-opacity-50` 
                      : `${config.textColor} hover:bg-white hover:bg-opacity-30`
                    }
                    transition-colors duration-200
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botão de fechar */}
        {closable && (
          <div className="flex-shrink-0 ml-4">
            <button
              onClick={handleClose}
              className={`
                ${config.textColor} hover:opacity-75
                transition-opacity duration-200
              `}
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Barra de progresso (opcional) */}
      {duration > 0 && (
        <div className="mt-3 w-full bg-white bg-opacity-30 rounded-full h-1">
          <div 
            className={`h-1 ${config.iconColor.replace('text-', 'bg-')} rounded-full`}
            style={{
              animation: `toast-progress ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  )
}

/**
 * Container para múltiplos toasts
 */
export function ToastContainer({ toasts = [], position = 'top-right', className = '' }) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  }

  return (
    <div 
      className={`
        fixed z-50 pointer-events-none
        ${positionClasses[position] || positionClasses['top-right']}
        ${className}
      `}
    >
      <div className="space-y-2 pointer-events-auto">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </div>
  )
}

export default Toast

// CSS adicional necessário (adicionar ao globals.css)
const styles = `
@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
`