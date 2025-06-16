import { useState, useEffect, useCallback } from 'react'

/**
 * Hook para gerenciar estado com localStorage
 * 
 * Sincroniza estado React com localStorage automaticamente,
 * com suporte a valores complexos via JSON
 */
export const useLocalStorage = (key, initialValue) => {
  // Estado para armazenar valor
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Verificar se estamos no browser
      if (typeof window === 'undefined') {
        return initialValue
      }

      // Tentar buscar do localStorage
      const item = window.localStorage.getItem(key)
      
      // Retornar valor parseado ou valor inicial
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Erro ao ler localStorage key "${key}":`, error)
      return initialValue
    }
  })

  /**
   * Setter que atualiza tanto estado quanto localStorage
   * @param {any} value - Valor ou função que retorna valor
   */
  const setValue = useCallback((value) => {
    try {
      // Permitir valor ser função para sintaxe useState
      const valueToStore = value instanceof Function 
        ? value(storedValue) 
        : value

      // Salvar no estado
      setStoredValue(valueToStore)

      // Salvar no localStorage se estivermos no browser
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Erro ao salvar localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  /**
   * Remove item do localStorage
   */
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Erro ao remover localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

/**
 * Hook para gerenciar múltiplas chaves de localStorage
 * 
 * Fornece interface unificada para várias chaves
 */
export const useMultipleLocalStorage = (keys) => {
  const [values, setValues] = useState(() => {
    const initialValues = {}
    
    keys.forEach(({ key, initialValue }) => {
      try {
        if (typeof window !== 'undefined') {
          const item = window.localStorage.getItem(key)
          initialValues[key] = item ? JSON.parse(item) : initialValue
        } else {
          initialValues[key] = initialValue
        }
      } catch (error) {
        console.warn(`Erro ao ler localStorage key "${key}":`, error)
        initialValues[key] = initialValue
      }
    })
    
    return initialValues
  })

  /**
   * Atualiza valor específico
   * @param {string} key - Chave do localStorage
   * @param {any} value - Valor para armazenar
   */
  const setValue = useCallback((key, value) => {
    try {
      const valueToStore = value instanceof Function 
        ? value(values[key]) 
        : value

      setValues(prev => ({
        ...prev,
        [key]: valueToStore
      }))

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Erro ao salvar localStorage key "${key}":`, error)
    }
  }, [values])

  /**
   * Remove chave específica
   * @param {string} key - Chave para remover
   */
  const removeValue = useCallback((key) => {
    try {
      const keyConfig = keys.find(k => k.key === key)
      const initialValue = keyConfig?.initialValue

      setValues(prev => ({
        ...prev,
        [key]: initialValue
      }))

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Erro ao remover localStorage key "${key}":`, error)
    }
  }, [keys])

  /**
   * Limpa todas as chaves
   */
  const clearAll = useCallback(() => {
    try {
      const initialValues = {}
      
      keys.forEach(({ key, initialValue }) => {
        initialValues[key] = initialValue
        
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key)
        }
      })

      setValues(initialValues)
    } catch (error) {
      console.warn('Erro ao limpar localStorage:', error)
    }
  }, [keys])

  return {
    values,
    setValue,
    removeValue,
    clearAll
  }
}

/**
 * Hook para localStorage com expiração
 * 
 * Armazena valores que expiram após tempo determinado
 */
export const useLocalStorageWithExpiry = (key, initialValue, expiryTime = 24 * 60 * 60 * 1000) => {
  const [value, setValue] = useState(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue
      }

      const item = window.localStorage.getItem(key)
      
      if (!item) {
        return initialValue
      }

      const parsed = JSON.parse(item)
      
      // Verificar se expirou
      if (Date.now() > parsed.expiry) {
        window.localStorage.removeItem(key)
        return initialValue
      }

      return parsed.value
    } catch (error) {
      console.warn(`Erro ao ler localStorage com expiração key "${key}":`, error)
      return initialValue
    }
  })

  /**
   * Define valor com expiração
   * @param {any} newValue - Valor para armazenar
   */
  const setValueWithExpiry = useCallback((newValue) => {
    try {
      const valueToStore = newValue instanceof Function 
        ? newValue(value) 
        : newValue

      setValue(valueToStore)

      if (typeof window !== 'undefined') {
        const item = {
          value: valueToStore,
          expiry: Date.now() + expiryTime
        }
        
        window.localStorage.setItem(key, JSON.stringify(item))
      }
    } catch (error) {
      console.warn(`Erro ao salvar localStorage com expiração key "${key}":`, error)
    }
  }, [key, value, expiryTime])

  /**
   * Remove valor
   */
  const removeValue = useCallback(() => {
    try {
      setValue(initialValue)
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Erro ao remover localStorage com expiração key "${key}":`, error)
    }
  }, [key, initialValue])

  return [value, setValueWithExpiry, removeValue]
}

export default useLocalStorage