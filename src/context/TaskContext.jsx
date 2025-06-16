import React, { createContext, useContext, useReducer, useCallback } from 'react'

// Estado inicial do contexto de tarefas
const initialState = {
  // Tarefas por projeto
  tasksByProject: {},
  
  // Tarefa atualmente selecionada
  selectedTask: null,
  
  // Filtros ativos
  filters: {
    status: 'all',
    assignedUser: null,
    search: '',
    orderBy: 'created_at',
    orderDirection: 'desc'
  },
  
  // Estado de carregamento
  loading: {
    tasks: false,
    selectedTask: false,
    updating: false,
    creating: false
  },
  
  // Mensagens de erro
  errors: {
    tasks: null,
    selectedTask: null,
    update: null,
    create: null
  },
  
  // Cache de estatísticas
  stats: {
    byProject: {},
    byUser: {}
  }
}

// Action types
const ACTION_TYPES = {
  // Loading states
  SET_LOADING: 'SET_LOADING',
  
  // Error handling
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Tasks operations
  SET_TASKS: 'SET_TASKS',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  REMOVE_TASK: 'REMOVE_TASK',
  
  // Selected task
  SET_SELECTED_TASK: 'SET_SELECTED_TASK',
  CLEAR_SELECTED_TASK: 'CLEAR_SELECTED_TASK',
  
  // Steps operations
  UPDATE_TASK_STEPS: 'UPDATE_TASK_STEPS',
  
  // Assignments operations
  UPDATE_TASK_ASSIGNMENTS: 'UPDATE_TASK_ASSIGNMENTS',
  
  // Filters
  SET_FILTERS: 'SET_FILTERS',
  RESET_FILTERS: 'RESET_FILTERS',
  
  // Stats
  SET_STATS: 'SET_STATS',
  
  // Reset
  RESET_STATE: 'RESET_STATE'
}

// Reducer para gerenciar o estado das tarefas
const taskReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value
        }
      }

    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.error
        }
      }

    case ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: null
        }
      }

    case ACTION_TYPES.SET_TASKS:
      return {
        ...state,
        tasksByProject: {
          ...state.tasksByProject,
          [action.payload.projectId]: action.payload.tasks
        }
      }

    case ACTION_TYPES.ADD_TASK:
      const projectTasks = state.tasksByProject[action.payload.projectId] || []
      return {
        ...state,
        tasksByProject: {
          ...state.tasksByProject,
          [action.payload.projectId]: [action.payload.task, ...projectTasks]
        }
      }

    case ACTION_TYPES.UPDATE_TASK:
      const updatedTasks = (state.tasksByProject[action.payload.projectId] || []).map(task =>
        task.id === action.payload.task.id 
          ? { ...task, ...action.payload.task }
          : task
      )
      
      return {
        ...state,
        tasksByProject: {
          ...state.tasksByProject,
          [action.payload.projectId]: updatedTasks
        },
        selectedTask: state.selectedTask?.id === action.payload.task.id 
          ? { ...state.selectedTask, ...action.payload.task }
          : state.selectedTask
      }

    case ACTION_TYPES.REMOVE_TASK:
      const filteredTasks = (state.tasksByProject[action.payload.projectId] || [])
        .filter(task => task.id !== action.payload.taskId)
      
      return {
        ...state,
        tasksByProject: {
          ...state.tasksByProject,
          [action.payload.projectId]: filteredTasks
        },
        selectedTask: state.selectedTask?.id === action.payload.taskId 
          ? null 
          : state.selectedTask
      }

    case ACTION_TYPES.SET_SELECTED_TASK:
      return {
        ...state,
        selectedTask: action.payload.task
      }

    case ACTION_TYPES.CLEAR_SELECTED_TASK:
      return {
        ...state,
        selectedTask: null
      }

    case ACTION_TYPES.UPDATE_TASK_STEPS:
      // Atualizar etapas na tarefa selecionada e na lista de tarefas
      let updatedSelectedTask = state.selectedTask
      if (state.selectedTask?.id === action.payload.taskId) {
        updatedSelectedTask = {
          ...state.selectedTask,
          task_steps: action.payload.steps
        }
      }

      const tasksWithUpdatedSteps = Object.keys(state.tasksByProject).reduce((acc, projectId) => {
        const tasks = state.tasksByProject[projectId].map(task =>
          task.id === action.payload.taskId 
            ? { ...task, task_steps: action.payload.steps }
            : task
        )
        acc[projectId] = tasks
        return acc
      }, {})

      return {
        ...state,
        tasksByProject: tasksWithUpdatedSteps,
        selectedTask: updatedSelectedTask
      }

    case ACTION_TYPES.UPDATE_TASK_ASSIGNMENTS:
      // Atualizar atribuições na tarefa selecionada e na lista de tarefas
      let updatedSelectedTaskAssignments = state.selectedTask
      if (state.selectedTask?.id === action.payload.taskId) {
        updatedSelectedTaskAssignments = {
          ...state.selectedTask,
          task_assignments: action.payload.assignments
        }
      }

      const tasksWithUpdatedAssignments = Object.keys(state.tasksByProject).reduce((acc, projectId) => {
        const tasks = state.tasksByProject[projectId].map(task =>
          task.id === action.payload.taskId 
            ? { ...task, task_assignments: action.payload.assignments }
            : task
        )
        acc[projectId] = tasks
        return acc
      }, {})

      return {
        ...state,
        tasksByProject: tasksWithUpdatedAssignments,
        selectedTask: updatedSelectedTaskAssignments
      }

    case ACTION_TYPES.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload.filters
        }
      }

    case ACTION_TYPES.RESET_FILTERS:
      return {
        ...state,
        filters: {
          status: 'all',
          assignedUser: null,
          search: '',
          orderBy: 'created_at',
          orderDirection: 'desc'
        }
      }

    case ACTION_TYPES.SET_STATS:
      return {
        ...state,
        stats: {
          ...state.stats,
          [action.payload.type]: {
            ...state.stats[action.payload.type],
            [action.payload.key]: action.payload.stats
          }
        }
      }

    case ACTION_TYPES.RESET_STATE:
      return initialState

    default:
      return state
  }
}

// Contexto
const TaskContext = createContext()

/**
 * Provider do contexto de tarefas
 */
export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  // Actions para loading
  const setLoading = useCallback((key, value) => {
    dispatch({
      type: ACTION_TYPES.SET_LOADING,
      payload: { key, value }
    })
  }, [])

  // Actions para errors
  const setError = useCallback((key, error) => {
    dispatch({
      type: ACTION_TYPES.SET_ERROR,
      payload: { key, error }
    })
  }, [])

  const clearError = useCallback((key) => {
    dispatch({
      type: ACTION_TYPES.CLEAR_ERROR,
      payload: { key }
    })
  }, [])

  // Actions para tarefas
  const setTasks = useCallback((projectId, tasks) => {
    dispatch({
      type: ACTION_TYPES.SET_TASKS,
      payload: { projectId, tasks }
    })
  }, [])

  const addTask = useCallback((projectId, task) => {
    dispatch({
      type: ACTION_TYPES.ADD_TASK,
      payload: { projectId, task }
    })
  }, [])

  const updateTask = useCallback((projectId, task) => {
    dispatch({
      type: ACTION_TYPES.UPDATE_TASK,
      payload: { projectId, task }
    })
  }, [])

  const removeTask = useCallback((projectId, taskId) => {
    dispatch({
      type: ACTION_TYPES.REMOVE_TASK,
      payload: { projectId, taskId }
    })
  }, [])

  // Actions para tarefa selecionada
  const setSelectedTask = useCallback((task) => {
    dispatch({
      type: ACTION_TYPES.SET_SELECTED_TASK,
      payload: { task }
    })
  }, [])

  const clearSelectedTask = useCallback(() => {
    dispatch({
      type: ACTION_TYPES.CLEAR_SELECTED_TASK
    })
  }, [])

  // Actions para etapas
  const updateTaskSteps = useCallback((taskId, steps) => {
    dispatch({
      type: ACTION_TYPES.UPDATE_TASK_STEPS,
      payload: { taskId, steps }
    })
  }, [])

  // Actions para atribuições
  const updateTaskAssignments = useCallback((taskId, assignments) => {
    dispatch({
      type: ACTION_TYPES.UPDATE_TASK_ASSIGNMENTS,
      payload: { taskId, assignments }
    })
  }, [])

  // Actions para filtros
  const setFilters = useCallback((filters) => {
    dispatch({
      type: ACTION_TYPES.SET_FILTERS,
      payload: { filters }
    })
  }, [])

  const resetFilters = useCallback(() => {
    dispatch({
      type: ACTION_TYPES.RESET_FILTERS
    })
  }, [])

  // Actions para estatísticas
  const setStats = useCallback((type, key, stats) => {
    dispatch({
      type: ACTION_TYPES.SET_STATS,
      payload: { type, key, stats }
    })
  }, [])

  // Reset completo do estado
  const resetState = useCallback(() => {
    dispatch({
      type: ACTION_TYPES.RESET_STATE
    })
  }, [])

  // Selectors úteis
  const selectors = {
    // Buscar tarefas de um projeto
    getTasksByProject: (projectId) => {
      return state.tasksByProject[projectId] || []
    },

    // Filtrar tarefas baseado nos filtros ativos
    getFilteredTasks: (projectId) => {
      const tasks = state.tasksByProject[projectId] || []
      const { status, assignedUser, search } = state.filters

      return tasks.filter(task => {
        // Filtro por status
        if (status !== 'all' && task.status !== status) {
          return false
        }

        // Filtro por usuário atribuído
        if (assignedUser) {
          const isAssigned = task.task_assignments?.some(
            assignment => assignment.user_id === assignedUser
          )
          if (!isAssigned) return false
        }

        // Filtro por busca
        if (search.trim()) {
          const searchLower = search.toLowerCase()
          const nameMatch = task.name.toLowerCase().includes(searchLower)
          const descMatch = task.description?.toLowerCase().includes(searchLower)
          if (!nameMatch && !descMatch) return false
        }

        return true
      })
    },

    // Estatísticas rápidas
    getQuickStats: (projectId) => {
      const tasks = state.tasksByProject[projectId] || []
      
      return {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'concluída').length,
        inProgress: tasks.filter(t => t.status === 'em_andamento').length,
        notStarted: tasks.filter(t => t.status === 'não_iniciada').length,
        paused: tasks.filter(t => t.status === 'pausada').length
      }
    }
  }

  const value = {
    // Estado
    ...state,
    
    // Actions
    setLoading,
    setError,
    clearError,
    setTasks,
    addTask,
    updateTask,
    removeTask,
    setSelectedTask,
    clearSelectedTask,
    updateTaskSteps,
    updateTaskAssignments,
    setFilters,
    resetFilters,
    setStats,
    resetState,
    
    // Selectors
    ...selectors
  }

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  )
}

/**
 * Hook para usar o contexto de tarefas
 */
export const useTaskContext = () => {
  const context = useContext(TaskContext)
  
  if (!context) {
    throw new Error('useTaskContext deve ser usado dentro de TaskProvider')
  }
  
  return context
}

export default TaskContext