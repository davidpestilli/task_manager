import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, ProgressBar, Badge } from '@/components/shared/ui'
import { cn } from '@/utils/helpers'

/**
 * Componente para exibir cards de progresso dos projetos
 * 
 * Props:
 * - projects: Array de projetos com dados de progresso
 * - loading: Estado de carregamento
 * - onProjectClick: Callback quando um projeto é clicado
 */
const ProjectProgressCards = ({
  projects = [],
  loading = false,
  onProjectClick,
  className
}) => {
  const navigate = useNavigate()

  // Skeleton durante carregamento
  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded-full animate-pulse w-12"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
              <div className="h-2 bg-gray-200 rounded-full animate-pulse w-full"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  // Se não há projetos, mostrar estado vazio
  if (!projects || projects.length === 0) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <div className="text-gray-500">
          <p className="text-sm font-medium mb-2">Nenhum projeto encontrado</p>
          <p className="text-xs">Você ainda não participa de nenhum projeto.</p>
        </div>
      </Card>
    )
  }

  // Função para lidar com clique no projeto
  const handleProjectClick = (project) => {
    if (onProjectClick) {
      onProjectClick(project)
    } else {
      navigate(`/projects/${project.id}/people`)
    }
  }

  // Função para obter cor do progresso
  const getProgressColor = (progress) => {
    if (progress >= 80) return 'green'
    if (progress >= 50) return 'blue'
    if (progress >= 25) return 'yellow'
    return 'red'
  }

  // Função para formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className={cn("space-y-4", className)}>
      {projects.map((project) => (
        <Card 
          key={project.id}
          className="p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01]"
          onClick={() => handleProjectClick(project)}
        >
          <div className="space-y-3">
            {/* Header com nome e progresso */}
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {project.name}
                </h4>
                {project.description && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {project.description}
                  </p>
                )}
              </div>
              <Badge 
                variant={getProgressColor(project.progress)}
                className="ml-3 flex-shrink-0"
              >
                {project.progress}%
              </Badge>
            </div>

            {/* Barra de progresso */}
            <ProgressBar 
              value={project.progress} 
              color={getProgressColor(project.progress)}
              size="sm"
              showLabel={false}
            />

            {/* Estatísticas do projeto */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span>
                  {project.completedTasks} de {project.totalTasks} tarefas
                </span>
                {project.createdAt && (
                  <span>
                    Criado em {formatDate(project.createdAt)}
                  </span>
                )}
              </div>
              
              {/* Indicador de progresso recente */}
              {project.progress > 0 && (
                <div className="flex items-center space-x-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    project.progress === 100 
                      ? "bg-green-500" 
                      : project.progress > 0 
                      ? "bg-blue-500" 
                      : "bg-gray-300"
                  )}></div>
                  <span>
                    {project.progress === 100 
                      ? "Concluído" 
                      : project.progress > 0 
                      ? "Em progresso" 
                      : "Não iniciado"
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default ProjectProgressCards