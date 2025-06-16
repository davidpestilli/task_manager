import React, { useState } from 'react'
import { Modal, Button, Input, Card, Avatar, Badge } from '@/components/shared/ui'
import { usePeople } from '@/hooks/people'
import { useDebounce } from '@/hooks/shared'
import { peopleService } from '@/services/people'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { cn } from '@/utils/helpers'

/**
 * Modal para adicionar pessoas ao projeto
 * @param {Object} props - Propriedades do componente
 * @param {boolean} props.isOpen - Se o modal está aberto
 * @param {Function} props.onClose - Callback para fechar modal
 * @param {string} props.projectId - ID do projeto
 * @returns {JSX.Element}
 */
export function AddPersonModal({
  isOpen,
  onClose,
  projectId
}) {
  const { addPerson, isAddingPerson } = usePeople({ projectId })
  
  const [email, setEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState('member')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [mode, setMode] = useState('email') // 'email' ou 'search'

  // Debounce do termo de busca
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Buscar pessoas disponíveis
  const {
    data: availablePeople = [],
    isLoading: isSearching,
    error: searchError
  } = useQuery({
    queryKey: ['available-people', projectId, debouncedSearchTerm],
    queryFn: () => peopleService.searchAvailablePeople(projectId, debouncedSearchTerm),
    enabled: mode === 'search' && debouncedSearchTerm.length >= 2,
    staleTime: 1000 * 60 * 2 // 2 minutos
  })

  // Opções de role
  const roleOptions = [
    { value: 'member', label: 'Membro', description: 'Pode visualizar e editar tarefas' },
    { value: 'admin', label: 'Admin', description: 'Pode gerenciar membros e configurações' },
    { value: 'owner', label: 'Owner', description: 'Controle total do projeto' }
  ]

  // Validação de email simples
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Handlers
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (mode === 'email') {
      if (!email.trim()) {
        toast.error('Email é obrigatório')
        return
      }

      if (!isValidEmail(email.trim())) {
        toast.error('Email inválido')
        return
      }

      await addPerson(email.trim(), selectedRole)
    } else if (mode === 'search' && selectedPerson) {
      await addPerson(selectedPerson.email, selectedRole)
    } else {
      toast.error('Selecione uma pessoa para adicionar')
      return
    }

    // Limpar e fechar modal se sucesso
    if (!isAddingPerson) {
      handleClose()
    }
  }

  const handleClose = () => {
    setEmail('')
    setSearchTerm('')
    setSelectedPerson(null)
    setSelectedRole('member')
    setMode('email')
    onClose()
  }

  const handlePersonSelect = (person) => {
    setSelectedPerson(person)
    setEmail(person.email)
  }

  const switchToEmailMode = () => {
    setMode('email')
    setSearchTerm('')
    setSelectedPerson(null)
  }

  const switchToSearchMode = () => {
    setMode('search')
    setEmail('')
    setSelectedPerson(null)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Adicionar pessoa ao projeto"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Toggle entre modos */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={switchToEmailMode}
            className={cn(
              'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all',
              mode === 'email'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Por email
          </button>
          <button
            type="button"
            onClick={switchToSearchMode}
            className={cn(
              'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all',
              mode === 'search'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Buscar usuários
          </button>
        </div>

        {/* Modo email */}
        {mode === 'email' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email da pessoa
              </label>
              <Input
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />
              <p className="text-sm text-gray-500 mt-1">
                Se a pessoa não tiver conta, ela receberá um convite por email
              </p>
            </div>
          </div>
        )}

        {/* Modo busca */}
        {mode === 'search' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar usuários cadastrados
              </label>
              <Input
                type="text"
                placeholder="Digite nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>

            {/* Resultados da busca */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {isSearching && searchTerm.length >= 2 && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Buscando...</span>
                </div>
              )}

              {searchError && (
                <div className="text-center py-4 text-red-600 text-sm">
                  Erro na busca. Tente novamente.
                </div>
              )}

              {!isSearching && searchTerm.length >= 2 && availablePeople.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Nenhum usuário encontrado
                </div>
              )}

              {availablePeople.map(person => (
                <Card
                  key={person.id}
                  className={cn(
                    'p-3 cursor-pointer transition-all hover:shadow-md',
                    selectedPerson?.id === person.id
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  )}
                  onClick={() => handlePersonSelect(person)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={person.avatar_url}
                      alt={person.full_name}
                      size="sm"
                      fallback={person.full_name}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {person.full_name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {person.email}
                      </p>
                    </div>
                    {selectedPerson?.id === person.id && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {searchTerm.length > 0 && searchTerm.length < 2 && (
              <p className="text-sm text-gray-500 text-center py-2">
                Digite pelo menos 2 caracteres para buscar
              </p>
            )}
          </div>
        )}

        {/* Seleção de role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Role no projeto
          </label>
          <div className="space-y-2">
            {roleOptions.map(option => (
              <label
                key={option.value}
                className={cn(
                  'flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all',
                  selectedRole === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={selectedRole === option.value}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {option.label}
                    </span>
                    <Badge
                      size="xs"
                      variant={option.value === 'owner' ? 'primary' : 
                              option.value === 'admin' ? 'secondary' : 'default'}
                    >
                      {option.value}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {option.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isAddingPerson}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isAddingPerson}
            disabled={
              isAddingPerson ||
              (mode === 'email' && (!email.trim() || !isValidEmail(email.trim()))) ||
              (mode === 'search' && !selectedPerson)
            }
            className="flex-1"
          >
            {isAddingPerson ? 'Adicionando...' : 'Adicionar pessoa'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}