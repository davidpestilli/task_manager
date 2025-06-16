import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Importações de contexto e autenticação
import { AuthProvider, ProjectProvider } from '@/context'
import { ProtectedRoute } from '@/components/auth'
import { LoginPage, RegisterPage, ForgotPasswordPage } from '@/pages/auth'
import { ProjectsPage, ProjectDetailPage } from '@/pages/projects'
import { PeoplePage, PersonDetailPage } from '@/pages/people'
import { FullPageSpinner } from '@/components/shared/ui'
import { useAuth } from '@/hooks/auth'

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
 * Componente raiz da aplicação Task Manager
 * 
 * Responsabilidades:
 * - Configuração do roteamento
 * - Configuração de notificações globais
 * - Wrapper dos providers de contexto
 * - Sistema de autenticação
 * - Proteção de rotas
 */
function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
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
                
                {/* Rotas protegidas - Tarefas (para próxima etapa) */}
                <Route 
                  path="/projects/:projectId/tasks" 
                  element={
                    <ProtectedRoute>
                      <ProjectDetailPage />
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
      </ProjectProvider>
    </AuthProvider>
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
      to={isAuthenticated ? '/projects' : '/auth/login'} 
      replace 
    />
  )
}

export default App