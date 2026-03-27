# 04 - Dashboard: Experiencia da Primeira Semana (Fator UAU)

## Problema

O Dashboard trata o Dia 1 de uma jornada igual a qualquer outro dia. Nao ha banner especial, nao ha contextualizacao, nao ha mensagem de boas-vindas personalizada. Alem disso, a primeira vez que um usuario completa um habito recebe a mesma celebracao que a centesima vez. Os primeiros 7 dias sao CRITICOS para retencao — e o Dashboard precisa refletir isso.

---

## Estado Atual

### Dashboard.tsx
**Caminho:** `App/src/pages/Dashboard.tsx`

**Deteccoes ja existentes:**
- `isFirstDay` (linhas 409-412) — detecta se e o primeiro dia da jornada
- `todayDayContent` (linhas 415-419) — busca conteudo do dia via `useJourneyDay`
- `firstActiveJourney` — primeira jornada ativa do usuario
- `firstJourneyTheme` (linhas 404-407) — tema de cores da jornada
- `isPerfectDay` (linhas 444-447) — detecta se completou 100% dos habitos

**Dados disponiveis via hooks:**
- `useGamification(userId)` retorna `progress.total_habits_completed` — total historico
- `useAllActiveJourneyHabits()` — habitos de jornadas ativas
- `useJourneyActions()` — `completeDay`, etc.

**Celebracao atual de completar habito:**
- Chama `celebrations.habitComplete()` → glow + haptic.medium() + sounds.complete()
- Mesma intensidade para TODOS os habitos, sempre

### DailyMissionCard.tsx
**Caminho:** `App/src/components/DailyMissionCard.tsx`

- Mostra progresso da jornada (porcentagem, dia atual)
- Auto-expande para primeiros 3 dias (linhas 245-250)
- Mostra preview do conteudo do dia para dias 1-3
- Nao mostra mensagem motivacional alem dos 3 primeiros dias

---

## Proposta

### A. Banner de Dia 1 no Dashboard

Quando `isFirstDay === true`, renderizar um banner proeminente ACIMA da lista de habitos:

```tsx
{isFirstDay && firstActiveJourney && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mx-4 mb-4 p-4 rounded-2xl border"
    style={{
      backgroundColor: `${firstJourneyTheme.color}08`,
      borderColor: `${firstJourneyTheme.color}20`,
    }}
  >
    <div className="flex items-center gap-3">
      <JourneyIllustration themeSlug={firstActiveJourney.theme_slug} size="sm" />
      <div className="flex-1">
        <p className="text-sm font-bold text-foreground">
          Dia 1 de {firstActiveJourney.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Leia o conteudo do dia e complete seus habitos
        </p>
      </div>
    </div>
    <Link
      to={`/journeys/${firstActiveJourney.slug}/day/1`}
      className="mt-3 block"
    >
      <Button
        size="sm"
        className="w-full"
        style={{ backgroundColor: firstJourneyTheme.color }}
      >
        <BookOpen className="w-4 h-4 mr-2" />
        Ler Conteudo do Dia
      </Button>
    </Link>
  </motion.div>
)}
```

**Principio:** BJ Fogg Behavior Model — Motivation (novo dia!) + Ability (botao direto) + Prompt (banner visivel).

### B. Primeira Completacao de Habito Ever — Celebracao Especial

No handler de toggle de habito (linhas ~509-550), detectar se e a PRIMEIRA completacao:

```tsx
const handleToggleHabit = async (habitId: string, completed: boolean) => {
  // ... logica existente ...

  if (completed) {
    const isFirstEver = progress.total_habits_completed === 0;

    if (isFirstEver) {
      // Celebracao EPICA — primeiro habito
      celebrations.levelUp(); // 20 particulas, glow dourado, som level-up
      toast.custom((t) => (
        <XPToast
          xp={10}
          message="Primeiro habito! Isso muda tudo."
          onDismiss={() => toast.dismiss(t)}
        />
      ));
    } else {
      // Celebracao normal
      celebrations.habitComplete();
    }
  }
};
```

**Principio:** Peak-End Rule. O primeiro habito e um momento de pico que precisa ser memoravel. "Isso muda tudo" reforcea a importancia.

### C. Mensagens Motivacionais na Primeira Semana

Expandir o DailyMissionCard para mostrar coaching alem dos 3 primeiros dias:

```tsx
// Mensagens baseadas no dia da jornada
const getFirstWeekMotivation = (dayNumber: number): string | null => {
  const messages: Record<number, string> = {
    1: "Primeiro dia. A decisao mais dificil ja foi tomada.",
    2: "Dia 2. Voce voltou. Isso diz muito sobre voce.",
    3: "Dia 3. Seu cerebro esta comecando a notar o padrao.",
    4: "Dia 4. Maioria nao chega aqui. Voce chegou.",
    5: "Dia 5. Fim de semana chegando. Nao deixe a rotina morrer.",
    6: "Dia 6. Uma semana quase completa. Force um pouco mais.",
    7: "Dia 7. Primeira semana feita. Isso e so o comeco.",
  };
  return messages[dayNumber] || null;
};
```

Renderizar no DailyMissionCard abaixo do progresso:
```tsx
{motivation && (
  <p className="text-xs text-muted-foreground/80 font-serif italic mt-2 px-1">
    "{motivation}"
  </p>
)}
```

**Principio:** Commitment & Consistency. Cada dia reforcea que o usuario esta fazendo algo que "a maioria nao faz".

### D. Som e Vibracao ao Completar Habito

Garantir que todo habito completado gera feedback sensorial:

```tsx
// No handler de toggle, apos completar com sucesso:
if (completed) {
  haptic.success(); // [10ms, 50ms pause, 10ms] — feedback tatil
  sounds.complete(); // som sutil de completude
}
```

Verificar se `celebrations.habitComplete()` ja faz isso — se sim, apenas confirmar que esta ativo. Se nao, adicionar explicitamente.

---

## Implementacao

### Arquivos a Modificar
1. `App/src/pages/Dashboard.tsx` — Banner Dia 1, primeira completacao, som/vibracao
2. `App/src/components/DailyMissionCard.tsx` — Mensagens motivacionais primeira semana

### Imports Adicionais em Dashboard.tsx
```tsx
import { JourneyIllustration } from "@/components/JourneyIllustration";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
```

### Imports Adicionais em DailyMissionCard.tsx
Nenhum — apenas logica interna.

---

## Verificacao

1. **Banner Dia 1:** Iniciar nova jornada → Dashboard mostra banner com nome da jornada + CTA "Ler Conteudo"
2. **Banner nao aparece Dia 2+:** Avancar para dia 2 → banner some
3. **Primeira completacao:** Novo usuario → completar primeiro habito → celebracao levelUp + toast "Primeiro habito! Isso muda tudo."
4. **Segunda completacao:** Mesma sessao, segundo habito → celebracao normal (habitComplete)
5. **Motivacao Dia 1-7:** Ver mensagens diferentes a cada dia no DailyMissionCard
6. **Motivacao Dia 8+:** Sem mensagem (ou mensagem baseada em % — ver doc 09)
7. **Som/vibracao:** Completar habito → som `complete` + vibracao `success` (Android)
8. **Mobile 375px:** Banner nao empurra conteudo para fora da tela

---

## Metricas de Sucesso
- **Leitura de conteudo Dia 1:** Esperado +40% (CTA direto no Dashboard)
- **Completude Dia 1:** Esperado +15% (banner cria urgencia)
- **Retencao D1→D7:** Esperado +10% (mensagens motivacionais mantêm engajamento)
- **Primeiro habito completado:** Celebracao especial cria memoria emocional positiva
