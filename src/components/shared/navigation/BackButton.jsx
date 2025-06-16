import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/shared/ui'

/**
 * Componente BackButton para navegação de volta
 * 
 * Fornece botão de voltar inteligente que pode usar
 * histórico do navegador ou rotas específicas
 */
const BackButton = ({
  to,
  label = 'Voltar',
  showIcon = true,
  useHistory = true,
  fallbackPath = '/dashboard',
  variant = 'secondary',
  size = 'medium',
  className = '',
  onClick,
  ...props
}) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = (e) => {
    // Se tem onClick customizado, executar primeiro
    if (onClick) {
      const result = onClick(e)
      // Se onClick retornar false, não continuar com navegação
      if (result === false) return
    }

    // Se tem path específico, navegar para ele
    if (to) {
      navigate(to)
      return
    }

    // Se deve usar histórico e há histórico disponível
    if (useHistory && window.history.length > 1) {
      navigate(-1)
      return
    }

    // Fallback para path padrão
    navigate(fallbackPath)
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`flex items-center space-x-2 ${className}`}
      {...props}
    >
      {showIcon && <ArrowLeftIcon className="w-4 h-4" />}
      <span>{label}</span>
    </Button>
  )
}

/**
 * Ícone de seta para esquerda
 */
const ArrowLeftIcon = ({ className }) => (
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
      d="M10 19l-7-7m0 0l7-7m-7 7h18" 
    />
  </svg>
)

/**
 * Botão de voltar para projetos
 */
export const BackToProjectsButton = ({ 
  className = '',
  ...props 
}) => (
  <BackButton
    to="/projects"
    label="← Voltar aos Projetos"
    showIcon={false}
    className={`text-blue-600 hover:text-blue-700 ${className}`}
    variant="link"
    {...props}
  />
)

/**
 * Botão de voltar para dashboard
 */
export const BackToDashboardButton = ({ 
  className = '',
  ...props 
}) => (
  <BackButton
    to="/dashboard"
    label="← Voltar ao Dashboard"
    showIcon={false}
    className={`text-blue-600 hover:text-blue-700 ${className}`}
    variant="link"
    {...props}
  />
)

/**
 * Botão de voltar contextuais para projeto
 */
export const BackToProjectButton = ({ 
  projectId,
  projectName,
  defaultTab = 'people',
  className = '',
  ...props 
}) => {
  const label = projectName 
    ? `← Voltar para ${projectName}` 
    : '← Voltar ao Projeto'

  return (
    <BackButton
      to={`/projects/${projectId}/${defaultTab}`}
      label={label}
      showIcon={false}
      className={`text-blue-600 hover:text-blue-700 ${className}`}
      variant="link"
      {...props}
    />
  )
}

/**
 * Botão de voltar inteligente que detecta contexto
 */
export const SmartBackButton = ({ 
  className = '',
  ...props 
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  // Detectar contexto baseado na URL atual
  const getBackRoute = () => {
    const path = location.pathname

    // Se estiver em detalhes de tarefa
    if (path.includes('/tasks/') && path.split('/').length > 3) {
      const projectId = path.split('/')[2]
      return {
        to: `/projects/${projectId}/tasks`,
        label: '← Voltar às Tarefas'
      }
    }

    // Se estiver em detalhes de pessoa
    if (path.includes('/people/') && path.split('/').length > 3) {
      const projectId = path.split('/')[2]
      return {
        to: `/projects/${projectId}/people`,
        label: '← Voltar às Pessoas'
      }
    }

    // Se estiver em abas de projeto
    if (path.includes('/projects/') && (path.includes('/people') || path.includes('/tasks'))) {
      return {
        to: '/projects',
        label: '← Voltar aos Projetos'
      }
    }

    // Se estiver em configurações
    if (path.includes('/settings/')) {
      return {
        to: '/dashboard',
        label: '← Voltar ao Dashboard'
      }
    }

    // Default
    return {
      to: '/dashboard',
      label: '← Voltar'
    }
  }

  const backRoute = getBackRoute()

  return (
    <BackButton
      to={backRoute.to}
      label={backRoute.label}
      showIcon={false}
      className={`text-blue-600 hover:text-blue-700 ${className}`}
      variant="link"
      {...props}
    />
  )
}

/**
 * Breadcrumb com botão de voltar integrado
 */
export const BreadcrumbWithBack = ({ 
  items = [],
  backButton = true,
  className = '',
  ...props 
}) => (
  <div className={`flex items-center space-x-4 ${className}`}>
    {backButton && (
      <SmartBackButton />
    )}
    
    {items.length > 0 && (
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="mx-2">/</span>
            )}
            <span className={index === items.length - 1 ? 'text-gray-900 font-medium' : ''}>
              {item}
            </span>
          </React.Fragment>
        ))}
      </nav>
    )}
  </div>
)

/**
 * Hook para navegação de volta programática
 */
export const useBackNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const goBack = (fallback = '/dashboard') => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(fallback)
    }
  }

  const goToRoute = (path) => {
    navigate(path)
  }

  const canGoBack = () => {
    return window.history.length > 1
  }

  return {
    goBack,
    goToRoute,
    canGoBack,
    currentPath: location.pathname
  }
}

/**
 * Botão de voltar com confirmação
 */
export const ConfirmBackButton = ({
  message = 'Tem certeza que deseja sair? Alterações não salvas serão perdidas.',
  showConfirm = false,
  ...props
}) => {
  const handleClick = (e) => {
    if (showConfirm) {
      if (!window.confirm(message)) {
        return false // Impede navegação
      }
    }
    return true // Permite navegação
  }

  return (
    <BackButton
      onClick={handleClick}
      {...props}
    />
  )
}

/**
 * Botão de voltar responsivo
 */
export const ResponsiveBackButton = ({ 
  mobileLabel = '←',
  desktopLabel = 'Voltar',
  className = '',
  ...props 
}) => (
  <BackButton
    className={className}
    {...props}
  >
    <span className="md:hidden">{mobileLabel}</span>
    <span className="hidden md:inline">{desktopLabel}</span>
  </BackButton>
)

export default BackButton