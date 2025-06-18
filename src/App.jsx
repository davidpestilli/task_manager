import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Importações de contexto e autenticação
import { AuthProvider, ProjectProvider, TaskProvider, NotificationProvider } from '@/context'
import { ProtectedRoute } from '@/components/auth'
import { LoginPage, RegisterPage, ForgotPasswordPage } from '@/pages/auth'
import { DashboardPage } from '@/pages/dashboard'
import { ProjectsPage, ProjectDetailPage } from '@/pages/projects'
import { PeoplePage, PersonDetailPage } from '@/pages/people'
import { TasksPage, TaskDetailPage } from '@/pages/tasks'
import { NotificationsPage } from '@/pages/notifications'
import { SettingsPage } from '@/pages/settings'
import { FullPageSpinner } from '@/components/shared/ui'
import { useAuth } from '@/hooks/auth'

// ← ADICIONADO: Error Boundary da Etapa 15
import ErrorBoundary from '@/components/shared/layout/ErrorBoundary'

// ← ADICIONADO: Performance monitoring
import { usePerformanceMonitor } from '@/utils/helpers/performanceUtils'

// CSS customizado
import './app.css'

// Componente de página não encontrada
const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-gray-600 mb-4">Página não encontrada</p>
      <a 
        href="/" 
        className="text-blue-600 hover:text-blue-500 font-medium"
      >
        Voltar ao início
      </a>
    </div>
  </div>
)

/**
 * Registro do Service Worker para PWA
 */
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      
      console.log('✅ Service Worker registrado:', registration.scope)
      
      // Escutar atualizações
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nova versão disponível
            console.log('🔄 Nova versão da aplicação disponível')
            
            // Você pode mostrar uma notificação aqui
            if (window.confirm('Nova versão disponível! Recarregar?')) {
              window.location.reload()
            }
          }
        })
      })
      
    } catch (error) {
      console.error('❌ Erro ao registrar Service Worker:', error)
    }
  }
}

/**
 * Componente raiz da aplicação Task Manager
 * 
 * Responsabilidades:
 * - Configuração do roteamento
 * - Configuração de notificações globais
 * - Wrapper dos providers de contexto
 * - Sistema de autenticação
 * - Proteção de rotas
 * - Error Boundary global
 * - Service Worker registration
 * - Performance monitoring
 */
function App() {
  // ← ADICIONADO: Performance monitoring
  const { measureAsync } = usePerformanceMonitor('App')
  
  // ← ADICIONADO: Registro do Service Worker
  useEffect(() => {
    registerServiceWorker()
  }, [])
  
  // ← ADICIONADO: Detectar instalação PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      // Salvar evento para uso posterior
      window.deferredPrompt = e
      console.log('📱 PWA pode ser instalado')
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  return (
    // ← ADICIONADO: Error Boundary envolvendo toda aplicação
    <ErrorBoundary>
      <AuthProvider>
        <ProjectProvider>
          <TaskProvider>
            <NotificationProvider>
              <Router basename={import.meta.env.VITE_BASE_URL || '/'}>
                <div className="App min-h-screen bg-gray-50">
                  {/* Área principal da aplicação */}
                  <main className="min-h-screen">
                    <Routes>
                      {/* Rota raiz - redireciona baseado na autenticação */}
                      <Route 
                        path="/" 
                        element={<RootRedirect />} 
                      />

                      {/* Rotas de autenticação (públicas) */}
                      <Route 
                        path="/auth/login" 
                        element={
                          <ProtectedRoute requireAuth={false}>
                            <LoginPage />
                          </ProtectedRoute>
                        } 
                      />
                      
                      <Route 
                        path="/auth/register" 
                        element={
                          <ProtectedRoute requireAuth={false}>
                            <RegisterPage />
                          </ProtectedRoute>
                        } 
                      />
                      
                      <Route 
                        path="/auth/forgot-password" 
                        element={
                          <ProtectedRoute requireAuth={false}>
                            <ForgotPasswordPage />
                          </ProtectedRoute>
                        } 
                      />

                      {/* Rotas protegidas - Dashboard */}
                      <Route 
                        path="/dashboard" 
                        element={
                          <ProtectedRoute>
                            <DashboardPage />
                          </ProtectedRoute>
                        } 
                      />

                      {/* Rotas protegidas - Projetos */}
                      <Route 
                        path="/projects" 
                        element={
                          <ProtectedRoute>
                            <ProjectsPage />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Rotas protegidas - Pessoas */}
                      <Route 
                        path="/projects/:projectId/people" 
                        element={
                          <ProtectedRoute>
                            <PeoplePage />
                          </ProtectedRoute>
                        } 
                      />
                      
                      <Route 
                        path="/projects/:projectId/people/:personId" 
                        element={
                          <ProtectedRoute>
                            <PersonDetailPage />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Rotas protegidas - Tarefas */}
                      <Route 
                        path="/projects/:projectId/tasks" 
                        element={
                          <ProtectedRoute>
                            <TasksPage />
                          </ProtectedRoute>
                        } 
                      />

                      <Route 
                        path="/projects/:projectId/tasks/:taskId" 
                        element={
                          <ProtectedRoute>
                            <TaskDetailPage />
                          </ProtectedRoute>
                        } 
                      />

                      {/* Rotas protegidas - Notificações */}
                      <Route 
                        path="/notifications" 
                        element={
                          <ProtectedRoute>
                            <NotificationsPage />
                          </ProtectedRoute>
                        } 
                      />

                      {/* Rotas protegidas - Configurações */}
                      <Route 
                        path="/settings" 
                        element={
                          <ProtectedRoute>
                            <SettingsPage />
                          </ProtectedRoute>
                        } 
                      />
                      
                      <Route 
                        path="/projects/:projectId/settings" 
                        element={
                          <ProtectedRoute>
                            <SettingsPage />
                          </ProtectedRoute>
                        } 
                      />

                      {/* ← ADICIONADO: Rota para compartilhamento PWA */}
                      <Route 
                        path="/share" 
                        element={
                          <ProtectedRoute>
                            <ShareHandler />
                          </ProtectedRoute>
                        } 
                      />

                      {/* Rota 404 */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </main>

                  {/* Sistema de notificações toast */}
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: parseInt(import.meta.env.VITE_NOTIFICATION_DURATION) || 5000,
                      style: {
                        background: '#fff',
                        color: '#374151',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                      },
                      success: {
                        iconTheme: {
                          primary: '#10b981',
                          secondary: '#fff'
                        }
                      },
                      error: {
                        iconTheme: {
                          primary: '#ef4444',
                          secondary: '#fff'
                        }
                      }
                    }}
                  />
                </div>
              </Router>
            </NotificationProvider>
          </TaskProvider>
        </ProjectProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

/**
 * Componente para redirecionar rota raiz baseado na autenticação
 */
const RootRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <FullPageSpinner text="Verificando autenticação..." />
  }

  return (
    <Navigate 
      to={isAuthenticated ? '/dashboard' : '/auth/login'} 
      replace 
    />
  )
}

/**
 * ← ADICIONADO: Componente para lidar com compartilhamento PWA
 */
const ShareHandler = () => {
  const { isAuthenticated } = useAuth()
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const title = urlParams.get('title')
    const text = urlParams.get('text')
    const url = urlParams.get('url')
    
    if (title || text || url) {
      console.log('📤 Conteúdo compartilhado:', { title, text, url })
      // Implementar lógica de compartilhamento aqui
      // Por exemplo, criar uma nova tarefa com o conteúdo
    }
  }, [])
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }
  
  return <Navigate to="/dashboard" replace />
}

export default App