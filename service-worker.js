const CACHE_VERSION = 'v1.0.0'; // 與您的 appVersion 保持一致，每次更新時修改此版本號
const CACHE_NAME = `consump-cache-${CACHE_VERSION}`;

// APP Shell: 應用程式核心靜態資源
const APP_SHELL_URLS = [
    './', // 為了讓 start_url 能作用
    './index.html',
    './item-checker.html',
    './manifest.json',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
    './icons/maskable_icon.png',
    // --- 主要函式庫 (從 Index.html 複製) ---
    'https://unpkg.com/vue@3/dist/vue.global.js',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
    'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0/dist/chartjs-adapter-date-fns.bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/date-fns/2.30.0/locale/zh-TW/index.min.js',
    'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
    'https://cdn.quilljs.com/1.3.6/quill.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js',
    'https://cdn.tailwindcss.com',
    // --- 主要樣式與字體 (從 Index.html 複製) ---
    'https://cdn.quilljs.com/1.3.6/quill.snow.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap'
];

// Service Worker 安裝事件
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching app shell');
            return cache.addAll(APP_SHELL_URLS);
        })
    );
});

// Service Worker 啟用事件 (用於清理舊快取)
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// 攔截網路請求事件 (快取優先策略)
self.addEventListener('fetch', (event) => {
    // 我們只對 GET 請求進行快取
    if (event.request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                // 如果快取中有符合的資源，直接回傳
                return response;
            }
            // 如果快取中沒有，則透過網路請求
            return fetch(event.request);
        })
    );
});