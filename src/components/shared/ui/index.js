// Componentes de UI compartilhados
export { default as Button } from './Button'
export { default as Input } from './Input'
export { default as Modal } from './Modal'
export { default as Card } from './Card'
export { default as Badge } from './Badge'
export { default as Spinner } from './Spinner'
export { default as Toast } from './Toast'
export { default as Dropdown } from './Dropdown'
export { default as Tooltip } from './Tooltip'
export { default as ProgressBar } from './ProgressBar'
export { default as Avatar } from './Avatar'
export { default as Skeleton } from './Skeleton'
export { default as FlowNode } from './FlowNode'
export { default as FlowEdge } from './FlowEdge'
export { default as Chart } from './Chart'
export { default as StatCard } from './StatCard'

// Componente especial para loading de página inteira
export const FullPageSpinner = ({ text = 'Carregando...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Spinner size="lg" className="mx-auto mb-4" />
      <p className="text-gray-600">{text}</p>
    </div>
  </div>
)