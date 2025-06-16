/**
 * Exports centralizados dos componentes de layout
 * 
 * Permite importação fácil de todos os componentes
 * de layout da aplicação
 */

// Componentes principais
export { default as Layout } from './Layout.jsx'
export { default as Header } from './Header.jsx'
export { default as Sidebar } from './Sidebar.jsx'
export { default as Footer } from './Footer.jsx'

// Named exports do Layout
export {
  AuthLayout,
  SettingsLayout,
  ProjectLayout,
  ModalLayout,
  ErrorLayout,
  ResponsiveLayout
} from './Layout.jsx'

// Named exports do Header
export {
  AuthHeader,
  ResponsiveHeader
} from './Header.jsx'

// Named exports do Sidebar
export {
  MobileSidebar,
  ResponsiveSidebar,
  MiniSidebar
} from './Sidebar.jsx'

// Named exports do Footer
export {
  StickyFooter,
  AuthFooter,
  CompactFooter,
  StatusFooter
} from './Footer.jsx'
