// Exportações de todos os serviços de tarefas
export * from './tasksService'
export * from './taskStepsService'
export * from './taskAssignmentsService'
export * from './taskDependenciesService'

// Exportações nomeadas específicas para facilitar importação
export {
  // Tarefas principais
  createTask,
  updateTask,
  deleteTask,
  getTask,
  getTasks,
  getTasksByProject,
  getTasksByUser,
  updateTaskStatus,
  calculateTaskProgress,
  getTasksStats
} from './tasksService'

// Nota: As funções abaixo devem existir nos respectivos arquivos
// Se algum arquivo não existir ainda, você pode comentar essas exportações


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
