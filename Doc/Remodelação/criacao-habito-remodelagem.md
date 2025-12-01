# Remodelagem da página de criação de hábitos (modo popup)

Identidade visual: usar o tema atual (beige/laranja/verde/azul) do `index.css.txt`. Nada de tela laranja chapada. Fundo claro, ícones e acentos no laranja/verde/azul.

## 1) Estrutura e navegação
- A criação vira um **popup modal** fullscreen (mobile-first), sem bottom navigation nem topbar; apenas um “X” no canto superior esquerdo/direito para fechar.
- Fluxo em 3 etapas (deslizar/empilhar telas):
  1. Selecionar **categoria** (6 categorias, cada uma com ícone e descrição curta).
  2. Exibir **lista de tarefas pré-definidas** da categoria (ícone + título); ao tocar abre a tela de detalhes.
  3. **Detalhes/confirmar task**: tela com ícone grande circular, título, alertas e campos essenciais (meta, recorrência, notificações). CTA “Salvar hábito” fixo no final.
- Sem nav bar, sem textos longos; manter copy enxuta.

## 2) Categorias (step 1)
- Grade de 2 colunas, cards/pills altos com ícone circular e título. Radius 16px, sombra leve, fundo branco/creme.
- 6 categorias sugeridas (pode ajustar nomes, mas manter 6):
  - Movimento (ícone corrida)
  - Mente (ícone meditação/brain)
  - Nutrição (ícone fruta/prato)
  - Sono/Recuperação (ícone lua)
  - Produtividade (ícone check/clipboard)
  - Pessoal/Social (ícone coração/mensagem)
- Cada card mostra uma descrição curta ao clicar (exibir abaixo ou em tooltip/expansão): “Rotinas de exercício e passos”, “Mindfulness e foco”, etc.
- Estilo de ícone: linha simples, cantos arredondados, 2-3px, com preenchimento sutil na paleta (laranja/verde/azul).

## 3) Lista de tarefas pré-definidas (step 2)
- Lista em cards (full-width) com:
  - Ícone circular colorido à esquerda (mesmo set da categoria).
  - Título da task (ex.: Walk or Run, Mindful Minutes).
  - Chevron/arrow à direita.
  - (Opcional) subtítulo curto: “Auto” ou “Todos os dias” se for integrado.
- Cards empilhados com separação 8-12px; radius 14-16px; sombra suave.
- As tasks são específicas da categoria selecionada (exemplo de Movimento: Walk or Run, Cycle, Swim, Mindful Minutes, Climb Flights).
- Estado ativo (quando selecionada) muda a cor de fundo/borda.

## 4) Tela de detalhes/confirmar task (step 3)
- Header: título “Confirmar hábito” + botão voltar (chevron) e “X” para fechar (um dos dois já resolve; manter “X” como padrão).
- Hero central: círculo com stroke (track neutro e anel colorido), ícone grande no centro. Abaixo, nome do hábito em texto colorido (primário ou sucesso).
- Alerta/nota (opcional): se integra com health app/auto, bloco com ícone coração/info; texto curto.
- Campos essenciais (cards com chevron):
  - Nome do hábito (auto-preenchido, editável).
  - Meta (ex.: 5.000 passos, 30 min). Mostrar valor atual à direita.
  - Recorrência/dias (ex.: Todos os dias, 3x/semana).
  - Notificações (on/off ou horário).
  - Categoria (somente leitura se veio do passo 1; opcional trocar).
  - Ícone/Emoji (escolha rápida; manter consistência do set).
- CTA: botão full-width “Salvar hábito” em laranja primário; radius 12-16px; sombra leve.
- Sem campos irrelevantes (remover descrições longas, duplicações, excessos).

## 5) Ícones (consistência visual)
- Estilo: linha simples, cantos arredondados, espessura ~2-2.5px, preenchimento sutil em laranja/verde/azul. Fundo do ícone: círculo claro (beige/white) com stroke fino ou primário quando ativo.
- Paleta: usar `--primary` para ação/selecionado, `--secondary`/verde para health/focus, `--accent`/azul para apoio.
- Set base sugerido (criar vetor/SVG simples; pode usar lucide adaptando stroke/cores):
  - Movimento: correr, caminhar, pedalar, nadar, subir escadas.
  - Mente: meditar/brain, mindful minutes (onda/círculo), focus (alvo).
  - Nutrição: maçã/fruta, talher/prato, água/garrafa.
  - Sono/Recuperação: lua, cama, zzz.
  - Produtividade: check, clipboard, calendário, relógio.
  - Pessoal/Social: coração, mensagem/bolha.
- Consistência: todos os círculos têm mesmo diâmetro e padding; ícone centrado; cores seguem o token do tema.

## 6) Interações e UX
- Step 1 → 2: tap em categoria abre lista; mostrar descrição curta da categoria.
- Step 2 → 3: tap em task abre detalhes; destacar título/ícone no topo.
- Botões: `hover/active` com leve scale (0.98-1.02) e sombra; focus outline 2-3px laranja/azul.
- Sem scrolls internos complexos: lista vertical simples; espaço para teclado ao editar nome/meta.
- O “X” sempre fecha o fluxo; botão voltar leva ao passo anterior.

## 7) Layout e espaçamentos
- Modal full height, padding 16-20px laterais; conteúdo scrolável.
- Cards e pills com radius 14-16px; sombras suaves (`--shadow-soft`).
- Gaps: 12-16px entre seções; 8-12px entre itens.
- Tipografia: títulos 20-24px semibold; labels 14-16px; muted 12-14px.

## 8) Limpeza de elementos atuais (remover/ocultar)
- Remover/ocultar bottom navigation e barras de topo padrão na criação.
- Remover textos longos explicativos e campos opcionais excessivos.
- Substituir seletor de templates atual por: categorias → lista de tasks pré-definidas → detalhes.
- Substituir emojis soltos por set de ícones coerente; ainda permitir troca de ícone, mas dentro do set consistente.

## 9) Tarefas de implementação (high-level)
- Transformar a página de criação em modal/popup (rota `/create` abre modal).
- Construir Step 1: grid de categorias (dados estáticos com descrição).
- Construir Step 2: lista de tasks por categoria (dados estáticos iniciais).
- Construir Step 3: tela de detalhes com os campos essenciais e CTA.
- Criar componente de ícone circular (SVG) com paleta do tema e stroke configurável.
- Ajustar Button/Card/Badge para as novas variantes (pills, cards com chevron).
