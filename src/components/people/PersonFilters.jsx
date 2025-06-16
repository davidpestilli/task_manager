import React from 'react'
import { Input, Button, Badge } from '@/components/shared/ui'
import { cn } from '@/utils/helpers'

/**
 * Componente de filtros para lista de pessoas
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.filters - Filtros atuais
 * @param {Function} props.onFilterChange - Callback para mudança de filtros
 * @param {Object} props.stats - Estatísticas para badges
 * @returns {JSX.Element}
 */
export function PersonFilters({
  filters,
  onFilterChange,
  stats,
  className
}) {
  // Opções de role
  const roleOptions = [
    { value: 'all', label: 'Todos os roles', count: stats?.total || 0 },
    { value: 'owner', label: 'Owners', count: stats?.owners || 0 },
    { value: 'admin', label: 'Admins', count: stats?.admins || 0 },
    { value: 'member', label: 'Membros', count: stats?.members || 0 }
  ]

  // Opções de ordenação
  const sortOptions = [
    { value: 'name', label: 'Nome (A-Z)' },
    { value: 'role', label: 'Role' },
    { value: 'joined', label: 'Mais recentes' }
  ]

  // Opções de carga de trabalho (para implementação futura)
  const workloadOptions = [
    { value: 'all', label: 'Todas as cargas' },
    { value: 'light', label: 'Carga leve' },
    { value: 'moderate', label: 'Carga moderada' },
    { value: 'heavy', label: 'Carga pesada' },
    { value: 'overloaded', label: 'Sobrecarregado' }
  ]

  // Handlers
  const handleSearchChange = (e) => {
    onFilterChange({ search: e.target.value })
  }

  const handleRoleChange = (role) => {
    onFilterChange({ role })
  }

  const handleSortChange = (e) => {
    onFilterChange({ sortBy: e.target.value })
  }

  const handleWorkloadChange = (workload) => {
    onFilterChange({ workload })
  }

  const clearFilters = () => {
    onFilterChange({
      search: '',
      role: 'all',
      workload: 'all',
      sortBy: 'name'
    })
  }

  // Verificar se há filtros ativos
  const hasActiveFilters = filters.search || 
                          filters.role !== 'all' || 
                          filters.workload !== 'all' ||
                          filters.sortBy !== 'name'

  return (
    <div className={cn(
      'bg-white border border-gray-200 rounded-lg p-6 space-y-4',
      className
    )}>
      {/* Header dos filtros */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-600 hover:text-gray-900"
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Filtros principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Busca por nome/email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Buscar pessoa
          </label>
          <Input
            type="text"
            placeholder="Nome ou email..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full"
            icon={
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        {/* Filtro por role */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Role no projeto
          </label>
          <div className="flex flex-wrap gap-2">
            {roleOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleRoleChange(option.value)}
                className={cn(
                  'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors',
                  filters.role === option.value
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                )}
              >
                {option.label}
                <Badge
                  size="xs"
                  variant={filters.role === option.value ? 'primary' : 'secondary'}
                >
                  {option.count}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Ordenação */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Ordenar por
          </label>
          <select
            value={filters.sortBy}
            onChange={handleSortChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por carga de trabalho (placeholder para implementação futura) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Carga de trabalho
          </label>
          <select
            value={filters.workload}
            onChange={(e) => handleWorkloadChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled // Desabilitado por enquanto
          >
            {workloadOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            Em breve - baseado em tarefas ativas
          </p>
        </div>
      </div>

      {/* Indicadores de filtros ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          <span className="text-sm text-gray-600">Filtros ativos:</span>
          
          {filters.search && (
            <Badge variant="outline" size="sm">
              Busca: "{filters.search}"
            </Badge>
          )}
          
          {filters.role !== 'all' && (
            <Badge variant="outline" size="sm">
              Role: {roleOptions.find(r => r.value === filters.role)?.label}
            </Badge>
          )}
          
          {filters.workload !== 'all' && (
            <Badge variant="outline" size="sm">
              Carga: {workloadOptions.find(w => w.value === filters.workload)?.label}
            </Badge>
          )}
          
          {filters.sortBy !== 'name' && (
            <Badge variant="outline" size="sm">
              Ordem: {sortOptions.find(s => s.value === filters.sortBy)?.label}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Componente simplificado de filtros para uso em modais
 * @param {Object} props - Propriedades do componente
 * @returns {JSX.Element}
 */
export function PersonFiltersCompact({
  filters,
  onFilterChange,
  className
}) {
  return (
    <div className={cn('flex gap-3', className)}>
      {/* Busca rápida */}
      <Input
        type="text"
        placeholder="Buscar..."
        value={filters.search || ''}
        onChange={(e) => onFilterChange({ search: e.target.value })}
        className="flex-1"
        size="sm"
        icon={
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
      />

      {/* Filtro rápido por role */}
      <select
        value={filters.role || 'all'}
        onChange={(e) => onFilterChange({ role: e.target.value })}
        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="all">Todos</option>
        <option value="owner">Owners</option>
        <option value="admin">Admins</option>
        <option value="member">Membros</option>
      </select>
    </div>
  )
}