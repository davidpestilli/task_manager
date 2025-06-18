import React, { useState } from 'react'
import { FileSpreadsheet, Database, Settings, Download } from 'lucide-react'

import { Card } from '@/components/shared/ui'
import { FormField, FormCheckbox, FormSelect } from '@/components/shared/forms'

/**
 * Componente de configuração para exportação CSV
 * 
 * Props:
 * - data: dados para exportar
 * - type: tipo de exportação
 * - onOptionsChange: callback quando opções mudam
 * - initialOptions: opções iniciais
 */
export const CSVExport = ({
  data,
  type = 'tasks',
  onOptionsChange,
  initialOptions = {}
}) => {
  const [options, setOptions] = useState({
    delimiter: ',',
    encoding: 'utf-8',
    includeHeaders: true,
    multipleFiles: false,
    includeSteps: false,
    includeComments: false,
    includeAssignments: true,
    includeDependencies: false,
    includeMetadata: true,
    dateFormat: 'dd/MM/yyyy HH:mm',
    emptyValue: '',
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
   * Calcula quantos arquivos serão gerados
   */
  const getFileCount = () => {
    if (!options.multipleFiles) return 1

    let count = 1 // Arquivo principal (tarefas ou projeto)
    
    if (type === 'project') {
      count = 3 // projeto, tarefas, membros
      if (options.includeSteps) count++
      if (options.includeComments) count++
    } else if (type === 'tasks') {
      if (options.includeSteps) count++
      if (options.includeComments) count++
    }

    return count
  }

  /**
   * Calcula estatísticas dos dados
   */
  const getDataStats = () => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return { 
        records: 0, 
        columns: 0, 
        estimatedSize: '0 KB',
        files: getFileCount()
      }
    }

    let records = 0
    let columns = 0

    if (Array.isArray(data)) {
      records = data.length
      columns = data.length > 0 ? Object.keys(data[0]).length : 0
    } else if (type === 'project' && data.projectData) {
      const tasks = data.tasks || []
      const members = data.members || []
      records = tasks.length + members.length + 1 // +1 para info do projeto
      columns = Math.max(
        tasks.length > 0 ? Object.keys(tasks[0]).length : 0,
        members.length > 0 ? Object.keys(members[0]).length : 0,
        5 // mínimo para info do projeto
      )
    }

    // Estimativa: ~50 bytes por célula + overhead
    const estimatedBytes = (records * columns * 50) + (records * 10)
    const estimatedSize = estimatedBytes > 1024 
      ? `${Math.ceil(estimatedBytes / 1024)} KB`
      : `${estimatedBytes} bytes`

    return {
      records,
      columns,
      estimatedSize,
      files: getFileCount()
    }
  }

  const stats = getDataStats()

  const delimiterOptions = [
    { value: ',', label: 'Vírgula (,) - Padrão' },
    { value: ';', label: 'Ponto e vírgula (;) - Excel BR' },
    { value: '\t', label: 'Tab - Para importação' },
    { value: '|', label: 'Pipe (|) - Alternativo' }
  ]

  const encodingOptions = [
    { value: 'utf-8', label: 'UTF-8 (Recomendado)' },
    { value: 'iso-8859-1', label: 'ISO-8859-1 (Latin-1)' },
    { value: 'windows-1252', label: 'Windows-1252' }
  ]

  const dateFormatOptions = [
    { value: 'dd/MM/yyyy HH:mm', label: 'DD/MM/AAAA HH:MM' },
    { value: 'yyyy-MM-dd HH:mm', label: 'AAAA-MM-DD HH:MM (ISO)' },
    { value: 'dd/MM/yyyy', label: 'DD/MM/AAAA (Apenas data)' },
    { value: 'MM/dd/yyyy', label: 'MM/DD/AAAA (US)' }
  ]

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
          <FileSpreadsheet className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Configuração CSV
          </h3>
          <p className="text-sm text-gray-500">
            Configure a exportação para planilhas
          </p>
        </div>
      </div>

      {/* Estatísticas dos dados */}
      <Card className="p-4 bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900">{stats.records}</div>
            <div className="text-gray-500">Registros</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">{stats.columns}</div>
            <div className="text-gray-500">Colunas</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">{stats.files}</div>
            <div className="text-gray-500">
              {stats.files === 1 ? 'Arquivo' : 'Arquivos'}
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">{stats.estimatedSize}</div>
            <div className="text-gray-500">Tamanho</div>
          </div>
        </div>
      </Card>

      {/* Configurações de formato */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Formato do Arquivo
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Separador de campos"
            value={options.delimiter}
            onChange={(value) => updateOption('delimiter', value)}
            options={delimiterOptions}
            helpText="Escolha baseado no software de destino"
          />

          <FormSelect
            label="Codificação"
            value={options.encoding}
            onChange={(value) => updateOption('encoding', value)}
            options={encodingOptions}
            helpText="UTF-8 preserva acentos corretamente"
          />

          <FormSelect
            label="Formato de data"
            value={options.dateFormat}
            onChange={(value) => updateOption('dateFormat', value)}
            options={dateFormatOptions}
          />

          <FormField
            label="Valor para campos vazios"
            placeholder="Deixe vazio para células vazias"
            value={options.emptyValue}
            onChange={(e) => updateOption('emptyValue', e.target.value)}
            helpText="Ex: 'N/A', '-', ou vazio"
          />
        </div>
      </div>

      {/* Configurações de estrutura */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center">
          <Database className="w-4 h-4 mr-2" />
          Estrutura dos Dados
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormCheckbox
            label="Incluir cabeçalhos"
            description="Primeira linha com nomes das colunas"
            checked={options.includeHeaders}
            onChange={(checked) => updateOption('includeHeaders', checked)}
          />

          <FormCheckbox
            label="Múltiplos arquivos"
            description="Separar por categoria (tarefas, membros, etc.)"
            checked={options.multipleFiles}
            onChange={(checked) => updateOption('multipleFiles', checked)}
          />

          <FormCheckbox
            label="Incluir metadados"
            description="IDs, datas de criação/atualização"
            checked={options.includeMetadata}
            onChange={(checked) => updateOption('includeMetadata', checked)}
          />

          <FormCheckbox
            label="Incluir atribuições"
            description="Responsáveis pelas tarefas"
            checked={options.includeAssignments}
            onChange={(checked) => updateOption('includeAssignments', checked)}
          />
        </div>

        {/* Opções específicas para tarefas */}
        {type === 'tasks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
            <FormCheckbox
              label="Incluir etapas"
              description="Arquivo separado com detalhes das etapas"
              checked={options.includeSteps}
              onChange={(checked) => updateOption('includeSteps', checked)}
              disabled={!options.multipleFiles}
            />

            <FormCheckbox
              label="Incluir comentários"
              description="Arquivo separado com comentários"
              checked={options.includeComments}
              onChange={(checked) => updateOption('includeComments', checked)}
              disabled={!options.multipleFiles}
            />

            <FormCheckbox
              label="Incluir dependências"
              description="Relações entre tarefas"
              checked={options.includeDependencies}
              onChange={(checked) => updateOption('includeDependencies', checked)}
            />
          </div>
        )}
      </div>

      {/* Preview da estrutura */}
      <Card className="p-4 border-dashed border-2 border-gray-300">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-gray-900">
              Preview da Estrutura
            </h5>
            <div className="text-xs text-gray-500">
              {options.multipleFiles ? `${stats.files} arquivos` : '1 arquivo'}
            </div>
          </div>

          {/* Simulação de tabela CSV */}
          <div className="bg-white border rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                {options.includeHeaders && (
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-1 text-left border-r">nome</th>
                      <th className="px-2 py-1 text-left border-r">status</th>
                      <th className="px-2 py-1 text-left border-r">progresso</th>
                      {options.includeAssignments && (
                        <th className="px-2 py-1 text-left border-r">responsavel</th>
                      )}
                      {options.includeMetadata && (
                        <th className="px-2 py-1 text-left">criado_em</th>
                      )}
                    </tr>
                  </thead>
                )}
                <tbody>
                  <tr className="border-t">
                    <td className="px-2 py-1 border-r">Implementar login</td>
                    <td className="px-2 py-1 border-r">Em andamento</td>
                    <td className="px-2 py-1 border-r">75%</td>
                    {options.includeAssignments && (
                      <td className="px-2 py-1 border-r">João Silva</td>
                    )}
                    {options.includeMetadata && (
                      <td className="px-2 py-1">15/01/2024 10:30</td>
                    )}
                  </tr>
                  <tr className="border-t">
                    <td className="px-2 py-1 border-r">Design interface</td>
                    <td className="px-2 py-1 border-r">Concluída</td>
                    <td className="px-2 py-1 border-r">100%</td>
                    {options.includeAssignments && (
                      <td className="px-2 py-1 border-r">Maria Santos</td>
                    )}
                    {options.includeMetadata && (
                      <td className="px-2 py-1">12/01/2024 14:15</td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Lista de arquivos que serão gerados */}
          {options.multipleFiles && (
            <div className="mt-3">
              <div className="text-xs font-medium text-gray-700 mb-2">
                Arquivos que serão gerados:
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                {type === 'project' ? (
                  <>
                    <div>• projeto_info.csv - Informações gerais</div>
                    <div>• projeto_tarefas.csv - Lista de tarefas</div>
                    <div>• projeto_membros.csv - Membros do projeto</div>
                    {options.includeSteps && <div>• projeto_etapas.csv - Etapas das tarefas</div>}
                    {options.includeComments && <div>• projeto_comentarios.csv - Comentários</div>}
                  </>
                ) : (
                  <>
                    <div>• tarefas.csv - Lista principal de tarefas</div>
                    {options.includeSteps && <div>• tarefas_etapas.csv - Detalhes das etapas</div>}
                    {options.includeComments && <div>• tarefas_comentarios.csv - Comentários</div>}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Dicas de compatibilidade */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <h5 className="text-sm font-medium text-yellow-900 mb-1">
          📊 Dicas de Compatibilidade
        </h5>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• Use vírgula para Google Sheets e aplicações internacionais</li>
          <li>• Use ponto e vírgula para Microsoft Excel (Brasil)</li>
          <li>• UTF-8 preserva acentos, mas alguns Excel antigos precisam de ISO-8859-1</li>
          <li>• Múltiplos arquivos facilitam análise específica de cada categoria</li>
        </ul>
      </div>
    </div>
  )
}

export default CSVExport