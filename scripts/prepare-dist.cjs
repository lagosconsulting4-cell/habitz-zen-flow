#!/usr/bin/env node

const { cpSync, existsSync, renameSync, rmSync } = require("node:fs");
const { join } = require("node:path");

const rootDir = process.cwd();
const landingDist = join(rootDir, "landing", "dist");
const appDist = join(rootDir, "dist");
const tempAppDist = join(rootDir, ".tmp-app-dist");

if (!existsSync(landingDist)) {
  console.error(`[prepare-dist] Build da landing não encontrado em "${landingDist}".`);
  process.exit(1);
}

if (!existsSync(appDist)) {
  console.error(`[prepare-dist] Build do app não encontrado em "${appDist}".`);
  process.exit(1);
}

rmSync(tempAppDist, { recursive: true, force: true });
renameSync(appDist, tempAppDist);

rmSync(appDist, { recursive: true, force: true });
cpSync(landingDist, appDist, { recursive: true });
cpSync(tempAppDist, join(appDist, "app"), { recursive: true });

rmSync(tempAppDist, { recursive: true, force: true });

console.log("[prepare-dist] Landing publicada na raiz e app disponível em /app/.");
