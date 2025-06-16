import React from 'react'
import { cn } from '@/utils/helpers'

/**
 * Componente Card reutilizável com header, body e footer
 */
const Card = React.forwardRef(({
  children,
  className,
  variant = 'default',
  padding = 'default',
  shadow = 'default',
  hover = false,
  clickable = false,
  onClick,
  ...props
}, ref) => {
  // Variantes de aparência
  const variants = {
    default: 'bg-white border border-gray-200',
    outlined: 'bg-white border-2 border-gray-300',
    elevated: 'bg-white border-0',
    subtle: 'bg-gray-50 border border-gray-100'
  }

  // Variantes de padding
  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    default: 'p-6',
    lg: 'p-8'
  }

  // Variantes de sombra
  const shadows = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    default: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }

  // Classes base
  const baseClasses = cn(
    'rounded-lg transition-all duration-200',
    variants[variant],
    paddings[padding],
    shadows[shadow],
    hover && 'hover:shadow-md',
    clickable && 'cursor-pointer hover:shadow-md',
    className
  )

  const Component = clickable ? 'button' : 'div'

  return (
    <Component
      ref={ref}
      className={baseClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  )
})

/**
 * Header do Card
 */
const CardHeader = ({ children, className, divider = false, ...props }) => (
  <div 
    className={cn(
      'flex items-center justify-between',
      divider && 'border-b border-gray-200 pb-4 mb-4',
      className
    )} 
    {...props}
  >
    {children}
  </div>
)

/**
 * Título do Card
 */
const CardTitle = ({ children, className, size = 'default', ...props }) => {
  const sizes = {
    sm: 'text-lg',
    default: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <h3 
      className={cn(
        'font-semibold text-gray-900',
        sizes[size],
        className
      )} 
      {...props}
    >
      {children}
    </h3>
  )
}

/**
 * Subtítulo do Card
 */
const CardSubtitle = ({ children, className, ...props }) => (
  <p 
    className={cn('text-sm text-gray-500 mt-1', className)} 
    {...props}
  >
    {children}
  </p>
)

/**
 * Body/Conteúdo do Card
 */
const CardContent = ({ children, className, ...props }) => (
  <div 
    className={cn('text-gray-700', className)} 
    {...props}
  >
    {children}
  </div>
)

/**
 * Footer do Card
 */
const CardFooter = ({ 
  children, 
  className, 
  divider = false,
  justify = 'end',
  ...props 
}) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between'
  }

  return (
    <div 
      className={cn(
        'flex items-center gap-3',
        justifyClasses[justify],
        divider && 'border-t border-gray-200 pt-4 mt-4',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Actions do Card (botões no header)
 */
const CardActions = ({ children, className, ...props }) => (
  <div 
    className={cn('flex items-center gap-2', className)} 
    {...props}
  >
    {children}
  </div>
)

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardTitle.displayName = 'CardTitle'
CardSubtitle.displayName = 'CardSubtitle'
CardContent.displayName = 'CardContent'
CardFooter.displayName = 'CardFooter'
CardActions.displayName = 'CardActions'

// Exportar componentes
Card.Header = CardHeader
Card.Title = CardTitle
Card.Subtitle = CardSubtitle
Card.Content = CardContent
Card.Footer = CardFooter
Card.Actions = CardActions

export {
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardContent,
  CardFooter,
  CardActions
}

export default Card