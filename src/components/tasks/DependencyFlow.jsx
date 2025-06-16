import React, { useState, useCallback } from 'react'
import { Button, Modal, Badge, Spinner } from '@/components/shared/ui'
import FlowChart from './FlowChart'
import DependencySelector from './DependencySelector'
import { useProjectDependencyFlow, useTaskDependencies } from '@/hooks/tasks/useTaskDependencies'
import { calculateFlowStatistics, findCriticalPath } from '@/utils/helpers/flowUtils'

/**
 * Componente principal para visualização e gestão de dependências
 * 
 * Props:
 * - projectId: ID do projeto
 * - taskId: ID da tarefa específica (opcional, para foco)
 * - showSelector: Se deve mostrar o seletor de dependências
 * - height: Altura do fluxograma
 */
const DependencyFlow = ({
  projectId,
  taskId = null,
  showSelector = true,
  height = '600px'
}) => {
  const [selectedTask, setSelectedTask] = useState(taskId)
  const [showDependencyModal, setShowDependencyModal] = useState(false)
  const [viewMode, setViewMode] = useState('full') // 'full' | 'focused' | 'critical'

  // Dados do fluxo de dependências
  const {
    nodes,
    edges,
    isLoading: isFlowLoading,
    error: flowError,
    refetch: refetchFlow
  } = useProjectDependencyFlow(projectId)

  // Dependências da tarefa selecionada
  const {
    dependencies,
    dependents,
    blockStatus,
    isLoading: isDependenciesLoading,
    refreshDependencies
  } = useTaskDependencies(selectedTask, projectId)

  // Calcular estatísticas do fluxo
  const flowStats = calculateFlowStatistics(nodes, edges)
  const criticalPath = findCriticalPath(nodes, edges)

  // Filtrar dados baseado no modo de visualização
  const getFilteredData = useCallback(() => {
    let filteredNodes = [...nodes]
    let filteredEdges = [...edges]

    switch (viewMode) {
      case 'focused':
        if (selectedTask) {
          // Mostrar apenas tarefa selecionada e suas dependências diretas
          const relatedTaskIds = new Set([selectedTask])
          
          // Adicionar dependências
          dependencies.forEach(dep => relatedTaskIds.add(dep.depends_on_task_id))
          
          // Adicionar dependentes
          dependents.forEach(dep => relatedTaskIds.add(dep.task.id))
          
          filteredNodes = nodes.filter(node => relatedTaskIds.has(node.id))
          filteredEdges = edges.filter(edge => 
            relatedTaskIds.has(edge.source) && relatedTaskIds.has(edge.target)
          )
        }
        break

      case 'critical':
        // Mostrar apenas caminho crítico
        if (criticalPath.length > 0) {
          const criticalTaskIds = new Set(criticalPath)
          filteredNodes = nodes.filter(node => criticalTaskIds.has(node.id))
          filteredEdges = edges.filter(edge =>
            criticalTaskIds.has(edge.source) && criticalTaskIds.has(edge.target)
          ).map(edge => ({
            ...edge,
            data: { ...edge.data, critical: true }
          }))
        }
        break

      default:
        // Modo completo - mostrar tudo
        break
    }

    return { nodes: filteredNodes, edges: filteredEdges }
  }, [nodes, edges, viewMode, selectedTask, dependencies, dependents, criticalPath])

  // Handlers
  const handleNodeClick = useCallback((node) => {
    setSelectedTask(node.id)
  }, [])

  const handleAddDependency = useCallback(() => {
    setShowDependencyModal(true)
  }, [])

  const handleDependencyChange = useCallback(() => {
    refreshDependencies()
    refetchFlow()
  }, [refreshDependencies, refetchFlow])

  const { nodes: displayNodes, edges: displayEdges } = getFilteredData()

  // Estados de loading e erro
  if (isFlowLoading) {
    return (
      <div className="flex items-center justify-center p-8" style={{ height }}>
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-2 text-gray-600">Carregando fluxo de dependências...</p>
        </div>
      </div>
    )
  }

  if (flowError) {
    return (
      <div className="flex items-center justify-center p-8" style={{ height }}>
        <div className="text-center">
          <div className="text-red-500 mb-2">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erro ao carregar dependências
          </h3>
          <p className="text-gray-500 mb-4">
            Não foi possível carregar o fluxo de dependências
          </p>
          <Button onClick={refetchFlow}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header com estatísticas e controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">
            Fluxo de Dependências
          </h3>
          
          {/* Estatísticas */}
          <div className="flex items-center space-x-2">
            <Badge variant="blue">
              {flowStats.totalTasks} tarefas
            </Badge>
            <Badge variant="gray">
              {flowStats.totalDependencies} dependências
            </Badge>
            {flowStats.independentTasks > 0 && (
              <Badge variant="green">
                {flowStats.independentTasks} independentes
              </Badge>
            )}
          </div>
        </div>

        {/* Controles de visualização */}
        <div className="flex items-center space-x-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="full">Visualização completa</option>
            <option value="focused" disabled={!selectedTask}>
              Foco na tarefa
            </option>
            <option value="critical" disabled={criticalPath.length === 0}>
              Caminho crítico
            </option>
          </select>

          {showSelector && (
            <Button
              size="sm"
              onClick={handleAddDependency}
              disabled={!selectedTask}
            >
              Gerenciar Dependências
            </Button>
          )}
        </div>
      </div>

      {/* Informações da tarefa selecionada */}
      {selectedTask && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">
                Tarefa Selecionada
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                {nodes.find(n => n.id === selectedTask)?.data?.name || 'Carregando...'}
              </p>
            </div>

            <div className="flex items-center space-x-4 text-sm">
              {isDependenciesLoading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <div className="text-blue-700">
                    <span className="font-medium">{dependencies.length}</span> dependências
                  </div>
                  <div className="text-blue-700">
                    <span className="font-medium">{dependents.length}</span> dependentes
                  </div>
                  {blockStatus.isBlocked && (
                    <Badge variant="amber" size="sm">
                      Bloqueada
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alertas importantes */}
      {blockStatus.isBlocked && selectedTask && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-amber-600">⚠️</span>
            <div>
              <h4 className="font-medium text-amber-900">
                Tarefa Bloqueada
              </h4>
              <p className="text-sm text-amber-700">
                Esta tarefa está bloqueada por {blockStatus.blockedByTasks.length} dependência(s) não concluída(s).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fluxograma */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <FlowChart
          nodes={displayNodes}
          edges={displayEdges}
          onNodeClick={handleNodeClick}
          height={height}
          layout="hierarchical"
        />
      </div>

      {/* Informações adicionais */}
      {viewMode === 'critical' && criticalPath.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">
            Caminho Crítico ({criticalPath.length} tarefas)
          </h4>
          <p className="text-sm text-red-700">
            Este é o caminho mais longo de dependências no projeto. 
            Atrasos nestas tarefas afetarão diretamente o prazo final.
          </p>
        </div>
      )}

      {/* Modal de gestão de dependências */}
      <Modal
        isOpen={showDependencyModal}
        onClose={() => setShowDependencyModal(false)}
        title="Gerenciar Dependências"
        size="lg"
      >
        {selectedTask ? (
          <DependencySelector
            taskId={selectedTask}
            projectId={projectId}
            onDependencyAdd={handleDependencyChange}
            onDependencyRemove={handleDependencyChange}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Selecione uma tarefa no fluxograma para gerenciar suas dependências
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}

/**
 * Componente simplificado apenas para visualização
 */
export const DependencyFlowViewer = ({ projectId, height = '400px' }) => {
  return (
    <DependencyFlow
      projectId={projectId}
      showSelector={false}
      height={height}
    />
  )
}

/**
 * Componente focado em uma tarefa específica
 */
export const TaskDependencyView = ({ taskId, projectId, height = '300px' }) => {
  return (
    <DependencyFlow
      projectId={projectId}
      taskId={taskId}
      height={height}
    />
  )
}

export default DependencyFlow