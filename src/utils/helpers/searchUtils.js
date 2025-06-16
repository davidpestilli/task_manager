/**
 * Utilitários para sistema de busca global
 */

/**
 * Categoriza resultados de busca por tipo
 * @param {Array} results - Array de resultados da busca
 * @returns {Object} Objeto com resultados categorizados
 */
export const categorizeResults = (results) => {
  if (!Array.isArray(results)) return {}

  const categorized = {
    projects: [],
    people: [],
    tasks: []
  }

  results.forEach(result => {
    switch (result.type) {
      case 'project':
        categorized.projects.push(result)
        break
      case 'person':
      case 'user':
        categorized.people.push(result)
        break
      case 'task':
        categorized.tasks.push(result)
        break
      default:
        console.warn('Tipo de resultado desconhecido:', result.type)
    }
  })

  // Ordenar por relevância dentro de cada categoria
  Object.keys(categorized).forEach(category => {
    categorized[category].sort((a, b) => {
      // Prioridade por score de relevância
      if (a.relevance_score !== b.relevance_score) {
        return b.relevance_score - a.relevance_score
      }
      
      // Se scores iguais, ordenar por data de atualização
      const dateA = new Date(a.updated_at || a.created_at)
      const dateB = new Date(b.updated_at || b.created_at)
      return dateB - dateA
    })
  })

  return categorized
}

/**
 * Calcula score de relevância para um resultado
 * @param {Object} item - Item a ser avaliado
 * @param {string} query - Query de busca
 * @returns {number} Score de relevância (0-100)
 */
export const calculateRelevanceScore = (item, query) => {
  if (!item || !query) return 0

  const queryLower = query.toLowerCase()
  const name = (item.name || '').toLowerCase()
  const description = (item.description || '').toLowerCase()
  
  let score = 0

  // Match exato no nome (peso alto)
  if (name === queryLower) {
    score += 100
  } else if (name.includes(queryLower)) {
    // Match parcial no nome
    const position = name.indexOf(queryLower)
    score += 50 - (position * 2) // Menos pontos se match está no final
  }

  // Match na descrição (peso menor)
  if (description.includes(queryLower)) {
    score += 20
  }

  // Match em palavras (peso médio)
  const nameWords = name.split(/\s+/)
  const descWords = description.split(/\s+/)
  const queryWords = queryLower.split(/\s+/)

  queryWords.forEach(queryWord => {
    nameWords.forEach(nameWord => {
      if (nameWord.includes(queryWord)) {
        score += 15
      }
    })
    
    descWords.forEach(descWord => {
      if (descWord.includes(queryWord)) {
        score += 5
      }
    })
  })

  // Boost para itens recentes
  if (item.updated_at) {
    const daysSinceUpdate = (Date.now() - new Date(item.updated_at)) / (1000 * 60 * 60 * 24)
    if (daysSinceUpdate <= 7) {
      score += 10 // Boost para itens atualizados na última semana
    }
  }

  return Math.min(score, 100) // Cap em 100
}

/**
 * Formata um resultado para exibição
 * @param {Object} result - Resultado da busca
 * @returns {Object} Resultado formatado
 */
export const formatSearchResult = (result) => {
  const baseFormat = {
    id: result.id,
    type: result.type,
    title: result.name || result.full_name || 'Sem título',
    subtitle: '',
    description: result.description || '',
    metadata: {},
    relevanceScore: result.relevance_score || 0
  }

  switch (result.type) {
    case 'project':
      return {
        ...baseFormat,
        subtitle: `${result.tasks_count || 0} tarefas, ${result.members_count || 0} membros`,
        metadata: {
          tasksCount: result.tasks_count || 0,
          membersCount: result.members_count || 0,
          createdAt: result.created_at,
          updatedAt: result.updated_at
        },
        icon: '📁',
        href: `/projects/${result.id}/people`
      }

    case 'person':
    case 'user':
      return {
        ...baseFormat,
        title: result.full_name || result.name,
        subtitle: `${result.projects_count || 0} projetos, ${result.active_tasks_count || 0} tarefas ativas`,
        metadata: {
          email: result.email,
          projectsCount: result.projects_count || 0,
          activeTasksCount: result.active_tasks_count || 0,
          lastActivity: result.last_activity
        },
        icon: '👤',
        href: `/people/${result.id}`
      }

    case 'task':
      return {
        ...baseFormat,
        subtitle: `${result.project_name} - ${result.completion_percentage || 0}% concluído`,
        metadata: {
          projectName: result.project_name,
          projectId: result.project_id,
          status: result.status,
          completionPercentage: result.completion_percentage || 0,
          assignedUsers: result.assigned_users || [],
          hasDependencies: result.has_dependencies || false,
          createdAt: result.created_at,
          updatedAt: result.updated_at
        },
        icon: getTaskIcon(result.status),
        href: `/projects/${result.project_id}/tasks/${result.id}`
      }

    default:
      return baseFormat
  }
}

/**
 * Retorna ícone baseado no status da tarefa
 * @param {string} status - Status da tarefa
 * @returns {string} Emoji do ícone
 */
const getTaskIcon = (status) => {
  const icons = {
    'não_iniciada': '⚪',
    'em_andamento': '🔵',
    'pausada': '🟡',
    'concluída': '🟢'
  }
  return icons[status] || '📋'
}

/**
 * Cria query SQL para busca (será usado no backend/Supabase)
 * @param {string} query - Termo de busca
 * @param {string} category - Categoria filtro
 * @returns {Object} Configuração da query
 */
export const buildSearchQuery = (query, category = 'all') => {
  const searchTerm = query.trim().toLowerCase()
  
  const baseConfig = {
    limit: 15,
    searchTerm,
    category
  }

  // Configurações específicas por categoria
  switch (category) {
    case 'projects':
      return {
        ...baseConfig,
        tables: ['projects'],
        fields: ['name', 'description'],
        joins: ['project_members']
      }

    case 'people':
      return {
        ...baseConfig,
        tables: ['profiles'],
        fields: ['full_name', 'email'],
        joins: ['project_members']
      }

    case 'tasks':
      return {
        ...baseConfig,
        tables: ['tasks'],
        fields: ['name', 'description'],
        joins: ['projects', 'task_assignments']
      }

    default: // 'all'
      return {
        ...baseConfig,
        tables: ['projects', 'profiles', 'tasks'],
        fields: ['name', 'full_name', 'description', 'email'],
        joins: ['project_members', 'task_assignments']
      }
  }
}

/**
 * Filtra resultados por categoria
 * @param {Array} results - Resultados da busca
 * @param {string} category - Categoria para filtrar
 * @returns {Array} Resultados filtrados
 */
export const filterByCategory = (results, category) => {
  if (!Array.isArray(results) || category === 'all') {
    return results
  }

  const categoryMap = {
    'projects': ['project'],
    'people': ['person', 'user'],
    'tasks': ['task']
  }

  const allowedTypes = categoryMap[category] || []
  return results.filter(result => allowedTypes.includes(result.type))
}

/**
 * Gera sugestões de busca baseadas no histórico
 * @param {Array} recentSearches - Buscas recentes
 * @param {string} currentQuery - Query atual
 * @returns {Array} Sugestões de busca
 */
export const generateSearchSuggestions = (recentSearches, currentQuery) => {
  if (!Array.isArray(recentSearches)) return []

  const query = currentQuery.toLowerCase().trim()
  
  if (!query) {
    // Se não há query, retornar buscas recentes
    return recentSearches.slice(0, 5).map(search => ({
      type: 'recent',
      query: search,
      display: search
    }))
  }

  // Filtrar buscas recentes que começam com a query atual
  const matchingRecent = recentSearches
    .filter(search => search.toLowerCase().includes(query))
    .slice(0, 3)
    .map(search => ({
      type: 'recent',
      query: search,
      display: search
    }))

  // Adicionar sugestões comuns
  const commonSuggestions = [
    'projeto',
    'tarefa',
    'usuario',
    'desenvolvimento',
    'design',
    'backend',
    'frontend'
  ]
    .filter(suggestion => 
      suggestion.includes(query) && 
      !matchingRecent.some(item => item.query === suggestion)
    )
    .slice(0, 2)
    .map(suggestion => ({
      type: 'suggestion',
      query: suggestion,
      display: suggestion
    }))

  return [...matchingRecent, ...commonSuggestions]
}

/**
 * Debounce function para evitar muitas chamadas de busca
 * @param {Function} func - Função a ser debounced
 * @param {number} delay - Delay em ms
 * @returns {Function} Função debounced
 */
export const debounceSearch = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// Objeto principal exportado
export const searchUtils = {
  categorizeResults,
  calculateRelevanceScore,
  formatSearchResult,
  buildSearchQuery,
  filterByCategory,
  generateSearchSuggestions,
  debounceSearch
}