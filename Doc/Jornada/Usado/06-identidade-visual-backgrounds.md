# 06 - Identidade Visual: Backgrounds Artisticos e Atmosfera por Jornada

## Problema

As jornadas do Bora tem um sistema de cores por tema (violet, amber, red, blue, emerald) com icones Lucide, mas faltam **backgrounds artisticos**, **ilustracoes customizadas** e **atmosfera visual** que criem uma identidade unica por jornada. O JourneyDetail tem apenas um gradiente a 5% de opacidade como "atmosfera" — quase invisivel. Os cards do JourneyHub sao funcionais mas nao tem personalidade visual.

Apps premium como Headspace, Calm e Duolingo investem pesado em identidade visual com ilustracoes customizadas. O Bora precisa dessa camada.

---

## Estado Atual

### Sistema de Temas (`App/src/components/JourneyIllustration.tsx`, 154 linhas)

5 temas definidos com icones Lucide:

| Tema | Cor | Icone | Classes Tailwind |
|------|-----|-------|-----------------|
| digital-detox | #8B5CF6 (violet) | Smartphone | text-violet-400, bg-violet-500/10 |
| own-mornings | #F59E0B (amber) | Sunrise | text-amber-400, bg-amber-500/10 |
| gym | #EF4444 (red) | Dumbbell | text-red-400, bg-red-500/10 |
| focus-protocol | #3B82F6 (blue) | Brain | text-blue-400, bg-blue-500/10 |
| finances | #10B981 (emerald) | Wallet | text-emerald-400, bg-emerald-500/10 |

Cada tema tem: `icon`, `color`, `textClass`, `bgClass`, `borderClass`, `gradientClass`, `label`

### JourneyDetail.tsx — Gradiente Atual (linhas 59-66)
```tsx
style={{
  paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))',
  background: `linear-gradient(180deg, ${theme.color}0D 0%, transparent 100%)`,
}}
```
- `0D` em hex = 5% opacidade — MUITO sutil, quase invisivel em dark mode
- Linear gradient de cima para baixo, fade para transparente

### JourneyHub.tsx — Cards do Catalogo (linhas 112-208)
- Accent stripe no topo do card (4px, cor do tema)
- Icone `JourneyIllustration` com gradiente e glow
- Background do card e `bg-card` padrao

### Campo no Banco: `cover_image_url`
- Existe em `journeys` table (migration 20260218)
- Tipo: `text` nullable
- Valor atual: **NULL em todas as linhas**
- Pronto para receber URLs de imagens

### Supabase Storage
- Bucket `meditation-audios` ja existe e funciona
- Pattern de signed URLs em `App/src/lib/storage.ts`
- Pronto para criar novo bucket `journey-images`

---

## Proposta: Estrategia em 2 Fases

### Fase A — Gradientes Avancados (Implementar Agora)
Sem dependencia de artes externas. Puro CSS/code.

### Fase B — Imagens Artisticas Customizadas (Implementar Quando Artes Estiverem Prontas)
Depende do usuario gerar/fornecer as imagens.

---

## Fase A: Gradientes Avancados

### A1. JourneyDetail — Atmosfera Rica no Header

**De:** Gradiente linear a 5% → quase invisivel
**Para:** Gradiente radial multi-layer com textura

```tsx
// JourneyDetail.tsx header (linhas 59-66)
style={{
  paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))',
  background: `
    radial-gradient(ellipse at 50% 0%, ${theme.color}1A 0%, transparent 60%),
    radial-gradient(circle at 80% 20%, ${theme.color}0F 0%, transparent 40%),
    linear-gradient(180deg, ${theme.color}08 0%, transparent 40%)
  `,
}}
```

**Resultado:** Atmosfera mais presente com 3 camadas de gradiente:
1. Elipse grande no topo (10% opacidade) — luz principal
2. Circulo menor no canto (6% opacidade) — luz secundaria
3. Linear sutil (3% opacidade) — fade de base

### A2. JourneyDetail — Pattern Overlay Sutil

Adicionar um pattern de pontos ou linhas para dar textura ao header:

```tsx
// Adicionar div overlay dentro do header
<div
  className="absolute inset-0 pointer-events-none opacity-[0.03]"
  style={{
    backgroundImage: `radial-gradient(${theme.color} 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
  }}
/>
```

**Resultado:** Grid de pontos sutil que da sensacao de profundidade e sofisticacao.

### A3. JourneyHub — Cards com Borda Gradient Mais Vibrante

**De:** Accent stripe 4px no topo
**Para:** Borda superior com gradiente + sombra sutil do tema

```tsx
// JourneyCatalogCard (linhas 112-208)
// Accent stripe existente (linha ~130):
<div className="h-1 rounded-t-2xl" style={{ backgroundColor: theme.color }} />

// Adicionar shadow glow ao card:
<div
  className="rounded-2xl overflow-hidden border bg-card"
  style={{
    boxShadow: `0 4px 20px ${theme.color}10, 0 0 0 1px ${theme.color}15`,
  }}
>
```

### A4. JourneyHub — Background do Icone Mais Rico

Substituir o icone simples por um tratamento mais elaborado no card:

```tsx
// Ao inves de JourneyIllustration simples, adicionar glow backdrop:
<div className="relative">
  <div
    className="absolute inset-0 blur-xl opacity-20 rounded-full"
    style={{ backgroundColor: theme.color }}
  />
  <JourneyIllustration themeSlug={journey.theme_slug} size="lg" />
</div>
```

### A5. JourneyDayCard — Atmosfera por Dia

O card de conteudo do dia tambem pode ter atmosfera do tema:

```tsx
// Topo do JourneyDayCard — gradiente sutil
<div
  className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
  style={{
    background: `linear-gradient(180deg, ${theme.color}08 0%, transparent 100%)`,
  }}
/>
```

---

## Fase B: Imagens Artisticas Customizadas

### B1. Criar Bucket Supabase Storage

```sql
-- Criar bucket para imagens de jornada
INSERT INTO storage.buckets (id, name, public)
VALUES ('journey-images', 'journey-images', true);

-- Policy para leitura publica
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'journey-images');

-- Policy para upload autenticado (admin)
CREATE POLICY "Allow authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'journey-images' AND auth.role() = 'authenticated');
```

### B2. Atualizar `cover_image_url` nas Jornadas

Apos upload das imagens:
```sql
UPDATE public.journeys
SET cover_image_url = 'https://[project].supabase.co/storage/v1/object/public/journey-images/digital-detox-cover.webp'
WHERE slug = 'digital-detox-l1';
-- ... repetir para cada jornada
```

### B3. Renderizar Cover Image no JourneyDetail

```tsx
// No header do JourneyDetail, antes do conteudo:
{journey.cover_image_url && (
  <div className="absolute inset-0 overflow-hidden rounded-b-3xl">
    <img
      src={journey.cover_image_url}
      alt=""
      className="w-full h-full object-cover"
      style={{ opacity: 0.15 }}
    />
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(180deg, transparent 0%, var(--background) 100%)`,
      }}
    />
  </div>
)}
```

**Nota:** Opacidade baixa (15%) para nao competir com o texto. Gradiente embaixo para fade para o background.

### B4. Hero Image nos Cards do JourneyHub

```tsx
// No JourneyCatalogCard, substituir area do icone:
{journey.cover_image_url ? (
  <div className="relative h-28 overflow-hidden rounded-t-2xl">
    <img
      src={journey.cover_image_url}
      alt=""
      className="w-full h-full object-cover"
    />
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(180deg, transparent 30%, var(--card) 100%)`,
      }}
    />
  </div>
) : (
  // Fallback: icone atual
  <JourneyIllustration themeSlug={journey.theme_slug} size="lg" />
)}
```

### B5. Sugestao de Imagens por Jornada

Para o usuario gerar/escolher:

| Jornada | Estilo Sugerido | Descricao |
|---------|----------------|-----------|
| Eu Controlo a Tela | Minimalista tech | Silhueta de pessoa quebrando correntes digitais, tons violeta |
| Manha de Elite | Sunrise golden | Horizonte dourado com silhueta meditando, tons amber |
| Do Zero ao Treino | Energetico | Silhueta em academia com luz vermelha dramatica |
| Foco Inabalavel | Cerebral/clean | Cerebro com ondas de concentracao, tons azuis |
| Nunca Mais Quebrado | Empoderamento | Moedas/graficos ascendentes, tons esmeralda |

**Formato recomendado:** WebP, 800x400px, otimizado para < 50KB.

---

## Implementacao

### Fase A — Arquivos a Modificar
1. `App/src/pages/JourneyDetail.tsx` — Gradiente rico + pattern overlay
2. `App/src/pages/JourneyHub.tsx` — Card shadows + icone glow
3. `App/src/pages/JourneyDayCard.tsx` — Gradiente sutil no topo (opcional)

### Fase B — Arquivos a Criar/Modificar
1. Migration SQL para bucket + policies (CRIAR)
2. Migration SQL para atualizar cover_image_url (CRIAR — apos upload)
3. `App/src/pages/JourneyDetail.tsx` — Render de cover image
4. `App/src/pages/JourneyHub.tsx` — Hero image nos cards

### Sem Novos Componentes
Tudo e feito com CSS/inline styles e tags HTML existentes.

---

## Verificacao

### Fase A
1. JourneyDetail header tem atmosfera visivel (gradiente radial multi-layer)
2. Pattern de pontos e sutil mas perceptivel
3. Cards do Hub tem shadow glow do tema
4. Dark mode: gradientes continuam visiveis e bonitos
5. Light mode: gradientes nao ficam "lavados"
6. Mobile 375px: sem overflow, performance ok

### Fase B
1. Bucket `journey-images` criado e acessivel
2. Cover image renderiza no JourneyDetail com fade
3. Hero image renderiza no card do JourneyHub
4. Fallback para icone quando `cover_image_url` e NULL
5. Imagens < 50KB, carregam rapido

---

## Metricas de Sucesso
- **Percepcao de qualidade:** Visual e o primeiro criterio de julgamento. Premium feel = mais confianca
- **Tempo na pagina JourneyDetail:** Esperado +15% (atmosfera visual convida a explorar)
- **Conversao para iniciar jornada:** Esperado +10% (visual premium aumenta valor percebido)
