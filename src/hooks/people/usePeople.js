import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useContext } from 'react'
import { peopleService } from '@/services/people'
import { ProjectContext } from '@/context'
import { toast } from 'react-hot-toast'

/**
 * Hook para gerenciamento de pessoas em projetos
 * @param {Object} options - Opções do hook
 * @returns {Object} Dados e funções para gestão de pessoas
 */
export function usePeople(options = {}) {
  const { selectedProject } = useContext(ProjectContext)
  const queryClient = useQueryClient()
  
  const projectId = options.projectId || selectedProject?.id

  // Query para buscar membros do projeto
  const {
    data: people = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['people', projectId],
    queryFn: () => peopleService.getProjectMembers(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    cacheTime: 1000 * 60 * 10, // 10 minutos
    onError: (error) => {
      console.error('Erro ao carregar pessoas:', error)
      toast.error('Falha ao carregar membros do projeto')
    }
  })

  // Mutation para adicionar pessoa ao projeto
  const addPersonMutation = useMutation({
    mutationFn: ({ email, role = 'member' }) => 
      peopleService.addPersonToProject(projectId, email, role),
    onSuccess: (newPerson) => {
      // Invalidar e atualizar cache
      queryClient.invalidateQueries(['people', projectId])
      queryClient.invalidateQueries(['projects'])
      
      toast.success(`${newPerson.full_name} foi adicionado ao projeto`)
    },
    onError: (error) => {
      console.error('Erro ao adicionar pessoa:', error)
      toast.error(error.message || 'Falha ao adicionar pessoa ao projeto')
    }
  })

  // Mutation para remover pessoa do projeto
  const removePersonMutation = useMutation({
    mutationFn: (userId) => peopleService.removePersonFromProject(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['people', projectId])
      queryClient.invalidateQueries(['projects'])
      toast.success('Pessoa removida do projeto')
    },
    onError: (error) => {
      console.error('Erro ao remover pessoa:', error)
      toast.error(error.message || 'Falha ao remover pessoa do projeto')
    }
  })

  // Mutation para atualizar role da pessoa
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }) => 
      peopleService.updatePersonRole(projectId, userId, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries(['people', projectId])
      toast.success('Role atualizado com sucesso')
    },
    onError: (error) => {
      console.error('Erro ao atualizar role:', error)
      toast.error(error.message || 'Falha ao atualizar role')
    }
  })

  // Função para adicionar pessoa
  const addPerson = async (email, role = 'member') => {
    if (!projectId) {
      toast.error('Nenhum projeto selecionado')
      return
    }

    if (!email?.trim()) {
      toast.error('Email é obrigatório')
      return
    }

    try {
      await addPersonMutation.mutateAsync({ email: email.trim(), role })
    } catch (error) {
      // Erro já tratado na mutation
    }
  }

  // Função para remover pessoa
  const removePerson = async (userId) => {
    if (!projectId || !userId) {
      toast.error('Dados inválidos para remoção')
      return
    }

    try {
      await removePersonMutation.mutateAsync(userId)
    } catch (error) {
      // Erro já tratado na mutation
    }
  }

  // Função para atualizar role
  const updatePersonRole = async (userId, newRole) => {
    if (!projectId || !userId || !newRole) {
      toast.error('Dados inválidos para atualização')
      return
    }

    try {
      await updateRoleMutation.mutateAsync({ userId, newRole })
    } catch (error) {
      // Erro já tratado na mutation
    }
  }

  // Filtrar pessoas por diferentes critérios
  const filterPeople = (criteria = {}) => {
    let filtered = [...people]

    if (criteria.role && criteria.role !== 'all') {
      filtered = filtered.filter(person => person.role === criteria.role)
    }

    if (criteria.search && criteria.search.trim()) {
      const searchTerm = criteria.search.toLowerCase().trim()
      filtered = filtered.filter(person => 
        person.full_name?.toLowerCase().includes(searchTerm) ||
        person.email?.toLowerCase().includes(searchTerm)
      )
    }

    return filtered
  }

  // Estatísticas gerais das pessoas
  const stats = {
    total: people.length,
    owners: people.filter(p => p.role === 'owner').length,
    admins: people.filter(p => p.role === 'admin').length,
    members: people.filter(p => p.role === 'member').length
  }

  return {
    // Dados
    people,
    stats,
    isLoading,
    error,
    
    // Estados das mutations
    isAddingPerson: addPersonMutation.isLoading,
    isRemovingPerson: removePersonMutation.isLoading,
    isUpdatingRole: updateRoleMutation.isLoading,
    
    // Funções
    addPerson,
    removePerson,
    updatePersonRole,
    filterPeople,
    refetch,
    
    // Utilities
    hasError: !!error,
    isEmpty: !isLoading && people.length === 0,
    canAddPeople: !!projectId
  }
}