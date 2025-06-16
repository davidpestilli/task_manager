import React from 'react'
import { Card } from './Card'
import { cn } from '@/utils/helpers'

/**
 * Componente para exibir estatísticas em formato de card
 * 
 * Props:
 * - title: Título da estatística
 * - value: Valor principal
 * - subtitle: Subtítulo ou descrição
 * - icon: Ícone (componente React)
 * - trend: Objeto com direção e valor da tendência
 * - color: Cor do tema (blue, green, yellow, red, purple)
 * - size: Tamanho do card (sm, md, lg)
 * - loading: Estado de carregamento
 * - onClick: Função chamada ao clicar
 */
const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  size = 'md',
  loading = false,
  onClick,
  className,
  children
}) => {
  // Configurações de cor
  const colorConfig = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600 bg-blue-100',
      accent: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600 bg-green-100',
      accent: 'border-green-200'
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600 bg-yellow-100',
      accent: 'border-yellow-200'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600 bg-red-100',
      accent: 'border-red-200'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600 bg-purple-100',
      accent: 'border-purple-200'
    },
    gray: {
      bg: 'bg-gray-50',
      icon: 'text-gray-600 bg-gray-100',
      accent: 'border-gray-200'
    }
  }

  // Configurações de tamanho
  const sizeConfig = {
    sm: {
      padding: 'p-4',
      iconSize: 'w-8 h-8',
      valueSize: 'text-lg',
      titleSize: 'text-sm',
      subtitleSize: 'text-xs'
    },
    md: {
      padding: 'p-6',
      iconSize: 'w-10 h-10',
      valueSize: 'text-2xl',
      titleSize: 'text-sm',
      subtitleSize: 'text-xs'
    },
    lg: {
      padding: 'p-8',
      iconSize: 'w-12 h-12',
      valueSize: 'text-3xl',
      titleSize: 'text-base',
      subtitleSize: 'text-sm'
    }
  }

  const colors = colorConfig[color] || colorConfig.blue
  const sizes = sizeConfig[size] || sizeConfig.md

  // Renderizar trend
  const renderTrend = () => {
    if (!trend) return null

    const isPositive = trend.value > 0
    const isNegative = trend.value < 0
    const isNeutral = trend.value === 0

    const trendColor = isPositive 
      ? 'text-green-600 bg-green-100' 
      : isNegative 
      ? 'text-red-600 bg-red-100' 
      : 'text-gray-600 bg-gray-100'

    const trendIcon = isPositive ? '↗' : isNegative ? '↘' : '→'

    return (
      <div className="flex items-center space-x-1 mt-2">
        <span className={cn(
          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
          trendColor
        )}>
          {trendIcon}
          <span className="ml-1">
            {trend.value > 0 && '+'}
            {trend.value}
            {trend.suffix || ''}
          </span>
        </span>
        {trend.label && (
          <span className="text-xs text-gray-500">
            {trend.label}
          </span>
        )}
      </div>
    )
  }

  // Skeleton durante carregamento
  if (loading) {
    return (
      <Card className={cn(sizes.padding, className)}>
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
          <div className={cn(
            "bg-gray-200 rounded-lg animate-pulse flex-shrink-0",
            sizes.iconSize
          )}></div>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      className={cn(
        sizes.padding,
        colors.bg,
        colors.accent,
        "transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Título */}
          {title && (
            <p className={cn(
              "font-medium text-gray-600 mb-1",
              sizes.titleSize
            )}>
              {title}
            </p>
          )}

          {/* Valor principal */}
          {value !== undefined && (
            <p className={cn(
              "font-bold text-gray-900",
              sizes.valueSize
            )}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          )}

          {/* Subtítulo */}
          {subtitle && (
            <p className={cn(
              "text-gray-500 mt-1",
              sizes.subtitleSize
            )}>
              {subtitle}
            </p>
          )}

          {/* Trend */}
          {renderTrend()}

          {/* Conteúdo customizado */}
          {children}
        </div>

        {/* Ícone */}
        {Icon && (
          <div className={cn(
            "flex items-center justify-center rounded-lg flex-shrink-0 ml-4",
            sizes.iconSize,
            colors.icon
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  )
}

export default StatCard