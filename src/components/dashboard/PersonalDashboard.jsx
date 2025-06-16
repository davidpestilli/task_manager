import React from 'react'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  FolderIcon, 
  TrendingUpIcon,
  RefreshCcwIcon
} from 'lucide-react'
import { Button } from '@/components/shared/ui'
import { ActivityTimeline } from '@/components/dashboard'
import MetricCard from './MetricCard'
import ProgressChart from './ProgressChart'
import ProjectProgressCards from './ProjectProgressCards'
import { useMetrics } from '@/hooks/dashboard'
import { cn } from '@/utils/helpers'

/**
 * Dashboard pessoal principal
 * 
 * Responsabilidades:
 * - Exibir métricas pessoais do usuário
 * - Mostrar gráficos de progresso
 * - Listar projetos com progresso
 * - Timeline de atividades recentes
 * - Permitir refresh manual dos dados
 */
const PersonalDashboard = ({ className }) => {
  const {
    metrics,
    weeklyProgress,
    statusDistribution,
    projectProgress,
    recentActivities,
    timeMetrics,
    isLoading,
    refreshing,
    hasError,
    refreshAllMetrics
  } = useMetrics()

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header com botão de refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Pessoal
          </h1>
          <p className="text-gray-600 mt-1">
            Acompanhe seu progresso e produtividade
          </p>
        </div>
        
        <Button 
          variant="outline"
          onClick={refreshAllMetrics}
          disabled={refreshing}
          className="flex items-center space-x-2"
        >
          <RefreshCcwIcon 
            className={cn(
              "w-4 h-4", 
              refreshing && "animate-spin"
            )} 
          />
          <span>Atualizar</span>
        </Button>
      </div>

      {/* Cards de métricas principais (Grid 2x2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tarefas Ativas */}
        <MetricCard
          title="Tarefas Ativas"
          value={metrics.activeTasks}
          trend={{
            value: metrics.trend.activeTasks,
            suffix: ' esta semana',
            period: ''
          }}
          icon={ClockIcon}
          color="blue"
          loading={isLoading}
        />

        {/* Concluídas no Mês */}
        <MetricCard
          title="Concluídas"
          value={metrics.completedThisMonth}
          trend={{
            value: metrics.trend.completedTasks,
            suffix: ' vs mês anterior',
            period: ''
          }}
          icon={CheckCircleIcon}
          color="green"
          loading={isLoading}
        />

        {/* Taxa de Conclusão */}
        <MetricCard
          title="Progresso Médio"
          value={metrics.averageProgress}
          suffix="%"
          trend={{
            value: metrics.trend.averageProgress,
            suffix: '%',
            period: ''
          }}
          icon={TrendingUpIcon}
          color="yellow"
          loading={isLoading}
        />

        {/* Projetos Ativos */}
        <MetricCard
          title="Projetos Ativos"
          value={metrics.activeProjects}
          suffix=" projetos"
          icon={FolderIcon}
          color="red"
          loading={isLoading}
        />
      </div>

      {/* Gráficos e visualizações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progresso Semanal */}
        <ProgressChart
          type="bar"
          data={weeklyProgress}
          title="Progresso Semanal"
          loading={isLoading}
          height={250}
        />

        {/* Distribuição por Status */}
        <ProgressChart
          type="pie"
          data={statusDistribution}
          title="Distribuição por Status"
          loading={isLoading}
          height={250}
        />
      </div>

      {/* Seção inferior - Projetos e Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progresso dos Projetos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Projetos por Progresso
            </h2>
            {projectProgress && projectProgress.length > 3 && (
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            )}
          </div>
          
          <ProjectProgressCards
            projects={projectProgress?.slice(0, 3) || []}
            loading={isLoading}
          />
        </div>

        {/* Timeline de Atividades */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Atividade Recente
            </h2>
            {recentActivities && recentActivities.length > 0 && (
              <Button variant="ghost" size="sm">
                Ver todas
              </Button>
            )}
          </div>
          
          <ActivityTimeline
            activities={recentActivities}
            loading={isLoading}
            maxItems={5}
          />
        </div>
      </div>

      {/* Métricas de Tempo (Se disponível) */}
      {timeMetrics && timeMetrics.totalCompleted > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Tempo Médio"
            value={timeMetrics.averageCompletionTime}
            suffix=" dias"
            color="blue"
            loading={isLoading}
          />
          
          <MetricCard
            title="Conclusão Mais Rápida"
            value={timeMetrics.fastestCompletion}
            suffix=" dias"
            color="green"
            loading={isLoading}
          />
          
          <MetricCard
            title="Conclusão Mais Lenta"
            value={timeMetrics.slowestCompletion}
            suffix=" dias"
            color="yellow"
            loading={isLoading}
          />
        </div>
      )}

      {/* Estado de erro */}
      {hasError && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-red-800">
                Erro ao carregar dados do dashboard
              </p>
              <p className="text-xs text-red-600 mt-1">
                Tente atualizar os dados ou recarregue a página
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshAllMetrics}
              className="ml-auto"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PersonalDashboard