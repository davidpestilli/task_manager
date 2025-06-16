import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentsService } from '@/services/comments'
import { useToast } from '@/hooks/shared'
import { supabase } from '@/config/supabase'

/**
 * Hook para gerenciamento de comentários de tarefas
 * @param {string} taskId - ID da tarefa
 * @returns {Object} Estado e funções para gerenciar comentários
 */
export function useTaskComments(taskId) {
  const [isCreating, setIsCreating] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [editingComment, setEditingComment] = useState(null)

  const toast = useToast()
  const queryClient = useQueryClient()

  // Query key para cache
  const queryKey = ['task-comments', taskId]

  /**
   * Query para buscar comentários da tarefa
   */
  const {
    data: comments = [],
    isLoading: isLoadingComments,
    error: commentsError,
    refetch: refetchComments
  } = useQuery({
    queryKey,
    queryFn: () => commentsService.getTaskComments(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 2, // 2 minutos
    cacheTime: 1000 * 60 * 10, // 10 minutos
    retry: 2
  })

  /**
   * Query para contar comentários
   */
  const {
    data: commentsCount = 0,
    isLoading: isLoadingCount
  } = useQuery({
    queryKey: ['task-comments-count', taskId],
    queryFn: () => commentsService.getCommentsCount(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 5 // 5 minutos
  })

  /**
   * Mutation para criar comentário
   */
  const createCommentMutation = useMutation({
    mutationFn: (commentData) => commentsService.createComment(commentData),
    onMutate: () => {
      setIsCreating(true)
    },
    onSuccess: (newComment) => {
      // Invalidar cache para recarregar comentários
      queryClient.invalidateQueries(['task-comments', taskId])
      queryClient.invalidateQueries(['task-comments-count', taskId])
      
      toast.success('Comentário adicionado com sucesso')
      setReplyingTo(null)
    },
    onError: (error) => {
      console.error('Erro ao criar comentário:', error)
      toast.error('Falha ao adicionar comentário')
    },
    onSettled: () => {
      setIsCreating(false)
    }
  })

  /**
   * Mutation para atualizar comentário
   */
  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }) => 
      commentsService.updateComment(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries(['task-comments', taskId])
      toast.success('Comentário atualizado')
      setEditingComment(null)
    },
    onError: (error) => {
      console.error('Erro ao atualizar comentário:', error)
      toast.error('Falha ao atualizar comentário')
    }
  })

  /**
   * Mutation para deletar comentário
   */
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => commentsService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['task-comments', taskId])
      queryClient.invalidateQueries(['task-comments-count', taskId])
      toast.success('Comentário removido')
    },
    onError: (error) => {
      console.error('Erro ao deletar comentário:', error)
      toast.error('Falha ao remover comentário')
    }
  })

  /**
   * Cria um novo comentário
   */
  const createComment = useCallback(async (content, parentCommentId = null) => {
    if (!content.trim()) {
      toast.error('Comentário não pode estar vazio')
      return
    }

    const commentData = {
      content: content.trim(),
      taskId,
      parentCommentId
    }

    return createCommentMutation.mutateAsync(commentData)
  }, [taskId, createCommentMutation, toast])

  /**
   * Responde a um comentário
   */
  const replyToComment = useCallback(async (content, parentCommentId) => {
    return createComment(content, parentCommentId)
  }, [createComment])

  /**
   * Atualiza um comentário existente
   */
  const updateComment = useCallback(async (commentId, content) => {
    if (!content.trim()) {
      toast.error('Comentário não pode estar vazio')
      return
    }

    return updateCommentMutation.mutateAsync({
      commentId,
      content: content.trim()
    })
  }, [updateCommentMutation, toast])

  /**
   * Remove um comentário
   */
  const deleteComment = useCallback(async (commentId) => {
    if (window.confirm('Tem certeza que deseja remover este comentário?')) {
      return deleteCommentMutation.mutateAsync(commentId)
    }
  }, [deleteCommentMutation])

  /**
   * Inicia resposta a comentário
   */
  const startReplyTo = useCallback((commentId) => {
    setReplyingTo(commentId)
    setEditingComment(null)
  }, [])

  /**
   * Cancela resposta
   */
  const cancelReply = useCallback(() => {
    setReplyingTo(null)
  }, [])

  /**
   * Inicia edição de comentário
   */
  const startEditComment = useCallback((comment) => {
    setEditingComment(comment)
    setReplyingTo(null)
  }, [])

  /**
   * Cancela edição
   */
  const cancelEdit = useCallback(() => {
    setEditingComment(null)
  }, [])

  /**
   * Busca comentários aninhados de um comentário pai
   */
  const getReplies = useCallback((parentCommentId) => {
    const parentComment = comments.find(c => c.id === parentCommentId)
    return parentComment?.replies || []
  }, [comments])

  /**
   * Configura real-time para comentários
   */
  useEffect(() => {
    if (!taskId) return

    const channel = supabase
      .channel(`task-comments-${taskId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'task_manager',
          table: 'comments',
          filter: `task_id=eq.${taskId}`
        },
        (payload) => {
          console.log('Comentário atualizado via realtime:', payload)
          
          // Invalidar cache para recarregar comentários
          queryClient.invalidateQueries(['task-comments', taskId])
          queryClient.invalidateQueries(['task-comments-count', taskId])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [taskId, queryClient])

  return {
    // Estado dos comentários
    comments,
    commentsCount,
    isLoadingComments,
    isLoadingCount,
    commentsError,

    // Estados de interação
    isCreating,
    replyingTo,
    editingComment,

    // Ações de comentários
    createComment,
    replyToComment,
    updateComment,
    deleteComment,
    refetchComments,

    // Controles de interface
    startReplyTo,
    cancelReply,
    startEditComment,
    cancelEdit,
    getReplies,

    // Estados de loading das mutations
    isCreatingComment: createCommentMutation.isLoading,
    isUpdatingComment: updateCommentMutation.isLoading,
    isDeletingComment: deleteCommentMutation.isLoading
  }
}