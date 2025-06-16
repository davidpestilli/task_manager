import React from 'react'
import { Handle, Position } from 'reactflow'
import { Badge } from '@/components/shared/ui'

/**
 * Componente de nó personalizado para o fluxograma de dependências
 * 
 * Props:
 * - data: Dados da tarefa (nome, status, assignees, etc.)
 * - selected: Se o nó está selecionado
 */
const FlowNode = ({ data, selected }) => {
  const { id, name, status, assignees = [] } = data

  // Cores baseadas no status
  const getStatusColor = (status) => {
    const colors = {
      'não_iniciada': 'bg-gray-100 border-gray-300 text-gray-700',
      'em_andamento': 'bg-blue-100 border-blue-300 text-blue-700',
      'pausada': 'bg-amber-100 border-amber-300 text-amber-700',
      'concluída': 'bg-emerald-100 border-emerald-300 text-emerald-700'
    }
    return colors[status] || colors['não_iniciada']
  }

  // Badge do status
  const getStatusBadge = (status) => {
    const variants = {
      'não_iniciada': 'gray',
      'em_andamento': 'blue',
      'pausada': 'amber',
      'concluída': 'emerald'
    }
    
    const labels = {
      'não_iniciada': 'Não iniciada',
      'em_andamento': 'Em andamento',
      'pausada': 'Pausada',
      'concluída': 'Concluída'
    }

    return (
      <Badge variant={variants[status]} size="sm">
        {labels[status]}
      </Badge>
    )
  }

  // Classe CSS do container
  const containerClass = `
    relative p-4 rounded-lg border-2 transition-all duration-200 min-w-[200px] max-w-[250px]
    ${getStatusColor(status)}
    ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
    hover:shadow-md cursor-pointer
  `.trim()

  return (
    <div className={containerClass}>
      {/* Handle de entrada (dependências) */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
        style={{ left: -8 }}
      />

      {/* Conteúdo do nó */}
      <div className="space-y-2">
        {/* Nome da tarefa */}
        <div className="font-medium text-sm leading-tight">
          {name}
        </div>

        {/* Status badge */}
        <div className="flex justify-between items-center">
          {getStatusBadge(status)}
          
          {/* Contador de pessoas atribuídas */}
          {assignees.length > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">
                {assignees.length} pessoa{assignees.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Avatares das pessoas (máximo 3) */}
        {assignees.length > 0 && (
          <div className="flex -space-x-1">
            {assignees.slice(0, 3).map((assignee, index) => (
              <div
                key={index}
                className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                title={assignee.full_name}
              >
                {assignee.avatar_url ? (
                  <img
                    src={assignee.avatar_url}
                    alt={assignee.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  assignee.full_name?.charAt(0).toUpperCase()
                )}
              </div>
            ))}
            
            {/* Indicador de mais pessoas */}
            {assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500">
                +{assignees.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Handle de saída (dependentes) */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
        style={{ right: -8 }}
      />

      {/* Indicador de seleção */}
      {selected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
      )}
    </div>
  )
}

/**
 * Componente de nó simples para visualizações menores
 */
export const SimpleFlowNode = ({ data, selected }) => {
  const { name, status } = data

  const getStatusColor = (status) => {
    const colors = {
      'não_iniciada': 'bg-gray-400',
      'em_andamento': 'bg-blue-500',
      'pausada': 'bg-amber-500',
      'concluída': 'bg-emerald-500'
    }
    return colors[status] || colors['não_iniciada']
  }

  return (
    <div className={`
      relative p-2 rounded border-2 transition-all duration-200 min-w-[120px]
      ${getStatusColor(status)} text-white text-xs font-medium
      ${selected ? 'ring-2 ring-blue-300 ring-offset-2' : ''}
    `}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-white opacity-70"
        style={{ left: -6 }}
      />
      
      <div className="truncate">{name}</div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-white opacity-70"
        style={{ right: -6 }}
      />
    </div>
  )
}

/**
 * Componente de nó para modo de overview
 */
export const OverviewFlowNode = ({ data }) => {
  const { status } = data

  const getStatusColor = (status) => {
    const colors = {
      'não_iniciada': 'bg-gray-400',
      'em_andamento': 'bg-blue-500',
      'pausada': 'bg-amber-500',
      'concluída': 'bg-emerald-500'
    }
    return colors[status] || colors['não_iniciada']
  }

  return (
    <div className={`
      w-4 h-4 rounded-full ${getStatusColor(status)} 
      border border-white shadow-sm
    `}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-1 h-1 opacity-0"
        style={{ left: -2 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-1 h-1 opacity-0"
        style={{ right: -2 }}
      />
    </div>
  )
}

// Registrar tipos de nós
export const nodeTypes = {
  taskNode: FlowNode,
  simpleNode: SimpleFlowNode,
  overviewNode: OverviewFlowNode
}

export default FlowNode