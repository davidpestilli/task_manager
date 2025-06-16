// Serviços de tarefas
export * from './tasksService'
export * from './taskStepsService'
export * from './taskAssignmentsService'

// Novo serviço de dependências
export * from './taskDependenciesService'

// Exportações nomeadas para facilitar importação
export {
  // Tarefas principais
  createTask,
  updateTask,
  deleteTask,
  getTask,
  getTasks,
  getTasksByProject,
  getTasksByUser,
  updateTaskStatus
} from './tasksService'

export {
  // Etapas de tarefas
  createTaskStep,
  updateTaskStep,
  deleteTaskStep,
  getTaskSteps,
  markStepAsCompleted,
  reorderTaskSteps
} from './taskStepsService'

export {
  // Atribuições de tarefas
  assignTaskToUser,
  unassignTaskFromUser,
  getTaskAssignments,
  getUserTaskAssignments,
  transferTaskAssignment
} from './taskAssignmentsService'

export {
  // Dependências de tarefas
  createTaskDependency,
  removeTaskDependency,
  getTaskDependencies,
  getTaskDependents,
  getProjectDependencyFlow,
  validateCircularDependency,
  checkTaskBlocked,
  resolveDependencies,
  findDependencyPath
} from './taskDependenciesService'