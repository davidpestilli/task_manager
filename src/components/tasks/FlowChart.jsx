import React, { useState, useCallback, useEffect } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel
} from 'reactflow'
import 'reactflow/dist/style.css'

import { nodeTypes } from './FlowNode'
import { edgeTypes } from './FlowEdge'
import { Button } from '@/components/shared/ui'
import { applyHierarchicalLayout, applyGridLayout, formatForReactFlow } from '@/utils/helpers/flowUtils'

/**
 * Componente principal do fluxograma de dependências
 * 
 * Props:
 * - nodes: Lista de nós do fluxograma
 * - edges: Lista de arestas do fluxograma
 * - onNodeClick: Callback quando nó é clicado
 * - onEdgeClick: Callback quando aresta é clicada
 * - interactive: Se permite interação (default: true)
 * - layout: Tipo de layout ('hierarchical' | 'grid')
 * - height: Altura do container
 */
const FlowChart = ({
  nodes: initialNodes = [],
  edges: initialEdges = [],
  onNodeClick,
  onEdgeClick,
  interactive = true,
  layout = 'hierarchical',
  height = '500px'
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [currentLayout, setCurrentLayout] = useState(layout)
  const [isLoading, setIsLoading] = useState(false)

  // Estado do fluxograma
  const [flowState, setFlowState] = useState({
    selectedNode: null,
    selectedEdge: null,
    showMiniMap: true,
    showBackground: true,
    fitViewOnChange: true
  })

  // Aplicar layout aos nós
  const applyLayout = useCallback((layoutType, nodeList, edgeList) => {
    setIsLoading(true)
    
    try {
      let positionedNodes
      
      switch (layoutType) {
        case 'hierarchical':
          positionedNodes = applyHierarchicalLayout(nodeList, edgeList)
          break
        case 'grid':
          positionedNodes = applyGridLayout(nodeList, 3)
          break
        default:
          positionedNodes = nodeList
      }

      // Formatar para React Flow
      const formatted = formatForReactFlow(positionedNodes, edgeList)
      
      setNodes(formatted.nodes)
      setEdges(formatted.edges)
    } catch (error) {
      console.error('Erro ao aplicar layout:', error)
    } finally {
      setIsLoading(false)
    }
  }, [setNodes, setEdges])

  // Atualizar quando dados iniciais mudarem
  useEffect(() => {
    if (initialNodes.length > 0) {
      applyLayout(currentLayout, initialNodes, initialEdges)
    }
  }, [initialNodes, initialEdges, currentLayout, applyLayout])

  // Handlers de eventos
  const onConnect = useCallback(
    (params) => {
      if (interactive) {
        setEdges((eds) => addEdge(params, eds))
      }
    },
    [interactive, setEdges]
  )

  const onNodeClickHandler = useCallback(
    (event, node) => {
      setFlowState(prev => ({ ...prev, selectedNode: node.id }))
      if (onNodeClick) {
        onNodeClick(node)
      }
    },
    [onNodeClick]
  )

  const onEdgeClickHandler = useCallback(
    (event, edge) => {
      setFlowState(prev => ({ ...prev, selectedEdge: edge.id }))
      if (onEdgeClick) {
        onEdgeClick(edge)
      }
    },
    [onEdgeClick]
  )

  // Limpar seleção ao clicar no fundo
  const onPaneClick = useCallback(() => {
    setFlowState(prev => ({
      ...prev,
      selectedNode: null,
      selectedEdge: null
    }))
  }, [])

  // Trocar layout
  const changeLayout = useCallback((newLayout) => {
    setCurrentLayout(newLayout)
    applyLayout(newLayout, initialNodes, initialEdges)
  }, [applyLayout, initialNodes, initialEdges])

  // Configurações do React Flow
  const reactFlowProps = {
    nodes,
    edges,
    onNodesChange: interactive ? onNodesChange : undefined,
    onEdgesChange: interactive ? onEdgesChange : undefined,
    onConnect: interactive ? onConnect : undefined,
    onNodeClick: onNodeClickHandler,
    onEdgeClick: onEdgeClickHandler,
    onPaneClick,
    nodeTypes,
    edgeTypes,
    fitView: true,
    fitViewOptions: { padding: 0.2 },
    defaultViewport: { x: 0, y: 0, zoom: 1 },
    attributionPosition: 'bottom-left'
  }

  // Estado vazio
  if (initialNodes.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg"
        style={{ height }}
      >
        <div className="text-center p-8">
          <div className="text-gray-400 mb-2">
            📊
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma dependência encontrada
          </h3>
          <p className="text-gray-500">
            As dependências entre tarefas aparecerão aqui quando criadas
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative" style={{ height }}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Aplicando layout...</p>
          </div>
        </div>
      )}

      {/* React Flow */}
      <ReactFlow {...reactFlowProps}>
        {/* Controles */}
        {interactive && <Controls />}

        {/* Background */}
        {flowState.showBackground && (
          <Background variant="dots" gap={20} size={1} />
        )}

        {/* Mini mapa */}
        {flowState.showMiniMap && initialNodes.length > 5 && (
          <MiniMap
            nodeColor={(node) => {
              const colors = {
                'não_iniciada': '#6B7280',
                'em_andamento': '#3B82F6',
                'pausada': '#F59E0B',
                'concluída': '#10B981'
              }
              return colors[node.data?.status] || '#6B7280'
            }}
            pannable
            zoomable
            position="bottom-right"
          />
        )}

        {/* Painel de controles */}
        <Panel position="top-left" className="bg-white rounded-lg shadow-lg border p-3">
          <div className="space-y-3">
            {/* Controles de layout */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Layout
              </label>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant={currentLayout === 'hierarchical' ? 'primary' : 'outline'}
                  onClick={() => changeLayout('hierarchical')}
                >
                  Hierárquico
                </Button>
                <Button
                  size="sm"
                  variant={currentLayout === 'grid' ? 'primary' : 'outline'}
                  onClick={() => changeLayout('grid')}
                >
                  Grade
                </Button>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="text-xs text-gray-500 border-t pt-2">
              <div>{initialNodes.length} tarefas</div>
              <div>{initialEdges.length} dependências</div>
            </div>

            {/* Toggles de visualização */}
            <div className="border-t pt-2 space-y-1">
              <label className="flex items-center space-x-2 text-xs">
                <input
                  type="checkbox"
                  checked={flowState.showMiniMap}
                  onChange={(e) => setFlowState(prev => ({
                    ...prev,
                    showMiniMap: e.target.checked
                  }))}
                  className="rounded"
                />
                <span>Mini mapa</span>
              </label>
              
              <label className="flex items-center space-x-2 text-xs">
                <input
                  type="checkbox"
                  checked={flowState.showBackground}
                  onChange={(e) => setFlowState(prev => ({
                    ...prev,
                    showBackground: e.target.checked
                  }))}
                  className="rounded"
                />
                <span>Background</span>
              </label>
            </div>
          </div>
        </Panel>

        {/* Informações do nó selecionado */}
        {flowState.selectedNode && (
          <Panel position="top-right" className="bg-white rounded-lg shadow-lg border p-3 max-w-xs">
            {(() => {
              const selectedNodeData = nodes.find(n => n.id === flowState.selectedNode)?.data
              if (!selectedNodeData) return null

              return (
                <div>
                  <h4 className="font-medium text-sm mb-2">
                    {selectedNodeData.name}
                  </h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Status: {selectedNodeData.status}</div>
                    {selectedNodeData.assignees?.length > 0 && (
                      <div>
                        Atribuída a: {selectedNodeData.assignees.map(a => a.full_name).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}

export default FlowChart