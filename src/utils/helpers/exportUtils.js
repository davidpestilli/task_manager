import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Utilitários para operações de exportação
 * Funções auxiliares para formatar, validar e processar dados
 */

/**
 * Formata dados para exportação baseado no tipo
 * @param {any} data - Dados brutos
 * @param {string} type - Tipo de exportação ('project', 'tasks', 'members')
 * @returns {Object} Dados formatados para exportação
 */
export const formatDataForExport = (data, type) => {
  if (!data) {
    return { formatted: [], meta: { total: 0, type } }
  }

  switch (type) {
    case 'project':
      return formatProjectData(data)
    
    case 'tasks':
      return formatTasksData(data)
    
    case 'members':
      return formatMembersData(data)
    
    default:
      return { formatted: Array.isArray(data) ? data : [data], meta: { total: 1, type } }
  }
}

/**
 * Formata dados de projeto para exportação
 * @param {Object} projectData - Dados do projeto
 * @returns {Object} Dados formatados
 */
const formatProjectData = (projectData) => {
  const { projectData: project, tasks = [], members = [] } = projectData

  return {
    formatted: {
      project: {
        id: project?.id || '',
        nome: project?.name || '',
        descricao: project?.description || '',
        proprietario: project?.owner?.full_name || '',
        criado_em: formatDate(project?.created_at),
        atualizado_em: formatDate(project?.updated_at),
        total_membros: members.length,
        total_tarefas: tasks.length,
        tarefas_concluidas: tasks.filter(t => t.status === 'concluída').length,
        taxa_conclusao: tasks.length > 0 
          ? Math.round((tasks.filter(t => t.status === 'concluída').length / tasks.length) * 100)
          : 0
      },
      tasks: formatTasksData(tasks).formatted,
      members: formatMembersData(members).formatted
    },
    meta: {
      total: 1 + tasks.length + members.length,
      type: 'project',
      projectName: project?.name || 'Projeto',
      breakdown: {
        project: 1,
        tasks: tasks.length,
        members: members.length
      }
    }
  }
}

/**
 * Formata dados de tarefas para exportação
 * @param {Array} tasks - Lista de tarefas
 * @returns {Object} Dados formatados
 */
const formatTasksData = (tasks) => {
  if (!Array.isArray(tasks)) {
    return { formatted: [], meta: { total: 0, type: 'tasks' } }
  }

  const formatted = tasks.map(task => {
    const etapasTotal = task.steps?.length || 0
    const etapasConcluidas = task.steps?.filter(s => s.is_completed).length || 0
    const progresso = etapasTotal > 0 ? Math.round((etapasConcluidas / etapasTotal) * 100) : 0
    
    const responsaveis = task.assignments?.map(a => a.user?.full_name || 'N/A').join('; ') || ''
    const dependencias = task.dependencies?.map(d => d.depends_on_task?.name || 'N/A').join('; ') || ''

    return {
      id: task.id || '',
      nome: task.name || '',
      descricao: task.description || '',
      status: formatStatus(task.status),
      progresso_percentual: progresso,
      etapas_totais: etapasTotal,
      etapas_concluidas: etapasConcluidas,
      responsaveis,
      dependencias,
      tem_dependencias: (task.dependencies?.length || 0) > 0 ? 'Sim' : 'Não',
      total_comentarios: task.comments?.length || 0,
      criado_por: task.created_by?.full_name || '',
      criado_em: formatDate(task.created_at),
      atualizado_em: formatDate(task.updated_at),
      projeto: task.project?.name || ''
    }
  })

  return {
    formatted,
    meta: {
      total: tasks.length,
      type: 'tasks',
      stats: calculateTaskStats(tasks)
    }
  }
}

/**
 * Formata dados de membros para exportação
 * @param {Array} members - Lista de membros
 * @returns {Object} Dados formatados
 */
const formatMembersData = (members) => {
  if (!Array.isArray(members)) {
    return { formatted: [], meta: { total: 0, type: 'members' } }
  }

  const formatted = members.map(member => ({
    id: member.user_id || member.id || '',
    nome_completo: member.full_name || '',
    email: member.email || '',
    funcao: formatRole(member.role),
    data_entrada: formatDate(member.joined_at),
    ativo: member.active !== false ? 'Sim' : 'Não',
    projeto: member.project?.name || ''
  }))

  return {
    formatted,
    meta: {
      total: members.length,
      type: 'members',
      roles: {
        owners: members.filter(m => m.role === 'owner').length,
        admins: members.filter(m => m.role === 'admin').length,
        members: members.filter(m => m.role === 'member' || !m.role).length
      }
    }
  }
}

/**
 * Calcula estatísticas de tarefas
 * @param {Array} tasks - Lista de tarefas
 * @returns {Object} Estatísticas calculadas
 */
const calculateTaskStats = (tasks) => {
  const total = tasks.length
  const byStatus = {
    nao_iniciada: tasks.filter(t => t.status === 'não_iniciada').length,
    em_andamento: tasks.filter(t => t.status === 'em_andamento').length,
    pausada: tasks.filter(t => t.status === 'pausada').length,
    concluida: tasks.filter(t => t.status === 'concluída').length
  }

  const withDependencies = tasks.filter(t => t.dependencies?.length > 0).length
  const withComments = tasks.filter(t => t.comments?.length > 0).length
  
  // Calcular progresso médio
  const totalProgress = tasks.reduce((sum, task) => {
    const etapasTotal = task.steps?.length || 0
    const etapasConcluidas = task.steps?.filter(s => s.is_completed).length || 0
    return sum + (etapasTotal > 0 ? (etapasConcluidas / etapasTotal) * 100 : 0)
  }, 0)
  
  const averageProgress = total > 0 ? Math.round(totalProgress / total) : 0

  return {
    total,
    byStatus,
    completionRate: total > 0 ? Math.round((byStatus.concluida / total) * 100) : 0,
    averageProgress,
    withDependencies,
    withComments
  }
}

/**
 * Formata data para string legível
 * @param {string|Date} dateValue - Valor da data
 * @param {string} formatString - Formato desejado
 * @returns {string} Data formatada
 */
export const formatDate = (dateValue, formatString = 'dd/MM/yyyy HH:mm') => {
  if (!dateValue) return ''
  
  try {
    const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue
    return format(date, formatString, { locale: ptBR })
  } catch (error) {
    console.warn('Erro ao formatar data:', error)
    return String(dateValue)
  }
}

/**
 * Converte status para formato legível
 * @param {string} status - Status da tarefa
 * @returns {string} Status formatado
 */
export const formatStatus = (status) => {
  const statusMap = {
    'não_iniciada': 'Não Iniciada',
    'em_andamento': 'Em Andamento',
    'pausada': 'Pausada',
    'concluída': 'Concluída'
  }
  return statusMap[status] || status || 'Indefinido'
}

/**
 * Converte role para formato legível
 * @param {string} role - Role do usuário
 * @returns {string} Role formatado
 */
export const formatRole = (role) => {
  const roleMap = {
    'owner': 'Proprietário',
    'admin': 'Administrador',
    'member': 'Membro'
  }
  return roleMap[role] || 'Membro'
}

/**
 * Sanitiza string para nome de arquivo
 * @param {string} filename - Nome original
 * @returns {string} Nome sanitizado
 */
export const sanitizeFilename = (filename) => {
  if (!filename) return 'export'
  
  return filename
    .replace(/[^a-zA-Z0-9_\-\s]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '_') // Substitui espaços por underscore
    .toLowerCase()
    .substring(0, 50) // Limita tamanho
}

/**
 * Gera nome de arquivo com timestamp
 * @param {string} baseName - Nome base
 * @param {string} extension - Extensão do arquivo
 * @param {boolean} includeTimestamp - Se deve incluir timestamp
 * @returns {string} Nome do arquivo final
 */
export const generateFilename = (baseName, extension, includeTimestamp = true) => {
  const sanitizedBase = sanitizeFilename(baseName)
  const timestamp = includeTimestamp 
    ? `_${format(new Date(), 'yyyyMMdd_HHmmss')}`
    : ''
  
  return `${sanitizedBase}${timestamp}.${extension}`
}

/**
 * Valida dados antes da exportação
 * @param {any} data - Dados para validar
 * @param {string} type - Tipo de exportação
 * @returns {Object} Resultado da validação
 */
export const validateExportData = (data, type) => {
  const errors = []
  
  if (!data) {
    errors.push('Dados não fornecidos')
    return { valid: false, errors }
  }

  switch (type) {
    case 'project':
      if (!data.projectData || !data.projectData.name) {
        errors.push('Informações do projeto são obrigatórias')
      }
      break
    
    case 'tasks':
      if (!Array.isArray(data) || data.length === 0) {
        errors.push('Lista de tarefas vazia ou inválida')
      }
      break
    
    case 'members':
      if (!Array.isArray(data) || data.length === 0) {
        errors.push('Lista de membros vazia ou inválida')
      }
      break
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Estima tamanho do arquivo baseado nos dados
 * @param {any} data - Dados para exportar
 * @param {string} format - Formato de exportação
 * @returns {Object} Estimativa de tamanho
 */
export const estimateFileSize = (data, format) => {
  if (!data) {
    return { bytes: 0, human: '0 bytes' }
  }

  let estimatedBytes = 0
  const jsonString = JSON.stringify(data)
  
  if (format === 'csv') {
    // CSV é geralmente menor que JSON
    estimatedBytes = Math.ceil(jsonString.length * 0.7)
  } else if (format === 'pdf') {
    // PDF tem overhead significativo
    estimatedBytes = Math.ceil(jsonString.length * 2) + 50000 // +50KB base
  } else {
    estimatedBytes = jsonString.length
  }

  return {
    bytes: estimatedBytes,
    human: formatFileSize(estimatedBytes)
  }
}

/**
 * Formata tamanho de arquivo para leitura humana
 * @param {number} bytes - Tamanho em bytes
 * @returns {string} Tamanho formatado
 */
export const formatFileSize = (bytes) => {
  const units = ['bytes', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${Math.round(size * 10) / 10} ${units[unitIndex]}`
}

/**
 * Agrupa dados para exportação
 * @param {Array} data - Dados para agrupar
 * @param {string} groupBy - Campo para agrupar
 * @returns {Object} Dados agrupados
 */
export const groupDataForExport = (data, groupBy) => {
  if (!Array.isArray(data) || !groupBy || groupBy === 'none') {
    return { ungrouped: data }
  }

  return data.reduce((groups, item) => {
    let groupKey = item[groupBy]
    
    // Tratar casos especiais
    if (groupBy === 'status') {
      groupKey = formatStatus(groupKey)
    } else if (groupBy === 'assignee' || groupBy === 'responsaveis') {
      groupKey = item.responsaveis || 'Não atribuído'
    } else if (groupBy === 'created_date') {
      groupKey = item.criado_em ? formatDate(item.criado_em, 'dd/MM/yyyy') : 'Data desconhecida'
    }
    
    groupKey = groupKey || 'Indefinido'

    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    
    groups[groupKey].push(item)
    return groups
  }, {})
}

/**
 * Ordena dados para exportação
 * @param {Array} data - Dados para ordenar
 * @param {string} sortBy - Campo para ordenar
 * @param {string} sortOrder - Ordem (asc/desc)
 * @returns {Array} Dados ordenados
 */
export const sortDataForExport = (data, sortBy, sortOrder = 'asc') => {
  if (!Array.isArray(data) || !sortBy) {
    return data
  }

  return [...data].sort((a, b) => {
    let valueA = a[sortBy]
    let valueB = b[sortBy]

    // Tratar diferentes tipos de dados
    if (sortBy.includes('date') || sortBy.includes('em')) {
      valueA = valueA ? new Date(valueA) : new Date(0)
      valueB = valueB ? new Date(valueB) : new Date(0)
    } else if (typeof valueA === 'string') {
      valueA = valueA.toLowerCase()
      valueB = (valueB || '').toLowerCase()
    } else if (typeof valueA === 'number') {
      valueA = valueA || 0
      valueB = valueB || 0
    }

    let comparison = 0
    if (valueA > valueB) comparison = 1
    if (valueA < valueB) comparison = -1

    return sortOrder === 'desc' ? -comparison : comparison
  })
}

/**
 * Processa dados completos para exportação
 * @param {any} data - Dados brutos
 * @param {string} type - Tipo de exportação
 * @param {Object} options - Opções de processamento
 * @returns {Object} Dados processados
 */
export const processDataForExport = (data, type, options = {}) => {
  const {
    groupBy = 'none',
    sortBy = 'created_at',
    sortOrder = 'desc',
    includeMetadata = true
  } = options

  // Formatar dados
  const formatted = formatDataForExport(data, type)
  
  // Se for dados agrupados por projeto
  if (type === 'project') {
    return formatted
  }

  // Processar dados de lista (tasks, members)
  let processedData = formatted.formatted

  // Aplicar ordenação
  if (sortBy) {
    processedData = sortDataForExport(processedData, sortBy, sortOrder)
  }

  // Aplicar agrupamento
  const grouped = groupDataForExport(processedData, groupBy)

  return {
    ...formatted,
    formatted: processedData,
    grouped,
    meta: {
      ...formatted.meta,
      processing: {
        groupBy,
        sortBy,
        sortOrder,
        groupCount: Object.keys(grouped).length
      }
    }
  }
}