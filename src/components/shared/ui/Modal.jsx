import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/**
 * Componente Modal reutilizável
 * 
 * Fornece modal acessível com backdrop, escape key,
 * focus trap e animações suaves
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  backdropClassName = '',
  contentClassName = '',
  ...props
}) => {
  const modalRef = useRef(null)
  const previousFocusRef = useRef(null)

  // Tamanhos pré-definidos
  const sizes = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xlarge: 'max-w-4xl',
    full: 'max-w-full mx-4'
  }

  // Salvar foco anterior e focar no modal quando abrir
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement
      
      // Pequeno delay para garantir que o modal foi renderizado
      setTimeout(() => {
        modalRef.current?.focus()
      }, 100)
    } else {
      // Restaurar foco quando fechar
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  // Lidar com tecla Escape
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  // Prevenir scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'
      
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [isOpen])

  // Não renderizar se não estiver aberto
  if (!isOpen) return null

  const modalContent = (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        ${className}
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      {...props}
    >
      {/* Backdrop */}
      <div
        className={`
          absolute inset-0 bg-black bg-opacity-50 transition-opacity
          ${backdropClassName}
        `}
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        ref={modalRef}
        className={`
          relative bg-white rounded-lg shadow-xl max-h-full overflow-y-auto
          transform transition-all duration-200 ease-out
          ${sizes[size]}
          ${contentClassName}
        `}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h2 
                id="modal-title"
                className="text-xl font-semibold text-gray-900"
              >
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="
                  p-2 text-gray-400 hover:text-gray-600 
                  rounded-lg hover:bg-gray-100 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
                aria-label="Fechar modal"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )

  // Renderizar no portal
  return createPortal(modalContent, document.body)
}

/**
 * Componente ModalHeader para estruturação customizada
 */
export const ModalHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
)

/**
 * Componente ModalBody para conteúdo principal
 */
export const ModalBody = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
)

/**
 * Componente ModalFooter para ações
 */
export const ModalFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 ${className}`}>
    {children}
  </div>
)

/**
 * Modal de confirmação pré-configurado
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'default', // default, danger, warning
  isLoading = false
}) => {
  const typeStyles = {
    default: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
    >
      <div className="mb-4">
        <p className="text-gray-700">{message}</p>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="
            px-4 py-2 text-gray-700 bg-gray-100 
            hover:bg-gray-200 rounded-lg transition-colors
            focus:outline-none focus:ring-2 focus:ring-gray-500
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {cancelText}
        </button>
        
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`
            px-4 py-2 text-white rounded-lg transition-colors
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            disabled:opacity-50 disabled:cursor-not-allowed
            ${typeStyles[type]}
          `}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processando...</span>
            </div>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </Modal>
  )
}

export default Modal