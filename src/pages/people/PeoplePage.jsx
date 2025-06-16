import React, { useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/shared/layout'
import { Breadcrumb, BackButton } from '@/components/shared/navigation'
import { PersonList, AddPersonModal } from '@/components/people'
import { Button, Spinner } from '@/components/shared/ui'
import { ProjectContext } from '@/context'
import { useProject } from '@/hooks/projects'
import { useAuth } from '@/hooks/auth'
import { cn } from '@/utils/helpers'

/**
 * Página de gestão de pessoas em um projeto específico
 * Acessível via: /projects/:projectId/people
 * @returns {JSX.Element}
 */
export function PeoplePage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { selectedProject, setSelectedProject } = useContext(ProjectContext)
  
  const [showAddPersonModal, setShowAddPersonModal] = useState(false)

  // Buscar dados do projeto se não estiver no contexto
  const { project, isLoading: isLoadingProject, error: projectError } = useProject(projectId, {
    enabled: !selectedProject || selectedProject.id !== projectId
  })

  // Atualizar contexto se necessário
  React.useEffect(() => {
    if (project && (!selectedProject || selectedProject.id !== project.id)) {
      setSelectedProject(project)
    }
  }, [project, selectedProject, setSelectedProject])

  // Usar projeto do contexto ou da query
  const currentProject = selectedProject?.id === projectId ? selectedProject : project

  // Verificar permissões do usuário atual
  const currentUserMembership = currentProject?.members?.find(m => m.id === user?.id)
  const canManagePeople = currentUserMembership?.role === 'owner' || currentUserMembership?.role === 'admin'

  // Navegação
  const handleBackToProjects = () => {
    navigate('/projects')
  }

  const handleNavigateToTasks = () => {
    navigate(`/projects/${projectId}/tasks`)
  }

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Projetos', href: '/projects' },
    { label: currentProject?.name || 'Carregando...', href: `/projects/${projectId}/people` },
    { label: 'Pessoas', current: true }
  ]

  // Estados de loading e erro
  if (isLoadingProject && !currentProject) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Carregando projeto...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (projectError || (!isLoadingProject && !currentProject)) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-20 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Projeto não encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              O projeto que você está tentando acessar não existe ou você não tem permissão para visualizá-lo.
            </p>
            <Button onClick={handleBackToProjects}>
              Voltar aos projetos
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header da página */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />
            
            {/* Header principal */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <BackButton onClick={handleBackToProjects} />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {currentProject.name}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Gerencie os membros do projeto
                  </p>
                </div>
              </div>

              {/* Ações do header */}
              <div className="flex items-center gap-3">
                {/* Botão para ir para tarefas */}
                <Button
                  variant="secondary"
                  onClick={handleNavigateToTasks}
                  className="flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Ver tarefas
                </Button>

                {/* Botão adicionar pessoa */}
                {canManagePeople && (
                  <Button
                    onClick={() => setShowAddPersonModal(true)}
                    className="flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Adicionar pessoa
                  </Button>
                )}
              </div>
            </div>

            {/* Abas de navegação */}
            <div className="mt-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  className={cn(
                    'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                    'border-blue-500 text-blue-600' // Aba ativa
                  )}
                >
                  Pessoas
                </button>
                <button
                  onClick={handleNavigateToTasks}
                  className={cn(
                    'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                    'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  Tarefas
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="px-6 pb-6">
          {/* Informações do projeto */}
          {currentProject.description && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">Sobre o projeto</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                {currentProject.description}
              </p>
            </div>
          )}

          {/* Lista de pessoas */}
          <PersonList
            projectId={projectId}
            showFilters={true}
            layout="auto"
          />
        </div>
      </div>

      {/* Modal de adicionar pessoa */}
      <AddPersonModal
        isOpen={showAddPersonModal}
        onClose={() => setShowAddPersonModal(false)}
        projectId={projectId}
      />
    </Layout>
  )
}

export default PeoplePage