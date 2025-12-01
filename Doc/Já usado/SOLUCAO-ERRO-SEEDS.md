# 🚨 Solução para Erro: Duplicate Key

## ❌ Erro Recebido:
```
ERROR: 23505: duplicate key value violates unique constraint "program_modules_module_number_key"
DETAIL: Key (module_number)=(1) already exists.
```

---

## 🔍 Causa:
Você executou o `fase2-seeds.sql` **mais de uma vez**, e o módulo 1 já existe no banco.

---

## ✅ SOLUÇÃO RÁPIDA (Execute Primeiro):

### **Opção A: Limpar e Recriar (RECOMENDADO)**

Execute este SQL no Supabase:

```sql
-- Limpar todas as tabelas (ordem importa!)
DELETE FROM module_progress;
DELETE FROM personal_plans;
DELETE FROM module_resources;
DELETE FROM module_lessons;
DELETE FROM program_modules;

-- Agora execute o fase2-seeds.sql normalmente
```

---

### **Opção B: Continuar com Dados Existentes**

Se você NÃO quer perder nada:

```sql
-- Verificar quantos módulos já existem
SELECT module_number, title FROM program_modules ORDER BY module_number;

-- Se tem módulos 1-9, está completo!
-- Não precisa executar seeds novamente
```

---

## 📝 **Como Verificar se Está Tudo OK:**

Execute estas queries:

```sql
-- Deve retornar 9 módulos
SELECT COUNT(*) as total_modulos FROM program_modules;

-- Deve retornar ~37-40 aulas
SELECT COUNT(*) as total_aulas FROM module_lessons;

-- Deve retornar 3 recursos (e-books)
SELECT COUNT(*) as total_recursos FROM module_resources;

-- Ver lista completa de módulos
SELECT module_number, title, week_assignment, is_bonus
FROM program_modules
ORDER BY module_number;
```

**Resultado Esperado:**
- ✅ 9 módulos (1-7 normais, 8-9 bônus)
- ✅ ~40 aulas
- ✅ 3 recursos

Se todos os números bateram, **está pronto!** Não precisa executar seeds novamente.

---

## 🔧 **Correção Futura (Já Aplicada no Arquivo)**

Modifiquei o `fase2-seeds.sql` para incluir `ON CONFLICT DO NOTHING`:

```sql
insert into public.program_modules (...) values (...)
on conflict (module_number) do nothing;
```

Agora pode executar o arquivo múltiplas vezes sem erro!

---

## 🎯 **Próximos Passos:**

1. ✅ Execute a **Opção A** acima (limpar)
2. ✅ Execute `fase2-seeds.sql` novamente
3. ✅ Verifique com as queries de validação
4. ✅ Continue para Fase 3 (Storage)

---

**Qualquer dúvida, me avise!** 🚀
