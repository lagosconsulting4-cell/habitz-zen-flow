-- =====================================================
-- Fase 3: Storage Buckets Configuration
-- =====================================================
-- Este arquivo configura os buckets do Supabase Storage
-- para armazenar ebooks e PDFs do programa
-- =====================================================
-- NOTA: Não usaremos vídeos ou áudios. As aulas são em formato de texto.
-- =====================================================

-- IMPORTANTE: Este SQL não pode ser executado diretamente
-- Os buckets devem ser criados via Supabase Dashboard ou API
-- Este arquivo documenta as configurações necessárias

/*
=== CRIAR OS SEGUINTES BUCKETS NO SUPABASE DASHBOARD ===

1. bonus-ebooks
   - Public: false (privado)
   - Allowed MIME types: application/pdf, application/epub+zip
   - Max file size: 50 MB
   - Descrição: E-books e materiais bônus para download

2. plan-pdfs
   - Public: false (privado)
   - Allowed MIME types: application/pdf
   - Max file size: 10 MB
   - Descrição: PDFs gerados de análises e planos personalizados
*/

-- =====================================================
-- RLS Policies para os Buckets
-- =====================================================

-- Bucket: bonus-ebooks
-- Usuários autenticados podem visualizar ebooks
CREATE POLICY "Authenticated users can view ebooks"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'bonus-ebooks');

-- Service role pode fazer upload de ebooks
CREATE POLICY "Service role can upload ebooks"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'bonus-ebooks');

-- Service role pode atualizar ebooks
CREATE POLICY "Service role can update ebooks"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'bonus-ebooks');

-- Service role pode deletar ebooks
CREATE POLICY "Service role can delete ebooks"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'bonus-ebooks');

-- =====================================================

-- Bucket: plan-pdfs
-- Usuários podem visualizar apenas seus próprios PDFs
-- Nota: O RLS aqui depende de metadados adicionados ao fazer upload
CREATE POLICY "Users can view their own plan PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'plan-pdfs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Usuários podem fazer upload de seus próprios PDFs
CREATE POLICY "Users can upload their own plan PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'plan-pdfs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Service role tem acesso total
CREATE POLICY "Service role can manage plan PDFs"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'plan-pdfs');

-- =====================================================
-- Estrutura de Pastas Sugerida
-- =====================================================

/*
bonus-ebooks/
  ebook-1-fundamentos-tdah.pdf
  ebook-2-estrategias-foco.pdf
  ebook-3-organizacao-rotinas.pdf
  ...

plan-pdfs/
  {user_id}/
    analysis-{assessment_id}.pdf
    plan-{date}.pdf
*/

-- =====================================================
-- Notas de Implementação
-- =====================================================

/*
1. CRIAR BUCKETS:
   - Acesse o Supabase Dashboard
   - Vá em Storage > Create a new bucket
   - Crie os dois buckets: bonus-ebooks e plan-pdfs

2. APLICAR POLICIES:
   - Após criar os buckets, execute as policies acima
   - Ou configure as policies via Dashboard em Storage > Policies

3. UPLOAD DE CONTEÚDO (E-books):
   - Use o Dashboard para fazer upload inicial dos e-books
   - Ou use a CLI do Supabase: supabase storage cp ./ebook.pdf bonus-ebooks/ebook-1-fundamentos-tdah.pdf
   - Formato suportado: PDF, EPUB

4. NOMENCLATURA:
   - Para ebooks: ebook-{number}-{title-slug}.pdf
   - Para PDFs do usuário: {user_id}/analysis-{assessment_id}.pdf
   - Exemplo: bonus-ebooks/ebook-1-fundamentos-tdah.pdf

5. SIGNED URLS:
   - URLs assinadas são geradas no frontend via supabase.storage.createSignedUrl()
   - Expiração padrão: 1 hora (3600 segundos)
   - Implementado em: src/lib/storage.ts

6. ATUALIZAR SEEDS:
   - Após fazer upload dos e-books, atualize a tabela module_resources
   - Defina file_url como: bonus-ebooks/nome-do-arquivo.pdf
   - Exemplo: UPDATE module_resources SET file_url = 'bonus-ebooks/ebook-1-fundamentos-tdah.pdf' WHERE id = '...';
*/
