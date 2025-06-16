import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Bell, User, Settings, LogOut, Search } from 'lucide-react'
import { useAuth } from '@/hooks/auth'
import { useNotifications } from '@/hooks/notifications'
import { 
  Avatar, 
  Badge, 
  Dropdown, 
  DropdownItem, 
  DropdownDivider,
  UserDropdown,
  Button 
} from '@/components/shared/ui'
import { 
  SearchGlobal, 
  SearchModal 
} from '@/components/shared/search'
import { NotificationDropdown } from '@/components/shared/notifications'
import { APP_CONFIG } from '@/config/constants'
import { cn } from '@/utils/helpers'

/**
 * Componente Header principal da aplicação
 * 
 * Funcionalidades:
 * - Logo e navegação
 * - Busca global integrada (desktop + mobile)
 * - Notificações em tempo real
 * - Menu do usuário
 * - Responsive design
 * - Keyboard shortcuts
 */
const Header = ({
  showSearch = true,
  showNotifications = true,
  showUserMenu = true,
  className = '',
  ...props
}) => {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showUserMenuDropdown, setShowUserMenuDropdown] = useState(false)

  // Navegação por resultados de busca
  useEffect(() => {
    const handleSearchResultSelected = (event) => {
      const { item, category } = event.detail
      
      // Navegar para o item selecionado
      let url = ''
      switch (category) {
        case 'projects':
          url = `/projects/${item.id}/people`
          break
        case 'people':
          url = `/people/${item.id}`
          break
        case 'tasks':
          url = `/projects/${item.project_id}/tasks/${item.id}`
          break
        default:
          return
      }
      
      if (url) {
        navigate(url)
      }
    }

    window.addEventListener('searchResultSelected', handleSearchResultSelected)
    return () => window.removeEventListener('searchResultSelected', handleSearchResultSelected)
  }, [navigate])

  const handleUserAction = (action) => {
    switch (action) {
      case 'profile':
        navigate('/settings/profile')
        setShowUserMenuDropdown(false)
        break
      case 'settings':
        navigate('/settings')
        setShowUserMenuDropdown(false)
        break
      case 'logout':
        logout()
        break
      default:
        console.log('Ação não reconhecida:', action)
    }
  }

  const handleLogoClick = () => {
    navigate('/dashboard')
  }

  return (
    <>
      <header 
        className={cn(
          'sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur',
          'supports-[backdrop-filter]:bg-white/60',
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Logo e Nome */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogoClick}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
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
              </button>
            </div>

            {/* Centro - Busca Global (Desktop) */}
            {showSearch && (
              <div className="hidden md:block flex-1 max-w-lg mx-6">
                <SearchGlobal placeholder="Buscar projetos, pessoas ou tarefas..." />
              </div>
            )}

            {/* Direita - Ações do Header */}
            <div className="flex items-center space-x-3">
              {/* Busca Mobile */}
              {showSearch && (
                <div className="md:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSearchModal(true)}
                    className="text-gray-600 hover:text-gray-900"
                    aria-label="Abrir busca"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              )}

              {/* Notificações */}
              {showNotifications && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                    className="text-gray-600 hover:text-gray-900 relative"
                    aria-label="Notificações"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="danger" 
                        size="sm"
                        className="absolute -top-1 -right-1 min-w-[20px] h-5 text-xs flex items-center justify-center"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </Button>

                  {/* Dropdown de Notificações */}
                  {showNotificationsDropdown && (
                    <div className="absolute right-0 top-full mt-2 z-50">
                      <NotificationDropdown
                        onClose={() => setShowNotificationsDropdown(false)}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Menu do Usuário */}
              {showUserMenu && user && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUserMenuDropdown(!showUserMenuDropdown)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <Avatar
                      src={user?.avatar_url}
                      alt={user?.full_name}
                      size="sm"
                      fallback={user?.full_name?.charAt(0) || '?'}
                    />
                    <span className="hidden sm:block text-sm font-medium">
                      {user?.full_name}
                    </span>
                  </Button>

                  {/* Dropdown do Usuário */}
                  {showUserMenuDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="py-1">
                        {/* Informações do usuário */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={user?.avatar_url}
                              alt={user?.full_name}
                              size="md"
                              fallback={user?.full_name?.charAt(0) || '?'}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.full_name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="py-1">
                          <button
                            onClick={() => handleUserAction('profile')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <User className="h-4 w-4" />
                            Meu Perfil
                          </button>
                          
                          <button
                            onClick={() => handleUserAction('settings')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Settings className="h-4 w-4" />
                            Configurações
                          </button>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100">
                          <button
                            onClick={() => handleUserAction('logout')}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <LogOut className="h-4 w-4" />
                            Sair
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Busca Mobile Simplificada */}
          {showSearch && (
            <div className="md:hidden border-t border-gray-200 px-0 py-3 mt-3">
              <button
                onClick={() => setShowSearchModal(true)}
                className="w-full text-left px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Buscar projetos, pessoas ou tarefas...
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Modal de Busca */}
      {showSearch && (
        <SearchModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
        />
      )}

      {/* Overlay para fechar dropdowns */}
      {(showNotificationsDropdown || showUserMenuDropdown) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowNotificationsDropdown(false)
            setShowUserMenuDropdown(false)
          }}
        />
      )}
    </>
  )
}

/**
 * Header simplificado para páginas de auth
 * Mantém funcionalidade original mas com melhor acessibilidade
 */
export const AuthHeader = ({ className = '' }) => (
  <header className={cn(
    'bg-white border-b border-gray-200 px-4 py-3',
    className
  )}>
    <div className="flex items-center justify-center max-w-7xl mx-auto">
      <Link 
        to="/" 
        className="flex items-center space-x-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
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
        <h1 className="text-xl font-bold text-gray-900">
          {APP_CONFIG.name}
        </h1>
      </Link>
    </div>
  </header>
)

/**
 * Header responsivo que adapta em mobile
 * Mantém funcionalidade original com melhorias
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
          // Em mobile, busca é mostrada como botão + modal
        />
      </div>
    </>
  )
}

/**
 * Dropdown de notificações melhorado
 * Mantém estrutura original mas integra com hooks reais
 */
const LegacyNotificationDropdown = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications()
  
  // Fallback para dados mock se hooks não estão disponíveis
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

  const displayNotifications = notifications || mockNotifications
  const unreadCount = displayNotifications.filter(n => !n.read).length

  const trigger = (
    <button 
      className="
        relative p-2 text-gray-400 hover:text-gray-600 
        rounded-lg hover:bg-gray-100 transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500
      "
      aria-label="Notificações"
    >
      <Bell className="w-6 h-6" />
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
        {displayNotifications.length > 0 ? (
          displayNotifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'px-4 py-3 border-b border-gray-100 last:border-b-0',
                'hover:bg-gray-50 cursor-pointer',
                !notification.read && 'bg-blue-50'
              )}
              onClick={() => markAsRead && markAsRead(notification.id)}
            >
              <div className="flex items-start space-x-3">
                <div className={cn(
                  'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                  !notification.read ? 'bg-blue-500' : 'bg-transparent'
                )} />
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
            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Nenhuma notificação</p>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <Link
            to="/notifications"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todas
          </Link>
          {unreadCount > 0 && markAllAsRead && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>
      </div>
    </Dropdown>
  )
}

export default Header