import React, { useState, useRef, useEffect } from 'react'
import { Button, Avatar } from '@/components/shared/ui'
import { useAuth } from '@/hooks/auth'
import { Send, X } from 'lucide-react'

/**
 * Formulário para criar/editar comentários
 * @param {Object} props - Props do componente
 * @param {Function} props.onSubmit - Callback chamado ao submeter comentário
 * @param {Function} props.onCancel - Callback chamado ao cancelar
 * @param {string} props.placeholder - Placeholder do textarea
 * @param {string} props.initialValue - Valor inicial (para edição)
 * @param {boolean} props.isLoading - Estado de loading
 * @param {boolean} props.isReply - Se é uma resposta a comentário
 * @param {boolean} props.isEditing - Se está editando comentário existente
 * @param {boolean} props.autoFocus - Auto-focar no campo
 * @param {string} props.submitText - Texto do botão de envio
 * @param {string} props.cancelText - Texto do botão de cancelar
 */
export function CommentForm({
  onSubmit,
  onCancel,
  placeholder = 'Escreva seu comentário...',
  initialValue = '',
  isLoading = false,
  isReply = false,
  isEditing = false,
  autoFocus = false,
  submitText = 'Comentar',
  cancelText = 'Cancelar'
}) {
  const { user } = useAuth()
  const [content, setContent] = useState(initialValue)
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef(null)

  // Auto-focus quando solicitado
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  // Ajustar altura do textarea automaticamente
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [content])

  /**
   * Manipula envio do formulário
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim()) return
    
    try {
      await onSubmit(content.trim())
      setContent('')
      setIsFocused(false)
    } catch (error) {
      console.error('Erro ao enviar comentário:', error)
    }
  }

  /**
   * Manipula cancelamento
   */
  const handleCancel = () => {
    setContent(initialValue)
    setIsFocused(false)
    onCancel?.()
  }

  /**
   * Manipula teclas pressionadas
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
    
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const shouldShowActions = isFocused || content.trim() || isReply || isEditing
  const canSubmit = content.trim() && !isLoading

  return (
    <div className={`bg-white rounded-lg border ${isReply ? 'ml-12 mt-3' : ''} ${
      isFocused ? 'border-blue-300 shadow-sm' : 'border-gray-200'
    }`}>
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-start space-x-3">
          {/* Avatar do usuário */}
          <Avatar
            src={user?.avatar_url}
            alt={user?.full_name}
            size="sm"
            className="flex-shrink-0"
          />

          <div className="flex-1">
            {/* Área do comentário */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              className={`w-full resize-none border-0 p-0 text-sm placeholder-gray-400 focus:outline-none focus:ring-0 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ 
                minHeight: '24px',
                maxHeight: '200px'
              }}
              rows={1}
            />

            {/* Ações do formulário */}
            {shouldShowActions && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  {isReply && 'Respondendo ao comentário'}
                  {isEditing && 'Editando comentário'}
                  {!isReply && !isEditing && 'Pressione Enter para enviar, Shift+Enter para nova linha'}
                </div>

                <div className="flex items-center space-x-2">
                  {/* Botão cancelar */}
                  {(isReply || isEditing || content.trim()) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4 mr-1" />
                      {cancelText}
                    </Button>
                  )}

                  {/* Botão enviar */}
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!canSubmit}
                    isLoading={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    {submitText}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

/**
 * Formulário compacto para respostas rápidas
 */
export function QuickReplyForm({ onSubmit, onCancel, isLoading = false }) {
  const { user } = useAuth()
  const [content, setContent] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    
    try {
      await onSubmit(content.trim())
      setContent('')
    } catch (error) {
      console.error('Erro ao enviar resposta:', error)
    }
  }

  return (
    <div className="ml-12 mt-2">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <Avatar
          src={user?.avatar_url}
          alt={user?.full_name}
          size="xs"
          className="flex-shrink-0"
        />
        
        <div className="flex-1 flex items-center space-x-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Responder..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onCancel?.()
              }
            }}
          />
          
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || isLoading}
            isLoading={isLoading}
            className="rounded-full px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="rounded-full px-3"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CommentForm