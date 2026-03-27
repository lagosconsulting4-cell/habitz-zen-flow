# 08 - Journey Detail: Narrativa de Transformacao e Secao Antes/Depois

## Problema

A pagina de detalhe da jornada (`JourneyDetail.tsx`) e limpa e funcional, mas falta **narrativa de transformacao**. Os campos `target_audience` e `expected_result` existem no banco e estao populados no seed, mas NAO sao exibidos na UI. O usuario ve a promise em italico e uma timeline de fases, mas nao ve claramente o "antes" (quem ele e hoje) vs "depois" (quem ele sera em 30 dias).

---

## Estado Atual

### JourneyDetail.tsx (390 linhas)
**Caminho:** `App/src/pages/JourneyDetail.tsx`

**Estrutura atual do header:**
1. Gradiente atmosferico sutil (5% opacity) — linhas 59-66
2. Botao "Voltar" — linha 68
3. `JourneyIllustration` (lg) — linha 72
4. Titulo + Subtitulo + Level badge — linhas 75-88
5. **Promise (serif italic, borda esquerda)** — linhas 89-96
6. Progress bar (se inscrito) — linhas 98-110
7. Botoes de acao (Comecar/Pausar/Retomar) — linhas 112-145
8. Timeline de fases — linhas 178-385

### Campos Subutilizados no Banco

Estes campos existem no schema (`journeys` table) e estao populados:

| Campo | Exemplo (Digital Detox L1) |
|-------|---------------------------|
| `target_audience` | "Homens 20-25 anos que sentem que passam tempo demais no celular" |
| `expected_result` | "Reduza seu tempo de tela pela metade, durma 1 hora a mais por noite e recupere sua capacidade de foco" |
| `description` | Texto longo descrevendo a jornada |
| `tags` | Array de tags relevantes |

**O `target_audience` e `expected_result` sao o par PERFEITO para "Antes/Depois".**

### Dados Ja Buscados pelo Hook
`useJourneyDetail(slug)` ja retorna todos esses campos. Nao precisa nova query.

---

## Proposta

### 1. Secao "Antes → Depois" (Para Usuarios Nao-Inscritos)

Adicionar entre a promise e os botoes de acao:

```tsx
{/* Transformacao visual: Antes → Depois */}
{journey.target_audience && journey.expected_result && !isEnrolled && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="grid grid-cols-2 gap-3 mt-4"
  >
    {/* ANTES */}
    <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
      <div className="flex items-center gap-1 mb-1.5">
        <X className="w-3 h-3 text-red-400" />
        <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
          Hoje
        </p>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {journey.target_audience}
      </p>
    </div>

    {/* DEPOIS */}
    <div
      className="p-3 rounded-xl"
      style={{
        backgroundColor: `${theme.color}08`,
        border: `1px solid ${theme.color}15`,
      }}
    >
      <div className="flex items-center gap-1 mb-1.5">
        <Check className="w-3 h-3" style={{ color: theme.color }} />
        <p
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: theme.color }}
        >
          Em 30 dias
        </p>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {journey.expected_result}
      </p>
    </div>
  </motion.div>
)}
```

**Principio psicologico:**
- **Loss Aversion:** A coluna "HOJE" em vermelho mostra o que o usuario ESTA PERDENDO ao nao agir
- **Contrast Effect:** Ver o "antes" e "depois" lado a lado amplifica a diferenca percebida
- **Identity-Based Change:** "Em 30 dias" = visao futura de quem ele sera

**Nota:** So aparece para usuarios NAO-inscritos. Depois de iniciar a jornada, essa secao some (ja esta comprometido).

### 2. Atmosfera Visual Rica (Detalhado no Doc 06)

Upgrade do gradiente de 5% para sistema multi-layer (ver doc 06-identidade-visual-backgrounds.md).

### 3. Timeline de Fases — Polish Visual (P2)

A timeline ja funciona com accordion. Para P2:
- Fases futuras com opacity reduzida (dimmed)
- Fase atual com glow pulsante
- Fase concluida com check animado
- Descricao da fase mais visivel (campo `description` ja existe)

---

## Implementacao

### Arquivo a Modificar
`App/src/pages/JourneyDetail.tsx`

### Onde Inserir
Apos a promise (linha 96) e antes do progress bar (linha 98).

### Imports Adicionais
```tsx
import { X, Check } from "lucide-react"; // X pode ja estar importado
```

### Dados Necessarios
- `journey.target_audience` — ja buscado pelo hook
- `journey.expected_result` — ja buscado pelo hook
- `isEnrolled` — ja calculado no componente
- `theme.color` — ja disponivel

---

## Verificacao

1. **Nao inscrito:** Secao "Hoje" / "Em 30 dias" aparece entre promise e botao "Comecar"
2. **Inscrito:** Secao NAO aparece (ja esta na jornada)
3. **Layout:** Grid 2 colunas com espacamento adequado
4. **Cores:** "Hoje" em vermelho sutil, "Em 30 dias" na cor do tema
5. **Animacao:** Fade-in com delay de 0.2s
6. **Mobile 375px:** Colunas cabem lado a lado sem overflow
7. **Dark mode:** Backgrounds sutis visiveis sem conflito
8. **Jornada sem dados:** Se `target_audience` ou `expected_result` forem null, secao nao renderiza

---

## Metricas de Sucesso
- **Conversao para iniciar jornada:** Esperado +15-25% (Antes/Depois e tecnica de vendas comprovada)
- **Tempo na pagina:** Esperado +10% (mais conteudo relevante para consumir)
- **Percepcao de valor:** Usuarios devem entender claramente o que vao ganhar
