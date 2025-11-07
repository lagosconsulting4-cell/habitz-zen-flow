# 📝 Guia Completo de Produção de Conteúdo - Habitz TDAH

**Data:** 2025-01-05
**Status Atual:** Schemas 100% prontos, Conteúdo 0% produzido
**Objetivo:** Mapear TUDO que precisa ser criado

---

## 🎯 RESUMO EXECUTIVO

| Status | Descrição |
|--------|-----------|
| **Banco de Dados** | ✅ 100% Pronto (schemas aplicados) |
| **Código do App** | ✅ 100% Pronto (todas páginas funcionais) |
| **Conteúdo** | ❌ 0% Produzido |
| **Prioridade** | 🔴 CRÍTICA - App não funciona sem conteúdo |

**Total de Horas:** 190-295 horas de produção
**Timeline Mínimo:** 1-2 semanas (crítico apenas)
**Timeline Completo:** 5-6 semanas (tudo)

---

## 🔴 CONTEÚDO CRÍTICO (SEM ISSO O APP NÃO FUNCIONA)

### 1. 📚 **37 Transcrições de Aulas** (Module Lessons)

**Onde:** Página `/plano` → Modal de aula
**Tabela:** `module_lessons`
**Campo:** `transcript` (TEXT)
**Status:** ❌ 0/37 escritas

---

#### **Distribuição por Módulo:**

| Módulo | Semana | Aulas | Palavras/Aula | Total Palavras | Prioridade |
|--------|--------|-------|---------------|----------------|------------|
| **Módulo 1** - Introdução | 1 | 4 | 1,500-1,800 | ~6,500 | 🔴 ALTA |
| **Módulo 2** - Motivação | 1 | 2 | 1,500-1,800 | ~3,200 | 🔴 ALTA |
| **Módulo 3** - Barreiras | 2 | 4 | 1,200-1,400 | ~5,100 | 🟡 MÉDIA |
| **Módulo 4** - Procrastinação | 2 | 7 | 1,100-1,300 | ~8,400 | 🟡 MÉDIA |
| **Módulo 5** - Sistema de Hábitos | 3 | 8 | 1,100-1,300 | ~9,400 | 🟡 MÉDIA |
| **Módulo 6** - Força de Vontade | 3 | 6 | 1,000-1,200 | ~6,500 | 🟢 BAIXA |
| **Módulo 7** - Ambiente | 4 | 6 | 1,100-1,300 | ~7,000 | 🟢 BAIXA |
| **Módulo 9** - Lives (Bônus) | - | 2 | 3,000-3,500 | ~6,500 | 🟢 BAIXA |

**Total:** 37 aulas, ~54,600 palavras

---

#### **Especificações de Escrita:**

**Formato:** Texto corrido (markdown aceito)

**Estrutura de Cada Aula:**

```markdown
# [Título da Aula]

## Introdução (150-200 palavras)
- Por que este tema é importante para quem tem TDAH
- O que você vai aprender nesta aula

## Conceito 1: [Nome] (300-400 palavras)
- Explicação clara e prática
- Exemplo específico para TDAH
- Como aplicar no dia a dia

## Conceito 2: [Nome] (300-400 palavras)
[mesmo formato]

## Conceito 3: [Nome] (300-400 palavras)
[mesmo formato]

## Resumo (100-150 palavras)
- 3 pontos-chave da aula
- O que lembrar

## Próximos Passos (100-150 palavras)
- 1-2 ações concretas para aplicar HOJE
- Conexão com a próxima aula
```

---

#### **Tom e Linguagem:**

✅ **Fazer:**
- Tom acolhedor e encorajador
- Exemplos práticos e específicos
- Linguagem simples (8º ano de escolaridade)
- Frases curtas (máx 20 palavras)
- Parágrafos curtos (máx 3-4 linhas)
- Uso de listas e bullet points
- Histórias e metáforas

❌ **Evitar:**
- Tom autoritário ou julgador
- Jargões acadêmicos
- Frases longas e complexas
- Parágrafos densos
- Negatividade ou culpabilização
- Generalizações ("todo mundo")

---

#### **Exemplos de Títulos das Aulas:**

**Módulo 1:**
1. Apresentando Mini-Hábitos (1,500 palavras)
2. Qual a aparência dos nossos hábitos (1,600 palavras)
3. Repetidor Burro x Gerente Esperto (1,700 palavras)
4. Córtex Pré-frontal x Núcleo de Base (1,700 palavras)

**Módulo 2:**
1. A verdade sobre motivação (1,600 palavras)
2. Por que a motivação falha (1,600 palavras)

*(Ver lista completa no arquivo `fase2-seeds.sql`)*

---

#### **Onde Está Definido:**

**Arquivo:** `Doc/fase2-seeds.sql` (linhas 16-250)

Cada aula já tem:
- ✅ Título definido
- ✅ Tipo (text/video/audio)
- ✅ Duração estimada
- ❌ Transcript (PRECISA ESCREVER)

---

#### **Como Inserir no Banco:**

**Opção A - SQL Update:**
```sql
UPDATE module_lessons
SET transcript = 'Conteúdo da aula aqui...'
WHERE title = 'Apresentando Mini-Hábitos';
```

**Opção B - Supabase Dashboard:**
1. Table Editor > module_lessons
2. Encontrar aula pelo título
3. Clicar em "Edit"
4. Colar texto no campo `transcript`
5. Salvar

---

#### **Estimativa de Produção:**

| Atividade | Tempo/Aula | Total (37 aulas) |
|-----------|------------|------------------|
| Pesquisa + Outline | 30-45 min | 18-28h |
| Escrita | 60-90 min | 37-56h |
| Revisão + Edição | 15-30 min | 9-19h |
| **TOTAL** | **2-3h** | **64-103h** |

**Timeline:** 2-3 semanas (dedicação integral) ou 4-6 semanas (meio período)

---

### 2. 🎧 **10 Áudios de Meditação** (Meditation Audio)

**Onde:** Página `/meditation` → Player de áudio
**Tabela:** `meditations`
**Campo:** `audio_path` (já preenchido, precisa dos arquivos)
**Status:** ❌ 0/10 gravados

---

#### **Lista de Meditações:**

| # | Nome | Duração | Categoria | Gratuito | Path |
|---|------|---------|-----------|----------|------|
| 1 | Box Breathing | 5 min | Respiração | ✅ SIM | `respiracao/box-breathing.mp3` |
| 2 | Respiração 4-7-8 | 3 min | Respiração | ✅ SIM | `respiracao/respiracao-4-7-8.mp3` |
| 3 | Respiração Monge | 10 min | Respiração | ✅ SIM | `respiracao/respiracao-monge.mp3` |
| 4 | Silêncio Tático | 5 min | Foco | ✅ SIM | `foco/silencio-tatico.mp3` |
| 5 | Modo Guerreiro | 10 min | Energia | 💎 PREMIUM | `energia/modo-guerreiro.mp3` |
| 6 | Respiração de Combate | 3 min | Energia | 💎 PREMIUM | `energia/respiracao-de-combate.mp3` |
| 7 | Modo Reset | 4 min | Reset | ✅ SIM | `reset/modo-reset.mp3` |
| 8 | Meditação Foco Total | 5 min | Foco | 💎 PREMIUM | `foco/meditacao-foco-total.mp3` |
| 9 | Ancoragem do Presente | 5 min | Presente | ✅ SIM | `presente/ancoragem-do-presente.mp3` |
| 10 | Modo Noturno | 11 min | Sono | 💎 PREMIUM | `sono/modo-noturno.mp3` |

**Total:** ~61 minutos de áudio

---

#### **Especificações Técnicas:**

**Formato:**
- Codec: MP3
- Bitrate: 128 kbps (CBR)
- Sample Rate: 44.1 kHz
- Channels: Stereo
- File size: 5-15 MB por arquivo

**Qualidade de Áudio:**
- Sem ruídos de fundo
- Volume normalizado (-16 LUFS)
- Voz clara e pausada
- Música ambiente sutil (opcional, 20% do volume da voz)

---

#### **Estrutura do Script (Exemplo - Box Breathing 5min):**

```
[Música ambiente suave começa]

[0:00-0:30] Introdução
"Bem-vindo. Esta é uma sessão de Box Breathing,
uma técnica simples para acalmar sua mente e corpo
em apenas 5 minutos.

Encontre uma posição confortável, sentado ou deitado.
Feche seus olhos suavemente."

[0:30-4:30] Ciclos de Respiração
"Vamos começar. Inspire pelo nariz...
contando até 4... 1... 2... 3... 4...

Segure o ar... contando até 4...
1... 2... 3... 4...

Expire pela boca... contando até 4...
1... 2... 3... 4...

Segure vazio... contando até 4...
1... 2... 3... 4...

[Repetir 15-20 ciclos]"

[4:30-5:00] Fechamento
"Aos poucos, volte sua atenção para o ambiente.
Abra seus olhos quando estiver pronto.
Parabéns, você concluiu sua prática."

[Música fade out]
```

---

#### **Opções de Produção:**

**Opção A - Profissional (Recomendado):**
- Contratar locutor profissional via Fiverr/Workana
- Custo: R$ 200-500 por áudio (10 áudios = R$ 2.000-5.000)
- Tempo: 1-2 semanas
- Qualidade: ⭐⭐⭐⭐⭐

**Opção B - Text-to-Speech (Mais Rápido):**
- Google Cloud Text-to-Speech (voz "pt-BR-Wavenet-A")
- Amazon Polly (voz "Camila" ou "Vitória")
- Custo: R$ 50-200 (processamento + edição)
- Tempo: 2-3 dias
- Qualidade: ⭐⭐⭐⭐

**Opção C - DIY (Mais Barato):**
- Gravar você mesmo com Audacity
- Microfone decente (Blue Yeti ~R$ 800)
- Custo: R$ 800 (microfone) + tempo
- Tempo: 10-20 horas (aprendizado + gravação + edição)
- Qualidade: ⭐⭐⭐

---

#### **Como Fazer Upload:**

**1. Criar bucket no Supabase:**
```
Dashboard > Storage > New Bucket
Nome: meditation-audios
Public: false
Max size: 100 MB
```

**2. Upload dos arquivos:**
```
Storage > meditation-audios > Upload
Estrutura de pastas:
  /respiracao/
    box-breathing.mp3
    respiracao-4-7-8.mp3
    respiracao-monge.mp3
  /foco/
    silencio-tatico.mp3
    meditacao-foco-total.mp3
  /energia/
    modo-guerreiro.mp3
    respiracao-de-combate.mp3
  /reset/
    modo-reset.mp3
  /presente/
    ancoragem-do-presente.mp3
  /sono/
    modo-noturno.mp3
```

**3. Testar no app:**
- Ir em `/meditation`
- Clicar em uma meditação
- Player deve carregar o áudio

---

#### **Estimativa:**

| Opção | Custo | Tempo | Qualidade |
|-------|-------|-------|-----------|
| Profissional | R$ 2.000-5.000 | 1-2 semanas | ⭐⭐⭐⭐⭐ |
| TTS | R$ 50-200 | 2-3 dias | ⭐⭐⭐⭐ |
| DIY | R$ 800 | 10-20h | ⭐⭐⭐ |

**Recomendação:** Opção A (Profissional) ou B (TTS) para lançamento rápido.

---

## 🟡 CONTEÚDO IMPORTANTE (FEATURES INCOMPLETAS SEM)

### 3. 📖 **3 E-books** (Bonus Content)

**Onde:** Módulo 8 (Bônus E-books) → Botão "Baixar"
**Tabela:** `module_resources`
**Campo:** `file_url`
**Status:** ❌ 0/3 escritos

---

#### **E-books Necessários:**

**1. Como lidar com mentes a mil**
- Páginas: 40-60
- Foco: Técnicas para acalmar pensamentos acelerados
- Tópicos: Mindfulness, journaling, âncoras mentais
- Formato: PDF com design atrativo
- Tempo: 30-40h de produção

**2. Vencendo o TDAH Adulto**
- Páginas: 50-80
- Foco: Guia completo para adultos com TDAH
- Tópicos: Trabalho, relacionamentos, finanças, saúde
- Formato: PDF com ilustrações
- Tempo: 40-50h de produção

**3. 101 Técnicas da Terapia Cognitivo Comportamental**
- Páginas: 80-120
- Foco: Técnicas práticas de TCC adaptadas para TDAH
- Tópicos: Reestruturação cognitiva, exposição gradual, etc
- Formato: PDF tipo guia prático
- Tempo: 50-60h de produção

---

#### **Especificações de Produção:**

**Formato Final:**
- PDF text-searchable (não escaneado)
- Tamanho: <50 MB cada
- Fonte: Sans-serif, tamanho 12-14pt
- Espaçamento: 1.5 linhas
- Margens: 2.5cm

**Design:**
- Capa atrativa (profissional)
- Índice clicável
- Headers e footers
- Destaque em boxes (dicas, exemplos)
- Uso de cores do Habitz (roxo/rosa/verde)

**Conteúdo:**
- Baseado em evidências científicas
- Linguagem acessível
- Exemplos práticos
- Exercícios aplicáveis
- Referências bibliográficas

---

#### **Como Fazer Upload:**

**1. Criar bucket:**
```
Storage > New Bucket
Nome: bonus-ebooks
Public: false
Max size: 50 MB
Allowed: application/pdf
```

**2. Upload:**
```
bonus-ebooks/
  ebook-1-mentes-a-mil.pdf
  ebook-2-vencendo-tdah.pdf
  ebook-3-tcc-101.pdf
```

**3. Atualizar banco:**
```sql
UPDATE module_resources
SET file_url = 'bonus-ebooks/ebook-1-mentes-a-mil.pdf'
WHERE title = 'Como lidar com mentes a mil';

UPDATE module_resources
SET file_url = 'bonus-ebooks/ebook-2-vencendo-tdah.pdf'
WHERE title = 'Vencendo o TDAH Adulto';

UPDATE module_resources
SET file_url = 'bonus-ebooks/ebook-3-tcc-101.pdf'
WHERE title = '101 Técnicas da Terapia Cognitivo Comportamental';
```

---

#### **Estimativa:**

| E-book | Páginas | Tempo de Escrita | Tempo de Design | Total |
|--------|---------|------------------|-----------------|-------|
| #1 | 40-60 | 20-30h | 10h | 30-40h |
| #2 | 50-80 | 30-40h | 10h | 40-50h |
| #3 | 80-120 | 40-50h | 10h | 50-60h |
| **TOTAL** | **170-260** | **90-120h** | **30h** | **120-150h** |

**Timeline:** 3-4 semanas (dedicação integral)

---

### 4. 💬 **50+ Citações Novas** (Quotes)

**Onde:** Dashboard → Card "Citação do Dia"
**Tabela:** `quotes`
**Status:** ✅ 100 citações JÁ EXISTEM (seeds), ⚠️ mas poderia ter mais

---

#### **Citações Atuais:**

Já temos 100 citações inseridas via migrations. Está OK para lançamento, mas **ideal seria ter 150-200** para mais variedade.

---

#### **Categorias para Adicionar (Opcional):**

| Categoria | Atual | Ideal | Faltam |
|-----------|-------|-------|--------|
| Motivação | ~40 | 60 | 20 |
| TDAH-específico | ~10 | 40 | 30 |
| Hábitos | ~30 | 40 | 10 |
| Procrastinação | ~10 | 20 | 10 |
| Mindfulness | ~10 | 20 | 10 |

**Total a adicionar:** 80 citações

---

#### **Formato:**

```sql
INSERT INTO quotes (content, author, category) VALUES
('O segredo do sucesso é começar.', 'Mark Twain', 'Motivação'),
('TDAH não é falta de atenção, é atenção em tudo ao mesmo tempo.', 'Edward Hallowell', 'TDAH'),
('Hábitos são o juros composto da auto-melhoria.', 'James Clear', 'Hábitos');
```

---

#### **Estimativa:**

- 80 citações × 5 min cada = 6-7 horas
- **Prioridade:** 🟢 Baixa (já temos 100)

---

## 🟢 CONTEÚDO OPCIONAL (PODE ADICIONAR DEPOIS)

### 5. 📚 **Livros Recomendados** (Books Hub)

**Status:** ✅ 4 livros já inseridos
**Opcional:** Adicionar mais 15-20 livros

**Tempo:** 5-10h (buscar capas, links de afiliados, descrições)

---

### 6. 💡 **Dicas Rápidas** (Quick Tips)

**Status:** ✅ 5 dicas já inseridas
**Opcional:** Adicionar 10-15 dicas

**Tempo:** 3-5h

---

### 7. 🎯 **Jornada Guiada** (Guided Journey)

**Status:** ✅ 28 dias COMPLETAMENTE seed ados
**Conteúdo:** Títulos, descrições, tipos, durações - TUDO pronto
**Áudio (Opcional):** Poderia adicionar áudios para cada dia

**Tempo:** 0h (já está pronto) ou 20-40h (se quiser áudios)

---

## 📊 RESUMO DE PRODUÇÃO

### **CRÍTICO (Sem isso não funciona):**

| Item | Quantidade | Tempo | Custo |
|------|------------|-------|-------|
| Transcrições de Aulas | 37 | 64-103h | R$ 0 |
| Áudios de Meditação | 10 | Var | R$ 50-5.000 |
| **TOTAL CRÍTICO** | **47 itens** | **64-103h** | **R$ 50-5.000** |

---

### **IMPORTANTE (Features incompletas):**

| Item | Quantidade | Tempo | Custo |
|------|------------|-------|-------|
| E-books | 3 | 120-150h | R$ 0-500 (design) |
| Citações Extras | 80 | 6-7h | R$ 0 |
| **TOTAL IMPORTANTE** | **83 itens** | **126-157h** | **R$ 0-500** |

---

### **OPCIONAL (Polish):**

| Item | Quantidade | Tempo | Custo |
|------|------------|-------|-------|
| Livros Extras | 15-20 | 5-10h | R$ 0 |
| Dicas Extras | 10-15 | 3-5h | R$ 0 |
| **TOTAL OPCIONAL** | **25-35 itens** | **8-15h** | **R$ 0** |

---

## 🚀 TIMELINE DE PRODUÇÃO

### **Semana 1-2: CRÍTICO (FASE 1)**

**Objetivo:** App funcional básico

**Tarefas:**
- [ ] Escrever transcrições Módulo 1-2 (6 aulas, 10h)
- [ ] Escrever transcrições Módulo 3-4 (11 aulas, 18h)
- [ ] Produzir 5 áudios de meditação gratuitas (10-15h ou contratar)

**Entrega:** 17 aulas + 5 áudios = App pode ser testado

---

### **Semana 3-4: CRÍTICO (FASE 2)**

**Objetivo:** Completar conteúdo crítico

**Tarefas:**
- [ ] Escrever transcrições Módulo 5-7 (20 aulas, 33h)
- [ ] Produzir 5 áudios premium (10-15h ou contratar)

**Entrega:** 37 aulas + 10 áudios = Features críticas 100%

---

### **Semana 5-6: IMPORTANTE**

**Objetivo:** Adicionar bônus e polish

**Tarefas:**
- [ ] Escrever E-book 1 (30-40h)
- [ ] Escrever E-book 2 (40-50h)
- [ ] Escrever E-book 3 (50-60h)
- [ ] Adicionar 80 citações (6-7h)

**Entrega:** E-books completos, citações diversificadas

---

### **Semana 7+: OPCIONAL**

**Objetivo:** Refinar experiência

**Tarefas:**
- [ ] Adicionar livros extras
- [ ] Adicionar dicas extras
- [ ] Melhorar descrições existentes

---

## ✅ CHECKLIST MASTER

### **Conteúdo Crítico:**

- [ ] **Módulo 1** - 4 transcrições escritas
- [ ] **Módulo 2** - 2 transcrições escritas
- [ ] **Módulo 3** - 4 transcrições escritas
- [ ] **Módulo 4** - 7 transcrições escritas
- [ ] **Módulo 5** - 8 transcrições escritas
- [ ] **Módulo 6** - 6 transcrições escritas
- [ ] **Módulo 7** - 6 transcrições escritas
- [ ] **Módulo 9** - 2 transcrições escritas (bônus lives)
- [ ] **Meditação 1** - Box Breathing (5min)
- [ ] **Meditação 2** - Respiração 4-7-8 (3min)
- [ ] **Meditação 3** - Respiração Monge (10min)
- [ ] **Meditação 4** - Silêncio Tático (5min)
- [ ] **Meditação 5** - Modo Guerreiro (10min)
- [ ] **Meditação 6** - Respiração de Combate (3min)
- [ ] **Meditação 7** - Modo Reset (4min)
- [ ] **Meditação 8** - Foco Total (5min)
- [ ] **Meditação 9** - Ancoragem (5min)
- [ ] **Meditação 10** - Modo Noturno (11min)

### **Conteúdo Importante:**

- [ ] **E-book 1** - Mentes a Mil (40-60 pgs)
- [ ] **E-book 2** - Vencendo TDAH (50-80 pgs)
- [ ] **E-book 3** - 101 TCC (80-120 pgs)
- [ ] **80 Citações** - TDAH, hábitos, motivação

### **Conteúdo Opcional:**

- [ ] 15-20 livros extras
- [ ] 10-15 dicas extras

---

## 📁 ARQUIVOS DE REFERÊNCIA

**Seeds Existentes:**
- `/Doc/fase2-seeds.sql` - Lista completa de módulos/aulas
- `/app/supabase/migrations/*meditations*` - Lista de meditações
- `/app/supabase/migrations/*quotes*` - Citações existentes

**Páginas do App:**
- `/app/src/pages/PersonalPlan.tsx` - Usa transcrições
- `/app/src/pages/Meditation.tsx` - Usa áudios
- `/app/src/components/DailyQuote.tsx` - Usa citações

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

1. **Decidir método de áudio:** Profissional, TTS ou DIY?
2. **Criar template de transcrição:** Formato padrão para todas aulas
3. **Começar com Módulo 1:** Escrever 4 transcrições esta semana
4. **Gravar/Gerar 2 meditações:** Testar pipeline de produção
5. **Definir responsáveis:** Quem escreve? Quem revisa?

---

**TUDO MAPEADO! Pronto para começar a produção! 🚀**
