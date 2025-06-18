import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Serviço para geração de relatórios em PDF
 * Utiliza jsPDF com plugin AutoTable para criar relatórios profissionais
 */
class PDFExportService {
  constructor() {
    this.defaultOptions = {
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16
    }
  }

  /**
   * Cria um novo documento PDF
   * @param {Object} options - Opções do documento
   * @returns {jsPDF} Instância do documento
   */
  createDocument(options = {}) {
    const config = { ...this.defaultOptions, ...options }
    return new jsPDF(config)
  }

  /**
   * Adiciona cabeçalho padrão ao documento
   * @param {jsPDF} doc - Documento PDF
   * @param {string} title - Título do relatório
   * @param {string} subtitle - Subtítulo opcional
   */
  addHeader(doc, title, subtitle = '') {
    const pageWidth = doc.internal.pageSize.width
    
    // Logo/Nome da aplicação
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Task Manager', 20, 20)
    
    // Título principal
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    const titleWidth = doc.getStringUnitWidth(title) * doc.internal.getFontSize() / doc.internal.scaleFactor
    const titleX = (pageWidth - titleWidth) / 2
    doc.text(title, titleX, 35)
    
    // Subtítulo
    if (subtitle) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      const subtitleWidth = doc.getStringUnitWidth(subtitle) * doc.internal.getFontSize() / doc.internal.scaleFactor
      const subtitleX = (pageWidth - subtitleWidth) / 2
      doc.text(subtitle, subtitleX, 45)
    }
    
    // Data de geração
    const currentDate = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Gerado em: ${currentDate}`, pageWidth - 20, 20, { align: 'right' })
    
    // Linha separadora
    doc.setLineWidth(0.5)
    doc.line(20, subtitle ? 55 : 45, pageWidth - 20, subtitle ? 55 : 45)
    
    return subtitle ? 65 : 55
  }

  /**
   * Adiciona rodapé com numeração
   * @param {jsPDF} doc - Documento PDF
   */
  addFooter(doc) {
    const pageCount = doc.internal.getNumberOfPages()
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      const pageHeight = doc.internal.pageSize.height
      const pageWidth = doc.internal.pageSize.width
      
      // Linha separadora
      doc.setLineWidth(0.3)
      doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20)
      
      // Número da página
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' })
      
      // Info adicional
      doc.text('Task Manager - Sistema de Gerenciamento de Tarefas', 20, pageHeight - 10)
    }
  }

  /**
   * Gera relatório de projeto completo
   * @param {Object} projectData - Dados do projeto
   * @param {Array} tasks - Lista de tarefas
   * @param {Array} members - Lista de membros
   * @returns {jsPDF} Documento PDF gerado
   */
  generateProjectReport(projectData, tasks = [], members = []) {
    const doc = this.createDocument()
    
    // Cabeçalho
    const startY = this.addHeader(
      doc, 
      'Relatório de Projeto', 
      projectData.name
    )
    
    let currentY = startY + 10
    
    // Informações do projeto
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Informações Gerais', 20, currentY)
    currentY += 10
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    const projectInfo = [
      ['Nome do Projeto', projectData.name || 'N/A'],
      ['Descrição', projectData.description || 'Sem descrição'],
      ['Criado em', projectData.created_at ? format(new Date(projectData.created_at), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'],
      ['Total de Membros', members.length.toString()],
      ['Total de Tarefas', tasks.length.toString()],
      ['Tarefas Concluídas', tasks.filter(t => t.status === 'concluída').length.toString()],
      ['Taxa de Conclusão', tasks.length > 0 ? `${Math.round((tasks.filter(t => t.status === 'concluída').length / tasks.length) * 100)}%` : '0%']
    ]
    
    doc.autoTable({
      startY: currentY,
      head: [['Campo', 'Valor']],
      body: projectInfo,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 120 }
      }
    })
    
    currentY = doc.lastAutoTable.finalY + 15
    
    // Membros do projeto
    if (members.length > 0) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Membros do Projeto', 20, currentY)
      currentY += 10
      
      const membersData = members.map(member => [
        member.full_name || 'Nome não disponível',
        member.email || 'Email não disponível',
        member.role || 'member',
        member.joined_at ? format(new Date(member.joined_at), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'
      ])
      
      doc.autoTable({
        startY: currentY,
        head: [['Nome', 'Email', 'Função', 'Data de Entrada']],
        body: membersData,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        margin: { left: 20, right: 20 }
      })
      
      currentY = doc.lastAutoTable.finalY + 15
    }
    
    // Verificar se precisa de nova página
    if (currentY > 200) {
      doc.addPage()
      currentY = 30
    }
    
    // Lista de tarefas
    if (tasks.length > 0) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Tarefas do Projeto', 20, currentY)
      currentY += 10
      
      const tasksData = tasks.map(task => {
        const assignedUsers = task.assignments?.map(a => a.user?.full_name).join(', ') || 'Não atribuída'
        const completionPercentage = this.calculateTaskCompletion(task)
        
        return [
          task.name || 'Sem nome',
          this.getStatusLabel(task.status),
          `${completionPercentage}%`,
          assignedUsers,
          task.created_at ? format(new Date(task.created_at), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'
        ]
      })
      
      doc.autoTable({
        startY: currentY,
        head: [['Nome da Tarefa', 'Status', 'Progresso', 'Responsáveis', 'Criada em']],
        body: tasksData,
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] },
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 25 },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 50 },
          4: { cellWidth: 25 }
        },
        didParseCell: (data) => {
          // Colorir células de status
          if (data.column.index === 1) {
            const status = data.cell.raw
            switch (status) {
              case 'Concluída':
                data.cell.styles.textColor = [16, 185, 129]
                break
              case 'Em Andamento':
                data.cell.styles.textColor = [59, 130, 246]
                break
              case 'Pausada':
                data.cell.styles.textColor = [245, 158, 11]
                break
              default:
                data.cell.styles.textColor = [107, 114, 128]
            }
          }
        }
      })
    }
    
    // Adicionar rodapé
    this.addFooter(doc)
    
    return doc
  }

  /**
   * Gera relatório de tarefas filtradas
   * @param {Array} tasks - Lista de tarefas
   * @param {Object} filters - Filtros aplicados
   * @param {string} projectName - Nome do projeto (opcional)
   * @returns {jsPDF} Documento PDF gerado
   */
  generateTasksReport(tasks = [], filters = {}, projectName = '') {
    const doc = this.createDocument()
    
    // Cabeçalho
    const title = projectName ? `Relatório de Tarefas - ${projectName}` : 'Relatório de Tarefas'
    const startY = this.addHeader(doc, title)
    
    let currentY = startY + 10
    
    // Informações dos filtros aplicados
    if (Object.keys(filters).length > 0) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Filtros Aplicados:', 20, currentY)
      currentY += 8
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'todos') {
          const filterLabel = this.getFilterLabel(key, value)
          doc.text(`• ${filterLabel}`, 25, currentY)
          currentY += 5
        }
      })
      
      currentY += 5
    }
    
    // Sumário estatístico
    const stats = this.calculateTasksStats(tasks)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumo Estatístico:', 20, currentY)
    currentY += 10
    
    const statsData = [
      ['Total de Tarefas', stats.total.toString()],
      ['Não Iniciadas', stats.notStarted.toString()],
      ['Em Andamento', stats.inProgress.toString()],
      ['Pausadas', stats.paused.toString()],
      ['Concluídas', stats.completed.toString()],
      ['Taxa de Conclusão', `${stats.completionRate}%`],
      ['Progresso Médio', `${stats.averageProgress}%`]
    ]
    
    doc.autoTable({
      startY: currentY,
      head: [['Métrica', 'Valor']],
      body: statsData,
      theme: 'grid',
      headStyles: { fillColor: [139, 69, 19] },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 30, halign: 'center' }
      }
    })
    
    currentY = doc.lastAutoTable.finalY + 15
    
    // Lista detalhada de tarefas
    if (tasks.length > 0) {
      // Verificar se precisa de nova página
      if (currentY > 180) {
        doc.addPage()
        currentY = 30
      }
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Detalhamento das Tarefas:', 20, currentY)
      currentY += 10
      
      const tasksData = tasks.map(task => {
        const assignedUsers = task.assignments?.map(a => a.user?.full_name).join(', ') || 'Não atribuída'
        const completionPercentage = this.calculateTaskCompletion(task)
        const stepsInfo = task.steps ? `${task.steps.filter(s => s.is_completed).length}/${task.steps.length}` : '0/0'
        
        return [
          task.name || 'Sem nome',
          task.description ? (task.description.length > 50 ? task.description.substring(0, 50) + '...' : task.description) : 'Sem descrição',
          this.getStatusLabel(task.status),
          `${completionPercentage}%`,
          stepsInfo,
          assignedUsers,
          task.created_at ? format(new Date(task.created_at), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'
        ]
      })
      
      doc.autoTable({
        startY: currentY,
        head: [['Nome', 'Descrição', 'Status', 'Progresso', 'Etapas', 'Responsáveis', 'Criada em']],
        body: tasksData,
        theme: 'striped',
        headStyles: { fillColor: [168, 85, 247] },
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 45 },
          2: { cellWidth: 20 },
          3: { cellWidth: 15, halign: 'center' },
          4: { cellWidth: 15, halign: 'center' },
          5: { cellWidth: 35 },
          6: { cellWidth: 20 }
        },
        styles: {
          fontSize: 8,
          cellPadding: 3
        },
        didParseCell: (data) => {
          // Colorir células de status
          if (data.column.index === 2) {
            const status = data.cell.raw
            switch (status) {
              case 'Concluída':
                data.cell.styles.textColor = [16, 185, 129]
                data.cell.styles.fontStyle = 'bold'
                break
              case 'Em Andamento':
                data.cell.styles.textColor = [59, 130, 246]
                data.cell.styles.fontStyle = 'bold'
                break
              case 'Pausada':
                data.cell.styles.textColor = [245, 158, 11]
                data.cell.styles.fontStyle = 'bold'
                break
              default:
                data.cell.styles.textColor = [107, 114, 128]
            }
          }
        }
      })
    }
    
    // Adicionar rodapé
    this.addFooter(doc)
    
    return doc
  }

  /**
   * Calcula estatísticas das tarefas
   * @param {Array} tasks - Lista de tarefas
   * @returns {Object} Estatísticas calculadas
   */
  calculateTasksStats(tasks) {
    const total = tasks.length
    const notStarted = tasks.filter(t => t.status === 'não_iniciada').length
    const inProgress = tasks.filter(t => t.status === 'em_andamento').length
    const paused = tasks.filter(t => t.status === 'pausada').length
    const completed = tasks.filter(t => t.status === 'concluída').length
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    
    // Calcular progresso médio
    const totalProgress = tasks.reduce((sum, task) => {
      return sum + this.calculateTaskCompletion(task)
    }, 0)
    const averageProgress = total > 0 ? Math.round(totalProgress / total) : 0
    
    return {
      total,
      notStarted,
      inProgress,
      paused,
      completed,
      completionRate,
      averageProgress
    }
  }

  /**
   * Calcula porcentagem de conclusão de uma tarefa
   * @param {Object} task - Tarefa
   * @returns {number} Porcentagem de conclusão
   */
  calculateTaskCompletion(task) {
    if (!task.steps || task.steps.length === 0) return 0
    
    const completedSteps = task.steps.filter(step => step.is_completed).length
    return Math.round((completedSteps / task.steps.length) * 100)
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
   * Converte filtros para labels legíveis
   * @param {string} key - Chave do filtro
   * @param {any} value - Valor do filtro
   * @returns {string} Label formatado
   */
  getFilterLabel(key, value) {
    const filterMap = {
      status: `Status: ${this.getStatusLabel(value)}`,
      assignedTo: `Responsável: ${value}`,
      dateRange: `Período: ${value}`,
      completion: `Progresso: ${value}`
    }
    return filterMap[key] || `${key}: ${value}`
  }

  /**
   * Salva o documento PDF
   * @param {jsPDF} doc - Documento PDF
   * @param {string} filename - Nome do arquivo
   */
  saveDocument(doc, filename) {
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss')
    const finalFilename = `${filename}_${timestamp}.pdf`
    doc.save(finalFilename)
  }
}

// Instância singleton do serviço
const pdfExportService = new PDFExportService()

export default pdfExportService
export { PDFExportService }