import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from './useDebounce'
import { searchGlobal } from '@/services/api'
import { useAuth } from '@/hooks/auth'
import { useToast } from './useToast'
import { searchUtils } from '@/utils/helpers'

/**
 * Hook personalizado para gerenciar busca global
 * 
 * Funcionalidades:
 * - Busca em tempo real com debounce
 * - Categorização de resultados
 * - Cache de resultados
 * - Keyboard shortcuts
 * - Navegação por teclado
 */
export const useSearch = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  
  // Estados da busca
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState([])
  
  // Refs para controle de foco
  const searchInputRef = useRef(null)
  const resultsRef = useRef(null)
  
  // Debounce da query para evitar muitas requisições
  const debouncedQuery = useDebounce(query, 300)
  
  // Query do React Query para busca
  const {
    data: searchResults,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['search', debouncedQuery, selectedCategory],
    queryFn: () => searchGlobal({
      query: debouncedQuery,
      category: selectedCategory,
      limit: 15
    }),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 2, // 2 minutos
    cacheTime: 1000 * 60 * 5, // 5 minutos
    onError: (error) => {
      console.error('Erro na busca:', error)
      showToast.error('Erro ao buscar. Tente novamente.')
    }
  })

  // Processar resultados para categorização
  const categorizedResults = useCallback(() => {
    if (!searchResults) return null
    
    return searchUtils.categorizeResults(searchResults)
  }, [searchResults])

  // Abrir modal de busca
  const openSearch = useCallback(() => {
    setIsOpen(true)
    setQuery('')
    setSelectedIndex(0)
    
    // Focus no input após o modal abrir
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }, [])

  // Fechar modal de busca
  const closeSearch = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  // Executar busca
  const performSearch = useCallback((searchQuery) => {
    const trimmedQuery = searchQuery.trim()
    
    if (trimmedQuery.length < 2) {
      return
    }

    setQuery(trimmedQuery)
    
    // Adicionar à lista de buscas recentes
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== trimmedQuery)
      return [trimmedQuery, ...filtered].slice(0, 5)
    })
  }, [])

  // Limpar busca
  const clearSearch = useCallback(() => {
    setQuery('')
    setSelectedIndex(0)
  }, [])

  // Navegar pelos resultados com teclado
  const navigateResults = useCallback((direction) => {
    const results = categorizedResults()
    if (!results) return

    const totalResults = Object.values(results).reduce(
      (acc, category) => acc + category.length, 0
    )

    if (direction === 'down') {
      setSelectedIndex(prev => 
        prev < totalResults - 1 ? prev + 1 : 0
      )
    } else if (direction === 'up') {
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : totalResults - 1
      )
    }
  }, [categorizedResults])

  // Selecionar resultado atual
  const selectCurrentResult = useCallback(() => {
    const results = categorizedResults()
    if (!results) return null

    let currentIndex = 0
    for (const [category, items] of Object.entries(results)) {
      for (const item of items) {
        if (currentIndex === selectedIndex) {
          return { item, category }
        }
        currentIndex++
      }
    }
    return null
  }, [categorizedResults, selectedIndex])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + K para abrir busca
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        openSearch()
        return
      }

      // Esc para fechar busca
      if (event.key === 'Escape' && isOpen) {
        closeSearch()
        return
      }

      // Navegação por setas quando busca está aberta
      if (isOpen) {
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          navigateResults('down')
        } else if (event.key === 'ArrowUp') {
          event.preventDefault()
          navigateResults('up')
        } else if (event.key === 'Enter') {
          event.preventDefault()
          const selected = selectCurrentResult()
          if (selected) {
            // Disparar evento customizado com o item selecionado
            window.dispatchEvent(new CustomEvent('searchResultSelected', {
              detail: selected
            }))
            closeSearch()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, openSearch, closeSearch, navigateResults, selectCurrentResult])

  // Carregar buscas recentes do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('taskmanager_recent_searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.warn('Erro ao carregar buscas recentes:', error)
      }
    }
  }, [])

  // Salvar buscas recentes no localStorage
  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem(
        'taskmanager_recent_searches', 
        JSON.stringify(recentSearches)
      )
    }
  }, [recentSearches])

  // Stats da busca para debugging
  const searchStats = {
    totalResults: searchResults?.length || 0,
    categoriesCount: categorizedResults() 
      ? Object.keys(categorizedResults()).length 
      : 0,
    isSearching: isLoading && debouncedQuery.length >= 2,
    hasError: !!error
  }

  return {
    // Estados
    query,
    isOpen,
    isLoading: isLoading && debouncedQuery.length >= 2,
    error,
    selectedCategory,
    selectedIndex,
    recentSearches,
    
    // Dados
    searchResults,
    categorizedResults: categorizedResults(),
    searchStats,
    
    // Refs
    searchInputRef,
    resultsRef,
    
    // Ações
    setQuery,
    setSelectedCategory,
    openSearch,
    closeSearch,
    performSearch,
    clearSearch,
    refetch,
    navigateResults,
    selectCurrentResult,
    
    // Helpers
    hasResults: !!searchResults && searchResults.length > 0,
    shouldShowResults: debouncedQuery.length >= 2 && isOpen,
    shouldShowLoading: isLoading && debouncedQuery.length >= 2,
    shouldShowEmpty: !isLoading && debouncedQuery.length >= 2 && 
                    (!searchResults || searchResults.length === 0)
  }
}