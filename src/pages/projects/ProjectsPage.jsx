import React, { useState } from 'react'
import { ProjectList, CreateProjectModal } from '@/components/projects'
import { Button } from '@/components/shared/ui'
import { Layout } from '@/components/shared/layout'
import { useProjects } from '@/hooks/projects'
import { useProjectContext } from '@/context/ProjectContext'
import { useNavigate } from 'react-router-dom'

/**
 * Página principal de listagem de projetos
 * Dashboard inicial após login
 */
export const ProjectsPage = () => {
  const { projects, isLoading } = useProjects()
  const { setActiveProject } = useProjectContext()
  const navigate = useNavigate()
  
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Handler para seleção de projeto
  const handleProjectSelect = async (project) => {
    try {
      await setActiveProject(project.id)
      // Navegar para a página de detalhes do projeto
      navigate(`/projects/${project.id}/people`)
    } catch (error) {
      console.error('Erro ao selecionar projeto:', error)
    }
  }

  // Handler para criação de projeto
  const handleProjectCreated = async (newProject) => {
    // Automaticamente navegar para o novo projeto
    await handleProjectSelect(newProject)
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header da página */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Meus Projetos
            </h1>
            <p className="mt-2 text-gray-600">
              Gerencie seus projetos e colabore com sua equipe
            </p>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
              />
            </svg>
            Novo Projeto
          </Button>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total de Projetos"
            value={projects.length}
            icon="📁"
            color="blue"
          />
          <StatCard
            title="Projetos Ativos"
            value={projects.filter(p => p.taskCount > 0).length}
            icon="🚀"
            color="green"
          />
          <StatCard
            title="Onde sou Owner"
            value={projects.filter(p => p.userRole === 'owner').length}
            icon="👑"
            color="purple"
          />
        </div>

        {/* Lista de projetos */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {projects.length === 0 && !isLoading ? (
            <EmptyProjectsState onCreateProject={() => setShowCreateModal(true)} />
          ) : (
            <ProjectList onProjectSelect={handleProjectSelect} />
          )}
        </div>

        {/* Modal de criação */}
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      </div>
    </Layout>
  )
}

// Componente de card de estatística
const StatCard = ({ title, value, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center">
        <div className={`
          flex items-center justify-center w-12 h-12 rounded-lg
          ${colorClasses[color]}
        `}>
          <span className="text-2xl">{icon}</span>
        </div>
        
        <div className="ml-4">
          <p className="text-2xl font-bold text-gray-900">
            {value}
          </p>
          <p className="text-sm text-gray-600">
            {title}
          </p>
        </div>
      </div>
    </div>
  )
}

// Estado vazio quando não há projetos
const EmptyProjectsState = ({ onCreateProject }) => {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg 
          className="w-12 h-12 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1} 
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
          />
        </svg>
      </div>

      <h3 className="text-xl font-medium text-gray-900 mb-2">
        Bem-vindo ao Task Manager!
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Você ainda não possui projetos. Crie seu primeiro projeto para começar 
        a organizar tarefas e colaborar com sua equipe.
      </p>

      <div className="space-y-4">
        <Button onClick={onCreateProject} size="lg">
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
            />
          </svg>
          Criar Meu Primeiro Projeto
        </Button>

        <div className="text-sm text-gray-500">
          <p>💡 <strong>Dica:</strong> Projetos ajudam a organizar suas tarefas por contexto</p>
        </div>
      </div>

      {/* Features preview */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-blue-600 text-2xl mb-2">👥</div>
          <h4 className="font-medium text-gray-900 mb-1">Colaboração</h4>
          <p className="text-sm text-gray-600">
            Convide membros e trabalhem juntos em tempo real
          </p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-green-600 text-2xl mb-2">📋</div>
          <h4 className="font-medium text-gray-900 mb-1">Tarefas</h4>
          <p className="text-sm text-gray-600">
            Organize trabalho em tarefas com etapas e dependências
          </p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="text-purple-600 text-2xl mb-2">📊</div>
          <h4 className="font-medium text-gray-900 mb-1">Progresso</h4>
          <p className="text-sm text-gray-600">
            Acompanhe o progresso visual e métricas em tempo real
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProjectsPage