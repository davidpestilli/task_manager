import React, { useState } from 'react'
import { FileText, Settings, Eye, Download } from 'lucide-react'

import { Card } from '@/components/shared/ui'
import { FormField, FormCheckbox, FormSelect } from '@/components/shared/forms'

/**
 * Componente de configuração para exportação PDF
 * 
 * Props:
 * - data: dados para exportar
 * - type: tipo de exportação
 * - onOptionsChange: callback quando opções mudam
 * - initialOptions: opções iniciais
 */
export const PDFExport = ({
  data,
  type = 'tasks',
  onOptionsChange,
  initialOptions = {}
}) => {
  const [options, setOptions] = useState({
    orientation: 'portrait',
    includeHeader: true,
    includeFooter: true,
    includeStats: true,
    includeCharts: false,
    includeComments: false,
    includeDependencies: false,
    groupBy: 'none',
    sortBy: 'created_at',
    sortOrder: 'desc',
    ...initialOptions
  })

  /**
   * Atualiza opções e notifica componente pai
   */
  const updateOption = (key, value) => {
    const newOptions = { ...options, [key]: value }
    setOptions(newOptions)
    onOptionsChange?.(newOptions)
  }

  /**
   * Calcula estatísticas dos dados para preview
   */
  const getDataStats = () => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return { total: 0, estimated: '0 KB' }
    }

    if (Array.isArray(data)) {
      const total = data.length
      const estimated = Math.ceil((total * 0.5) + 50) // Estimativa baseada em tamanho médio
      return { total, estimated: `${estimated} KB` }
    }

    if (type === 'project' && data.projectData) {
      const tasks = data.tasks || []
      const members = data.members || []
      const total = tasks.length + members.length
      const estimated = Math.ceil((total * 0.7) + 100)
      return { total, estimated: `${estimated} KB` }
    }

    return { total: 1, estimated: '50 KB' }
  }

  const stats = getDataStats()

  const orientationOptions = [
    { value: 'portrait', label: 'Retrato (Vertical)' },
    { value: 'landscape', label: 'Paisagem (Horizontal)' }
  ]

  const groupByOptions = [
    { value: 'none', label: 'Sem agrupamento' },
    { value: 'status', label: 'Por status' },
    { value: 'assignee', label: 'Por responsável' },
    { value: 'priority', label: 'Por prioridade' },
    { value: 'created_date', label: 'Por data de criação' }
  ]

  const sortByOptions = [
    { value: 'created_at', label: 'Data de criação' },
    { value: 'updated_at', label: 'Última atualização' },
    { value: 'name', label: 'Nome (alfabética)' },
    { value: 'status', label: 'Status' },
    { value: 'progress', label: 'Progresso' }
  ]

  const sortOrderOptions = [
    { value: 'asc', label: 'Crescente' },
    { value: 'desc', label: 'Decrescente' }
  ]

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
          <FileText className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Configuração PDF
          </h3>
          <p className="text-sm text-gray-500">
            Personalize seu relatório em PDF
          </p>
        </div>
      </div>

      {/* Estatísticas dos dados */}
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div>
              <span className="font-medium text-gray-900">{stats.total}</span>
              <span className="text-gray-500 ml-1">
                {stats.total === 1 ? 'registro' : 'registros'}
              </span>
            </div>
            <div className="h-4 border-l border-gray-300"></div>
            <div>
              <span className="text-gray-500">Tamanho estimado: </span>
              <span className="font-medium text-gray-900">{stats.estimated}</span>
            </div>
          </div>
          <div className="flex items-center text-blue-600">
            <Eye className="w-4 h-4 mr-1" />
            <span className="text-xs font-medium">Preview disponível</span>
          </div>
        </div>
      </Card>

      {/* Configurações de layout */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Layout do Documento
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Orientação"
            value={options.orientation}
            onChange={(value) => updateOption('orientation', value)}
            options={orientationOptions}
          />

          <FormSelect
            label="Agrupar por"
            value={options.groupBy}
            onChange={(value) => updateOption('groupBy', value)}
            options={groupByOptions}
          />

          <FormSelect
            label="Ordenar por"
            value={options.sortBy}
            onChange={(value) => updateOption('sortBy', value)}
            options={sortByOptions}
          />

          <FormSelect
            label="Ordem"
            value={options.sortOrder}
            onChange={(value) => updateOption('sortOrder', value)}
            options={sortOrderOptions}
          />
        </div>
      </div>

      {/* Configurações de conteúdo */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900">
          Conteúdo do Relatório
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormCheckbox
            label="Incluir cabeçalho"
            description="Logo e informações do relatório"
            checked={options.includeHeader}
            onChange={(checked) => updateOption('includeHeader', checked)}
          />

          <FormCheckbox
            label="Incluir rodapé"
            description="Numeração de páginas"
            checked={options.includeFooter}
            onChange={(checked) => updateOption('includeFooter', checked)}
          />

          <FormCheckbox
            label="Estatísticas resumidas"
            description="Gráficos e métricas"
            checked={options.includeStats}
            onChange={(checked) => updateOption('includeStats', checked)}
          />

          <FormCheckbox
            label="Gráficos visuais"
            description="Charts de progresso"
            checked={options.includeCharts}
            onChange={(checked) => updateOption('includeCharts', checked)}
          />
        </div>

        {/* Opções específicas para tarefas */}
        {type === 'tasks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
            <FormCheckbox
              label="Incluir comentários"
              description="Comentários das tarefas"
              checked={options.includeComments}
              onChange={(checked) => updateOption('includeComments', checked)}
            />

            <FormCheckbox
              label="Mostrar dependências"
              description="Relações entre tarefas"
              checked={options.includeDependencies}
              onChange={(checked) => updateOption('includeDependencies', checked)}
            />
          </div>
        )}
      </div>

      {/* Preview de configurações */}
      <Card className="p-4 border-dashed border-2 border-gray-300">
        <div className="text-center">
          <div className="w-16 h-20 mx-auto mb-3 bg-white border-2 border-gray-300 rounded shadow-sm relative overflow-hidden">
            {/* Simulação do documento PDF */}
            {options.includeHeader && (
              <div className="h-2 bg-blue-200 mb-1"></div>
            )}
            <div className="space-y-1 px-1">
              <div className="h-1 bg-gray-300 rounded"></div>
              <div className="h-1 bg-gray-300 rounded w-3/4"></div>
              <div className="h-1 bg-gray-300 rounded w-1/2"></div>
            </div>
            {options.includeStats && (
              <div className="absolute bottom-2 left-1 right-1 h-2 bg-green-200 rounded-sm"></div>
            )}
            {options.includeFooter && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200"></div>
            )}
          </div>
          
          <p className="text-xs text-gray-500">
            Preview do layout selecionado
          </p>
          
          <div className="mt-2 text-xs text-gray-600">
            <div>{options.orientation === 'portrait' ? 'Formato vertical' : 'Formato horizontal'}</div>
            {options.groupBy !== 'none' && (
              <div>Agrupado por {groupByOptions.find(opt => opt.value === options.groupBy)?.label.toLowerCase()}</div>
            )}
          </div>
        </div>
      </Card>

      {/* Dicas de otimização */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h5 className="text-sm font-medium text-blue-900 mb-1">
          💡 Dicas para melhor resultado
        </h5>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Use orientação paisagem para tabelas com muitas colunas</li>
          <li>• Agrupe por status para visualizar progresso por categoria</li>
          <li>• Inclua gráficos para apresentações executivas</li>
          <li>• Desative comentários para relatórios mais concisos</li>
        </ul>
      </div>
    </div>
  )
}

export default PDFExport