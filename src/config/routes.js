/**
 * Configuração centralizada de rotas da aplicação
 * 
 * Este arquivo define todas as rotas da aplicação de forma organizada,
 * facilitando manutenção e navegação programática.
 */

// Rotas principais da aplicação
export const ROUTES = {
  // Rotas públicas (não autenticadas)
  PUBLIC: {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email'
  },

  // Rotas privadas (autenticadas)
  PRIVATE: {
    DASHBOARD: '/dashboard',
    
    // Projetos
    PROJECTS: '/projects',
    PROJECT_DETAIL: '/projects/:id',
    PROJECT_PEOPLE: '/projects/:id/people',
    PROJECT_TASKS: '/projects/:id/tasks',
    PROJECT_SETTINGS: '/projects/:id/settings',
    
    // Tarefas
    TASKS: '/tasks',
    TASK_DETAIL: '/tasks/:id',
    TASK_EDIT: '/tasks/:id/edit',
    
    // Pessoas
    PEOPLE: '/people',
    PERSON_DETAIL: '/people/:id',
    
    // Configurações
    SETTINGS: '/settings',
    PROFILE: '/settings/profile',
    WEBHOOKS: '/settings/webhooks',
    NOTIFICATIONS_SETTINGS: '/settings/notifications',
    
    // Notificações
    NOTIFICATIONS: '/notifications',
    
    // Busca
    SEARCH: '/search',
    SEARCH_RESULTS: '/search/:query'
  },

  // Rotas de erro
  ERROR: {
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/401',
    FORBIDDEN: '/403',
    SERVER_ERROR: '/500'
  }
}

// Configurações de navegação para o menu/sidebar
export const NAVIGATION_CONFIG = {
  // Menu principal
  MAIN_MENU: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: ROUTES.PRIVATE.DASHBOARD,
      icon: 'LayoutDashboard',
      requireAuth: true,
      exact: true
    },
    {
      id: 'projects',
      label: 'Projetos',
      path: ROUTES.PRIVATE.PROJECTS,
      icon: 'FolderOpen',
      requireAuth: true,
      children: [
        {
          id: 'projects-list',
          label: 'Todos os Projetos',
          path: ROUTES.PRIVATE.PROJECTS,
          exact: true
        }
      ]
    },
    {
      id: 'tasks',
      label: 'Tarefas',
      path: ROUTES.PRIVATE.TASKS,
      icon: 'CheckSquare',
      requireAuth: true
    },
    {
      id: 'people',
      label: 'Pessoas',
      path: ROUTES.PRIVATE.PEOPLE,
      icon: 'Users',
      requireAuth: true
    },
    {
      id: 'notifications',
      label: 'Notificações',
      path: ROUTES.PRIVATE.NOTIFICATIONS,
      icon: 'Bell',
      requireAuth: true,
      badge: 'notifications' // Para exibir contador
    }
  ],

  // Menu de configurações
  SETTINGS_MENU: [
    {
      id: 'profile',
      label: 'Perfil',
      path: ROUTES.PRIVATE.PROFILE,
      icon: 'User',
      requireAuth: true
    },
    {
      id: 'webhooks',
      label: 'Webhooks',
      path: ROUTES.PRIVATE.WEBHOOKS,
      icon: 'Webhook',
      requireAuth: true
    },
    {
      id: 'notifications-settings',
      label: 'Notificações',
      path: ROUTES.PRIVATE.NOTIFICATIONS_SETTINGS,
      icon: 'Settings',
      requireAuth: true
    }
  ],

  // Menu do usuário (dropdown)
  USER_MENU: [
    {
      id: 'profile',
      label: 'Meu Perfil',
      path: ROUTES.PRIVATE.PROFILE,
      icon: 'User'
    },
    {
      id: 'settings',
      label: 'Configurações',
      path: ROUTES.PRIVATE.SETTINGS,
      icon: 'Settings'
    },
    {
      type: 'divider'
    },
    {
      id: 'logout',
      label: 'Sair',
      action: 'logout',
      icon: 'LogOut',
      className: 'text-red-600 hover:text-red-700'
    }
  ]
}

// Configurações de breadcrumb
export const BREADCRUMB_CONFIG = {
  // Mapeamento de rotas para breadcrumbs
  MAPPINGS: {
    [ROUTES.PRIVATE.DASHBOARD]: [
      { label: 'Dashboard', path: ROUTES.PRIVATE.DASHBOARD }
    ],
    [ROUTES.PRIVATE.PROJECTS]: [
      { label: 'Projetos', path: ROUTES.PRIVATE.PROJECTS }
    ],
    [ROUTES.PRIVATE.PROJECT_DETAIL]: [
      { label: 'Projetos', path: ROUTES.PRIVATE.PROJECTS },
      { label: ':projectName', path: null }
    ],
    [ROUTES.PRIVATE.PROJECT_PEOPLE]: [
      { label: 'Projetos', path: ROUTES.PRIVATE.PROJECTS },
      { label: ':projectName', path: ROUTES.PRIVATE.PROJECT_DETAIL },
      { label: 'Pessoas', path: null }
    ],
    [ROUTES.PRIVATE.PROJECT_TASKS]: [
      { label: 'Projetos', path: ROUTES.PRIVATE.PROJECTS },
      { label: ':projectName', path: ROUTES.PRIVATE.PROJECT_DETAIL },
      { label: 'Tarefas', path: null }
    ],
    [ROUTES.PRIVATE.TASKS]: [
      { label: 'Tarefas', path: ROUTES.PRIVATE.TASKS }
    ],
    [ROUTES.PRIVATE.TASK_DETAIL]: [
      { label: 'Tarefas', path: ROUTES.PRIVATE.TASKS },
      { label: ':taskName', path: null }
    ],
    [ROUTES.PRIVATE.PEOPLE]: [
      { label: 'Pessoas', path: ROUTES.PRIVATE.PEOPLE }
    ],
    [ROUTES.PRIVATE.PERSON_DETAIL]: [
      { label: 'Pessoas', path: ROUTES.PRIVATE.PEOPLE },
      { label: ':personName', path: null }
    ],
    [ROUTES.PRIVATE.SETTINGS]: [
      { label: 'Configurações', path: ROUTES.PRIVATE.SETTINGS }
    ]
  },

  // Configurações de exibição
  DISPLAY: {
    showHome: true,
    homeLabel: 'Início',
    separator: '/',
    maxItems: 4
  }
}

// Configurações de redirecionamento
export const REDIRECT_CONFIG = {
  // Redirecionamentos após login
  AFTER_LOGIN: ROUTES.PRIVATE.DASHBOARD,
  
  // Redirecionamentos após logout
  AFTER_LOGOUT: ROUTES.PUBLIC.LOGIN,
  
  // Redirecionamentos de rotas protegidas
  UNAUTHORIZED: ROUTES.PUBLIC.LOGIN,
  
  // Redirecionamentos padrão
  DEFAULT: ROUTES.PUBLIC.HOME,
  
  // Rota padrão para usuários autenticados
  AUTHENTICATED_DEFAULT: ROUTES.PRIVATE.DASHBOARD
}

// Configurações de permissões por rota
export const ROUTE_PERMISSIONS = {
  // Rotas que requerem autenticação
  REQUIRE_AUTH: [
    ROUTES.PRIVATE.DASHBOARD,
    ROUTES.PRIVATE.PROJECTS,
    ROUTES.PRIVATE.PROJECT_DETAIL,
    ROUTES.PRIVATE.PROJECT_PEOPLE,
    ROUTES.PRIVATE.PROJECT_TASKS,
    ROUTES.PRIVATE.TASKS,
    ROUTES.PRIVATE.TASK_DETAIL,
    ROUTES.PRIVATE.PEOPLE,
    ROUTES.PRIVATE.PERSON_DETAIL,
    ROUTES.PRIVATE.SETTINGS,
    ROUTES.PRIVATE.PROFILE,
    ROUTES.PRIVATE.WEBHOOKS,
    ROUTES.PRIVATE.NOTIFICATIONS
  ],

  // Rotas que redirecionam se usuário já está autenticado
  REDIRECT_IF_AUTHENTICATED: [
    ROUTES.PUBLIC.LOGIN,
    ROUTES.PUBLIC.REGISTER,
    ROUTES.PUBLIC.FORGOT_PASSWORD
  ],

  // Rotas que requerem verificação de email
  REQUIRE_EMAIL_VERIFIED: [
    ROUTES.PRIVATE.WEBHOOKS
  ]
}

// Utilitários para trabalhar com rotas
export const routeUtils = {
  /**
   * Constrói uma rota com parâmetros
   */
  buildRoute: (route, params = {}) => {
    let builtRoute = route
    Object.entries(params).forEach(([key, value]) => {
      builtRoute = builtRoute.replace(`:${key}`, value)
    })
    return builtRoute
  },

  /**
   * Verifica se uma rota requer autenticação
   */
  requiresAuth: (path) => {
    return ROUTE_PERMISSIONS.REQUIRE_AUTH.some(route => {
      const routeRegex = new RegExp('^' + route.replace(/:[^\s/]+/g, '([^/]+)') + '$')
      return routeRegex.test(path)
    })
  },

  /**
   * Verifica se uma rota deve redirecionar usuários autenticados
   */
  shouldRedirectAuthenticated: (path) => {
    return ROUTE_PERMISSIONS.REDIRECT_IF_AUTHENTICATED.includes(path)
  },

  /**
   * Obtém o breadcrumb para uma rota
   */
  getBreadcrumb: (path, params = {}) => {
    const mapping = BREADCRUMB_CONFIG.MAPPINGS[path]
    if (!mapping) return []

    return mapping.map(item => ({
      ...item,
      label: item.label.startsWith(':') 
        ? params[item.label.substring(1)] || item.label
        : item.label,
      path: item.path ? routeUtils.buildRoute(item.path, params) : null
    }))
  },

  /**
   * Verifica se uma rota está ativa
   */
  isActiveRoute: (currentPath, routePath, exact = false) => {
    if (exact) {
      return currentPath === routePath
    }
    return currentPath.startsWith(routePath)
  }
}

// Export default com todas as configurações
export default {
  ROUTES,
  NAVIGATION_CONFIG,
  BREADCRUMB_CONFIG,
  REDIRECT_CONFIG,
  ROUTE_PERMISSIONS,
  routeUtils
}