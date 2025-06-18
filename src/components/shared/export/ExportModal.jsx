import React, { useState } from 'react'
import { 
  X, 
  FileText, 
  FileSpreadsheet, 
  Download, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

import { Modal, Button } from '@/components/shared/ui'
import { PDFExport } from './PDFExport'
import { CSVExport } from './CSVExport'
import { cn } from '@/utils/helpers'

/**
 * Modal para configuração avançada de exportação
 * 
 * Props:
 * - isOpen: se o modal está aberto
 * - onClose: callback para fechar modal
 * - onConfirm: callback para confirmar exportação
 * - format: formato de exportação ('pdf' ou 'csv')
 * - type: tipo de dados ('project', 'tasks', 'members')
 * - data: dados para exportar
 * - recordCount: número de registros
 */
export const ExportModal = ({
  isOpen,
  onClose,
  onConfirm,
  format,
  type = 'tasks',
  data,
  recordCount = 0
}) => {
  const [options, setOptions] = useState({})
  const [isExporting, setIsExporting] = useState(false)
  const [step, setStep] = useState('configure') // 'configure', 'confirm', 'exporting', 'complete'

  /**
   * Manipula mudanças nas opções de exportação
   */
  const handleOptionsChange = (newOptions) => {
    setOptions(newOptions)
  }

  /**
   * Avança para confirmação
   */
  const handleNext = () => {
    setStep('confirm')
  }

  /**
   * Volta para configuração
   */
  const handleBack = () => {
    setStep('configure')
  }

  /**
   * Confirma e executa a exportação
   */
  const handleConfirm = async () => {
    setStep('exporting')
    setIsExporting(true)

    try {
      await onConfirm(options)
      setStep('complete')
    } catch (error) {
      console.error('Erro na exportação:', error)
      setStep('configure')
    } finally {
      setIsExporting(false)
    }
  }

  /**
   * Fecha modal e reseta estado
   */
  const handleClose = () => {
    setStep('configure')
    setOptions({})
    setIsExporting(false)
    onClose()
  }

  /**
   * Obtém informações do formato
   */
  const getFormatInfo = () => {
    if (format === 'pdf') {
      return {
        icon: FileText,
        name: 'PDF',
        description: 'Relatório formatado para impressão e apresentação',
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      }
    } else {
      return {
        icon: FileSpreadsheet,
        name: 'CSV',
        description: 'Dados estruturados para análise em planilhas',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      }
    }
  }

  /**
   * Obtém título baseado no tipo
   */
  const getTypeTitle = () => {
    const typeMap = {
      project: 'Projeto Completo',
      tasks: 'Lista de Tarefas',
      members: 'Membros do Projeto'
    }
    return typeMap[type] || 'Dados'
  }

  const formatInfo = getFormatInfo()
  const Icon = formatInfo.icon

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title=""
      size="lg"
      className="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Cabeçalho customizado */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "flex items-center justify-center w-12 h-12 rounded-lg",
              formatInfo.bgColor
            )}>
              <Icon className={cn("w-6 h-6", formatInfo.color)} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Exportar {getTypeTitle()}
              </h2>
              <p className="text-sm text-gray-500">
                {formatInfo.description}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Indicador de progresso */}
        <div className="flex items-center justify-center space-x-4">
          <div className={cn(
            "flex items-center space-x-2",
            step === 'configure' ? 'text-blue-600' : 'text-gray-400'
          )}>
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
              step === 'configure' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            )}>
              1
            </div>
            <span className="text-sm font-medium">Configurar</span>
          </div>

          <div className={cn(
            "w-12 h-0.5",
            ['confirm', 'exporting', 'complete'].includes(step) 
              ? 'bg-blue-600' 
              : 'bg-gray-200'
          )} />

          <div className={cn(
            "flex items-center space-x-2",
            ['confirm', 'exporting', 'complete'].includes(step) 
              ? 'text-blue-600' 
              : 'text-gray-400'
          )}>
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
              ['confirm', 'exporting', 'complete'].includes(step)
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            )}>
              {step === 'exporting' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                '2'
              )}
            </div>
            <span className="text-sm font-medium">Confirmar</span>
          </div>

          <div className={cn(
            "w-12 h-0.5",
            step === 'complete' ? 'bg-green-600' : 'bg-gray-200'
          )} />

          <div className={cn(
            "flex items-center space-x-2",
            step === 'complete' ? 'text-green-600' : 'text-gray-400'
          )}>
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
              step === 'complete'
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            )}>
              {step === 'complete' ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                '3'
              )}
            </div>
            <span className="text-sm font-medium">Concluído</span>
          </div>
        </div>

        {/* Conteúdo do modal baseado no step */}
        <div className="min-h-[400px]">
          {step === 'configure' && (
            <div>
              {format === 'pdf' ? (
                <PDFExport
                  data={data}
                  type={type}
                  onOptionsChange={handleOptionsChange}
                />
              ) : (
                <CSVExport
                  data={data}
                  type={type}
                  onOptionsChange={handleOptionsChange}
                />
              )}
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className={cn(
                  "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4",
                  formatInfo.bgColor
                )}>
                  <Icon className={cn("w-8 h-8", formatInfo.color)} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Confirmar Exportação
                </h3>
                <p className="text-gray-600">
                  Verifique os detalhes antes de gerar o arquivo
                </p>
              </div>

              {/* Resumo da exportação */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Formato:</span>
                    <span className="ml-2 text-gray-900">{formatInfo.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tipo:</span>
                    <span className="ml-2 text-gray-900">{getTypeTitle()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Registros:</span>
                    <span className="ml-2 text-gray-900">{recordCount}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Arquivos:</span>
                    <span className="ml-2 text-gray-900">
                      {format === 'csv' && options.multipleFiles 
                        ? `${Math.max(1, Object.keys(options).filter(k => options[k] === true).length)}`
                        : '1'
                      }
                    </span>
                  </div>
                </div>

                {/* Opções selecionadas */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Opções selecionadas:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(options)
                      .filter(([key, value]) => value === true)
                      .map(([key]) => (
                        <span
                          key={key}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                        >
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                      ))
                    }
                  </div>
                </div>
              </div>

              {/* Avisos */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-700">
                    <div className="font-medium mb-1">Antes de continuar:</div>
                    <ul className="space-y-1 text-xs">
                      <li>• O arquivo será baixado automaticamente para sua pasta de downloads</li>
                      <li>• Arquivos grandes podem demorar alguns segundos para gerar</li>
                      {format === 'csv' && options.multipleFiles && (
                        <li>• Múltiplos arquivos serão baixados sequencialmente</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'exporting' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className={cn(
                  "flex items-center justify-center w-16 h-16 rounded-full mb-4",
                  formatInfo.bgColor
                )}>
                  <Icon className={cn("w-8 h-8", formatInfo.color)} />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Gerando arquivo...
              </h3>
              <p className="text-gray-600 mb-4">
                Processando {recordCount} {recordCount === 1 ? 'registro' : 'registros'}
              </p>
              
              <div className="w-64 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: '75%' }}
                />
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Exportação Concluída!
              </h3>
              <p className="text-gray-600 mb-6 text-center">
                O arquivo foi gerado com sucesso e está sendo baixado automaticamente.
                <br />
                Verifique sua pasta de downloads.
              </p>

              <Button
                onClick={handleClose}
                className="px-6"
              >
                Fechar
              </Button>
            </div>
          )}
        </div>

        {/* Rodapé com ações */}
        {step === 'configure' && (
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-500">
              {recordCount} {recordCount === 1 ? 'registro' : 'registros'} para exportar
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleNext}
                disabled={!data || recordCount === 0}
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
            >
              Voltar
            </Button>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isExporting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Gerar {formatInfo.name}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ExportModal