import React, { useState } from 'react'
import { Button, Input, Checkbox, Tooltip, ProgressBar } from '@/components/shared/ui'
import { useTaskSteps } from '@/hooks/tasks'
import { formatDistanceToNow } from '@/utils/formatters'
import { DragDropArea } from './DragDropArea'

/**
 * Componente para gerenciar etapas de uma tarefa
 * @param {Object} props
 * @param {string} props.taskId - ID da tarefa
 * @param {boolean} props.canEdit - Se pode editar as etapas
 * @param {boolean} props.showProgress - Se deve mostrar barra de progresso
 * @param {boolean} props.allowReorder - Se permite reordenar etapas
 * @param {string} props.className - Classes CSS adicionais
 */
const TaskSteps = ({
  taskId,
  canEdit = true,
  showProgress = true,
  allowReorder = true,
  className = ''
}) => {
  const [isAddingStep, setIsAddingStep] = useState(false)
  const [newStepName, setNewStepName] = useState('')
  const [newStepDescription, setNewStepDescription] = useState('')
  const [editingStepId, setEditingStepId] = useState(null)
  const [editingStepData, setEditingStepData] = useState({ name: '', description: '' })

  const {
    steps,
    stats,
    isLoading,
    createStep,
    updateStep,
    deleteStep,
    toggleStepCompletion,
    reorderSteps,
    hasSteps,
    completionPercentage
  } = useTaskSteps(taskId)

  // Handlers para adicionar nova etapa
  const handleAddStep = async () => {
    if (!newStepName.trim()) return

    try {
      await createStep({
        name: newStepName.trim(),
        description: newStepDescription.trim() || null
      })

      // Resetar formulário
      setNewStepName('')
      setNewStepDescription('')
      setIsAddingStep(false)
    } catch (error) {
      console.error('Erro ao criar etapa:', error)
    }
  }

  // Handlers para editar etapa
  const handleStartEdit = (step) => {
    setEditingStepId(step.id)
    setEditingStepData({
      name: step.name,
      description: step.description || ''
    })
  }

  const handleSaveEdit = async () => {
    if (!editingStepData.name.trim()) return

    try {
      await updateStep(editingStepId, {
        name: editingStepData.name.trim(),
        description: editingStepData.description.trim() || null
      })

      setEditingStepId(null)
      setEditingStepData({ name: '', description: '' })
    } catch (error) {
      console.error('Erro ao atualizar etapa:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingStepId(null)
    setEditingStepData({ name: '', description: '' })
  }

  // Handler para reordenar etapas (drag & drop)
  const handleReorder = (newStepIds) => {
    if (allowReorder) {
      reorderSteps(newStepIds)
    }
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-12 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header com Progresso */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Etapas da Tarefa
          </h3>
          
          {showProgress && hasSteps && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {stats.completed} de {stats.total} etapas concluídas
                </span>
                <span className="font-semibold text-gray-900">
                  {stats.percentage}%
                </span>
              </div>
              <ProgressBar progress={stats.percentage} size="sm" />
            </div>
          )}
        </div>

        {canEdit && (
          <Button
            onClick={() => setIsAddingStep(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            + Adicionar Etapa
          </Button>
        )}
      </div>

      {/* Lista de Etapas */}
      {hasSteps ? (
        <DragDropArea
          items={steps}
          onReorder={handleReorder}
          disabled={!allowReorder || !canEdit}
          className="space-y-2"
        >
          {(step, dragHandleProps) => (
            <StepItem
              key={step.id}
              step={step}
              canEdit={canEdit}
              isEditing={editingStepId === step.id}
              editingData={editingStepData}
              onEditingDataChange={setEditingStepData}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onToggleCompletion={(isCompleted) => toggleStepCompletion(step.id, isCompleted)}
              onDelete={() => deleteStep(step.id)}
              dragHandleProps={allowReorder && canEdit ? dragHandleProps : null}
            />
          )}
        </DragDropArea>
      ) : (
        // Estado vazio
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-4xl mb-4">📝</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma etapa criada
          </h4>
          <p className="text-gray-500 mb-4">
            Adicione etapas para organizar o trabalho desta tarefa
          </p>
          {canEdit && (
            <Button 
              onClick={() => setIsAddingStep(true)}
              variant="outline"
            >
              Criar Primeira Etapa
            </Button>
          )}
        </div>
      )}

      {/* Formulário para Nova Etapa */}
      {isAddingStep && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">
            Nova Etapa
          </h4>
          
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Nome da etapa"
              value={newStepName}
              onChange={(e) => setNewStepName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
              autoFocus
            />
            
            <Input
              type="text"
              placeholder="Descrição (opcional)"
              value={newStepDescription}
              onChange={(e) => setNewStepDescription(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
            />
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleAddStep}
                disabled={!newStepName.trim()}
                size="sm"
              >
                Adicionar
              </Button>
              <Button
                onClick={() => {
                  setIsAddingStep(false)
                  setNewStepName('')
                  setNewStepDescription('')
                }}
                variant="outline"
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Componente para um item de etapa individual
 */
const StepItem = ({
  step,
  canEdit,
  isEditing,
  editingData,
  onEditingDataChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleCompletion,
  onDelete,
  dragHandleProps
}) => {
  const [isHovered, setIsHovered] = useState(false)

  if (isEditing) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="space-y-2">
          <Input
            type="text"
            value={editingData.name}
            onChange={(e) => onEditingDataChange({ ...editingData, name: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && onSaveEdit()}
            autoFocus
          />
          
          <Input
            type="text"
            placeholder="Descrição (opcional)"
            value={editingData.description}
            onChange={(e) => onEditingDataChange({ ...editingData, description: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && onSaveEdit()}
          />
          
          <div className="flex items-center gap-2">
            <Button
              onClick={onSaveEdit}
              disabled={!editingData.name.trim()}
              size="sm"
            >
              Salvar
            </Button>
            <Button
              onClick={onCancelEdit}
              variant="outline"
              size="sm"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`
        flex items-start gap-3 p-3 rounded-lg border transition-all duration-200
        ${step.is_completed 
          ? 'bg-green-50 border-green-200' 
          : 'bg-white border-gray-200 hover:border-gray-300'
        }
        ${isHovered ? 'shadow-sm' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag Handle */}
      {dragHandleProps && (
        <div 
          {...dragHandleProps}
          className="cursor-move text-gray-400 hover:text-gray-600 mt-1"
        >
          ⋮⋮
        </div>
      )}

      {/* Checkbox */}
      <Checkbox
        checked={step.is_completed}
        onChange={(checked) => onToggleCompletion(checked)}
        disabled={!canEdit}
        className="mt-1"
      />

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className={`
          font-medium text-gray-900
          ${step.is_completed ? 'line-through text-gray-500' : ''}
        `}>
          {step.name}
        </div>
        
        {step.description && (
          <div className={`
            text-sm text-gray-600 mt-1
            ${step.is_completed ? 'line-through text-gray-400' : ''}
          `}>
            {step.description}
          </div>
        )}

        {/* Metadados */}
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          {step.completed_by_profile && (
            <span>
              Concluída por {step.completed_by_profile.full_name}
            </span>
          )}
          
          {step.completed_at && (
            <span>
              {formatDistanceToNow(new Date(step.completed_at))}
            </span>
          )}
        </div>
      </div>

      {/* Ações (visível no hover) */}
      {canEdit && isHovered && (
        <div className="flex items-center gap-1">
          <Tooltip content="Editar etapa">
            <Button
              onClick={() => onStartEdit(step)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600"
            >
              ✏️
            </Button>
          </Tooltip>
          
          <Tooltip content="Excluir etapa">
            <Button
              onClick={() => {
                if (window.confirm('Tem certeza que deseja excluir esta etapa?')) {
                  onDelete()
                }
              }}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-600"
            >
              🗑️
            </Button>
          </Tooltip>
        </div>
      )}
    </div>
  )
}

/**
 * Componente compacto para exibir apenas progresso das etapas
 */
export const CompactTaskSteps = ({ taskId, className = '' }) => {
  const { stats, isLoading } = useTaskSteps(taskId)

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-2 bg-gray-200 rounded-full"></div>
      </div>
    )
  }

  if (stats.total === 0) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        Nenhuma etapa definida
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-600">
          {stats.completed}/{stats.total} etapas
        </span>
        <span className="font-semibold">
          {stats.percentage}%
        </span>
      </div>
      <ProgressBar progress={stats.percentage} size="sm" />
    </div>
  )
}

export default TaskSteps