-- W1: surfacing do "como fazer" — persistir a descrição (execução) do hábito.
-- Aditiva, nullable, idempotente. O conteúdo já existe nos templates (generateRecommendationsV2)
-- mas era descartado na criação; agora é gravado e exibido na Sessão.
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS description text;

COMMENT ON COLUMN public.habits.description IS 'Como executar o hábito (texto curto). Vem do template na criação via onboarding; exibido na Sessão como "como fazer".';
