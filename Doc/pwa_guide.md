# Guia Técnico Completo: PWA para Gerenciamento de Tarefas

Progressive Web Apps representam a evolução mais significativa no desenvolvimento web para aplicações que precisam funcionar offline, enviar notificações e oferecer experiência nativa. Para um app de gerenciamento de rotinas com **push notifications de expiração**, **timers configuráveis** e **funcionamento offline**, PWAs oferecem todas as capacidades necessárias — com algumas ressalvas importantes no iOS que serão detalhadas.

Este guia cobre desde a arquitetura fundamental até implementações completas de código, compatibilidade de browsers e workarounds para limitações conhecidas.

---

## Service Workers: o coração da arquitetura offline

Service Workers são scripts que rodam em background, interceptando requisições de rede e gerenciando cache. Para um app de tarefas, eles possibilitam funcionamento offline completo, sincronização em background e recebimento de push notifications.

### Ciclo de vida completo

O Service Worker passa por três estados principais: **install** (pré-cache de recursos essenciais), **activate** (limpeza de caches antigos) e **fetch** (interceptação de requisições):

```javascript
// sw.js - Service Worker completo
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/offline.html'
];

// INSTALL - Pré-cache de recursos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// ACTIVATE - Limpeza de caches obsoletos
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !currentCaches.includes(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});
```

### Estratégias de caching para cada tipo de recurso

Diferentes tipos de conteúdo exigem estratégias diferentes. Para um app de tarefas, a configuração ideal combina:

| Tipo de Recurso | Estratégia | Justificativa |
|-----------------|------------|---------------|
| Assets estáticos (JS, CSS, imagens) | **Cache First** | Carregamento instantâneo |
| API de tarefas | **Network First** | Dados atualizados quando possível |
| Lista de tarefas em cache | **Stale While Revalidate** | Resposta rápida + atualização em background |
| Páginas HTML | **Network First** | Conteúdo sempre atualizado |

```javascript
// Implementação das estratégias
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return caches.match(request) || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });
  
  return cached || fetchPromise;
}

// Roteamento no fetch handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  if (request.method !== 'GET') return;
  
  // APIs - Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Assets estáticos - Cache First
  if (url.pathname.match(/\.(js|css|png|jpg|svg|woff2?)$/)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // HTML - Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request));
});
```

### Update strategies com controle do usuário

Para aplicações de produtividade, é importante controlar quando atualizações são aplicadas para não interromper o trabalho do usuário:

```javascript
// main.js - Controle de atualizações
let newWorker;

navigator.serviceWorker.register('/sw.js').then((reg) => {
  reg.addEventListener('updatefound', () => {
    newWorker = reg.installing;
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        showUpdateBanner(); // UI personalizada
      }
    });
  });
});

function applyUpdate() {
  newWorker.postMessage({ type: 'SKIP_WAITING' });
  window.location.reload();
}

// sw.js - Responder à mensagem
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

---

## Web App Manifest: configuração completa para instalação

O manifest.json define como o app aparece quando instalado. Para máxima compatibilidade e melhor experiência, inclua todas as configurações:

```json
{
  "name": "Gerenciador de Tarefas - Produtividade Offline",
  "short_name": "Tarefas",
  "description": "Gerencie suas tarefas e rotinas com notificações e funcionamento offline.",
  "id": "/task-manager",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "display_override": ["window-controls-overlay", "standalone"],
  "orientation": "any",
  "theme_color": "#3B82F6",
  "background_color": "#FFFFFF",
  "lang": "pt-BR",
  
  "icons": [
    { "src": "/icons/icon-72.png", "sizes": "72x72", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-96.png", "sizes": "96x96", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-128.png", "sizes": "128x128", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-144.png", "sizes": "144x144", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-152.png", "sizes": "152x152", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-384.png", "sizes": "384x384", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  
  "shortcuts": [
    {
      "name": "Nova Tarefa",
      "short_name": "Adicionar",
      "description": "Criar nova tarefa rapidamente",
      "url": "/tasks/new?source=shortcut",
      "icons": [{ "src": "/icons/add-task.png", "sizes": "192x192" }]
    },
    {
      "name": "Tarefas de Hoje",
      "short_name": "Hoje",
      "description": "Ver tarefas do dia",
      "url": "/tasks/today?source=shortcut",
      "icons": [{ "src": "/icons/today.png", "sizes": "192x192" }]
    },
    {
      "name": "Iniciar Timer",
      "short_name": "Timer",
      "url": "/timer?source=shortcut",
      "icons": [{ "src": "/icons/timer.png", "sizes": "192x192" }]
    }
  ],
  
  "screenshots": [
    {
      "src": "/screenshots/mobile-home.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Lista de tarefas"
    },
    {
      "src": "/screenshots/desktop-home.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Dashboard de tarefas"
    }
  ],
  
  "categories": ["productivity", "utilities"],
  
  "share_target": {
    "action": "/share-target/",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

### Tags HTML complementares (essenciais para iOS)

```html
<head>
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#3B82F6">
  
  <!-- iOS específico -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="Tarefas">
  <link rel="apple-touch-icon" href="/icons/icon-152.png">
  
  <!-- Viewport com safe areas -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
</head>
```

---

## Push Notifications: implementação completa para alertas de tarefas

Push notifications são fundamentais para alertar sobre tarefas expirando. A implementação envolve três partes: **cliente** (subscrição), **Service Worker** (recebimento) e **servidor** (envio).

### Configuração de VAPID Keys

VAPID (Voluntary Application Server Identification) permite identificar seu servidor junto aos serviços de push:

```bash
# Gerar chaves VAPID
npm install -g web-push
web-push generate-vapid-keys

# Saída:
# Public Key: BAbNusaoI2KTIogWMlnpZ8nL93ne8GSHXTOxlqxG19Py...
# Private Key: <CHAVE_PRIVADA>
```

### Cliente: gerenciador de subscrição

```javascript
// push-manager.js
class PushNotificationManager {
  constructor(vapidPublicKey) {
    this.vapidPublicKey = vapidPublicKey;
  }
  
  async init() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications não suportadas');
    }
    
    this.registration = await navigator.serviceWorker.ready;
    return this;
  }
  
  async subscribe() {
    // IMPORTANTE: Sempre solicitar permissão após interação do usuário
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Permissão negada');
    }
    
    const subscription = await this.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
    });
    
    // Enviar subscrição para o servidor
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });
    
    return subscription;
  }
  
  async unsubscribe() {
    const subscription = await this.registration.pushManager.getSubscription();
    if (subscription) {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });
      await subscription.unsubscribe();
    }
  }
  
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Uso
const pushManager = await new PushNotificationManager(VAPID_PUBLIC_KEY).init();
document.getElementById('enable-notifications').addEventListener('click', () => {
  pushManager.subscribe();
});
```

### Service Worker: handler de push completo

```javascript
// sw.js - Push notification handling
self.addEventListener('push', (event) => {
  let data = { title: 'Nova Notificação', body: 'Você tem uma atualização' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/badge-72.png',
    image: data.image,
    tag: data.tag || 'default',
    renotify: data.renotify || false,
    requireInteraction: data.requireInteraction || false, // Não fechar automaticamente
    silent: data.silent || false,
    vibrate: data.vibrate || [200, 100, 200],
    timestamp: data.timestamp || Date.now(),
    data: data.data || {},
    actions: data.actions || [
      { action: 'view', title: 'Ver Tarefa' },
      { action: 'complete', title: '✓ Concluir' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handler de clique na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  if (action === 'complete' && data.taskId) {
    // Marcar tarefa como concluída via API
    event.waitUntil(
      fetch(`/api/tasks/${data.taskId}/complete`, { method: 'POST' })
        .then(() => clients.openWindow(data.url || '/'))
    );
    return;
  }
  
  // Abrir app na URL da tarefa
  const url = data.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Verificar se app já está aberto
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

// Handler para subscrição expirada
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe({ userVisibleOnly: true })
      .then((subscription) => {
        return fetch('/api/push/subscription-changed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
      })
  );
});
```

### Servidor Node.js: envio de notificações

```javascript
// push-service.js
const webpush = require('web-push');
const cron = require('node-cron');

// Configurar VAPID
webpush.setVapidDetails(
  'mailto:admin@seuapp.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Função genérica de envio
async function sendPushNotification(userId, notification) {
  const subscriptions = await db.query(
    'SELECT * FROM push_subscriptions WHERE user_id = ?',
    [userId]
  );
  
  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body,
    icon: notification.icon || '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: notification.tag,
    renotify: true,
    requireInteraction: notification.urgent || false,
    data: {
      url: notification.url,
      taskId: notification.taskId
    },
    actions: notification.actions || [
      { action: 'view', title: 'Ver' },
      { action: 'complete', title: '✓ Concluir' }
    ]
  });
  
  const results = await Promise.allSettled(
    subscriptions.map((sub) => {
      const subscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      };
      return webpush.sendNotification(subscription, payload, { TTL: 86400 });
    })
  );
  
  // Remover subscrições inválidas
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const statusCode = result.reason.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        db.query('DELETE FROM push_subscriptions WHERE endpoint = ?',
          [subscriptions[index].endpoint]);
      }
    }
  });
  
  return results;
}

// Agendamento de lembretes de tarefas
async function scheduleTaskReminders(task) {
  const { id, title, dueDate, userId } = task;
  
  // Limpar lembretes existentes
  await db.query('DELETE FROM scheduled_notifications WHERE task_id = ?', [id]);
  
  // Agendar lembretes
  const reminders = [
    { offset: 24 * 60, message: 'Vence amanhã' },
    { offset: 60, message: 'Vence em 1 hora' },
    { offset: 15, message: 'Vence em 15 minutos' }
  ];
  
  for (const reminder of reminders) {
    const sendAt = new Date(dueDate.getTime() - reminder.offset * 60 * 1000);
    
    if (sendAt > new Date()) {
      await db.query(`
        INSERT INTO scheduled_notifications (user_id, task_id, send_at, payload)
        VALUES (?, ?, ?, ?)
      `, [userId, id, sendAt, JSON.stringify({
        title: `⏰ ${title}`,
        body: reminder.message,
        urgent: reminder.offset <= 15
      })]);
    }
  }
}

// Cron job para enviar notificações agendadas (roda a cada minuto)
cron.schedule('* * * * *', async () => {
  const now = new Date();
  
  const notifications = await db.query(`
    SELECT n.*, s.endpoint, s.p256dh, s.auth
    FROM scheduled_notifications n
    JOIN push_subscriptions s ON n.user_id = s.user_id
    WHERE n.send_at <= ? AND n.sent = false
  `, [now]);
  
  for (const notification of notifications) {
    try {
      await sendPushNotification(notification.user_id, JSON.parse(notification.payload));
      await db.query('UPDATE scheduled_notifications SET sent = true WHERE id = ?', 
        [notification.id]);
    } catch (error) {
      console.error('Push failed:', error);
    }
  }
});
```

### Boas práticas para solicitar permissão

Nunca solicite permissão de notificação imediatamente ao carregar a página. Sempre use uma UI intermediária que explique o valor:

```javascript
// Fluxo recomendado
async function requestNotificationPermission() {
  // 1. Mostrar UI explicativa primeiro
  const userWants = await showCustomPermissionDialog({
    title: 'Ativar notificações?',
    body: 'Receba alertas quando suas tarefas estiverem próximas do vencimento.',
    benefits: ['Nunca perca um prazo', 'Lembretes personalizados', 'Funciona mesmo com o app fechado']
  });
  
  if (userWants) {
    // 2. Só então mostrar o prompt do browser
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await pushManager.subscribe();
      showSuccessMessage();
    }
  }
}

// Verificar estado antes de mostrar
function checkNotificationSupport() {
  if (!('Notification' in window)) return 'unsupported';
  if (!('serviceWorker' in navigator)) return 'no-service-worker';
  if (Notification.permission === 'denied') return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return 'default'; // Pode solicitar
}
```

---

## IndexedDB: armazenamento offline de tarefas

Para funcionamento offline completo, todas as tarefas devem ser armazenadas localmente no IndexedDB:

```javascript
// task-db.js
import { openDB } from 'idb';

async function initDB() {
  return openDB('TaskManagerDB', 1, {
    upgrade(db) {
      // Store de tarefas
      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
        taskStore.createIndex('status', 'status');
        taskStore.createIndex('dueDate', 'dueDate');
        taskStore.createIndex('category', 'category');
        taskStore.createIndex('syncStatus', 'syncStatus');
      }
      
      // Fila de sincronização para mudanças offline
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    }
  });
}

class TaskDB {
  constructor() {
    this.dbPromise = initDB();
  }
  
  async addTask(task) {
    const db = await this.dbPromise;
    const taskWithMeta = {
      ...task,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: navigator.onLine ? 'synced' : 'pending'
    };
    
    const id = await db.add('tasks', taskWithMeta);
    
    if (!navigator.onLine) {
      await this.addToSyncQueue('add', { ...taskWithMeta, id });
    }
    
    return id;
  }
  
  async updateTask(id, updates) {
    const db = await this.dbPromise;
    const task = await db.get('tasks', id);
    const updatedTask = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: navigator.onLine ? 'synced' : 'pending'
    };
    
    await db.put('tasks', updatedTask);
    
    if (!navigator.onLine) {
      await this.addToSyncQueue('update', updatedTask);
    }
    
    return updatedTask;
  }
  
  async deleteTask(id) {
    const db = await this.dbPromise;
    await db.delete('tasks', id);
    
    if (!navigator.onLine) {
      await this.addToSyncQueue('delete', { id });
    }
  }
  
  async getAllTasks() {
    const db = await this.dbPromise;
    return db.getAll('tasks');
  }
  
  async getTasksDueToday() {
    const db = await this.dbPromise;
    const today = new Date().toISOString().split('T')[0];
    const tasks = await db.getAllFromIndex('tasks', 'dueDate');
    return tasks.filter(t => t.dueDate?.startsWith(today));
  }
  
  async getTasksDueSoon(hoursAhead = 24) {
    const db = await this.dbPromise;
    const now = new Date();
    const deadline = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
    const tasks = await db.getAll('tasks');
    return tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      const dueDate = new Date(t.dueDate);
      return dueDate > now && dueDate <= deadline;
    });
  }
  
  async addToSyncQueue(action, data) {
    const db = await this.dbPromise;
    await db.add('syncQueue', {
      action,
      data,
      timestamp: new Date().toISOString()
    });
  }
  
  async getSyncQueue() {
    const db = await this.dbPromise;
    return db.getAll('syncQueue');
  }
  
  async clearSyncQueue() {
    const db = await this.dbPromise;
    await db.clear('syncQueue');
  }
}

export const taskDB = new TaskDB();
```

---

## Background Sync: sincronização quando voltar online

A Background Sync API permite agendar sincronização automática quando a conexão for restaurada:

```javascript
// main.js - Registrar sync
async function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('sync-tasks');
  }
}

// Chamar após mudanças offline
window.addEventListener('online', () => {
  registerBackgroundSync();
  showToast('Você está online! Sincronizando...');
});

window.addEventListener('offline', () => {
  showToast('Você está offline. Mudanças serão sincronizadas automaticamente.');
});
```

```javascript
// sw.js - Handler de sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncPendingTasks());
  }
});

async function syncPendingTasks() {
  const db = await openDB('TaskManagerDB', 1);
  const queue = await db.getAll('syncQueue');
  
  for (const item of queue) {
    try {
      await syncItem(item);
      await db.delete('syncQueue', item.id);
    } catch (error) {
      console.error('Sync failed for item:', item.id);
      // Retry na próxima tentativa de sync
    }
  }
}

async function syncItem(item) {
  const endpoint = '/api/tasks';
  
  switch (item.action) {
    case 'add':
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
      break;
    case 'update':
      await fetch(`${endpoint}/${item.data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
      break;
    case 'delete':
      await fetch(`${endpoint}/${item.data.id}`, { method: 'DELETE' });
      break;
  }
}
```

**Suporte:** Chrome 49+, Edge 79+. **Não suportado em Safari/Firefox** — nesses browsers, sincronize manualmente ao detectar conexão.

---

## Screen Wake Lock: manter tela ligada durante timers

Para timers de tarefas, é essencial impedir que a tela desligue:

```javascript
class TaskTimer {
  constructor() {
    this.wakeLock = null;
    this.isRunning = false;
  }
  
  async startTimer(durationMs) {
    this.isRunning = true;
    
    // Solicitar wake lock
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
        this.wakeLock.addEventListener('release', () => {
          this.wakeLock = null;
        });
      } catch (err) {
        console.log('Wake lock não disponível:', err);
      }
    }
    
    // Re-adquirir wake lock quando tab voltar ao foco
    document.addEventListener('visibilitychange', this.handleVisibility);
    
    // Iniciar countdown
    this.endTime = Date.now() + durationMs;
    this.tick();
  }
  
  handleVisibility = async () => {
    if (document.visibilityState === 'visible' && this.isRunning && !this.wakeLock) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
      } catch (err) {
        // Ignorar erro
      }
    }
  };
  
  tick() {
    if (!this.isRunning) return;
    
    const remaining = this.endTime - Date.now();
    if (remaining <= 0) {
      this.onComplete();
      return;
    }
    
    this.updateDisplay(remaining);
    requestAnimationFrame(() => setTimeout(() => this.tick(), 100));
  }
  
  onComplete() {
    this.stopTimer();
    // Vibrar se suportado
    if ('vibrate' in navigator) {
      navigator.vibrate([300, 100, 300, 100, 500]);
    }
    // Mostrar notificação local
    if (Notification.permission === 'granted') {
      new Notification('Timer Concluído!', {
        body: 'Seu timer terminou.',
        icon: '/icons/icon-192.png'
      });
    }
  }
  
  stopTimer() {
    this.isRunning = false;
    if (this.wakeLock) {
      this.wakeLock.release();
      this.wakeLock = null;
    }
    document.removeEventListener('visibilitychange', this.handleVisibility);
  }
}
```

**Suporte:** Chrome 84+, Edge 84+, Safari 16.4+ (iOS 18.4+ para PWAs instaladas).

---

## Badging API: contador de tarefas pendentes no ícone

```javascript
// Atualizar badge quando tarefas mudam
async function updateTaskBadge() {
  if (!('setAppBadge' in navigator)) return;
  
  const pendingTasks = await taskDB.getTasksDueSoon(24); // Próximas 24h
  const count = pendingTasks.length;
  
  try {
    if (count > 0) {
      await navigator.setAppBadge(count);
    } else {
      await navigator.clearAppBadge();
    }
  } catch (error) {
    console.error('Badge update failed:', error);
  }
}

// Chamar em mudanças de tarefas
taskDB.addTask(task).then(updateTaskBadge);
taskDB.updateTask(id, { status: 'completed' }).then(updateTaskBadge);
```

**Suporte:** Chrome 81+ (desktop), Edge 84+. Android mostra badges automaticamente com notificações pendentes. iOS 16.4+ suporta em PWAs instaladas.

---

## Integrações de compartilhamento

### Web Share API (compartilhar tarefas)

```javascript
async function shareTask(task) {
  if (!navigator.share) {
    fallbackShare(task);
    return;
  }
  
  const shareData = {
    title: task.title,
    text: `Tarefa: ${task.title}\n${task.description || ''}\nVence: ${formatDate(task.dueDate)}`,
    url: `${window.location.origin}/tasks/${task.id}`
  };
  
  if (navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  }
}
```

### Share Target (receber compartilhamentos)

Com o `share_target` no manifest, seu PWA pode receber dados compartilhados de outros apps:

```javascript
// Detectar dados compartilhados na página de destino
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const title = params.get('title');
  const text = params.get('text');
  const url = params.get('url');
  
  if (title || text || url) {
    // Pré-preencher formulário de nova tarefa
    createTaskFromSharedData({ title, text, url });
  }
});
```

---

## Design Mobile-First e responsividade

### Viewport e Safe Areas

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

```css
/* Lidar com notch e home indicator */
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding-top: calc(12px + env(safe-area-inset-top));
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

.fab {
  position: fixed;
  right: calc(16px + env(safe-area-inset-right));
  bottom: calc(80px + env(safe-area-inset-bottom));
}
```

### Touch targets e interações

```css
/* Targets de toque mínimo 48x48px */
.task-action-button {
  min-width: 48px;
  min-height: 48px;
  padding: 12px;
  touch-action: manipulation; /* Prevenir double-tap zoom */
}

/* Prevenir zoom em inputs no iOS */
input, select, textarea {
  font-size: 16px; /* Mínimo para evitar auto-zoom */
}

/* Spacing entre targets */
.action-row {
  display: flex;
  gap: 8px; /* Mínimo 8px entre targets */
}
```

### Tipografia fluida

```css
:root {
  --text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  --text-xl: clamp(1.25rem, 1rem + 1.25vw, 1.75rem);
  --text-2xl: clamp(1.5rem, 1rem + 2.5vw, 2.5rem);
}

.task-title { font-size: var(--text-lg); }
.task-description { 
  font-size: var(--text-base);
  max-width: 65ch; /* Largura ideal para leitura */
}
```

### Container Queries para componentes adaptáveis

```css
.task-card-wrapper {
  container-type: inline-size;
  container-name: task-card;
}

.task-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
}

/* Quando o card tem mais espaço */
@container task-card (min-width: 400px) {
  .task-card {
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }
  
  .task-meta {
    flex-direction: row;
    gap: 1rem;
    margin-left: auto;
  }
}
```

### Swipe actions para tarefas

```javascript
class SwipeHandler {
  constructor(element, options = {}) {
    this.element = element;
    this.threshold = options.threshold || 50;
    this.startX = 0;
    
    element.addEventListener('touchstart', this.handleStart.bind(this), { passive: true });
    element.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
    element.addEventListener('touchend', this.handleEnd.bind(this), { passive: true });
  }
  
  handleStart(e) {
    this.startX = e.touches[0].clientX;
  }
  
  handleMove(e) {
    const diffX = this.startX - e.touches[0].clientX;
    const diffY = Math.abs(e.touches[0].clientY - this.startY);
    
    // Prevenir scroll vertical se swipe horizontal detectado
    if (Math.abs(diffX) > diffY) {
      e.preventDefault();
      this.element.style.transform = `translateX(${-diffX}px)`;
    }
  }
  
  handleEnd(e) {
    const distX = e.changedTouches[0].clientX - this.startX;
    
    if (Math.abs(distX) >= this.threshold) {
      this.element.dispatchEvent(new CustomEvent('swipe', {
        detail: { direction: distX > 0 ? 'right' : 'left' }
      }));
    }
    
    this.element.style.transform = '';
    this.startX = 0;
  }
}

// Uso
document.querySelectorAll('.task-card').forEach(card => {
  new SwipeHandler(card);
  card.addEventListener('swipe', (e) => {
    if (e.detail.direction === 'right') completeTask(card.dataset.taskId);
    if (e.detail.direction === 'left') showDeleteConfirm(card.dataset.taskId);
  });
});
```

---

## Compatibilidade de browsers: tabela completa

| Feature | Chrome | Safari (iOS) | Safari (macOS) | Firefox | Edge |
|---------|--------|--------------|----------------|---------|------|
| Service Workers | ✅ 45+ | ✅ 11.3+ | ✅ 11.1+ | ✅ 44+ | ✅ 17+ |
| Push Notifications | ✅ | ⚠️ 16.4+ (PWA apenas) | ✅ 16+ | ✅ | ✅ |
| Background Sync | ✅ 49+ | ❌ | ❌ | ❌ | ✅ |
| Periodic Background Sync | ✅ 80+ | ❌ | ❌ | ❌ | ✅ |
| Badging API | ✅ 81+ | ✅ 16.4+ (PWA) | ❌ | ❌ | ✅ 84+ |
| Web Share | ✅ 89+ | ✅ 12.1+ | ✅ 15+ | ⚠️ Android | ✅ 93+ |
| Share Target | ✅ 76+ | ❌ | ❌ | ❌ | ✅ |
| Wake Lock | ✅ 84+ | ✅ 16.4+ | ✅ 16.4+ | ❌ | ✅ 84+ |
| Vibration | ✅ | ❌ | ❌ | ✅ | ✅ |
| beforeinstallprompt | ✅ 68+ | ❌ | ❌ | ❌ | ✅ |
| IndexedDB | ✅ | ✅ 8+ | ✅ | ✅ | ✅ |
| File System Access | ✅ 86+ | ⚠️ OPFS | ⚠️ OPFS | ⚠️ OPFS | ✅ 86+ |

---

## Limitações críticas do iOS/Safari

O iOS possui limitações significativas que requerem atenção especial:

### Push Notifications no iOS
- **Funciona apenas em PWAs instaladas** (não no Safari browser)
- Requer iOS 16.4+
- O usuário DEVE adicionar o app à tela inicial primeiro
- Problemas de confiabilidade reportados (notificações parando após alguns dias)
- Permissão deve ser solicitada após interação do usuário

### Eviction de Storage
Safari pode deletar dados de PWAs não usadas por ~7 dias. Mitigue com:

```javascript
// Solicitar armazenamento persistente
async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const granted = await navigator.storage.persist();
    console.log('Persistent storage:', granted ? 'granted' : 'denied');
  }
}
```

### Workaround para install prompt no iOS

Como não há `beforeinstallprompt` no iOS, crie UI customizada:

```javascript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isStandalone = window.navigator.standalone === true;

if (isIOS && !isStandalone) {
  showIOSInstallInstructions({
    title: 'Instalar App',
    steps: [
      'Toque no botão Compartilhar',
      'Role e toque em "Adicionar à Tela de Início"',
      'Toque em "Adicionar"'
    ]
  });
}
```

### Feature detection completo

```javascript
const PWAFeatures = {
  serviceWorker: 'serviceWorker' in navigator,
  pushManager: 'PushManager' in window,
  notifications: 'Notification' in window,
  backgroundSync: 'SyncManager' in window,
  badging: 'setAppBadge' in navigator,
  wakeLock: 'wakeLock' in navigator,
  webShare: 'share' in navigator,
  indexedDB: 'indexedDB' in window,
  storageManager: 'storage' in navigator,
  
  // Display mode
  isStandalone: window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone === true,
  
  // Platform
  isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
  isAndroid: /Android/.test(navigator.userAgent)
};

function isPWAInstalled() {
  return PWAFeatures.isStandalone;
}
```

---

## Estrutura de projeto recomendada

```
/
├── index.html
├── manifest.json
├── sw.js                    # Service Worker principal
├── src/
│   ├── app.js              # Entry point
│   ├── push-manager.js     # Gestão de push notifications
│   ├── task-db.js          # IndexedDB operations
│   ├── task-timer.js       # Timer com wake lock
│   ├── sync-manager.js     # Background sync
│   └── components/
│       ├── TaskCard.js
│       ├── TaskList.js
│       └── BottomNav.js
├── styles/
│   ├── main.css
│   ├── mobile.css          # Mobile-first styles
│   └── safe-areas.css      # Notch/safe area handling
├── icons/
│   ├── icon-72.png
│   ├── icon-96.png
│   ├── icon-128.png
│   ├── icon-144.png
│   ├── icon-152.png
│   ├── icon-192.png
│   ├── icon-384.png
│   ├── icon-512.png
│   ├── icon-maskable-192.png
│   ├── icon-maskable-512.png
│   └── badge-72.png
├── screenshots/
│   ├── mobile-home.png
│   └── desktop-home.png
└── offline.html             # Página offline fallback
```

---

## Checklist de implementação

Para garantir que seu PWA de tarefas atenda todos os requisitos:

- [ ] **Service Worker** registrado com estratégias de cache apropriadas
- [ ] **manifest.json** completo com ícones, shortcuts e screenshots
- [ ] **Push notifications** configuradas com VAPID e servidor de envio
- [ ] **IndexedDB** para persistência offline de tarefas
- [ ] **Background Sync** para sincronizar mudanças offline (com fallback)
- [ ] **Screen Wake Lock** para timers
- [ ] **Badging API** para contador de tarefas pendentes
- [ ] **Safe areas** CSS para notch e home indicator
- [ ] **Touch targets** mínimo 48x48px
- [ ] **Feature detection** antes de usar qualquer API
- [ ] **Lighthouse PWA audit** passando em todos os critérios
- [ ] **Workarounds iOS** implementados (install prompt, storage persistence)

---

## Conclusão: PWA é viável para o seu caso de uso

Para um app de gerenciamento de rotinas com push de expiração, timers e funcionamento offline, **PWA é uma excelente escolha** — especialmente se seu público usa majoritariamente Android/Chrome. As APIs de Service Worker, IndexedDB, Push Notifications e Wake Lock cobrem todos os requisitos funcionais.

A principal ressalva é o **iOS**: push notifications funcionam apenas em PWAs instaladas (iOS 16.4+), Background Sync não é suportado, e há riscos de eviction de dados. Se confiabilidade absoluta de notificações no iOS for crítica, considere um wrapper nativo via **Capacitor** como complemento ao PWA, mantendo uma única base de código.

Para começar, implemente primeiro o Service Worker com offline support e IndexedDB, depois adicione push notifications com o fluxo de permissão adequado, e por fim os refinamentos de UX como badges e wake lock para timers.