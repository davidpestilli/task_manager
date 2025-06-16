import React, { useEffect, useRef } from 'react'
import { Search, Command, X } from 'lucide-react'
import { Input } from '@/components/shared/ui'
import { useSearch } from '@/hooks/shared'
import { cn } from '@/utils/helpers'

/**
 * Componente de busca global que aparece no header
 * 
 * Funcionalidades:
 * - Busca em tempo real
 * - Keyboard shortcuts (Ctrl+K)
 * - Dropdown com resultados
 * - Navegação por teclado
 */
export const SearchGlobal = ({ className, placeholder, ...props }) => {
  const {
    query,
    isOpen,
    isLoading,
    shouldShowResults,
    searchInputRef,
    setQuery,
    openSearch,
    closeSearch,
    performSearch
  } = useSearch()

  const containerRef = useRef(null)

  // Fechar busca ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeSearch()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, closeSearch])

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    
    if (value.trim().length >= 2) {
      performSearch(value)
    }
  }

  const handleInputFocus = () => {
    if (!isOpen) {
      openSearch()
    }
  }

  const handleClearSearch = () => {
    setQuery('')
    searchInputRef.current?.focus()
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative max-w-md w-full',
        className
      )}
      {...props}
    >
      {/* Input de busca */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        
        <Input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder || "Buscar projetos, pessoas ou tarefas..."}
          className={cn(
            'pl-10 pr-10 py-2',
            'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'transition-shadow duration-200'
          )}
          autoComplete="off"
          spellCheck="false"
        />

        {/* Ícone de comando para indicar shortcut */}
        {!isOpen && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-gray-100 text-gray-500 border border-gray-200 rounded">
              <Command className="h-3 w-3" />
              K
            </kbd>
          </div>
        )}

        {/* Botão para limpar busca */}
        {query && isOpen && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Indicador de loading */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
          </div>
        )}
      </div>

      {/* Resultados da busca */}
      {shouldShowResults && (
        <SearchResultsDropdown />
      )}
    </div>
  )
}

/**
 * Componente interno para dropdown de resultados
 */
const SearchResultsDropdown = () => {
  const {
    query,
    categorizedResults,
    isLoading,
    shouldShowEmpty,
    selectedIndex,
    recentSearches
  } = useSearch()

  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <div className="p-4 text-center text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto mb-2" />
          Buscando...
        </div>
      </div>
    )
  }

  if (shouldShowEmpty) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <div className="p-4 text-center text-gray-500">
          <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Nenhum resultado encontrado para "{query}"</p>
          <p className="text-xs text-gray-400 mt-1">
            Tente outros termos ou verifique a ortografia
          </p>
        </div>
      </div>
    )
  }

  // Se não há query mas está aberto, mostrar buscas recentes
  if (!query.trim() && recentSearches.length > 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <div className="p-3 border-b border-gray-100">
          <h4 className="text-sm font-medium text-gray-700">Buscas recentes</h4>
        </div>
        <div className="py-2">
          {recentSearches.slice(0, 5).map((search, index) => (
            <RecentSearchItem 
              key={index}
              search={search}
              isSelected={index === selectedIndex}
            />
          ))}
        </div>
      </div>
    )
  }

  if (!categorizedResults || Object.keys(categorizedResults).length === 0) {
    return null
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <SearchCategorizedResults 
        results={categorizedResults}
        query={query}
        selectedIndex={selectedIndex}
      />
    </div>
  )
}

/**
 * Componente para item de busca recente
 */
const RecentSearchItem = ({ search, isSelected }) => {
  const { performSearch, closeSearch } = useSearch()

  const handleClick = () => {
    performSearch(search)
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2',
        isSelected && 'bg-blue-50 text-blue-700'
      )}
    >
      <Search className="h-4 w-4 text-gray-400" />
      <span>{search}</span>
    </button>
  )
}

/**
 * Componente para resultados categorizados
 */
const SearchCategorizedResults = ({ results, query, selectedIndex }) => {
  let currentIndex = 0

  return (
    <div className="py-2">
      {Object.entries(results).map(([category, items]) => {
        if (!items || items.length === 0) return null

        const categoryInfo = getCategoryInfo(category)
        const categoryItems = items.slice(0, 5) // Máximo 5 por categoria

        const section = (
          <div key={category} className="mb-2 last:mb-0">
            {/* Header da categoria */}
            <div className="px-4 py-2 border-b border-gray-100">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <span className="text-sm">{categoryInfo.icon}</span>
                {categoryInfo.label} ({items.length})
              </h4>
            </div>

            {/* Items da categoria */}
            <div>
              {categoryItems.map((item, itemIndex) => {
                const isSelected = currentIndex === selectedIndex
                currentIndex++
                
                return (
                  <SearchResultItem
                    key={item.id}
                    item={item}
                    query={query}
                    isSelected={isSelected}
                    category={category}
                  />
                )
              })}
            </div>

            {/* Link para ver mais */}
            {items.length > 5 && (
              <div className="px-4 py-2 border-t border-gray-100">
                <button className="text-xs text-blue-600 hover:text-blue-700">
                  Ver mais {items.length - 5} {categoryInfo.label.toLowerCase()}
                </button>
              </div>
            )}
          </div>
        )

        return section
      })}
    </div>
  )
}

/**
 * Componente para item individual de resultado
 */
const SearchResultItem = ({ item, query, isSelected, category }) => {
  const { closeSearch } = useSearch()

  const handleClick = () => {
    // Disparar evento de seleção
    window.dispatchEvent(new CustomEvent('searchResultSelected', {
      detail: { item, category }
    }))
    closeSearch()
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors',
        'flex items-start gap-3',
        isSelected && 'bg-blue-50'
      )}
    >
      {/* Ícone do item */}
      <div className="flex-shrink-0 mt-0.5">
        <span className="text-lg">{getItemIcon(item, category)}</span>
      </div>

      {/* Conteúdo do item */}
      <div className="flex-1 min-w-0">
        <div 
          className="text-sm font-medium text-gray-900 truncate"
          dangerouslySetInnerHTML={{ 
            __html: highlightText(item.name || item.full_name || 'Sem título', query)
          }}
        />
        
        {item.description && (
          <div 
            className="text-xs text-gray-500 mt-1 line-clamp-2"
            dangerouslySetInnerHTML={{ 
              __html: highlightText(item.description, query)
            }}
          />
        )}

        {/* Metadados específicos por tipo */}
        <div className="text-xs text-gray-400 mt-1">
          {getItemMetadata(item, category)}
        </div>
      </div>
    </button>
  )
}

/**
 * Funções auxiliares
 */

const getCategoryInfo = (category) => {
  const categories = {
    projects: { label: 'Projetos', icon: '📁' },
    people: { label: 'Pessoas', icon: '👤' },
    tasks: { label: 'Tarefas', icon: '📋' }
  }
  return categories[category] || { label: 'Outros', icon: '📄' }
}

const getItemIcon = (item, category) => {
  if (category === 'tasks' && item.status) {
    const statusIcons = {
      'não_iniciada': '⚪',
      'em_andamento': '🔵',
      'pausada': '🟡',
      'concluída': '🟢'
    }
    return statusIcons[item.status] || '📋'
  }

  const categoryIcons = {
    projects: '📁',
    people: '👤',
    tasks: '📋'
  }
  return categoryIcons[category] || '📄'
}

const getItemMetadata = (item, category) => {
  switch (category) {
    case 'projects':
      return `${item.tasks_count || 0} tarefas • ${item.members_count || 0} membros`
    
    case 'people':
      return `${item.projects_count || 0} projetos • ${item.active_tasks_count || 0} tarefas ativas`
    
    case 'tasks':
      return `${item.project_name} • ${item.completion_percentage || 0}% concluído`
    
    default:
      return ''
  }
}

// Helper para highlight (importar do highlightUtils)
const highlightText = (text, query) => {
  if (!text || !query) return text
  
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">$1</mark>')
}

export default SearchGlobal