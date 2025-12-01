# Plano de Remodelacao do Habitz para o publico TDAH

## Objetivo
Transformar o Habitz de um gerenciador de habitos generico em uma plataforma terapeutica digital focada em TDAH, capaz de entregar:
- Quiz diagnostico com analise inicial e probabilidade de melhora.
- Plano personalizado gerado por “psicologos cognitivos” com disponibilizacao imediata (PDF/visao no app).
- Programa completo em modulos com aulas em video/audio, ebooks e materiais extras.
- Promessa de resultados visiveis em 30 dias com indicadores de progresso.
- Comunicacao orientada a motivacao diaria, clareza, reducao de sobrecarga, autoestima e abordagem 100% natural.

## Resumo das variacoes principais
- **UX/Copia**: reposicionar onboarding, telas internas e comunicacoes in-app para discurso TDAH (acolhimento, suporte clinico).
- **Fluxo inicial**: novo quiz multi-etapas -> analise inicial -> paywall/contexto do plano -> acesso ao programa.
- **Conteudo**: catalogar modulos, aulas (video/audio), ebooks e lives como entidades Supabase; disponibilizar streaming/download.
- **Personalizacao**: gerar plano customizado (matching quiz -> combinacao de modulos, habitos sugeridos, rotina de 30 dias) + PDF.
- **Acompanhamento**: novos dashboards com graficos, metas de 30 dias, check-ins emocionais, indicadores de progresso.
- **Backoffice**: definicao de dados e pipelines para nutricionistas/psicologos alimentarem conteudo, uploads para storage, edicao de scripts.

---

## Mudancas por area

### 1. Onboarding & Quiz Diagnostico
- **Nova rota** `/quiz` (publica). Estrutura em passos com perguntas:
  - Perfil (idade, rotina, diagnostico formal, medicamentos).
  - Desafios (procrastinacao, dispersao, desorganizacao emocional).
  - Escalas Likert para foco, motivacao, sobrecarga.
  - Preferencias de formato (video/audio/leitura), disponibilidade diaria.
- **Outputs do Quiz**:
  - Tipo de TDAH (predominante desatencao, hiperatividade ou combinado) inferido por regra local.
  - Intensidade dos sintomas e nivel de sobrecarga (score 0–100).
  - Objetivo principal (claridade, autoestima, relacoes, crescimento).
- **Persistencia**: criar tabela `assessment_responses` (Supabase) com JSON das respostas, scores, timestamps, user_id opcional (permitir completude antes de login).
- **UX**: permitir salvar email para enviar analise inicial mesmo antes de conta (sincronizar com `pending_purchases` / newsletter).

### 2. Analise Inicial do Perfil
- **Nova pagina** `/analise` exibida apos quiz:
  - Box com “Tipo de TDAH” + breve descricao.
  - Lista de sintomas priorizados (a partir do quiz).
  - Indicador “Probabilidade de melhora em 30 dias: 94%” (valor dinamico baseado no score: mapping -> 70–100%).
  - Sugestao de rotinas imediatas (3 mini-habitos iniciais).
- **Acoes**: CTA para gerar conta / fazer login e acessar plano personalizado; opcao de download do resumo (PDF com logomarca e disclaimers).
- **Implementacao**: geracao client-side (React) com Template > export to PDF via `react-pdf`/`html2canvas`. Guardar registro `analysis_summaries` para auditar.

### 3. Plano Personalizado & Programa Completo
- **Modelagem**: adicionar tabelas
  - `program_modules` (id, ordem, titulo, descricao, foco, faixa_etaria).
  - `module_lessons` (id, module_id, titulo, tipo=`video|audio|texto`, duracao, arquivo_url, transcript, is_bonus).
  - `module_resources` (ebooks, planilhas, lives; link + tipo + tags).
  - `personal_plans` (id, user_id, quiz_id, recommended_modules, recommended_habits (json), generated_pdf_url, created_at).
- **Conteudo**: migrar lista de modulos do documento para seeds (M1..M9) com descricoes, assets e flag video/audio/ebook.
- **Plano de 30 dias**: algoritmo que combina:
  - Semana 1: Modulo 1 + habitos basicos + checklist.
  - Semana 2: Modulo 2 & 3 + audio motivacional.
  - Semana 3: Modulo 4 & 5 + desafios.
  - Semana 4: Modulo 6 & 7 + lives/bonus.
  - Ajustar pesos conforme perfil (ex.: se sobrecarga alta -> reforcar modulo 6).
- **Download Imediato**: apos gerar, permitir export PDF com agenda, mini-habitos, sugestao de recompensas, avaliacoes semanais.
- **UI**: nova pagina `/plano` com:
  - Cabeçalho com resumo (perfil, objetivos).
  - Linha do tempo 30 dias com cards por semana.
  - Botões para assistir aulas (abre player modal) e marcar como concluído.

### 4. Players & Biblioteca de Conteudo
- **Video/Audio**: integrar Supabase Storage buckets (`modules-video`, `modules-audio`) com signed URLs. Player com suporte a velocidade, transcricao e download (quando permitido).
- **Ebooks/bonus**: exibir mini cards com capas, permitir download (PDF) e sinalizar “BÔNUS”.
- **Lives**: hospedar audios no storage; taggar como bonus no modulo 9.

### 5. Resultados e Indicadores em 30 dias
- **Novo Dashboard** `/progresso-tdah`:
  - Grafico area/progresso semanal comparando aulas concluídas vs previstas.
  - Indicadores: “Dias com hábito cumprido”, “Check-ins emocionais positivos”, “Recompensas aplicadas”.
- **Check-ins**: criar `daily_checkins` (mood escala 1-5, nivel de clareza, sobrecarga, principais conquistas, data).
- **Gamificacao**: badges para motivacao diaria, clareza, autoestima, relacoes.
- **Automacoes**: quando usuario conclui modulo, disparar toast + registro em `module_progress`.

### 6. Ajustes no sistema de Habitos
- **Metadados extras**: adicionar campos a `habits`:
  - `support_goal` (enum: motivacao, clareza, sobrecarga, autoestima, relacionamento).
  - `estimated_minutes` (int).
  - `sensory_mode` (enum: visual, auditivo, cinestesico).
- **Biblioteca de habitos sugeridos**: criar `habit_templates` com tags TDAH e permitir usuario importar na criacao.
- **Calendario**: destacar a meta de 30 dias com highlight e comparativo contra plano.

### 7. Copy & Comunicacao Interna
- **App Layout**:
  - Dashboard -> renomear para “Centro de Progresso”, incluir mensagem motivacional diaria (gerada a partir do quiz).
  - “Habitos” -> “Mini-Habitos Terapêuticos”.
  - “Jornada Guiada” -> “Programa de 30 dias” com timeline dos modulos.
  - Atualizar todos os textos fixos (botões, headings) com linguagem acolhedora e referencias a suporte profissional.
- **Notificacoes/Emails**:
  - Criar templates (via Supabase) para: analise inicial entregue, lembrete de check-in, parabenizacao 1a semana.

### 8. Modelos de Dados & Supabase
- **Novas tabelas**:
  - `assessment_responses (id, session_id, user_id, answers jsonb, scores jsonb, created_at)`.
  - `analysis_summaries (id, assessment_id, user_id, diagnosis_type, probability_score, summary_pdf_url, created_at)`.
  - `program_modules`, `module_lessons`, `module_resources`, `personal_plans`, `plan_weeks` (semana, milestones, instructions).
  - `module_progress (id, user_id, lesson_id, status, completed_at)`.
  - `daily_checkins (id, user_id, mood, clarity, overload, notes, created_at)`.
  - `habit_templates` para sugestionamento.
- **Migrations**: atualizar seeds com conteudo do cronograma (modulos 1–9, aulas, audios, ebooks).
- **Policies**: 
  - planos/analises visiveis apenas pelo usuario.
  - modulos/lessons com SELECT publico autenticado.
  - checkins/habit templates com RLS por usuario.
- **Storage**: buckets `modules-videos`, `modules-audios`, `bonus-ebooks`, `plan-pdfs`.

### 9. Edge Functions & Automatizacoes
- **Plan Generator**: nova function `generate-plan` recebe assessment_id e retorna plano (usa templates + Reglas). Gera PDF (usar serverless com Deno + `pdfkit` ou call para serviço).
- **Email Dispatch**: function `send-analysis-email` para enviar resumo + link para quiz completado (integra com Resend/SMTP).
- **Kiwify/Stripe**: atualizar mensagens de agradecimento/cancelamento com copy TDAH. Oferecer upsell de acompanhamento (ex: coaching).

### 10. Analytics & Medicao
- **Eventos**: instrumentar `quiz_started`, `analysis_downloaded`, `module_completed`, `checkin_submitted`, `plan_exported`.
- **Dashboard Interno** (futuro): table `admin_insights` agregando progresso de usuarios (para equipe psicologia).

### 11. Roadmap de Implementacao (alto nivel)
1. **Discovery & Conteudo** (copywriting, scripts de modulos, assets de video/audio).
2. **Infra & Dados**: migrations, buckets, functions de geracao/download.
3. **Fluxo Inicial**: quiz + analise + plano baseline (MVP sem PDF).
4. **Programa & Players**: modulacao de aulas, biblioteca multimidia.
5. **Dashboard & Check-ins**: novos indicadores, graficos, badges.
6. **Refinamento de Habitos**: templates TDAH, campos extras.
7. **Copy completa**: app, emails, toasts, onboarding.
8. **QA & Validacoes**: testes de fluxo, downloads, mobile.

#### 11.1 Detalhamento por fases
- **Fase 0 - Preparacao de Conteudo & Arquitetura**
  - Consolidar scripts das aulas, formatos (video/audio) e arquivos bonus.
  - Definir estrutura final das migrations e buckets (modules-videos, modules-audios, bonus-ebooks, plan-pdfs).
  - Mapear requisitos de compliance (disclaimers, uso de termo 'psicologos').
- **Fase 1 - Fluxo Diagnostico MVP**
  - Implementar migrations iniciais (assessment_responses, analysis_summaries).
  - Criar rotas /quiz e /analise com persistencia e exportacao PDF simples.
  - Configurar edge function ou job para enviar email com a analise inicial.
  - Ajustar /auth, /pricing, /thanks para referenciar o Plano Personalizado.
- **Fase 2 - Plano Personalizado Base**
  - Criar migrations de program_modules, module_lessons, module_resources e seeds dos modulos 1-9.
  - Implementar gerador de plano (function generate-plan) produzindo estrutura semanal e mini-habitos sugeridos.
  - Construir pagina /plano com timeline de 30 dias e botao de download (PDF).
- **Fase 3 - Biblioteca Multimidia e Bonus**
  - Configurar upload de videos, audios e ebooks no Supabase Storage.
  - Implementar players (video/audio) com controles de velocidade e URLs assinadas.
  - Exibir recursos extras (ebooks, lives) com status bonus e CTAs de download.
- **Fase 4 - Acompanhamento e Progresso**
  - Adicionar module_progress, daily_checkins e indicadores na nova pagina /progresso-tdah.
  - Atualizar hooks de progresso para comparar execucao vs plano de 30 dias.
  - Introduzir check-ins emocionais, badges e automacoes de feedback.
- **Fase 5 - Sistema de Habitos Adaptado**
  - Estender tabela habits com novos campos (support_goal, estimated_minutes, sensory_mode).
  - Criar habit_templates e fluxo de importacao nas telas de criacao/edicao.
  - Ajustar calendario e Meus Habitos para refletir a relacao com o plano.
- **Fase 6 - Copy, Instrumentacao e QA Final**
  - Revisar texto in-app, toasts e emails com linguagem TDAH.
  - Instrumentar eventos (quiz, plano, modulo, check-in) no analytics atual.
  - Executar testes integrados mobile/desktop e validar expiracao de URLs.
### Backlog detalhado - Fase 1 (Fluxo Diagnostico MVP)

**Objetivo:** permitir que visitantes completem o quiz, recebam uma analise inicial convincente e avancem para o Plano Personalizado antes de destravar o restante do app.

#### 1. Migrations & Dados
- Criar `assessment_responses`:
  ```sql
  id uuid primary key default gen_random_uuid();
  session_id uuid;
  user_id uuid;
  answers jsonb not null;
  scores jsonb;
  created_at timestamptz default now();
  ```
  - RLS habilitado. Policies:
    - `anon` e `authenticated`: `insert` liberado.
    - `select/update/delete` apenas quando `user_id = auth.uid()`.
    - Service role pode `select` para gerar planos.
- Criar `analysis_summaries` (FK para `assessment_responses`) com campos `diagnosis_type text`, `probability_score int check (probability_score between 0 and 100)`, `summary_pdf_url text`.
  - RLS: leitura apenas do dono; `insert/update` via edge function ou service role.
- Opcional: tabela `tdah_archetypes` (id text, title, description, primary_symptoms jsonb) para mensagens dinamicas.

#### 2. Infra Supabase
- Bucket privado `plan-pdfs` com metadado `user_id` para controlar acesso (select somente do proprio usuario; escrita com service role).
- Edge function `send-analysis-email` (Deno): recebe `{ summary_id, email }`, busca dados, monta template e envia via Resend/SMTP; registrar logs em `email_logs` (opcional).
- Atualizar variaveis de ambiente com credenciais de email e `PUBLIC_SITE_URL`.

#### 3. Fluxo do Quiz (`/quiz`)
- Rota publica em formato wizard (5 etapas) com barra de progresso e suporte mobile.
  1. Perfil: faixa etaria, diagnostico formal, uso de medicacao, horario de maior energia.
  2. Desafios: checkbox multi selecao (procrastinacao, dispersao, desorganizacao, impulsividade, sono, relacoes).
  3. Escalas 1-5: foco, motivacao, sobrecarga, autoestima, clareza de objetivos.
  4. Preferencias: formatos preferidos (video/audio/leitura), minutos disponiveis/dia, ambiente ideal.
  5. Email opcional + consentimento LGPD para envio da analise.
- No envio final: calcular scores, inserir na tabela, guardar `assessment_id` (estado/localStorage) e redirecionar para `/analise?assessment_id=...`.
- UX: botoes "Voltar"/"Avancar", validacao por etapa, copy acolhedora.

#### 4. Pagina de Analise (`/analise`)
- Carregar dados do assessment e aplicar regras:
  - Determinar tipo TDAH (desatento, hiperativo, combinado).
  - Selecionar sintomas principais com base nas respostas.
  - Calcular probabilidade de melhora (range sugerido 70-95%).
  - Sugerir 3 mini-habitos iniciais + 1 estrategia de recompensa (placeholders nesta fase).
- Exibir cards, grafico simples do percentual e CTA "Quero meu Plano Personalizado".
- Botao "Baixar resumo (PDF)" gera documento local, salva em `plan-pdfs/analysis/{assessment_id}.pdf` e atualiza `analysis_summaries.summary_pdf_url`.
- Se email informado, chamar a edge function para envio automatico e mostrar confirmacao (toast).

#### 5. Ajustes no app existente
- `Index.tsx`: CTA principal aponta para `/quiz` com nova copy.
- `Auth.tsx`, `Pricing.tsx`, `Thanks.tsx`, `Cancel.tsx`: alinhar texto com o Plano Personalizado e mencionar a analise inicial.
- `ProtectedRoute`: para usuarios nao premium, redirecionar para `/pricing` preservando `location.state.from` (quando vier do quiz/analise).

#### 6. Telemetria
- Registrar eventos: `quiz_started`, `quiz_step_completed`, `quiz_completed`, `analysis_generated`, `analysis_pdf_downloaded`, `analysis_email_sent`.
- Manter `session_id` em localStorage para associar eventos anonimos.

#### 7. QA & Criterios de aceite
- Testar cenarios:
  - Visitante sem email conclui quiz e baixa PDF (arquivo acessivel apenas autenticado ou via link direto protegido).
  - Visitante com email recebe mensagem com link valido.
  - Usuario autenticado gera analise vinculada ao proprio `user_id`.
  - Tentativa de acessar PDF sem permissao falha por RLS.
  - Segunda submissao do quiz cria novo registro (padrao) ou sobrescreve conforme regra definida.
- Entregaveis: migrations aplicadas, quiz/analise disponiveis em staging, template de email revisado e guia rapido para suporte.### 12. Riscos & Dependencias
- **Conteudo audiovisual**: garantir producao/edicao dos videos e audios citados.
- **Geracao de PDF**: definir ferramenta confiavel no edge (limites de processamento).
- **Promessa terapeutica**: revisar juristas/compliance (uso de termos “psicologos”, “diagnostico” exige disclaimers).
- **Suporte multiplas idades**: adaptar copy e quiz para adolescentes/adultos (talvez campos condicionais).
- **Aderencia em 30 dias**: alinhar indicadores (definir criterios para “resultado visivel”).

---

## Lista de tarefas consolidada
- [ ] Implementar quiz TDAH com persistencia em Supabase.
- [ ] Construir analise inicial com PDF e email.
- [ ] Criar modelo de dados e seeds para modulos, aulas, bonus.
- [ ] Desenvolver plano personalizado (UI + algoritmo) e exportacao.
- [ ] Integrar players de video/audio e downloads de ebooks.
- [ ] Atualizar dashboard com indicadores 30 dias + check-ins.
- [ ] Expandir sistema de habitos com metadados e templates.
- [ ] Atualizar copy do app inteiro para discurso TDAH.
- [ ] Instrumentar eventos e relatórios.
- [ ] Ajustar paywall/obrigatoriedade premium conforme nova jornada.

Este plano mapeia todas as modificacoes necessárias para cumprir as promessas do novo posicionamento. A implementacao pode ser organizada em sprints conforme prioridades acima, garantindo que os elementos criticos (quiz, plano personalizado, programa multimidia e acompanhamento de resultados) sejam entregues antes de refinamentos cosméticos.





