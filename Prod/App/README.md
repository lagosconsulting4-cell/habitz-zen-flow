# Habitz

Aplicativo web focado em desenvolvimento de hábitos, com integração Supabase e experiência 100% premium (pagamento vitalício).

## Tecnologias principais

- React + Vite + TypeScript
- Supabase (Auth, Database, Storage)
- shadcn/ui + Tailwind CSS
- TanStack Query para cache e estados remotos

## Como rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie um arquivo `.env.local` com:
   ```bash
   VITE_SUPABASE_URL=... // URL do projeto Supabase
   VITE_SUPABASE_ANON_KEY=... // chave pública (anon)
   ```
   Outras variáveis (Stripe, etc.) ficam em `.env` conforme documentação interna do projeto.
3. Execute o modo desenvolvimento:
   ```bash
   npm run dev
   ```
4. Abra `http://localhost:5173`.

## Fluxo Supabase

- **Auth**: Supabase Email/Password com verificação por link. O formulário `src/pages/Auth.tsx` cobre login, cadastro, recuperação e redefinição de senha.
- **Banco e Migrations**: arquivos em `supabase/migrations`. Use `supabase db push` para aplicar mudanças no remoto.
- **Storage**: Audios de meditação ficam no bucket `meditation-audios`, com estrutura `<categoria>/<arquivo>.mp3`.

## Scripts úteis

- `npm run dev` – servidor local.
- `npm run build` – build de produção.
- `npm run lint` – checagem ESLint.
- `supabase db push` – aplica migrations pendentes.

## Deploy

O projeto está configurado para Vercel/GitHub Pages via workflow em `.github/workflows`. Ajuste variáveis de ambiente na plataforma escolhida antes do deploy.
