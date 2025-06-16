import React, { useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/shared/layout'
import { Breadcrumb, BackButton } from '@/components/shared/navigation'
import { PersonTasks, PersonTasksSummary } from '@/components/people'
import { Avatar, Badge, Card, ProgressBar, Spinner, Button } from '@/components/shared/ui'
import { ProjectContext } from '@/context'
import { usePerson } from '@/hooks/people'
import { useProject } from '@/hooks/projects'
import { useAuth } from '@/hooks/auth'
import { formatDistanceToNow, formatDateBR } from '@/utils/formatters'
import { cn } from '@/utils/helpers'

/**
 * Página de detalhes de uma pessoa específica em um projeto
 * Acessível via: /projects/:projectId/people/:personId
 * @returns {JSX.Element}
 */
export function PersonDetailPage() {
  const { projectId, personId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { selectedProject } = useContext(ProjectContext)

  // Hooks para dados
  const { project, isLoading: isLoadingProject } = useProject(projectId, {
    enabled: !selectedProject || selectedProject.id !== projectId
  })

  const {
    person,
    tasks,
    stats,
    isLoading: isLoadingPerson,
    hasError,
    error,
    refreshPersonData
  } = usePerson(personId, { projectId })

  // Usar projeto do contexto ou da query
  const currentProject = selectedProject?.id === projectId ? selectedProject : project

  // Verificar se é o próprio usuário
  const isCurrentUser = user?.id === personId

  // Navegação
  const handleBackToPeople = () => {
    navigate(`/projects/${projectId}/people`)
  }

  const handleBackToProjects = () => {
    navigate('/projects')
  }

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Projetos', href: '/projects' },
    { label: currentProject?.name || 'Carregando...', href: `/projects/${projectId}/people` },
    { label: 'Pessoas', href: `/projects/${projectId}/people` },
    { label: person?.full_name || 'Carregando...', current: true }
  ]

  // Estados de loading
  if (isLoadingProject || isLoadingPerson) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Carregando dados da pessoa...</p>
          </div>
        </div>
      </Layout>
    )
  }

  // Estados de erro
  if (hasError || !person) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-20 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Pessoa não encontrada
            </h2>
            <p className="text-gray-600 mb-6">
              {error?.message || 'A pessoa que você está tentando acessar não foi encontrada ou você não tem permissão para visualizá-la.'}
            </p>
            <Button onClick={handleBackToPeople}>
              Voltar à lista de pessoas
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  // Determinar cor do workload
  const getWorkloadColor = () => {
    if (!stats) return 'gray'
    const activeTasks = stats.inProgressTasks + stats.notStartedTasks
    if (activeTasks >= 10) return 'red'
    if (activeTasks >= 7) return 'yellow'
    if (activeTasks >= 4) return 'blue'
    return 'green'
  }

  const getWorkloadText = () => {
    if (!stats) return 'Sem dados'
    const activeTasks = stats.inProgressTasks + stats.notStartedTasks
    if (activeTasks >= 10) return 'Sobrecarregado'
    if (activeTasks >= 7) return 'Carga pesada'
    if (activeTasks >= 4) return 'Carga moderada'
    return 'Carga leve'
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
            <div className="mt-4 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <BackButton onClick={handleBackToPeople} />
                <div className="flex items-start gap-4">
                  <Avatar
                    src={person.avatar_url}
                    alt={person.full_name}
                    size="xl"
                    fallback={person.full_name}
                  />
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {person.full_name}
                      </h1>
                      {isCurrentUser && (
                        <Badge variant="outline" size="sm">Você</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">
                      {person.email}
                    </p>
                    
                    {/* Badges de informações */}
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={person.role === 'owner' ? 'primary' : 
                                person.role === 'admin' ? 'secondary' : 'default'}
                      >
                        {person.role === 'owner' ? 'Dono' :
                         person.role === 'admin' ? 'Admin' : 'Membro'}
                      </Badge>
                      
                      {stats && (
                        <Badge className={cn(
                          getWorkloadColor() === 'red' ? 'bg-red-100 text-red-800' :
                          getWorkloadColor() === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          getWorkloadColor() === 'blue' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        )}>
                          {getWorkloadText()}
                        </Badge>
                      )}
                      
                      <span className="text-sm text-gray-500">
                        Membro desde {formatDistanceToNow(person.joinedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={refreshPersonData}
                  size="sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Atualizar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna principal - Tarefas */}
            <div className="lg:col-span-2 space-y-6">
              {/* Resumo das tarefas */}
              {tasks && tasks.length > 0 && (
                <PersonTasksSummary tasks={tasks} />
              )}

              {/* Lista de tarefas */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Tarefas atribuídas
                  </h2>
                  <Badge variant="outline">
                    {tasks ? tasks.length : 0} tarefa{tasks?.length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                <PersonTasks
                  tasks={tasks || []}
                  personId={personId}
                  projectId={projectId}
                  compact={false}
                  onTaskClick={(task) => {
                    // TODO: Implementar navegação para detalhes da tarefa
                    console.log('Abrir tarefa:', task.id)
                  }}
                />
              </Card>
            </div>

            {/* Sidebar - Estatísticas e informações */}
            <div className="space-y-6">
              {/* Card de estatísticas */}
              {stats && (
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Estatísticas</h3>
                  
                  <div className="space-y-4">
                    {/* Total de tarefas */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total de tarefas</span>
                      <span className="font-medium">{stats.totalTasks}</span>
                    </div>

                    {/* Progresso médio */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Progresso médio</span>
                        <span className="font-medium">{stats.averageCompletion}%</span>
                      </div>
                      <ProgressBar
                        value={stats.averageCompletion}
                        size="sm"
                        variant={stats.averageCompletion >= 80 ? 'success' : 'default'}
                      />
                    </div>

                    {/* Status das tarefas */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Status das tarefas</h4>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Concluídas</span>
                          <span className="font-medium text-green-600">{stats.completedTasks}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Em andamento</span>
                          <span className="font-medium text-blue-600">{stats.inProgressTasks}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Não iniciadas</span>
                          <span className="font-medium text-gray-600">{stats.notStartedTasks}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Pausadas</span>
                          <span className="font-medium text-yellow-600">{stats.pausedTasks}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Card de informações do usuário */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Informações</h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium text-gray-900 break-all">{person.email}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Role no projeto:</span>
                    <p className="font-medium text-gray-900 capitalize">{person.role}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600">Membro desde:</span>
                    <p className="font-medium text-gray-900">
                      {formatDateBR(person.joinedAt)} ({formatDistanceToNow(person.joinedAt)})
                    </p>
                  </div>
                  
                  {person.created_at && (
                    <div>
                      <span className="text-gray-600">Cadastrado em:</span>
                      <p className="font-medium text-gray-900">
                        {formatDateBR(person.created_at)}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Ações rápidas */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Ações rápidas</h3>
                
                <div className="space-y-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      // TODO: Implementar função de enviar mensagem
                      console.log('Enviar mensagem para:', person.email)
                    }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Enviar email
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigate(`/projects/${projectId}/tasks?assigned=${personId}`)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Ver todas as tarefas
                  </Button>

                  {!isCurrentUser && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        // TODO: Implementar função de atribuir tarefa
                        console.log('Atribuir tarefa para:', person.id)
                      }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Atribuir tarefa
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default PersonDetailPage