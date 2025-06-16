import React, { forwardRef, useImperativeHandle } from 'react'
import { cn } from '@/utils/helpers'
import { useDragDrop } from '@/hooks/shared'
import { DropZone } from './DropZone'

/**
 * Componente de área que suporta drag & drop de tarefas
 * 
 * @param {Object} props
 * @param {Array} props.people - Lista de pessoas
 * @param {Function} props.onTaskTransfer - Callback para transferir tarefa
 * @param {Function} props.onTaskShare - Callback para compartilhar tarefa
 * @param {String} props.projectId - ID do projeto
 * @param {React.ReactNode} props.children - Conteúdo da área
 * @param {String} props.className - Classes CSS adicionais
 * @param {Object} props.dragDropOptions - Opções adicionais para drag & drop
 */
const DragDropArea = forwardRef(({
  people = [],
  onTaskTransfer,
  onTaskShare,
  projectId,
  children,
  className,
  dragDropOptions = {},
  ...props
}, ref) => {
  const {
    isDragging,
    draggedItem,
    showConfirmModal,
    pendingTransfer,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    confirmTransfer,
    confirmShare,
    cancelTransfer,
    getDropZoneFeedback,
    isValidDropTarget,
    dragPreviewRef
  } = useDragDrop({
    people,
    onTaskTransfer,
    onTaskShare,
    projectId,
    ...dragDropOptions
  })

  // Expor métodos para componente pai
  useImperativeHandle(ref, () => ({
    isDragging,
    draggedItem,
    startDrag: handleDragStart,
    endDrag: handleDragEnd
  }), [isDragging, draggedItem, handleDragStart, handleDragEnd])

  /**
   * Renderiza as pessoas com zonas de drop
   */
  const renderPeopleWithDropZones = () => {
    if (!people?.length) return null

    return people.map(person => (
      <DropZone
        key={person.id}
        personId={person.id}
        person={person}
        isDragging={isDragging}
        draggedItem={draggedItem}
        feedback={getDropZoneFeedback(person.id)}
        isValidTarget={isValidDropTarget(person.id)}
        onDragOver={(e) => handleDragOver(e, person.id)}
        onDragLeave={(e) => handleDragLeave(e, person.id)}
        onDrop={(e) => handleDrop(e, person.id)}
      >
        {/* O conteúdo será renderizado pelo componente pai */}
        {children?.({ person, isDragging, draggedItem })}
      </DropZone>
    ))
  }

  /**
   * Modal de confirmação para transferência
   */
  const renderConfirmationModal = () => {
    if (!showConfirmModal || !pendingTransfer) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Mover Tarefa
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Como você gostaria de proceder com esta tarefa?
            </p>
          </div>

          {/* Informações da tarefa */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {pendingTransfer.task.name}
                </p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">De:</span>
                    <span className="ml-1">{pendingTransfer.sourcePerson.full_name}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Para:</span>
                    <span className="ml-1">{pendingTransfer.targetPerson.full_name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Opções */}
          <div className="space-y-3 mb-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Escolha uma opção:</h4>
              <div className="space-y-2">
                <button
                  onClick={confirmTransfer}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="font-medium text-gray-900">Transferir</div>
                  <div className="text-sm text-gray-600">
                    Remove a tarefa de {pendingTransfer.sourcePerson.full_name} e atribui para {pendingTransfer.targetPerson.full_name}
                  </div>
                </button>
                
                <button
                  onClick={confirmShare}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="font-medium text-gray-900">Compartilhar</div>
                  <div className="text-sm text-gray-600">
                    Mantém a tarefa com {pendingTransfer.sourcePerson.full_name} e também atribui para {pendingTransfer.targetPerson.full_name}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex space-x-3">
            <button
              onClick={cancelTransfer}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        'drag-drop-area relative',
        {
          'drag-active': isDragging,
          'pointer-events-none': isDragging
        },
        className
      )}
      {...props}
    >
      {/* Preview invisível para drag */}
      <div
        ref={dragPreviewRef}
        className="drag-preview-template absolute opacity-0 pointer-events-none -top-96"
        style={{ left: '-9999px' }}
      >
        {draggedItem && (
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg max-w-xs">
            <div className="font-medium text-gray-900 truncate">
              {draggedItem.task.name}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Movendo tarefa...
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo principal */}
      <div className="drag-drop-content">
        {typeof children === 'function' ? (
          renderPeopleWithDropZones()
        ) : (
          children
        )}
      </div>

      {/* Overlay durante drag */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-50 bg-opacity-30 pointer-events-none z-10 rounded-lg">
          <div className="absolute top-4 left-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Arraste para uma pessoa
          </div>
        </div>
      )}

      {/* Modal de confirmação */}
      {renderConfirmationModal()}

      {/* Estilos CSS específicos */}
      <style jsx>{`
        .drag-drop-area.drag-active .drag-drop-content > * {
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        
        .drag-drop-area.drag-active .drag-drop-content > *:not(.drop-zone-active) {
          opacity: 0.6;
          transform: scale(0.98);
        }
        
        .drag-drop-area .drop-zone-active {
          transform: scale(1.02);
          z-index: 20;
        }
      `}</style>
    </div>
  )
})

DragDropArea.displayName = 'DragDropArea'

export { DragDropArea }