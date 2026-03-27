# 09 - Coaching Diario: Mensagens Motivacionais ao Longo da Jornada

## Problema

A jornada de 30 dias nao tem uma camada de coaching/motivacao consistente. O campo `motivational_note` existe em `journey_days` mas so aparece em "cliff days" (dias de desistencia). Os primeiros 3 dias tem um callout de intencao (`showIntentionCallout`), mas do dia 4 ao 30, o usuario abre o conteudo do dia sem contexto motivacional. Falta o "por que estou fazendo isso HOJE" — a voz que guia e motiva.

---

## Estado Atual

### JourneyDayCard.tsx
**Caminho:** `App/src/pages/JourneyDayCard.tsx`

**Conteudo motivacional existente:**
- **Dias 1-3:** `showIntentionCallout` (linhas 529-700) — callout colorido com intencao do dia
- **Cliff days:** `motivational_note` renderizado (linhas 641-647) — nota especial para dias dificeis
- **Demais dias:** NENHUMA mensagem motivacional

**Campo `motivational_note` no banco:**
- Tipo: `text` nullable em `journey_days`
- Populado apenas em cliff days no seed atual
- Pattern existente de render: ja tem componente para exibir

### DailyMissionCard.tsx
**Caminho:** `App/src/components/DailyMissionCard.tsx`

**Conteudo motivacional existente:**
- Auto-expande para primeiros 3 dias (linhas 245-250)
- Mostra preview do conteudo do dia para dias 1-3 (linhas 139-151)
- Nao mostra nenhuma mensagem motivacional para dias 4+

---

## Proposta

### Sistema de Coaching em 3 Camadas

#### Camada 1: Marcos Fixos (Hardcoded, sempre aparecem)
Mensagens para dias especificos que sao universais para qualquer jornada:

```tsx
const MILESTONE_COACHING: Record<number, { title: string; message: string; emoji: string }> = {
  1: {
    title: "Dia 1: O mais difícil",
    message: "80% das pessoas não passam do dia 3. Você está aqui — isso já te coloca à frente.",
    emoji: "🎯",
  },
  3: {
    title: "3 dias seguidos",
    message: "Seu cérebro já está criando novas conexões neurais. A cada dia, fica mais fácil.",
    emoji: "🧠",
  },
  7: {
    title: "1 semana completa",
    message: "Pesquisas mostram que 7 dias é onde o hábito começa a grudar. Você passou.",
    emoji: "🔥",
  },
  10: {
    title: "Dia 10: Zona de perigo",
    message: "Entre os dias 10 e 14, a motivação inicial cai. Discipline supera motivação. Continue.",
    emoji: "⚠️",
  },
  14: {
    title: "2 semanas",
    message: "Você superou a zona de perigo. A maioria desiste antes desse ponto. Você não desistiu.",
    emoji: "💪",
  },
  21: {
    title: "21 dias",
    message: "O mito diz que 21 dias cria um hábito. A ciência diz 66. Mas você já está longe demais pra voltar.",
    emoji: "🏆",
  },
  25: {
    title: "Reta final",
    message: "5 dias para a conclusão. Você está provando para si mesmo que consegue.",
    emoji: "🎯",
  },
  28: {
    title: "Últimos 3 dias",
    message: "Faltam apenas 3 dias. Termine o que começou. Ninguém pode tirar isso de você.",
    emoji: "⭐",
  },
  30: {
    title: "Último dia",
    message: "Você fez o que a maioria não consegue. Hoje é o dia de decidir: quem você é de verdade?",
    emoji: "👑",
  },
};
```

#### Camada 2: Mensagens por Fase (Baseadas no progresso)
Para dias que nao sao marcos, usar mensagem baseada na fase atual:

```tsx
const PHASE_COACHING: Record<string, string[]> = {
  // Fase 1: Consciencia (dias 1-7)
  "AWARENESS": [
    "Observe sem julgar. Entender o problema é o primeiro passo.",
    "Cada medição que você faz é um passo para a mudança.",
    "Não precisa ser perfeito. Precisa ser consistente.",
  ],
  // Fase 2: Fricao (dias 8-14)
  "FRICTION": [
    "Adicionar barreiras ao vício é mais poderoso do que força de vontade.",
    "Cada vez que você resiste, seu cérebro fica mais forte.",
    "O desconforto de hoje é o conforto de amanhã.",
  ],
  // Fase 3: Substituicao (dias 15-22)
  "REPLACEMENT": [
    "Não basta remover o mau hábito. Substitua pelo bom.",
    "O vazio precisa ser preenchido. Você está escolhendo com o quê.",
    "Cada novo hábito ocupa o espaço que antes era do vício.",
  ],
  // Fase 4: Integracao (dias 23-30)
  "INTEGRATION": [
    "Isso não é mais um experimento. Isso é quem você é agora.",
    "A pessoa que começou no dia 1 não existe mais. Você evoluiu.",
    "O piloto automático está se formando. Confie no processo.",
  ],
  // Generico (fallback)
  "DEFAULT": [
    "Consistência supera intensidade. Continue aparecendo.",
    "Cada dia que você completa é uma vitória.",
    "Você está fazendo o que a maioria não faz.",
  ],
};

// Selecionar mensagem rotativa baseada no dia
const getPhaseCoaching = (phaseType: string, dayNumber: number): string => {
  const messages = PHASE_COACHING[phaseType] || PHASE_COACHING["DEFAULT"];
  return messages[dayNumber % messages.length];
};
```

#### Camada 3: motivational_note do Banco (Prioridade Maxima)
Se o dia tem `motivational_note` populado no banco, usa ele em vez das outras camadas:

```tsx
const getCoaching = (
  dayNumber: number,
  phaseType: string,
  motivationalNote?: string | null
): { title?: string; message: string } => {
  // Prioridade 1: Nota do banco
  if (motivationalNote) {
    return { message: motivationalNote };
  }
  // Prioridade 2: Marco fixo
  const milestone = MILESTONE_COACHING[dayNumber];
  if (milestone) {
    return { title: milestone.title, message: milestone.message };
  }
  // Prioridade 3: Mensagem da fase
  return { message: getPhaseCoaching(phaseType, dayNumber) };
};
```

---

## Onde Renderizar

### A. JourneyDayCard.tsx — Callout de Coaching

Estender o pattern de `showIntentionCallout` (ja existe para dias 1-3):

```tsx
// Apos o conteudo do dia, antes dos habitos:
const coaching = getCoaching(dayNumber, currentPhase?.phase_type, day?.motivational_note);

{coaching && (
  <motion.div
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    className="mx-4 mt-4 p-3 rounded-xl border"
    style={{
      backgroundColor: `${theme.color}05`,
      borderColor: `${theme.color}15`,
    }}
  >
    {coaching.title && (
      <p className="text-xs font-bold text-foreground mb-1">
        {coaching.title}
      </p>
    )}
    <p className="text-xs text-muted-foreground/80 font-serif italic leading-relaxed">
      "{coaching.message}"
    </p>
  </motion.div>
)}
```

### B. DailyMissionCard.tsx — Linha Motivacional Breve

Uma versao compacta (1 linha) para o card do Dashboard:

```tsx
// Abaixo do progresso da jornada:
{journeyCoaching && (
  <p className="text-[10px] text-muted-foreground/60 font-serif italic mt-1 line-clamp-1">
    "{journeyCoaching}"
  </p>
)}
```

---

## Implementacao

### Arquivos a Modificar
1. `App/src/pages/JourneyDayCard.tsx` — Callout de coaching
2. `App/src/components/DailyMissionCard.tsx` — Linha motivacional

### Logica de Coaching
Embarcada diretamente nos componentes (constantes + funcao helper). NAO no banco.
- **Vantagem:** Deploy imediato, zero migration
- **Futuro:** Se equipe de conteudo precisar editar, migrar para coluna `coaching_messages` JSON em `journey_days`

### Dados Necessarios
- `dayNumber` — ja disponivel
- `currentPhase?.phase_type` — ja disponivel (pode ser inferido do numero da fase)
- `day?.motivational_note` — ja buscado pelo hook `useJourneyDay`

---

## Exemplos de Experiencia do Usuario

### Dia 1 (Digital Detox):
> **Dia 1: O mais difícil**
> "80% das pessoas não passam do dia 3. Você está aqui — isso já te coloca à frente."

### Dia 5 (qualquer jornada):
> "Não precisa ser perfeito. Precisa ser consistente."

### Dia 7 (marco):
> **1 semana completa**
> "Pesquisas mostram que 7 dias é onde o hábito começa a grudar. Você passou."

### Dia 12 (fase FRICTION):
> "Cada vez que você resiste, seu cérebro fica mais forte."

### Dia 21 (marco):
> **21 dias**
> "O mito diz que 21 dias cria um hábito. A ciência diz 66. Mas você já está longe demais pra voltar."

### Dia 30 (marco):
> **Último dia**
> "Você fez o que a maioria não consegue. Hoje é o dia de decidir: quem você é de verdade?"

---

## Verificacao

1. **Dia 1:** Callout com titulo "Dia 1: O mais difícil" + mensagem
2. **Dia 5:** Mensagem da fase (sem titulo)
3. **Dia 7:** Callout com titulo "1 semana completa"
4. **Dia 12:** Mensagem rotativa da fase FRICTION
5. **Dia 21:** Callout com titulo "21 dias"
6. **Dia 30:** Callout com titulo "Último dia"
7. **Cliff day com motivational_note:** Nota do banco tem prioridade sobre marcos
8. **DailyMissionCard:** Linha breve com mensagem do dia
9. **Mobile:** Callout cabe sem overflow
10. **Nao intrusivo:** Mensagem e sutil, nao bloqueia conteudo

---

## Metricas de Sucesso
- **Retencao dia 3:** Mensagem "80% nao passam do dia 3" cria compromisso de superar
- **Retencao dia 10-14:** Aviso de "zona de perigo" prepara mentalmente
- **Completude de jornada:** Coaching progressivo reduz abandono em ~15%
- **Feedback qualitativo:** Usuarios mencionam "senti que alguem acreditava em mim"
