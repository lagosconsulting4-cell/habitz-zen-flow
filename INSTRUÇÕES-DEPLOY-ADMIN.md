# 📋 Instruções para Deploy do Sistema Admin

## Passo 1: Aplicar a Migration no Supabase

### Opção A: Via SQL Editor (Recomendado - Mais Fácil)

1. **Abra o SQL Editor do Supabase:**
   ```
   https://supabase.com/dashboard/project/jbucnphyrziaxupdsnbn/sql/new
   ```

2. **Copie o conteúdo da migration:**
   - Abra o arquivo: `App/supabase/migrations/20251211000000_admin_system.sql`
   - Selecione TUDO (Ctrl+A)
   - Copie (Ctrl+C)

3. **Cole no SQL Editor:**
   - Cole no editor (Ctrl+V)
   - Clique em **"RUN"** no canto superior direito (ou pressione Ctrl+Enter)

4. **Aguarde a execução:**
   - Você verá "Success" quando terminar
   - Se houver erro, copie a mensagem e me envie

---

### Opção B: Via Supabase CLI (se o CLI estiver funcionando)

```bash
cd App
npx supabase db push
```

---

## Passo 2: Criar Seu Primeiro Admin

### 2.1 Obter seu User ID

**Método 1 - Via App (Mais Fácil):**
1. Faça login no app Habitz
2. Abra o Console do navegador (F12)
3. Cole e execute este código:
   ```javascript
   (await supabase.auth.getUser()).data.user.id
   ```
4. Copie o UUID que aparecer (algo como: `abc123de-f456-7890-ghi1-jk2lm3n4o5p6`)

**Método 2 - Via Supabase Dashboard:**
1. Vá em: https://supabase.com/dashboard/project/jbucnphyrziaxupdsnbn/auth/users
2. Clique no seu usuário na lista
3. Copie o UUID no topo da página

### 2.2 Tornar-se Admin

No SQL Editor do Supabase, execute:

```sql
UPDATE profiles
SET is_admin = true, admin_since = now()
WHERE user_id = 'SEU-UUID-AQUI';
```

**Substitua** `'SEU-UUID-AQUI'` pelo UUID que você copiou!

Exemplo:
```sql
UPDATE profiles
SET is_admin = true, admin_since = now()
WHERE user_id = 'abc123de-f456-7890-ghi1-jk2lm3n4o5p6';
```

---

## Passo 3: Testar o Sistema Admin

### 3.1 Verificar se funcionou

1. **Recarregue o app** (F5 ou Ctrl+R)
2. **Na sidebar**, você deve ver aparecer uma nova seção **"Admin"** com um ícone de escudo
3. Clique em **"Admin"** para acessar o dashboard

### 3.2 Explorar as funcionalidades

**Dashboard** (`/admin`):
- Ver KPIs: Total de usuários, ativos hoje, revenue, completions
- Links rápidos para outras seções

**User Management** (`/admin/users`):
- Ver lista de TODOS os usuários
- Buscar por nome ou ID
- Conceder premium manualmente
- Suspender usuários

**Analytics** (`/admin/analytics`):
- Métricas detalhadas de usuários
- Engajamento (hábitos, completions)
- Revenue e conversões

**Content Management** (`/admin/content`):
- Ver estatísticas de conteúdo
- (Interface de CRUD virá em versões futuras)

**Audit Log** (`/admin/audit`):
- Ver todas as ações administrativas
- Rastrear quem fez o quê e quando

### 3.3 Testar Segurança

1. **Faça logout** do admin
2. **Faça login com outro usuário** (que não é admin)
3. Tente acessar `/admin` diretamente na URL
4. **Deve redirecionar** para `/dashboard` automaticamente ✅

---

## Verificação de Sucesso

✅ Migration aplicada sem erros
✅ Você se tornou admin (`is_admin = true`)
✅ Link "Admin" aparece na sidebar
✅ Consegue acessar `/admin` e ver o dashboard
✅ User regular NÃO consegue acessar `/admin`

---

## Troubleshooting

### Erro: "relation profiles does not have column is_admin"
❌ A migration não foi aplicada corretamente.
✅ Volte ao Passo 1 e aplique novamente.

### Link "Admin" não aparece na sidebar
❌ Você não está marcado como admin.
✅ Verifique se executou o SQL do Passo 2.2 corretamente.
✅ Recarregue a página após executar.

### Erro ao executar funções admin (grant premium, suspend)
❌ As funções SQL não foram criadas.
✅ Certifique-se de executar a migration COMPLETA (todo o arquivo SQL).

### Views retornam erro "does not exist"
❌ A segunda parte da migration (views) não foi executada.
✅ Execute a migration completa novamente.

---

## SQL para Remover Admin (se necessário)

Se precisar remover o status de admin de alguém:

```sql
UPDATE profiles
SET is_admin = false, admin_since = NULL
WHERE user_id = 'UUID-DO-USUARIO';
```

---

## SQL para Ver Todos os Admins

```sql
SELECT user_id, display_name, is_admin, admin_since
FROM profiles
WHERE is_admin = true;
```

---

## Contato

Se encontrar algum erro durante o deploy, envie:
1. Screenshot do erro no SQL Editor
2. Mensagem de erro completa
3. Qual passo você estava tentando fazer

Boa sorte! 🚀
