import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsService } from '@/services/projects'
import { useProjectContext } from '@/context/ProjectContext'
import { toast } from 'react-hot-toast'

/**
 * Hook para gerenciar lista de projetos
 * Integra React Query com contexto local
 */
export const useProjects = () => {
  const queryClient = useQueryClient()
  const { 
    projects, 
    isLoading: contextLoading, 
    error: contextError,
    loadProjects,
    clearError
  } = useProjectContext()

  // Query para buscar projetos
  const {
    data: queryProjects,
    isLoading: queryLoading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsService.getProjects,
    staleTime: 1000 * 60 * 5, // 5 minutos
    cacheTime: 1000 * 60 * 10, // 10 minutos
    onSuccess: (data) => {
      // Sincronizar com contexto se necessário
      if (data?.length !== projects?.length) {
        loadProjects()
      }
    },
    onError: (error) => {
      toast.error('Erro ao carregar projetos')
    }
  })

  // Mutation para criar projeto
  const createProjectMutation = useMutation({
    mutationFn: projectsService.createProject,
    onSuccess: (newProject) => {
      // Invalidar cache
      queryClient.invalidateQueries(['projects'])
      
      // Atualizar contexto
      loadProjects()
      
      toast.success('Projeto criado com sucesso!')
      
      return newProject
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao criar projeto')
    }
  })

  // Mutation para atualizar projeto
  const updateProjectMutation = useMutation({
    mutationFn: ({ projectId, updates }) => 
      projectsService.updateProject(projectId, updates),
    onSuccess: (updatedProject) => {
      // Invalidar cache específico
      queryClient.invalidateQueries(['projects'])
      queryClient.invalidateQueries(['project', updatedProject.id])
      
      toast.success('Projeto atualizado com sucesso!')
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar projeto')
    }
  })

  // Mutation para deletar projeto
  const deleteProjectMutation = useMutation({
    mutationFn: projectsService.deleteProject,
    onSuccess: (_, projectId) => {
      // Invalidar cache
      queryClient.invalidateQueries(['projects'])
      queryClient.removeQueries(['project', projectId])
      
      toast.success('Projeto removido com sucesso!')
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao remover projeto')
    }
  })

  // Mutation para buscar projetos
  const searchProjectsMutation = useMutation({
    mutationFn: projectsService.searchProjects,
    onError: (error) => {
      toast.error('Erro na busca')
    }
  })

  // Função para criar projeto
  const createProject = async (projectData) => {
    try {
      clearError()
      const result = await createProjectMutation.mutateAsync(projectData)
      return result
    } catch (error) {
      throw error
    }
  }

  // Função para atualizar projeto
  const updateProject = async (projectId, updates) => {
    try {
      clearError()
      const result = await updateProjectMutation.mutateAsync({ projectId, updates })
      return result
    } catch (error) {
      throw error
    }
  }

  // Função para deletar projeto
  const deleteProject = async (projectId) => {
    try {
      clearError()
      await deleteProjectMutation.mutateAsync(projectId)
    } catch (error) {
      throw error
    }
  }

  // Função para buscar projetos
  const searchProjects = async (searchTerm) => {
    try {
      clearError()
      const results = await searchProjectsMutation.mutateAsync(searchTerm)
      return results
    } catch (error) {
      throw error
    }
  }

  // Função para recarregar projetos
  const reloadProjects = () => {
    refetch()
    loadProjects()
  }

  return {
    // Dados
    projects: queryProjects || projects || [],
    
    // Estados de loading
    isLoading: queryLoading || contextLoading || createProjectMutation.isLoading,
    isCreating: createProjectMutation.isLoading,
    isUpdating: updateProjectMutation.isLoading,
    isDeleting: deleteProjectMutation.isLoading,
    isSearching: searchProjectsMutation.isLoading,
    
    // Erros
    error: queryError || contextError,
    
    // Ações
    createProject,
    updateProject,
    deleteProject,
    searchProjects,
    reloadProjects,
    refetch,
    
    // Estados das mutations
    createProjectError: createProjectMutation.error,
    updateProjectError: updateProjectMutation.error,
    deleteProjectError: deleteProjectMutation.error,
    searchProjectsError: searchProjectsMutation.error,
    
    // Dados das mutations
    searchResults: searchProjectsMutation.data
  }
}