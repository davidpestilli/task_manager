// SearchResults.jsximport React from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Clock, Users, CheckCircle, Calendar, ExternalLink } from 'lucide-react'
import { Card, Badge, ProgressBar, Avatar } from '@/components/shared/ui'
import { highlightUtils } from '@/utils/helpers'
import { cn } from '@/utils/helpers'

/**
 * Componente para exibir resultados de busca em formato expandido
 * Usado em páginas dedicadas de busca ou modal expandido
 */
export const SearchResults = ({ 
  results, 
  query, 
  category = 'all', 
  onItemClick,
  showMetadata = true,
  compact = false,
  className 
}) => {
  const navigate = useNavigate()

  if (!results || results.length === 0) {
    return <SearchEmptyState query={query} />
  }

  // Agrupar resultados por categoria se necessário
  const groupedResults = category === 'all' ? groupByCategory(results) : { [category]: results }

  return (
    <div className={cn('space-y-6', className)}>
      {Object.entries(groupedResults).map(([categoryKey, categoryResults]) => (
        <SearchResultsCategory
          key={categoryKey}
          category={categoryKey}
          results={categoryResults}
          query={query}
          onItemClick={onItemClick}
          showMetadata={showMetadata}
          compact={compact}
        />
      ))}
    </div>
  )
}

/**
 * Componente para uma categoria de resultados
 */
const SearchResultsCategory = ({ 
  category, 
  results, 
  query, 
  onItemClick, 
  showMetadata, 
  compact 
}) => {
  if (!results || results.length === 0) return null

  const categoryInfo = getCategoryInfo(category)

  return (
    <div className="space-y-4">
      {/* Header da categoria */}
      <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xl">{categoryInfo.icon}</span>
          <h3 className="text-lg font-semibold text-gray-900">
            {categoryInfo.label}
          </h3>
        </div>
        <Badge variant="secondary" className="ml-auto">
          {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
        </Badge>
      </div>

      {/* Lista de resultados */}
      <div className={cn(
        'grid gap-4',
        compact ? 'gap-2' : 'gap-4',
        category === 'people' && !compact ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
      )}>
        {results.map((item) => (
          <SearchResultCard
            key={`${category}-${item.id}`}
            item={item}
            category={category}
            query={query}
            onClick={onItemClick}
            showMetadata={showMetadata}
            compact={compact}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Card individual para cada resultado
 */
const SearchResultCard = ({ 
  item, 
  category, 
  query, 
  onClick, 
  showMetadata, 
  compact 
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick(item, category)
    } else {
      // Navegação padrão baseada no tipo
      const url = getItemUrl(item, category)
      if (url) navigate(url)
    }
  }

  const highlightedItem = highlightUtils.highlightSearchResult(item, query)

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:border-blue-300',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        compact ? 'p-3' : 'p-4'
      )}
      onClick={handleClick}
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
    >
      {category === 'projects' && (
        <ProjectResultCard 
          item={highlightedItem} 
          showMetadata={showMetadata} 
          compact={compact} 
        />
      )}
      
      {category === 'people' && (
        <PersonResultCard 
          item={highlightedItem} 
          showMetadata={showMetadata} 
          compact={compact} 
        />
      )}
      
      {category === 'tasks' && (
        <TaskResultCard 
          item={highlightedItem} 
          showMetadata={showMetadata} 
          compact={compact} 
        />
      )}
    </Card>
  )
}

/**
 * Card específico para projetos
 */
const ProjectResultCard = ({ item, showMetadata, compact }) => (
  <div className="space-y-3">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3 flex-1">
        <span className="text-2xl">📁</span>
        <div className="flex-1 min-w-0">
          <h4 
            className={cn(
              'font-semibold text-gray-900',
              compact ? 'text-sm' : 'text-base'
            )}
            dangerouslySetInnerHTML={{ __html: item.name_highlighted || item.name }}
          />
          {item.description && (
            <p 
              className={cn(
                'text-gray-600 mt-1',
                compact ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2'
              )}
              dangerouslySetInnerHTML={{ 
                __html: item.description_excerpt || item.description_highlighted || item.description 
              }}
            />
          )}
        </div>
      </div>
      <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
    </div>

    {showMetadata && (
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <CheckCircle className="h-4 w-4" />
          <span>{item.tasks_count || 0} tarefas</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{item.members_count || 0} membros</span>
        </div>
        {item.updated_at && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatRelativeDate(item.updated_at)}</span>
          </div>
        )}
      </div>
    )}
  </div>
)

/**
 * Card específico para pessoas
 */
const PersonResultCard = ({ item, showMetadata, compact }) => (
  <div className="space-y-3">
    <div className="flex items-start gap-3">
      <Avatar 
        src={item.avatar_url} 
        alt={item.full_name}
        size={compact ? 'sm' : 'md'}
        fallback={item.full_name?.charAt(0) || '?'}
      />
      <div className="flex-1 min-w-0">
        <h4 
          className={cn(
            'font-semibold text-gray-900',
            compact ? 'text-sm' : 'text-base'
          )}
          dangerouslySetInnerHTML={{ 
            __html: item.full_name_highlighted || item.full_name 
          }}
        />
        {item.email && (
          <p className={cn(
            'text-gray-600',
            compact ? 'text-xs' : 'text-sm'
          )}>
            {item.email}
          </p>
        )}
      </div>
      <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
    </div>

    {showMetadata && (
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <span className="text-blue-600">📁</span>
          <span>{item.projects_count || 0} projetos</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-green-600">✅</span>
          <span>{item.active_tasks_count || 0} tarefas ativas</span>
        </div>
        {item.last_activity && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Ativo {formatRelativeDate(item.last_activity)}</span>
          </div>
        )}
      </div>
    )}
  </div>
)

/**
 * Card específico para tarefas
 */
const TaskResultCard = ({ item, showMetadata, compact }) => {
  const statusConfig = getTaskStatusConfig(item.status)

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-xl mt-0.5">{statusConfig.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 
                className={cn(
                  'font-semibold text-gray-900',
                  compact ? 'text-sm' : 'text-base'
                )}
                dangerouslySetInnerHTML={{ 
                  __html: item.name_highlighted || item.name 
                }}
              />
              <Badge variant={statusConfig.variant} size="sm">
                {statusConfig.label}
              </Badge>
            </div>
            
            {item.project_name && (
              <p className={cn(
                'text-gray-600 mb-2',
                compact ? 'text-xs' : 'text-sm'
              )}>
                📁 {item.project_name}
              </p>
            )}

            {item.description && (
              <p 
                className={cn(
                  'text-gray-600',
                  compact ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2'
                )}
                dangerouslySetInnerHTML={{ 
                  __html: item.description_excerpt || item.description_highlighted || item.description 
                }}
              />
            )}
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </div>

      {showMetadata && (
        <div className="space-y-2">
          {/* Barra de progresso */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Progresso</span>
              <span className="font-medium">{item.completion_percentage || 0}%</span>
            </div>
            <ProgressBar 
              value={item.completion_percentage || 0} 
              className="h-2"
              color={statusConfig.color}
            />
          </div>

          {/* Pessoas atribuídas */}
          {item.assigned_users && item.assigned_users.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Atribuído a:</span>
              <div className="flex -space-x-2">
                {item.assigned_users.slice(0, 3).map((user, index) => (
                  <Avatar
                    key={index}
                    src={user.avatar_url}
                    alt={user.full_name}
                    size="xs"
                    fallback={user.full_name?.charAt(0) || '?'}
                    className="border-2 border-white"
                  />
                ))}
                {item.assigned_users.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                    <span className="text-xs text-gray-600">
                      +{item.assigned_users.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Datas */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {item.updated_at && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Atualizado {formatRelativeDate(item.updated_at)}</span>
              </div>
            )}
            {item.has_dependencies && (
              <div className="flex items-center gap-1">
                <span>🔗</span>
                <span>Tem dependências</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Estado vazio quando não há resultados
 */
const SearchEmptyState = ({ query }) => (
  <div className="text-center py-12">
    <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Nenhum resultado encontrado
    </h3>
    {query ? (
      <p className="text-gray-500">
        Não encontramos nada para <strong>"{query}"</strong>
      </p>
    ) : (
      <p className="text-gray-500">
        Digite algo no campo de busca para começar
      </p>
    )}
    <div className="mt-6 text-sm text-gray-400">
      <p>Dicas:</p>
      <ul className="mt-2 space-y-1">
        <li>• Verifique a ortografia</li>
        <li>• Use termos mais gerais</li>
        <li>• Tente palavras-chave diferentes</li>
      </ul>
    </div>
  </div>
)

/**
 * Funções auxiliares
 */

const groupByCategory = (results) => {
  return results.reduce((acc, item) => {
    const category = item.type || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {})
}

const getCategoryInfo = (category) => {
  const categories = {
    projects: { label: 'Projetos', icon: '📁' },
    people: { label: 'Pessoas', icon: '👤' },
    tasks: { label: 'Tarefas', icon: '📋' },
    other: { label: 'Outros', icon: '📄' }
  }
  return categories[category] || categories.other
}

const getTaskStatusConfig = (status) => {
  const configs = {
    'não_iniciada': {
      icon: '⚪',
      label: 'Não iniciada',
      variant: 'secondary',
      color: 'gray'
    },
    'em_andamento': {
      icon: '🔵',
      label: 'Em andamento',
      variant: 'primary',
      color: 'blue'
    },
    'pausada': {
      icon: '🟡',
      label: 'Pausada',
      variant: 'warning',
      color: 'yellow'
    },
    'concluída': {
      icon: '🟢',
      label: 'Concluída',
      variant: 'success',
      color: 'green'
    }
  }
  return configs[status] || configs['não_iniciada']
}

const getItemUrl = (item, category) => {
  switch (category) {
    case 'projects':
      return `/projects/${item.id}/people`
    case 'people':
      return `/people/${item.id}`
    case 'tasks':
      return `/projects/${item.project_id}/tasks/${item.id}`
    default:
      return null
  }
}

const formatRelativeDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'hoje'
  if (diffDays === 1) return 'ontem'
  if (diffDays < 7) return `há ${diffDays} dias`
  if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`
  if (diffDays < 365) return `há ${Math.floor(diffDays / 30)} meses`
  return `há ${Math.floor(diffDays / 365)} anos`
}

export default SearchResults