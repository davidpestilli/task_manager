import React from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/shared/layout'
import { Card, Button, Badge } from '@/components/shared/ui'
import { useAuth } from '@/hooks/auth'
import { formatRelativeTime } from '@/utils/helpers'

/**
 * Página Dashboard (Placeholder para Etapa 4)
 * 
 * Versão temporária com layout básico e cards de preview
 * das funcionalidades que serão implementadas
 */
const DashboardPage = () => {
  const { user } = useAuth()

  // Mock data para demonstração visual
  const mockStats = [
    {
      title: 'Projetos Ativos',
      value: '3',
      change: '+1 esta semana',
      changeType: 'positive',
      icon: ProjectsIcon
    },
    {
      title: 'Tarefas Pendentes',
      value: '12',
      change: '-2 desde ontem',
      changeType: 'positive',
      icon: TasksIcon
    },
    {
      title: 'Taxa de Conclusão',
      value: '87%',
      change: '+5% este mês',
      changeType: 'positive',
      icon: ProgressIcon
    },
    {
      title: 'Colaboradores',
      value: '8',
      change: 'Estável',
      changeType: 'neutral',
      icon: PeopleIcon
    }
  ]

  const mockRecentActivity = [
    {
      id: 1,
      action: 'concluiu a tarefa',
      target: 'Setup inicial do projeto',
      user: 'João Silva',
      time: new Date(Date.now() - 1000 * 60 * 30) // 30 min atrás
    },
    {
      id: 2,
      action: 'foi atribuído à tarefa',
      target: 'Implementar autenticação',
      user: 'Maria Santos',
      time: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2h atrás
    },
    {
      id: 3,
      action: 'criou o projeto',
      target: 'Website Corporativo',
      user: 'Ana Costa',
      time: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 dia atrás
    }
  ]

  const mockProjects = [
    {
      id: 1,
      name: 'Website Corporativo',
      progress: 75,
      tasks: { total: 20, completed: 15 },
      members: 4,
      status: 'em_andamento'
    },
    {
      id: 2,
      name: 'App Mobile',
      progress: 45,
      tasks: { total: 25, completed: 11 },
      members: 3,
      status: 'em_andamento'
    },
    {
      id: 3,
      name: 'Dashboard Analytics',
      progress: 100,
      tasks: { total: 15, completed: 15 },
      members: 2,
      status: 'concluída'
    }
  ]

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header de boas-vindas */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bem-vindo de volta, {user?.full_name?.split(' ')[0] || 'Usuário'}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Aqui está o resumo das suas atividades e projetos em andamento.
          </p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockStats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'negative' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {/* Layout de duas colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projetos Recentes */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Projetos Ativos
                  </h2>
                  <Link to="/projects">
                    <Button variant="secondary" size="small">
                      Ver Todos
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {mockProjects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">
                        {project.name}
                      </h3>
                      <Badge variant={project.status}>
                        {project.status === 'em_andamento' ? 'Em Andamento' : 'Concluída'}
                      </Badge>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progresso</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>
                        {project.tasks.completed}/{project.tasks.total} tarefas
                      </span>
                      <span>
                        {project.members} membros
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Atividade Recente */}
          <div>
            <Card>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Atividade Recente
                </h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {mockRecentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.user}</span>
                          {' '}{activity.action}{' '}
                          <span className="font-medium">"{activity.target}"</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatRelativeTime(activity.time)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Link to="/notifications">
                    <Button variant="secondary" size="small" className="w-full">
                      Ver Todas as Atividades
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Call to action para próximas funcionalidades */}
        <Card className="p-8 text-center bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-white" 
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
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🚀 Etapa 3 - Layout Base Concluída!
            </h3>
            <p className="text-gray-600 mb-4">
              Sistema de layout, navegação e componentes base implementados com sucesso.
            </p>
            <p className="text-sm text-blue-700 font-medium">
              <strong>Próxima Etapa:</strong> Gestão de Projetos
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  )
}

// Ícones para as estatísticas
const ProjectsIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
)

const TasksIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
)

const ProgressIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const PeopleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

export default DashboardPage