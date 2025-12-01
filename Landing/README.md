# Landing Habitz

Landing page estática com quiz de 28 etapas, timers e carrosséis.

## Scripts

```bash
npm install
npm run dev     # ambiente local (Vite)
npm run build   # gera landing/dist
npm run preview # pré-visualização do build
```

## Configurações

- Ajuste o destino do checkout em `index.html` alterando o atributo `data-checkout-url` do `<body>`.
- O Meta Pixel já está carregado no `<head>`; revise o ID antes de publicar.
- As mídias ficam em `assets/images/` e `assets/audio/`. Para adicionar novos arquivos, atualize as referências no HTML.

## Deploy sugerido

1. Execute `npm run build`.
2. Publique o conteúdo de `dist/` na Vercel (Static), S3 ou outra CDN.
3. Configure roteamento no domínio principal (ex.: `habitz.com.br`) para apontar para essa build.
