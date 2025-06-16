import React, { useState } from 'react'
import { Card, Avatar, ProgressBar, Tooltip } from '@/components/shared/ui'
import { TaskStatusBadge, TaskStatusTransition } from './TaskStatusBadge'
import { formatDistanceToNow } from '@/utils/formatters'
import { calculateTaskProgress } from '@/services/tasks'

/**
 * Componente para exibir um card de tarefa
 * @param {Object} props
 * @param {Object} props.task - Dados da tarefa
 * @param {Function} props.onClick - Callback ao clicar no card
 * @param {Function} props.onStatusChange - Callback ao alterar status
 * @param {Function} props.onAssignmentChange - Callback ao alterar atribuições
 * @param {boolean} props.showProject - Se deve mostrar nome do projeto
 * @param {boolean} props.isSelected - Se o card está selecionado
 * @param {string} props.className - Classes CSS adicionais
 */
const TaskCard = ({
  task,
  onClick,
  onStatusChange,
  onAssignmentChange,
  showProject = false,
  isSelected = false,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false)

  // Calcular progresso
  const progressPercentage = calculateTaskProgress(task.task_steps || [])

  // Processar atribuições
  const assignments = task.task_assignments || []
  const assignedUsers = assignments.map(a => a.user).filter(Boolean)

  // Formatação de datas
  const createdDate = task.created_at ? new Date(task.created_at) : null
  const updatedDate = task.updated_at ? new Date(task.updated_at) : null

  const handleCardClick = (e) => {
    // Não disparar onClick se clicar em botões de ação
    if (e.target.closest('[data-no-card-click]')) {
      return
    }
    onClick?.(task)
  }

  const handleStatusChange = (newStatus) => {
    onStatusChange?.(task.id, newStatus)
  }

  return (
    <Card
      className={`
        cursor-pointer transition-all duration-200 hover:shadow-lg
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}
        ${className}
      `}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header do Card */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate text-lg leading-tight">
            {task.name}
          </h3>
          {showProject && task.project && (
            <p className="text-sm text-gray-500 mt-1">
              {task.project.name}
            </p>
          )}
        </div>
        
        <div className="flex-shrink-0 ml-3" data-no-card-click>
          <TaskStatusBadge status={task.status} size="sm" />
        </div>
      </div>

      {/* Descrição */}
      {task.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Progresso */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progresso
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {progressPercentage}%
          </span>
        </div>
        <ProgressBar 
          progress={progressPercentage} 
          size="sm"
          className="mb-2"
        />
        
        {task.task_steps && task.task_steps.length > 0 && (
          <div className="text-xs text-gray-500">
            {task.task_steps.filter(step => step.is_completed).length} de {task.task_steps.length} etapas concluídas
          </div>
        )}
      </div>

      {/* Usuários Atribuídos */}
      {assignedUsers.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Atribuída a
            </span>
            {assignedUsers.length > 3 && (
              <span className="text-xs text-gray-500">
                +{assignedUsers.length - 3} mais
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {assignedUsers.slice(0, 3).map((user, index) => (
              <Tooltip key={user.id} content={user.full_name}>
                <Avatar
                  src={user.avatar_url}
                  name={user.full_name}
                  size="sm"
                  className="border-2 border-white shadow-sm"
                />
              </Tooltip>
            ))}
            
            {assignedUsers.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  +{assignedUsers.length - 3}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ações Rápidas (visível no hover) */}
      {isHovered && (
        <div className="mb-4" data-no-card-click>
          <TaskStatusTransition 
            currentStatus={task.status}
            onStatusChange={handleStatusChange}
          />
        </div>
      )}

      {/* Footer com Datas */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          {createdDate && (
            <span title={createdDate.toLocaleString()}>
              Criada {formatDistanceToNow(createdDate)}
            </span>
          )}
          
          {updatedDate && updatedDate !== createdDate && (
            <span title={updatedDate.toLocaleString()}>
              Atualizada {formatDistanceToNow(updatedDate)}
            </span>
          )}
        </div>

        {/* Indicadores adicionais */}
        <div className="flex items-center gap-2">
          {task.task_dependencies && task.task_dependencies.length > 0 && (
            <Tooltip content="Possui dependências">
              <span className="text-amber-500">🔗</span>
            </Tooltip>
          )}
          
          {task.comments_count > 0 && (
            <Tooltip content={`${task.comments_count} comentários`}>
              <span className="text-blue-500">💬</span>
            </Tooltip>
          )}
        </div>
      </div>
    </Card>
  )
}

/**
 * Componente para skeleton loading do TaskCard
 */
export const TaskCardSkeleton = ({ className = '' }) => (
  <Card className={`animate-pulse ${className}`}>
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
    </div>
    
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
    
    <div className="mb-4">
      <div className="h-2 bg-gray-200 rounded-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
    </div>
    
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
    </div>
    
    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/6"></div>
    </div>
  </Card>
)

/**
 * Componente para card vazio (quando não há tarefas)
 */
export const EmptyTaskCard = ({ onCreateTask, className = '' }) => (
  <Card className={`border-dashed border-2 border-gray-300 ${className}`}>
    <div className="text-center py-8">
      <div className="text-4xl mb-4">📝</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Nenhuma tarefa encontrada
      </h3>
      <p className="text-gray-500 mb-4">
        Comece criando sua primeira tarefa para este projeto
      </p>
      {onCreateTask && (
        <button
          onClick={onCreateTask}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Criar Primeira Tarefa
        </button>
      )}
    </div>
  </Card>
)

export default TaskCard