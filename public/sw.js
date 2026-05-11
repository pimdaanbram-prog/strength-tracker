const CACHE_NAME = 'strength-tracker-v2'

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

// Never cache requests to these origins (auth + live API traffic)
const BYPASS_ORIGINS = [
  'supabase.co',
  'supabase.io',
  'googleapis.com',
  'gstatic.com',
]

function shouldBypass(url) {
  return BYPASS_ORIGINS.some(origin => url.hostname.endsWith(origin))
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // Pass Supabase and other live API traffic straight through — never cache
  if (shouldBypass(url)) {
    event.respondWith(fetch(event.request))
    return
  }

  // Stale-while-revalidate for app shell + static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          }
          return response
        })
        .catch(() => cached)

      return cached || fetched
    })
  )
})
