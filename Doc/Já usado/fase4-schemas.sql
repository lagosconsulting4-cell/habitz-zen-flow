-- =====================================================
-- Fase 4: Check-ins Emocionais e Progresso TDAH
-- =====================================================
-- Tabelas para tracking emocional e aderência ao programa
-- =====================================================

-- =====================================================
-- Tabela: daily_checkins
-- =====================================================
-- Armazena os check-ins emocionais diários dos usuários
-- Foco: Estado emocional, energia e foco (métricas TDAH)
-- =====================================================

CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,

  -- Níveis de 1 a 5 (1 = muito baixo, 5 = muito alto)
  mood_level INT NOT NULL CHECK (mood_level BETWEEN 1 AND 5),
  energy_level INT CHECK (energy_level BETWEEN 1 AND 5),
  focus_level INT CHECK (focus_level BETWEEN 1 AND 5),

  -- Notas opcionais do usuário
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Garantir apenas 1 check-in por usuário por dia
  UNIQUE(user_id, checkin_date)
);

-- =====================================================
-- Índices para Performance
-- =====================================================

-- Buscar check-ins por usuário (mais comum)
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_id
ON daily_checkins(user_id);

-- Buscar check-ins por data (para análises temporais)
CREATE INDEX IF NOT EXISTS idx_daily_checkins_date
ON daily_checkins(checkin_date DESC);

-- Buscar check-ins de um usuário em um período
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date
ON daily_checkins(user_id, checkin_date DESC);

-- =====================================================
-- RLS (Row Level Security) Policies
-- =====================================================

-- Habilitar RLS
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seus próprios check-ins
CREATE POLICY "Users can view their own checkins"
ON daily_checkins FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Usuários podem inserir seus próprios check-ins
CREATE POLICY "Users can insert their own checkins"
ON daily_checkins FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios check-ins
CREATE POLICY "Users can update their own checkins"
ON daily_checkins FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar seus próprios check-ins
CREATE POLICY "Users can delete their own checkins"
ON daily_checkins FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- Trigger: Atualizar updated_at automaticamente
-- =====================================================

CREATE OR REPLACE FUNCTION update_daily_checkins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_daily_checkins_updated_at
BEFORE UPDATE ON daily_checkins
FOR EACH ROW
EXECUTE FUNCTION update_daily_checkins_updated_at();

-- =====================================================
-- Comentários (Documentação)
-- =====================================================

COMMENT ON TABLE daily_checkins IS
'Check-ins emocionais diários para tracking do estado mental e físico do usuário com TDAH';

COMMENT ON COLUMN daily_checkins.mood_level IS
'Nível de humor: 1=Péssimo (😔), 2=Ruim (😕), 3=Neutro (😐), 4=Bom (🙂), 5=Ótimo (😊)';

COMMENT ON COLUMN daily_checkins.energy_level IS
'Nível de energia física: 1=Sem energia, 5=Muito energizado (opcional)';

COMMENT ON COLUMN daily_checkins.focus_level IS
'Nível de foco/concentração: 1=Muito disperso, 5=Muito focado (opcional)';

COMMENT ON COLUMN daily_checkins.notes IS
'Notas opcionais do usuário sobre como está se sentindo';

-- =====================================================
-- Dados de Exemplo (Opcional - para testes)
-- =====================================================

-- Descomentar para inserir dados de exemplo
/*
-- Assumindo que existe um usuário de teste
INSERT INTO daily_checkins (user_id, checkin_date, mood_level, energy_level, focus_level, notes)
VALUES
  -- Últimos 7 dias
  (auth.uid(), CURRENT_DATE - INTERVAL '6 days', 3, 3, 2, 'Dia normal, um pouco disperso'),
  (auth.uid(), CURRENT_DATE - INTERVAL '5 days', 4, 4, 4, 'Bom dia! Consegui focar bem'),
  (auth.uid(), CURRENT_DATE - INTERVAL '4 days', 2, 2, 2, 'Dia difícil'),
  (auth.uid(), CURRENT_DATE - INTERVAL '3 days', 3, 3, 3, NULL),
  (auth.uid(), CURRENT_DATE - INTERVAL '2 days', 4, 3, 4, 'Melhorando'),
  (auth.uid(), CURRENT_DATE - INTERVAL '1 day', 5, 4, 4, 'Dia ótimo!'),
  (auth.uid(), CURRENT_DATE, 4, 4, 3, NULL);
*/

-- =====================================================
-- Queries Úteis (Exemplos de Uso)
-- =====================================================

-- Buscar check-in de hoje
-- SELECT * FROM daily_checkins
-- WHERE user_id = auth.uid() AND checkin_date = CURRENT_DATE;

-- Buscar últimos 7 dias de check-ins
-- SELECT * FROM daily_checkins
-- WHERE user_id = auth.uid()
-- AND checkin_date >= CURRENT_DATE - INTERVAL '7 days'
-- ORDER BY checkin_date DESC;

-- Calcular média de humor dos últimos 30 dias
-- SELECT AVG(mood_level) as avg_mood
-- FROM daily_checkins
-- WHERE user_id = auth.uid()
-- AND checkin_date >= CURRENT_DATE - INTERVAL '30 days';

-- Contar quantos check-ins foram feitos no total
-- SELECT COUNT(*) as total_checkins
-- FROM daily_checkins
-- WHERE user_id = auth.uid();

-- =====================================================
-- Notas de Implementação
-- =====================================================

/*
BACKEND (Supabase):
1. Execute este SQL no Supabase SQL Editor
2. Verifique se a tabela foi criada em "Table Editor"
3. Confirme que as policies RLS estão ativas

FRONTEND (React):
1. Atualizar src/integrations/supabase/types.ts com o novo tipo
2. Criar hook useCheckins.ts para gerenciar check-ins
3. Criar componente CheckinCard.tsx
4. Adicionar card no Dashboard.tsx

FLUXO DO USUÁRIO:
1. Usuário abre Dashboard
2. Se não fez check-in hoje, vê o card
3. Clica em um emoji (1-5)
4. INSERT na tabela daily_checkins
5. Card desaparece
6. Amanhã, card aparece novamente

VALIDAÇÕES:
- UNIQUE(user_id, checkin_date) impede múltiplos check-ins no mesmo dia
- Se usuário tentar inserir de novo, pode fazer UPDATE ao invés de INSERT
- Frontend deve verificar se já existe check-in antes de mostrar card
*/
