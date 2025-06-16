import React from 'react'
import { Badge, ProgressBar } from '@/components/shared/ui'
import { cn } from '@/utils/helpers'
import { formatDistanceToNow } from '@/utils/formatters'

/**
 * Componente para exibir tarefas de uma pessoa
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.tasks - Array de tarefas
 * @param {string} props.personId - ID da pessoa
 * @param {string} props.projectId - ID do projeto
 * @param {boolean} props.compact - Layout compacto
 * @param {Function} props.onTaskClick - Callback ao clicar em tarefa
 * @returns {JSX.Element}
 */
export function PersonTasks({
  tasks = [],
  personId,
  projectId,
  compact = false,
  onTaskClick,
  className
}) {
  // Configuração de badges por status
  const statusConfig = {
    'não_iniciada': {
      label: 'Não iniciada',
      variant: 'secondary',
      color: 'bg-gray-100 text-gray-700'
    },
    'em_andamento': {
      label: 'Em andamento',
      variant: 'primary',
      color: 'bg-blue-100 text-blue-700'
    },
    'pausada': {
      label: 'Pausada',
      variant: 'warning',
      color: 'bg-yellow-100 text-yellow-700'
    },
    'concluída': {
      label: 'Concluída',
      variant: 'success',
      color: 'bg-green-100 text-green-700'
    }
  }

  // Renderizar item de tarefa individual
  const TaskItem = ({ task }) => {
    const statusInfo = statusConfig[task.status] || statusConfig['não_iniciada']
    
    const handleClick = () => {
      if (onTaskClick) {
        onTaskClick(task)
      }
    }

    return (
      <div
        className={cn(
          'p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200',
          'cursor-pointer hover:border-gray-300',
          compact ? 'p-2' : 'p-3',
          className
        )}
        onClick={handleClick}
      >
        {/* Header da tarefa */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h5 className={cn(
              'font-medium text-gray-900 truncate',
              compact ? 'text-sm' : 'text-base'
            )}>
              {task.name}
            </h5>
            
            {!compact && task.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          {/* Badge de status */}
          <Badge
            size={compact ? 'xs' : 'sm'}
            className={statusInfo.color}
          >
            {statusInfo.label}
          </Badge>
        </div>

        {/* Barra de progresso */}
        <div className="mt-3">
          <ProgressBar
            value={task.completionPercentage}
            size={compact ? 'sm' : 'md'}
            showLabel={!compact}
            variant={task.completionPercentage >= 100 ? 'success' : 'default'}
          />
        </div>

        {/* Informações adicionais */}
        <div className={cn(
          'flex items-center justify-between text-gray-500 mt-2',
          compact ? 'text-xs' : 'text-sm'
        )}>
          <div className="flex items-center gap-3">
            {/* Número de etapas */}
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-6 9l2 2 4-4" />
              </svg>
              {task.completedSteps || 0}/{task.totalSteps || 0}
            </span>

            {/* Indicador de dependências (se houver) */}
            {task.hasDependencies && (
              <span className="flex items-center gap-1" title="Possui dependências">
                <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>

          {/* Data de atualização */}
          <span title={`Atualizada em ${new Date(task.updatedAt).toLocaleString()}`}>
            {formatDistanceToNow(task.updatedAt)}
          </span>
        </div>

        {/* Indicador visual de prioridade baseado no status */}
        <div className={cn(
          'absolute left-0 top-0 w-1 h-full rounded-l-lg',
          task.status === 'concluída' ? 'bg-green-500' :
          task.status === 'em_andamento' ? 'bg-blue-500' :
          task.status === 'pausada' ? 'bg-yellow-500' : 'bg-gray-300'
        )} />
      </div>
    )
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className={cn(
        'text-center py-4 text-gray-500',
        compact ? 'py-2' : 'py-4'
      )}>
        <svg className="w-6 h-6 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2" />
        </svg>
        <p className={cn(
          'text-gray-500',
          compact ? 'text-xs' : 'text-sm'
        )}>
          Nenhuma tarefa atribuída
        </p>
      </div>
    )
  }

  return (
    <div className={cn(
      'space-y-2 relative',
      compact ? 'space-y-1' : 'space-y-2'
    )}>
      {tasks.map((task, index) => (
        <div key={task.id || index} className="relative">
          <TaskItem task={task} />
        </div>
      ))}
    </div>
  )
}

/**
 * Componente para exibir resumo das tarefas
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.tasks - Array de tarefas
 * @returns {JSX.Element}
 */
export function PersonTasksSummary({ tasks = [] }) {
  const summary = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1
    acc.totalCompletion += task.completionPercentage || 0
    return acc
  }, { totalCompletion: 0 })

  const averageCompletion = tasks.length > 0 
    ? Math.round(summary.totalCompletion / tasks.length)
    : 0

  const statusCounts = [
    { label: 'Não iniciadas', count: summary['não_iniciada'] || 0, color: '#6b7280' },
    { label: 'Em andamento', count: summary['em_andamento'] || 0, color: '#3b82f6' },
    { label: 'Pausadas', count: summary['pausada'] || 0, color: '#f59e0b' },
    { label: 'Concluídas', count: summary['concluída'] || 0, color: '#10b981' }
  ]

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-3">Resumo das tarefas</h4>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        {statusCounts.map((status, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: status.color }}
            />
            <span className="text-sm text-gray-600">
              {status.label}: <span className="font-medium">{status.count}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progresso geral:</span>
          <span className="font-medium">{averageCompletion}%</span>
        </div>
        <ProgressBar
          value={averageCompletion}
          size="sm"
          variant={averageCompletion >= 80 ? 'success' : 'default'}
        />
      </div>
    </div>
  )
}