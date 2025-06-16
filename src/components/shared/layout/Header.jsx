import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/auth'
import { 
  Avatar, 
  Badge, 
  Dropdown, 
  DropdownItem, 
  DropdownDivider,
  UserDropdown 
} from '@/components/shared/ui'
import { APP_CONFIG } from '@/config/constants'

/**
 * Componente Header principal da aplicação
 * 
 * Contém logo, busca global, notificações e menu do usuário
 */
const Header = ({
  showSearch = true,
  showNotifications = true,
  showUserMenu = true,
  className = '',
  ...props
}) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  const handleUserAction = (action) => {
    switch (action) {
      case 'profile':
        navigate('/settings/profile')
        break
      case 'settings':
        navigate('/settings')
        break
      case 'logout':
        logout()
        break
      default:
        console.log('Ação não reconhecida:', action)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Em implementação futura, navegará para página de resultados
      console.log('Buscando por:', searchTerm)
    }
  }

  return (
    <header 
      className={`
        bg-white border-b border-gray-200 px-4 lg:px-6 py-3
        ${className}
      `}
      {...props}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo e Nome */}
        <div className="flex items-center space-x-4">
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg 
                className="w-5 h-5 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" 
                />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">
                {APP_CONFIG.name}
              </h1>
            </div>
          </Link>
        </div>

        {/* Centro - Busca Global */}
        {showSearch && (
          <div className="flex-1 max-w-lg mx-4">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Buscar projetos, pessoas ou tarefas..."
                  className="
                    block w-full pl-10 pr-4 py-2
                    border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    placeholder-gray-500 text-sm
                  "
                />
                
                {/* Atalho de teclado */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <kbd className="inline-flex items-center px-2 py-1 border border-gray-200 rounded text-xs font-mono text-gray-400">
                    ⌘K
                  </kbd>
                </div>
              </div>

              {/* Dropdown de resultados (placeholder para implementação futura) */}
              {searchFocused && searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4 text-sm text-gray-500">
                    Digite para buscar...
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Direita - Notificações e Usuário */}
        <div className="flex items-center space-x-4">
          {/* Notificações */}
          {showNotifications && (
            <NotificationDropdown />
          )}

          {/* Menu do Usuário */}
          {showUserMenu && user && (
            <UserDropdown
              user={user}
              onAction={handleUserAction}
            />
          )}
        </div>
      </div>
    </header>
  )
}

/**
 * Dropdown de notificações
 */
const NotificationDropdown = () => {
  // Mock de notificações para demonstração
  const mockNotifications = [
    {
      id: 1,
      title: 'Nova tarefa atribuída',
      message: 'Você foi atribuído à tarefa "Implementar login"',
      time: '5 min atrás',
      read: false
    },
    {
      id: 2,
      title: 'Tarefa concluída',
      message: 'A tarefa "Setup banco de dados" foi concluída',
      time: '1 hora atrás',
      read: true
    }
  ]

  const unreadCount = mockNotifications.filter(n => !n.read).length

  const trigger = (
    <button 
      className="
        relative p-2 text-gray-400 hover:text-gray-600 
        rounded-lg hover:bg-gray-100 transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500
      "
      aria-label="Notificações"
    >
      <BellIcon className="w-6 h-6" />
      {unreadCount > 0 && (
        <Badge 
          variant="danger" 
          size="small"
          className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center"
        >
          {unreadCount}
        </Badge>
      )}
    </button>
  )

  return (
    <Dropdown 
      trigger={trigger} 
      position="bottom-right"
      menuClassName="w-80"
    >
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Notificações
          </h3>
          {unreadCount > 0 && (
            <Badge variant="danger" size="small">
              {unreadCount} nova{unreadCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {mockNotifications.length > 0 ? (
          mockNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`
                px-4 py-3 border-b border-gray-100 last:border-b-0
                hover:bg-gray-50 cursor-pointer
                ${!notification.read ? 'bg-blue-50' : ''}
              `}
            >
              <div className="flex items-start space-x-3">
                <div className={`
                  w-2 h-2 rounded-full mt-2 flex-shrink-0
                  ${!notification.read ? 'bg-blue-500' : 'bg-transparent'}
                `} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {notification.time}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-8 text-center text-gray-500">
            <BellIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Nenhuma notificação</p>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-200">
        <Link
          to="/notifications"
          className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Ver todas as notificações
        </Link>
      </div>
    </Dropdown>
  )
}

/**
 * Header simplificado para páginas de auth
 */
export const AuthHeader = ({ className = '' }) => (
  <header className={`bg-white border-b border-gray-200 px-4 py-3 ${className}`}>
    <div className="flex items-center justify-center max-w-7xl mx-auto">
      <Link to="/" className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <svg 
            className="w-5 h-5 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" 
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          {APP_CONFIG.name}
        </h1>
      </Link>
    </div>
  </header>
)

/**
 * Header responsivo que adapta em mobile
 */
export const ResponsiveHeader = (props) => {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <Header {...props} />
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <Header 
          {...props}
          showSearch={false} // Esconde busca em mobile
        />
      </div>
    </>
  )
}

// Ícones
const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const BellIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V3a2 2 0 012 0v14z" />
  </svg>
)

export default Header