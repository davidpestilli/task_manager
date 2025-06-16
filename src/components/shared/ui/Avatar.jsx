import React, { useState } from 'react'
import { getInitials } from '@/utils/helpers'

/**
 * Componente Avatar reutilizável
 * 
 * Exibe imagem do usuário com fallback para iniciais
 * e indicadores de status opcionais
 */
const Avatar = ({
  src,
  alt,
  name,
  size = 'medium',
  shape = 'circle', // circle, square, rounded
  showStatus = false,
  status = 'offline', // online, offline, away, busy
  className = '',
  fallbackBg = 'bg-gray-500',
  textColor = 'text-white',
  onClick,
  ...props
}) => {
  const [imageError, setImageError] = useState(false)

  // Tamanhos pré-definidos
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    small: 'w-8 h-8 text-sm',
    medium: 'w-10 h-10 text-base',
    large: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  }

  // Formas disponíveis
  const shapes = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg'
  }

  // Cores de status
  const statusColors = {
    online: 'bg-green-400',
    offline: 'bg-gray-400',
    away: 'bg-yellow-400',
    busy: 'bg-red-400'
  }

  // Tamanhos dos indicadores de status
  const statusSizes = {
    xs: 'w-2 h-2',
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-4 h-4'
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const displayName = alt || name || 'Usuário'
  const initials = getInitials(displayName)
  const shouldShowImage = src && !imageError

  return (
    <div 
      className={`
        relative inline-block ${sizes[size]} ${className}
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
      {...props}
    >
      {/* Avatar principal */}
      <div
        className={`
          w-full h-full flex items-center justify-center
          ${shapes[shape]} overflow-hidden
          ${shouldShowImage ? 'bg-transparent' : `${fallbackBg} ${textColor}`}
        `}
      >
        {shouldShowImage ? (
          <img
            src={src}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <span className="font-medium">{initials}</span>
        )}
      </div>

      {/* Indicador de status */}
      {showStatus && (
        <div
          className={`
            absolute bottom-0 right-0 ${statusSizes[size]}
            ${statusColors[status]} border-2 border-white rounded-full
          `}
          title={`Status: ${status}`}
        />
      )}
    </div>
  )
}

/**
 * Grupo de avatares sobrepostos
 */
export const AvatarGroup = ({
  users = [],
  max = 3,
  size = 'medium',
  showCount = true,
  className = '',
  ...props
}) => {
  const visibleUsers = users.slice(0, max)
  const remainingCount = Math.max(0, users.length - max)

  // Espaçamentos para sobreposição
  const overlaps = {
    xs: '-space-x-1',
    small: '-space-x-1',
    medium: '-space-x-2',
    large: '-space-x-2',
    xl: '-space-x-3',
    '2xl': '-space-x-3'
  }

  return (
    <div 
      className={`flex ${overlaps[size]} ${className}`}
      {...props}
    >
      {visibleUsers.map((user, index) => (
        <Avatar
          key={user.id || index}
          src={user.avatar_url}
          name={user.full_name || user.name}
          size={size}
          className="ring-2 ring-white"
          style={{ zIndex: visibleUsers.length - index }}
        />
      ))}

      {/* Contador de usuários restantes */}
      {showCount && remainingCount > 0 && (
        <div
          className={`
            ${sizes[size]} bg-gray-100 text-gray-600 rounded-full
            flex items-center justify-center font-medium ring-2 ring-white
            text-xs
          `}
          style={{ zIndex: 0 }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

/**
 * Avatar com badge numérico
 */
export const AvatarWithBadge = ({
  badge,
  badgeColor = 'bg-red-500',
  badgePosition = 'top-right',
  ...avatarProps
}) => {
  const positions = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1'
  }

  return (
    <div className="relative inline-block">
      <Avatar {...avatarProps} />
      
      {badge && (
        <div
          className={`
            absolute ${positions[badgePosition]}
            ${badgeColor} text-white text-xs font-bold
            rounded-full h-5 w-5 flex items-center justify-center
            ring-2 ring-white
          `}
        >
          {badge}
        </div>
      )}
    </div>
  )
}

/**
 * Avatar com dropdown de ações
 */
export const AvatarWithDropdown = ({
  user,
  actions = [],
  onAction,
  ...avatarProps
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Avatar
        src={user?.avatar_url}
        name={user?.full_name || user?.name}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
        {...avatarProps}
      />

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200">
            <div className="font-medium text-gray-900">
              {user?.full_name || user?.name}
            </div>
            <div className="text-sm text-gray-500">
              {user?.email}
            </div>
          </div>

          <div className="py-1">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  onAction?.(action)
                  setIsOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay para fechar dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

/**
 * Avatar placeholder para carregamento
 */
export const AvatarSkeleton = ({ size = 'medium', shape = 'circle', className = '' }) => (
  <div
    className={`
      ${sizes[size]} ${shapes[shape]} ${className}
      bg-gray-200 animate-pulse
    `}
  />
)

// Constantes exportadas para uso externo
export const AVATAR_SIZES = Object.keys({
  xs: 'w-6 h-6 text-xs',
  small: 'w-8 h-8 text-sm',
  medium: 'w-10 h-10 text-base',
  large: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl'
})

export const AVATAR_SHAPES = ['circle', 'square', 'rounded']
export const AVATAR_STATUSES = ['online', 'offline', 'away', 'busy']

export default Avatar