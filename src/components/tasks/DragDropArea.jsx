import React, { useState, useRef } from 'react'

/**
 * Componente para área de drag & drop
 * @param {Object} props
 * @param {Array} props.items - Lista de itens
 * @param {Function} props.onReorder - Callback quando itens são reordenados
 * @param {Function} props.children - Render function para cada item
 * @param {boolean} props.disabled - Se drag & drop está desabilitado
 * @param {string} props.className - Classes CSS adicionais
 */
const DragDropArea = ({
  items = [],
  onReorder,
  children,
  disabled = false,
  className = ''
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const dragCounter = useRef(0)

  // Handler para início do drag
  const handleDragStart = (e, index) => {
    if (disabled) return
    
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.outerHTML)
  }

  // Handler para drag over
  const handleDragOver = (e, index) => {
    if (disabled || draggedIndex === null) return
    
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (index !== dragOverIndex) {
      setDragOverIndex(index)
    }
  }

  // Handler para drag enter
  const handleDragEnter = (e, index) => {
    if (disabled) return
    
    dragCounter.current++
    setDragOverIndex(index)
  }

  // Handler para drag leave
  const handleDragLeave = (e) => {
    if (disabled) return
    
    dragCounter.current--
    
    if (dragCounter.current === 0) {
      setDragOverIndex(null)
    }
  }

  // Handler para drop
  const handleDrop = (e, dropIndex) => {
    if (disabled || draggedIndex === null) return
    
    e.preventDefault()
    
    if (draggedIndex !== dropIndex) {
      // Criar nova ordem dos itens
      const newItems = [...items]
      const draggedItem = newItems[draggedIndex]
      
      // Remover item da posição original
      newItems.splice(draggedIndex, 1)
      
      // Inserir item na nova posição
      newItems.splice(dropIndex, 0, draggedItem)
      
      // Chamar callback com nova ordem
      const newItemIds = newItems.map(item => item.id)
      onReorder?.(newItemIds)
    }
    
    // Reset do estado
    setDraggedIndex(null)
    setDragOverIndex(null)
    dragCounter.current = 0
  }

  // Handler para fim do drag
  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
    dragCounter.current = 0
  }

  return (
    <div className={className}>
      {items.map((item, index) => {
        const isDragging = draggedIndex === index
        const isDragOver = dragOverIndex === index && draggedIndex !== index
        
        // Props para o handle de drag
        const dragHandleProps = disabled ? null : {
          draggable: true,
          onDragStart: (e) => handleDragStart(e, index),
          onDragEnd: handleDragEnd
        }

        // Props para a área de drop
        const dropAreaProps = disabled ? {} : {
          onDragOver: (e) => handleDragOver(e, index),
          onDragEnter: (e) => handleDragEnter(e, index),
          onDragLeave: handleDragLeave,
          onDrop: (e) => handleDrop(e, index)
        }

        return (
          <div
            key={item.id}
            className={`
              transition-all duration-200
              ${isDragging ? 'opacity-50 scale-95' : ''}
              ${isDragOver ? 'transform translate-y-1' : ''}
            `}
            {...dropAreaProps}
          >
            {/* Indicador de drop zone */}
            {isDragOver && (
              <div className="h-1 bg-blue-500 rounded-full mb-2 animate-pulse" />
            )}
            
            {/* Renderizar item usando children function */}
            {children(item, dragHandleProps)}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Componente simples para handle de drag
 */
export const DragHandle = ({ className = '', ...props }) => (
  <div
    className={`
      cursor-move text-gray-400 hover:text-gray-600 
      select-none touch-none
      ${className}
    `}
    {...props}
  >
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="currentColor"
      className="pointer-events-none"
    >
      <circle cx="4" cy="4" r="1" />
      <circle cx="4" cy="8" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="8" cy="4" r="1" />
      <circle cx="8" cy="8" r="1" />
      <circle cx="8" cy="12" r="1" />
      <circle cx="12" cy="4" r="1" />
      <circle cx="12" cy="8" r="1" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  </div>
)

/**
 * Hook para gerenciar estado de drag & drop
 */
export const useDragDrop = (initialItems = []) => {
  const [items, setItems] = useState(initialItems)
  const [isDragging, setIsDragging] = useState(false)

  const reorderItems = (newItemIds) => {
    const reorderedItems = newItemIds.map(id => 
      items.find(item => item.id === id)
    ).filter(Boolean)
    
    setItems(reorderedItems)
  }

  const updateItems = (newItems) => {
    setItems(newItems)
  }

  return {
    items,
    isDragging,
    reorderItems,
    updateItems,
    setIsDragging
  }
}

export default DragDropArea