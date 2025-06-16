import React, { useState, useMemo } from 'react'
import { CommentItem, CommentSkeleton } from './CommentItem'
import { Button, Spinner } from '@/components/shared/ui'
import { 
  MessageCircle, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  AlertCircle
} from 'lucide-react'

/**
 * Lista de comentários com paginação e controles
 * @param {Object} props - Props do componente
 * @param {Array} props.comments - Lista de comentários
 * @param {boolean} props.isLoading - Estado de loading
 * @param {Object} props.error - Erro de carregamento
 * @param {Function} props.onRefresh - Callback para atualizar
 * @param {Function} props.onLoadMore - Callback para carregar mais
 * @param {boolean} props.hasMore - Se há mais comentários para carregar
 * @param {boolean} props.isLoadingMore - Se está carregando mais
 * @param {Function} props.onReply - Callback para responder
 * @param {Function} props.onEdit - Callback para editar
 * @param {Function} props.onDelete - Callback para deletar
 * @param {string} props.emptyMessage - Mensagem quando não há comentários
 * @param {boolean} props.showLoadMore - Se deve mostrar botão carregar mais
 * @param {number} props.maxItems - Máximo de itens exibidos inicialmente
 */
export function CommentsList({
  comments = [],
  isLoading = false,
  error = null,
  onRefresh,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  onReply,
  onEdit,
  onDelete,
  emptyMessage = 'Nenhum comentário encontrado',
  showLoadMore = false,
  maxItems = 10
}) {
  const [expanded, setExpanded] = useState(true)
  const [showAll, setShowAll] = useState(false)

  /**
   * Comentários a serem exibidos
   */
  const displayedComments = useMemo(() => {
    if (showAll || comments.length <= maxItems) {
      return comments
    }
    return comments.slice(0, maxItems)
  }, [comments, showAll, maxItems])

  const hasHiddenComments = comments.length > maxItems && !showAll

  /**
   * Manipula toggle de expansão
   */
  const handleToggleExpanded = () => {
    setExpanded(!expanded)
  }

  /**
   * Manipula carregar mais comentários
   */
  const handleLoadMore = () => {
    if (hasHiddenComments) {
      setShowAll(true)
    } else if (onLoadMore) {
      onLoadMore()
    }
  }

  /**
   * Renderiza estado de erro
   */
  if (error) {
    return (
      <div className="text-center py-6">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600 text-sm mb-3">
          Erro ao carregar comentários
        </p>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="text-red-600 border-red-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        )}
      </div>
    )
  }

  /**
   * Renderiza estado de loading inicial
   */
  if (isLoading && comments.length === 0) {
    return (
      <div className="space-y-4">
        <CommentSkeleton />
        <CommentSkeleton />
        <CommentSkeleton depth={1} />
      </div>
    )
  }

  /**
   * Renderiza estado vazio
   */
  if (!isLoading && comments.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="mt-3 text-gray-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* Cabeçalho com controles */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">
            {comments.length} comentário{comments.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="text-gray-500 hover:text-gray-700"
              title="Atualizar comentários"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpanded}
            className="text-gray-500 hover:text-gray-700"
            title={expanded ? 'Recolher comentários' : 'Expandir comentários'}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Lista de comentários */}
      {expanded && (
        <>
          <div className="space-y-1">
            {displayedComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>

          {/* Botão carregar mais */}
          {(hasHiddenComments || (hasMore && showLoadMore)) && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="text-gray-600 border-gray-300"
              >
                {isLoadingMore ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Carregando...
                  </>
                ) : hasHiddenComments ? (
                  <>
                    Mostrar mais {comments.length - maxItems} comentário
                    {comments.length - maxItems !== 1 ? 's' : ''}
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Carregar mais comentários
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Indicador de loading mais comentários */}
          {isLoadingMore && (
            <div className="text-center py-4">
              <Spinner size="sm" className="text-gray-400" />
            </div>
          )}
        </>
      )}

      {/* Estado colapsado */}
      {!expanded && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Comentários recolhidos. Clique no botão acima para expandir.
        </div>
      )}
    </div>
  )
}

/**
 * Lista simples de comentários sem controles avançados
 */
export function SimpleCommentsList({
  comments = [],
  isLoading = false,
  onReply,
  onEdit,
  onDelete,
  className = ''
}) {
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <CommentSkeleton />
        <CommentSkeleton />
        <CommentSkeleton depth={1} />
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">Nenhum comentário</p>
      </div>
    )
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default CommentsList