import React, { useState } from 'react'
import { Button, Avatar, Badge, Dropdown } from '@/components/shared/ui'
import { useProject } from '@/hooks/projects'
import { useProjectContext } from '@/context/ProjectContext'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Header do projeto com informações e ações
 * Exibido no topo das páginas de projeto
 */
export const ProjectHeader = ({ 
  projectId, 
  showBackButton = true,
  onEditProject,
  onDeleteProject,
  onManageMembers
}) => {
  const { project, isLoading, isOwner, isAdmin, stats } = useProject(projectId)
  const { setActiveProject } = useProjectContext()
  const [showDropdown, setShowDropdown] = useState(false)

  // Handler para voltar aos projetos
  const handleBackToProjects = () => {
    setActiveProject(null)
    // Navegar para lista de projetos
    window.history.pushState({}, '', '/')
  }

  // Formatação de data
  const formatDate = (date) => {
    if (!date) return ''
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: ptBR
      })
    } catch {
      return ''
    }
  }

  // Opções do dropdown de ações
  const actionOptions = [
    ...(isAdmin ? [{
      label: 'Editar Projeto',
      icon: '✏️',
      onClick: () => onEditProject?.(project)
    }] : []),
    ...(isAdmin ? [{
      label: 'Gerenciar Membros',
      icon: '👥',
      onClick: () => onManageMembers?.(project)
    }] : []),
    ...(isOwner ? [{
      label: 'Configurações',
      icon: '⚙️',
      onClick: () => {} // TODO: implementar configurações
    }] : []),
    ...(isOwner ? [{
      label: 'Excluir Projeto',
      icon: '🗑️',
      onClick: () => onDeleteProject?.(project),
      className: 'text-red-600 hover:bg-red-50'
    }] : [])
  ]

  if (isLoading) {
    return <ProjectHeaderSkeleton />
  }

  if (!project) {
    return null
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* Navegação superior */}
          <div className="flex items-center mb-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToProjects}
                className="mr-4"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar aos Projetos
              </Button>
            )}

            {/* Breadcrumb */}
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm text-gray-500">
                <li>
                  <button
                    onClick={handleBackToProjects}
                    className="hover:text-gray-700 transition-colors"
                  >
                    Projetos
                  </button>
                </li>
                <li>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </li>
                <li className="text-gray-900 font-medium">
                  {project.name}
                </li>
              </ol>
            </nav>
          </div>

          {/* Header principal */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Título e badges */}
              <div className="flex items-center mb-2">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {project.name}
                </h1>
                
                {isOwner && (
                  <Badge className="ml-3 bg-purple-100 text-purple-800">
                    Proprietário
                  </Badge>
                )}
                
                {isAdmin && !isOwner && (
                  <Badge className="ml-3 bg-blue-100 text-blue-800">
                    Administrador
                  </Badge>
                )}
              </div>

              {/* Descrição */}
              {project.description && (
                <p className="text-gray-600 mb-4 max-w-3xl">
                  {project.description}
                </p>
              )}

              {/* Estatísticas */}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium text-gray-900">{stats.memberCount}</span>
                  <span className="ml-1">membros</span>
                </div>

                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span className="font-medium text-gray-900">{stats.taskCount}</span>
                  <span className="ml-1">tarefas</span>
                </div>

                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Criado {formatDate(project.created_at)}</span>
                </div>

                {project.updated_at !== project.created_at && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Atualizado {formatDate(project.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center space-x-3 ml-6">
              {/* Avatar do owner */}
              <div className="flex items-center">
                <Avatar
                  src={project.owner?.avatar_url}
                  alt={project.owner?.full_name}
                  size="sm"
                  fallback={project.owner?.full_name?.charAt(0)}
                />
                <div className="ml-2 text-sm">
                  <p className="font-medium text-gray-900">{project.owner?.full_name}</p>
                  <p className="text-gray-500">Proprietário</p>
                </div>
              </div>

              {/* Dropdown de ações */}
              {actionOptions.length > 0 && (
                <Dropdown
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </Button>
                  }
                  options={actionOptions}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton para loading
const ProjectHeaderSkeleton = () => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6 animate-pulse">
          <div className="flex items-center mb-4">
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-96 bg-gray-200 rounded mb-4"></div>
              <div className="flex space-x-6">
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectHeader