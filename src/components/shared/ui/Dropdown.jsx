import React, { useState, useRef, useEffect } from 'react'

/**
 * Componente Dropdown reutilizável
 * 
 * Fornece dropdown acessível com posicionamento automático,
 * fechamento por clique fora e navegação por teclado
 */
const Dropdown = ({
  trigger,
  children,
  position = 'bottom-left',
  isOpen: controlledIsOpen,
  onToggle,
  className = '',
  menuClassName = '',
  closeOnClick = true,
  disabled = false,
  offset = 4,
  ...props
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  // Usar estado controlado ou interno
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
  const setIsOpen = onToggle || setInternalIsOpen

  // Posições disponíveis
  const positions = {
    'top-left': 'bottom-full right-0 mb-1',
    'top-right': 'bottom-full left-0 mb-1',
    'bottom-left': 'top-full right-0 mt-1',
    'bottom-right': 'top-full left-0 mt-1',
    'left': 'right-full top-0 mr-1',
    'right': 'left-full top-0 ml-1'
  }

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, setIsOpen])

  // Lidar com teclas de navegação
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, setIsOpen])

  const handleToggle = () => {
    if (disabled) return
    setIsOpen(!isOpen)
  }

  const handleMenuClick = (event) => {
    if (closeOnClick) {
      setIsOpen(false)
    }
  }

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block ${className}`}
      {...props}
    >
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={handleToggle}
        className={disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleToggle()
          }
        }}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {/* Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`
            absolute z-50 ${positions[position]}
            bg-white border border-gray-200 rounded-lg shadow-lg
            py-1 min-w-max
            ${menuClassName}
          `}
          style={{ marginTop: offset, marginBottom: offset }}
          onClick={handleMenuClick}
          role="menu"
        >
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * Item do dropdown
 */
export const DropdownItem = ({
  children,
  onClick,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => (
  <div
    className={`
      flex items-center px-4 py-2 text-sm text-gray-700
      cursor-pointer hover:bg-gray-100 transition-colors
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      ${className}
    `}
    onClick={disabled ? undefined : onClick}
    role="menuitem"
    {...props}
  >
    {Icon && <Icon className="w-4 h-4 mr-3" />}
    {children}
  </div>
)

/**
 * Divisor do dropdown
 */
export const DropdownDivider = ({ className = '' }) => (
  <div className={`border-t border-gray-200 my-1 ${className}`} role="separator" />
)

/**
 * Header do dropdown
 */
export const DropdownHeader = ({ children, className = '' }) => (
  <div className={`px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${className}`}>
    {children}
  </div>
)

/**
 * Dropdown de ações com ícone de três pontos
 */
export const ActionsDropdown = ({
  actions = [],
  onAction,
  disabled = false,
  iconClassName = 'w-5 h-5',
  ...props
}) => {
  const trigger = (
    <button
      type="button"
      className={`
        p-2 text-gray-400 hover:text-gray-600 rounded-lg
        hover:bg-gray-100 transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
      `}
      disabled={disabled}
      aria-label="Ações"
    >
      <svg className={iconClassName} fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
      </svg>
    </button>
  )

  return (
    <Dropdown trigger={trigger} disabled={disabled} {...props}>
      {actions.map((action, index) => (
        <React.Fragment key={index}>
          {action.type === 'divider' ? (
            <DropdownDivider />
          ) : action.type === 'header' ? (
            <DropdownHeader>{action.label}</DropdownHeader>
          ) : (
            <DropdownItem
              icon={action.icon}
              onClick={() => onAction?.(action)}
              disabled={action.disabled}
              className={action.className}
            >
              {action.label}
            </DropdownItem>
          )}
        </React.Fragment>
      ))}
    </Dropdown>
  )
}

/**
 * Dropdown de usuário (avatar + menu)
 */
export const UserDropdown = ({
  user,
  onAction,
  avatarSize = 'w-8 h-8',
  ...props
}) => {
  const trigger = (
    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
      <img
        src={user?.avatar_url || '/default-avatar.png'}
        alt={user?.full_name || 'Usuário'}
        className={`${avatarSize} rounded-full object-cover`}
      />
      <div className="hidden md:block text-left">
        <div className="text-sm font-medium text-gray-900">
          {user?.full_name || 'Usuário'}
        </div>
        <div className="text-xs text-gray-500">
          {user?.email}
        </div>
      </div>
      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </div>
  )

  const defaultActions = [
    {
      label: 'Perfil',
      icon: (props) => (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      action: 'profile'
    },
    {
      label: 'Configurações',
      icon: (props) => (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      action: 'settings'
    },
    { type: 'divider' },
    {
      label: 'Sair',
      icon: (props) => (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      action: 'logout',
      className: 'text-red-600 hover:bg-red-50'
    }
  ]

  return (
    <Dropdown trigger={trigger} position="bottom-right" {...props}>
      {defaultActions.map((action, index) => (
        <React.Fragment key={index}>
          {action.type === 'divider' ? (
            <DropdownDivider />
          ) : (
            <DropdownItem
              icon={action.icon}
              onClick={() => onAction?.(action.action)}
              className={action.className}
            >
              {action.label}
            </DropdownItem>
          )}
        </React.Fragment>
      ))}
    </Dropdown>
  )
}

export default Dropdown