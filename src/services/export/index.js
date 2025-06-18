// Exportações dos serviços de exportação
export { default as pdfExportService, PDFExportService } from './pdfExportService'
export { default as csvExportService, CSVExportService } from './csvExportService'

// Exportação combinada para uso conveniente
export const exportServices = {
  pdf: pdfExportService,
  csv: csvExportService
}

// Utilitário para validar se os dados estão prontos para exportação
export const validateExportData = (data, type = 'basic') => {
  if (!data) {
    return { valid: false, error: 'Dados não fornecidos' }
  }

  switch (type) {
    case 'project':
      if (!data.name) {
        return { valid: false, error: 'Nome do projeto é obrigatório' }
      }
      break
    
    case 'tasks':
      if (!Array.isArray(data)) {
        return { valid: false, error: 'Lista de tarefas deve ser um array' }
      }
      break
    
    case 'members':
      if (!Array.isArray(data)) {
        return { valid: false, error: 'Lista de membros deve ser um array' }
      }
      break
    
    default:
      break
  }

  return { valid: true }
}

// Constantes de exportação
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  CSV: 'csv'
}

export const EXPORT_TYPES = {
  PROJECT: 'project',
  TASKS: 'tasks',
  MEMBERS: 'members',
  FULL_REPORT: 'full_report'
}

// Configurações padrão de exportação
export const DEFAULT_EXPORT_OPTIONS = {
  pdf: {
    orientation: 'portrait',
    format: 'a4',
    includeHeader: true,
    includeFooter: true,
    includeStats: true
  },
  csv: {
    delimiter: ',',
    encoding: 'utf-8',
    includeHeaders: true,
    includeSteps: false,
    includeComments: false
  }
}
