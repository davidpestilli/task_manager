// Componentes básicos de tarefas
export { default as TaskCard } from './TaskCard'
export { default as TaskList } from './TaskList'
export { default as TaskModal } from './TaskModal'
export { default as CreateTaskModal } from './CreateTaskModal'
export { default as TaskSteps } from './TaskSteps'
export { default as TaskStatusBadge } from './TaskStatusBadge'
export { default as TaskFilters } from './TaskFilters'

// Novos componentes de dependências
export { default as DependencyFlow } from './DependencyFlow'
export { default as DependencySelector } from './DependencySelector'
export { default as FlowChart } from './FlowChart'

// Componentes de fluxograma
export { default as FlowNode } from './FlowNode'
export { default as FlowEdge } from './FlowEdge'

// Exportações adicionais do DependencyFlow
export {
  DependencyFlowViewer,
  TaskDependencyView
} from './DependencyFlow'

// Tipos de nós e arestas para React Flow
export { nodeTypes } from './FlowNode'
export { edgeTypes } from './FlowEdge'

// Componentes especializados do FlowNode
export {
  SimpleFlowNode,
  OverviewFlowNode
} from './FlowNode'

// Componentes especializados do FlowEdge
export {
  SimpleFlowEdge,
  BlockingFlowEdge
} from './FlowEdge'

export { TaskCard } from './TaskCard'
export { TaskList } from './TaskList'
export { TaskModal } from './TaskModal'
export { CreateTaskModal } from './CreateTaskModal'
export { TaskSteps } from './TaskSteps'
export { TaskStatusBadge } from './TaskStatusBadge'
export { TaskFilters } from './TaskFilters'
export { DependencyFlow } from './DependencyFlow'
export { DragDropArea } from './DragDropArea'
export { TaskComments, TaskCommentsCompact } from './TaskComments'
export { TaskHistory, TaskHistoryCompact } from './TaskHistory'