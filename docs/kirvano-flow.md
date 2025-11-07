# Fluxo Kirvano → Supabase → App Habitz

Este guia resume o que já foi implementado no repositório e o que falta configurar para liberar o acesso automático do usuário que pagou via Kirvano.

## 1. Landing page `/obrigado`

- Arquivos principais: `app/landing/obrigado.html`, `app/landing/obrigado.css`, `app/landing/obrigado.js`.
- O build da landing agora tem duas entradas (quiz e thanks) configuradas em `app/landing/vite.config.js`.
- O formulário envia `email` + `password` para a Edge Function `create-password-direct` (nova neste commit) e, em caso de sucesso, redireciona para `https://app.habitz.life/auth`.
- Há dois CTAs adicionais:
  - **Área de membros Kirvano** (`data-members-area-url` no `<body>` da página).
  - **Reenvio de instruções** (mensagem orientativa caso o usuário não localize o e-mail).
- Para trocar URLs ou textos, ajuste os atributos `data-password-endpoint`, `data-app-url` e `data-members-area-url` diretamente no `<body>`.

## 2. Edge Functions adicionadas

### `kirvano-webhook`
- Caminho: `app/supabase/functions/kirvano-webhook/index.ts`.
- Valida o token (`KIRVANO_WEBHOOK_TOKEN`) recebido no header `x-kirvano-token` ou query `?token=`.
- Processa apenas eventos `SALE_APPROVED`.
- Passos executados:
  1. Normaliza o e-mail do cliente.
  2. Busca o usuário no Auth; se não existir, cria com `email_confirm: true` e `user_metadata` básicos.
  3. Faz `upsert` na tabela `purchases` com `provider = 'kirvano'`, `status = 'paid'` (o trigger `handle_paid_purchase` já marca o perfil como premium).
  4. Opcional: envia `resetPasswordForEmail` usando o `SUPABASE_ANON_KEY` (se configurado) com redirect para `${APP_URL}/auth?type=recovery`.

### `create-password-direct`
- Caminho: `app/supabase/functions/create-password-direct/index.ts`.
- Recebe `POST { email, password }` (mínimo 6 caracteres) e valida:
  1. Se o usuário existe no Auth.
  2. Se ele possui algum registro em `purchases` com `status = 'paid'`.
  3. Se positivo, define/atualiza a senha via `auth.admin.updateUserById` e retorna sucesso.

## 3. Variáveis de ambiente

Configure estes secrets no Supabase (`Settings → Functions → Secrets`):

| Nome | Valor sugerido |
| ---- | -------------- |
| `SUPABASE_URL` / `PROJECT_URL` | já existente |
| `SUPABASE_SERVICE_ROLE_KEY` / `SERVICE_ROLE_KEY` | já existente |
| `SUPABASE_ANON_KEY` | já existente (necessário para enviar o reset) |
| `APP_URL` | `https://app.habitz.life` (ou o domínio final do app) |
| `KIRVANO_WEBHOOK_TOKEN` | mesmo token configurado na Kirvano |

## 4. Deploy das funções

### 4.1 Se você tiver o Supabase CLI

1. Entre em `app/` e faça login no CLI (`supabase login`).
2. Rode `supabase functions deploy kirvano-webhook --project-ref jbucnphyrziaxupdsnbn`.
3. Rode `supabase functions deploy create-password-direct --project-ref jbucnphyrziaxupdsnbn`.
4. Copie a URL pública de cada função:
   - `kirvano-webhook`: configure na Kirvano (evento “Compra aprovada”).
   - `create-password-direct`: atualize o atributo `data-password-endpoint` da página `/obrigado` se o domínio mudar.

### 4.2 Sem instalar o Supabase CLI (passo a passo manual)

1. **Abra o Dashboard do Supabase** (https://supabase.com/dashboard) e escolha o projeto `jbucnphyrziaxupdsnbn`.
2. Acesse `Edge Functions` e clique em **Deploy a new function → Import from GitHub não é necessário**.
3. Clique em **New Function**, informe o nome exatamente como está na pasta (`kirvano-webhook`). Na etapa “Create function”, deixe o template vazio.
4. Na área de edição, apague qualquer código padrão e cole o conteúdo do arquivo local `app/supabase/functions/kirvano-webhook/index.ts`.
5. No painel lateral, clique em **Secrets** e crie/valide:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY` (opcional, mas recomendado)
   - `APP_URL`
   - `KIRVANO_WEBHOOK_TOKEN`
6. Clique em **Save** e depois em **Deploy**. Copie a URL final mostrada (ex.: `https://...supabase.co/functions/v1/kirvano-webhook`).
7. Repita o mesmo processo para `create-password-direct`:
   - Crie nova função com esse nome.
   - Cole o código de `app/supabase/functions/create-password-direct/index.ts`.
   - As secrets são as mesmas (exceto `KIRVANO_WEBHOOK_TOKEN`, que não é usada aqui).
   - Salve e faça o deploy.
8. Depois do deploy, teste rapidamente usando o botão **Run request** do painel (envie um JSON de teste) ou com ferramentas como Postman.

> Dica: se preferir, faça upload dos arquivos `.ts` arrastando e soltando diretamente na área do editor do Supabase; ele substitui o conteúdo automaticamente.

## 5. Checklist de integração

1. **Kirvano:** apontar o webhook para a nova função e garantir que o token bate.
2. **Supabase Auth:** confirmar que o trigger `handle_new_user` está ativo (já cria `profiles`).
3. **Área pública:** publicar `app/landing/dist/obrigado.html` junto do quiz ou configurar uma rota `/obrigado` específica no Vercel.
4. **App Habitz:** proteger conteúdos premium verificando `profiles.is_premium` (já atualizado pelos triggers quando existe compra paga).
5. **Suporte:** revisar textos/contatos no `obrigado.html` e definir o link oficial da Área de Membros da Kirvano.

## 6. Próximos passos sugeridos

1. Criar uma automação na Área de Membros exibindo um link direto para `https://app.habitz.life/auth` (caso o usuário prefira criar a senha por lá).
2. Adicionar métricas básicas (Pixel/CAPI) ao `/obrigado` se quiser deduplicar eventos de Purchase no Meta.
3. Se precisar liberar acesso manualmente, basta rodar `UPDATE purchases SET status = 'paid' WHERE id = ...;` – o trigger `handle_paid_purchase` ajusta `profiles.is_premium` automaticamente.
