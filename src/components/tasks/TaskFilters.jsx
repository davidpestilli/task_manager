import React, { useState, useMemo } from 'react'
import { Button, Input, Dropdown } from '@/components/shared/ui'
import { TaskStatusBadge } from './TaskStatusBadge'
import { useProjectContext } from '@/context/ProjectContext'
import { useDebounce } from '@/hooks/shared'

/**
 * Componente para filtros de tarefas
 * @param {Object} props
 * @param {Object} props.filters - Filtros atuais
 * @param {Function} props.onFiltersChange - Callback ao alterar filtros
 * @param {Function} props.onResetFilters - Callback para resetar filtros
 * @param {string} props.projectId - ID do projeto
 * @param {number} props.taskCount - Número de tarefas filtradas
 * @param {string} props.className - Classes CSS adicionais
 */
export const TaskFilters = ({
  filters,
  onFiltersChange,
  onResetFilters,
  projectId,
  taskCount = 0,
  className = ''
}) => {
  const [searchValue, setSearchValue] = useState(filters.search || '')
  const { getProjectMembers } = useProjectContext()
  
  // Debounce da busca
  const debouncedSearch = useDebounce(searchValue, 300)
  
  // Aplicar busca debounced
  React.useEffect(() => {
    if (debouncedSearch !== filters.search) {
      handleFilterChange('search', debouncedSearch)
    }
  }, [debouncedSearch, filters.search])

  // Membros do projeto para filtro de usuário
  const projectMembers = useMemo(() => {
    return getProjectMembers(projectId) || []
  }, [projectId, getProjectMembers])

  // Opções de status
  const statusOptions = [
    { value: 'all', label: 'Todos os Status', icon: '📋' },
    { value: 'não_iniciada', label: 'Não Iniciada', icon: '⏸️' },
    { value: 'em_andamento', label: 'Em Andamento', icon: '🔄' },
    { value: 'pausada', label: 'Pausada', icon: '⏸️' },
    { value: 'concluída', label: 'Concluída', icon: '✅' }
  ]

  // Opções de ordenação
  const sortOptions = [
    { value: 'created_at', label: 'Data de Criação' },
    { value: 'updated_at', label: 'Última Atualização' },
    { value: 'name', label: 'Nome (A-Z)' },
    { value: 'status', label: 'Status' },
    { value: 'progress', label: 'Progresso' }
  ]

  // Handler para mudança de filtros
  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value
    }
    onFiltersChange(newFilters)
  }

  // Verificar se há filtros ativos
  const hasActiveFilters = useMemo(() => {
    return (
      filters.status !== 'all' ||
      filters.assignedUser !== null ||
      (filters.search && filters.search.trim() !== '') ||
      filters.orderBy !== 'created_at' ||
      filters.orderDirection !== 'desc'
    )
  }, [filters])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Primeira linha de filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Busca */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar tarefas
          </label>
          <Input
            type="text"
            placeholder="Nome ou descrição da tarefa..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full"
            leftIcon={
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        {/* Filtro de Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Dropdown
            value={filters.status || 'all'}
            onChange={(value) => handleFilterChange('status', value)}
            placeholder="Selecionar status"
            className="w-full"
          >
            {statusOptions.map(option => (
              <Dropdown.Option key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </div>
              </Dropdown.Option>
            ))}
          </Dropdown>
        </div>

        {/* Filtro de Usuário */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Atribuída a
          </label>
          <Dropdown
            value={filters.assignedUser || ''}
            onChange={(value) => handleFilterChange('assignedUser', value || null)}
            placeholder="Todos os usuários"
            className="w-full"
          >
            <Dropdown.Option value="">
              <div className="flex items-center gap-2">
                <span>👥</span>
                <span>Todos os usuários</span>
              </div>
            </Dropdown.Option>
            {projectMembers.map(member => (
              <Dropdown.Option key={member.user.id} value={member.user.id}>
                <div className="flex items-center gap-2">
                  <img 
                    src={member.user.avatar_url} 
                    alt={member.user.full_name}
                    className="w-5 h-5 rounded-full"
                  />
                  <span>{member.user.full_name}</span>
                </div>
              </Dropdown.Option>
            ))}
          </Dropdown>
        </div>
      </div>

      {/* Segunda linha - Ordenação e Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Ordenação */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Ordenar por:
            </label>
            <Dropdown
              value={filters.orderBy || 'created_at'}
              onChange={(value) => handleFilterChange('orderBy', value)}
              className="min-w-[150px]"
            >
              {sortOptions.map(option => (
                <Dropdown.Option key={option.value} value={option.value}>
                  {option.label}
                </Dropdown.Option>
              ))}
            </Dropdown>
          </div>

          {/* Direção da ordenação */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange('orderDirection', 
              filters.orderDirection === 'asc' ? 'desc' : 'asc'
            )}
            className="px-3"
            title={`Ordenação ${filters.orderDirection === 'asc' ? 'Crescente' : 'Decrescente'}`}
          >
            {filters.orderDirection === 'asc' ? '↑' : '↓'}
          </Button>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-3">
          {/* Contador de resultados */}
          <span className="text-sm text-gray-500">
            {taskCount} {taskCount === 1 ? 'tarefa' : 'tarefas'}
          </span>

          {/* Botão para resetar filtros */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="text-gray-600 hover:text-gray-900"
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>

      {/* Filtros ativos (tags) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Filtros ativos:
          </span>
          
          {filters.status !== 'all' && (
            <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              <TaskStatusBadge status={filters.status} size="sm" showIcon={false} />
              <button
                onClick={() => handleFilterChange('status', 'all')}
                className="ml-1 hover:text-blue-900"
              >
                ×
              </button>
            </div>
          )}

          {filters.assignedUser && (
            <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
              <span>
                {projectMembers.find(m => m.user.id === filters.assignedUser)?.user.full_name || 'Usuário'}
              </span>
              <button
                onClick={() => handleFilterChange('assignedUser', null)}
                className="ml-1 hover:text-green-900"
              >
                ×
              </button>
            </div>
          )}

          {filters.search && filters.search.trim() && (
            <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
              <span>"{filters.search}"</span>
              <button
                onClick={() => {
                  setSearchValue('')
                  handleFilterChange('search', '')
                }}
                className="ml-1 hover:text-purple-900"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Componente compacto de filtros (apenas busca e status)
 */
export const CompactTaskFilters = ({
  filters,
  onFiltersChange,
  className = ''
}) => {
  const [searchValue, setSearchValue] = useState(filters.search || '')
  const debouncedSearch = useDebounce(searchValue, 300)

  React.useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch })
    }
  }, [debouncedSearch, filters.search])

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'não_iniciada', label: 'Não Iniciada' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'pausada', label: 'Pausada' },
    { value: 'concluída', label: 'Concluída' }
  ]

  return (
    <div className={`flex gap-3 ${className}`}>
      <Input
        type="text"
        placeholder="Buscar..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="flex-1"
        size="sm"
      />
      
      <Dropdown
        value={filters.status || 'all'}
        onChange={(value) => onFiltersChange({ ...filters, status: value })}
        className="min-w-[120px]"
        size="sm"
      >
        {statusOptions.map(option => (
          <Dropdown.Option key={option.value} value={option.value}>
            {option.label}
          </Dropdown.Option>
        ))}
      </Dropdown>
    </div>
  )
}