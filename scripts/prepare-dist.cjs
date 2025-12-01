#!/usr/bin/env node

const { cpSync, existsSync, renameSync, rmSync } = require("node:fs");
const { join } = require("node:path");

const rootDir = process.cwd();
const landingDist = join(rootDir, "Landing", "dist");
const appDist = join(rootDir, "App", "dist");
const outputDir = join(rootDir, "dist");

if (!existsSync(landingDist)) {
  console.error(`[prepare-dist] Build da landing não encontrado em "${landingDist}".`);
  process.exit(1);
}

if (!existsSync(appDist)) {
  console.error(`[prepare-dist] Build do app não encontrado em "${appDist}".`);
  process.exit(1);
}

rmSync(outputDir, { recursive: true, force: true });
cpSync(landingDist, outputDir, { recursive: true });

// Copy App/dist/ to dist/app/
// Vite builds with base "/app/" but outputs to dist/ directly
// (not dist/app/), so we copy App/dist/ → dist/app/
cpSync(appDist, join(outputDir, "app"), { recursive: true });

console.log("[prepare-dist] Landing publicada na raiz e app disponível em /app/.");
