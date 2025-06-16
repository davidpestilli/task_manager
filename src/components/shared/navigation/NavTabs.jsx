import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Badge } from '@/components/shared/ui'

/**
 * Componente NavTabs para navegação por abas
 * 
 * Fornece navegação em abas com suporte a badges,
 * ícones e estado ativo baseado na rota atual
 */
const NavTabs = ({
  tabs = [],
  activeTab,
  onTabChange,
  variant = 'underline', // underline, pills, buttons
  size = 'medium',
  className = '',
  fullWidth = false,
  scrollable = false,
  ...props
}) => {
  const location = useLocation()
  const [internalActiveTab, setInternalActiveTab] = useState(activeTab || tabs[0]?.id)

  // Usar activeTab controlado ou interno
  const currentActiveTab = activeTab !== undefined ? activeTab : internalActiveTab

  // Variantes de estilo
  const variants = {
    underline: {
      container: 'border-b border-gray-200',
      tab: 'border-b-2 border-transparent hover:border-gray-300',
      active: 'border-blue-500 text-blue-600',
      inactive: 'text-gray-500 hover:text-gray-700'
    },
    pills: {
      container: 'bg-gray-100 rounded-lg p-1',
      tab: 'rounded-md transition-all duration-200',
      active: 'bg-white text-gray-900 shadow-sm',
      inactive: 'text-gray-600 hover:text-gray-900 hover:bg-white hover:bg-opacity-50'
    },
    buttons: {
      container: 'space-x-1',
      tab: 'border border-gray-300 rounded-lg transition-all duration-200',
      active: 'border-blue-500 bg-blue-50 text-blue-700',
      inactive: 'text-gray-700 hover:bg-gray-50 hover:border-gray-400'
    }
  }

  // Tamanhos
  const sizes = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-6 py-4 text-lg'
  }

  const currentVariant = variants[variant]
  const currentSize = sizes[size]

  const handleTabClick = (tab) => {
    if (onTabChange) {
      onTabChange(tab.id, tab)
    } else {
      setInternalActiveTab(tab.id)
    }
  }

  const isTabActive = (tab) => {
    // Se tem path, verificar pela rota atual
    if (tab.path) {
      return location.pathname === tab.path || location.pathname.startsWith(tab.path + '/')
    }
    // Senão, verificar pelo ID
    return tab.id === currentActiveTab
  }

  const containerClasses = `
    flex 
    ${fullWidth ? 'w-full' : ''} 
    ${scrollable ? 'overflow-x-auto' : ''} 
    ${currentVariant.container} 
    ${className}
  `

  return (
    <nav className={containerClasses} {...props}>
      <div className={`flex ${fullWidth ? 'w-full' : ''} ${scrollable ? 'min-w-max' : ''}`}>
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={isTabActive(tab)}
            variant={currentVariant}
            size={currentSize}
            fullWidth={fullWidth}
            onClick={() => handleTabClick(tab)}
          />
        ))}
      </div>
    </nav>
  )
}

/**
 * Item individual da aba
 */
const TabItem = ({ 
  tab, 
  isActive, 
  variant, 
  size, 
  fullWidth, 
  onClick 
}) => {
  const baseClasses = `
    ${variant.tab}
    ${size}
    ${isActive ? variant.active : variant.inactive}
    ${fullWidth ? 'flex-1' : ''}
    font-medium transition-colors duration-200 cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const content = (
    <div className="flex items-center justify-center space-x-2">
      {/* Ícone */}
      {tab.icon && (
        <tab.icon className="w-5 h-5" />
      )}

      {/* Label */}
      <span className={fullWidth ? 'text-center' : ''}>
        {tab.label}
      </span>

      {/* Badge */}
      {tab.badge && (
        <Badge 
          variant="danger" 
          size="small"
          className="ml-2"
        >
          {tab.badge}
        </Badge>
      )}

      {/* Indicator customizado */}
      {tab.indicator && (
        <div className="ml-2">
          {tab.indicator}
        </div>
      )}
    </div>
  )

  // Se tem path, usar Link
  if (tab.path) {
    return (
      <Link
        to={tab.path}
        className={baseClasses}
        onClick={onClick}
        disabled={tab.disabled}
        aria-current={isActive ? 'page' : undefined}
      >
        {content}
      </Link>
    )
  }

  // Senão, usar button
  return (
    <button
      type="button"
      className={baseClasses}
      onClick={onClick}
      disabled={tab.disabled}
      aria-pressed={isActive}
    >
      {content}
    </button>
  )
}

/**
 * Abas verticais
 */
export const VerticalNavTabs = ({
  tabs = [],
  className = '',
  ...props
}) => (
  <nav className={`flex flex-col space-y-1 ${className}`}>
    {tabs.map((tab) => (
      <VerticalTabItem key={tab.id} tab={tab} {...props} />
    ))}
  </nav>
)

/**
 * Item de aba vertical
 */
const VerticalTabItem = ({ tab, isActive, onClick }) => (
  <button
    type="button"
    onClick={() => onClick?.(tab)}
    className={`
      flex items-center space-x-3 px-3 py-2 rounded-lg text-left
      transition-colors duration-200
      ${isActive 
        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }
    `}
  >
    {tab.icon && <tab.icon className="w-5 h-5" />}
    <span className="font-medium">{tab.label}</span>
    {tab.badge && (
      <Badge variant="danger" size="small" className="ml-auto">
        {tab.badge}
      </Badge>
    )}
  </button>
)

/**
 * Abas para projetos (contextualizadas)
 */
export const ProjectNavTabs = ({ 
  projectId, 
  currentTab = 'people',
  className = '',
  ...props 
}) => {
  const tabs = [
    {
      id: 'people',
      label: 'Pessoas',
      path: `/projects/${projectId}/people`,
      icon: PeopleIcon
    },
    {
      id: 'tasks',
      label: 'Tarefas',
      path: `/projects/${projectId}/tasks`,
      icon: TasksIcon
    }
  ]

  return (
    <NavTabs
      tabs={tabs}
      activeTab={currentTab}
      className={className}
      {...props}
    />
  )
}

/**
 * Abas de configurações
 */
export const SettingsNavTabs = ({ 
  currentTab = 'profile',
  className = '',
  ...props 
}) => {
  const tabs = [
    {
      id: 'profile',
      label: 'Perfil',
      path: '/settings/profile',
      icon: ProfileIcon
    },
    {
      id: 'webhooks',
      label: 'Webhooks',
      path: '/settings/webhooks',
      icon: WebhooksIcon
    }
  ]

  return (
    <NavTabs
      tabs={tabs}
      activeTab={currentTab}
      variant="pills"
      className={className}
      {...props}
    />
  )
}

/**
 * Abas responsivas que viram dropdown em mobile
 */
export const ResponsiveNavTabs = ({ 
  tabs = [],
  breakpoint = 'md',
  ...props 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const activeTab = tabs.find(tab => tab.isActive) || tabs[0]

  const breakpoints = {
    sm: 'sm:hidden',
    md: 'md:hidden',
    lg: 'lg:hidden'
  }

  return (
    <>
      {/* Desktop */}
      <div className={`hidden ${breakpoint}:block`}>
        <NavTabs tabs={tabs} {...props} />
      </div>

      {/* Mobile */}
      <div className={breakpoints[breakpoint]}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="
              flex items-center justify-between w-full px-4 py-2
              text-left bg-white border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          >
            <span className="flex items-center space-x-2">
              {activeTab.icon && <activeTab.icon className="w-5 h-5" />}
              <span>{activeTab.label}</span>
            </span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setMobileMenuOpen(false)
                    // Handle tab change
                  }}
                  className="
                    flex items-center space-x-2 w-full px-4 py-3 text-left
                    hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg
                  "
                >
                  {tab.icon && <tab.icon className="w-5 h-5" />}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <Badge variant="danger" size="small" className="ml-auto">
                      {tab.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Ícones das abas
const PeopleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const TasksIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
)

const ProfileIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const WebhooksIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
)

export default NavTabs