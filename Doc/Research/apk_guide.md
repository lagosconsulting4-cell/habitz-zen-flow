# APK vs PWA: guia técnico definitivo para apps Android

**Para um app de gerenciamento de tarefas com timers e alertas, PWA puro é inadequado** — alarmes em background e notificações agendadas localmente são tecnicamente impossíveis no Service Worker. A solução ideal combina Capacitor com plugins nativos ou TWA com backend de push notifications. Este relatório detalha as diferenças técnicas entre APK nativo, PWA, TWA e soluções híbridas para orientar sua decisão arquitetural.

---

## O que compõe tecnicamente um APK Android

Um arquivo APK (Android Package Kit) é essencialmente um arquivo ZIP com estrutura específica que contém todos os componentes necessários para instalar e executar um aplicativo Android. A estrutura interna inclui:

```
app.apk/
├── AndroidManifest.xml     # Manifesto binário: permissões, componentes, versão
├── classes.dex             # Bytecode Dalvik (código Java/Kotlin compilado)
├── classes2.dex            # MultiDEX quando excede 64K métodos
├── resources.arsc          # Tabela de recursos pré-compilados
├── res/                    # Recursos: layouts XML, drawables, strings
├── lib/                    # Bibliotecas nativas (.so) por arquitetura
│   ├── armeabi-v7a/       # ARM 32-bit
│   ├── arm64-v8a/         # ARM 64-bit (maioria dos dispositivos modernos)
│   └── x86_64/            # Emuladores e Chromebooks
├── assets/                 # Arquivos raw controlados pelo desenvolvedor
├── META-INF/              # Certificados e assinaturas digitais
└── kotlin/                # Metadados Kotlin (se aplicável)
```

O **processo de compilação** segue o fluxo: código Java/Kotlin → Java bytecode (.class) → D8/R8 compiler → Dalvik bytecode (.dex) → empacotamento e assinatura → APK final. O **R8** (substituto do ProGuard) realiza shrinking, otimização e ofuscação simultaneamente, reduzindo o tamanho final em até **30-40%**.

A **assinatura do APK** evoluiu significativamente: v1 (JAR signing) é o mais antigo; v2 (Android 7+) protege todo o arquivo; v3 (Android 9+) permite rotação de chaves; v4 (Android 11+) suporta instalação streaming. Apps modernos devem usar v2+ obrigatoriamente.

### Android App Bundle vs APK tradicional

O **AAB (Android App Bundle)** é o formato de publicação obrigatório na Play Store desde agosto de 2021. Diferentemente do APK universal, o AAB permite que a Play Store gere **Split APKs** otimizados por dispositivo:

| Aspecto | APK | AAB |
|---------|-----|-----|
| Instalação direta | ✅ Sim | ❌ Não (formato de publicação) |
| Play Store | ❌ Não aceito (novos apps) | ✅ Obrigatório |
| Tamanho entregue | Universal (maior) | Otimizado por dispositivo |
| Economia típica | - | **20-35%** menor para usuário |
| Dynamic Delivery | ❌ | ✅ Módulos sob demanda |

O Google gerencia a chave de assinatura final via **Play App Signing**, gerando os APKs a partir do AAB enviado pelo desenvolvedor.

---

## Anatomia técnica de uma Progressive Web App

Uma PWA é definida por três pilares técnicos obrigatórios: **HTTPS**, **Service Worker** e **Web App Manifest**. Quando instalada via Chrome Android, a PWA é empacotada automaticamente como **WebAPK** — um APK real gerado pelo servidor de "minting" do Google.

### Service Worker: o coração da PWA

O Service Worker é um script JavaScript que funciona como proxy entre a aplicação e a rede, executando em thread separada do DOM principal:

```javascript
// Ciclo de vida: install → activate → fetch
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then(cache => 
      cache.addAll(['/index.html', '/app.js', '/styles.css'])
    )
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
```

**Estratégias de caching** determinam comportamento offline: *Cache First* prioriza velocidade para assets estáticos; *Network First* garante dados frescos; *Stale While Revalidate* combina ambos retornando cache imediatamente enquanto atualiza em background.

**Limitação crítica**: Service Workers são **terminados pelo sistema** após ~30 segundos de inatividade. `setTimeout` e `setInterval` simplesmente param de funcionar com o app em background — **tornando timers confiáveis impossíveis em PWA pura**.

### Web App Manifest e WebAPK

O manifest.json define metadados essenciais para instalação:

```json
{
  "name": "Gerenciador de Tarefas",
  "short_name": "Tarefas",
  "start_url": "/?source=pwa",
  "display": "standalone",
  "theme_color": "#3367D6",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/maskable-512.png", "sizes": "512x512", "purpose": "maskable" }
  ],
  "shortcuts": [
    { "name": "Nova Tarefa", "url": "/tasks/new", "icons": [...] }
  ]
}
```

Quando o usuário instala uma PWA via Chrome, um **WebAPK** é gerado silenciosamente pelo servidor do Google e instalado sem necessidade de "fontes desconhecidas". O WebAPK aparece como app real nas configurações do Android, possui ícone limpo (sem badge do Chrome), e suporta **link capture** — URLs do scope abrem diretamente no app.

---

## Tecnologias híbridas que conectam PWA e APK

### TWA: empacotando PWA como APK

**Trusted Web Activity** permite executar conteúdo web em tela cheia dentro de um APK, usando o Chrome como engine de renderização (não um WebView genérico). A autenticação de propriedade acontece via **Digital Asset Links**:

```json
// /.well-known/assetlinks.json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.seuapp.twa",
    "sha256_cert_fingerprints": ["14:6D:E9:83:..."]
  }
}]
```

**Bubblewrap** (Google) e **PWABuilder** (Microsoft) são as ferramentas principais para gerar TWAs:

```bash
# Bubblewrap CLI
npm i -g @bubblewrap/cli
bubblewrap init --manifest=https://meu-pwa.com/manifest.json
bubblewrap build
# Gera: app-release-signed.apk (~3-5MB)
```

| Vantagem TWA | Limitação TWA |
|--------------|---------------|
| Chrome atualizado automaticamente | Requer Chrome instalado no dispositivo |
| OAuth/Login social funcionam | Sem acesso a APIs nativas além das Web APIs |
| Performance excelente (Chrome nativo) | Banner "Running in Chrome" na primeira execução |
| Atualizações instantâneas (web) | Dependente de Digital Asset Links válido |

### Capacitor: acesso nativo completo

O **Capacitor** (Ionic) oferece arquitetura diferente: WebView nativa + bridge JavaScript-Nativo + plugins que expõem APIs nativas completas:

```typescript
// Push Notifications via plugin nativo
import { PushNotifications } from '@capacitor/push-notifications';

await PushNotifications.requestPermissions();
await PushNotifications.register();

PushNotifications.addListener('pushNotificationReceived', notification => {
  console.log('Push received:', notification);
});

// Local Notifications AGENDÁVEIS (funciona em background!)
import { LocalNotifications } from '@capacitor/local-notifications';

await LocalNotifications.schedule({
  notifications: [{
    title: "Tarefa expirando!",
    body: "Sua tarefa vence em 15 minutos",
    id: 1,
    schedule: { at: new Date(Date.now() + 1000 * 60 * 15) }  // 15 min
  }]
});
```

**Cordova** ainda existe mas está em modo manutenção — para novos projetos, Capacitor é a escolha recomendada devido à manutenção ativa pela Ionic e melhor integração com ferramentas modernas.

---

## Matriz completa de funcionalidades

| Funcionalidade | APK Nativo | PWA | TWA | Capacitor |
|---------------|------------|-----|-----|-----------|
| **Push Notifications** | ✅ FCM completo | ✅ Web Push | ✅ Web Push | ✅ FCM nativo |
| **Notificações locais agendadas** | ✅ AlarmManager | ❌ **IMPOSSÍVEL** | ❌ **IMPOSSÍVEL** | ✅ Plugin nativo |
| **Timers em background** | ✅ Foreground Service | ❌ **IMPOSSÍVEL** | ❌ **IMPOSSÍVEL** | ✅ Com código nativo |
| **Offline storage** | ✅ Ilimitado (Room/SQLite) | ⚠️ ~6-20% disco | ⚠️ Igual PWA | ✅ SQLite ilimitado |
| **Background processing** | ✅ WorkManager, Services | ⚠️ SW termina em ~30s | ⚠️ Limitado | ✅ Via código nativo |
| **Geolocalização background** | ✅ Com permissão | ❌ Foreground apenas | ❌ Foreground apenas | ✅ Plugin nativo |
| **Widgets home screen** | ✅ Completo | ❌ Não suportado | ❌ Não suportado | ⚠️ Requer código nativo |
| **Biometria** | ✅ Fingerprint/Face | ✅ WebAuthn | ✅ Suportado | ✅ Plugin nativo |
| **In-app purchases** | ✅ Play Billing | ❌ Não suportado | ⚠️ Digital Goods API | ✅ Plugin nativo |
| **Bluetooth** | ✅ Classic + BLE | ⚠️ BLE apenas | ⚠️ BLE apenas | ✅ Completo |
| **NFC** | ✅ Completo | ⚠️ Web NFC (limitado) | ⚠️ Limitado | ✅ Plugin nativo |
| **Deep links** | ✅ App Links | ⚠️ URL handlers | ✅ Digital Asset Links | ✅ Config nativa |
| **Badge numérico no ícone** | ✅ ShortcutBadger | ⚠️ Apenas DOT no Android | ⚠️ Apenas DOT | ✅ Com plugin |
| **Boot receiver** | ✅ Iniciar com sistema | ❌ Impossível | ❌ Impossível | ✅ Código nativo |

---

## Push Notifications: FCM nativo vs Web Push

### Firebase Cloud Messaging (FCM) — Arquitetura nativa

O FCM oferece dois tipos de mensagens com comportamentos distintos:

| Tipo | Foreground | Background | App Killed |
|------|-----------|------------|------------|
| **Notification** | `onMessageReceived()` callback | FCM SDK exibe automaticamente | Sistema exibe |
| **Data** | `onMessageReceived()` callback | `onMessageReceived()` callback | Callback (com limitações OEM) |
| **Combinado** | Callback | Sistema exibe; data no click | Sistema exibe; data no click |

**Priority HIGH** acorda o dispositivo mesmo em Doze mode e entrega imediatamente — essencial para alertas de tarefas expirando. Priority NORMAL pode ser adiada por horas em Doze mode.

```kotlin
// Configuração FCM no Android nativo
class MyFirebaseMessagingService : FirebaseMessagingService() {
    override fun onMessageReceived(message: RemoteMessage) {
        message.notification?.let { showNotification(it.title, it.body) }
        message.data.isNotEmpty().let { handleDataMessage(message.data) }
    }
}
```

### Web Push — Arquitetura para PWA

Web Push usa **VAPID** (Voluntary Application Server Identification) para autenticação sem criar projeto Firebase:

```javascript
// Subscription no cliente
const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,  // OBRIGATÓRIO: deve mostrar notificação
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
});

// Service Worker recebe push
self.addEventListener('push', (event) => {
    const data = event.data.json();
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/icon.png',
            actions: [{ action: 'open', title: 'Abrir' }]
        })
    );
});
```

**Fato importante**: Chrome Android usa FCM internamente como push service — endpoints começam com `fcm.googleapis.com`. A diferença é que Web Push não tem controle sobre priority, não pode enviar silent push (userVisibleOnly=true é obrigatório), e depende do browser estar "ativo" no sistema.

| Aspecto | FCM Nativo | Web Push |
|---------|-----------|----------|
| **Confiabilidade** | ~99%+ com HIGH priority | ~95-98%, variável |
| **Latência foreground** | <1 segundo | 1-5 segundos |
| **Doze mode** | HIGH priority acorda dispositivo | Sem controle |
| **Silent push** | ✅ Data messages | ❌ Obrigatório mostrar notificação |
| **Notificações agendadas locais** | ✅ AlarmManager + NotificationManager | ❌ **NÃO EXISTE API** |
| **Payload máximo** | 4KB | 4KB |
| **Rich notifications** | Completo (BigText, Inbox, Media) | Limitado (icon, badge, image) |

---

## Por que timers e alarmes são impossíveis em PWA

Esta é a **limitação mais crítica** para seu caso de uso. A API **Notification Triggers** (que permitiria agendar notificações locais) foi testada em Origin Trial pelo Chrome mas **foi abandonada** — a decisão foi não implementar após feedback negativo.

### Android Nativo: controle total sobre alarmes

```kotlin
// Alarme que funciona mesmo em Doze mode
val alarmManager = getSystemService(AlarmManager::class.java)
alarmManager.setExactAndAllowWhileIdle(
    AlarmManager.RTC_WAKEUP,
    triggerTimeMillis,
    pendingIntent
)

// Ou para máxima confiabilidade (alarme tipo despertador)
alarmManager.setAlarmClock(
    AlarmClockInfo(triggerTime, showIntent),
    pendingIntent
)
```

`setExactAndAllowWhileIdle()` tem limite de 1 alarme a cada 9 minutos em Doze mode. `setAlarmClock()` sempre dispara pois o sistema sai de Doze antes.

### PWA: Service Worker não sobrevive

```javascript
// ISSO NÃO FUNCIONA com app fechado
setTimeout(() => {
    new Notification('Tarefa expirando!');  // Nunca executará
}, 1000 * 60 * 30);  // 30 minutos
```

O Service Worker é **terminado pelo sistema** após segundos de inatividade. `Periodic Background Sync` existe mas tem intervalo mínimo de ~12 horas controlado pelo browser baseado em engagement score — **inútil para timers precisos**.

### Workaround: Push do servidor

A única alternativa viável para PWA é implementar timers **no backend**:

1. Usuário cria tarefa com deadline → salva no servidor
2. Servidor agenda job (cron, worker queue) para o horário
3. No momento do deadline, servidor envia Web Push
4. Service Worker acorda e exibe notificação

**Desvantagem**: Requer conexão de internet no momento do alerta. Se usuário estiver offline, não receberá o lembrete.

---

## Comparação de performance e tamanho

| Métrica | APK Nativo | PWA (WebAPK) | TWA | Capacitor |
|---------|------------|--------------|-----|-----------|
| **Cold start** | 300-800ms | 1-3s | 1-2s | 1-4s |
| **Warm start** | 100-300ms | 500ms-1.5s | 400ms-1s | 500ms-2s |
| **RAM típica** | 30-100MB | 50-150MB | 50-150MB | 80-200MB |
| **Tamanho instalação** | 5-30MB | **150KB-1MB** | 2-5MB | 5-30MB |
| **Animações 60fps** | ✅ Consistente | ⚠️ Com CSS otimizado | ⚠️ Igual PWA | ⚠️ Pode ter stuttering |

PWAs brilham em tamanho: **Pinterest PWA tem apenas 150KB** contra 9.6MB do app nativo. Para apps de produtividade simples, a diferença de performance é imperceptível ao usuário.

---

## Distribuição e publicação

### Google Play Store

| Formato | Novos Apps | Requisito API Level 2025 |
|---------|-----------|--------------------------|
| APK | ❌ Não aceito | API 34+ (Android 14) |
| AAB | ✅ Obrigatório | API 35+ após agosto 2025 |
| TWA | ✅ Aceito como AAB | Mesmas regras |

TWA empacotado via Bubblewrap/PWABuilder passa pelo mesmo processo de review. A vantagem é que atualizações da PWA são **instantâneas** — sem necessidade de submeter nova versão na Play Store.

### Instalação fora da Play Store

- **APK**: Sideload com "fontes desconhecidas" habilitado
- **PWA**: Instalação via browser (Add to Home Screen), sem configurações especiais
- **TWA**: Pode ser distribuído como APK fora da Play Store

---

## Matriz de decisão para seu caso de uso

Considerando app de gerenciamento de tarefas com **push notifications**, **timers configuráveis** e **offline**:

| Requisito | PWA Pura | TWA | Capacitor | Nativo |
|-----------|---------|-----|-----------|--------|
| Lista de tarefas offline | ✅ | ✅ | ✅ | ✅ |
| Sincronização em background | ⚠️ Background Sync | ⚠️ | ✅ | ✅ |
| Push para alertas | ✅ Web Push | ✅ Web Push | ✅ FCM | ✅ FCM |
| **Timers que disparam com app fechado** | ❌ **IMPOSSÍVEL** | ❌ **IMPOSSÍVEL** | ✅ Plugin nativo | ✅ AlarmManager |
| **Notificações locais agendadas** | ❌ **IMPOSSÍVEL** | ❌ **IMPOSSÍVEL** | ✅ LocalNotifications | ✅ Completo |
| Badging de tarefas pendentes | ⚠️ Apenas DOT | ⚠️ Apenas DOT | ✅ Com plugin | ✅ Número |
| Time-to-market | Rápido | Rápido | Médio | Lento |
| Custo manutenção | Baixo | Baixo | Médio | Alto |

### Recomendação final

🔴 **PWA pura: NÃO RECOMENDADA** para este caso — timers e notificações agendadas são requisitos impossíveis de atender.

🟡 **TWA + Backend Push**: Viável se timers forem tolerantes a delay de rede. Implementar lógica de agendamento no servidor, que envia push nos horários das tarefas. Limitação: requer conexão no momento do alerta.

🟢 **Capacitor**: **RECOMENDADO** — combina desenvolvimento web (React/Vue/Angular) com plugins nativos para LocalNotifications e alarmes. Usa `@capacitor/local-notifications` para agendar alertas que funcionam com app fechado.

🟢 **Nativo Kotlin**: Ideal se performance e confiabilidade de timers são críticos. AlarmManager + WorkManager + Foreground Service garantem controle total. Maior custo de desenvolvimento.

### Arquitetura híbrida sugerida

```
┌─────────────────────────────────────────────┐
│              UI Web (React/Vue)             │
├─────────────────────────────────────────────┤
│              Capacitor Bridge               │
├──────────────┬───────────────┬──────────────┤
│ LocalNotif   │ PushNotif     │ Storage      │
│ Plugin       │ Plugin (FCM)  │ (SQLite)     │
├──────────────┴───────────────┴──────────────┤
│           Android Native Runtime            │
└─────────────────────────────────────────────┘
```

Esta arquitetura permite:
- **UI em tecnologias web** que você já conhece
- **Notificações locais agendadas** via plugin nativo (funciona offline)
- **Push notifications** via FCM para sincronização com backend
- **Offline-first** com SQLite/IndexedDB
- **Publicação na Play Store** como AAB normal

O plugin `@capacitor/local-notifications` usa AlarmManager internamente no Android, garantindo que seus alertas de tarefas expirando disparem mesmo com app completamente fechado — algo fundamentalmente impossível em PWA pura ou TWA.

---

## Conclusão

A dicotomia "PWA vs Nativo" é simplificada demais. **O ecossistema atual oferece um espectro de opções** — desde PWA pura (máxima simplicidade, mínimo acesso nativo) até Kotlin puro (máximo controle, maior complexidade).

Para um app de tarefas com timers, a **limitação técnica fundamental** é que browsers não expõem APIs para alarmes em background. Notification Triggers foi abandonado, Periodic Background Sync é irregular demais. A solução é usar uma ponte nativa — seja Capacitor com plugins, seja TWA com backend de push timing.

**Capacitor oferece o melhor equilíbrio** para seu caso: mantém a produtividade do desenvolvimento web enquanto acessa as APIs nativas críticas para timers e notificações agendadas. A PWA pura, apesar de suas vantagens em tamanho e simplicidade, simplesmente não consegue atender requisitos de alarme confiáveis no Android.