// src/components/shared/ui/FullPageSpinner.jsx
import React from 'react'
import Spinner from './Spinner'

export const FullPageSpinner = ({ text = 'Carregando...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Spinner size="lg" className="mx-auto mb-4" />
      <p className="text-gray-600">{text}</p>
    </div>
  </div>
)

export default FullPageSpinner