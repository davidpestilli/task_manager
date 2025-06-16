import React, { useState, useEffect, useRef } from 'react'
import { useDebounce } from '@/hooks/shared'
import { Badge, Button, Spinner } from '@/components/shared/ui'
import { useTasks } from '@/hooks/tasks'
import { useTaskDependencies } from '@/hooks/tasks/useTaskDependencies'

/**
 * Componente para seleção de dependências de tarefas
 * 
 * Props:
 * - taskId: ID da tarefa que vai receber as dependências
 * - projectId: ID do projeto para filtrar tarefas
 * - onDependencyAdd: Callback quando dependência é adicionada
 * - onDependencyRemove: Callback quando dependência é removida
 * - disabled: Se o seletor está desabilitado
 */
const DependencySelector = ({
  taskId,
  projectId,
  onDependencyAdd,
  onDependencyRemove,
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState([])
  const searchInputRef = useRef(null)
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Hooks para dados
  const { data: projectTasks = [], isLoading: isLoadingTasks } = useTasks({
    projectId,
    enabled: !!projectId
  })

  const {
    dependencies,
    addDependency,
    removeDependency,
    validateDependency,
    isCreating,
    isRemoving,
    isValidating
  } = useTaskDependencies(taskId, projectId)

  // Tarefas já dependentes
  const dependentTaskIds = dependencies.map(dep => dep.depends_on_task_id)

  // Filtrar tarefas disponíveis
  const availableTasks = projectTasks.filter(task => {
    // Não incluir a própria tarefa
    if (task.id === taskId) return false
    
    // Não incluir tarefas já dependentes
    if (dependentTaskIds.includes(task.id)) return false
    
    // Filtrar por termo de busca
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      return task.name.toLowerCase().includes(searchLower) ||
             task.description?.toLowerCase().includes(searchLower)
    }
    
    return true
  })

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Adicionar dependência
  const handleAddDependency = async (dependsOnTaskId) => {
    try {
      const success = await addDependency(taskId, dependsOnTaskId)
      if (success) {
        setSearchTerm('')
        setShowDropdown(false)
        if (onDependencyAdd) {
          onDependencyAdd(dependsOnTaskId)
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar dependência:', error)
    }
  }

  // Remover dependência
  const handleRemoveDependency = async (dependencyId, dependsOnTaskId) => {
    try {
      await removeDependency(dependencyId)
      if (onDependencyRemove) {
        onDependencyRemove(dependsOnTaskId)
      }
    } catch (error) {
      console.error('Erro ao remover dependência:', error)
    }
  }

  // Status badge da tarefa
  const getStatusBadge = (status) => {
    const variants = {
      'não_iniciada': 'gray',
      'em_andamento': 'blue',
      'pausada': 'amber',
      'concluída': 'emerald'
    }
    
    const labels = {
      'não_iniciada': 'Não iniciada',
      'em_andamento': 'Em andamento',
      'pausada': 'Pausada',
      'concluída': 'Concluída'
    }

    return (
      <Badge variant={variants[status]} size="sm">
        {labels[status]}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      {/* Lista de dependências atuais */}
      {dependencies.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Dependências atuais ({dependencies.length})
          </h4>
          <div className="space-y-2">
            {dependencies.map((dependency) => (
              <div
                key={dependency.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm truncate">
                      {dependency.depends_on_task.name}
                    </span>
                    {getStatusBadge(dependency.depends_on_task.status)}
                  </div>
                  
                  {/* Indicador de bloqueio */}
                  {dependency.depends_on_task.status !== 'concluída' && (
                    <div className="flex items-center space-x-1 mt-1">
                      <span className="text-xs text-amber-600">🔒</span>
                      <span className="text-xs text-amber-600">
                        Esta tarefa está bloqueada
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemoveDependency(
                    dependency.id,
                    dependency.depends_on_task_id
                  )}
                  disabled={disabled || isRemoving}
                  className="ml-2 text-red-600 hover:text-red-700"
                >
                  {isRemoving ? (
                    <Spinner size="sm" />
                  ) : (
                    'Remover'
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seletor de novas dependências */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Adicionar nova dependência
        </h4>
        
        <div className="relative" ref={searchInputRef}>
          {/* Campo de busca */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Buscar tarefas para adicionar como dependência..."
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />

          {/* Indicador de validação */}
          {isValidating && (
            <div className="absolute right-3 top-2.5">
              <Spinner size="sm" />
            </div>
          )}

          {/* Dropdown de resultados */}
          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {isLoadingTasks ? (
                <div className="p-4 text-center">
                  <Spinner size="sm" />
                  <span className="ml-2 text-sm text-gray-600">
                    Carregando tarefas...
                  </span>
                </div>
              ) : availableTasks.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  {debouncedSearchTerm ? (
                    `Nenhuma tarefa encontrada para "${debouncedSearchTerm}"`
                  ) : (
                    'Nenhuma tarefa disponível para dependência'
                  )}
                </div>
              ) : (
                <div className="py-2">
                  {availableTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => handleAddDependency(task.id)}
                      disabled={isCreating}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm truncate">
                              {task.name}
                            </span>
                            {getStatusBadge(task.status)}
                          </div>
                          
                          {task.description && (
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {isCreating ? (
                          <Spinner size="sm" />
                        ) : (
                          <span className="text-xs text-blue-600">
                            Adicionar
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dica de uso */}
        {availableTasks.length > 0 && !showDropdown && (
          <p className="text-xs text-gray-500 mt-2">
            Digite para buscar tarefas disponíveis. 
            Dependências circulares são automaticamente bloqueadas.
          </p>
        )}
      </div>

      {/* Indicador de loading global */}
      {(isCreating || isRemoving) && (
        <div className="text-center py-2">
          <Spinner size="sm" />
          <span className="ml-2 text-sm text-gray-600">
            {isCreating ? 'Adicionando dependência...' : 'Removendo dependência...'}
          </span>
        </div>
      )}
    </div>
  )
}

export default DependencySelector