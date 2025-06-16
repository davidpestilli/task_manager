import { useState, useCallback } from 'react'

/**
 * Hook para controle de estado de modais
 * 
 * Fornece funcionalidades para abrir, fechar e controlar
 * estado de modais de forma consistente
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState)
  const [data, setData] = useState(null)

  /**
   * Abre modal com dados opcionais
   * @param {any} modalData - Dados para passar para o modal
   */
  const openModal = useCallback((modalData = null) => {
    setData(modalData)
    setIsOpen(true)
  }, [])

  /**
   * Fecha modal e limpa dados
   */
  const closeModal = useCallback(() => {
    setIsOpen(false)
    setData(null)
  }, [])

  /**
   * Alterna estado do modal
   */
  const toggleModal = useCallback(() => {
    if (isOpen) {
      closeModal()
    } else {
      openModal()
    }
  }, [isOpen, openModal, closeModal])

  /**
   * Define dados do modal sem abrir
   * @param {any} modalData - Dados para definir
   */
  const setModalData = useCallback((modalData) => {
    setData(modalData)
  }, [])

  return {
    isOpen,
    data,
    openModal,
    closeModal,
    toggleModal,
    setModalData
  }
}

/**
 * Hook para controle de múltiplos modais
 * 
 * Permite gerenciar vários modais com identificadores únicos
 */
export const useMultipleModals = () => {
  const [modals, setModals] = useState({})

  /**
   * Abre modal específico
   * @param {string} modalId - ID do modal
   * @param {any} data - Dados do modal
   */
  const openModal = useCallback((modalId, data = null) => {
    setModals(prev => ({
      ...prev,
      [modalId]: {
        isOpen: true,
        data
      }
    }))
  }, [])

  /**
   * Fecha modal específico
   * @param {string} modalId - ID do modal
   */
  const closeModal = useCallback((modalId) => {
    setModals(prev => ({
      ...prev,
      [modalId]: {
        isOpen: false,
        data: null
      }
    }))
  }, [])

  /**
   * Fecha todos os modais
   */
  const closeAllModals = useCallback(() => {
    setModals({})
  }, [])

  /**
   * Verifica se modal está aberto
   * @param {string} modalId - ID do modal
   * @returns {boolean}
   */
  const isModalOpen = useCallback((modalId) => {
    return modals[modalId]?.isOpen || false
  }, [modals])

  /**
   * Obtém dados do modal
   * @param {string} modalId - ID do modal
   * @returns {any}
   */
  const getModalData = useCallback((modalId) => {
    return modals[modalId]?.data || null
  }, [modals])

  return {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
    getModalData
  }
}

export default useModal