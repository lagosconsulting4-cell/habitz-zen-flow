# 07 - Journey Hub: De Catalogo de Cursos para Launchpad de Transformacao

## Problema

O JourneyHub (`/journeys`) atualmente funciona como um **catalogo de cursos** — titulo "Jornadas", subtitulo generico, lista de cards. Nao ha emocao, nao ha prova social, nao ha senso de urgencia. Para o usuario, parece uma lista de opcoes, nao um ponto de partida para uma transformacao de vida.

---

## Estado Atual

### JourneyHub.tsx (310 linhas)
**Caminho:** `App/src/pages/JourneyHub.tsx`

**Estrutura atual:**
1. **Header (linhas 252-258):**
   ```tsx
   <h1 className="text-2xl font-bold">Jornadas</h1>
   <p className="text-sm text-muted-foreground">
     Transformacoes guiadas de 30 dias
   </p>
   ```
2. **Secao "Em Andamento" (linhas 260-280):** Cards de jornadas ativas com progresso
3. **Secao "Explorar" / "Escolha sua jornada" (linhas 282-310):** Cards do catalogo completo

**ActiveJourneyCard (linhas 20-107):**
- Progress ring SVG (circulo de progresso)
- Titulo + "Dia X de 30 · Fase Y"
- Botao "Continuar"
- Borda e glow com cor do tema

**JourneyCatalogCard (linhas 112-208):**
- Accent stripe (4px, cor do tema)
- Icone `JourneyIllustration`
- Titulo + subtitulo + promise (MUITO pequena: `text-xs text-muted-foreground`)
- Tags (duracao, nivel)
- Lock icon para L2 bloqueadas
- Badge "Completada" se ja terminou

---

## Proposta

### 1. Hero Section — Frase de Identidade + Prova Social

Substituir o header generico por uma secao emocional:

```tsx
<div className="text-center space-y-2 pt-2 pb-4">
  <h1 className="text-2xl font-bold text-foreground">
    Escolha quem você vai ser
  </h1>
  <p className="text-sm text-muted-foreground font-serif italic">
    nos próximos 30 dias
  </p>
  <div className="flex items-center justify-center gap-1.5 mt-2">
    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
    <p className="text-xs text-primary/80 font-medium">
      2.847 caras transformando suas vidas agora
    </p>
  </div>
</div>
```

**Elementos:**
- **"Escolha quem voce vai ser"** — identidade, nao atividade (Identity-Based Change)
- **"nos proximos 30 dias"** — serif italic, elegante, urgencia temporal
- **Contador social** — prova social com dot pulsante (sensacao de "ao vivo")

**Implementacao do contador:**
- MVP: Hardcoded "2.847"
- Futuro: RPC que conta `SELECT count(*) FROM user_journey_state WHERE status = 'active'`

### 2. Active Journey Card — Mensagem Motivacional

Adicionar mensagem contextual baseada no progresso abaixo da info de dia/fase:

```tsx
// Dentro de ActiveJourneyCard, apos "Dia X de Y · Fase Z":
<p className="text-xs text-muted-foreground/70 font-serif italic mt-1">
  "{getMotivation(state.completion_percent, state.current_day)}"
</p>

// Helper:
const getMotivation = (percent: number, day: number): string => {
  if (day <= 3) return "Os primeiros dias sao os mais importantes. Continue.";
  if (percent < 25) return "Cada dia conta. Voce esta construindo disciplina.";
  if (percent < 50) return "Quase na metade. Seu cerebro ja esta mudando.";
  if (percent < 75) return "Maioria desiste antes desse ponto. Voce nao.";
  return "Reta final. Termine o que comecou.";
};
```

**Principio:** Goal-Gradient Effect + Commitment & Consistency.

### 3. Catalog Cards — Promise Mais Proeminente

A promise e o texto mais importante do card mas esta em `text-xs text-muted-foreground`:

```tsx
// ANTES (linha ~160-162):
<p className="text-xs text-muted-foreground line-clamp-2">
  {journey.promise}
</p>

// DEPOIS:
<p className="text-sm text-foreground/80 font-medium line-clamp-2 leading-snug">
  {journey.promise}
</p>
```

### 4. Catalog Cards — Prova Social

Adicionar contador de completude abaixo do promise:

```tsx
<p className="text-[10px] text-muted-foreground/50 mt-1.5 flex items-center gap-1">
  <Users className="w-3 h-3" />
  {getSocialProof(journey.slug)}
</p>

// Helper (hardcoded MVP):
const SOCIAL_PROOF: Record<string, string> = {
  "digital-detox-l1": "2.8K completaram",
  "own-mornings-l1": "3.1K completaram",
  "gym-l1": "4.2K completaram",
  "focus-protocol-l1": "1.9K completaram",
  "finances-l1": "2.4K completaram",
  // L2s:
  "digital-detox-l2": "890 completaram",
  "own-mornings-l2": "1.1K completaram",
  "gym-l2": "1.5K completaram",
  "focus-protocol-l2": "720 completaram",
  "finances-l2": "980 completaram",
};
```

### 5. Secao "Explorar" — Header Condicional

**Se usuario NAO tem jornada ativa:**
```tsx
<h2 className="text-lg font-semibold">Comece sua transformacao</h2>
```

**Se usuario JA tem jornada ativa:**
```tsx
<h2 className="text-lg font-semibold">Proxima transformacao</h2>
```

---

## Implementacao

### Arquivo a Modificar
`App/src/pages/JourneyHub.tsx`

### Mudancas Especificas
1. **Linhas 252-258:** Substituir header por hero section com prova social
2. **Linhas 85-90:** Adicionar mensagem motivacional no ActiveJourneyCard
3. **Linhas 160-162:** Aumentar prominence do promise text
4. **Apos promise text:** Adicionar prova social por jornada
5. **Linhas 282-285:** Header condicional "Comece" vs "Proxima"

### Imports Adicionais
```tsx
import { Users } from "lucide-react";
```

---

## Verificacao

1. **Hero section:** Titulo "Escolha quem voce vai ser" + serif italic + dot pulsante + contador
2. **Jornada ativa:** Mensagem motivacional contextual aparece abaixo do progresso
3. **Promise:** Texto legivel, font-medium, nao mais muted
4. **Prova social:** Cada card mostra "X completaram" com icone Users
5. **Header condicional:** Sem jornada ativa = "Comece"; com jornada = "Proxima"
6. **Mobile 375px:** Hero section cabe sem quebra, cards nao fazem overflow
7. **Dark mode:** Contraste adequado para todos os novos textos

---

## Metricas de Sucesso
- **Engajamento no Hub:** +15% cliques em cards (promise mais legivel + prova social)
- **Inicio de jornada:** +20% (hero section cria urgencia + identidade)
- **Tempo na pagina:** +10% (mensagens motivacionais criam engajamento)
