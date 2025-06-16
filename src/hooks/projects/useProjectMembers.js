import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectMembersService } from '@/services/projects'
import { useAuth } from '@/hooks/auth'
import { toast } from 'react-hot-toast'

/**
 * Hook para gerenciar membros de um projeto
 * @param {string} projectId - ID do projeto
 */
export const useProjectMembers = (projectId) => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // Query para buscar membros do projeto
  const {
    data: members = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => projectMembersService.getProjectMembers(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 3, // 3 minutos
    onError: (error) => {
      toast.error('Erro ao carregar membros')
    }
  })

  // Mutation para adicionar membro
  const addMemberMutation = useMutation({
    mutationFn: ({ userEmail, role }) => 
      projectMembersService.addProjectMember(projectId, userEmail, role),
    onSuccess: (newMember) => {
      // Atualizar cache
      queryClient.setQueryData(['project-members', projectId], (oldMembers = []) => [
        ...oldMembers,
        newMember
      ])
      
      // Invalidar projeto para atualizar contadores
      queryClient.invalidateQueries(['project', projectId])
      queryClient.invalidateQueries(['projects'])
      
      toast.success(`${newMember.user.full_name} foi adicionado ao projeto!`)
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao adicionar membro')
    }
  })

  // Mutation para remover membro
  const removeMemberMutation = useMutation({
    mutationFn: ({ userId }) => 
      projectMembersService.removeProjectMember(projectId, userId),
    onSuccess: (_, { userId, userName }) => {
      // Atualizar cache
      queryClient.setQueryData(['project-members', projectId], (oldMembers = []) =>
        oldMembers.filter(member => member.user_id !== userId)
      )
      
      // Invalidar projeto para atualizar contadores
      queryClient.invalidateQueries(['project', projectId])
      queryClient.invalidateQueries(['projects'])
      
      toast.success(`${userName || 'Membro'} foi removido do projeto`)
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao remover membro')
    }
  })

  // Mutation para atualizar role
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }) => 
      projectMembersService.updateMemberRole(projectId, userId, newRole),
    onSuccess: (updatedMember) => {
      // Atualizar cache
      queryClient.setQueryData(['project-members', projectId], (oldMembers = []) =>
        oldMembers.map(member =>
          member.user_id === updatedMember.user_id ? updatedMember : member
        )
      )
      
      toast.success('Permissões atualizadas!')
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar permissões')
    }
  })

  // Mutation para convidar por email
  const inviteMemberMutation = useMutation({
    mutationFn: ({ userEmail }) => 
      projectMembersService.inviteUserByEmail(projectId, userEmail),
    onSuccess: (result) => {
      // Recarregar membros
      refetch()
      queryClient.invalidateQueries(['project', projectId])
      
      toast.success('Convite enviado com sucesso!')
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao enviar convite')
    }
  })

  // Função para adicionar membro
  const addMember = async (userEmail, role = 'member') => {
    try {
      return await addMemberMutation.mutateAsync({ userEmail, role })
    } catch (error) {
      throw error
    }
  }

  // Função para remover membro
  const removeMember = async (userId, userName) => {
    try {
      await removeMemberMutation.mutateAsync({ userId, userName })
    } catch (error) {
      throw error
    }
  }

  // Função para atualizar role
  const updateMemberRole = async (userId, newRole) => {
    try {
      return await updateRoleMutation.mutateAsync({ userId, newRole })
    } catch (error) {
      throw error
    }
  }

  // Função para convidar por email
  const inviteMember = async (userEmail) => {
    try {
      return await inviteMemberMutation.mutateAsync({ userEmail })
    } catch (error) {
      throw error
    }
  }

  // Encontrar membro específico
  const findMember = (userId) => {
    return members.find(member => member.user_id === userId)
  }

  // Verificar se usuário é membro
  const isMember = (userId = user?.id) => {
    return !!findMember(userId)
  }

  // Obter role do usuário atual
  const currentUserRole = findMember(user?.id)?.role

  // Verificar permissões
  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin'
  const canRemoveMembers = currentUserRole === 'owner' || currentUserRole === 'admin'

  // Estatísticas dos membros
  const memberStats = {
    total: members.length,
    owners: members.filter(m => m.role === 'owner').length,
    admins: members.filter(m => m.role === 'admin').length,
    members: members.filter(m => m.role === 'member').length
  }

  return {
    // Dados
    members,
    
    // Estados
    isLoading: isLoading || addMemberMutation.isLoading,
    isAdding: addMemberMutation.isLoading,
    isRemoving: removeMemberMutation.isLoading,
    isUpdatingRole: updateRoleMutation.isLoading,
    isInviting: inviteMemberMutation.isLoading,
    
    // Erros
    error,
    addError: addMemberMutation.error,
    removeError: removeMemberMutation.error,
    updateRoleError: updateRoleMutation.error,
    inviteError: inviteMemberMutation.error,
    
    // Ações
    addMember,
    removeMember,
    updateMemberRole,
    inviteMember,
    refetch,
    
    // Utilitários
    findMember,
    isMember,
    currentUserRole,
    canManageMembers,
    canRemoveMembers,
    
    // Estatísticas
    memberStats
  }
}