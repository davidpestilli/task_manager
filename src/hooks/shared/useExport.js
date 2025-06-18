import { useState, useCallback } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { 
  exportServices, 
  validateExportData, 
  EXPORT_FORMATS, 
  EXPORT_TYPES,
  DEFAULT_EXPORT_OPTIONS 
} from '@/services/export'
import { useAuth } from '@/hooks/auth'

/**
 * Hook personalizado para operações de exportação
 * 
 * Funcionalidades:
 * - Exportação em PDF e CSV
 * - Estados de loading e erro
 * - Validação de dados
 * - Feedback visual com toast
 * - Cache de operações
 */
export const useExport = () => {
  const { user } = useAuth()
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  /**
   * Mutação para exportação de projetos em PDF
   */
  const exportProjectPDFMutation = useMutation({
    mutationFn: async ({ projectData, tasks, members, options = {} }) => {
      setIsExporting(true)
      setExportProgress(10)

      // Validar dados
      const projectValidation = validateExportData(projectData, 'project')
      if (!projectValidation.valid) {
        throw new Error(projectValidation.error)
      }

      setExportProgress(30)

      // Configurar opções
      const exportOptions = {
        ...DEFAULT_EXPORT_OPTIONS.pdf,
        ...options
      }

      setExportProgress(50)

      // Gerar PDF
      const doc = exportServices.pdf.generateProjectReport(
        projectData, 
        tasks || [], 
        members || []
      )

      setExportProgress(80)

      // Salvar arquivo
      const filename = `projeto_${projectData.name.replace(/[^a-zA-Z0-9]/g, '_')}`
      exportServices.pdf.saveDocument(doc, filename)

      setExportProgress(100)

      return { success: true, filename }
    },
    onSuccess: (data) => {
      toast.success(`Relatório PDF gerado com sucesso: ${data.filename}`)
      setIsExporting(false)
      setExportProgress(0)
    },
    onError: (error) => {
      console.error('Erro ao exportar PDF:', error)
      toast.error(`Erro ao gerar PDF: ${error.message}`)
      setIsExporting(false)
      setExportProgress(0)
    }
  })

  /**
   * Mutação para exportação de tarefas em PDF
   */
  const exportTasksPDFMutation = useMutation({
    mutationFn: async ({ tasks, filters = {}, projectName = '', options = {} }) => {
      setIsExporting(true)
      setExportProgress(10)

      // Validar dados
      const tasksValidation = validateExportData(tasks, 'tasks')
      if (!tasksValidation.valid) {
        throw new Error(tasksValidation.error)
      }

      setExportProgress(40)

      // Gerar PDF
      const doc = exportServices.pdf.generateTasksReport(
        tasks,
        filters,
        projectName
      )

      setExportProgress(80)

      // Salvar arquivo
      const filename = projectName 
        ? `tarefas_${projectName.replace(/[^a-zA-Z0-9]/g, '_')}`
        : 'tarefas_relatorio'
      exportServices.pdf.saveDocument(doc, filename)

      setExportProgress(100)

      return { success: true, filename }
    },
    onSuccess: (data) => {
      toast.success(`Relatório de tarefas gerado: ${data.filename}`)
      setIsExporting(false)
      setExportProgress(0)
    },
    onError: (error) => {
      console.error('Erro ao exportar tarefas PDF:', error)
      toast.error(`Erro ao gerar relatório: ${error.message}`)
      setIsExporting(false)
      setExportProgress(0)
    }
  })

  /**
   * Mutação para exportação de projeto em CSV
   */
  const exportProjectCSVMutation = useMutation({
    mutationFn: async ({ projectData, tasks, members, options = {} }) => {
      setIsExporting(true)
      setExportProgress(10)

      // Validar dados
      const projectValidation = validateExportData(projectData, 'project')
      if (!projectValidation.valid) {
        throw new Error(projectValidation.error)
      }

      setExportProgress(30)

      // Configurar opções
      const exportOptions = {
        ...DEFAULT_EXPORT_OPTIONS.csv,
        ...options
      }

      setExportProgress(50)

      // Verificar se deve gerar múltiplos arquivos ou apenas um
      if (exportOptions.multipleFiles) {
        // Gerar múltiplos CSVs
        const csvData = exportServices.csv.generateMultiSheetCSV(
          projectData,
          tasks || [],
          members || [],
          exportOptions
        )

        setExportProgress(80)

        const baseFilename = `projeto_${projectData.name.replace(/[^a-zA-Z0-9]/g, '_')}`
        exportServices.csv.downloadMultipleCSVs(csvData, baseFilename)
        
        setExportProgress(100)
        return { success: true, type: 'multiple', count: Object.keys(csvData).length }
      } else {
        // Gerar apenas CSV de tarefas (mais comum)
        const csvContent = exportServices.csv.generateTasksCSV(
          tasks || [],
          projectData.name
        )

        setExportProgress(80)

        const filename = `projeto_${projectData.name.replace(/[^a-zA-Z0-9]/g, '_')}_tarefas`
        exportServices.csv.downloadCSV(csvContent, filename)

        setExportProgress(100)
        return { success: true, type: 'single', filename }
      }
    },
    onSuccess: (data) => {
      if (data.type === 'multiple') {
        toast.success(`${data.count} arquivos CSV gerados com sucesso`)
      } else {
        toast.success(`CSV gerado: ${data.filename}`)
      }
      setIsExporting(false)
      setExportProgress(0)
    },
    onError: (error) => {
      console.error('Erro ao exportar CSV:', error)
      toast.error(`Erro ao gerar CSV: ${error.message}`)
      setIsExporting(false)
      setExportProgress(0)
    }
  })

  /**
   * Mutação para exportação de tarefas em CSV
   */
  const exportTasksCSVMutation = useMutation({
    mutationFn: async ({ tasks, projectName = '', options = {} }) => {
      setIsExporting(true)
      setExportProgress(20)

      // Validar dados
      const tasksValidation = validateExportData(tasks, 'tasks')
      if (!tasksValidation.valid) {
        throw new Error(tasksValidation.error)
      }

      setExportProgress(50)

      // Gerar CSV
      const csvContent = exportServices.csv.generateTasksCSV(tasks, projectName)

      setExportProgress(80)

      // Baixar arquivo
      const filename = projectName 
        ? `tarefas_${projectName.replace(/[^a-zA-Z0-9]/g, '_')}`
        : 'tarefas_exportacao'
      exportServices.csv.downloadCSV(csvContent, filename)

      setExportProgress(100)

      return { success: true, filename }
    },
    onSuccess: (data) => {
      toast.success(`CSV de tarefas gerado: ${data.filename}`)
      setIsExporting(false)
      setExportProgress(0)
    },
    onError: (error) => {
      console.error('Erro ao exportar tarefas CSV:', error)
      toast.error(`Erro ao gerar CSV: ${error.message}`)
      setIsExporting(false)
      setExportProgress(0)
    }
  })

  /**
   * Função utilitária para exportar projeto completo
   */
  const exportProject = useCallback(async (projectData, tasks, members, format, options = {}) => {
    try {
      if (format === EXPORT_FORMATS.PDF) {
        await exportProjectPDFMutation.mutateAsync({
          projectData,
          tasks,
          members,
          options
        })
      } else if (format === EXPORT_FORMATS.CSV) {
        await exportProjectCSVMutation.mutateAsync({
          projectData,
          tasks,
          members,
          options
        })
      } else {
        throw new Error(`Formato de exportação não suportado: ${format}`)
      }
    } catch (error) {
      console.error('Erro na exportação do projeto:', error)
      throw error
    }
  }, [exportProjectPDFMutation, exportProjectCSVMutation])

  /**
   * Função utilitária para exportar apenas tarefas
   */
  const exportTasks = useCallback(async (tasks, format, projectName = '', filters = {}, options = {}) => {
    try {
      if (format === EXPORT_FORMATS.PDF) {
        await exportTasksPDFMutation.mutateAsync({
          tasks,
          filters,
          projectName,
          options
        })
      } else if (format === EXPORT_FORMATS.CSV) {
        await exportTasksCSVMutation.mutateAsync({
          tasks,
          projectName,
          options
        })
      } else {
        throw new Error(`Formato de exportação não suportado: ${format}`)
      }
    } catch (error) {
      console.error('Erro na exportação de tarefas:', error)
      throw error
    }
  }, [exportTasksPDFMutation, exportTasksCSVMutation])

  /**
   * Função para calcular estatísticas de exportação
   */
  const calculateExportStats = useCallback((data, type) => {
    switch (type) {
      case EXPORT_TYPES.TASKS:
        return {
          total: data.length,
          completed: data.filter(t => t.status === 'concluída').length,
          inProgress: data.filter(t => t.status === 'em_andamento').length,
          notStarted: data.filter(t => t.status === 'não_iniciada').length,
          paused: data.filter(t => t.status === 'pausada').length
        }
      
      case EXPORT_TYPES.MEMBERS:
        return {
          total: data.length,
          admins: data.filter(m => m.role === 'admin').length,
          members: data.filter(m => m.role === 'member').length,
          owners: data.filter(m => m.role === 'owner').length
        }
      
      default:
        return { total: Array.isArray(data) ? data.length : 1 }
    }
  }, [])

  /**
   * Preview dos dados que serão exportados
   */
  const getExportPreview = useCallback((data, format, type) => {
    const stats = calculateExportStats(data, type)
    
    return {
      format,
      type,
      stats,
      estimatedSize: `${Math.ceil(JSON.stringify(data).length / 1024)} KB`,
      recordCount: stats.total
    }
  }, [calculateExportStats])

  return {
    // Estados
    isExporting,
    exportProgress,
    
    // Mutações
    exportProjectPDF: exportProjectPDFMutation.mutateAsync,
    exportTasksPDF: exportTasksPDFMutation.mutateAsync,
    exportProjectCSV: exportProjectCSVMutation.mutateAsync,
    exportTasksCSV: exportTasksCSVMutation.mutateAsync,
    
    // Estados das mutações
    isExportingProjectPDF: exportProjectPDFMutation.isPending,
    isExportingTasksPDF: exportTasksPDFMutation.isPending,
    isExportingProjectCSV: exportProjectCSVMutation.isPending,
    isExportingTasksCSV: exportTasksCSVMutation.isPending,
    
    // Funções utilitárias
    exportProject,
    exportTasks,
    calculateExportStats,
    getExportPreview,
    
    // Constantes
    EXPORT_FORMATS,
    EXPORT_TYPES,
    DEFAULT_EXPORT_OPTIONS
  }
}

export default useExport