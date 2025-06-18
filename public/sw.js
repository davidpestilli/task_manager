// Service Worker para Task Manager PWA
// Versão do cache - incrementar a cada deploy
const CACHE_VERSION = 'v1.0.0'
const CACHE_NAME = `task-manager-${CACHE_VERSION}`

// Recursos para cache offline
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// Recursos dinâmicos que devem ser cached
const DYNAMIC_CACHE_PATTERNS = [
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/,
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /\.(?:js|css)$/
]

// URLs que nunca devem ser cached
const NEVER_CACHE_PATTERNS = [
  /^https:\/\/.*\.supabase\.co\/.*/, // APIs Supabase sempre online
  /\/api\/webhooks\//, // Webhooks sempre online
  /\/auth\//, // Autenticação sempre online
]

// Estratégias de cache
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
}

/**
 * Instalação do Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static assets')
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete')
        // Ativar imediatamente o novo SW
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error)
      })
  )
})

/**
 * Ativação do Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // Remover caches antigos
        const deletePromises = cacheNames
          .filter(cacheName => 
            cacheName.startsWith('task-manager-') && 
            cacheName !== CACHE_NAME
          )
          .map(cacheName => {
            console.log('🗑️ Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          })
        
        return Promise.all(deletePromises)
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete')
        // Controlar todas as abas imediatamente
        return self.clients.claim()
      })
      .catch((error) => {
        console.error('❌ Service Worker: Activation failed', error)
      })
  )
})

/**
 * Interceptação de requisições
 */
self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  
  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return
  }
  
  // Ignorar requisições de chrome-extension
  if (url.protocol === 'chrome-extension:') {
    return
  }
  
  // Determinar estratégia de cache
  const strategy = getCacheStrategy(request)
  
  event.respondWith(
    handleRequest(request, strategy)
      .catch((error) => {
        console.error('Service Worker: Request failed', error)
        return getOfflineFallback(request)
      })
  )
})

/**
 * Determina a estratégia de cache para uma requisição
 */
function getCacheStrategy(request) {
  const url = new URL(request.url)
  
  // Nunca fazer cache
  if (NEVER_CACHE_PATTERNS.some(pattern => pattern.test(url.href))) {
    return CACHE_STRATEGIES.NETWORK_ONLY
  }
  
  // Recursos estáticos - cache first
  if (STATIC_CACHE_URLS.includes(url.pathname)) {
    return CACHE_STRATEGIES.CACHE_FIRST
  }
  
  // Assets dinâmicos - stale while revalidate
  if (DYNAMIC_CACHE_PATTERNS.some(pattern => pattern.test(url.href))) {
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE
  }
  
  // APIs e dados - network first
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    return CACHE_STRATEGIES.NETWORK_FIRST
  }
  
  // Páginas HTML - network first com fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    return CACHE_STRATEGIES.NETWORK_FIRST
  }
  
  // Default: network first
  return CACHE_STRATEGIES.NETWORK_FIRST
}

/**
 * Executa a estratégia de cache apropriada
 */
async function handleRequest(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request)
      
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request)
      
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request)
      
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request)
      
    case CACHE_STRATEGIES.CACHE_ONLY:
      return caches.match(request)
      
    default:
      return networkFirst(request)
  }
}

/**
 * Estratégia Cache First
 */
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) {
    return cached
  }
  
  const response = await fetch(request)
  await cacheResponse(request, response.clone())
  return response
}

/**
 * Estratégia Network First
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    
    // Cache apenas respostas bem-sucedidas
    if (response.ok) {
      await cacheResponse(request, response.clone())
    }
    
    return response
  } catch (error) {
    // Fallback para cache em caso de erro de rede
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }
    throw error
  }
}

/**
 * Estratégia Stale While Revalidate
 */
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request)
  
  // Buscar nova versão em background
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cacheResponse(request, response.clone())
      }
      return response
    })
    .catch(() => {
      // Ignorar erros de rede em background
    })
  
  // Retornar cache imediatamente se disponível
  if (cached) {
    return cached
  }
  
  // Se não há cache, aguardar a rede
  return fetchPromise
}

/**
 * Fazer cache de uma resposta
 */
async function cacheResponse(request, response) {
  // Não fazer cache de respostas de erro
  if (!response.ok) {
    return
  }
  
  // Não fazer cache de respostas opaque
  if (response.type === 'opaque') {
    return
  }
  
  try {
    const cache = await caches.open(CACHE_NAME)
    await cache.put(request, response)
  } catch (error) {
    console.warn('Service Worker: Failed to cache response', error)
  }
}

/**
 * Fallback offline para requisições que falharam
 */
async function getOfflineFallback(request) {
  // Para páginas HTML, retornar uma página offline
  if (request.headers.get('accept')?.includes('text/html')) {
    const offlinePage = await caches.match('/offline.html')
    if (offlinePage) {
      return offlinePage
    }
    
    // Fallback básico para HTML
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Task Manager - Offline</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh; 
              margin: 0; 
              background: #f9fafb;
              color: #374151;
            }
            .container { 
              text-align: center; 
              padding: 2rem;
              background: white;
              border-radius: 0.5rem;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .icon { font-size: 4rem; margin-bottom: 1rem; }
            .title { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; }
            .message { color: #6b7280; margin-bottom: 1.5rem; }
            .button { 
              background: #3b82f6; 
              color: white; 
              border: none; 
              padding: 0.75rem 1.5rem; 
              border-radius: 0.375rem; 
              cursor: pointer;
              font-size: 1rem;
            }
            .button:hover { background: #2563eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">📱</div>
            <h1 class="title">Você está offline</h1>
            <p class="message">
              Não foi possível conectar ao Task Manager. 
              Verifique sua conexão e tente novamente.
            </p>
            <button class="button" onclick="window.location.reload()">
              Tentar novamente
            </button>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
  
  // Para outros tipos de requisição, retornar erro
  return new Response('Offline', { 
    status: 503, 
    statusText: 'Service Unavailable' 
  })
}

/**
 * Manipular mensagens do cliente
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_VERSION })
      break
      
    case 'CLEAR_CACHE':
      clearCache()
        .then(() => event.ports[0].postMessage({ success: true }))
        .catch(error => event.ports[0].postMessage({ error: error.message }))
      break
      
    case 'CACHE_URLS':
      cacheUrls(payload.urls)
        .then(() => event.ports[0].postMessage({ success: true }))
        .catch(error => event.ports[0].postMessage({ error: error.message }))
      break
        
    default:
      console.log('Service Worker: Unknown message type', type)
  }
})

/**
 * Limpar cache
 */
async function clearCache() {
  const cacheNames = await caches.keys()
  const deletePromises = cacheNames
    .filter(name => name.startsWith('task-manager-'))
    .map(name => caches.delete(name))
  
  await Promise.all(deletePromises)
  console.log('Service Worker: Cache cleared')
}

/**
 * Fazer cache de URLs específicas
 */
async function cacheUrls(urls) {
  const cache = await caches.open(CACHE_NAME)
  const requests = urls.map(url => new Request(url))
  
  const responses = await Promise.allSettled(
    requests.map(request => fetch(request))
  )
  
  const validResponses = responses
    .filter(result => result.status === 'fulfilled' && result.value.ok)
    .map((result, index) => ({ request: requests[index], response: result.value }))
  
  await Promise.all(
    validResponses.map(({ request, response }) => 
      cache.put(request, response)
    )
  )
  
  console.log(`Service Worker: Cached ${validResponses.length} URLs`)
}

/**
 * Sincronização em background
 */
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag)
  
  switch (event.tag) {
    case 'sync-tasks':
      event.waitUntil(syncTasks())
      break
      
    case 'sync-notifications':
      event.waitUntil(syncNotifications())
      break
      
    default:
      console.log('Service Worker: Unknown sync tag', event.tag)
  }
})

/**
 * Sincronizar tarefas offline
 */
async function syncTasks() {
  try {
    // Implementar sincronização de tarefas criadas offline
    console.log('Service Worker: Syncing tasks...')
    
    // Buscar dados pendentes no IndexedDB
    // Enviar para servidor
    // Limpar dados locais
    
    console.log('Service Worker: Tasks synced')
  } catch (error) {
    console.error('Service Worker: Failed to sync tasks', error)
    throw error
  }
}

/**
 * Sincronizar notificações
 */
async function syncNotifications() {
  try {
    console.log('Service Worker: Syncing notifications...')
    
    // Buscar notificações não lidas
    // Exibir notificações push se necessário
    
    console.log('Service Worker: Notifications synced')
  } catch (error) {
    console.error('Service Worker: Failed to sync notifications', error)
    throw error
  }
}

/**
 * Notificações Push
 */
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received')
  
  const options = {
    body: 'Nova atualização no Task Manager',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir',
        icon: '/icons/action-open.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/action-close.png'
      }
    ]
  }
  
  if (event.data) {
    const data = event.data.json()
    options.body = data.message || options.body
    options.data = { ...options.data, ...data }
  }
  
  event.waitUntil(
    self.registration.showNotification('Task Manager', options)
  )
})

/**
 * Clique em notificações
 */
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked')
  
  event.notification.close()
  
  const { action, data } = event
  const url = data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        // Procurar aba já aberta
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Abrir nova aba
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})

console.log('🚀 Service Worker: Loaded and ready')