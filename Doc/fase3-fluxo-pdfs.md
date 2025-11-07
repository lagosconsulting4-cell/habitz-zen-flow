# Fluxo de PDFs - Bucket plan-pdfs

## 📋 Visão Geral

O bucket `plan-pdfs` armazena os **PDFs de análise** gerados após o usuário completar o quiz de avaliação de TDAH. Esses PDFs contêm:
- Tipo de diagnóstico (TDAH Desatento, Hiperativo, Combinado, etc)
- Probabilidade de melhora em 30 dias
- Sintomas identificados
- Mini-hábitos sugeridos
- Estratégias de recompensa personalizadas

---

## 🔄 Fluxo Completo

### **1. Usuário faz o Quiz**
**Página:** `/quiz`
- Responde 40 perguntas sobre sintomas de TDAH
- Sistema calcula scores por categoria (desatenção, hiperatividade, impulsividade)
- Salva na tabela `assessment_responses`
- Gera um `assessment_id` único

### **2. Usuário vê a Análise**
**Página:** `/analise?assessment_id={id}`
- Sistema carrega os dados do assessment
- Calcula o tipo de diagnóstico baseado nos scores
- Exibe análise completa em card visual
- Botão "Baixar Resumo em PDF" disponível

### **3. Usuário clica em "Baixar Resumo em PDF"**
**Arquivo:** `src/pages/Analysis.tsx` (linha 69-162)

**Processo:**
1. **Gera o PDF**
   - Usa `html2canvas` para converter o card de análise em imagem
   - Usa `jsPDF` para criar um PDF A4 com a imagem

2. **Faz Upload (se usuário autenticado)**
   - Converte PDF em blob: `pdf.output("blob")`
   - Faz upload para: `plan-pdfs/{user_id}/analysis-{assessment_id}.pdf`
   - Usa `upsert: true` para permitir sobrescrever se já existe

3. **Salva no Banco de Dados**
   - Tabela: `analysis_summaries`
   - Campos salvos:
     - `assessment_id`: ID do quiz respondido
     - `user_id`: ID do usuário (ou null se não autenticado)
     - `diagnosis_type`: Tipo de diagnóstico calculado
     - `probability_score`: Probabilidade de melhora
     - `summary_pdf_url`: Path do PDF no storage (ex: `{user_id}/analysis-{assessment_id}.pdf`)

4. **Download Local**
   - Faz download do PDF no computador do usuário
   - Nome: `analise-habitz-{assessment_id}.pdf`

5. **Tracking**
   - Registra evento `analysis_pdf_downloaded` no analytics
   - Inclui se foi salvo no storage ou não

---

## 📁 Estrutura do Bucket plan-pdfs

```
plan-pdfs/
  {user_id_1}/
    analysis-assessment123.pdf
    analysis-assessment456.pdf
  {user_id_2}/
    analysis-assessment789.pdf
  ...
```

**Nomenclatura:**
- Path: `{user_id}/analysis-{assessment_id}.pdf`
- Exemplo: `550e8400-e29b-41d4-a716-446655440000/analysis-clc8x9k0x0000uvyf1234abcd.pdf`

---

## 🔐 Segurança (RLS Policies)

### **Políticas Aplicadas:**

1. **Usuários podem visualizar apenas seus próprios PDFs**
```sql
CREATE POLICY "Users can view their own plan PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'plan-pdfs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

2. **Usuários podem fazer upload de seus próprios PDFs**
```sql
CREATE POLICY "Users can upload their own plan PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'plan-pdfs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

3. **Service role tem acesso total**
```sql
CREATE POLICY "Service role can manage plan PDFs"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'plan-pdfs');
```

---

## 🎯 Casos de Uso

### **Caso 1: Usuário Autenticado**
- ✅ PDF é gerado
- ✅ PDF é salvo no storage (`plan-pdfs/{user_id}/analysis-{assessment_id}.pdf`)
- ✅ URL é salva no banco (`summary_pdf_url`)
- ✅ PDF é baixado localmente
- ✅ Usuário pode re-baixar depois via histórico

### **Caso 2: Usuário NÃO Autenticado (Guest)**
- ✅ PDF é gerado
- ❌ PDF NÃO é salvo no storage (sem user_id)
- ❌ `summary_pdf_url` fica como `null`
- ✅ PDF é baixado localmente
- ❌ Usuário não pode re-baixar depois (não há registro)

---

## 💡 Funcionalidades Futuras

### **1. Histórico de Análises**
Criar uma página `/historico` onde o usuário pode:
- Ver todas as análises que já fez
- Re-baixar PDFs antigos
- Comparar resultados ao longo do tempo

**Implementação:**
```typescript
// Buscar análises do usuário
const { data } = await supabase
  .from("analysis_summaries")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });

// Para cada análise, gerar signed URL para download
const signedUrl = await getSignedDownloadUrl(
  "plan-pdfs",
  data.summary_pdf_url,
  3600 // 1 hora
);
```

### **2. Compartilhamento**
Permitir que o usuário compartilhe sua análise com profissionais de saúde:
- Gerar link temporário (signed URL com expiração)
- Enviar por email
- Imprimir versão otimizada

### **3. PDFs de Progresso**
Criar novos PDFs mostrando:
- Progresso do usuário no programa de 30 dias
- Mini-hábitos completados
- Streaks e conquistas
- Comparação antes/depois

**Path sugerido:** `{user_id}/progress-{date}.pdf`

---

## 🐛 Tratamento de Erros

### **Erro 1: Upload falha (sem permissões)**
```
Console: "Erro ao fazer upload do PDF: {error}"
Toast: "Erro ao salvar PDF no servidor. O download local continuará."
Comportamento: PDF é baixado localmente, mas não salvo no storage
```

### **Erro 2: Bucket não existe**
```
Console: "Erro ao fazer upload do PDF: Bucket not found"
Solução: Criar bucket plan-pdfs no Supabase Dashboard
```

### **Erro 3: Quota de storage excedida**
```
Console: "Erro ao fazer upload do PDF: Storage quota exceeded"
Solução: Upgrade do plano Supabase ou limpeza de PDFs antigos
```

### **Erro 4: Usuário não autenticado**
```
Comportamento: Código detecta user === null e pula o upload
PDF é apenas baixado localmente
```

---

## 📊 Tabelas Relacionadas

### **analysis_summaries**
```sql
CREATE TABLE analysis_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessment_responses(id),
  user_id UUID REFERENCES auth.users(id),
  diagnosis_type TEXT NOT NULL,
  probability_score DECIMAL NOT NULL,
  summary_pdf_url TEXT, -- Path no storage: "{user_id}/analysis-{assessment_id}.pdf"
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **assessment_responses**
```sql
CREATE TABLE assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  answers JSONB NOT NULL,
  scores JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔧 Manutenção

### **Limpar PDFs Antigos (Cleanup)**
Para evitar exceder quota de storage:

```sql
-- Listar PDFs com mais de 6 meses
SELECT
  summary_pdf_url,
  created_at
FROM analysis_summaries
WHERE created_at < NOW() - INTERVAL '6 months'
  AND summary_pdf_url IS NOT NULL;

-- Deletar do storage (via código)
import { deleteFile } from "@/lib/storage";

await deleteFile("plan-pdfs", summary_pdf_url);

-- Atualizar banco (marcar como deletado)
UPDATE analysis_summaries
SET summary_pdf_url = NULL
WHERE created_at < NOW() - INTERVAL '6 months';
```

### **Migrar PDFs para novo formato**
Se precisar mudar estrutura de pastas:

```typescript
// Listar todos os PDFs
const { data: files } = await supabase.storage
  .from("plan-pdfs")
  .list("");

// Para cada arquivo, mover para nova estrutura
for (const file of files) {
  const oldPath = file.name;
  const newPath = `new-structure/${file.name}`;

  // Baixar
  const { data } = await supabase.storage
    .from("plan-pdfs")
    .download(oldPath);

  // Re-upload
  await supabase.storage
    .from("plan-pdfs")
    .upload(newPath, data);

  // Deletar antigo
  await supabase.storage
    .from("plan-pdfs")
    .remove([oldPath]);
}
```

---

## ✅ Checklist de Implementação

- [x] Bucket `plan-pdfs` criado no Supabase
- [x] Políticas RLS aplicadas
- [x] Código de upload implementado em `Analysis.tsx`
- [x] Campo `summary_pdf_url` sendo salvo no banco
- [x] Tratamento de erros implementado
- [x] Download local funcionando
- [ ] Página de histórico de análises (futuro)
- [ ] Compartilhamento de PDFs (futuro)
- [ ] Cleanup automático de PDFs antigos (futuro)

---

## 📝 Notas Técnicas

1. **Por que usar `upsert: true`?**
   - Se o usuário gerar o PDF múltiplas vezes para o mesmo assessment, sobrescreve o anterior
   - Evita duplicatas no storage

2. **Por que salvar path em vez de URL completa?**
   - URLs do Supabase Storage são temporárias (signed URLs)
   - Salvando o path, podemos gerar novas signed URLs quando necessário
   - Mais flexível para migração de buckets

3. **Por que permitir usuários não autenticados gerarem PDFs?**
   - Marketing: usuário experimenta a análise antes de criar conta
   - Conversão: após ver o valor, tem incentivo para criar conta e acessar o programa completo
   - Limitação: sem conta, não pode re-baixar depois (incentivo adicional para cadastro)

4. **Tamanho médio dos PDFs**
   - PDF de análise: ~200-500 KB (depende do conteúdo)
   - Quota gratuita Supabase: 1 GB
   - Capacidade aproximada: 2.000-5.000 PDFs

---

## 🚀 Próximos Passos

1. Testar geração de PDF com usuário autenticado
2. Verificar se o upload está funcionando no storage
3. Verificar se `summary_pdf_url` está sendo salvo corretamente
4. Implementar página de histórico de análises
5. Criar função de re-download de PDFs antigos
