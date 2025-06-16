import React, { useState, useMemo } from 'react'
import { PersonCard } from './PersonCard'
import { PersonFilters } from './PersonFilters'
import { Spinner } from '@/components/shared/ui'
import { usePeople } from '@/hooks/people'
import { useAuth } from '@/hooks/auth'
import { cn } from '@/utils/helpers'

/**
 * Lista de pessoas no projeto com filtros e gerenciamento
 * @param {Object} props - Propriedades do componente
 * @param {string} props.projectId - ID do projeto
 * @param {boolean} props.showFilters - Mostrar filtros
 * @param {string} props.layout - Layout da grid ('auto', '1', '2', '3', '4')
 * @returns {JSX.Element}
 */
export function PersonList({
  projectId,
  showFilters = true,
  layout = 'auto',
  className
}) {
  const { user: currentUser } = useAuth()
  const {
    people,
    stats,
    isLoading,
    error,
    removePerson,
    updatePersonRole,
    isRemovingPerson,
    isUpdatingRole,
    hasError,
    isEmpty
  } = usePeople({ projectId })

  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    workload: 'all',
    sortBy: 'name'
  })

  // Verificar permissões do usuário atual
  const currentUserData = people.find(p => p.id === currentUser?.id)
  const canManagePeople = currentUserData?.role === 'owner' || currentUserData?.role === 'admin'

  // Filtrar e ordenar pessoas
  const filteredPeople = useMemo(() => {
    let filtered = [...people]

    // Filtro por busca
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim()
      filtered = filtered.filter(person =>
        person.full_name?.toLowerCase().includes(searchTerm) ||
        person.email?.toLowerCase().includes(searchTerm)
      )
    }

    // Filtro por role
    if (filters.role !== 'all') {
      filtered = filtered.filter(person => person.role === filters.role)
    }

    // Filtro por carga de trabalho (implementação simplificada)
    if (filters.workload !== 'all') {
      // TODO: Implementar após ter dados de tarefas carregados
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.full_name.localeCompare(b.full_name)
        case 'role':
          const roleOrder = { owner: 0, admin: 1, member: 2 }
          return roleOrder[a.role] - roleOrder[b.role]
        case 'joined':
          return new Date(b.joinedAt) - new Date(a.joinedAt)
        default:
          return 0
      }
    })

    return filtered
  }, [people, filters])

  // Configurar layout da grid
  const getGridClasses = () => {
    const baseClasses = 'grid gap-6'
    
    switch (layout) {
      case '1':
        return `${baseClasses} grid-cols-1`
      case '2':
        return `${baseClasses} grid-cols-1 lg:grid-cols-2`
      case '3':
        return `${baseClasses} grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
      case '4':
        return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
      case 'auto':
      default:
        return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4`
    }
  }

  // Handlers
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleRemovePerson = async (userId) => {
    if (window.confirm('Tem certeza que deseja remover esta pessoa do projeto?')) {
      await removePerson(userId)
    }
  }

  const handleUpdateRole = async (userId, newRole) => {
    await updatePersonRole(userId, newRole)
  }

  // Estados de loading e erro
  if (isLoading) {
    return (
      <div className="space-y-6">
        {showFilters && (
          <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        )}
        <div className={getGridClasses()}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erro ao carregar pessoas
          </h3>
          <p className="text-gray-600 mb-4">
            {error?.message || 'Não foi possível carregar a lista de pessoas'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Filtros */}
      {showFilters && (
        <PersonFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          stats={stats}
        />
      )}

      {/* Estatísticas resumidas */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de membros</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Owners</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.owners}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.admins}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Membros</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.members}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de pessoas */}
      {isEmpty ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma pessoa encontrada
          </h3>
          <p className="text-gray-600">
            {filters.search || filters.role !== 'all' 
              ? 'Tente ajustar os filtros para ver mais resultados.'
              : 'Este projeto ainda não possui membros.'
            }
          </p>
        </div>
      ) : filteredPeople.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum resultado encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            Não encontramos pessoas que correspondam aos filtros aplicados.
          </p>
          <button
            onClick={() => setFilters({ search: '', role: 'all', workload: 'all', sortBy: 'name' })}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className={getGridClasses()}>
          {filteredPeople.map(person => (
            <PersonCard
              key={person.id}
              person={person}
              projectId={projectId}
              onRemove={handleRemovePerson}
              onUpdateRole={handleUpdateRole}
              canManage={canManagePeople}
            />
          ))}
        </div>
      )}

      {/* Indicadores de loading para ações */}
      {(isRemovingPerson || isUpdatingRole) && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <Spinner size="sm" />
            <span className="text-gray-700">
              {isRemovingPerson ? 'Removendo pessoa...' : 'Atualizando role...'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}