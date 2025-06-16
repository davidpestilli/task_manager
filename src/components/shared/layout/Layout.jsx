import React, { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'
import Footer from './Footer.jsx'
import { Breadcrumb } from '@/components/shared/navigation'
import { useLocalStorage } from '@/hooks/shared'

/**
 * Componente Layout principal da aplicação
 * 
 * Fornece estrutura base com header, sidebar, 
 * breadcrumb e área de conteúdo
 */
const Layout = ({
  children,
  showSidebar = true,
  showBreadcrumb = true,
  showFooter = true,
  sidebarCollapsed: controlledCollapsed,
  onSidebarToggle,
  breadcrumbItems = [],
  className = '',
  contentClassName = '',
  ...props
}) => {
  const location = useLocation()
  
  // Estado da sidebar (colapsada ou não)
  const [internalCollapsed, setInternalCollapsed] = useLocalStorage('sidebar-collapsed', false)
  
  // Usar estado controlado ou interno
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed
  const setCollapsed = onSidebarToggle || setInternalCollapsed

  const handleSidebarToggle = () => {
    setCollapsed(!isCollapsed)
  }

  // Detectar se é página de configurações para ajustar layout
  const isSettingsPage = location.pathname.startsWith('/settings')
  
  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 ${className}`} {...props}>
      {/* Header */}
      <Header />

      {/* Conteúdo principal */}
      <div className="flex flex-1">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar
            isCollapsed={isCollapsed}
            onToggleCollapse={handleSidebarToggle}
          />
        )}

        {/* Área de conteúdo */}
        <main className={`flex-1 flex flex-col min-w-0 ${contentClassName}`}>
          {/* Breadcrumb */}
          {showBreadcrumb && (
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <Breadcrumb 
                items={breadcrumbItems}
                showHome={true}
              />
            </div>
          )}

          {/* Conteúdo das páginas */}
          <div className="flex-1 p-6">
            {children}
          </div>

          {/* Footer */}
          {showFooter && (
            <Footer variant="default" />
          )}
        </main>
      </div>
    </div>
  )
}

/**
 * Layout para páginas de autenticação
 */
export const AuthLayout = ({ 
  children, 
  title,
  subtitle,
  showLogo = true,
  className = '',
  ...props 
}) => (
  <div className={`min-h-screen flex flex-col bg-gray-50 ${className}`} {...props}>
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo e título */}
        {showLogo && (
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
              <svg 
                className="w-7 h-7 text-white" 
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
            
            {title && (
              <h2 className="text-3xl font-bold text-gray-900">
                {title}
              </h2>
            )}
            
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Conteúdo */}
        {children}
      </div>
    </div>
  </div>
)

/**
 * Layout para páginas de configurações
 */
export const SettingsLayout = ({ 
  children, 
  title,
  description,
  sidebar,
  className = '',
  ...props 
}) => (
  <Layout 
    showBreadcrumb={true}
    className={className}
    {...props}
  >
    <div className="max-w-7xl mx-auto">
      {/* Header da página */}
      {(title || description) && (
        <div className="mb-8">
          {title && (
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Layout com sidebar de configurações */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de configurações */}
        {sidebar && (
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              {sidebar}
            </div>
          </div>
        )}

        {/* Conteúdo principal */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-lg border border-gray-200">
            {children}
          </div>
        </div>
      </div>
    </div>
  </Layout>
)

/**
 * Layout para páginas de projetos
 */
export const ProjectLayout = ({ 
  children,
  project,
  currentTab,
  tabs = [],
  actions,
  className = '',
  ...props 
}) => {
  const breadcrumbItems = [
    { label: 'Projetos', path: '/projects' }
  ]

  if (project) {
    breadcrumbItems.push({
      label: project.name,
      path: `/projects/${project.id}`
    })
  }

  return (
    <Layout 
      breadcrumbItems={breadcrumbItems}
      className={className}
      {...props}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header do projeto */}
        {project && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {project.name}
                </h1>
                {project.description && (
                  <p className="text-gray-600">
                    {project.description}
                  </p>
                )}
              </div>
              
              {/* Ações do projeto */}
              {actions && (
                <div className="flex items-center space-x-3">
                  {actions}
                </div>
              )}
            </div>

            {/* Abas do projeto */}
            {tabs.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <nav className="flex space-x-8">
                  {tabs.map((tab) => (
                    <Link
                      key={tab.id}
                      to={tab.path}
                      className={`
                        pb-2 px-1 border-b-2 font-medium text-sm transition-colors
                        ${tab.id === currentTab
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      {tab.label}
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>
        )}

        {/* Conteúdo da página */}
        {children}
      </div>
    </Layout>
  )
}

/**
 * Layout modal para páginas que sobrepõem conteúdo
 */
export const ModalLayout = ({ 
  children,
  title,
  onClose,
  size = 'medium',
  className = '',
  ...props 
}) => {
  const sizes = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    xlarge: 'max-w-6xl'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div 
          className={`
            inline-block align-bottom bg-white rounded-lg text-left overflow-hidden 
            shadow-xl transform transition-all sm:my-8 sm:align-middle w-full
            ${sizes[size]} ${className}
          `}
          {...props}
        >
          {/* Header */}
          {title && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {title}
                </h3>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XIcon className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Layout para páginas de erro
 */
export const ErrorLayout = ({ 
  children,
  showHeader = false,
  className = '',
  ...props 
}) => (
  <div className={`min-h-screen flex flex-col bg-gray-50 ${className}`} {...props}>
    {showHeader && <Header />}
    
    <div className="flex-1 flex items-center justify-center">
      {children}
    </div>
  </div>
)

/**
 * Layout responsivo que adapta sidebar em mobile
 */
export const ResponsiveLayout = ({ 
  children,
  mobileBreakpoint = 'lg',
  ...props 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const breakpoints = {
    sm: 'sm:hidden',
    md: 'md:hidden', 
    lg: 'lg:hidden',
    xl: 'xl:hidden'
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className={`
          ${breakpoints[mobileBreakpoint]} fixed top-4 left-4 z-30 
          p-2 bg-white rounded-lg shadow-lg border border-gray-200
          text-gray-400 hover:text-gray-600
        `}
      >
        <MenuIcon className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className={`${breakpoints[mobileBreakpoint]} fixed inset-0 z-40 bg-black bg-opacity-50`}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Layout 
        showSidebar={!mobileMenuOpen}
        {...props}
      >
        {children}
      </Layout>
    </>
  )
}

// Ícones
const XIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const MenuIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

export default Layout