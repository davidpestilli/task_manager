import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { projectsService } from '@/services/projects'
import { useAuth } from '@/hooks/auth'

/**
 * Contexto para gerenciar estado global dos projetos
 * Mantém projeto ativo, lista de projetos e operações relacionadas
 */

const ProjectContext = createContext()

// Estados possíveis
const PROJECT_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_PROJECTS: 'SET_PROJECTS',
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  SET_ACTIVE_PROJECT: 'SET_ACTIVE_PROJECT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
}

// Estado inicial
const initialState = {
  projects: [],
  activeProject: null,
  isLoading: false,
  error: null
}

// Reducer para gerenciar estado
const projectReducer = (state, action) => {
  switch (action.type) {
    case PROJECT_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error
      }

    case PROJECT_ACTIONS.SET_PROJECTS:
      return {
        ...state,
        projects: action.payload,
        isLoading: false,
        error: null
      }

    case PROJECT_ACTIONS.ADD_PROJECT:
      return {
        ...state,
        projects: [action.payload, ...state.projects],
        error: null
      }

    case PROJECT_ACTIONS.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? action.payload : project
        ),
        activeProject: state.activeProject?.id === action.payload.id 
          ? action.payload 
          : state.activeProject,
        error: null
      }

    case PROJECT_ACTIONS.DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
        activeProject: state.activeProject?.id === action.payload 
          ? null 
          : state.activeProject,
        error: null
      }

    case PROJECT_ACTIONS.SET_ACTIVE_PROJECT:
      return {
        ...state,
        activeProject: action.payload,
        error: null
      }

    case PROJECT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }

    case PROJECT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }

    default:
      return state
  }
}

/**
 * Provider do contexto de projetos
 */
export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState)
  const { user, isAuthenticated } = useAuth()

  // Carregar projetos quando usuário autenticar
  useEffect(() => {
    if (isAuthenticated && user) {
      loadProjects()
    }
  }, [isAuthenticated, user])

  // Carregar lista de projetos
  const loadProjects = async () => {
    try {
      dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: true })
      const projects = await projectsService.getProjects()
      dispatch({ type: PROJECT_ACTIONS.SET_PROJECTS, payload: projects })
    } catch (error) {
      dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: error.message })
    }
  }

  // Criar novo projeto
  const createProject = async (projectData) => {
    try {
      dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: true })
      const newProject = await projectsService.createProject(projectData)
      
      // Recarregar projetos para ter dados completos
      await loadProjects()
      
      return newProject
    } catch (error) {
      dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: error.message })
      throw error
    }
  }

  // Atualizar projeto
  const updateProject = async (projectId, updates) => {
    try {
      const updatedProject = await projectsService.updateProject(projectId, updates)
      dispatch({ type: PROJECT_ACTIONS.UPDATE_PROJECT, payload: updatedProject })
      return updatedProject
    } catch (error) {
      dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: error.message })
      throw error
    }
  }

  // Deletar projeto
  const deleteProject = async (projectId) => {
    try {
      await projectsService.deleteProject(projectId)
      dispatch({ type: PROJECT_ACTIONS.DELETE_PROJECT, payload: projectId })
    } catch (error) {
      dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: error.message })
      throw error
    }
  }

  // Selecionar projeto ativo
  const setActiveProject = async (projectId) => {
    try {
      if (!projectId) {
        dispatch({ type: PROJECT_ACTIONS.SET_ACTIVE_PROJECT, payload: null })
        return
      }

      // Buscar projeto completo se não estiver no cache
      let project = state.projects.find(p => p.id === projectId)
      
      if (!project) {
        project = await projectsService.getProject(projectId)
      }

      dispatch({ type: PROJECT_ACTIONS.SET_ACTIVE_PROJECT, payload: project })
      
      // Salvar no localStorage para persistir seleção
      localStorage.setItem('taskManager:activeProjectId', projectId)
      
      return project
    } catch (error) {
      dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: error.message })
      throw error
    }
  }

  // Buscar projetos
  const searchProjects = async (searchTerm) => {
    try {
      const results = await projectsService.searchProjects(searchTerm)
      return results
    } catch (error) {
      dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: error.message })
      throw error
    }
  }

  // Limpar erro
  const clearError = () => {
    dispatch({ type: PROJECT_ACTIONS.CLEAR_ERROR })
  }

  // Verificar se usuário é owner de um projeto
  const isProjectOwner = (projectId, userId = user?.id) => {
    if (!userId) return false
    const project = state.projects.find(p => p.id === projectId)
    return project?.owner_id === userId
  }

  // Restaurar projeto ativo do localStorage
  useEffect(() => {
    const savedProjectId = localStorage.getItem('taskManager:activeProjectId')
    if (savedProjectId && state.projects.length > 0 && !state.activeProject) {
      const project = state.projects.find(p => p.id === savedProjectId)
      if (project) {
        setActiveProject(savedProjectId)
      }
    }
  }, [state.projects])

  const value = {
    // Estado
    ...state,
    
    // Ações
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    setActiveProject,
    searchProjects,
    clearError,
    
    // Utilitários
    isProjectOwner
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

/**
 * Hook para usar o contexto de projetos
 */
export const useProjectContext = () => {
  const context = useContext(ProjectContext)
  
  if (!context) {
    throw new Error('useProjectContext deve ser usado dentro de ProjectProvider')
  }
  
  return context
}