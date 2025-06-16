import React, { useState } from 'react'
import { Card, Avatar, Badge, ProgressBar, Dropdown } from '@/components/shared/ui'
import { PersonTasks } from './PersonTasks'
import { usePerson } from '@/hooks/people'
import { useAuth } from '@/hooks/auth'
import { cn } from '@/utils/helpers'
import { formatDistanceToNow } from '@/utils/formatters'

/**
 * Card individual de uma pessoa no projeto
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.person - Dados da pessoa
 * @param {string} props.projectId - ID do projeto
 * @param {Function} props.onRemove - Callback para remover pessoa
 * @param {Function} props.onUpdateRole - Callback para atualizar role
 * @param {boolean} props.canManage - Se pode gerenciar a pessoa
 * @returns {JSX.Element}
 */
export function PersonCard({
  person,
  projectId,
  onRemove,
  onUpdateRole,
  canManage = false,
  className
}) {
  const { user: currentUser } = useAuth()
  const { person: personData, tasks, stats, isLoading } = usePerson(person.id, { 
    projectId,
    silent: true 
  })
  
  const [showAllTasks, setShowAllTasks] = useState(false)

  // Determinar cor do status de carga de trabalho
  const getWorkloadColor = (activeTasks) => {
    if (activeTasks >= 10) return 'bg-red-100 text-red-800'
    if (activeTasks >= 7) return 'bg-yellow-100 text-yellow-800'
    if (activeTasks >= 4) return 'bg-blue-100 text-blue-800'
    return 'bg-green-100 text-green-800'
  }

  const getWorkloadText = (activeTasks) => {
    if (activeTasks >= 10) return 'Sobrecarregado'
    if (activeTasks >= 7) return 'Carga pesada'
    if (activeTasks >= 4) return 'Carga moderada'
    return 'Carga leve'
  }

  // Opções do menu dropdown
  const menuOptions = [
    {
      label: 'Ver detalhes',
      onClick: () => {
        // TODO: Implementar modal de detalhes
        console.log('Ver detalhes da pessoa:', person.id)
      }
    },
    ...(canManage && currentUser?.id !== person.id ? [
      { type: 'divider' },
      {
        label: 'Alterar para Owner',
        onClick: () => onUpdateRole?.(person.id, 'owner'),
        disabled: person.role === 'owner'
      },
      {
        label: 'Alterar para Admin',
        onClick: () => onUpdateRole?.(person.id, 'admin'),
        disabled: person.role === 'admin'
      },
      {
        label: 'Alterar para Member',
        onClick: () => onUpdateRole?.(person.id, 'member'),
        disabled: person.role === 'member'
      },
      { type: 'divider' },
      {
        label: 'Remover do projeto',
        onClick: () => onRemove?.(person.id),
        className: 'text-red-600 hover:text-red-700',
        confirm: {
          title: 'Remover pessoa',
          message: `Tem certeza que deseja remover ${person.full_name} do projeto?`,
          confirmText: 'Remover',
          confirmClass: 'bg-red-600 hover:bg-red-700'
        }
      }
    ] : [])
  ]

  // Tarefas para exibir (limitadas ou todas)
  const displayTasks = showAllTasks ? tasks : tasks?.slice(0, 3) || []
  const hasMoreTasks = tasks && tasks.length > 3

  return (
    <Card className={cn(
      'p-6 hover:shadow-lg transition-all duration-200',
      'border border-gray-200 bg-white',
      className
    )}>
      {/* Header do card */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={person.avatar_url}
            alt={person.full_name}
            size="lg"
            fallback={person.full_name}
          />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {person.full_name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {person.email}
            </p>
            
            {/* Badges de role e status */}
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant={person.role === 'owner' ? 'primary' : 
                        person.role === 'admin' ? 'secondary' : 'default'}
                size="sm"
              >
                {person.role === 'owner' ? 'Dono' :
                 person.role === 'admin' ? 'Admin' : 'Membro'}
              </Badge>
              
              {stats && (
                <Badge
                  className={getWorkloadColor(stats.inProgressTasks + stats.notStartedTasks)}
                  size="sm"
                >
                  {getWorkloadText(stats.inProgressTasks + stats.notStartedTasks)}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Menu de opções */}
        {menuOptions.length > 1 && (
          <Dropdown
            items={menuOptions}
            trigger={
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            }
          />
        )}
      </div>

      {/* Estatísticas resumidas */}
      {stats && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total de tarefas:</span>
              <span className="ml-2 font-medium">{stats.totalTasks}</span>
            </div>
            <div>
              <span className="text-gray-600">Concluídas:</span>
              <span className="ml-2 font-medium text-green-600">{stats.completedTasks}</span>
            </div>
            <div>
              <span className="text-gray-600">Em andamento:</span>
              <span className="ml-2 font-medium text-blue-600">{stats.inProgressTasks}</span>
            </div>
            <div>
              <span className="text-gray-600">Progresso médio:</span>
              <span className="ml-2 font-medium">{stats.averageCompletion}%</span>
            </div>
          </div>
          
          {/* Barra de progresso geral */}
          <div className="mt-3">
            <ProgressBar
              value={stats.averageCompletion}
              size="sm"
              showLabel={false}
              variant={stats.averageCompletion >= 80 ? 'success' : 'default'}
            />
          </div>
        </div>
      )}

      {/* Lista de tarefas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Tarefas atribuídas</h4>
          {hasMoreTasks && (
            <button
              onClick={() => setShowAllTasks(!showAllTasks)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showAllTasks ? 'Ver menos' : `Ver todas (${tasks.length})`}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : tasks && tasks.length > 0 ? (
          <PersonTasks
            tasks={displayTasks}
            personId={person.id}
            projectId={projectId}
            compact={true}
          />
        ) : (
          <div className="text-center py-6 text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2" />
            </svg>
            <p className="text-sm">Nenhuma tarefa atribuída</p>
          </div>
        )}
      </div>

      {/* Footer com informações adicionais */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>
          Membro desde {formatDistanceToNow(person.joinedAt)}
        </span>
        {currentUser?.id === person.id && (
          <Badge variant="outline" size="sm">Você</Badge>
        )}
      </div>
    </Card>
  )
}