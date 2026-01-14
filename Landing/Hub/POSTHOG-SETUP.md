# Guia de Configuração PostHog - TikTok Landing Page

## 📋 Resumo

Esta página (`habitz.life/tiktok`) agora rastreia cliques nos banners BORA e Foquinha usando PostHog. Este guia explica como configurar e visualizar os dados.

---

## 🔑 PASSO 1: Configurar a API Key

### Encontrar sua API Key do PostHog

1. **Acesse o PostHog Dashboard**
   - Vá para: https://app.posthog.com
   - Faça login na sua conta

2. **Navegue até Project Settings**
   - Clique no ícone de engrenagem (⚙️) no canto superior direito
   - Ou acesse diretamente: https://app.posthog.com/project/settings

3. **Copie a Project API Key**
   - Na seção "Project API Key", você verá uma chave como: `phc_xxxxxxxxxxxxxxxxxx`
   - Clique no botão "Copy" para copiar

### Substituir no código

1. **Abra o arquivo**: `Landing/Hub/index.html`

2. **Encontre a linha 24** (onde está `'YOUR_PROJECT_API_KEY'`)

3. **Substitua** `'YOUR_PROJECT_API_KEY'` pela sua chave real:

```javascript
// ANTES:
posthog.init('YOUR_PROJECT_API_KEY', {

// DEPOIS (exemplo):
posthog.init('phc_abc123def456ghi789', {
```

4. **Salve o arquivo** e faça deploy

---

## 📊 PASSO 2: Visualizar os Dados

### 2.1 Ver eventos em tempo real

1. **Acesse Live Events**
   - No PostHog Dashboard, vá para: https://app.posthog.com/events
   - Ou clique em "Events" na barra lateral esquerda

2. **Teste os cliques**
   - Abra `habitz.life/tiktok` em uma nova aba
   - Clique nos banners BORA e Foquinha
   - Volte para o PostHog e atualize a página de Events

3. **Procure pelo evento `banner_click`**
   - Você verá os eventos com as propriedades:
     - `banner`: "bora" ou "foquinha"
     - `page`: "tiktok"

### 2.2 Criar análises (Insights)

1. **Acesse Insights**
   - Vá para: https://app.posthog.com/insights
   - Clique em "New Insight"

2. **Configure a análise de cliques**
   - **Event**: Selecione `banner_click`
   - **Breakdown**: Selecione `banner` (para ver BORA vs Foquinha separadamente)
   - **Visualization**: Escolha "Bar Chart" ou "Line Chart"

3. **Salve a análise**
   - Clique em "Save" e dê um nome como "Cliques nos Banners TikTok"

### 2.3 Criar Dashboard

1. **Crie um Dashboard**
   - Vá para: https://app.posthog.com/dashboard
   - Clique em "New Dashboard"
   - Dê um nome: "TikTok Landing Performance"

2. **Adicione Insights úteis**:

   **Insight 1: Total de Cliques por Banner**
   - Event: `banner_click`
   - Breakdown: `banner`
   - Visualization: Bar Chart

   **Insight 2: Cliques ao longo do tempo**
   - Event: `banner_click`
   - Breakdown: `banner`
   - Visualization: Line Chart
   - Date Range: Last 30 days

   **Insight 3: CTR (Click-Through Rate)**
   - Event: `$pageview` (para page views)
   - Event: `banner_click` (para clicks)
   - Formula: (clicks / pageviews) * 100

   **Insight 4: Banner mais clicado**
   - Event: `banner_click`
   - Breakdown: `banner`
   - Visualization: Pie Chart

3. **Salve o Dashboard**
   - Clique em "Save"

---

## 🎯 PASSO 3: Insights Úteis

### Perguntas que você pode responder:

1. **Qual banner tem mais cliques?**
   - Use o breakdown por `banner` para comparar BORA vs Foquinha

2. **Qual horário tem mais cliques?**
   - Crie um insight com breakdown por "Hour of Day"

3. **Qual dispositivo clica mais?**
   - Adicione breakdown por `$device_type` (mobile vs desktop)

4. **Qual a taxa de conversão?**
   - Compare pageviews de `/tiktok` com `banner_click` events

### Exemplo de fórmulas úteis:

```
CTR = (banner_click / $pageview) * 100
CTR BORA = (banner_click WHERE banner=bora / $pageview) * 100
CTR Foquinha = (banner_click WHERE banner=foquinha / $pageview) * 100
```

---

## 🔔 PASSO 4: (Opcional) Configurar Alertas

1. **Crie um alerta para queda de cliques**
   - Vá para: Settings → Alerts
   - Configure: "Alert me if banner_click drops below X per day"

2. **Email notifications**
   - Configure em: Settings → Notifications

---

## 🧪 Como Testar

1. **Teste local (antes do deploy)**
   - Abra `Landing/Hub/index.html` localmente
   - Abra o Console do navegador (F12)
   - Clique nos banners
   - Você deve ver: `PostHog inicializado com sucesso` no console
   - E as chamadas de `posthog.capture` na aba Network

2. **Teste em produção**
   - Acesse `habitz.life/tiktok`
   - Clique nos banners
   - Vá para PostHog → Events e confirme que os eventos aparecem

---

## 📝 Dados Capturados

### Evento: `banner_click`

Propriedades enviadas:
- `banner`: string ("bora" | "foquinha")
- `page`: string ("tiktok")

Propriedades automáticas do PostHog:
- `$current_url`: URL da página
- `$browser`: Navegador do usuário
- `$device_type`: "Desktop" | "Mobile" | "Tablet"
- `$os`: Sistema operacional
- `$pathname`: Caminho da URL
- `$viewport_height` / `$viewport_width`: Dimensões da tela
- `$timestamp`: Data/hora do evento

---

## ⚡ Resolução de Problemas

### Eventos não aparecem no PostHog?

1. **Verifique se a API Key está correta**
   - Certifique-se que substituiu `YOUR_PROJECT_API_KEY`
   - Verifique se não há espaços extras

2. **Verifique o Console**
   - Abra F12 → Console
   - Procure por erros relacionados ao PostHog
   - Deve ver: "PostHog inicializado com sucesso"

3. **Verifique o Network**
   - Abra F12 → Network
   - Filtre por "batch" ou "decide"
   - Clique nos banners e veja se há requests para `app.posthog.com`

4. **Teste em modo anônimo**
   - Extensões do navegador podem bloquear o PostHog
   - Teste em uma janela anônima

---

## 🚀 Próximos Passos

### Melhorias futuras que você pode adicionar:

1. **Rastrear tempo na página**
   - Quanto tempo o usuário fica antes de clicar?

2. **Rastrear scroll depth**
   - O usuário viu ambos os banners?

3. **A/B Testing**
   - Testar diferentes imagens nos banners
   - PostHog tem suporte nativo para A/B tests

4. **Funil de conversão**
   - Pageview → Banner Click → Landing Page View → Purchase

---

## 📚 Recursos Adicionais

- **PostHog Docs**: https://posthog.com/docs
- **Event tracking**: https://posthog.com/docs/product-analytics/capture-events
- **Dashboards**: https://posthog.com/docs/product-analytics/dashboards
- **Insights**: https://posthog.com/docs/product-analytics/insights

---

**Última atualização**: 2026-01-14
