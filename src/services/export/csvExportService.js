import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Serviço para geração de arquivos CSV
 * Converte dados estruturados em formato CSV para análise em planilhas
 */
class CSVExportService {
  constructor() {
    this.defaultOptions = {
      delimiter: ',',
      encoding: 'utf-8',
      includeHeaders: true,
      dateFormat: 'dd/MM/yyyy HH:mm'
    }
  }

  /**
   * Converte array de objetos em string CSV
   * @param {Array} data - Dados para exportar
   * @param {Array} headers - Cabeçalhos das colunas
   * @param {Object} options - Opções de formatação
   * @returns {string} String CSV formatada
   */
  arrayToCSV(data, headers, options = {}) {
    const config = { ...this.defaultOptions, ...options }
    const { delimiter, includeHeaders } = config
    
    if (!data || data.length === 0) {
      return includeHeaders ? headers.join(delimiter) : ''
    }
    
    let csvContent = ''
    
    // Adicionar cabeçalhos se solicitado
    if (includeHeaders && headers && headers.length > 0) {
      csvContent += headers.join(delimiter) + '\n'
    }
    
    // Processar cada linha de dados
    data.forEach(row => {
      const values = headers.map(header => {
        const value = this.getNestedValue(row, header)
        return this.formatCellValue(value, config)
      })
      csvContent += values.join(delimiter) + '\n'
    })
    
    return csvContent
  }

  /**
   * Obtém valor aninhado de um objeto usando dot notation
   * @param {Object} obj - Objeto fonte
   * @param {string} path - Caminho do valor (ex: 'user.name')
   * @returns {any} Valor encontrado ou string vazia
   */
  getNestedValue(obj, path) {
    if (!obj || !path) return ''
    
    const keys = path.split('.')
    let value = obj
    
    for (const key of keys) {
      value = value?.[key]
      if (value === undefined || value === null) return ''
    }
    
    return value
  }

  /**
   * Formata valor para célula CSV
   * @param {any} value - Valor a ser formatado
   * @param {Object} config - Configurações de formatação
   * @returns {string} Valor formatado para CSV
   */
  formatCellValue(value, config) {
    if (value === null || value === undefined) {
      return ''
    }
    
    // Formatar datas
    if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))) {
      try {
        const date = value instanceof Date ? value : new Date(value)
        return format(date, config.dateFormat, { locale: ptBR })
      } catch (error) {
        console.warn('Erro ao formatar data:', error)
        return String(value)
      }
    }
    
    // Formatar arrays
    if (Array.isArray(value)) {
      return value.join('; ')
    }
    
    // Converter para string e escapar
    let stringValue = String(value)
    
    // Escapar aspas duplas
    stringValue = stringValue.replace(/"/g, '""')
    
    // Envolver em aspas se contém delimitador, quebra de linha ou aspas
    if (stringValue.includes(config.delimiter) || 
        stringValue.includes('\n') || 
        stringValue.includes('\r') || 
        stringValue.includes('"')) {
      stringValue = `"${stringValue}"`
    }
    
    return stringValue
  }

  /**
   * Gera CSV de dados de projeto
   * @param {Object} projectData - Dados do projeto
   * @param {Array} tasks - Lista de tarefas
   * @param {Array} members - Lista de membros
   * @returns {Object} Dados CSV estruturados
   */
  generateProjectCSV(projectData, tasks = [], members = []) {
    const csvData = {
      project: this.generateProjectInfoCSV(projectData),
      tasks: this.generateTasksCSV(tasks, projectData.name),
      members: this.generateMembersCSV(members, projectData.name)
    }
    
    return csvData
  }

  /**
   * Gera CSV com informações básicas do projeto
   * @param {Object} projectData - Dados do projeto
   * @returns {string} CSV das informações do projeto
   */
  generateProjectInfoCSV(projectData) {
    const headers = ['Campo', 'Valor']
    const data = [
      { Campo: 'Nome do Projeto', Valor: projectData.name || '' },
      { Campo: 'Descrição', Valor: projectData.description || '' },
      { Campo: 'Criado por', Valor: projectData.owner?.full_name || '' },
      { Campo: 'Data de Criação', Valor: projectData.created_at || '' },
      { Campo: 'Última Atualização', Valor: projectData.updated_at || '' }
    ]
    
    return this.arrayToCSV(data, headers)
  }

  /**
   * Gera CSV de tarefas
   * @param {Array} tasks - Lista de tarefas
   * @param {string} projectName - Nome do projeto (opcional)
   * @returns {string} CSV das tarefas
   */
  generateTasksCSV(tasks, projectName = '') {
    const headers = [
      'id',
      'nome',
      'descricao',
      'status',
      'progresso_percentual',
      'etapas_totais',
      'etapas_concluidas',
      'responsaveis',
      'dependencias',
      'criado_por',
      'criado_em',
      'atualizado_em',
      'projeto'
    ]
    
    const data = tasks.map(task => {
      const responsaveis = task.assignments?.map(a => a.user?.full_name || 'N/A').join('; ') || ''
      const dependencias = task.dependencies?.map(d => d.depends_on_task?.name || 'N/A').join('; ') || ''
      const etapasTotal = task.steps?.length || 0
      const etapasConcluidas = task.steps?.filter(s => s.is_completed).length || 0
      const progresso = etapasTotal > 0 ? Math.round((etapasConcluidas / etapasTotal) * 100) : 0
      
      return {
        id: task.id,
        nome: task.name || '',
        descricao: task.description || '',
        status: this.getStatusLabel(task.status),
        progresso_percentual: progresso,
        etapas_totais: etapasTotal,
        etapas_concluidas: etapasConcluidas,
        responsaveis,
        dependencias,
        criado_por: task.created_by?.full_name || '',
        criado_em: task.created_at || '',
        atualizado_em: task.updated_at || '',
        projeto: projectName
      }
    })
    
    return this.arrayToCSV(data, headers)
  }

  /**
   * Gera CSV de membros do projeto
   * @param {Array} members - Lista de membros
   * @param {string} projectName - Nome do projeto (opcional)
   * @returns {string} CSV dos membros
   */
  generateMembersCSV(members, projectName = '') {
    const headers = [
      'id',
      'nome_completo',
      'email',
      'funcao',
      'data_entrada',
      'projeto'
    ]
    
    const data = members.map(member => ({
      id: member.user_id || member.id,
      nome_completo: member.full_name || '',
      email: member.email || '',
      funcao: member.role || 'member',
      data_entrada: member.joined_at || '',
      projeto: projectName
    }))
    
    return this.arrayToCSV(data, headers)
  }

  /**
   * Gera CSV detalhado de etapas das tarefas
   * @param {Array} tasks - Lista de tarefas com etapas
   * @param {string} projectName - Nome do projeto (opcional)
   * @returns {string} CSV das etapas
   */
  generateTaskStepsCSV(tasks, projectName = '') {
    const headers = [
      'tarefa_id',
      'tarefa_nome',
      'etapa_id',
      'etapa_nome',
      'etapa_descricao',
      'ordem',
      'concluida',
      'concluida_por',
      'concluida_em',
      'criada_em',
      'projeto'
    ]
    
    const data = []
    
    tasks.forEach(task => {
      if (task.steps && task.steps.length > 0) {
        task.steps.forEach(step => {
          data.push({
            tarefa_id: task.id,
            tarefa_nome: task.name || '',
            etapa_id: step.id,
            etapa_nome: step.name || '',
            etapa_descricao: step.description || '',
            ordem: step.step_order || 0,
            concluida: step.is_completed ? 'Sim' : 'Não',
            concluida_por: step.completed_by?.full_name || '',
            concluida_em: step.completed_at || '',
            criada_em: step.created_at || '',
            projeto: projectName
          })
        })
      }
    })
    
    return this.arrayToCSV(data, headers)
  }

  /**
   * Gera CSV de comentários das tarefas
   * @param {Array} tasks - Lista de tarefas com comentários
   * @param {string} projectName - Nome do projeto (opcional)
   * @returns {string} CSV dos comentários
   */
  generateCommentsCSV(tasks, projectName = '') {
    const headers = [
      'comentario_id',
      'tarefa_id',
      'tarefa_nome',
      'comentario_pai_id',
      'autor',
      'conteudo',
      'criado_em',
      'projeto'
    ]
    
    const data = []
    
    tasks.forEach(task => {
      if (task.comments && task.comments.length > 0) {
        task.comments.forEach(comment => {
          data.push({
            comentario_id: comment.id,
            tarefa_id: task.id,
            tarefa_nome: task.name || '',
            comentario_pai_id: comment.parent_comment_id || '',
            autor: comment.user?.full_name || '',
            conteudo: comment.content || '',
            criado_em: comment.created_at || '',
            projeto: projectName
          })
        })
      }
    })
    
    return this.arrayToCSV(data, headers)
  }

  /**
   * Gera relatório CSV com múltiplas abas (como sheets)
   * @param {Object} projectData - Dados do projeto
   * @param {Array} tasks - Lista de tarefas
   * @param {Array} members - Lista de membros
   * @param {Object} options - Opções de exportação
   * @returns {Object} Múltiplos CSVs organizados por categoria
   */
  generateMultiSheetCSV(projectData, tasks = [], members = [], options = {}) {
    const result = {
      project_info: this.generateProjectInfoCSV(projectData),
      tasks: this.generateTasksCSV(tasks, projectData.name),
      members: this.generateMembersCSV(members, projectData.name)
    }
    
    // Incluir etapas se solicitado
    if (options.includeSteps) {
      result.task_steps = this.generateTaskStepsCSV(tasks, projectData.name)
    }
    
    // Incluir comentários se solicitado
    if (options.includeComments) {
      result.comments = this.generateCommentsCSV(tasks, projectData.name)
    }
    
    return result
  }

  /**
   * Converte status para label legível
   * @param {string} status - Status da tarefa
   * @returns {string} Label formatado
   */
  getStatusLabel(status) {
    const statusMap = {
      'não_iniciada': 'Não Iniciada',
      'em_andamento': 'Em Andamento',
      'pausada': 'Pausada',
      'concluída': 'Concluída'
    }
    return statusMap[status] || status
  }

  /**
   * Cria e baixa arquivo CSV
   * @param {string} csvContent - Conteúdo CSV
   * @param {string} filename - Nome do arquivo
   * @param {Object} options - Opções adicionais
   */
  downloadCSV(csvContent, filename, options = {}) {
    const config = { ...this.defaultOptions, ...options }
    
    // Adicionar BOM para UTF-8 (garante acentos no Excel)
    const BOM = '\uFEFF'
    const csvWithBOM = BOM + csvContent
    
    // Criar blob
    const blob = new Blob([csvWithBOM], { 
      type: `text/csv;charset=${config.encoding}` 
    })
    
    // Criar URL temporária
    const url = window.URL.createObjectURL(blob)
    
    // Criar elemento de download
    const link = document.createElement('a')
    link.href = url
    
    // Adicionar timestamp ao nome do arquivo
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss')
    link.download = `${filename}_${timestamp}.csv`
    
    // Disparar download
    document.body.appendChild(link)
    link.click()
    
    // Limpar
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  /**
   * Cria e baixa múltiplos arquivos CSV (zip simulado com múltiplos downloads)
   * @param {Object} csvData - Objeto com múltiplos CSVs
   * @param {string} baseFilename - Nome base dos arquivos
   */
  downloadMultipleCSVs(csvData, baseFilename) {
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss')
    
    Object.entries(csvData).forEach(([sheetName, csvContent], index) => {
      setTimeout(() => {
        const filename = `${baseFilename}_${sheetName}_${timestamp}`
        this.downloadCSV(csvContent, filename)
      }, index * 500) // Delay para evitar bloqueio de popup
    })
  }

  /**
   * Converte dados para formato Excel-friendly
   * @param {Array} data - Dados para converter
   * @returns {Array} Dados formatados para Excel
   */
  formatForExcel(data) {
    return data.map(row => {
      const formattedRow = {}
      
      Object.entries(row).forEach(([key, value]) => {
        // Excel interpreta valores começando com = como fórmulas
        if (typeof value === 'string' && value.startsWith('=')) {
          formattedRow[key] = `'${value}`
        } else {
          formattedRow[key] = value
        }
      })
      
      return formattedRow
    })
  }
}

// Instância singleton do serviço
const csvExportService = new CSVExportService()

export default csvExportService
export { CSVExportService }