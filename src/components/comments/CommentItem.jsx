import React, { useState } from 'react'
import { Button, Avatar, Dropdown } from '@/components/shared/ui'
import { CommentForm, QuickReplyForm } from './CommentForm'
import { useAuth } from '@/hooks/auth'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  MessageCircle, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Reply
} from 'lucide-react'

/**
 * Componente para exibir um comentário individual
 * @param {Object} props - Props do componente
 * @param {Object} props.comment - Dados do comentário
 * @param {Function} props.onReply - Callback para responder comentário
 * @param {Function} props.onEdit - Callback para editar comentário
 * @param {Function} props.onDelete - Callback para deletar comentário
 * @param {boolean} props.isEditing - Se está sendo editado
 * @param {boolean} props.isReplying - Se está sendo respondido
 * @param {Function} props.onCancelEdit - Callback para cancelar edição
 * @param {Function} props.onCancelReply - Callback para cancelar resposta
 * @param {boolean} props.isLoadingReply - Estado de loading da resposta
 * @param {boolean} props.isLoadingEdit - Estado de loading da edição
 * @param {boolean} props.isLoadingDelete - Estado de loading da exclusão
 * @param {number} props.depth - Profundidade do comentário (para aninhamento)
 */
export function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  isEditing = false,
  isReplying = false,
  onCancelEdit,
  onCancelReply,
  isLoadingReply = false,
  isLoadingEdit = false,
  isLoadingDelete = false,
  depth = 0
}) {
  const { user } = useAuth()
  const [showReplies, setShowReplies] = useState(true)

  const isAuthor = user?.id === comment.user_id
  const hasReplies = comment.replies && comment.replies.length > 0
  const canReply = depth < 3 // Limitar aninhamento a 3 níveis
  const maxDepth = depth >= 3

  /**
   * Formata tempo relativo
   */
  const formatTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: ptBR
      })
    } catch (error) {
      return 'há alguns momentos'
    }
  }

  /**
   * Manipula envio de resposta
   */
  const handleReplySubmit = async (content) => {
    await onReply(content, comment.id)
  }

  /**
   * Manipula envio de edição
   */
  const handleEditSubmit = async (content) => {
    await onEdit(comment.id, content)
  }

  /**
   * Manipula exclusão com confirmação
   */
  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este comentário?')) {
      onDelete(comment.id)
    }
  }

  /**
   * Menu de ações do comentário
   */
  const commentActions = isAuthor ? [
    {
      label: 'Editar',
      icon: Edit3,
      onClick: () => onEdit?.(comment),
      disabled: isLoadingEdit
    },
    {
      label: 'Excluir',
      icon: Trash2,
      onClick: handleDelete,
      disabled: isLoadingDelete,
      className: 'text-red-600 hover:text-red-700'
    }
  ] : []

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-3' : 'mt-4'}`}>
      {/* Comentário principal */}
      <div className="group">
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <Avatar
            src={comment.profiles?.avatar_url}
            alt={comment.profiles?.full_name}
            size={depth > 0 ? 'sm' : 'md'}
            className="flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            {/* Cabeçalho do comentário */}
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {comment.profiles?.full_name}
              </span>
              
              <span className="text-xs text-gray-500">
                {formatTime(comment.created_at)}
              </span>

              {comment.updated_at && comment.updated_at !== comment.created_at && (
                <span className="text-xs text-gray-400">(editado)</span>
              )}

              {/* Menu de ações */}
              {commentActions.length > 0 && (
                <Dropdown
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  }
                  items={commentActions}
                  placement="bottom-end"
                />
              )}
            </div>

            {/* Conteúdo do comentário */}
            {isEditing ? (
              <div className="mt-2">
                <CommentForm
                  onSubmit={handleEditSubmit}
                  onCancel={onCancelEdit}
                  initialValue={comment.content}
                  isLoading={isLoadingEdit}
                  isEditing={true}
                  autoFocus={true}
                  submitText="Salvar"
                  placeholder="Editar comentário..."
                />
              </div>
            ) : (
              <>
                <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </div>

                {/* Ações do comentário */}
                <div className="flex items-center space-x-4 mt-2">
                  {canReply && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onReply?.(comment)}
                      className="text-gray-500 hover:text-gray-700 px-0 h-auto text-xs"
                    >
                      <Reply className="w-3 h-3 mr-1" />
                      Responder
                    </Button>
                  )}

                  {hasReplies && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReplies(!showReplies)}
                      className="text-gray-500 hover:text-gray-700 px-0 h-auto text-xs"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      {showReplies ? 'Ocultar' : 'Mostrar'} {comment.replies.length} resposta
                      {comment.replies.length !== 1 ? 's' : ''}
                    </Button>
                  )}
                </div>
              </>
            )}

            {/* Formulário de resposta rápida */}
            {isReplying && !maxDepth && (
              <div className="mt-3">
                <QuickReplyForm
                  onSubmit={handleReplySubmit}
                  onCancel={onCancelReply}
                  isLoading={isLoadingReply}
                />
              </div>
            )}

            {/* Respostas aninhadas */}
            {hasReplies && showReplies && (
              <div className="mt-3 space-y-3">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    depth={depth + 1}
                    isEditing={isEditing && reply.id === comment.id}
                    isReplying={isReplying && reply.id === comment.id}
                    onCancelEdit={onCancelEdit}
                    onCancelReply={onCancelReply}
                    isLoadingReply={isLoadingReply}
                    isLoadingEdit={isLoadingEdit}
                    isLoadingDelete={isLoadingDelete}
                  />
                ))}
              </div>
            )}

            {/* Aviso de profundidade máxima */}
            {maxDepth && isReplying && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  Limite de aninhamento atingido. Para continuar a conversa, 
                  responda a um comentário anterior.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Componente para comentário esqueleto (loading)
 */
export function CommentSkeleton({ depth = 0 }) {
  return (
    <div className={`${depth > 0 ? 'ml-8 mt-3' : 'mt-4'}`}>
      <div className="flex items-start space-x-3 animate-pulse">
        <div className={`${depth > 0 ? 'w-8 h-8' : 'w-10 h-10'} bg-gray-200 rounded-full flex-shrink-0`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
          
          <div className="mt-2 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
          
          <div className="flex items-center space-x-4 mt-3">
            <div className="h-3 bg-gray-200 rounded w-16" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommentItem