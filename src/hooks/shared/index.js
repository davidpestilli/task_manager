/**
 * Exports centralizados dos hooks compartilhados
 * 
 * Permite importação fácil de todos os hooks
 * utilitários do sistema
 */

// Modal hooks
export { 
  useModal, 
  useMultipleModals 
} from './useModal.js'

// LocalStorage hooks
export { 
  useLocalStorage, 
  useMultipleLocalStorage, 
  useLocalStorageWithExpiry 
} from './useLocalStorage.js'

// Debounce hooks
export { 
  useDebounce,
  useDebouncedCallback,
  useSearchDebounce,
  useDebounceWithLoading,
  useThrottle,
  useAutoSave
} from './useDebounce.js'

// Re-export padrão
export { default as useModal } from './useModal.js'
export { default as useLocalStorage } from './useLocalStorage.js'
export { default as useDebounce } from './useDebounce.js'
