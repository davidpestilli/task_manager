import React, { useState, useEffect } from 'react'
import { Modal, Button, Avatar } from '@/components/shared/ui'
import { FormField, DescriptionTextarea, RoleSelect } from '@/components/shared/forms'
import { useProject, useProjectMembers } from '@/hooks/projects'
import { projectValidations } from '@/utils/validations'
import { toast } from 'react-hot-toast'

/**
 * Modal de configurações do projeto
 * Permite editar dados e gerenciar membros (para admins/owners)
 */
export const ProjectSettings = ({ 
  projectId,
  isOpen, 
  onClose,
  initialTab = 'general'
}) => {
  const { 
    project, 
    updateProject, 
    deleteProject, 
    isUpdating, 
    isDeleting,
    isOwner,
    isAdmin 
  } = useProject(projectId)
  
  const {
    members,
    addMember,
    removeMember,
    updateMemberRole,
    isAdding,
    isRemoving,
    isUpdatingRole,
    canManageMembers
  } = useProjectMembers(projectId)

  const [activeTab, setActiveTab] = useState(initialTab)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [errors, setErrors] = useState({})
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('member')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Sincronizar com dados do projeto
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || ''
      })
    }
  }, [project])

  // Reset ao fechar
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('general')
      setErrors({})
      setNewMemberEmail('')
      setNewMemberRole('member')
      setShowDeleteConfirm(false)
    }
  }, [isOpen])

  // Tabs disponíveis
  const tabs = [
    { id: 'general', label: 'Geral', icon: '⚙️' },
    ...(canManageMembers ? [{ id: 'members', label: 'Membros', icon: '👥' }] : []),
    ...(isOwner ? [{ id: 'danger', label: 'Zona Perigosa', icon: '⚠️' }] : [])
  ]

  // Handlers para formulário geral
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateAndUpdateProject = async () => {
    const formErrors = projectValidations.validateProject(formData)
    setErrors(formErrors)

    if (Object.keys(formErrors).length === 0) {
      try {
        await updateProject(formData)
        toast.success('Projeto atualizado!')
      } catch (error) {
        toast.error('Erro ao atualizar projeto')
      }
    }
  }

  // Handler para adicionar membro
  const handleAddMember = async (e) => {
    e.preventDefault()
    
    if (!newMemberEmail.trim()) {
      toast.error('Digite um email válido')
      return
    }

    try {
      await addMember(newMemberEmail, newMemberRole)
      setNewMemberEmail('')
      setNewMemberRole('member')
    } catch (error) {
      // Erro já tratado pelo hook
    }
  }

  // Handler para remover membro
  const handleRemoveMember = async (member) => {
    if (member.user_id === project.owner_id) {
      toast.error('Não é possível remover o proprietário')
      return
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja remover ${member.user.full_name} do projeto?`
    )

    if (confirmed) {
      try {
        await removeMember(member.user_id, member.user.full_name)
      } catch (error) {
        // Erro já tratado pelo hook
      }
    }
  }

  // Handler para deletar projeto
  const handleDeleteProject = async () => {
    const confirmed = window.confirm(
      'ATENÇÃO: Esta ação é irreversível. Todos os dados do projeto serão perdidos permanentemente. Digite "DELETAR" para confirmar.'
    )

    if (confirmed) {
      const confirmation = window.prompt('Digite "DELETAR" para confirmar:')
      
      if (confirmation === 'DELETAR') {
        try {
          await deleteProject()
          toast.success('Projeto deletado')
          onClose()
        } catch (error) {
          toast.error('Erro ao deletar projeto')
        }
      } else {
        toast.error('Confirmação incorreta')
      }
    }
  }

  if (!project) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurações do Projeto"
      size="lg"
    >
      <div className="flex flex-col h-[600px]">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Conteúdo das tabs */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab Geral */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Informações Gerais
                </h3>

                <div className="space-y-4">
                  <FormField
                    label="Nome do Projeto"
                    required
                    error={errors.name}
                  >
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className={`
                        w-full px-3 py-2 border rounded-lg shadow-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${errors.name ? 'border-red-300' : 'border-gray-300'}
                      `}
                      disabled={!isAdmin}
                    />
                  </FormField>

                  <FormField
                    label="Descrição"
                    error={errors.description}
                  >
                    <DescriptionTextarea
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      disabled={!isAdmin}
                    />
                  </FormField>

                  {isAdmin && (
                    <div className="flex justify-end">
                      <Button
                        onClick={validateAndUpdateProject}
                        loading={isUpdating}
                        disabled={!formData.name || formData.name === project.name && formData.description === project.description}
                      >
                        Salvar Alterações
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab Membros */}
          {activeTab === 'members' && canManageMembers && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Gerenciar Membros
                </h3>

                {/* Adicionar membro */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Adicionar Membro</h4>
                  <form onSubmit={handleAddMember} className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="Email do usuário"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isAdding}
                      />
                    </div>
                    
                    <RoleSelect
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="w-40"
                      disabled={isAdding}
                    />
                    
                    <Button
                      type="submit"
                      loading={isAdding}
                      disabled={!newMemberEmail.trim()}
                    >
                      Adicionar
                    </Button>
                  </form>
                </div>

                {/* Lista de membros */}
                <div className="space-y-3">
                  {members.map(member => (
                    <div
                      key={member.user_id}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center">
                        <Avatar
                          src={member.user.avatar_url}
                          alt={member.user.full_name}
                          size="sm"
                          fallback={member.user.full_name?.charAt(0)}
                        />
                        
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {member.user.full_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {member.user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Role selector */}
                        {member.user_id !== project.owner_id && isOwner ? (
                          <RoleSelect
                            value={member.role}
                            onChange={(e) => updateMemberRole(member.user_id, e.target.value)}
                            className="w-32"
                            disabled={isUpdatingRole}
                          />
                        ) : (
                          <span className="text-sm text-gray-600 px-3 py-1 bg-gray-100 rounded">
                            {member.role === 'owner' ? 'Proprietário' :
                             member.role === 'admin' ? 'Admin' : 'Membro'}
                          </span>
                        )}

                        {/* Remove button */}
                        {member.user_id !== project.owner_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(member)}
                            disabled={isRemoving}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Remover
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab Zona Perigosa */}
          {activeTab === 'danger' && isOwner && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-red-600 mb-4">
                  Zona Perigosa
                </h3>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h4 className="font-medium text-red-800 mb-2">
                    Deletar Projeto
                  </h4>
                  <p className="text-sm text-red-700 mb-4">
                    Esta ação é irreversível. Todos os dados do projeto, incluindo tarefas, 
                    comentários e histórico serão perdidos permanentemente.
                  </p>

                  <Button
                    variant="outline"
                    onClick={handleDeleteProject}
                    loading={isDeleting}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Deletar Projeto Permanentemente
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUpdating || isDeleting}
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ProjectSettings