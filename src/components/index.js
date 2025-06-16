// index.js/**
 /* Exports centralizados dos componentes compartilhados
 * 
 * Permite importação fácil de todos os componentes
 * compartilhados do sistema
 */

// Layout components
export * from './layout'

// Navigation components  
export * from './navigation'

// UI components
export * from './ui'

// Re-exports específicos para facilitar importação
export {
  Layout,
  AuthLayout,
  SettingsLayout,
  ProjectLayout,
  Header,
  Sidebar,
  Footer
} from './layout'

export {
  Breadcrumb,
  NavTabs,
  BackButton,
  ProjectBreadcrumb,
  ProjectNavTabs,
  SmartBackButton
} from './navigation'

export {
  Button,
  Input,
  Card,
  Spinner,
  Modal,
  Badge,
  Dropdown,
  Tooltip,
  Avatar,
  Skeleton
} from './ui'