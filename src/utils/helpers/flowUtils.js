/**
 * Utilitários para manipulação de fluxogramas e layouts
 * 
 * Funcionalidades:
 * - Algoritmos de layout automático
 * - Posicionamento de nós
 * - Cálculo de coordenadas
 * - Detecção de colisões
 */

/**
 * Cores para diferentes status de tarefas
 */
export const TASK_STATUS_COLORS = {
  'não_iniciada': '#6B7280', // gray-500
  'em_andamento': '#3B82F6', // blue-500
  'pausada': '#F59E0B',      // amber-500
  'concluída': '#10B981'     // emerald-500
}

/**
 * Configurações padrão para o layout
 */
export const LAYOUT_CONFIG = {
  nodeWidth: 200,
  nodeHeight: 80,
  horizontalSpacing: 250,
  verticalSpacing: 120,
  marginTop: 50,
  marginLeft: 50
}

/**
 * Aplica layout automático hierárquico aos nós
 * @param {Array} nodes - Lista de nós
 * @param {Array} edges - Lista de arestas
 * @returns {Array} Nós com posições calculadas
 */
export const applyHierarchicalLayout = (nodes, edges) => {
  if (!nodes || nodes.length === 0) return []

  // Construir grafo de dependências
  const graph = buildDependencyGraph(nodes, edges)
  
  // Calcular níveis hierárquicos
  const levels = calculateHierarchicalLevels(graph)
  
  // Posicionar nós por nível
  const positionedNodes = positionNodesByLevel(nodes, levels)
  
  return positionedNodes
}

/**
 * Constrói grafo de dependências
 * @param {Array} nodes - Lista de nós
 * @param {Array} edges - Lista de arestas
 * @returns {Object} Grafo com adjacências
 */
const buildDependencyGraph = (nodes, edges) => {
  const graph = {
    nodes: new Map(),
    incoming: new Map(),
    outgoing: new Map()
  }

  // Inicializar nós
  nodes.forEach(node => {
    graph.nodes.set(node.id, node)
    graph.incoming.set(node.id, new Set())
    graph.outgoing.set(node.id, new Set())
  })

  // Construir adjacências
  edges.forEach(edge => {
    // source depende de target (target → source)
    graph.outgoing.get(edge.target)?.add(edge.source)
    graph.incoming.get(edge.source)?.add(edge.target)
  })

  return graph
}

/**
 * Calcula níveis hierárquicos usando algoritmo topológico
 * @param {Object} graph - Grafo de dependências
 * @returns {Map} Mapa de node_id → nível
 */
const calculateHierarchicalLevels = (graph) => {
  const levels = new Map()
  const queue = []
  const inDegree = new Map()

  // Calcular grau de entrada
  graph.nodes.forEach((node, id) => {
    const degree = graph.incoming.get(id).size
    inDegree.set(id, degree)
    
    // Nós sem dependências começam no nível 0
    if (degree === 0) {
      levels.set(id, 0)
      queue.push(id)
    }
  })

  // Algoritmo de ordenação topológica modificado
  while (queue.length > 0) {
    const currentId = queue.shift()
    const currentLevel = levels.get(currentId)

    // Processar nós dependentes
    graph.outgoing.get(currentId).forEach(dependentId => {
      const newDegree = inDegree.get(dependentId) - 1
      inDegree.set(dependentId, newDegree)

      if (newDegree === 0) {
        // Nível é o máximo dos predecessores + 1
        const newLevel = currentLevel + 1
        levels.set(dependentId, newLevel)
        queue.push(dependentId)
      }
    })
  }

  // Nós em ciclos ou não alcançáveis ficam no nível máximo + 1
  const maxLevel = Math.max(...Array.from(levels.values()), -1)
  graph.nodes.forEach((node, id) => {
    if (!levels.has(id)) {
      levels.set(id, maxLevel + 1)
    }
  })

  return levels
}

/**
 * Posiciona nós baseado nos níveis hierárquicos
 * @param {Array} nodes - Lista de nós
 * @param {Map} levels - Mapa de níveis
 * @returns {Array} Nós com posições
 */
const positionNodesByLevel = (nodes, levels) => {
  // Agrupar nós por nível
  const nodesByLevel = new Map()
  
  nodes.forEach(node => {
    const level = levels.get(node.id) || 0
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, [])
    }
    nodesByLevel.get(level).push(node)
  })

  // Posicionar nós
  const positionedNodes = []
  
  nodesByLevel.forEach((levelNodes, level) => {
    const y = LAYOUT_CONFIG.marginTop + (level * LAYOUT_CONFIG.verticalSpacing)
    
    // Centralizar nós horizontalmente no nível
    const totalWidth = levelNodes.length * LAYOUT_CONFIG.nodeWidth + 
                      (levelNodes.length - 1) * LAYOUT_CONFIG.horizontalSpacing
    const startX = Math.max(LAYOUT_CONFIG.marginLeft, 
                           (window.innerWidth - totalWidth) / 2)

    levelNodes.forEach((node, index) => {
      const x = startX + (index * (LAYOUT_CONFIG.nodeWidth + LAYOUT_CONFIG.horizontalSpacing))
      
      positionedNodes.push({
        ...node,
        position: { x, y }
      })
    })
  })

  return positionedNodes
}

/**
 * Calcula posições para layout em grid
 * @param {Array} nodes - Lista de nós
 * @param {number} columns - Número de colunas
 * @returns {Array} Nós com posições em grid
 */
export const applyGridLayout = (nodes, columns = 3) => {
  return nodes.map((node, index) => {
    const row = Math.floor(index / columns)
    const col = index % columns
    
    const x = LAYOUT_CONFIG.marginLeft + (col * LAYOUT_CONFIG.horizontalSpacing)
    const y = LAYOUT_CONFIG.marginTop + (row * LAYOUT_CONFIG.verticalSpacing)
    
    return {
      ...node,
      position: { x, y }
    }
  })
}

/**
 * Otimiza posições para evitar sobreposições
 * @param {Array} nodes - Lista de nós posicionados
 * @returns {Array} Nós com posições otimizadas
 */
export const optimizeNodePositions = (nodes) => {
  const optimized = [...nodes]
  const iterations = 10
  const repulsionForce = 50
  
  for (let i = 0; i < iterations; i++) {
    optimized.forEach((node, index) => {
      let deltaX = 0
      let deltaY = 0
      
      // Calcular força de repulsão com outros nós
      optimized.forEach((otherNode, otherIndex) => {
        if (index === otherIndex) return
        
        const dx = node.position.x - otherNode.position.x
        const dy = node.position.y - otherNode.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < LAYOUT_CONFIG.horizontalSpacing) {
          const force = repulsionForce / (distance || 1)
          deltaX += (dx / distance) * force
          deltaY += (dy / distance) * force
        }
      })
      
      // Aplicar força com dampening
      node.position.x += deltaX * 0.1
      node.position.y += deltaY * 0.1
      
      // Manter dentro dos limites
      node.position.x = Math.max(LAYOUT_CONFIG.marginLeft, node.position.x)
      node.position.y = Math.max(LAYOUT_CONFIG.marginTop, node.position.y)
    })
  }
  
  return optimized
}

/**
 * Calcula estatísticas do fluxo de dependências
 * @param {Array} nodes - Lista de nós
 * @param {Array} edges - Lista de arestas
 * @returns {Object} Estatísticas do fluxo
 */
export const calculateFlowStatistics = (nodes, edges) => {
  const stats = {
    totalTasks: nodes.length,
    totalDependencies: edges.length,
    tasksWithDependencies: 0,
    tasksWithDependents: 0,
    averageDependenciesPerTask: 0,
    criticalPath: [],
    independentTasks: 0
  }

  if (nodes.length === 0) return stats

  // Mapear dependências
  const taskDependencies = new Map()
  const taskDependents = new Map()

  nodes.forEach(node => {
    taskDependencies.set(node.id, new Set())
    taskDependents.set(node.id, new Set())
  })

  edges.forEach(edge => {
    taskDependencies.get(edge.source)?.add(edge.target)
    taskDependents.get(edge.target)?.add(edge.source)
  })

  // Calcular estatísticas
  let totalDeps = 0
  nodes.forEach(node => {
    const deps = taskDependencies.get(node.id).size
    const dependents = taskDependents.get(node.id).size

    if (deps > 0) stats.tasksWithDependencies++
    if (dependents > 0) stats.tasksWithDependents++
    if (deps === 0 && dependents === 0) stats.independentTasks++

    totalDeps += deps
  })

  stats.averageDependenciesPerTask = totalDeps / nodes.length

  return stats
}

/**
 * Encontra caminho crítico no fluxo de dependências
 * @param {Array} nodes - Lista de nós
 * @param {Array} edges - Lista de arestas
 * @returns {Array} Caminho crítico
 */
export const findCriticalPath = (nodes, edges) => {
  const graph = buildDependencyGraph(nodes, edges)
  const visited = new Set()
  let longestPath = []

  // DFS para encontrar o caminho mais longo
  const dfs = (nodeId, currentPath) => {
    if (visited.has(nodeId)) return currentPath

    visited.add(nodeId)
    const newPath = [...currentPath, nodeId]

    // Se não tem dependentes, é um nó final
    const dependents = graph.outgoing.get(nodeId)
    if (dependents.size === 0) {
      if (newPath.length > longestPath.length) {
        longestPath = [...newPath]
      }
      return newPath
    }

    // Explorar dependentes
    dependents.forEach(dependentId => {
      dfs(dependentId, newPath)
    })

    visited.delete(nodeId)
    return newPath
  }

  // Iniciar DFS a partir de nós sem dependências
  graph.nodes.forEach((node, id) => {
    if (graph.incoming.get(id).size === 0) {
      dfs(id, [])
    }
  })

  return longestPath
}

/**
 * Formata dados para biblioteca de fluxograma (React Flow)
 * @param {Array} nodes - Nós do grafo
 * @param {Array} edges - Arestas do grafo
 * @returns {Object} Dados formatados para React Flow
 */
export const formatForReactFlow = (nodes, edges) => {
  const formattedNodes = nodes.map(node => ({
    id: node.id,
    type: 'taskNode',
    position: node.position || { x: 0, y: 0 },
    data: {
      ...node.data,
      color: TASK_STATUS_COLORS[node.data.status] || TASK_STATUS_COLORS['não_iniciada']
    },
    style: {
      width: LAYOUT_CONFIG.nodeWidth,
      height: LAYOUT_CONFIG.nodeHeight
    }
  }))

  const formattedEdges = edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'smoothstep',
    animated: false,
    style: {
      stroke: '#6B7280',
      strokeWidth: 2
    },
    markerEnd: {
      type: 'arrowclosed',
      color: '#6B7280'
    }
  }))

  return {
    nodes: formattedNodes,
    edges: formattedEdges
  }
}