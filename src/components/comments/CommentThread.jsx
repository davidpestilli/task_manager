import React, { useState, useMemo } from 'react'
import { CommentItem, CommentSkeleton } from './CommentItem'
import { CommentForm } from './CommentForm'
import { Button } from '@/components/shared/ui'
import { useTaskComments } from '@/hooks/tasks'
import { MessageCircle, Plus, Filter, SortAsc, SortDesc } from 'lucide-react'

/**
 * Componente para thread completa de comentários
 * @param {Object} props - Props do componente
 * @param {string} props.taskId - ID da tarefa
 * @param {boolean} props.collapsed - Se a thread está colapsada
 * @param {Function} props.onToggleCollapse - Callback para alternar colapso
 * @param {boolean} props.showAddComment - Se deve mostrar formulário de adicionar
 * @param {number} props.maxHeight - Altura máxima do container
 */
export function CommentThread({
  taskId,
  collapsed = false,
  onToggleCollapse,
  showAddComment = true,
  maxHeight = 400
}) {
  const [sortOrder, setSortOrder] = useState('desc') // 'asc' ou 'desc'
  const [filterAuthor, setFilterAuthor] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  const {
    comments,
    commentsCount,
    isLoadingComments,
    createComment,
    replyToComment,
    updateComment,
    deleteComment,
    startReplyTo,
    cancelReply,
    startEditComment,
    cancelEdit,
    replyingTo,
    editingComment,
    isCreatingComment,
    isUpdatingComment,
    isDeletingComment
  } = useTaskComments(taskId)

  /**
   * Comentários filtrados e ordenados
   */
  const processedComments = useMemo(() => {
    let filtered = [...comments]

    // Filtrar por autor se especificado
    if (filterAuthor) {
      filtered = filtered.filter(comment => 
        comment.user_id === filterAuthor ||
        comment.replies?.some(reply => reply.user_id === filterAuthor)
      )
    }

    // Ordenar comentários
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at)
      const dateB = new Date(b.created_at)
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [comments, filterAuthor, sortOrder])

  /**
   * Lista de autores únicos para filtro
   */
  const uniqueAuthors = useMemo(() => {
    const authors = new Set()
    
    comments.forEach(comment => {
      authors.add(comment.user_id)
      comment.replies?.forEach(reply => {
        authors.add(reply.user_id)
      })
    })

    return Array.from(authors).map(userId => {
      const comment = comments.find(c => 
        c.user_id === userId || 
        c.replies?.some(r => r.user_id === userId)
      )
      
      if (comment?.user_id === userId) {
        return {
          id: userId,
          name: comment.profiles?.full_name,
          avatar: comment.profiles?.avatar_url
        }
      }
      
      const reply = comment?.replies?.find(r => r.user_id === userId)
      return {
        id: userId,
        name: reply?.profiles?.full_name,
        avatar: reply?.profiles?.avatar_url
      }
    }).filter(Boolean)
  }, [comments])

  /**
   * Manipula criação de comentário
   */
  const handleCreateComment = async (content) => {
    await createComment(content)
  }

  /**
   * Manipula resposta a comentário
   */
  const handleReplyComment = async (content, parentCommentId) => {
    await replyToComment(content, parentCommentId)
  }

  /**
   * Manipula edição de comentário
   */
  const handleEditComment = async (commentId, content) => {
    await updateComment(commentId, content)
  }

  /**
   * Manipula exclusão de comentário
   */
  const handleDeleteComment = async (commentId) => {
    await deleteComment(commentId)
  }

  /**
   * Alterna ordem de classificação
   */
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')
  }

  /**
   * Limpa filtros
   */
  const clearFilters = () => {
    setFilterAuthor(null)
    setShowFilters(false)
  }

  if (collapsed) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <button
          onClick={onToggleCollapse}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">
            {commentsCount > 0 ? `${commentsCount} comentário${commentsCount !== 1 ? 's' : ''}` : 'Sem comentários'}
          </span>
          <Plus className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Cabeçalho da thread */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">
            Comentários {commentsCount > 0 && `(${commentsCount})`}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {/* Controles de ordenação e filtros */}
          {comments.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSortOrder}
                className="text-gray-500 hover:text-gray-700"
                title={`Ordenar ${sortOrder === 'desc' ? 'mais antigos primeiro' : 'mais recentes primeiro'}`}
              >
                {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
              </Button>

              {uniqueAuthors.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`text-gray-500 hover:text-gray-700 ${filterAuthor ? 'bg-blue-50 text-blue-600' : ''}`}
                  title="Filtrar por autor"
                >
                  <Filter className="w-4 h-4" />
                </Button>
              )}
            </>
          )}

          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="text-gray-500 hover:text-gray-700"
              title="Recolher comentários"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      {showFilters && uniqueAuthors.length > 1 && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-700">Filtrar por autor:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterAuthor(null)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                !filterAuthor 
                  ? 'bg-blue-100 border-blue-300 text-blue-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Todos
            </button>
            
            {uniqueAuthors.map((author) => (
              <button
                key={author.id}
                onClick={() => setFilterAuthor(author.id)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors flex items-center space-x-2 ${
                  filterAuthor === author.id
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {author.avatar && (
                  <img 
                    src={author.avatar} 
                    alt={author.name}
                    className="w-4 h-4 rounded-full"
                  />
                )}
                <span>{author.name}</span>
              </button>
            ))}
          </div>
          
          {filterAuthor && (
            <button
              onClick={clearFilters}
              className="mt-2 text-xs text-gray-500 hover:text-gray-700"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* Lista de comentários */}
      <div 
        className="max-h-96 overflow-y-auto"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        <div className="p-4 space-y-1">
          {isLoadingComments ? (
            // Skeletons de loading
            <>
              <CommentSkeleton />
              <CommentSkeleton />
              <CommentSkeleton depth={1} />
            </>
          ) : processedComments.length > 0 ? (
            // Lista de comentários
            processedComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={startReplyTo}
                onEdit={startEditComment}
                onDelete={handleDeleteComment}
                isEditing={editingComment?.id === comment.id}
                isReplying={replyingTo === comment.id}
                onCancelEdit={cancelEdit}
                onCancelReply={cancelReply}
                isLoadingReply={isCreatingComment}
                isLoadingEdit={isUpdatingComment}
                isLoadingDelete={isDeletingComment}
              />
            ))
          ) : (
            // Estado vazio
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            </div>
          )}

          {/* Formulário de resposta ativa */}
          {replyingTo && (
            <div className="mt-4">
              <CommentForm
                onSubmit={(content) => handleReplyComment(content, replyingTo)}
                onCancel={cancelReply}
                isLoading={isCreatingComment}
                isReply={true}
                autoFocus={true}
                placeholder="Escreva sua resposta..."
              />
            </div>
          )}
        </div>
      </div>

      {/* Formulário para novo comentário */}
      {showAddComment && !replyingTo && (
        <div className="p-4 border-t border-gray-200">
          <CommentForm
            onSubmit={handleCreateComment}
            isLoading={isCreatingComment}
            placeholder="Adicione um comentário..."
          />
        </div>
      )}
    </div>
  )
}

export default CommentThread