# Habitz

Repositório monolítico com duas entregas principais:

- **SPA** (React + Vite + Supabase) – raiz do projeto atual.
- **Landing** (`landing/`) – quiz estático com Meta Pixel, timers e CTAs para Kirvano.
- **Doc/** – materiais de apoio e scripts SQL.

---

## Tecnologias do app

- React + Vite + TypeScript
- Supabase (Auth, Database, Storage)
- shadcn/ui + Tailwind CSS
- TanStack Query

### Como rodar localmente (SPA)

```bash
npm install
cp .env.example .env.local # ajuste as chaves do Supabase
npm run dev
```

Abra `http://localhost:5173`. O build de produção usa `npm run build`; lint em `npm run lint`. Use `supabase db push` para aplicar migrations.

> A rota `/` redireciona para `/dashboard`; usuários não autenticados são levados a `/auth` e, se não forem premium, enviados a `/pricing`.

---

## Landing (`landing/`)

A landing foi isolada com bundler próprio via Vite. Estrutura:

```
landing/
├── index.html          # quiz completo (28 etapas)
├── style.css           # estilos responsivos
├── script.js           # lógica do quiz, timers, áudio e CTA
├── README.md           # instruções adicionais
└── assets/             # imagens (.webp) e áudios (.mp3)
```

### Scripts

```bash
cd landing
npm install         # primeira vez
npm run dev         # http://localhost:5173
npm run build       # gera landing/dist
npm run preview     # conferência do bundle
```

O CTA do checkout usa o atributo `data-checkout-url` no `<body>`. Já está apontando para `https://pay.kirvano.com/bd2c4f4d-587a-4a3f-a6db-77fe0ef16923`.

### Deploy sugerido

1. `npm run build` → publica `landing/dist/` na Vercel (Static) para `https://www.habitz.life/`.
2. A SPA pode viver em outro projeto Vercel/subdomínio (`app.habitz.life`), usando o build padrão (`npm run build` na raiz).
3. Quando integrar Kirvano → Supabase, adicione o webhook/endpoint apropriado; hoje a landing não escreve no Supabase.

---

## Próximos passos recomendados

1. Validar deploy CI/CD no GitHub/Vercel (ajustar projetos se necessário).
2. Implementar webhook Kirvano → Supabase para liberar contas premium automaticamente.
3. Consolidar métricas (`landing_events`) ou renomear a tabela caso seja aproveitada pelo app.
