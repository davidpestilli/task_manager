import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Settings, Bell } from 'lucide-react'
import { Layout } from '@/components/shared/layout'
import { NotificationCenter } from '@/components/shared/notifications'
import { Button } from '@/components/shared/ui'
import { Breadcrumb } from '@/components/shared/navigation'
import { useAuth } from '@/hooks/auth'

/**
 * Página principal de notificações
 */
export function NotificationsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Configuração do breadcrumb
  const breadcrumbItems = [
    {
      label: 'Projetos',
      href: '/projects'
    },
    {
      label: 'Notificações',
      href: '/notifications',
      current: true
    }
  ]

  return (
    <Layout>
      {/* Header da página */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="py-4">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          {/* Header principal */}
          <div className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Botão voltar */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/projects')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar aos Projetos
                </Button>

                <div className="h-6 border-l border-gray-300" />

                {/* Título */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Bell className="h-6 w-6" />
                    Notificações
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Gerencie todas as suas notificações em um só lugar
                  </p>
                </div>
              </div>

              {/* Ações do header */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/settings/notifications')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NotificationCenter />
      </div>
    </Layout>
  )
}

/**
 * Página simplificada de notificações (sem layout)
 */
export function SimpleNotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <NotificationCenter />
      </div>
    </div>
  )
}

/**
 * Modal de notificações (para uso em overlays)
 */
export function NotificationsModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header do modal */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </h2>
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Conteúdo do modal */}
          <div className="p-6">
            <NotificationCenter className="max-w-none" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationsPage