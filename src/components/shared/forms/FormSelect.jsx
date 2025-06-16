import React from 'react'
import { FormField } from './FormField'

/**
 * Componente select para formulários
 * Wrapper para select com estilos consistentes
 */
export const FormSelect = ({
  options = [],
  placeholder = 'Selecione uma opção',
  error,
  className = '',
  multiple = false,
  allowEmpty = true,
  emptyLabel = 'Selecione...',
  ...props
}) => {
  const selectClassName = `
    w-full px-3 py-2 border rounded-lg shadow-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error ? 'border-red-300 text-red-900' : 'border-gray-300 text-gray-900'}
    ${className}
  `

  return (
    <FormField error={error} {...props}>
      <select
        className={selectClassName}
        multiple={multiple}
        {...props}
      >
        {/* Opção vazia */}
        {allowEmpty && !multiple && (
          <option value="" disabled={!!props.required}>
            {emptyLabel}
          </option>
        )}

        {/* Renderizar opções */}
        {options.map((option, index) => {
          // Suporte para arrays simples ou objetos
          const value = typeof option === 'object' ? option.value : option
          const label = typeof option === 'object' ? option.label : option
          const disabled = typeof option === 'object' ? option.disabled : false

          return (
            <option 
              key={`${value}-${index}`} 
              value={value}
              disabled={disabled}
            >
              {label}
            </option>
          )
        })}
      </select>
    </FormField>
  )
}

// Variações do componente para casos específicos
export const RoleSelect = ({ value, onChange, ...props }) => {
  const roleOptions = [
    { value: 'member', label: 'Membro' },
    { value: 'admin', label: 'Administrador' },
    { value: 'owner', label: 'Proprietário' }
  ]

  return (
    <FormSelect
      options={roleOptions}
      value={value}
      onChange={onChange}
      emptyLabel="Selecionar função..."
      {...props}
    />
  )
}

export const StatusSelect = ({ value, onChange, ...props }) => {
  const statusOptions = [
    { value: 'não_iniciada', label: 'Não Iniciada' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'pausada', label: 'Pausada' },
    { value: 'concluída', label: 'Concluída' }
  ]

  return (
    <FormSelect
      options={statusOptions}
      value={value}
      onChange={onChange}
      emptyLabel="Selecionar status..."
      {...props}
    />
  )
}

export default FormSelect