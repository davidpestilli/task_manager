import React from 'react'

/**
 * Componente Skeleton para estados de loading
 * 
 * Fornece placeholders animados enquanto o conteúdo
 * está carregando, mantendo o layout consistente
 */
const Skeleton = ({
  className = '',
  width,
  height,
  rounded = 'rounded',
  animated = true,
  ...props
}) => {
  const baseClasses = `
    bg-gray-200 
    ${animated ? 'animate-pulse' : ''}
    ${rounded}
    ${className}
  `

  const style = {
    ...(width && { width }),
    ...(height && { height })
  }

  return (
    <div
      className={baseClasses}
      style={style}
      {...props}
    />
  )
}

/**
 * Skeleton de texto com múltiplas linhas
 */
export const TextSkeleton = ({
  lines = 3,
  lastLineWidth = '75%',
  className = '',
  spacing = 'space-y-2',
  ...props
}) => (
  <div className={`${spacing} ${className}`} {...props}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        className="h-4"
        width={index === lines - 1 ? lastLineWidth : '100%'}
      />
    ))}
  </div>
)

/**
 * Skeleton de card padrão
 */
export const CardSkeleton = ({
  showAvatar = false,
  showImage = false,
  textLines = 3,
  className = '',
  ...props
}) => (
  <div className={`p-6 bg-white border border-gray-200 rounded-lg ${className}`} {...props}>
    {/* Header com avatar */}
    {showAvatar && (
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton className="w-10 h-10" rounded="rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4" width="60%" />
          <Skeleton className="h-3" width="40%" />
        </div>
      </div>
    )}

    {/* Imagem */}
    {showImage && (
      <Skeleton className="w-full h-48 mb-4" />
    )}

    {/* Texto */}
    <TextSkeleton lines={textLines} />
  </div>
)

/**
 * Skeleton de lista
 */
export const ListSkeleton = ({
  items = 5,
  showAvatar = true,
  className = '',
  ...props
}) => (
  <div className={`space-y-3 ${className}`} {...props}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-3 p-3">
        {showAvatar && (
          <Skeleton className="w-8 h-8" rounded="rounded-full" />
        )}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4" width="80%" />
          <Skeleton className="h-3" width="60%" />
        </div>
      </div>
    ))}
  </div>
)

/**
 * Skeleton de tabela
 */
export const TableSkeleton = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  className = '',
  ...props
}) => (
  <div className={`w-full ${className}`} {...props}>
    {/* Header */}
    {showHeader && (
      <div className="grid gap-4 p-4 border-b border-gray-200" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-4" width="70%" />
        ))}
      </div>
    )}

    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4 p-4 border-b border-gray-100" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4" width={`${60 + Math.random() * 30}%`} />
        ))}
      </div>
    ))}
  </div>
)

/**
 * Skeleton de avatar com informações
 */
export const AvatarSkeleton = ({ 
  size = 'medium',
  showInfo = true,
  infoLines = 2,
  className = '',
  ...props 
}) => {
  const sizes = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`} {...props}>
      <Skeleton className={sizes[size]} rounded="rounded-full" />
      
      {showInfo && (
        <div className="flex-1 space-y-1">
          {Array.from({ length: infoLines }).map((_, index) => (
            <Skeleton 
              key={index} 
              className="h-3" 
              width={index === 0 ? '60%' : '40%'} 
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Skeleton de botão
 */
export const ButtonSkeleton = ({
  size = 'medium',
  width = 'auto',
  className = '',
  ...props
}) => {
  const sizes = {
    small: 'h-8 px-3',
    medium: 'h-10 px-4',
    large: 'h-12 px-6'
  }

  return (
    <Skeleton
      className={`${sizes[size]} ${className}`}
      width={width}
      rounded="rounded-lg"
      {...props}
    />
  )
}

/**
 * Skeleton de progresso (barra)
 */
export const ProgressSkeleton = ({
  height = 'h-2',
  className = '',
  ...props
}) => (
  <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${className}`} {...props}>
    <Skeleton 
      className={`${height} bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200`}
      width="60%"
      rounded="rounded-full"
    />
  </div>
)

/**
 * Skeleton de estatísticas/métricas
 */
export const StatsSkeleton = ({
  items = 4,
  className = '',
  ...props
}) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(items, 4)} gap-4 ${className}`} {...props}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="p-6 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4" width="50%" />
          <Skeleton className="w-6 h-6" rounded="rounded" />
        </div>
        <Skeleton className="h-8 mb-2" width="40%" />
        <Skeleton className="h-3" width="60%" />
      </div>
    ))}
  </div>
)

/**
 * Skeleton de gráfico
 */
export const ChartSkeleton = ({
  type = 'bar', // bar, line, pie
  height = 'h-64',
  className = '',
  ...props
}) => {
  const renderBarChart = () => (
    <div className="flex items-end justify-around h-full space-x-2">
      {Array.from({ length: 7 }).map((_, index) => (
        <Skeleton
          key={index}
          className="w-8"
          height={`${30 + Math.random() * 70}%`}
        />
      ))}
    </div>
  )

  const renderLineChart = () => (
    <div className="relative h-full">
      <svg className="w-full h-full" viewBox="0 0 300 200">
        <defs>
          <linearGradient id="pulse" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e5e7eb" />
            <stop offset="50%" stopColor="#d1d5db" />
            <stop offset="100%" stopColor="#e5e7eb" />
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              values="-300 0;300 0;-300 0"
              dur="2s"
              repeatCount="indefinite"
            />
          </linearGradient>
        </defs>
        <path
          d="M20,150 Q80,50 150,100 T280,80"
          stroke="url(#pulse)"
          strokeWidth="3"
          fill="none"
        />
      </svg>
    </div>
  )

  const renderPieChart = () => (
    <div className="flex items-center justify-center h-full">
      <Skeleton className="w-32 h-32" rounded="rounded-full" />
    </div>
  )

  return (
    <div className={`${height} p-4 bg-white border border-gray-200 rounded-lg ${className}`} {...props}>
      {type === 'bar' && renderBarChart()}
      {type === 'line' && renderLineChart()}
      {type === 'pie' && renderPieChart()}
    </div>
  )
}

/**
 * Skeleton de página completa
 */
export const PageSkeleton = ({
  showHeader = true,
  showSidebar = false,
  contentBlocks = 3,
  className = '',
  ...props
}) => (
  <div className={`min-h-screen bg-gray-50 ${className}`} {...props}>
    {/* Header */}
    {showHeader && (
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8" width="200px" />
          <div className="flex items-center space-x-3">
            <Skeleton className="w-8 h-8" rounded="rounded-full" />
            <Skeleton className="w-8 h-8" rounded="rounded-full" />
          </div>
        </div>
      </div>
    )}

    <div className="flex">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="h-4" width="80%" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 p-6">
        {Array.from({ length: contentBlocks }).map((_, index) => (
          <div key={index} className="mb-8">
            <Skeleton className="h-6 mb-4" width="30%" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, cardIndex) => (
                <CardSkeleton key={cardIndex} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default Skeleton