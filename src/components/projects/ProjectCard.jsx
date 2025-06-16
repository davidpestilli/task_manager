import React from 'react'
import { Card, Avatar, Badge } from '@/components/shared/ui'
import { useProjectContext } from '@/context/ProjectContext'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Card de projeto para exibição na lista
 * Mostra informações resumidas e permite navegação
 */
export const ProjectCard = ({
  project,
  onClick,
  className = '',
  showActions = false
}) => {
  const { setActiveProject } = useProjectContext()

  // Handlers
  const handleClick = () => {
    setActiveProject(project.id)
    onClick?.(project)
  }

  // Formatação de datas
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

  // Estatísticas do projeto
  const stats = [
    {
      label: 'Membros',
      value: project.memberCount || 0,
      icon: '👥'
    },
    {
      label: 'Tarefas',
      value: project.taskCount || 0,
      icon: '📋'
    }
  ]

  // Badge do role do usuário (se aplicável)
  const userRole = project.userRole
  const roleColors = {
    owner: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    member: 'bg-gray-100 text-gray-800'
  }

  return (
    <Card
      className={`
        group cursor-pointer transition-all duration-200
        hover:shadow-lg hover:scale-[1.02] hover:border-blue-300
        ${className}
      `}
      onClick={handleClick}
    >
      {/* Header do card */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600">
            {project.name}
          </h3>
          
          {userRole && (
            <Badge
              className={`mt-1 text-xs ${roleColors[userRole] || roleColors.member}`}
            >
              {userRole === 'owner' ? 'Proprietário' : 
               userRole === 'admin' ? 'Admin' : 'Membro'}
            </Badge>
          )}
        </div>

        {/* Avatar do owner */}
        <div className="flex items-center ml-3">
          <Avatar
            src={project.owner?.avatar_url}
            alt={project.owner?.full_name}
            size="sm"
            fallback={project.owner?.full_name?.charAt(0)}
          />
        </div>
      </div>

      {/* Descrição */}
      {project.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Estatísticas */}
      <div className="flex items-center space-x-4 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center text-sm text-gray-500">
            <span className="mr-1">{stat.icon}</span>
            <span className="font-medium text-gray-900">{stat.value}</span>
            <span className="ml-1">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Footer com datas */}
      <div className="border-t pt-3 mt-4">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div>
            <span>Criado {formatDate(project.created_at)}</span>
          </div>
          
          {project.updated_at !== project.created_at && (
            <div>
              <span>Atualizado {formatDate(project.updated_at)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Indicador de projeto ativo */}
      <div className="absolute top-2 right-2">
        <div className={`
          w-2 h-2 rounded-full transition-opacity duration-200
          ${project.isActive ? 'bg-green-500 opacity-100' : 'bg-gray-300 opacity-0 group-hover:opacity-50'}
        `} />
      </div>
    </Card>
  )
}

// Variação para estado de loading
export const ProjectCardSkeleton = () => {
  return (
    <Card className="animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
      
      <div className="flex space-x-4 mb-4">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
      
      <div className="border-t pt-3">
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </Card>
  )
}

export default ProjectCard