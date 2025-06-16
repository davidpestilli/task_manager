import React from 'react'
import { Link, useLocation } from 'react-router-dom'

/**
 * Componente Breadcrumb para navegação hierárquica
 * 
 * Mostra o caminho atual do usuário na aplicação
 * com links clicáveis para navegação rápida
 */
const Breadcrumb = ({
  items = [],
  separator = '/',
  className = '',
  showHome = true,
  homeLabel = 'Início',
  homePath = '/dashboard',
  maxItems = 5,
  ...props
}) => {
  const location = useLocation()

  // Se não há items, gerar automaticamente baseado na URL
  const breadcrumbItems = items.length > 0 ? items : generateFromPath(location.pathname)

  // Adicionar item home se solicitado
  const allItems = showHome 
    ? [{ label: homeLabel, path: homePath, isHome: true }, ...breadcrumbItems]
    : breadcrumbItems

  // Limitar número de items se necessário
  const displayItems = allItems.length > maxItems 
    ? [
        allItems[0],
        { label: '...', isEllipsis: true },
        ...allItems.slice(-2)
      ]
    : allItems

  return (
    <nav 
      className={`flex items-center space-x-2 text-sm ${className}`}
      aria-label="Breadcrumb"
      {...props}
    >
      <ol className="flex items-center space-x-2">
        {displayItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {/* Item do breadcrumb */}
            <BreadcrumbItem
              item={item}
              isLast={index === displayItems.length - 1}
              separator={separator}
            />

            {/* Separador */}
            {index < displayItems.length - 1 && (
              <span className="mx-2 text-gray-400 select-none">
                {typeof separator === 'string' ? (
                  separator
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/**
 * Item individual do breadcrumb
 */
const BreadcrumbItem = ({ item, isLast }) => {
  if (item.isEllipsis) {
    return (
      <span className="text-gray-400 cursor-default">
        {item.label}
      </span>
    )
  }

  if (isLast || !item.path) {
    return (
      <span 
        className="text-gray-900 font-medium"
        aria-current="page"
      >
        {item.icon && <item.icon className="w-4 h-4 mr-1 inline" />}
        {item.label}
      </span>
    )
  }

  return (
    <Link
      to={item.path}
      className="
        text-gray-500 hover:text-gray-700 transition-colors
        focus:outline-none focus:text-gray-700
      "
    >
      {item.icon && <item.icon className="w-4 h-4 mr-1 inline" />}
      {item.label}
    </Link>
  )
}

/**
 * Ícone de seta para separador
 */
const ChevronRightIcon = ({ className }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M9 5l7 7-7 7" 
    />
  </svg>
)

/**
 * Gera breadcrumb automaticamente baseado no path
 */
const generateFromPath = (pathname) => {
  // Mapeamento de rotas para labels amigáveis
  const routeLabels = {
    'dashboard': 'Dashboard',
    'projects': 'Projetos',
    'tasks': 'Tarefas',
    'people': 'Pessoas',
    'settings': 'Configurações',
    'notifications': 'Notificações',
    'profile': 'Perfil',
    'webhooks': 'Webhooks'
  }

  const segments = pathname.split('/').filter(Boolean)
  const items = []

  segments.forEach((segment, index) => {
    // Pular segmentos que são IDs (UUIDs ou números)
    if (isId(segment)) return

    const path = '/' + segments.slice(0, index + 1).join('/')
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

    items.push({
      label,
      path,
      segment
    })
  })

  return items
}

/**
 * Verifica se um segmento é um ID
 */
const isId = (segment) => {
  // UUID pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  // Número
  const numberPattern = /^\d+$/
  
  return uuidPattern.test(segment) || numberPattern.test(segment)
}

/**
 * Hook para usar breadcrumb programaticamente
 */
export const useBreadcrumb = () => {
  const location = useLocation()

  const setBreadcrumb = (items) => {
    // Em uma implementação real, isso poderia usar Context
    // Por agora, retorna os items para uso direto
    return items
  }

  const getCurrentBreadcrumb = () => {
    return generateFromPath(location.pathname)
  }

  return {
    setBreadcrumb,
    getCurrentBreadcrumb,
    currentPath: location.pathname
  }
}

/**
 * Breadcrumb customizado para projetos
 */
export const ProjectBreadcrumb = ({ 
  project, 
  currentPage,
  className = '',
  ...props 
}) => {
  const items = [
    { label: 'Projetos', path: '/projects' }
  ]

  if (project) {
    items.push({
      label: project.name,
      path: `/projects/${project.id}`,
      icon: ProjectIcon
    })

    if (currentPage) {
      items.push({
        label: currentPage,
        path: null // Página atual não tem link
      })
    }
  }

  return (
    <Breadcrumb
      items={items}
      className={className}
      {...props}
    />
  )
}

/**
 * Ícone de projeto
 */
const ProjectIcon = ({ className }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
    />
  </svg>
)

/**
 * Breadcrumb responsivo que colapsa em mobile
 */
export const ResponsiveBreadcrumb = ({ 
  items = [],
  mobileMaxItems = 2,
  ...props 
}) => (
  <>
    {/* Desktop */}
    <div className="hidden md:block">
      <Breadcrumb items={items} {...props} />
    </div>

    {/* Mobile */}
    <div className="md:hidden">
      <Breadcrumb 
        items={items} 
        maxItems={mobileMaxItems}
        showHome={false}
        {...props} 
      />
    </div>
  </>
)

export default Breadcrumb