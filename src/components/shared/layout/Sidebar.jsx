import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Badge } from '@/components/shared/ui'

/**
 * Componente Sidebar para navegação lateral
 * 
 * Fornece menu de navegação principal com estados ativos,
 * badges de notificação e modo colapsável
 */
const Sidebar = ({
  isCollapsed = false,
  onToggleCollapse,
  className = '',
  ...props
}) => {
  const location = useLocation()

  // Items de navegação principal
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: DashboardIcon,
      badge: null
    },
    {
      id: 'projects',
      label: 'Projetos',
      path: '/projects',
      icon: ProjectsIcon,
      badge: null
    },
    {
      id: 'notifications',
      label: 'Notificações',
      path: '/notifications',
      icon: NotificationsIcon,
      badge: 3 // Mock badge
    }
  ]

  // Items de configuração (seção inferior)
  const settingsItems = [
    {
      id: 'settings',
      label: 'Configurações',
      path: '/settings',
      icon: SettingsIcon,
      badge: null
    }
  ]

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <aside 
      className={`
        bg-white border-r border-gray-200 flex flex-col
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${className}
      `}
      {...props}
    >
      {/* Header da sidebar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900">
              Menu
            </h2>
          )}
          
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="
                p-1.5 text-gray-400 hover:text-gray-600 
                rounded-lg hover:bg-gray-100 transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
              aria-label={isCollapsed ? 'Expandir menu' : 'Colapsar menu'}
            >
              {isCollapsed ? (
                <ChevronRightIcon className="w-5 h-5" />
              ) : (
                <ChevronLeftIcon className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Navegação principal */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={isActiveRoute(item.path)}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>

        {/* Espaçador */}
        <div className="py-4">
          <div className="border-t border-gray-200" />
        </div>

        {/* Seção de configurações */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Configurações
              </h3>
            </div>
          )}
          
          {settingsItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={isActiveRoute(item.path)}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </nav>

      {/* Footer da sidebar */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <p>Task Manager v1.0</p>
            <p>© 2024 - Todos os direitos reservados</p>
          </div>
        </div>
      )}
    </aside>
  )
}

/**
 * Item individual da sidebar
 */
const SidebarItem = ({ item, isActive, isCollapsed }) => {
  const baseClasses = `
    group flex items-center px-3 py-2 rounded-lg text-sm font-medium
    transition-colors duration-200 relative
    focus:outline-none focus:ring-2 focus:ring-blue-500
  `

  const activeClasses = isActive
    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'

  return (
    <Link
      to={item.path}
      className={`${baseClasses} ${activeClasses}`}
      title={isCollapsed ? item.label : undefined}
    >
      {/* Ícone */}
      <item.icon 
        className={`
          w-5 h-5 flex-shrink-0
          ${isCollapsed ? 'mx-auto' : 'mr-3'}
          ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
        `} 
      />

      {/* Label */}
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">
            {item.label}
          </span>

          {/* Badge */}
          {item.badge && (
            <Badge 
              variant="danger" 
              size="small"
              className="ml-2"
            >
              {item.badge}
            </Badge>
          )}
        </>
      )}

      {/* Badge para sidebar colapsada */}
      {isCollapsed && item.badge && (
        <Badge 
          variant="danger" 
          size="small"
          className="absolute -top-1 -right-1"
        >
          {item.badge}
        </Badge>
      )}
    </Link>
  )
}

/**
 * Sidebar com overlay para mobile
 */
export const MobileSidebar = ({ 
  isOpen, 
  onClose, 
  children,
  className = '' 
}) => {
  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        md:hidden ${className}
      `}>
        <Sidebar>
          {/* Botão de fechar */}
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              aria-label="Fechar menu"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          
          {children}
        </Sidebar>
      </div>
    </>
  )
}

/**
 * Sidebar responsiva que vira drawer em mobile
 */
export const ResponsiveSidebar = ({ 
  isCollapsed, 
  onToggleCollapse,
  className = '',
  ...props 
}) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          className={className}
          {...props}
        />
      </div>

      {/* Mobile */}
      <MobileSidebar
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        className={className}
      />

      {/* Botão mobile para abrir sidebar */}
      <button
        onClick={() => setMobileOpen(true)}
        className="
          md:hidden fixed top-4 left-4 z-30 p-2 
          bg-white border border-gray-200 rounded-lg shadow-lg
          text-gray-400 hover:text-gray-600
        "
        aria-label="Abrir menu"
      >
        <MenuIcon className="w-5 h-5" />
      </button>
    </>
  )
}

/**
 * Mini sidebar com tooltips
 */
export const MiniSidebar = ({ className = '', ...props }) => (
  <Sidebar
    isCollapsed={true}
    className={`w-16 ${className}`}
    {...props}
  />
)

// Ícones dos itens de navegação
const DashboardIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
  </svg>
)

const ProjectsIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
)

const NotificationsIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V3a2 2 0 012 0v14z" />
  </svg>
)

const SettingsIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

// Ícones de controle
const ChevronLeftIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const ChevronRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const MenuIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const XIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default Sidebar