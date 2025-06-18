import React, { useState } from 'react'
import { Layout } from '@/components/shared/layout'
import { Breadcrumb, NavTabs } from '@/components/shared/navigation'
import { ProfilePage } from './ProfilePage'
import { WebhooksPage } from './WebhooksPage'
import { useProject } from '@/hooks/projects'
import { useParams } from 'react-router-dom'
import { 
  Settings, 
  User, 
  Webhook,
  Shield,
  Bell
} from 'lucide-react'

/**
 * Página principal de configurações
 */
export const SettingsPage = () => {
  const { projectId } = useParams()
  const { project } = useProject(projectId)
  const [activeTab, setActiveTab] = useState('profile')

  // Tabs de configuração
  const tabs = [
    {
      id: 'profile',
      label: 'Perfil',
      icon: User,
      description: 'Informações pessoais e preferências'
    },
    {
      id: 'webhooks',
      label: 'Webhooks',
      icon: Webhook,
      description: 'Integrações e notificações automáticas',
      disabled: !projectId
    },
    {
      id: 'notifications',
      label: 'Notificações',
      icon: Bell,
      description: 'Preferências de notificações',
      disabled: true // TODO: Implementar na próxima versão
    },
    {
      id: 'security',
      label: 'Segurança',
      icon: Shield,
      description: 'Configurações de segurança e privacidade',
      disabled: true // TODO: Implementar na próxima versão
    }
  ]

  // Breadcrumb dinâmico
  const breadcrumbItems = [
    { label: 'Projetos', href: '/projects' }
  ]

  if (projectId && project) {
    breadcrumbItems.push(
      { label: project.name, href: `/projects/${projectId}/people` },
      { label: 'Configurações' }
    )
  } else {
    breadcrumbItems.push({ label: 'Configurações' })
  }

  // Renderiza conteúdo da tab ativa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfilePage />
      
      case 'webhooks':
        return projectId ? <WebhooksPage projectId={projectId} /> : (
          <div className="text-center py-12">
            <Webhook className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecione um projeto
            </h3>
            <p className="text-gray-500">
              Webhooks são configurados por projeto. Acesse as configurações 
              através de um projeto específico.
            </p>
          </div>
        )
      
      case 'notifications':
        return (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Em desenvolvimento
            </h3>
            <p className="text-gray-500">
              Configurações de notificações estarão disponíveis em breve.
            </p>
          </div>
        )
      
      case 'security':
        return (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Em desenvolvimento
            </h3>
            <p className="text-gray-500">
              Configurações de segurança estarão disponíveis em breve.
            </p>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-gray-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Configurações
            </h1>
            <p className="text-gray-600">
              {projectId && project 
                ? `Configure o projeto ${project.name} e suas preferências pessoais`
                : 'Gerencie suas preferências e configurações da conta'
              }
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : tab.disabled
                    ? 'border-transparent text-gray-400 cursor-not-allowed'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon 
                  className={`
                    mr-2 h-5 w-5
                    ${activeTab === tab.id
                      ? 'text-blue-500'
                      : tab.disabled
                      ? 'text-gray-400'
                      : 'text-gray-400 group-hover:text-gray-500'
                    }
                  `}
                />
                {tab.label}
                {tab.disabled && (
                  <span className="ml-2 text-xs text-gray-400">
                    (Em breve)
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg border">
          {renderTabContent()}
        </div>
      </div>
    </Layout>
  )
}