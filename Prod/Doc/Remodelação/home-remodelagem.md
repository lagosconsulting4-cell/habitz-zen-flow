# Remodelagem da Home (Identidade atual – beige/laranja/verde/azul)

Referência visual: identidade do `index.css.txt` (base beige quente, laranja primário, verdes naturais, azul água). Não usar tela laranja chapada; manter fundo beige texturizado e superfícies claras.

## 1) Tokens e base (já definidos)
- Fundo base: beige (`--background`), superfícies brancas/creme (`--card`, `--popover`).
- Primário: laranja `--primary` (ação), secundário/verde `--secondary` (apoio), accent azul `--accent` (detalhes).
- Texto: `--foreground` escuro, `--muted`/`--muted-foreground` terrosos.
- Bordas/inputs: tons claros (`--border`, `--input`), sombras suaves (`--shadow-*`).
- Radius base 12px (`--radius`), pills full para chips/botões arredondados.

## 2) Layout da home
- Container: largura máx ~520-640px, centralizado; padding lateral 16-20px; coluna única.
- Header:
  - Título curto: “Proteja sua sequência, [Nome].”
  - Ações em linha: botão primário laranja (“Criar hábito”) + botão ghost/leve para “Métricas”.
  - Badge do dia (3/9 no dia) em pill vertical claro.
- Card de métricas: caixa arredondada com “Taxa de sucesso” (peso visual principal) e “Melhor streak” (à direita). Fundo branco/creme, sombra leve.
- Seleção de datas: chips arredondados; chip ativo em fundo escuro/primário com texto claro; linha de realce inferior.
- Checkbox “Ocultar concluídos” discreto.

## 3) Grid de hábitos (círculos com barra de progresso)
- Cada hábito é um círculo de ~120-140px, com borda de progresso (stroke circular) no laranja/verde conforme status.
- Ícone central (emoji ou ícone lucide) em fundo transparente.
- Texto do hábito centrado; subtítulo menor (categoria).
- Badge “Pendente” (amarelo suave) no topo do círculo.
- Concluídos: fundo branco, stroke verde claro, check grande central; título verde/escuro.
- Botão “Add task”: círculo pontilhado, ícone “+”, label “Add task”; sem preenchimento sólido.
- Grid 2 colunas (mobile largo) com gap 16-20px; rolagem vertical; padding inferior para não colidir com bottom bar.

## 4) Navegação inferior
- Barra fixa com 3 ícones/labels (Config, Menu, Streaks); fundo branco translúcido com sombra suave.
- Ícones e texto em cor escura; manter altura ~64px.

## 5) Componentes a ajustar (shadcn)
- Button: variantes `primary` (laranja), `ghost` (borda leve), `pill` (radius full). Altura 40-44px.
- Card: radius 16-20px, sombra média; usar para métricas e containers.
- Badge: `pendente` amarelo claro, `done` verde claro.
- Tabs/Chips: pills com fundo claro e ativo escuro/primário.
- Checkbox: borda escura suave, check verde.
- Progress circular: implementar no `CircularHabitCard` com SVG `<circle>`; stroke track neutro, stroke progresso laranja; concluído stroke verde + check.

## 6) Ajustes por arquivo
- `src/pages/Dashboard.tsx`:
  - Reorganizar header (título + ações), card de métricas, chips de datas, checkbox, grid de círculos.
  - Remover textos longos; foco na hierarquia curta da referência.
  - Container central estreito; ocultar sidebar/topbar nessa view.
- `src/components/CircularHabitCard.tsx`:
  - Renderizar círculo com progress stroke, ícone central, título/subtítulo; badge pendente; estado concluído com check e stroke verde.
- `src/components/AddHabitCard`:
  - Círculo pontilhado com “+” e label.
- `src/components/NavigationBar`:
  - Barra fixa inferior com ícones/labels, sombra leve.
- `src/layouts/ProtectedLayout`:
  - Para a home, aplicar container estreito e ocultar sidebar/topbar; garantir padding inferior para bottom bar.
- `src/components/Button`/`Card`/`Badge`/`Checkbox`:
  - Ajustar variantes conforme tokens (laranja/beige/verde/azul) e radius/hover/focus.

## 7) Interações
- Hover/press: escala 0.98-1.02; transições 150-200ms.
- Focus: outline 2-3px laranja/azul, offset 2px.
- Concluir hábito: animação breve no stroke e check.

## 8) Responsividade
- Mobile: 1-2 colunas de círculos; bottom bar fixa; header compacto.
- Tablet/desktop: centralizar com max-width 520-640px; manter vibe mobile-clean.
- Padding inferior extra para não encobrir itens pela bottom bar.

## 9) Pendências/Assets
- Ícones minimalistas para hábitos (pode usar lucide ou emojis enquanto não há set próprio).
- Opcional: texturas leves já aplicadas pelo background; sem ilustrações grandes na home para manter clean.
