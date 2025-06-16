import React from 'react'
import { Link } from 'react-router-dom'
import { APP_CONFIG } from '@/config/constants'

/**
 * Componente Footer da aplicação
 * 
 * Fornece rodapé com informações da aplicação,
 * links úteis e informações de copyright
 */
const Footer = ({
  variant = 'default', // default, minimal, detailed
  className = '',
  showLinks = true,
  showCopyright = true,
  showVersion = true,
  ...props
}) => {
  const currentYear = new Date().getFullYear()

  if (variant === 'minimal') {
    return (
      <footer className={`py-4 text-center text-sm text-gray-500 ${className}`} {...props}>
        {showCopyright && (
          <p>© {currentYear} {APP_CONFIG.name}. Todos os direitos reservados.</p>
        )}
      </footer>
    )
  }

  if (variant === 'detailed') {
    return (
      <footer className={`bg-gray-50 border-t border-gray-200 ${className}`} {...props}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sobre */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Sobre o {APP_CONFIG.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Sistema colaborativo de gerenciamento de tarefas focado na visualização 
                do progresso e colaboração em tempo real.
              </p>
              {showVersion && (
                <p className="text-xs text-gray-500">
                  Versão {APP_CONFIG.version || '1.0.0'}
                </p>
              )}
            </div>

            {/* Links Úteis */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Links Úteis
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/dashboard" 
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/projects" 
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Projetos
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/settings" 
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Configurações
                  </Link>
                </li>
              </ul>
            </div>

            {/* Suporte */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Suporte
              </h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="mailto:support@taskmanager.com" 
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Contato
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Documentação
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Status do Sistema
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <a 
                    href="#" 
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Política de Privacidade
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Linha de copyright */}
          <div className="border-t border-gray-200 mt-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-500">
                © {currentYear} {APP_CONFIG.name}. Todos os direitos reservados.
              </p>
              
              {/* Links sociais ou adicionais */}
              <div className="flex space-x-4 mt-4 md:mt-0">
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-gray-500"
                  aria-label="GitHub"
                >
                  <GitHubIcon className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-gray-500"
                  aria-label="Twitter"
                >
                  <TwitterIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  // Variant default
  return (
    <footer className={`bg-white border-t border-gray-200 px-4 py-6 ${className}`} {...props}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright */}
          {showCopyright && (
            <div className="text-sm text-gray-500">
              © {currentYear} {APP_CONFIG.name}. Todos os direitos reservados.
              {showVersion && (
                <span className="ml-2">v{APP_CONFIG.version || '1.0.0'}</span>
              )}
            </div>
          )}

          {/* Links */}
          {showLinks && (
            <div className="flex space-x-6">
              <Link 
                to="/settings" 
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Configurações
              </Link>
              <a 
                href="mailto:support@taskmanager.com" 
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Suporte
              </a>
              <a 
                href="#" 
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Documentação
              </a>
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

/**
 * Footer fixo no bottom da página
 */
export const StickyFooter = ({ className = '', ...props }) => (
  <Footer
    className={`sticky bottom-0 ${className}`}
    {...props}
  />
)

/**
 * Footer para páginas de autenticação
 */
export const AuthFooter = ({ className = '' }) => (
  <Footer
    variant="minimal"
    className={`mt-auto ${className}`}
    showLinks={false}
  />
)

/**
 * Footer compacto para modals ou sidebars
 */
export const CompactFooter = ({ 
  text,
  link,
  linkText = 'Saiba mais',
  className = '' 
}) => (
  <div className={`px-4 py-3 bg-gray-50 border-t border-gray-200 text-center ${className}`}>
    <p className="text-xs text-gray-500">
      {text}
      {link && (
        <>
          {' '}
          <a 
            href={link} 
            className="text-blue-600 hover:text-blue-700 font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkText}
          </a>
        </>
      )}
    </p>
  </div>
)

/**
 * Footer de status do sistema
 */
export const StatusFooter = ({ 
  status = 'operational', // operational, degraded, down
  message,
  className = '' 
}) => {
  const statusColors = {
    operational: 'bg-green-50 text-green-700 border-green-200',
    degraded: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    down: 'bg-red-50 text-red-700 border-red-200'
  }

  const statusLabels = {
    operational: 'Sistema Operacional',
    degraded: 'Performance Degradada',
    down: 'Sistema Indisponível'
  }

  return (
    <div className={`border-t ${statusColors[status]} px-4 py-2 ${className}`}>
      <div className="flex items-center justify-center space-x-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${
          status === 'operational' ? 'bg-green-500' :
          status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
        <span className="font-medium">
          {statusLabels[status]}
        </span>
        {message && (
          <span>- {message}</span>
        )}
      </div>
    </div>
  )
}

// Ícones sociais
const GitHubIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
)

const TwitterIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
)

export default Footer