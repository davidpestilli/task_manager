import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsService } from '@/services/projects'
import { useProjectContext } from '@/context/ProjectContext'
import { useAuth } from '@/hooks/auth'
import { toast } from 'react-hot-toast'

/**
 * Hook para gerenciar um projeto específico
 * @param {string} projectId - ID do projeto
 */
export const useProject = (projectId) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { 
    activeProject, 
    setActiveProject, 
    isProjectOwner,
    clearError 
  } = useProjectContext()

  // Query para buscar dados completos do projeto
  const {
    data: project,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsService.getProject(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    onError: (error) => {
      toast.error('Erro ao carregar projeto')
    }
  })

  // Mutation para atualizar projeto
  const updateProjectMutation = useMutation({
    mutationFn: (updates) => projectsService.updateProject(projectId, updates),
    onSuccess: (updatedProject) => {
      // Atualizar cache
      queryClient.setQueryData(['project', projectId], updatedProject)
      queryClient.invalidateQueries(['projects'])
      
      // Atualizar contexto se for o projeto ativo
      if (activeProject?.id === projectId) {
        setActiveProject(projectId)
      }
      
      toast.success('Projeto atualizado!')
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar projeto')
    }
  })

  // Mutation para deletar projeto
  const deleteProjectMutation = useMutation({
    mutationFn: () => projectsService.deleteProject(projectId),
    onSuccess: () => {
      // Limpar cache
      queryClient.removeQueries(['project', projectId])
      queryClient.invalidateQueries(['projects'])
      
      // Limpar projeto ativo se for o deletado
      if (activeProject?.id === projectId) {
        setActiveProject(null)
      }
      
      toast.success('Projeto removido!')
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao remover projeto')
    }
  })

  // Função para atualizar projeto
  const updateProject = async (updates) => {
    try {
      clearError()
      return await updateProjectMutation.mutateAsync(updates)
    } catch (error) {
      throw error
    }
  }

  // Função para deletar projeto
  const deleteProject = async () => {
    try {
      clearError()
      await deleteProjectMutation.mutateAsync()
    } catch (error) {
      throw error
    }
  }

  // Função para ativar este projeto
  const activateProject = async () => {
    try {
      clearError()
      await setActiveProject(projectId)
    } catch (error) {
      throw error
    }
  }

  // Verificar permissões do usuário
  const userRole = project?.members?.find(member => member.user_id === user?.id)?.role
  const isOwner = project?.owner_id === user?.id
  const isAdmin = userRole === 'admin' || isOwner
  const isMember = !!userRole

  // Estatísticas do projeto
  const stats = {
    memberCount: project?.members?.length || 0,
    taskCount: project?.taskCount || 0,
    completedTasks: 0, // TODO: implementar quando tiver tarefas
    progressPercentage: 0 // TODO: implementar quando tiver tarefas
  }

  return {
    // Dados do projeto
    project,
    
    // Estados
    isLoading: isLoading || updateProjectMutation.isLoading,
    isUpdating: updateProjectMutation.isLoading,
    isDeleting: deleteProjectMutation.isLoading,
    
    // Erros
    error,
    updateError: updateProjectMutation.error,
    deleteError: deleteProjectMutation.error,
    
    // Ações
    updateProject,
    deleteProject,
    activateProject,
    refetch,
    
    // Permissões
    userRole,
    isOwner,
    isAdmin,
    isMember,
    canEdit: isAdmin,
    canDelete: isOwner,
    canManageMembers: isAdmin,
    
    // Estatísticas
    stats,
    
    // Estado ativo
    isActive: activeProject?.id === projectId
  }
}