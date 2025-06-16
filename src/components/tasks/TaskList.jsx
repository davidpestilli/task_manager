import React, { useState, useMemo } from 'react'
import TaskCard, { TaskCardSkeleton, EmptyTaskCard } from './TaskCard'
import { TaskFilters } from './TaskFilters'
import { Button, Spinner } from '@/components/shared/ui'
import { useTasks } from '@/hooks/tasks'
import { useTaskContext } from '@/context/TaskContext'

/**
 * Componente para listar tarefas com filtros e ordenação
 * @param {Object} props
 * @param {string} props.projectId - ID do projeto
 * @param {Function} props.onTaskClick - Callback ao clicar em uma tarefa
 * @param {Function} props.onCreateTask - Callback para criar nova tarefa
 * @param {Function} props.onStatusChange - Callback ao alterar status
 * @param {boolean} props.showFilters - Se deve mostrar filtros
 * @param {boolean} props.showCreateButton - Se deve mostrar botão criar
 * @param {string} props.layout - Layout da lista ('grid' | 'list')
 * @param {string} props.className - Classes CSS adicionais
 */
const TaskList = ({
  projectId,
  onTaskClick,
  onCreateTask,
  onStatusChange,
  showFilters = true,
  showCreateButton = true,
  layout = 'grid',
  className = ''
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  
  const { 
    tasks, 
    isLoading, 
    error, 
    updateTask,
    stats 
  } = useTasks(projectId)
  
  const { 
    filters, 
    setFilters,
    resetFilters 
  } = useTaskContext()

  // Filtrar e ordenar tarefas
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks]

    // Filtro por status
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status)
    }

    // Filtro por usuário atribuído
    if (filters.assignedUser) {
      filtered = filtered.filter(task => 
        task.task_assignments?.some(assignment => 
          assignment.user_id === filters.assignedUser
        )
      )
    }

    // Filtro por busca
    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(task => 
        task.name.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      )
    }

    // Ordenação
    filtered.sort((a, b) => {
      const { orderBy, orderDirection } = filters
      let comparison = 0

      switch (orderBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'progress':
          const progressA = a.progressPercentage || 0
          const progressB = b.progressPercentage || 0
          comparison = progressA - progressB
          break
        case 'updated_at':
          comparison = new Date(a.updated_at) - new Date(b.updated_at)
          break
        case 'created_at':
        default:
          comparison = new Date(a.created_at) - new Date(b.created_at)
          break
      }

      return orderDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [tasks, filters])

  // Handlers
  const handleTaskClick = (task) => {
    setSelectedTaskId(task.id)
    onTaskClick?.(task)
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus })
      onStatusChange?.(taskId, newStatus)
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleResetFilters = () => {
    resetFilters()
  }

  // Classes de layout
  const layoutClasses = {
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    list: 'space-y-4'
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">❌</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erro ao carregar tarefas
        </h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com Filtros e Estatísticas */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Tarefas do Projeto
              </h2>
              <p className="text-sm text-gray-500">
                {filteredTasks.length} de {tasks.length} tarefas
              </p>
            </div>
            
            {showCreateButton && (
              <Button 
                onClick={onCreateTask}
                className="bg-blue-600 hover:bg-blue-700"
              >
                + Nova Tarefa
              </Button>
            )}
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-sm text-gray-500">Em Andamento</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-500">Concluídas</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.paused}</div>
              <div className="text-sm text-gray-500">Pausadas</div>
            </div>
          </div>

          {/* Filtros */}
          <TaskFilters
            filters={filters}
            onFiltersChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            projectId={projectId}
            taskCount={filteredTasks.length}
          />
        </div>
      )}

      {/* Lista de Tarefas */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {isLoading ? (
          // Loading skeleton
          <div className={layoutClasses[layout]}>
            {Array.from({ length: 6 }).map((_, index) => (
              <TaskCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          // Estado vazio
          tasks.length === 0 ? (
            <EmptyTaskCard onCreateTask={onCreateTask} />
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma tarefa encontrada
              </h3>
              <p className="text-gray-500 mb-4">
                Tente ajustar os filtros para encontrar tarefas
              </p>
              <Button 
                variant="outline" 
                onClick={handleResetFilters}
              >
                Limpar Filtros
              </Button>
            </div>
          )
        ) : (
          // Lista de tarefas
          <div className={layoutClasses[layout]}>
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={handleTaskClick}
                onStatusChange={handleStatusChange}
                isSelected={selectedTaskId === task.id}
                className="h-fit"
              />
            ))}
          </div>
        )}
      </div>

      {/* Indicador de carregamento para atualizações */}
      {isLoading && tasks.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <div className="flex items-center gap-2">
            <Spinner size="sm" />
            <span className="text-sm text-gray-600">Atualizando...</span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Componente compacto para lista de tarefas (sem filtros)
 */
export const CompactTaskList = ({ 
  projectId, 
  limit = 5, 
  onViewAll,
  className = '' 
}) => {
  const { tasks, isLoading } = useTasks(projectId)
  
  const limitedTasks = tasks.slice(0, limit)

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: 3 }).map((_, index) => (
          <TaskCardSkeleton key={index} className="h-32" />
        ))}
      </div>
    )
  }

  if (limitedTasks.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">Nenhuma tarefa encontrada</p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {limitedTasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          layout="compact"
          className="h-fit"
        />
      ))}
      
      {tasks.length > limit && (
        <div className="text-center pt-4">
          <Button 
            variant="outline" 
            onClick={onViewAll}
            className="w-full"
          >
            Ver todas as {tasks.length} tarefas
          </Button>
        </div>
      )}
    </div>
  )
}

export default TaskList