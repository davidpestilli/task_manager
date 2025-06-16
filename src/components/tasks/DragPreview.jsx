import React, { forwardRef } from 'react'
import { cn } from '@/utils/helpers'
import { Badge } from '@/components/shared/ui'

/**
 * Componente que renderiza o preview visual durante drag & drop
 * 
 * @param {Object} props
 * @param {Object} props.task - Dados da tarefa sendo arrastada
 * @param {Object} props.sourcePerson - Pessoa de origem
 * @param {Boolean} props.isValid - Se o drop atual é válido
 * @param {String} props.validationMessage - Mensagem de validação
 * @param {String} props.className - Classes CSS adicionais
 */
const DragPreview = forwardRef(({
  task,
  sourcePerson,
  isValid = true,
  validationMessage = '',
  className,
  ...props
}, ref) => {
  if (!task) return null

  return (
    <div
      ref={ref}
      className={cn(
        'drag-preview bg-white border-2 rounded-lg shadow-2xl p-4 max-w-sm pointer-events-none',
        {
          'border-green-300 bg-green-50': isValid,
          'border-red-300 bg-red-50': !isValid,
          'rotate-2': true,
          'scale-95': !isValid
        },
        className
      )}
      style={{
        transform: 'rotate(-2deg)',
        zIndex: 9999
      }}
      {...props}
    >
      {/* Header da tarefa */}
      <div className="flex items-start space-x-3">
        {/* Ícone da tarefa */}
        <div className={cn(
          'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
          {
            'bg-green-100': isValid,
            'bg-red-100': !isValid
          }
        )}>
          <svg 
            className={cn(
              'w-4 h-4',
              {
                'text-green-600': isValid,
                'text-red-600': !isValid
              }
            )}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2" 
            />
          </svg>
        </div>

        {/* Conteúdo da tarefa */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate text-sm">
            {task.name}
          </h4>
          
          {/* Status da tarefa */}
          <div className="mt-1">
            <Badge 
              variant={task.status === 'concluída' ? 'success' : 
                     task.status === 'em_andamento' ? 'primary' :
                     task.status === 'pausada' ? 'warning' : 'secondary'}
              size="sm"
            >
              {task.status?.replace('_', ' ') || 'Não iniciada'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Progresso da tarefa */}
      {task.completion_percentage !== undefined && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Progresso</span>
            <span>{Math.round(task.completion_percentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                {
                  'bg-green-500': isValid,
                  'bg-red-500': !isValid
                }
              )}
              style={{ width: `${task.completion_percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Informações de origem */}
      {sourcePerson && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded-full flex-shrink-0" />
            <span className="text-xs text-gray-600 truncate">
              De: {sourcePerson.full_name}
            </span>
          </div>
        </div>
      )}

      {/* Feedback de validação */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className={cn(
          'flex items-center space-x-2 text-xs font-medium',
          {
            'text-green-700': isValid,
            'text-red-700': !isValid
          }
        )}>
          {/* Ícone de status */}
          {isValid ? (
            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
          
          {/* Mensagem */}
          <span>
            {isValid ? 'Pode soltar aqui' : validationMessage || 'Movimento inválido'}
          </span>
        </div>
      </div>

      {/* Sombra de movimento */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-transparent to-black opacity-5 pointer-events-none" />
      
      {/* Indicator de movimento */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
    </div>
  )
})

DragPreview.displayName = 'DragPreview'

export { DragPreview }