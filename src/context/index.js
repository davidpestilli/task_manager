/**
 * Exportações centralizadas dos contextos da aplicação
 */

// Contexto de autenticação
export { AuthProvider, useAuthContext } from './AuthContext.jsx'

// Contexto de projetos
export { ProjectProvider, useProjectContext } from './ProjectContext.jsx'

// Contexto de tarefas
export { TaskProvider, useTaskContext } from './TaskContext.jsx'

// Contexto de notificações
export { NotificationProvider, useNotificationContext } from './NotificationContext.jsx'

// Contexto de tema (se implementado futuramente)
// export { ThemeProvider, useThemeContext } from './ThemeContext.jsx'