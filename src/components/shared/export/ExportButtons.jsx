import React, { useState } from 'react'
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Settings,
  ChevronDown,
  Loader2
} from 'lucide-react'

import { Button } from '@/components/shared/ui'
import { useExport } from '@/hooks/shared'
import { ExportModal } from './ExportModal'
import { cn } from '@/utils/helpers'

/**
 * Componente de botões para exportação de dados
 * 
 * Props:
 * - data: dados para exportar
 * - type: tipo de exportação ('project', 'tasks', 'members')
 * - projectName: nome do projeto (opcional)
 * - filters: filtros aplicados (opcional)
 * - className: classes CSS adicionais
 * - size: tamanho dos botões ('sm', 'md', 'lg')
 * - variant: variante visual ('primary', 'secondary', 'outline')
 * - showAdvanced: mostrar opções avançadas
 */
export const ExportButtons = ({
  data,
  type = 'tasks',
  projectName = '',
  filters = {},
  className = '',
  size = 'md',
  variant = 'outline',
  showAdvanced = true
}) => {
  const {
    exportProject,
    exportTasks,
    isExporting,
    exportProgress,
    EXPORT_FORMATS,
    EXPORT_TYPES
  } = useExport()

  const [showDropdown, setShowDropdown] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [exportFormat, setExportFormat] = useState(null)

  /**
   * Manipula exportação rápida (sem configurações)
   */
  const handleQuickExport = async (format) => {
    try {
      if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new Error('Nenhum dado disponível para exportação')
      }

      if (type === EXPORT_TYPES.PROJECT) {
        const { projectData, tasks, members } = data
        await exportProject(projectData, tasks, members, format)
      } else if (type === EXPORT_TYPES.TASKS) {
        await exportTasks(data, format, projectName, filters)
      } else {
        throw new Error(`Tipo de exportação não suportado: ${type}`)
      }
    } catch (error) {
      console.error('Erro na exportação rápida:', error)
    }
  }

  /**
   * Abre modal de configuração avançada
   */
  const handleAdvancedExport = (format) => {
    setExportFormat(format)
    setShowModal(true)
    setShowDropdown(false)
  }

  /**
   * Confirma exportação com configurações personalizadas
   */
  const handleConfirmExport = async (options) => {
    try {
      if (type === EXPORT_TYPES.PROJECT) {
        const { projectData, tasks, members } = data
        await exportProject(projectData, tasks, members, exportFormat, options)
      } else if (type === EXPORT_TYPES.TASKS) {
        await exportTasks(data, exportFormat, projectName, filters, options)
      }
      setShowModal(false)
    } catch (error) {
      console.error('Erro na exportação configurada:', error)
    }
  }

  /**
   * Verifica se há dados para exportar
   */
  const hasData = () => {
    if (!data) return false
    if (Array.isArray(data)) return data.length > 0
    if (type === EXPORT_TYPES.PROJECT) {
      return data.projectData && data.projectData.name
    }
    return true
  }

  /**
   * Obtém contador de registros
   */
  const getRecordCount = () => {
    if (!data) return 0
    if (Array.isArray(data)) return data.length
    if (type === EXPORT_TYPES.PROJECT) {
      const tasks = data.tasks || []
      return tasks.length
    }
    return 1
  }

  const buttonSizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const recordCount = getRecordCount()
  const dataAvailable = hasData()

  return (
    <>
      <div className={cn("relative inline-flex items-center", className)}>
        {/* Botão principal - Exportar PDF */}
        <Button
          variant={variant}
          size={size}
          onClick={() => handleQuickExport(EXPORT_FORMATS.PDF)}
          disabled={!dataAvailable || isExporting}
          className={cn(
            "rounded-r-none border-r-0",
            buttonSizeClasses[size]
          )}
        >
          {isExporting ? (
            <Loader2 className={cn("animate-spin mr-2", iconSizeClasses[size])} />
          ) : (
            <FileText className={cn("mr-2", iconSizeClasses[size])} />
          )}
          {isExporting ? `${exportProgress}%` : 'PDF'}
        </Button>

        {/* Dropdown de opções */}
        <div className="relative">
          <Button
            variant={variant}
            size={size}
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={!dataAvailable || isExporting}
            className={cn(
              "rounded-l-none px-2",
              buttonSizeClasses[size]
            )}
          >
            <ChevronDown className={iconSizeClasses[size]} />
          </Button>

          {/* Menu dropdown */}
          {showDropdown && dataAvailable && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="py-1">
                {/* Cabeçalho com info */}
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-xs text-gray-500">
                    {recordCount} {recordCount === 1 ? 'registro' : 'registros'}
                  </div>
                </div>

                {/* Exportação rápida PDF */}
                <button
                  onClick={() => {
                    handleQuickExport(EXPORT_FORMATS.PDF)
                    setShowDropdown(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FileText className="w-4 h-4 mr-3 text-red-500" />
                  <div className="text-left">
                    <div className="font-medium">PDF Rápido</div>
                    <div className="text-xs text-gray-500">Relatório padrão</div>
                  </div>
                </button>

                {/* Exportação rápida CSV */}
                <button
                  onClick={() => {
                    handleQuickExport(EXPORT_FORMATS.CSV)
                    setShowDropdown(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-3 text-green-500" />
                  <div className="text-left">
                    <div className="font-medium">CSV Rápido</div>
                    <div className="text-xs text-gray-500">Dados básicos</div>
                  </div>
                </button>

                {/* Opções avançadas (se habilitado) */}
                {showAdvanced && (
                  <>
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button
                      onClick={() => handleAdvancedExport(EXPORT_FORMATS.PDF)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4 mr-3 text-blue-500" />
                      <div className="text-left">
                        <div className="font-medium">PDF Personalizado</div>
                        <div className="text-xs text-gray-500">Com opções</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleAdvancedExport(EXPORT_FORMATS.CSV)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4 mr-3 text-blue-500" />
                      <div className="text-left">
                        <div className="font-medium">CSV Personalizado</div>
                        <div className="text-xs text-gray-500">Múltiplas planilhas</div>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Overlay para fechar dropdown */}
        {showDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>

      {/* Modal de configuração avançada */}
      {showModal && (
        <ExportModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmExport}
          format={exportFormat}
          type={type}
          data={data}
          recordCount={recordCount}
        />
      )}
    </>
  )
}

/**
 * Versão simples com apenas um botão
 */
export const SimpleExportButton = ({
  data,
  type = 'tasks',
  format = 'pdf',
  projectName = '',
  filters = {},
  className = '',
  children
}) => {
  const { exportProject, exportTasks, isExporting, exportProgress } = useExport()

  const handleExport = async () => {
    try {
      if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new Error('Nenhum dado disponível para exportação')
      }

      if (type === 'project') {
        const { projectData, tasks, members } = data
        await exportProject(projectData, tasks, members, format)
      } else {
        await exportTasks(data, format, projectName, filters)
      }
    } catch (error) {
      console.error('Erro na exportação:', error)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting || !data}
      className={className}
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {exportProgress}%
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          {children || 'Exportar'}
        </>
      )}
    </Button>
  )
}

export default ExportButtons