import React from 'react'
import { getSmoothStepPath, getMarkerEnd } from 'reactflow'

/**
 * Componente de aresta personalizada para fluxograma de dependências
 * 
 * Props:
 * - id: ID da aresta
 * - sourceX, sourceY: Coordenadas do ponto de origem
 * - targetX, targetY: Coordenadas do ponto de destino
 * - sourcePosition, targetPosition: Posições dos handles
 * - data: Dados adicionais da dependência
 * - selected: Se a aresta está selecionada
 * - markerEnd: Configuração da seta
 */
const FlowEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data = {},
  selected,
  markerEnd
}) => {
  const { type = 'dependency', strength = 'normal', critical = false } = data

  // Calcular caminho da aresta
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8
  })

  // Estilos baseados no tipo e estado
  const getEdgeStyle = () => {
    const baseStyle = {
      strokeWidth: 2,
      stroke: '#6B7280'
    }

    // Estilos para diferentes tipos
    if (critical) {
      return {
        ...baseStyle,
        stroke: '#EF4444',
        strokeWidth: 3,
        strokeDasharray: '5,5'
      }
    }

    if (type === 'blocking') {
      return {
        ...baseStyle,
        stroke: '#F59E0B',
        strokeWidth: 2.5
      }
    }

    if (selected) {
      return {
        ...baseStyle,
        stroke: '#3B82F6',
        strokeWidth: 3
      }
    }

    // Estilo baseado na força da dependência
    const strengthStyles = {
      weak: { ...baseStyle, strokeWidth: 1, strokeDasharray: '3,3' },
      normal: baseStyle,
      strong: { ...baseStyle, strokeWidth: 3 }
    }

    return strengthStyles[strength] || baseStyle
  }

  // Calcular posição do label (se necessário)
  const labelX = (sourceX + targetX) / 2
  const labelY = (sourceY + targetY) / 2

  const edgeStyle = getEdgeStyle()

  return (
    <>
      {/* Caminho principal da aresta */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={edgeStyle}
        markerEnd={markerEnd}
      />

      {/* Caminho invisível mais largo para melhor interação */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={20}
        className="react-flow__edge-interaction"
      />

      {/* Label da aresta (se crítica ou selecionada) */}
      {(critical || selected) && (
        <g>
          <rect
            x={labelX - 15}
            y={labelY - 8}
            width={30}
            height={16}
            rx={8}
            fill="white"
            stroke={critical ? '#EF4444' : '#3B82F6'}
            strokeWidth={1}
          />
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs font-medium"
            fill={critical ? '#EF4444' : '#3B82F6'}
          >
            {critical ? '!' : 'DEP'}
          </text>
        </g>
      )}

      {/* Animação de pulso para dependências críticas */}
      {critical && (
        <path
          d={edgePath}
          fill="none"
          stroke="#EF4444"
          strokeWidth={4}
          strokeOpacity={0.6}
          className="animate-pulse"
        />
      )}
    </>
  )
}

/**
 * Aresta simples para visualizações menores
 */
export const SimpleFlowEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 4
  })

  return (
    <path
      id={id}
      className="react-flow__edge-path"
      d={edgePath}
      style={{
        stroke: '#9CA3AF',
        strokeWidth: 1.5
      }}
      markerEnd={markerEnd}
    />
  )
}

/**
 * Aresta com indicador de bloqueio
 */
export const BlockingFlowEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data = {},
  markerEnd
}) => {
  const { isBlocking = false } = data

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8
  })

  const style = isBlocking
    ? {
        stroke: '#EF4444',
        strokeWidth: 2,
        strokeDasharray: '8,4'
      }
    : {
        stroke: '#10B981',
        strokeWidth: 2
      }

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={style}
        markerEnd={markerEnd}
      />
      
      {/* Ícone de bloqueio/desbloqueio */}
      <g transform={`translate(${(sourceX + targetX) / 2}, ${(sourceY + targetY) / 2})`}>
        <circle
          r={8}
          fill="white"
          stroke={isBlocking ? '#EF4444' : '#10B981'}
          strokeWidth={2}
        />
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs"
          fill={isBlocking ? '#EF4444' : '#10B981'}
        >
          {isBlocking ? '🔒' : '✓'}
        </text>
      </g>
    </>
  )
}

// Registrar tipos de arestas
export const edgeTypes = {
  dependency: FlowEdge,
  simple: SimpleFlowEdge,
  blocking: BlockingFlowEdge
}

export default FlowEdge