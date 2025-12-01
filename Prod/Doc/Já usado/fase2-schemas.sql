-- =====================================================
-- FASE 2 - SCHEMAS PARA PLANO PERSONALIZADO
-- =====================================================
-- IMPORTANTE: Execute este SQL ANTES do fase2-seeds.sql
-- =====================================================

-- =====================================================
-- PRÉ-REQUISITO: Tabela de Respostas do Quiz (Fase 1)
-- =====================================================
-- Esta tabela deveria ter sido criada na Fase 1, mas foi esquecida
-- É necessária para a tabela personal_plans funcionar

create table if not exists public.assessment_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  user_id uuid references auth.users(id) on delete cascade,
  answers jsonb not null,
  scores jsonb,
  created_at timestamptz not null default now()
);

create index assessment_responses_user_id_idx on public.assessment_responses (user_id);
create index assessment_responses_session_id_idx on public.assessment_responses (session_id);
create index assessment_responses_created_at_idx on public.assessment_responses (created_at desc);

-- RLS: Usuários podem inserir (anônimos e autenticados)
alter table public.assessment_responses enable row level security;

create policy "Anyone can insert assessment responses"
  on public.assessment_responses
  for insert
  with check (true);

create policy "Users can view their own assessments"
  on public.assessment_responses
  for select
  using (auth.uid() = user_id or user_id is null);

-- =====================================================
-- Tabela de Resumos de Análise (Fase 1)
-- =====================================================

create table if not exists public.analysis_summaries (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessment_responses(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  diagnosis_type text not null,
  probability_score int not null check (probability_score between 0 and 100),
  summary_pdf_url text,
  created_at timestamptz not null default now()
);

create index analysis_summaries_assessment_id_idx on public.analysis_summaries (assessment_id);
create index analysis_summaries_user_id_idx on public.analysis_summaries (user_id);

alter table public.analysis_summaries enable row level security;

create policy "Users can view their own analysis summaries"
  on public.analysis_summaries
  for select
  using (auth.uid() = user_id);

-- =====================================================
-- Tabela de Arquétipos TDAH (Fase 1 - Opcional)
-- =====================================================

create table if not exists public.tdah_archetypes (
  id text primary key,
  title text not null,
  description text,
  primary_symptoms jsonb,
  created_at timestamptz not null default now()
);

alter table public.tdah_archetypes enable row level security;

create policy "Anyone authenticated can view archetypes"
  on public.tdah_archetypes
  for select
  using (auth.uid() is not null);

-- =====================================================
-- 1. Tabela de Módulos do Programa
-- =====================================================
create table public.program_modules (
  id uuid primary key default gen_random_uuid(),
  module_number int not null unique,
  title text not null,
  subtitle text,
  description text,
  focus text, -- Ex: "Mini-Hábitos", "Procrastinação", "Motivação"
  week_assignment int, -- Semana sugerida (1-4) no plano de 30 dias
  sort_order int not null default 0,
  is_bonus boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index program_modules_number_idx on public.program_modules (module_number);
create index program_modules_week_idx on public.program_modules (week_assignment);

-- RLS: Todos podem ver os módulos (conteúdo público para usuários autenticados)
alter table public.program_modules enable row level security;

create policy "Anyone authenticated can view modules"
  on public.program_modules
  for select
  using (auth.uid() is not null);

-- 2. Tabela de Aulas (Lessons) dentro dos Módulos
create table public.module_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.program_modules(id) on delete cascade,
  lesson_number int not null,
  title text not null,
  lesson_type text not null check (lesson_type in ('video', 'audio', 'text', 'ebook')),
  duration_minutes int, -- Duração estimada em minutos
  content_url text, -- URL do vídeo, áudio ou ebook (Supabase Storage ou externo)
  transcript text, -- Transcrição ou descrição textual
  sort_order int not null default 0,
  is_premium boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index module_lessons_module_idx on public.module_lessons (module_id);
create index module_lessons_type_idx on public.module_lessons (lesson_type);

-- RLS: Usuários autenticados podem ver as aulas
alter table public.module_lessons enable row level security;

create policy "Authenticated users can view lessons"
  on public.module_lessons
  for select
  using (auth.uid() is not null);

-- 3. Tabela de Recursos Extras (Ebooks, Lives, etc)
create table public.module_resources (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.program_modules(id) on delete set null,
  resource_type text not null check (resource_type in ('ebook', 'live', 'worksheet', 'checklist')),
  title text not null,
  description text,
  file_url text, -- URL do arquivo no Storage
  is_bonus boolean default false,
  tags text[], -- Tags para busca/filtro
  created_at timestamptz not null default now()
);

create index module_resources_module_idx on public.module_resources (module_id);
create index module_resources_type_idx on public.module_resources (resource_type);

-- RLS: Usuários autenticados podem ver recursos
alter table public.module_resources enable row level security;

create policy "Authenticated users can view resources"
  on public.module_resources
  for select
  using (auth.uid() is not null);

-- 4. Tabela de Progresso do Usuário nos Módulos
create table public.module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.module_lessons(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create index module_progress_user_idx on public.module_progress (user_id);
create index module_progress_lesson_idx on public.module_progress (lesson_id);
create index module_progress_status_idx on public.module_progress (status);

-- RLS: Usuários só veem seu próprio progresso
alter table public.module_progress enable row level security;

create policy "Users can view their own progress"
  on public.module_progress
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on public.module_progress
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.module_progress
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Tabela de Planos Personalizados
create table public.personal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id uuid references public.assessment_responses(id) on delete set null,
  diagnosis_type text not null,
  recommended_modules jsonb, -- Array de module_ids recomendados
  recommended_habits jsonb, -- Array de hábitos sugeridos
  week_schedule jsonb, -- Estrutura semanal {week1: [...], week2: [...], ...}
  generated_pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index personal_plans_user_idx on public.personal_plans (user_id);
create index personal_plans_assessment_idx on public.personal_plans (assessment_id);

-- RLS: Usuários só veem seus próprios planos
alter table public.personal_plans enable row level security;

create policy "Users can view their own plans"
  on public.personal_plans
  for select
  using (auth.uid() = user_id);

create policy "Service role can manage plans"
  on public.personal_plans
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- 6. Trigger para atualizar updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_program_modules_updated_at
  before update on public.program_modules
  for each row
  execute function public.update_updated_at_column();

create trigger update_module_lessons_updated_at
  before update on public.module_lessons
  for each row
  execute function public.update_updated_at_column();

create trigger update_module_progress_updated_at
  before update on public.module_progress
  for each row
  execute function public.update_updated_at_column();

create trigger update_personal_plans_updated_at
  before update on public.personal_plans
  for each row
  execute function public.update_updated_at_column();

-- =====================================================
-- COMENTÁRIOS
-- =====================================================
comment on table public.program_modules is 'Módulos do programa TDAH (1-9)';
comment on table public.module_lessons is 'Aulas dentro de cada módulo (vídeo, áudio, texto, ebook)';
comment on table public.module_resources is 'Recursos extras (ebooks, lives, checklists)';
comment on table public.module_progress is 'Progresso do usuário nas aulas';
comment on table public.personal_plans is 'Planos personalizados gerados para cada usuário';
