import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Hook para debounce de valores
 * 
 * Atrasa a atualização de um valor até que tenha passado
 * um tempo específico sem mudanças
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Limpar timeout se value mudar (cleanup function)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook para debounce de callbacks
 * 
 * Cria uma versão debounced de uma função
 */
export const useDebouncedCallback = (callback, delay, deps = []) => {
  const timeoutRef = useRef(null)

  const debouncedCallback = useCallback((...args) => {
    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Criar novo timeout
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay, ...deps])

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Função para cancelar debounce pendente
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // Função para executar imediatamente
  const flush = useCallback((...args) => {
    cancel()
    callback(...args)
  }, [callback, cancel])

  return {
    debouncedCallback,
    cancel,
    flush
  }
}

/**
 * Hook para busca com debounce
 * 
 * Especializado para campos de busca
 */
export const useSearchDebounce = (searchTerm, delay = 300) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    // Se termo mudou, marcar como "buscando"
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true)
    }

    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setIsSearching(false)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm, delay, debouncedSearchTerm])

  return {
    debouncedSearchTerm,
    isSearching
  }
}

/**
 * Hook para debounce de estado com loading
 * 
 * Inclui estado de loading durante o debounce
 */
export const useDebounceWithLoading = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Se valor mudou, marcar como loading
    if (value !== debouncedValue) {
      setIsLoading(true)
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value)
      setIsLoading(false)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay, debouncedValue])

  return {
    debouncedValue,
    isLoading
  }
}

/**
 * Hook para throttle (limita frequência de execução)
 * 
 * Diferente do debounce, executa em intervalos regulares
 */
export const useThrottle = (value, limit) => {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastRunRef = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRunRef.current >= limit) {
        setThrottledValue(value)
        lastRunRef.current = Date.now()
      }
    }, limit - (Date.now() - lastRunRef.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])

  return throttledValue
}

/**
 * Hook para auto-save com debounce
 * 
 * Automatiza salvamento de dados após período de inatividade
 */
export const useAutoSave = (data, saveFunction, delay = 2000) => {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const saveRef = useRef(saveFunction)

  // Manter referência atualizada da função de save
  useEffect(() => {
    saveRef.current = saveFunction
  }, [saveFunction])

  const debouncedSave = useDebouncedCallback(
    async (dataToSave) => {
      try {
        setIsSaving(true)
        await saveRef.current(dataToSave)
        setLastSaved(new Date())
      } catch (error) {
        console.error('Erro no auto-save:', error)
        throw error
      } finally {
        setIsSaving(false)
      }
    },
    delay,
    []
  )

  // Executar save quando data mudar
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      debouncedSave.debouncedCallback(data)
    }
  }, [data, debouncedSave])

  return {
    isSaving,
    lastSaved,
    forceSave: () => debouncedSave.flush(data),
    cancelSave: debouncedSave.cancel
  }
}

export default useDebounce