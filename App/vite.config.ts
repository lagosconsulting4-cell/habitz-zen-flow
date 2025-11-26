import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
  const forcedBase = process.env.VITE_BASE_PATH;
  const base =
    forcedBase ??
    (mode === "production"
      ? isGitHubPages
        ? "/habitz-zen-flow/"
        : "/app/"
      : "/");

  return {
    base,
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      VitePWA({
        strategies: "injectManifest", // Use custom service worker
        srcDir: "src",
        filename: "sw.ts",
        registerType: "prompt", // Controle manual de updates
        includeAssets: ["favicon.ico", "icons/*.png"],
        manifest: false, // Usar manifest.json manual em public/
        injectManifest: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        },
        devOptions: {
          enabled: true, // Habilitar PWA em desenvolvimento para testes
          type: "module",
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

