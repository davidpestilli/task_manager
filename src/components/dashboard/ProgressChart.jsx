import React from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/shared/ui'
import { cn } from '@/utils/helpers'

/**
 * Componente para exibir gráficos de progresso no dashboard
 * 
 * Suporta tipos:
 * - bar: Gráfico de barras
 * - pie: Gráfico de pizza
 * 
 * Props:
 * - type: Tipo do gráfico ('bar' | 'pie')
 * - data: Dados para o gráfico
 * - title: Título do gráfico
 * - loading: Estado de carregamento
 * - height: Altura do gráfico (padrão: 300)
 * - colors: Array de cores customizadas
 */
const ProgressChart = ({
  type = 'bar',
  data = [],
  title,
  loading = false,
  height = 300,
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
  className
}) => {
  // Skeleton durante carregamento
  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        {title && (
          <div className="mb-4">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3"></div>
          </div>
        )}
        <div 
          className="bg-gray-200 rounded animate-pulse"
          style={{ height: `${height}px` }}
        ></div>
      </Card>
    )
  }

  // Se não há dados, mostrar estado vazio
  if (!data || data.length === 0) {
    return (
      <Card className={cn("p-6", className)}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {title}
          </h3>
        )}
        <div 
          className="flex items-center justify-center text-gray-500"
          style={{ height: `${height}px` }}
        >
          <div className="text-center">
            <p className="text-sm">Nenhum dado disponível</p>
          </div>
        </div>
      </Card>
    )
  }

  // Componente de tooltip customizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          {label && (
            <p className="font-medium text-gray-900 mb-1">{label}</p>
          )}
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Renderizar gráfico de barras
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis 
          dataKey="day" 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="completed" 
          fill={colors[0]} 
          radius={[4, 4, 0, 0]}
          name="Tarefas Concluídas"
        />
      </BarChart>
    </ResponsiveContainer>
  )

  // Renderizar gráfico de pizza
  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value, percent }) => 
            value > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : null
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color || colors[index % colors.length]} 
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  )

  return (
    <Card className={cn("p-6", className)}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h3>
      )}
      
      <div className="w-full">
        {type === 'bar' && renderBarChart()}
        {type === 'pie' && renderPieChart()}
      </div>
    </Card>
  )
}

export default ProgressChart