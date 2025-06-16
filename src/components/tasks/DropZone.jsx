import React, { useState, useCallback } from 'react'
import { cn } from '@/utils/helpers'

/**
 * Componente que define uma zona onde elementos podem ser soltos
 * 
 * @param {Object} props
 * @param {String} props.personId - ID da pessoa
 * @param {Object} props.person - Dados da pessoa
 * @param {Boolean} props.isDragging - Se está ocorrendo um drag
 * @param {Object} props.draggedItem - Item sendo arrastado
 * @param {Object} props.feedback - Feedback de validação
 * @param {Boolean} props.isValidTarget - Se é um target válido
 * @param {Function} props.onDragOver - Handler para drag over
 * @param {Function} props.onDragLeave - Handler para drag leave
 * @param {Function} props.onDrop - Handler para drop
 * @param {React.ReactNode} props.children - Conteúdo da zona
 * @param {String} props.className - Classes CSS adicionais
 */
const DropZone = ({
  personId,
  person,
  isDragging = false,
  draggedItem = null,
  feedback = { isValid: false, message: '', className: '' },
  isValidTarget = false,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
  className,
  ...props
}) => {
  const [isOver, setIsOver] = useState(false)
  const [dropIntention, setDropIntention] = useState(null)

  /**
   * Handler para quando drag entra na zona
   */
  const handleDragEnter = useCallback((event) => {
    event.preventDefault()
    setIsOver(true)
    
    // Detectar intenção baseada na posição do mouse
    const rect = event.currentTarget.getBoundingClientRect()
    const centerY = rect.top + rect.height / 2
    const mouseY = event.clientY
    
    if (mouseY < centerY - 20) {
      setDropIntention('above')
    } else if (mouseY > centerY + 20) {
      setDropIntention('below')
    } else {
      setDropIntention('center')
    }
  }, [])

  /**
   * Handler para movimento dentro da zona
   */
  const handleDragOver = useCallback((event) => {
    event.preventDefault()
    
    // Atualizar intenção baseada na posição
    const rect = event.currentTarget.getBoundingClientRect()
    const centerY = rect.top + rect.height / 2
    const mouseY = event.clientY
    
    let newIntention = 'center'
    if (mouseY < centerY - 20) {
      newIntention = 'above'
    } else if (mouseY > centerY + 20) {
      newIntention = 'below'
    }
    
    if (newIntention !== dropIntention) {
      setDropIntention(newIntention)
    }

    onDragOver?.(event)
  }, [dropIntention, onDragOver])

  /**
   * Handler para quando drag sai da zona
   */
  const handleDragLeave = useCallback((event) => {
    // Verificar se realmente saiu da zona (evitar false positives com elementos filhos)
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX
    const y = event.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsOver(false)
      setDropIntention(null)
      onDragLeave?.(event)
    }
  }, [onDragLeave])

  /**
   * Handler para drop
   */
  const handleDrop = useCallback((event) => {
    event.preventDefault()
    setIsOver(false)
    setDropIntention(null)
    onDrop?.(event)
  }, [onDrop])

  /**
   * Renderiza indicadores de drop
   */
  const renderDropIndicators = () => {
    if (!isDragging || !isOver || !isValidTarget) return null

    return (
      <>
        {/* Indicador de posição */}
        {dropIntention === 'above' && (
          <div className="absolute -top-1 left-2 right-2 h-0.5 bg-blue-500 rounded-full z-30">
            <div className="absolute -left-1 -top-1 w-2 h-2 bg-blue-500 rounded-full" />
          </div>
        )}
        
        {dropIntention === 'below' && (
          <div className="absolute -bottom-1 left-2 right-2 h-0.5 bg-blue-500 rounded-full z-30">
            <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-500 rounded-full" />
          </div>
        )}

        {/* Overlay central */}
        {dropIntention === 'center' && (
          <div className="absolute inset-2 border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-50 rounded-lg z-20 flex items-center justify-center">
            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
              Solte aqui
            </div>
          </div>
        )}
      </>
    )
  }

  /**
   * Renderiza feedback de validação
   */
  const renderValidationFeedback = () => {
    if (!isDragging || !isOver || !feedback.message) return null

    return (
      <div className={cn(
        'absolute top-2 left-2 right-2 px-3 py-2 rounded-lg text-sm font-medium z-40 shadow-lg',
        {
          'bg-green-100 text-green-800 border border-green-200': feedback.isValid,
          'bg-red-100 text-red-800 border border-red-200': !feedback.isValid,
          'bg-yellow-100 text-yellow-800 border border-yellow-200': feedback.className === 'warning'
        }
      )}>
        <div className="flex items-center space-x-2">
          {/* Ícone */}
          {feedback.isValid ? (
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          
          {/* Mensagem */}
          <span className="truncate">{feedback.message}</span>
        </div>
      </div>
    )
  }

  /**
   * Renderiza informações da pessoa durante drag
   */
  const renderPersonInfo = () => {
    if (!isDragging || !isOver || !person) return null

    return (
      <div className="absolute bottom-2 left-2 right-2 bg-white bg-opacity-95 backdrop-blur-sm border border-gray-200 rounded-lg p-2 z-40 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-300 rounded-full flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 text-sm truncate">
              {person.full_name}
            </div>
            <div className="text-xs text-gray-600">
              {person.active_tasks || 0} tarefas ativas
            </div>
          </div>
          
          {/* Indicador de capacidade */}
          <div className={cn(
            'w-2 h-2 rounded-full',
            {
              'bg-green-500': (person.active_tasks || 0) < 8,
              'bg-yellow-500': (person.active_tasks || 0) >= 8 && (person.active_tasks || 0) < 12,
              'bg-red-500': (person.active_tasks || 0) >= 12
            }
          )} />
        </div>
      </div>
    )
  }

  // Se não está em drag, renderizar normalmente
  if (!isDragging) {
    return (
      <div className={cn('drop-zone', className)} {...props}>
        {children}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'drop-zone relative transition-all duration-200',
        {
          // Estados base
          'drop-zone-active': isOver,
          'drop-zone-valid': isValidTarget,
          'drop-zone-invalid': isDragging && !isValidTarget,
          
          // Estados visuais durante drag
          'ring-2 ring-blue-300 ring-offset-2': isOver && isValidTarget,
          'ring-2 ring-red-300 ring-offset-2': isOver && !isValidTarget,
          'bg-blue-50': isOver && isValidTarget,
          'bg-red-50': isOver && !isValidTarget,
          'scale-105': isOver,
          'opacity-50': isDragging && !isValidTarget,
          
          // Transformações
          'transform': true,
          'transition-transform': true,
          'duration-200': true
        },
        className
      )}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...props}
    >
      {/* Conteúdo principal */}
      <div className={cn(
        'drop-zone-content relative z-10',
        {
          'pointer-events-none': isDragging,
          'opacity-70': isOver
        }
      )}>
        {children}
      </div>

      {/* Indicadores visuais */}
      {renderDropIndicators()}
      {renderValidationFeedback()}
      {renderPersonInfo()}

      {/* Efeitos visuais adicionais */}
      {isDragging && isValidTarget && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-transparent opacity-30 pointer-events-none rounded-lg" />
      )}
    </div>
  )
}

export { DropZone }