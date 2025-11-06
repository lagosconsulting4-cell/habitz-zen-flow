#!/usr/bin/env node
/**
 * Prepara a saída final do build do app para deploy na Vercel.
 * Após `npm run build`, duplica os artefatos para `dist/app`
 * preservando o bundle original na raiz (para subdomínios como app.habitz.life).
 */

import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const distDir = join(rootDir, "dist");
const targetAppDir = join(distDir, "app");
const tempDir = join(rootDir, ".tmp-app-dist");

if (!existsSync(distDir)) {
  console.error(`[organize-dist] Não encontrei "${distDir}". Rode "npm run build" antes do script.`);
  process.exit(1);
}

rmSync(tempDir, { recursive: true, force: true });
cpSync(distDir, tempDir, { recursive: true });

rmSync(targetAppDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

renameSync(tempDir, targetAppDir);

console.log("[organize-dist] Build do app disponível em / e /app/.");
