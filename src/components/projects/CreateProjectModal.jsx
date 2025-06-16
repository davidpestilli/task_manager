import React, { useState } from 'react'
import { Modal, Button } from '@/components/shared/ui'
import { FormField, DescriptionTextarea } from '@/components/shared/forms'
import { useProjects } from '@/hooks/projects'
import { projectValidations } from '@/utils/validations'
import { toast } from 'react-hot-toast'

/**
 * Modal para criação de novos projetos
 * Inclui validação em tempo real e feedback visual
 */
export const CreateProjectModal = ({ 
  isOpen, 
  onClose, 
  onProjectCreated 
}) => {
  const { createProject, isCreating } = useProjects()
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Reset do formulário
  const resetForm = () => {
    setFormData({ name: '', description: '' })
    setErrors({})
    setTouched({})
  }

  // Handler para mudanças nos campos
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  // Handler para blur dos campos
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field, formData[field])
  }

  // Validação individual de campo
  const validateField = (field, value) => {
    const fieldErrors = projectValidations.validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }))
    return !fieldErrors[field]
  }

  // Validação completa do formulário
  const validateForm = () => {
    const formErrors = projectValidations.validateProject(formData)
    setErrors(formErrors)
    setTouched({ name: true, description: true })
    
    return Object.keys(formErrors).length === 0
  }

  // Submit do formulário
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    try {
      const newProject = await createProject(formData)
      
      // Sucesso
      toast.success('Projeto criado com sucesso!')
      resetForm()
      onClose()
      onProjectCreated?.(newProject)
      
    } catch (error) {
      // Erro já tratado pelo hook
      console.error('Erro ao criar projeto:', error)
    }
  }

  // Handler para fechar modal
  const handleClose = () => {
    if (isCreating) return // Não permitir fechar durante criação
    
    // Confirmar se há mudanças não salvas
    if (formData.name || formData.description) {
      if (window.confirm('Você tem alterações não salvas. Deseja realmente fechar?')) {
        resetForm()
        onClose()
      }
    } else {
      resetForm()
      onClose()
    }
  }

  // Verificar se formulário está válido
  const isFormValid = formData.name.length >= 3 && !Object.values(errors).some(Boolean)

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Criar Novo Projeto"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campo Nome */}
        <FormField
          label="Nome do Projeto"
          required
          error={touched.name ? errors.name : null}
          hint="Mínimo 3 caracteres"
        >
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            placeholder="Ex: Website Corporativo, App Mobile..."
            className={`
              w-full px-3 py-2 border rounded-lg shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.name && touched.name ? 'border-red-300' : 'border-gray-300'}
            `}
            maxLength={100}
            disabled={isCreating}
          />
        </FormField>

        {/* Campo Descrição */}
        <FormField
          label="Descrição"
          hint="Opcional - Descreva os objetivos e informações importantes do projeto"
          error={touched.description ? errors.description : null}
        >
          <DescriptionTextarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            disabled={isCreating}
          />
        </FormField>

        {/* Preview do projeto */}
        {formData.name && (
          <div className="bg-gray-50 border rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
            <div className="bg-white border rounded-lg p-3">
              <h5 className="font-medium text-gray-900">{formData.name}</h5>
              {formData.description && (
                <p className="text-sm text-gray-600 mt-1">{formData.description}</p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>👥 1 membro</span>
                <span>📋 0 tarefas</span>
              </div>
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isCreating}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            disabled={!isFormValid || isCreating}
            loading={isCreating}
          >
            {isCreating ? 'Criando...' : 'Criar Projeto'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateProjectModal