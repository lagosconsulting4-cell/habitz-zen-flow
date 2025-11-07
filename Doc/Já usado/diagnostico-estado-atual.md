# Diagnostico do Habitz (estado atual)

## Panorama geral
- App desenvolvido em React + Vite + TypeScript, com roteamento via React Router e TanStack Query para cache de dados. UI baseada em Tailwind + componentes shadcn, otimizada para mobile (nav inferior animada e layout responsivo com sidebar em telas grandes).
- Produto atual e uma plataforma de gerencia de habitos com paywall premium vitalicio. Todo o conteudo autenticado fica atras de `ProtectedRoute`, que exige usuario logado **e** flag `is_premium` no perfil.
- Ecossistema sincroniza com Supabase (auth, banco, storage e edge functions). Integracoes externas: Stripe (checkout direto) e Kiwify (checkout externo) para cobranca unica.
- Landing page e copy posicionadas para disciplina e performance geral; contem CTA para checkout e coleta de metricas de funil diretamente no Supabase (`landing_events` e `newsletter_subscribers`).

## Jornada de usuario e features atuais
- **Landing (`/`)**: hero com simulacao do app, contadores sociais, seccoes de beneficios, roadmap de instalacao e depoimentos. Usa `useLandingMetrics` para gravar pageviews/CTAs no Supabase.
- **Auth (`/auth`)**: fluxo completo de login, cadastro, esqueci a senha e reset. Apos autenticacao consulta `profiles.is_premium`; quem nao e premium e redirecionado ao `/pricing`.
- **Pricing / Thank you / Cancel**: pricing apresenta plano vitalicio (link fixo da Kiwify). `Thanks` reconcilia pagamento, pergunta status premium, oferece refresh/checkout; `Cancel` incentiva a retomar compra.
- **Onboarding**: selecao de ate 6 areas (produtividade, mindset etc.) em duas etapas. Apenas registra contexto e direciona ao dashboard; nao persiste dados no momento.
- **Navegacao protegida**: `ProtectedLayout` combina sidebar (desktop), barra inferior animada (mobile) e menu lateral (`MoreMenu`) com os destinos autenticados.
- **Dashboard**: saudacao com nome do perfil, data atual, citacao diaria (`quotes`), dicas rotativas (`tips`), cards de progresso do dia e listas de habitos por periodo (manha/tarde/noite). Cada card permite marcar conclusao via `toggleHabit`.
- **Criar Habito**: formulario para nome, emoji pre-definido, categoria, periodo e dias da semana. Valida campos e grava em `habits` (dias guardados como array de inteiros).
- **Meus Habitos**: gerenciador com busca, filtros por categoria/periodo, tabs para ativos vs arquivados, acoes de duplicar, editar (sheet lateral), arquivar/restaurar e excluir (dialogo de confirmacao). Edicao permite alterar dias da semana com toggles.
- **Calendario**: visao mensal com cores de preenchimento baseadas na taxa de conclusao. Modal do dia mostra habitos agendados, permite marcar/desmarcar concluido mesmo retroativamente.
- **Progresso**: estatisticas agregadas (dias perfeitos, consistencia mensal, categoria destaque, melhor sequencia), grafico de barras semanal e lista de streaks por habito. Dados calculados no client a partir de `habits` + `habit_completions`.
- **Jornada Guiada**: roadmap de 4 semanas com dias bloqueados por tempo. Usa `guided_user_state` e `guided_day_completions`; somente o dia permitido pode ser concluido. Exibe titulo, descricao, tag (acao/reflexao/desafio) e botao para marcar progresso.
- **Meditacao e Respiracao**: lista de sessoes vindas de `meditations`, filtragem por categoria e player de audio com assinatura temporaria (`storage.createSignedUrl`). Indica duracao, foco, passos e status premium.
- **Hub de Livros**: grade de livros em Portugues com categoria, descricao e link de afiliado (Shopee).
- **Dicas (Tips)**: tabs para rotinas e nutricao; cada item exibe descricao, impacto e sugestao de horario.
- **Perfil**: mostra nome/email, badge premium, datas de acesso, estatisticas pessoais (habitos ativos, dias usando, consistencia) via `useProfileInsights`, toggles de notificacao/tema (placeholders) e botao de logout.
- **Outros**: termos (`/terms`), pagina 404 e componentes auxiliares (`HabitCard`, `HabitCompleteButton`, toasts, tooltips) completam a experiencia.

## Hooks e componentes transversais
- `useHabits` centraliza CRUD de `habits` e `habit_completions`, garante uma conclusao por habito/dia, atualiza streaks e dispara eventos de janela para atualizar progresso.
- `useProgress` e `useProfileInsights` agregam dados no cliente, calculando consistencia, streaks e KPI mensais a partir de janelas (ate 90 dias).
- `useGuided` cuida do estado do modo guiado (ensina a criar `guided_user_state` se ausente e bloqueia dias futuros usando regra `can_complete_guided_day`).
- `useMeditations`, `useBooks`, `useTips`, `useQuotes` fazem leituras simples e ordenadas do Supabase com fallback visual em caso de loading.
- Dados estaticos em `src/data` replicam parte do conteudo (tips, guided journey e meditations) para possivel uso offline ou seeds.

## Diagnostico do backend Supabase
- **Autenticacao**: Supabase Auth (email/senha). Trigger `handle_new_user` cria `profiles` automaticamente com `display_name`.
- **Tabelas principais**
  - `profiles`: `user_id`, `display_name`, `avatar_url`, `is_premium`, `premium_since`. RLS: usuario so ve/altera seu perfil. Trigger `handle_paid_purchase` marca premium quando compra `paid`.
  - `habits`: `name`, `emoji`, `category`, `period`, `days_of_week` (array), `streak`, `is_active`. RLS por `user_id`. Trigger generico atualiza `updated_at`.
  - `habit_completions`: relaciona habito + usuario + `completed_at` (date). Constraint garante apenas uma conclusao por dia. RLS por `user_id`.
  - `quotes`, `tips`, `books`: conteudo editorial aberto (policies permitem SELECT publico). Migrations trazem seeds em portugues.
  - `meditations`: metadados completos (slug, titulo, duracao, foco, passos, premium_only, audio_path). Indices por categoria/premium. Politicas permitem SELECT autenticado; bucket `meditation-audios` com policy alinhada.
  - `guided_days`: calendario de 52 semanas (migrations povoam 4 semanas). `guided_user_state` guarda inicio e ultimo dia concluido; `guided_day_completions` registra progresso diario (unique por usuario+global_day).
  - `purchases`: integra Stripe/Kiwify (`provider_*`, amount, status). `pending_purchases` guarda compras pagas antes do cadastro; trigger `attach_pending_purchases_to_user` migra para `purchases` quando o email registra conta.
  - `landing_events` e `newsletter_subscribers`: armazenam eventos anonimos e opt-ins, com politicas que liberam INSERT para roles `anon` e `authenticated`.
- **Funcoes SQL relevantes**
  - `update_updated_at_column` (trigger generico), `handle_new_user`, `handle_paid_purchase`, `attach_pending_purchases_to_user`.
  - `can_complete_guided_day` valida desbloqueio por tempo e sequencia; `update_guided_state` mantém `guided_user_state.last_completed_global_day`.
- **Seeds**: migrations preenchem guided days detalhados, meditations, livros, quotes e tips, garantindo conteudo inicial coerente com o produto.

## Edge Functions e automacoes
- `create-checkout`: Deno function que exige Authorization do usuario atual, cria sessao Stripe (`success_url` -> `/thanks`, `cancel_url` -> `/pricing`). Usa metadata `user_id`.
- `stripe-webhook`: valida assinatura, trata eventos `checkout.session.completed`, `payment_intent.succeeded`, `charge.refunded`. Faz upsert em `purchases` e dispara trigger premium.
- `kiwify-webhook`: normaliza payloads variados, extrai email/valor/status. Se usuario nao existe, grava em `pending_purchases`; caso contrario, upsert em `purchases`. Usa token de seguranca e CORS amplo.

## Observacoes e oportunidades para pivot TDAH
- Narrativa e componentes sao orientados a disciplina masculina geral. Ciclos de onboarding, categorias e conteudos (livros, tips, guided) focam em performance, nao em dores especificas de TDAH.
- Estrutura tecnica e flexivel: `habits`, `tips`, `guided_days` e `meditations` suportam novas categorias/etiquetas, bastando atualizar seeds e UI. Supabase permite incluir campos extras (ex.: nivel de estimulo, duracao sugerida, flags sensoriais).
- Para TDAH, ha margens para incluir:
  - novos campos em `habits` (tempo estimado, nivel de energia, gatilhos visuais).
  - ampliacao do `guided_user_state` (checkpoint, feedback de dificuldade).
  - segmentacoes em `tips`/`books`/`meditations` (tags TDAH, nivel de urgencia).
  - ajustes na landing/copy para comunicar dores de desorganizacao, esquecimento e hiperfoco.
- Risco atual: dependencia forte do status `is_premium` (tudo bloqueado sem compra). Para personas TDAH pode ser interessante revisar paywall ou liberar jornada inicial.

## Itens a validar antes de evoluir
- Confirmar se existe plano de migracao/reseed dos dados (muitas migrations trazem conteudo codificado com acentuacao truncada).
- Verificar cobertura de testes/analytics: nao ha testes automatizados; metricas limitam-se a landing.
- Checar assets de audio no bucket `meditation-audios` (repositorio nao inclui os arquivos).
- Decidir entre Stripe vs Kiwify (hoje ambos coexistem).
