import React, { useState, useMemo } from 'react'
import { ProjectCard, ProjectCardSkeleton } from './ProjectCard'
import { Button, Input } from '@/components/shared/ui'
import { useProjects } from '@/hooks/projects'
import { useModal } from '@/hooks/shared'

/**
 * Lista de projetos com filtros e busca
 * Componente principal para exibir todos os projetos do usuário
 */
export const ProjectList = ({ onProjectSelect }) => {
  const { projects, isLoading, error, reloadProjects } = useProjects()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('updated_at')
  const [sortOrder, setSortOrder] = useState('desc')

  // Filtrar e ordenar projetos
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const searchLower = searchTerm.toLowerCase()
      return (
        project.name.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower) ||
        project.owner?.full_name?.toLowerCase().includes(searchLower)
      )
    })

    // Ordenação
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      // Tratamento especial para datas
      if (sortBy.includes('_at')) {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      // Tratamento para números
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Tratamento para strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      // Fallback para comparação de datas
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

    return filtered
  }, [projects, searchTerm, sortBy, sortOrder])

  // Opções de ordenação
  const sortOptions = [
    { value: 'updated_at', label: 'Última atualização' },
    { value: 'created_at', label: 'Data de criação' },
    { value: 'name', label: 'Nome' },
    { value: 'memberCount', label: 'Número de membros' },
    { value: 'taskCount', label: 'Número de tarefas' }
  ]

  // Handler para seleção de projeto
  const handleProjectClick = (project) => {
    onProjectSelect?.(project)
  }

  // Estado de loading
  if (isLoading && projects.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <ProjectCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  // Estado de erro
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Erro ao carregar projetos</h3>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <Button
            onClick={reloadProjects}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros e busca */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Busca */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Ordenação */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title={`Ordenar ${sortOrder === 'asc' ? 'decrescente' : 'crescente'}`}
          >
            <svg 
              className={`w-4 h-4 transform transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredAndSortedProjects.length} de {projects.length} projetos
          {searchTerm && ` encontrados para "${searchTerm}"`}
        </p>

        {isLoading && (
          <div className="flex items-center text-sm text-gray-500">
            <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Atualizando...
          </div>
        )}
      </div>

      {/* Lista de projetos */}
      {filteredAndSortedProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={handleProjectClick}
            />
          ))}
        </div>
      ) : (
        <EmptyState searchTerm={searchTerm} />
      )}
    </div>
  )
}

// Estado vazio
const EmptyState = ({ searchTerm }) => {
  return (
    <div className="text-center py-12">
      <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {searchTerm ? 'Nenhum projeto encontrado' : 'Nenhum projeto ainda'}
      </h3>
      
      <p className="text-gray-600 max-w-md mx-auto">
        {searchTerm 
          ? `Não encontramos projetos que correspondam a "${searchTerm}". Tente alterar os termos de busca.`
          : 'Você ainda não possui projetos. Crie seu primeiro projeto para começar a organizar suas tarefas.'
        }
      </p>
    </div>
  )
}

export default ProjectList