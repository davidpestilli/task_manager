import React, { useState } from 'react'
import { CommentThread } from '@/components/comments'
import { Button, Badge } from '@/components/shared/ui'
import { useTaskComments } from '@/hooks/tasks'
import { 
  MessageCircle, 
  Plus, 
  Minus, 
  RefreshCw,
  ExternalLink 
} from 'lucide-react'

/**
 * Componente para exibir e gerenciar comentários de uma tarefa
 * @param {Object} props - Props do componente
 * @param {string} props.taskId - ID da tarefa
 * @param {string} props.taskName - Nome da tarefa (para contexto)
 * @param {boolean} props.collapsed - Se deve iniciar colapsado
 * @param {boolean} props.showHeader - Se deve mostrar cabeçalho
 * @param {boolean} props.showAddButton - Se deve mostrar botão de adicionar
 * @param {string} props.className - Classes CSS adicionais
 * @param {Function} props.onCommentAdded - Callback quando comentário é adicionado
 * @param {number} props.maxHeight - Altura máxima da área de comentários
 */
export function TaskComments({
  taskId,
  taskName,
  collapsed = false,
  showHeader = true,
  showAddButton = true,
  className = '',
  onCommentAdded,
  maxHeight = 500
}) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed)
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  const {
    comments,
    commentsCount,
    isLoadingComments,
    commentsError,
    createComment,
    refetchComments,
    isCreatingComment
  } = useTaskComments(taskId)

  /**
   * Toggle de colapso
   */
  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  /**
   * Manipula criação rápida de comentário
   */
  const handleQuickComment = async (content) => {
    try {
      await createComment(content)
      setShowQuickAdd(false)
      onCommentAdded?.()
    } catch (error) {
      console.error('Erro ao criar comentário:', error)
    }
  }

  /**
   * Atualiza comentários
   */
  const handleRefresh = () => {
    refetchComments()
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Cabeçalho */}
      {showHeader && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleToggleCollapse}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">Comentários</span>
              
              {commentsCount > 0 && (
                <Badge variant="secondary" size="sm">
                  {commentsCount}
                </Badge>
              )}
              
              {isCollapsed ? (
                <Plus className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
            </button>

            {taskName && (
              <div className="text-sm text-gray-500">
                em <span className="font-medium">{taskName}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Botão de atualizar */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoadingComments}
              className="text-gray-500 hover:text-gray-700"
              title="Atualizar comentários"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingComments ? 'animate-spin' : ''}`} />
            </Button>

            {/* Botão de adicionar comentário rápido */}
            {showAddButton && !isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickAdd(!showQuickAdd)}
                className="text-blue-600 hover:text-blue-700"
                title="Adicionar comentário rápido"
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Área de comentários */}
      {!isCollapsed && (
        <div className="relative">
          {/* Formulário de comentário rápido */}
          {showQuickAdd && (
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <QuickCommentForm
                onSubmit={handleQuickComment}
                onCancel={() => setShowQuickAdd(false)}
                isLoading={isCreatingComment}
                placeholder="Adicione um comentário rápido..."
              />
            </div>
          )}

          {/* Thread de comentários */}
          <div style={{ maxHeight: `${maxHeight}px`, overflowY: 'auto' }}>
            <CommentThread
              taskId={taskId}
              collapsed={false}
              showAddComment={!showQuickAdd}
              maxHeight={maxHeight - 100}
            />
          </div>

          {/* Estado de erro */}
          {commentsError && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400">
              <div className="flex items-center space-x-2">
                <div className="text-sm text-red-700">
                  Erro ao carregar comentários. 
                  <button
                    onClick={handleRefresh}
                    className="ml-1 underline hover:no-underline"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Estado colapsado */}
      {isCollapsed && (
        <div 
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handleToggleCollapse}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-600">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">
                {commentsCount > 0 
                  ? `${commentsCount} comentário${commentsCount !== 1 ? 's' : ''}`
                  : 'Sem comentários'
                }
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-400">
              <span className="text-xs">Clique para expandir</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Formulário de comentário rápido
 */
function QuickCommentForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  placeholder = 'Adicione um comentário...' 
}) {
  const [content, setContent] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    
    await onSubmit(content.trim())
    setContent('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
    
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        rows={3}
        autoFocus
      />
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Enter para enviar, Shift+Enter para nova linha
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
            className="text-gray-500"
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || isLoading}
            isLoading={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Comentar
          </Button>
        </div>
      </div>
    </form>
  )
}

/**
 * Versão compacta para exibição em cards
 */
export function TaskCommentsCompact({ 
  taskId, 
  onClick,
  className = '' 
}) {
  const { commentsCount, isLoadingComments } = useTaskComments(taskId)

  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors ${className}`}
      title="Ver comentários"
    >
      <MessageCircle className="w-4 h-4" />
      <span className="text-sm">
        {isLoadingComments ? '...' : commentsCount || '0'}
      </span>
    </button>
  )
}

export default TaskComments