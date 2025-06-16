/**
 * Constantes globais da aplicação Task Manager
 * 
 * Este arquivo centraliza todas as constantes utilizadas em toda a aplicação,
 * facilitando manutenção e garantindo consistência.
 */

// Importar configurações de ambiente
import { APP_CONFIG as ENV_APP_CONFIG } from './environment'

// Configurações principais da aplicação
export const APP_CONFIG = {
  name: ENV_APP_CONFIG.name,
  version: ENV_APP_CONFIG.version,
  description: ENV_APP_CONFIG.description,
  author: 'Task Manager Team',
  license: 'MIT',
  homepage: 'https://github.com/username/task-manager',
  bugReports: 'https://github.com/username/task-manager/issues'
}

// URLs e paths da aplicação
export const APP_PATHS = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  dashboard: '/dashboard',
  projects: '/projects',
  project: '/projects/:id',
  tasks: '/tasks',
  task: '/tasks/:id',
  people: '/people',
  person: '/people/:id',
  settings: '/settings',
  profile: '/profile',
  notifications: '/notifications',
  webhooks: '/webhooks'
}

// Configurações de layout
export const LAYOUT_CONFIG = {
  sidebar: {
    width: 240,
    collapsedWidth: 64,
    breakpoint: 768
  },
  header: {
    height: 64
  },
  footer: {
    height: 48
  },
  container: {
    maxWidth: 1200,
    padding: 24
  }
}

// Configurações de cores do sistema
export const COLORS = {
  primary: {
    light: '#3B82F6',
    main: '#2563EB',
    dark: '#1D4ED8'
  },
  secondary: {
    light: '#8B5CF6',
    main: '#7C3AED',
    dark: '#6D28D9'
  },
  success: {
    light: '#34D399',
    main: '#10B981',
    dark: '#059669'
  },
  warning: {
    light: '#FBBF24',
    main: '#F59E0B',
    dark: '#D97706'
  },
  error: {
    light: '#F87171',
    main: '#EF4444',
    dark: '#DC2626'
  },
  info: {
    light: '#60A5FA',
    main: '#3B82F6',
    dark: '#2563EB'
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  }
}

// Configurações de breakpoints responsivos
export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

// Configurações de z-index
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  notification: 1070
}

// Configurações de animação
export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
    slower: 500
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out'
  }
}

// Configurações de forma e tamanhos
export const SIZING = {
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem'
  }
}

// Configurações de validação
export const VALIDATION = {
  email: {
    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: 'Email inválido'
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo'
  },
  required: {
    message: 'Este campo é obrigatório'
  },
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
    message: 'Nome deve ter entre 2 e 50 caracteres, apenas letras e espaços'
  }
}

// Configurações de formato de data
export const DATE_FORMATS = {
  short: 'dd/MM/yyyy',
  medium: 'dd/MM/yyyy HH:mm',
  long: "dd 'de' MMMM 'de' yyyy",
  full: "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm",
  time: 'HH:mm',
  timeWithSeconds: 'HH:mm:ss',
  iso: "yyyy-MM-dd'T'HH:mm:ss"
}

// Configurações de localStorage
export const STORAGE_KEYS = {
  authToken: 'task_manager_auth_token',
  userPreferences: 'task_manager_user_preferences',
  theme: 'task_manager_theme',
  language: 'task_manager_language',
  lastProject: 'task_manager_last_project',
  sidebarCollapsed: 'task_manager_sidebar_collapsed',
  notificationSettings: 'task_manager_notification_settings'
}

// Configurações de paginação
export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  maxPageSize: 100,
  showSizeChanger: true,
  showQuickJumper: true
}

// Configurações de upload de arquivos
export const FILE_UPLOAD = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: ['application/pdf', 'text/plain', 'application/msword'],
    spreadsheets: ['application/vnd.ms-excel', 'text/csv']
  },
  uploadPath: 'uploads'
}

// Configurações de mensagens do sistema
export const MESSAGES = {
  success: {
    saved: 'Salvo com sucesso!',
    deleted: 'Excluído com sucesso!',
    updated: 'Atualizado com sucesso!',
    created: 'Criado com sucesso!',
    sent: 'Enviado com sucesso!'
  },
  error: {
    generic: 'Ocorreu um erro. Tente novamente.',
    network: 'Erro de conexão. Verifique sua internet.',
    unauthorized: 'Você não tem permissão para esta ação.',
    notFound: 'Item não encontrado.',
    validation: 'Dados inválidos. Verifique os campos.'
  },
  warning: {
    unsavedChanges: 'Você tem alterações não salvas. Deseja continuar?',
    deleteConfirm: 'Tem certeza que deseja excluir este item?',
    irreversible: 'Esta ação não pode ser desfeita.'
  },
  info: {
    loading: 'Carregando...',
    noData: 'Nenhum dado encontrado.',
    empty: 'Lista vazia.',
    searching: 'Buscando...'
  }
}

// Configurações de metadata para SEO
export const META_TAGS = {
  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
  keywords: 'task manager, gerenciamento de tarefas, colaboração, projetos, produtividade',
  author: APP_CONFIG.author,
  viewport: 'width=device-width, initial-scale=1.0',
  charset: 'UTF-8',
  robots: 'index, follow',
  language: 'pt-BR'
}

// Export default com todas as constantes organizadas
export default {
  APP_CONFIG,
  APP_PATHS,
  LAYOUT_CONFIG,
  COLORS,
  BREAKPOINTS,
  Z_INDEX,
  ANIMATION,
  SIZING,
  VALIDATION,
  DATE_FORMATS,
  STORAGE_KEYS,
  PAGINATION,
  FILE_UPLOAD,
  MESSAGES,
  META_TAGS
}