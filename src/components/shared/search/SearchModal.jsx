import React, { useEffect, useRef } from 'react'
import { X, Search, Filter, Command } from 'lucide-react'
import { Modal, Input, Button, Dropdown, Badge } from '@/components/shared/ui'
import { SearchResults } from './SearchResults'
import { useSearch } from '@/hooks/shared'
import { cn } from '@/utils/helpers'

/**
 * Modal expandido para busca avançada
 * 
 * Funcionalidades:
 * - Busca expandida com mais filtros
 * - Visualização completa dos resultados
 * - Filtros por categoria
 * - Histórico de buscas
 * - Keyboard navigation
 */
export const SearchModal = ({ 
  isOpen, 
  onClose, 
  initialQuery = '', 
  initialCategory = 'all',
  className 
}) => {
  const {
    query,
    isLoading,
    categorizedResults,
    selectedCategory,
    recentSearches,
    searchStats,
    searchInputRef,
    setQuery,
    setSelectedCategory,
    performSearch,
    clearSearch
  } = useSearch()

  const modalRef = useRef(null)

  // Inicializar busca com valores passados
  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        setQuery(initialQuery)
        performSearch(initialQuery)
      }
      if (initialCategory) {
        setSelectedCategory(initialCategory)
      }
      
      // Focus no input após modal abrir
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, initialQuery, initialCategory])

  // Fechar modal com Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    
    if (value.trim().length >= 2) {
      performSearch(value)
    }
  }

  const handleClearSearch = () => {
    clearSearch()
    searchInputRef.current?.focus()
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    if (query.trim().length >= 2) {
      performSearch(query)
    }
  }

  const handleRecentSearchClick = (search) => {
    setQuery(search)
    performSearch(search)
  }

  const handleItemClick = (item, category) => {
    // Fechar modal após seleção
    onClose()
    
    // Disparar evento customizado
    window.dispatchEvent(new CustomEvent('searchResultSelected', {
      detail: { item, category }
    }))
  }

  // Preparar resultados para exibição
  const allResults = categorizedResults ? 
    Object.values(categorizedResults).flat() : []

  const filteredResults = selectedCategory === 'all' ? 
    allResults : 
    (categorizedResults?.[selectedCategory] || [])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      className={className}
    >
      <div 
        ref={modalRef}
        className="flex flex-col h-[80vh] max-h-[600px]"
      >
        {/* Header do Modal */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Busca Global
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Barra de Busca */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            
            <Input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Buscar projetos, pessoas ou tarefas..."
              className="pl-10 pr-10 py-3 text-base"
              autoComplete="off"
              spellCheck="false"
            />

            {query && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {isLoading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
              </div>
            )}
          </div>

          {/* Filtros e Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Filtro por categoria */}
              <Dropdown
                trigger={
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    {getCategoryLabel(selectedCategory)}
                  </Button>
                }
              >
                <div className="py-1">
                  <DropdownItem
                    onClick={() => handleCategoryChange('all')}
                    active={selectedCategory === 'all'}
                  >
                    Todos os tipos
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => handleCategoryChange('projects')}
                    active={selectedCategory === 'projects'}
                  >
                    📁 Projetos
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => handleCategoryChange('people')}
                    active={selectedCategory === 'people'}
                  >
                    👤 Pessoas
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => handleCategoryChange('tasks')}
                    active={selectedCategory === 'tasks'}
                  >
                    📋 Tarefas
                  </DropdownItem>
                </div>
              </Dropdown>

              {/* Indicador de keyboard shortcut */}
              <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs">
                  <Command className="h-3 w-3 inline mr-1" />
                  K
                </kbd>
                <span>para busca rápida</span>
              </div>
            </div>

            {/* Stats dos resultados */}
            {query && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {isLoading ? (
                  <span>Buscando...</span>
                ) : (
                  <span>
                    {filteredResults.length} resultado{filteredResults.length !== 1 ? 's' : ''}
                    {query && ` para "${query}"`}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo do Modal */}
        <div className="flex-1 overflow-hidden">
          {!query.trim() ? (
            <SearchEmptyContent 
              recentSearches={recentSearches}
              onRecentSearchClick={handleRecentSearchClick}
            />
          ) : (
            <div className="h-full overflow-y-auto p-6">
              <SearchResults
                results={filteredResults}
                query={query}
                category={selectedCategory}
                onItemClick={handleItemClick}
                showMetadata={true}
                compact={false}
              />
            </div>
          )}
        </div>

        {/* Footer do Modal */}
        {query && (
          <div className="flex-shrink-0 px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>
                  {searchStats.totalResults} resultados totais
                </span>
                {searchStats.categoriesCount > 1 && (
                  <span>
                    em {searchStats.categoriesCount} categorias
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-xs">
                  Enter
                </kbd>
                <span>para selecionar</span>
                <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-xs">
                  Esc
                </kbd>
                <span>para fechar</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

/**
 * Conteúdo quando não há busca ativa
 */
const SearchEmptyContent = ({ recentSearches, onRecentSearchClick }) => (
  <div className="p-6 h-full">
    <div className="text-center py-8">
      <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Busque por qualquer coisa
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Encontre projetos, pessoas e tarefas rapidamente. 
        Digite pelo menos 2 caracteres para começar.
      </p>
      
      {/* Exemplos de busca */}
      <div className="max-w-sm mx-auto">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Exemplos de busca:
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <span>📁</span>
            <span>"website" - buscar projetos</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span>👤</span>
            <span>"joão" - buscar pessoas</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span>📋</span>
            <span>"login" - buscar tarefas</span>
          </div>
        </div>
      </div>
    </div>

    {/* Buscas recentes */}
    {recentSearches.length > 0 && (
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Buscas recentes
        </h4>
        <div className="space-y-1">
          {recentSearches.slice(0, 5).map((search, index) => (
            <button
              key={index}
              onClick={() => onRecentSearchClick(search)}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Search className="h-4 w-4 text-gray-400" />
              <span>{search}</span>
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
)

/**
 * Item do dropdown de filtros
 */
const DropdownItem = ({ children, onClick, active, className }) => (
  <button
    onClick={onClick}
    className={cn(
      'w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors',
      active && 'bg-blue-50 text-blue-700',
      className
    )}
  >
    {children}
  </button>
)

/**
 * Funções auxiliares
 */

const getCategoryLabel = (category) => {
  const labels = {
    'all': 'Todos',
    'projects': 'Projetos',
    'people': 'Pessoas',
    'tasks': 'Tarefas'
  }
  return labels[category] || 'Todos'
}

export default SearchModal