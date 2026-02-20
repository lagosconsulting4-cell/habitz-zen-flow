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
      host: "localhost",
      port: 8080,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // React core
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            // UI/Animation libraries
            "ui-vendor": ["motion/react", "class-variance-authority", "clsx", "tailwind-merge"],
            // Radix UI components
            "radix-vendor": [
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-tabs",
              "@radix-ui/react-switch",
              "@radix-ui/react-slot",
              "@radix-ui/react-label",
              "@radix-ui/react-select",
              "@radix-ui/react-progress",
              "@radix-ui/react-accordion",
              "@radix-ui/react-alert-dialog",
              "@radix-ui/react-avatar",
              "@radix-ui/react-checkbox",
              "@radix-ui/react-collapsible",
              "@radix-ui/react-context-menu",
              "@radix-ui/react-hover-card",
              "@radix-ui/react-menubar",
              "@radix-ui/react-navigation-menu",
              "@radix-ui/react-scroll-area",
              "@radix-ui/react-separator",
              "@radix-ui/react-toggle-group",
              "@radix-ui/react-toast",
              "@radix-ui/react-tooltip",
              "@radix-ui/react-popover",
              "@radix-ui/react-radio-group",
              "@radix-ui/react-slider",
              "@radix-ui/react-aspect-ratio",
              "@radix-ui/react-toggle",
            ],
            // Charts
            "chart-vendor": ["recharts"],
            // Data/State management
            "data-vendor": ["@tanstack/react-query", "@supabase/supabase-js", "idb"],
            // Particle effects
            "particles-vendor": ["@tsparticles/react", "@tsparticles/engine", "@tsparticles/slim"],
            // Icons
            "icons-vendor": ["lucide-react", "@tabler/icons-react"],
          },
        },
      },
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
          globPatterns: ["**/*.{js,css,html,ico,svg,woff2}"],
          globIgnores: [
            "**/particles-vendor*.js", // Tsparticles usado apenas no onboarding - carregar sob demanda
            "icons/icon-72.png",
            "icons/icon-96.png",
            "icons/icon-128.png",
            "icons/icon-144.png",
            "icons/icon-152.png",
            "icons/icon-384.png",
          ],
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

