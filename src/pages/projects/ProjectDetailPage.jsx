import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ProjectHeader, ProjectSettings } from '@/components/projects'
import { Layout } from '@/components/shared/layout'
import { Button, Badge } from '@/components/shared/ui'
import { useProject } from '@/hooks/projects'
import { useProjectContext } from '@/context/ProjectContext'

/**
 * Página de detalhes do projeto com navegação por abas
 * Mostra pessoas, tarefas e outras informações específicas do projeto
 */
export const ProjectDetailPage = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { setActiveProject } = useProjectContext()
  
  const { 
    project, 
    isLoading, 
    error,
    isOwner,
    isAdmin,
    stats 
  } = useProject(projectId)

  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState('people')

  // Definir tab ativa baseada na URL
  useEffect(() => {
    const pathParts = location.pathname.split('/')
    const currentTab = pathParts[pathParts.length - 1]
    
    if (['people', 'tasks'].includes(currentTab)) {
      setActiveTab(currentTab)
    }
  }, [location.pathname])

  // Ativar projeto quando carregar
  useEffect(() => {
    if (projectId && project) {
      setActiveProject(projectId)
    }
  }, [projectId, project, setActiveProject])

  // Navegação entre abas
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    navigate(`/projects/${projectId}/${tab}`, { replace: true })
  }

  // Tabs disponíveis
  const tabs = [
    {
      id: 'people',
      label: 'Pessoas',
      icon: '👥',
      count: stats.memberCount,
      description: 'Membros e suas tarefas'
    },
    {
      id: 'tasks',
      label: 'Tarefas',
      icon: '📋',
      count: stats.taskCount,
      description: 'Todas as tarefas do projeto'
    }
  ]

  // Handlers para ações do projeto
  const handleEditProject = () => {
    setShowSettings(true)
  }

  const handleDeleteProject = () => {
    setShowSettings(true)
    // TODO: focar na aba de danger zone
  }

  const handleManageMembers = () => {
    setShowSettings(true)
    // TODO: focar na aba de membros
  }

  // Estados de loading e erro
  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </Layout>
    )
  }

  if (error || !project) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Projeto não encontrado
            </h3>
            <p className="text-sm text-red-600 mb-4">
              {error || 'O projeto solicitado não existe ou você não tem permissão para acessá-lo.'}
            </p>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Voltar aos Projetos
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header do projeto */}
        <ProjectHeader
          projectId={projectId}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
          onManageMembers={handleManageMembers}
        />

        {/* Navegação por abas */}
        <div className="bg-white border-b border-gray-200">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  <span>{tab.label}</span>
                  
                  {tab.count !== undefined && (
                    <Badge 
                      className={`
                        ml-2 
                        ${activeTab === tab.id 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600'
                        }
                      `}
                    >
                      {tab.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Conteúdo da tab ativa */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'people' && (
            <PeopleTabContent projectId={projectId} />
          )}
          
          {activeTab === 'tasks' && (
            <TasksTabContent projectId={projectId} />
          )}
        </div>

        {/* Modal de configurações */}
        <ProjectSettings
          projectId={projectId}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </Layout>
  )
}

// Componente placeholder para aba de pessoas
const PeopleTabContent = ({ projectId }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">👥</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aba Pessoas
        </h3>
        <p className="text-gray-600 mb-4">
          Esta seção será implementada na próxima etapa (Gestão de Pessoas).
        </p>
        <div className="text-sm text-gray-500">
          <p>🔄 <strong>Próxima Etapa:</strong> Etapa 5 - Gestão de Pessoas</p>
          <p className="mt-1">
            Aqui você verá cards de pessoas com suas tarefas atribuídas,
            sistema de drag & drop para transferir tarefas, e filtros avançados.
          </p>
        </div>
      </div>
    </div>
  )
}

// Componente placeholder para aba de tarefas
const TasksTabContent = ({ projectId }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aba Tarefas
        </h3>
        <p className="text-gray-600 mb-4">
          Esta seção será implementada na Etapa 6 (Gestão de Tarefas).
        </p>
        <div className="text-sm text-gray-500">
          <p>🔄 <strong>Próxima Etapa:</strong> Etapa 6 - Gestão de Tarefas</p>
          <p className="mt-1">
            Aqui você verá cards de tarefas com progresso visual,
            sistema de filtros, modal de criação/edição, e gestão de etapas.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailPage