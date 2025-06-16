import React from 'react'
import { Card } from '@/components/shared/ui'
import { cn } from '@/utils/helpers'

/**
 * Componente para exibir uma métrica individual no dashboard
 * 
 * Props:
 * - title: Título da métrica
 * - value: Valor principal da métrica
 * - trend: Objeto com valor e direção da tendência
 * - icon: Ícone para exibir (componente React)
 * - suffix: Sufixo para o valor (%, tarefas, etc.)
 * - color: Cor do tema (blue, green, yellow, red)
 * - loading: Estado de carregamento
 * - onClick: Função chamada ao clicar no card
 */
const MetricCard = ({
  title,
  value,
  trend,
  icon: Icon,
  suffix = '',
  color = 'blue',
  loading = false,
  onClick,
  className
}) => {
  // Cores por tema
  const colorClasses = {
    blue: {
      icon: 'text-blue-600 bg-blue-100',
      trend: {
        positive: 'text-green-600 bg-green-100',
        negative: 'text-red-600 bg-red-100',
        neutral: 'text-gray-600 bg-gray-100'
      }
    },
    green: {
      icon: 'text-green-600 bg-green-100',
      trend: {
        positive: 'text-green-600 bg-green-100',
        negative: 'text-red-600 bg-red-100',
        neutral: 'text-gray-600 bg-gray-100'
      }
    },
    yellow: {
      icon: 'text-yellow-600 bg-yellow-100',
      trend: {
        positive: 'text-green-600 bg-green-100',
        negative: 'text-red-600 bg-red-100',
        neutral: 'text-gray-600 bg-gray-100'
      }
    },
    red: {
      icon: 'text-red-600 bg-red-100',
      trend: {
        positive: 'text-green-600 bg-green-100',
        negative: 'text-red-600 bg-red-100',
        neutral: 'text-gray-600 bg-gray-100'
      }
    }
  }

  // Determinar direção da tendência
  const getTrendDirection = (trendValue) => {
    if (!trendValue || trendValue === 0) return 'neutral'
    return trendValue > 0 ? 'positive' : 'negative'
  }

  const trendDirection = getTrendDirection(trend?.value)
  const trendClasses = colorClasses[color]?.trend[trendDirection] || colorClasses.blue.trend.neutral

  // Skeleton durante carregamento
  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      className={cn(
        "p-6 transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-lg hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          {/* Título */}
          <p className="text-sm font-medium text-gray-600">
            {title}
          </p>

          {/* Valor principal */}
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {suffix && (
              <span className="text-sm font-medium text-gray-500">
                {suffix}
              </span>
            )}
          </div>

          {/* Tendência */}
          {trend && (
            <div className="flex items-center space-x-1">
              <span className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                trendClasses
              )}>
                {trendDirection === 'positive' && '↗'}
                {trendDirection === 'negative' && '↘'}
                {trendDirection === 'neutral' && '→'}
                <span className="ml-1">
                  {trend.value > 0 && '+'}
                  {trend.value}
                  {trend.suffix || ''}
                </span>
              </span>
              <span className="text-xs text-gray-500">
                {trend.period || 'vs período anterior'}
              </span>
            </div>
          )}
        </div>

        {/* Ícone */}
        {Icon && (
          <div className={cn(
            "flex items-center justify-center w-12 h-12 rounded-lg",
            colorClasses[color]?.icon || colorClasses.blue.icon
          )}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  )
}

export default MetricCard