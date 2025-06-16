import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/shared/layout'
import { Breadcrumb, BackButton } from '@/components/shared/navigation'
import { TaskList, CreateTaskModal, TaskModal } from '@/components/tasks'
import { Button } from '@/components/shared/ui'
import { useProjectContext } from '@/context/ProjectContext'
import { useCreateTaskModal, useTaskModal } from '@/components/tasks'

/**
 * Página de tarefas de um projeto
 */
const TasksPage = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { selectedProject, selectProject } = useProjectContext()
  
  // Modals
  const createTaskModal = useCreateTaskModal(projectId)
  const taskModal = useTaskModal()

  // Selecionar projeto se não estiver selecionado
  React.useEffect(() => {
    if (projectId && (!selectedProject || selectedProject.id !== projectId)) {
      selectProject(projectId)
    }
  }, [projectId, selectedProject, selectProject])

  // Handlers
  const handleTaskClick = (task) => {
    taskModal.openModal(task.id)
  }

  const handleCreateTask = () => {
    createTaskModal.openModal()
  }

  const handleBackToProjects = () => {
    navigate('/projects')
  }

  const handleTaskCreated = () => {
    // Callback quando tarefa é criada - pode ser usado para analytics
    console.log('Nova tarefa criada')
  }

  const handleTaskUpdated = () => {
    // Callback quando tarefa é atualizada
    console.log('Tarefa atualizada')
  }

  const handleTaskDeleted = (taskId) => {
    // Callback quando tarefa é excluída
    console.log('Tarefa excluída:', taskId)
  }

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Projetos', href: '/projects' },
    { 
      label: selectedProject?.name || 'Carregando...', 
      href: `/projects/${projectId}/people` 
    },
    { label: 'Tarefas', current: true }
  ]

  if (!projectId) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Projeto não encontrado
          </h1>
          <Button onClick={() => navigate('/projects')}>
            Voltar aos Projetos
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />
            
            {/* Título e Ações */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <BackButton onClick={handleBackToProjects} />
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Tarefas
                  </h1>
                  {selectedProject && (
                    <p className="text-gray-600">
                      Projeto: {selectedProject.name}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Navegação entre abas */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => navigate(`/projects/${projectId}/people`)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-white transition-colors"
                  >
                    👥 Pessoas
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-medium bg-white text-blue-600 rounded-md shadow-sm"
                  >
                    📋 Tarefas
                  </button>
                </div>
                
                <Button
                  onClick={handleCreateTask}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  + Nova Tarefa
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="max-w-7xl mx-auto px-6">
          <TaskList
            projectId={projectId}
            onTaskClick={handleTaskClick}
            onCreateTask={handleCreateTask}
            showFilters={true}
            showCreateButton={false} // Já temos o botão no header
            layout="grid"
          />
        </div>
      </div>

      {/* Modals */}
      <createTaskModal.ModalComponent 
        onTaskCreated={handleTaskCreated}
      />
      
      <taskModal.ModalComponent
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />
    </Layout>
  )
}

export default TasksPage