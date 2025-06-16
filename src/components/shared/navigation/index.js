/**
 * Exports centralizados dos componentes de navegação
 * 
 * Permite importação fácil de todos os componentes
 * de navegação compartilhados
 */

// Componentes principais
export { default as Breadcrumb } from './Breadcrumb.jsx'
export { default as NavTabs } from './NavTabs.jsx'
export { default as BackButton } from './BackButton.jsx'

// Named exports do Breadcrumb
export {
  useBreadcrumb,
  ProjectBreadcrumb,
  ResponsiveBreadcrumb
} from './Breadcrumb.jsx'

// Named exports do NavTabs
export {
  VerticalNavTabs,
  ProjectNavTabs,
  SettingsNavTabs,
  ResponsiveNavTabs
} from './NavTabs.jsx'

// Named exports do BackButton
export {
  BackToProjectsButton,
  BackToDashboardButton,
  BackToProjectButton,
  SmartBackButton,
  BreadcrumbWithBack,
  useBackNavigation,
  ConfirmBackButton,
  ResponsiveBackButton
} from './BackButton.jsx'
