import React, { useState, useEffect } from 'react'
import { Modal, Button, Input, FormTextarea, Avatar, Tooltip, Tabs } from '@/components/shared/ui'
import { TaskStatusBadge, TaskStatusSelector } from './TaskStatusBadge'
import TaskSteps from './TaskSteps'
import { useTask } from '@/hooks/tasks'
import { useProjectContext } from '@/context/ProjectContext'
import { useAuth } from '@/context/AuthContext'
import { formatDistanceToNow } from '@/utils/formatters'

/**
 * Modal para visualizar e editar uma tarefa
 * @param {Object} props
 * @param {boolean} props.isOpen - Se o modal está aberto
 * @param {Function} props.onClose - Callback ao fechar
 * @param {string} props.taskId - ID da tarefa
 * @param {Function} props.onTaskUpdated - Callback quando tarefa é atualizada
 * @param {Function} props.onTaskDeleted - Callback quando tarefa é excluída
 */
const TaskModal = ({
  isOpen,
  onClose,
  taskId,
  onTaskUpdated,
  onTaskDeleted
}) => {
  const { user } = useAuth()
  const { getProjectMembers } = useProjectContext()
  
  const {
    task,
    assignments,
    taskStats,
    isLoading,
    error,
    updateTask,
    updateStatus,
    updateBasicInfo,
    assignUser,
    removeAssignment,
    canEdit,
    isCompleted
  } = useTask(taskId)

  // Estado local para edição
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editingName, setEditingName] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [activeTab, setActiveTab] = useState('details')

  // Atualizar campos de edição quando task carrega
  useEffect(() => {
    if (task) {
      setEditingName(task.name || '')
      setEditingDescription(task.description || '')
    }
  }, [task])

  // Membros do projeto
  const projectMembers = task ? getProjectMembers(task.project_id) || [] : []
  const assignedUserIds = assignments.map(a => a.user_id)
  const unassignedMembers = projectMembers.filter(
    member => !assignedUserIds.includes(member.user.id)
  )

  // Handlers
  const handleSaveName = async () => {
    if (editingName.trim() && editingName !== task.name) {
      await updateBasicInfo(editingName.trim())
      onTaskUpdated?.()
    }
    setIsEditingName(false)
  }

  const handleSaveDescription = async () => {
    if (editingDescription !== task.description) {
      await updateBasicInfo(undefined, editingDescription.trim())
      onTaskUpdated?.()
    }
    setIsEditingDescription(false)
  }

  const handleStatusChange = async (newStatus) => {
    await updateStatus(newStatus)
    onTaskUpdated?.()
  }

  const handleAssignUser = async (userId) => {
    await assignUser(userId, user.id)
    onTaskUpdated?.()
  }

  const handleRemoveAssignment = async (userId) => {
    await removeAssignment(userId)
    onTaskUpdated?.()
  }

  const handleDeleteTask = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      // TODO: Implementar deleteTask no hook
      onTaskDeleted?.(taskId)
      onClose()
    }
  }

  if (!taskId) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="xl"
      className="max-w-4xl"
    >
      {isLoading ? (
        // Loading state
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      ) : error ? (
        // Error state
        <div className="text-center py-8">
          <div className="text-red-500 text-lg mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erro ao carregar tarefa
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      ) : task ? (
        // Conteúdo principal
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Nome da tarefa */}
              {isEditingName ? (
                <div className="space-y-2">
                  <Input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                    autoFocus
                    className="text-xl font-semibold"
                  />
                  <div className="flex items-center gap-2">
                    <Button onClick={handleSaveName} size="sm">
                      Salvar
                    </Button>
                    <Button 
                      onClick={() => {
                        setIsEditingName(false)
                        setEditingName(task.name)
                      }}
                      variant="outline" 
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="group flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {task.name}
                  </h1>
                  {canEdit && (
                    <Button
                      onClick={() => setIsEditingName(true)}
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✏️
                    </Button>
                  )}
                </div>
              )}

              {/* Projeto */}
              {task.project && (
                <p className="text-sm text-gray-500 mt-1">
                  {task.project.name}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <TaskStatusBadge status={task.status} />
              
              {canEdit && (
                <Button
                  onClick={handleDeleteTask}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  🗑️
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="details">Detalhes</Tabs.Tab>
              <Tabs.Tab value="steps">
                Etapas ({taskStats.totalSteps})
              </Tabs.Tab>
              <Tabs.Tab value="assignments">
                Atribuições ({taskStats.totalAssignments})
              </Tabs.Tab>
            </Tabs.List>

            {/* Tab: Detalhes */}
            <Tabs.Panel value="details" className="space-y-6">
              {/* Descrição */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Descrição
                </h3>
                
                {isEditingDescription ? (
                  <div className="space-y-2">
                    <FormTextarea
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      placeholder="Descreva a tarefa..."
                      rows={4}
                    />
                    <div className="flex items-center gap-2">
                      <Button onClick={handleSaveDescription} size="sm">
                        Salvar
                      </Button>
                      <Button 
                        onClick={() => {
                          setIsEditingDescription(false)
                          setEditingDescription(task.description || '')
                        }}
                        variant="outline" 
                        size="sm"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="group">
                    {task.description ? (
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {task.description}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic">
                        Nenhuma descrição fornecida
                      </p>
                    )}
                    
                    {canEdit && (
                      <Button
                        onClick={() => setIsEditingDescription(true)}
                        variant="ghost"
                        size="sm"
                        className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {task.description ? '✏️ Editar' : '+ Adicionar descrição'}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Status */}
              {canEdit && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Alterar Status
                  </h3>
                  <TaskStatusSelector
                    currentStatus={task.status}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              )}

              {/* Estatísticas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Estatísticas
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {taskStats.progressPercentage}%
                    </div>
                    <div className="text-sm text-gray-600">Progresso</div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {taskStats.completedSteps}
                    </div>
                    <div className="text-sm text-gray-600">Etapas Concluídas</div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {taskStats.totalSteps}
                    </div>
                    <div className="text-sm text-gray-600">Total de Etapas</div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {taskStats.totalAssignments}
                    </div>
                    <div className="text-sm text-gray-600">Pessoas</div>
                  </div>
                </div>
              </div>

              {/* Metadados */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Informações
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Criada por:</span>
                    <span className="font-medium">
                      {task.created_by_profile?.full_name}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Criada em:</span>
                    <span>
                      {formatDistanceToNow(new Date(task.created_at))}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Última atualização:</span>
                    <span>
                      {formatDistanceToNow(new Date(task.updated_at))}
                    </span>
                  </div>
                </div>
              </div>
            </Tabs.Panel>

            {/* Tab: Etapas */}
            <Tabs.Panel value="steps">
              <TaskSteps
                taskId={taskId}
                canEdit={canEdit}
                showProgress={true}
                allowReorder={canEdit}
              />
            </Tabs.Panel>

            {/* Tab: Atribuições */}
            <Tabs.Panel value="assignments" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pessoas Atribuídas
                </h3>
                
                {canEdit && unassignedMembers.length > 0 && (
                  <div className="relative">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAssignUser(e.target.value)
                          e.target.value = ''
                        }
                      }}
                      className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm"
                    >
                      <option value="">+ Atribuir Pessoa</option>
                      {unassignedMembers.map(member => (
                        <option key={member.user.id} value={member.user.id}>
                          {member.user.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {assignments.length > 0 ? (
                <div className="space-y-3">
                  {assignments.map(assignment => (
                    <div 
                      key={assignment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={assignment.user.avatar_url}
                          name={assignment.user.full_name}
                          size="md"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {assignment.user.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assignment.user.email}
                          </div>
                          <div className="text-xs text-gray-400">
                            Atribuída {formatDistanceToNow(new Date(assignment.assigned_at))}
                          </div>
                        </div>
                      </div>

                      {canEdit && (
                        <Button
                          onClick={() => handleRemoveAssignment(assignment.user.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          Remover
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    Nenhuma pessoa atribuída a esta tarefa
                  </p>
                </div>
              )}
            </Tabs.Panel>
          </Tabs>
        </div>
      ) : null}
    </Modal>
  )
}

/**
 * Hook para gerenciar o modal de tarefa
 */
export const useTaskModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState(null)

  const openModal = (taskId) => {
    setCurrentTaskId(taskId)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setCurrentTaskId(null)
  }

  const ModalComponent = ({ onTaskUpdated, onTaskDeleted }) => (
    <TaskModal
      isOpen={isOpen}
      onClose={closeModal}
      taskId={currentTaskId}
      onTaskUpdated={onTaskUpdated}
      onTaskDeleted={onTaskDeleted}
    />
  )

  return {
    isOpen,
    currentTaskId,
    openModal,
    closeModal,
    ModalComponent
  }
}

export default TaskModal