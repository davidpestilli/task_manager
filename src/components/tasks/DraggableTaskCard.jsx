import React, { forwardRef } from 'react'
import { cn } from '@/utils/helpers'
import { Badge, ProgressBar } from '@/components/shared/ui'
import { TaskStatusBadge } from '@/components/tasks'

/**
 * Card de tarefa que suporta drag & drop
 * 
 * @param {Object} props
 * @param {Object} props.task - Dados da tarefa
 * @param {String} props.personId - ID da pessoa responsável
 * @param {Boolean} props.isDragging - Se está sendo arrastado
 * @param {Boolean} props.isDragDisabled - Se drag está desabilitado
 * @param {Function} props.onDragStart - Handler para início do drag
 * @param {Function} props.onClick - Handler para clique
 * @param {String} props.className - Classes CSS adicionais
 */
const DraggableTaskCard = forwardRef(({
  task,
  personId,
  isDragging = false,
  isDragDisabled = false,
  onDragStart,
  onClick,
  className,
  ...props
}, ref) => {
  /**
   * Handler para início do drag
   */
  const handleDragStart = (event) => {
    if (isDragDisabled) {
      event.preventDefault()
      return
    }

    onDragStart?.(event, task, personId)
  }

  /**
   * Determina se a tarefa pode ser arrastada
   */
  const canDrag = !isDragDisabled && 
    task.status !== 'concluída' && 
    task.status !== 'cancelada'

  /**
   * Renderiza indicadores de dependências
   */
  const renderDependencyIndicator = () => {
    if (!task.dependencies || task.dependencies.length === 0) return null

    const unresolvedCount = task.unresolved_dependencies_count || 0

    return (
      <div className="flex items-center space-x-1 text-xs">
        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <span className={cn(
          'font-medium',
          {
            'text-green-600': unresolvedCount === 0,
            'text-yellow-600': unresolvedCount > 0
          }
        )}>
          {task.dependencies.length}
        </span>
      </div>
    )
  }

  /**
   * Renderiza avatares das pessoas atribuídas
   */
  const renderAssignedUsers = () => {
    if (!task.assigned_users || task.assigned_users.length === 0) return null

    return (
      <div className="flex -space-x-1">
        {task.assigned_users.slice(0, 3).map((user, index) => (
          <div
            key={user.id || index}
            className="w-5 h-5 bg-gray-300 rounded-full border border-white flex-shrink-0"
            title={user.full_name}
          />
        ))}
        {task.assigned_users.length > 3 && (
          <div className="w-5 h-5 bg-gray-500 rounded-full border border-white flex-shrink-0 flex items-center justify-center">
            <span className="text-xs text-white font-medium">
              +{task.assigned_users.length - 3}
            </span>
          </div>
        )}
      </div>
    )
  }

  /**
   * Renderiza informações de prazo
   */
  const renderDeadline = () => {
    if (!task.due_date) return null

    const dueDate = new Date(task.due_date)
    const now = new Date()
    const isOverdue = dueDate < now
    const isNearDeadline = dueDate < new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24h

    return (
      <div className={cn(
        'text-xs font-medium',
        {
          'text-red-600': isOverdue,
          'text-yellow-600': isNearDeadline && !isOverdue,
          'text-gray-600': !isNearDeadline && !isOverdue
        }
      )}>
        {isOverdue ? 'Atrasada' : isNearDeadline ? 'Vence hoje' : 'No prazo'}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={cn(
        'task-subcard bg-white border border-gray-200 rounded-lg p-3 transition-all duration-200',
        {
          // Estados de drag
          'draggable-item cursor-grab': canDrag,
          'cursor-not-allowed opacity-50': isDragDisabled,
          'is-dragging opacity-50 transform rotate-2 scale-95': isDragging,
          
          // Estados visuais
          'hover:shadow-md hover:-translate-y-0.5': canDrag && !isDragging,
          'shadow-lg border-blue-300': isDragging,
          
          // Estados de status
          'bg-green-50 border-green-200': task.status === 'concluída',
          'bg-blue-50 border-blue-200': task.status === 'em_andamento',
          'bg-yellow-50 border-yellow-200': task.status === 'pausada'
        },
        className
      )}
      draggable={canDrag}
      onDragStart={handleDragStart}
      onClick={onClick}
      {...props}
    >
      {/* Header da tarefa */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 flex-1 pr-2">
          {task.name}
        </h4>
        
        {/* Indicadores */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {renderDependencyIndicator()}
          
          {/* Indicador de drag */}
          {canDrag && (
            <div className="drag-handle opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Status da tarefa */}
      <div className="flex items-center justify-between mb-3">
        <TaskStatusBadge status={task.status} size="sm" />
        {renderDeadline()}
      </div>

      {/* Progresso */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Progresso</span>
          <span className="font-medium">{Math.round(task.completion_percentage || 0)}%</span>
        </div>
        <ProgressBar 
          value={task.completion_percentage || 0}
          className="h-1.5"
          color={
            task.status === 'concluída' ? 'green' :
            task.status === 'em_andamento' ? 'blue' :
            task.status === 'pausada' ? 'yellow' : 'gray'
          }
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Etapas */}
        <div className="flex items-center space-x-1 text-xs text-gray-600">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2" />
          </svg>
          <span>
            {task.completed_steps || 0}/{task.total_steps || 0}
          </span>
        </div>

        {/* Pessoas atribuídas */}
        {renderAssignedUsers()}
      </div>

      {/* Overlay de drag */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-30 rounded-lg pointer-events-none" />
      )}

      {/* Indicador de não arrastável */}
      {isDragDisabled && (
        <div className="absolute top-2 right-2 w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  )
})

DraggableTaskCard.displayName = 'DraggableTaskCard'

export { DraggableTaskCard }