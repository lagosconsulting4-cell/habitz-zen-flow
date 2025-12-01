-- =====================================================
-- Fase 3: Atualizar URLs dos E-books
-- =====================================================
-- Execute este SQL APÓS fazer upload dos e-books no bucket bonus-ebooks
-- =====================================================

-- E-book 1: 101 Técnicas da Terapia Cognitivo Comportamental
UPDATE public.module_resources
SET file_url = 'bonus-ebooks/101-Tecnicas-da-Terapia-Cognitivo-Comportamental.pdf'
WHERE module_id = (SELECT id FROM public.program_modules WHERE module_number = 8)
  AND resource_type = 'ebook'
  AND title = '101 Técnicas da Terapia Cognitivo Comportamental';

-- E-book 2: Como lidar com mentes a mil
UPDATE public.module_resources
SET file_url = 'bonus-ebooks/Como-lidar-com-mentes-a-mil.pdf'
WHERE module_id = (SELECT id FROM public.program_modules WHERE module_number = 8)
  AND resource_type = 'ebook'
  AND title = 'Como lidar com mentes a mil';

-- E-book 3: Vencendo o TDAH Adulto
UPDATE public.module_resources
SET file_url = 'bonus-ebooks/Vencendo-o-TDAH-Adulto.pdf'
WHERE module_id = (SELECT id FROM public.program_modules WHERE module_number = 8)
  AND resource_type = 'ebook'
  AND title = 'Vencendo o TDAH Adulto';

-- =====================================================
-- Verificar se os updates funcionaram
-- =====================================================

SELECT
  title,
  file_url,
  CASE
    WHEN file_url IS NOT NULL THEN '✅ URL configurada'
    ELSE '❌ URL ausente'
  END as status
FROM public.module_resources
WHERE module_id = (SELECT id FROM public.program_modules WHERE module_number = 8)
  AND resource_type = 'ebook'
ORDER BY title;

-- =====================================================
-- Resultado esperado:
-- =====================================================
-- | title                                              | file_url                                                        | status            |
-- |----------------------------------------------------|----------------------------------------------------------------|-------------------|
-- | 101 Técnicas da Terapia Cognitivo Comportamental | bonus-ebooks/101-Tecnicas-da-Terapia-Cognitivo-Comportamental.pdf | ✅ URL configurada |
-- | Como lidar com mentes a mil                        | bonus-ebooks/Como-lidar-com-mentes-a-mil.pdf                    | ✅ URL configurada |
-- | Vencendo o TDAH Adulto                             | bonus-ebooks/Vencendo-o-TDAH-Adulto.pdf                         | ✅ URL configurada |
-- =====================================================
