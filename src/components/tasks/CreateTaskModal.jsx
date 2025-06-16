import React, { useState, useEffect } from 'react'
import { Modal, Button, Input, FormField, FormTextarea, FormSelect, Spinner } from '@/components/shared/ui'
import { useTasks } from '@/hooks/tasks'
import { useProjectContext } from '@/context/ProjectContext'
import { useAuth } from '@/context/AuthContext'
import { validateTaskData } from '@/utils/validations'

/**
 * Modal para criar nova tarefa
 * @param {Object} props
 * @param {boolean} props.isOpen - Se o modal está aberto
 * @param {Function} props.onClose - Callback ao fechar
 * @param {Function} props.onTaskCreated - Callback quando tarefa é criada
 * @param {string} props.projectId - ID do projeto
 * @param {Array} props.preselectedUsers - Usuários pré-selecionados
 */
const CreateTaskModal = ({
  isOpen,
  onClose,
  onTaskCreated,
  projectId,
  preselectedUsers = []
}) => {
  const { user } = useAuth()
  const { createTask, isCreatingTask } = useTasks(projectId)
  const { getProjectMembers } = useProjectContext()

  // Estado do formulário
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assignedUsers: preselectedUsers,
    steps: [{ name: '', description: '' }]
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Membros do projeto
  const projectMembers = getProjectMembers(projectId) || []
  const memberOptions = projectMembers.map(member => ({
    value: member.user.id,
    label: member.user.full_name,
    avatar: member.user.avatar_url
  }))

  // Reset do formulário quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        assignedUsers: preselectedUsers,
        steps: [{ name: '', description: '' }]
      })
      setErrors({})
    }
  }, [isOpen, preselectedUsers])

  // Handlers do formulário
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro do campo alterado
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...formData.steps]
    updatedSteps[index] = { ...updatedSteps[index], [field]: value }
    setFormData(prev => ({ ...prev, steps: updatedSteps }))

    // Limpar erro das etapas se houver
    if (errors.steps) {
      setErrors(prev => ({ ...prev, steps: null }))
    }
  }

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { name: '', description: '' }]
    }))
  }

  const removeStep = (index) => {
    if (formData.steps.length > 1) {
      const updatedSteps = formData.steps.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, steps: updatedSteps }))
    }
  }

  // Validação e submissão
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar dados
    const validationResult = validateTaskData(formData)
    if (!validationResult.isValid) {
      setErrors(validationResult.errors)
      return
    }

    setIsSubmitting(true)

    try {
      // Filtrar etapas válidas
      const validSteps = formData.steps.filter(step => step.name.trim())

      const taskData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        project_id: projectId,
        created_by: user.id,
        assignedUsers: formData.assignedUsers,
        steps: validSteps
      }

      await createTask(taskData)
      
      // Callback de sucesso
      onTaskCreated?.()
      
      // Fechar modal
      onClose()

    } catch (error) {
      console.error('Erro ao criar tarefa:', error)
      setErrors({ submit: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Criar Nova Tarefa"
      size="lg"
      className="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Informações Básicas
          </h3>

          <FormField
            label="Nome da Tarefa"
            required
            error={errors.name}
          >
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Implementar sistema de login"
              disabled={isSubmitting}
              autoFocus
            />
          </FormField>

          <FormField
            label="Descrição"
            error={errors.description}
          >
            <FormTextarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva o que precisa ser feito..."
              rows={3}
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        {/* Atribuições */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Atribuições
          </h3>

          <FormField
            label="Atribuir a"
            required
            error={errors.assignedUsers}
            help="Selecione pelo menos uma pessoa para executar esta tarefa"
          >
            <FormSelect
              multiple
              value={formData.assignedUsers}
              onChange={(value) => handleInputChange('assignedUsers', value)}
              options={memberOptions}
              placeholder="Selecionar pessoas..."
              disabled={isSubmitting}
              renderOption={(option) => (
                <div className="flex items-center gap-2">
                  <img 
                    src={option.avatar} 
                    alt={option.label}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{option.label}</span>
                </div>
              )}
              renderValue={(values) => 
                `${values.length} ${values.length === 1 ? 'pessoa selecionada' : 'pessoas selecionadas'}`
              }
            />
          </FormField>
        </div>

        {/* Etapas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Etapas da Tarefa
            </h3>
            <Button
              type="button"
              onClick={addStep}
              variant="outline"
              size="sm"
              disabled={isSubmitting}
            >
              + Adicionar Etapa
            </Button>
          </div>

          {errors.steps && (
            <p className="text-sm text-red-600">{errors.steps}</p>
          )}

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {formData.steps.map((step, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    Etapa {index + 1}
                  </h4>
                  {formData.steps.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeStep(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      disabled={isSubmitting}
                    >
                      Remover
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <Input
                    type="text"
                    value={step.name}
                    onChange={(e) => handleStepChange(index, 'name', e.target.value)}
                    placeholder="Nome da etapa"
                    disabled={isSubmitting}
                    required={index === 0} // Primeira etapa obrigatória
                  />

                  <Input
                    type="text"
                    value={step.description}
                    onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                    placeholder="Descrição (opcional)"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500">
            💡 Dica: Divida a tarefa em etapas pequenas e específicas para facilitar o acompanhamento
          </p>
        </div>

        {/* Erro de submissão */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting || isCreatingTask}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting || isCreatingTask ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Criando...
              </>
            ) : (
              'Criar Tarefa'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

/**
 * Hook para gerenciar o modal de criação de tarefa
 */
export const useCreateTaskModal = (projectId) => {
  const [isOpen, setIsOpen] = useState(false)
  const [preselectedUsers, setPreselectedUsers] = useState([])

  const openModal = (users = []) => {
    setPreselectedUsers(users)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setPreselectedUsers([])
  }

  const ModalComponent = ({ onTaskCreated }) => (
    <CreateTaskModal
      isOpen={isOpen}
      onClose={closeModal}
      onTaskCreated={onTaskCreated}
      projectId={projectId}
      preselectedUsers={preselectedUsers}
    />
  )

  return {
    isOpen,
    openModal,
    closeModal,
    ModalComponent
  }
}

export default CreateTaskModal