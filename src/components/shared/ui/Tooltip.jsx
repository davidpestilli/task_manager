import React, { useState, useRef, useEffect } from 'react'

/**
 * Componente Tooltip reutilizável
 * 
 * Fornece tooltip acessível com posicionamento automático
 * e delay configurável
 */
const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 500,
  className = '',
  contentClassName = '',
  disabled = false,
  trigger = 'hover', // hover, click, focus
  offset = 8,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState(null)
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)

  // Posições disponíveis
  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2',
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2'
  }

  // Setas do tooltip
  const arrows = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900',
    'top-left': 'top-full left-4 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
    'top-right': 'top-full right-4 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
    'bottom-left': 'bottom-full left-4 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
    'bottom-right': 'bottom-full right-4 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900'
  }

  const showTooltip = () => {
    if (disabled || !content) return

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    const id = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    setTimeoutId(id)
  }

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(false)
  }

  const toggleTooltip = () => {
    if (isVisible) {
      hideTooltip()
    } else {
      showTooltip()
    }
  }

  // Limpar timeout na desmontagem
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  // Fechar tooltip ao clicar fora (para trigger click)
  useEffect(() => {
    if (trigger !== 'click' || !isVisible) return

    const handleClickOutside = (event) => {
      if (
        triggerRef.current && 
        !triggerRef.current.contains(event.target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target)
      ) {
        hideTooltip()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [trigger, isVisible])

  // Event handlers baseados no trigger
  const getEventHandlers = () => {
    if (disabled) return {}

    switch (trigger) {
      case 'hover':
        return {
          onMouseEnter: showTooltip,
          onMouseLeave: hideTooltip
        }
      case 'click':
        return {
          onClick: toggleTooltip
        }
      case 'focus':
        return {
          onFocus: showTooltip,
          onBlur: hideTooltip
        }
      default:
        return {}
    }
  }

  if (!content) {
    return children
  }

  return (
    <div
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      {...getEventHandlers()}
      {...props}
    >
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`
            absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg
            whitespace-nowrap pointer-events-none
            transition-opacity duration-200
            ${positions[position]}
            ${contentClassName}
          `}
          style={{ 
            marginTop: offset, 
            marginBottom: offset,
            marginLeft: offset,
            marginRight: offset
          }}
          role="tooltip"
        >
          {content}
          
          {/* Seta do tooltip */}
          <div
            className={`
              absolute w-0 h-0 border-4
              ${arrows[position]}
            `}
          />
        </div>
      )}
    </div>
  )
}

/**
 * Tooltip com conteúdo HTML
 */
export const HtmlTooltip = ({
  children,
  content,
  maxWidth = 'max-w-xs',
  ...props
}) => (
  <Tooltip
    content={content}
    contentClassName={`
      whitespace-normal ${maxWidth} text-left
      bg-white text-gray-900 border border-gray-200 shadow-lg
    `}
    {...props}
  >
    {children}
  </Tooltip>
)

/**
 * Tooltip de ajuda com ícone de interrogação
 */
export const HelpTooltip = ({
  content,
  iconSize = 'w-4 h-4',
  iconClassName = 'text-gray-400 hover:text-gray-600',
  ...props
}) => (
  <Tooltip content={content} {...props}>
    <svg
      className={`${iconSize} ${iconClassName} cursor-help`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  </Tooltip>
)

/**
 * Tooltip de status com ícone colorido
 */
export const StatusTooltip = ({
  children,
  status,
  content,
  statusColors = {
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    info: 'text-blue-500'
  },
  ...props
}) => (
  <Tooltip content={content} {...props}>
    <div className="flex items-center space-x-1">
      <div className={`w-2 h-2 rounded-full bg-current ${statusColors[status]}`} />
      {children}
    </div>
  </Tooltip>
)

/**
 * Tooltip com delay personalizado para diferentes ações
 */
export const ActionTooltip = ({
  children,
  content,
  action = 'view', // view, edit, delete, etc.
  shortcuts,
  ...props
}) => {
  const actionDelays = {
    view: 300,
    edit: 500,
    delete: 800,
    create: 400
  }

  const tooltipContent = (
    <div>
      <div>{content}</div>
      {shortcuts && (
        <div className="text-xs opacity-75 mt-1">
          {shortcuts}
        </div>
      )}
    </div>
  )

  return (
    <Tooltip
      content={tooltipContent}
      delay={actionDelays[action] || 500}
      {...props}
    >
      {children}
    </Tooltip>
  )
}

export default Tooltip