-- Relax select policies so authenticated sessions are never filtered out by RLS
ALTER TABLE public.meditations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read meditations" ON public.meditations;
CREATE POLICY "Authenticated users can read meditations"
  ON public.meditations
  FOR SELECT
  USING (auth.uid() IS NOT NULL OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage meditations" ON public.meditations;
CREATE POLICY "Service role can manage meditations"
  ON public.meditations
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Storage read access should follow the same rule set
DROP POLICY IF EXISTS "Authenticated users can read meditation audio" ON storage.objects;
CREATE POLICY "Authenticated users can read meditation audio"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'meditation-audios'
    AND (auth.uid() IS NOT NULL OR auth.role() = 'service_role')
  );

DROP POLICY IF EXISTS "Service role can manage meditation audio" ON storage.objects;
CREATE POLICY "Service role can manage meditation audio"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'meditation-audios' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'meditation-audios' AND auth.role() = 'service_role');
