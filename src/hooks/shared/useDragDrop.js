// useDragDrop.jsimport { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/hooks/shared'
import { validateTaskTransfer } from '@/utils/helpers/validationUtils'
import { getDragPreviewData, formatDropFeedback } from '@/utils/helpers/dragDropUtils'

/**
 * Hook para gerenciar sistema de drag & drop avançado
 * 
 * @param {Object} options - Configurações do drag & drop
 * @param {Function} options.onTaskTransfer - Callback para transferir tarefa
 * @param {Function} options.onTaskShare - Callback para compartilhar tarefa
 * @param {Array} options.people - Lista de pessoas disponíveis
 * @param {String} options.projectId - ID do projeto atual
 * @returns {Object} Estado e funções do drag & drop
 */
export const useDragDrop = ({
  onTaskTransfer,
  onTaskShare,
  people = [],
  projectId
} = {}) => {
  const { showToast } = useToast()
  
  // Estados do drag & drop
  const [draggedItem, setDraggedItem] = useState(null)
  const [dragOverTarget, setDragOverTarget] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [validationResult, setValidationResult] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingTransfer, setPendingTransfer] = useState(null)

  // Refs para elementos DOM
  const dragPreviewRef = useRef(null)
  const dropZonesRef = useRef(new Map())

  /**
   * Inicia o processo de drag
   */
  const handleDragStart = useCallback((event, task, sourcePersonId) => {
    const dragData = getDragPreviewData(task, sourcePersonId)
    
    // Configurar dados do drag
    event.dataTransfer.setData('application/json', JSON.stringify(dragData))
    event.dataTransfer.effectAllowed = 'move'
    
    // Criar preview personalizado
    if (dragPreviewRef.current) {
      const preview = dragPreviewRef.current.cloneNode(true)
      preview.style.transform = 'rotate(-5deg)'
      preview.style.opacity = '0.8'
      event.dataTransfer.setDragImage(preview, 20, 20)
    }

    setDraggedItem({
      task,
      sourcePersonId,
      startTime: Date.now()
    })
    setIsDragging(true)

    // Analytics/logging
    console.log('Drag iniciado:', {
      taskId: task.id,
      taskName: task.name,
      sourcePersonId
    })
  }, [])

  /**
   * Valida e atualiza feedback durante drag over
   */
  const handleDragOver = useCallback((event, targetPersonId) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'

    if (!draggedItem || !targetPersonId) return

    // Evitar validação desnecessária se o target não mudou
    if (dragOverTarget === targetPersonId) return

    setDragOverTarget(targetPersonId)

    // Validar transferência
    const validation = validateTaskTransfer({
      task: draggedItem.task,
      sourcePersonId: draggedItem.sourcePersonId,
      targetPersonId,
      people,
      projectId
    })

    setValidationResult(validation)

    // Feedback visual no cursor
    event.dataTransfer.dropEffect = validation.isValid ? 'move' : 'none'
  }, [draggedItem, dragOverTarget, people, projectId])

  /**
   * Remove feedback ao sair da área de drop
   */
  const handleDragLeave = useCallback((event, targetPersonId) => {
    // Verificar se realmente saiu da área (evitar false positives)
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX
    const y = event.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      if (dragOverTarget === targetPersonId) {
        setDragOverTarget(null)
        setValidationResult(null)
      }
    }
  }, [dragOverTarget])

  /**
   * Processa o drop da tarefa
   */
  const handleDrop = useCallback((event, targetPersonId) => {
    event.preventDefault()

    if (!draggedItem || !targetPersonId) {
      setIsDragging(false)
      setDraggedItem(null)
      return
    }

    const validation = validateTaskTransfer({
      task: draggedItem.task,
      sourcePersonId: draggedItem.sourcePersonId,
      targetPersonId,
      people,
      projectId
    })

    if (!validation.isValid) {
      showToast.error(validation.message || 'Não é possível mover esta tarefa')
      handleDragEnd()
      return
    }

    // Se é o mesmo usuário, não fazer nada
    if (draggedItem.sourcePersonId === targetPersonId) {
      handleDragEnd()
      return
    }

    // Preparar dados para confirmação
    const targetPerson = people.find(p => p.id === targetPersonId)
    const sourcePerson = people.find(p => p.id === draggedItem.sourcePersonId)

    setPendingTransfer({
      task: draggedItem.task,
      sourcePersonId: draggedItem.sourcePersonId,
      targetPersonId,
      sourcePerson,
      targetPerson,
      validation
    })

    setShowConfirmModal(true)
    handleDragEnd()
  }, [draggedItem, people, projectId, showToast])

  /**
   * Finaliza o processo de drag
   */
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    setDraggedItem(null)
    setDragOverTarget(null)
    setValidationResult(null)
  }, [])

  /**
   * Confirma a transferência da tarefa
   */
  const confirmTransfer = useCallback(async () => {
    if (!pendingTransfer) return

    try {
      await onTaskTransfer?.(
        pendingTransfer.task.id,
        pendingTransfer.sourcePersonId,
        pendingTransfer.targetPersonId
      )

      showToast.success(
        `Tarefa "${pendingTransfer.task.name}" transferida para ${pendingTransfer.targetPerson.full_name}`
      )
    } catch (error) {
      console.error('Erro ao transferir tarefa:', error)
      showToast.error('Erro ao transferir tarefa')
    } finally {
      setShowConfirmModal(false)
      setPendingTransfer(null)
    }
  }, [pendingTransfer, onTaskTransfer, showToast])

  /**
   * Confirma o compartilhamento da tarefa
   */
  const confirmShare = useCallback(async () => {
    if (!pendingTransfer) return

    try {
      await onTaskShare?.(
        pendingTransfer.task.id,
        pendingTransfer.targetPersonId
      )

      showToast.success(
        `Tarefa "${pendingTransfer.task.name}" compartilhada com ${pendingTransfer.targetPerson.full_name}`
      )
    } catch (error) {
      console.error('Erro ao compartilhar tarefa:', error)
      showToast.error('Erro ao compartilhar tarefa')
    } finally {
      setShowConfirmModal(false)
      setPendingTransfer(null)
    }
  }, [pendingTransfer, onTaskShare, showToast])

  /**
   * Cancela a operação pendente
   */
  const cancelTransfer = useCallback(() => {
    setShowConfirmModal(false)
    setPendingTransfer(null)
  }, [])

  /**
   * Obtém o feedback visual para uma zona de drop
   */
  const getDropZoneFeedback = useCallback((personId) => {
    if (!isDragging || dragOverTarget !== personId) {
      return { isValid: false, message: '', className: '' }
    }

    if (!validationResult) {
      return { isValid: false, message: '', className: '' }
    }

    return formatDropFeedback(validationResult, personId, people)
  }, [isDragging, dragOverTarget, validationResult, people])

  /**
   * Verifica se uma pessoa é um target válido
   */
  const isValidDropTarget = useCallback((personId) => {
    if (!isDragging || !draggedItem) return false
    
    const validation = validateTaskTransfer({
      task: draggedItem.task,
      sourcePersonId: draggedItem.sourcePersonId,
      targetPersonId: personId,
      people,
      projectId
    })

    return validation.isValid
  }, [isDragging, draggedItem, people, projectId])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      setIsDragging(false)
      setDraggedItem(null)
      setDragOverTarget(null)
      setValidationResult(null)
      setShowConfirmModal(false)
      setPendingTransfer(null)
    }
  }, [])

  return {
    // Estados
    isDragging,
    draggedItem,
    dragOverTarget,
    validationResult,
    showConfirmModal,
    pendingTransfer,
    
    // Refs
    dragPreviewRef,
    dropZonesRef,
    
    // Handlers
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    
    // Actions
    confirmTransfer,
    confirmShare,
    cancelTransfer,
    
    // Utilities
    getDropZoneFeedback,
    isValidDropTarget
  }
}