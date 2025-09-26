-- Create meditations table to store guided audio sessions
CREATE TABLE IF NOT EXISTS public.meditations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  focus text,
  steps text[] NOT NULL DEFAULT '{}',
  duration_seconds integer NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  duration_label text NOT NULL DEFAULT '',
  ambient_sounds text[] NOT NULL DEFAULT '{}',
  category text NOT NULL,
  category_label text NOT NULL,
  premium_only boolean NOT NULL DEFAULT true,
  audio_path text NOT NULL,
  cover_image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meditations_category_idx ON public.meditations (category);
CREATE INDEX IF NOT EXISTS meditations_premium_idx ON public.meditations (premium_only);
CREATE INDEX IF NOT EXISTS meditations_active_idx ON public.meditations (is_active) WHERE is_active = true;

ALTER TABLE public.meditations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read meditations" ON public.meditations;
CREATE POLICY "Authenticated users can read meditations"
  ON public.meditations
  FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Service role can manage meditations" ON public.meditations;
CREATE POLICY "Service role can manage meditations"
  ON public.meditations
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS set_timestamp_on_meditations ON public.meditations;
CREATE TRIGGER set_timestamp_on_meditations
  BEFORE UPDATE ON public.meditations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create the storage bucket that will hold meditation audio files
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'meditation-audios') THEN
    PERFORM storage.create_bucket(name => 'meditation-audios', public => false);
  END IF;
END;
$$;

-- Storage policies so authenticated users can stream audio while only the service role manages content
DROP POLICY IF EXISTS "Authenticated users can read meditation audio" ON storage.objects;
CREATE POLICY "Authenticated users can read meditation audio"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'meditation-audios' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Service role can manage meditation audio" ON storage.objects;
CREATE POLICY "Service role can manage meditation audio"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'meditation-audios' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'meditation-audios' AND auth.role() = 'service_role');

-- Seed initial meditation sessions based on current product catalog
INSERT INTO public.meditations (slug, title, description, focus, steps, duration_seconds, duration_label, ambient_sounds, category, category_label, premium_only, audio_path, sort_order)
VALUES
  (
    'box-breathing',
    'Box Breathing',
    'Respiração de caixa para controle do stress e foco mental',
    'Controle de stress e foco',
    ARRAY['Inspire por 4 segundos', 'Segure o ar por 4 segundos', 'Expire por 4 segundos', 'Segure sem ar por 4 segundos', 'Repita o ciclo'],
    300,
    '5 minutos',
    ARRAY['Silêncio total', 'Som de respiração leve'],
    'respiracao',
    'Respiração',
    false,
    'breathing/box-breathing.mp3',
    10
  ),
  (
    'respiracao-4-7-8',
    'Respiração 4-7-8',
    'Técnica para relaxamento rápido e indução do sono',
    'Relaxamento e indução do sono',
    ARRAY['Inspire por 4 segundos', 'Segure o ar por 7 segundos', 'Expire lentamente por 8 segundos', 'Repita 4 ciclos completos'],
    180,
    '3 minutos',
    ARRAY['Natureza', 'Respiração guiada'],
    'respiracao',
    'Respiração',
    false,
    'breathing/respiracao-4-7-8.mp3',
    20
  ),
  (
    'respiracao-monge',
    'Respiração Monge',
    'Técnica para clareza e estabilidade emocional',
    'Clareza e estabilidade emocional',
    ARRAY['Sente-se com a coluna ereta', 'Inspire profundamente pelo nariz', 'Expire lentamente pelo nariz', 'Foque na expiração mais longa que a inspiração', 'Mantenha ritmo constante'],
    600,
    '10 minutos',
    ARRAY['Floresta leve', 'Ruído branco'],
    'respiracao',
    'Respiração',
    false,
    'breathing/respiracao-monge.mp3',
    30
  ),
  (
    'silencio-tatico',
    'Silêncio Tático',
    'Descompressão mental após estímulo digital',
    'Descompressão mental',
    ARRAY['Sente em um local silencioso', 'Respire normalmente', 'Observe os pensamentos sem julgar', 'Permaneça presente sem esforço', 'Aceite o que vier à mente'],
    300,
    '5 minutos',
    ARRAY['Nenhum'],
    'silencio',
    'Silêncio',
    false,
    'silencio/silencio-tatico.mp3',
    40
  ),
  (
    'modo-guerreiro',
    'Modo Guerreiro',
    'Visualização para foco, identidade e mentalidade alpha',
    'Foco e identidade',
    ARRAY['Feche os olhos e respire fundo', 'Visualize seu "eu ideal" acordando', 'Veja-se treinando com disciplina', 'Imagine-se lendo e evoluindo', 'Sinta a sensação de vitória e propósito', 'Mantenha essa imagem por alguns minutos'],
    600,
    '10 minutos',
    ARRAY['Batida baixa suave', 'Respiração controlada'],
    'visualizacao',
    'Visualização',
    true,
    'visualizacao/modo-guerreiro.mp3',
    50
  ),
  (
    'respiracao-combate',
    'Respiração de Combate',
    'Técnica para manter foco sob pressão',
    'Foco sob pressão',
    ARRAY['Inspire profundamente por 2 segundos', 'Expire com força por 1 segundo', 'Repita em ritmo firme e constante', 'Mantenha postura ereta durante toda a prática'],
    240,
    '2-4 minutos',
    ARRAY['Ruído militar leve', 'Silêncio'],
    'respiracao',
    'Respiração',
    true,
    'breathing/respiracao-combate.mp3',
    60
  ),
  (
    'modo-reset',
    'Modo Reset',
    'Reset mental rápido em meio ao caos',
    'Reset mental rápido',
    ARRAY['Faça 10 respirações profundas', 'Pause 3 segundos entre cada respiração', 'Na expiração, solte tensões do corpo', 'Visualize stress saindo do corpo', 'Termine com 3 respirações normais'],
    240,
    '3-5 minutos',
    ARRAY['Som de água', 'Vento suave'],
    'reset',
    'Reset',
    false,
    'reset/modo-reset.mp3',
    70
  ),
  (
    'meditacao-foco-total',
    'Meditação Foco Total',
    'Preparação para leitura, estudo ou treino',
    'Preparação para alta performance',
    ARRAY['Respire profundamente 5 vezes', 'Conte mentalmente de 10 a 1', 'A cada número, sinta-se mais focado', 'Visualize a atividade que fará em seguida', 'Defina uma intenção clara'],
    300,
    '5 minutos',
    ARRAY['Pulsos binaurais suaves'],
    'preparacao',
    'Preparação',
    true,
    'preparacao/meditacao-foco-total.mp3',
    80
  ),
  (
    'ancoragem-presente',
    'Ancoragem do Presente',
    'Técnica para diminuir ansiedade e trazer atenção para o agora',
    'Redução de ansiedade e presença',
    ARRAY['Observe 5 coisas ao seu redor', 'Identifique 4 coisas que pode tocar', 'Escute 3 sons diferentes', 'Sinta 2 odores ou texturas', 'Saboreie 1 coisa', 'Respire profundamente ao final'],
    300,
    '5 minutos',
    ARRAY['Ambiente suave', 'Instrução textual'],
    'mindfulness',
    'Mindfulness',
    false,
    'mindfulness/ancoragem-presente.mp3',
    90
  ),
  (
    'modo-noturno',
    'Modo Noturno',
    'Transição para o sono e descanso real',
    'Transição para o sono',
    ARRAY['Deite-se confortavelmente', 'Respire lenta e profundamente', 'Solte conscientemente cada parte do corpo', 'Repita mentalmente: "Solta o corpo, solta os pensamentos"', 'Visualize-se dormindo profundamente', 'Mantenha respiração lenta até adormecer'],
    660,
    '10-12 minutos',
    ARRAY['Chuva leve', 'Voz suave guiada'],
    'sono',
    'Sono',
    true,
    'sono/modo-noturno.mp3',
    100
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  focus = EXCLUDED.focus,
  steps = EXCLUDED.steps,
  duration_seconds = EXCLUDED.duration_seconds,
  duration_label = EXCLUDED.duration_label,
  ambient_sounds = EXCLUDED.ambient_sounds,
  category = EXCLUDED.category,
  category_label = EXCLUDED.category_label,
  premium_only = EXCLUDED.premium_only,
  audio_path = EXCLUDED.audio_path,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  updated_at = now();
