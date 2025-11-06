#!/usr/bin/env node
/**
 * Prepara a saída final do build do app para deploy na Vercel.
 * Após `npm run build`, duplica os artefatos para `dist/app`
 * preservando o bundle original na raiz (para subdomínios como app.habitz.life).
 */

import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const rootDir = process.cwd();
const distDir = join(rootDir, "dist");
const targetAppDir = join(distDir, "app");

if (!existsSync(distDir)) {
  console.error(`[organize-dist] Não encontrei "${distDir}". Rode "npm run build" antes do script.`);
  process.exit(1);
}

rmSync(targetAppDir, { recursive: true, force: true });
mkdirSync(targetAppDir, { recursive: true });

const resolvedTarget = resolve(targetAppDir);

cpSync(distDir, targetAppDir, {
  recursive: true,
  filter: (src) => !resolve(src).startsWith(resolvedTarget)
});

console.log("[organize-dist] Build do app disponível em / e /app/.");
