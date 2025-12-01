import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { cpSync, existsSync, mkdirSync } from "fs";

const copyStaticDirsPlugin = (
  directories: Array<{ source: string; destination?: string }> = [],
) => ({
  name: "copy-static-directories",
  closeBundle() {
    directories.forEach(({ source, destination }) => {
      const srcDir = path.resolve(__dirname, source);
      if (!existsSync(srcDir)) {
        return;
      }

      const destFolder = destination ?? source;
      const destDir = path.resolve(__dirname, "dist", destFolder);

      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }

      cpSync(srcDir, destDir, { recursive: true });
      console.log(`[vite] Pasta ${source} copiada para dist/${destFolder}`);
    });
  },
});

const staticDirectories = [
  { source: "tdah" },
  { source: "Hub", destination: "tiktok" },
];

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), copyStaticDirsPlugin(staticDirectories)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    // Enable minification with esbuild (faster, built-in)
    minify: "esbuild",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
      output: {
        // Manual chunks for better code splitting
        manualChunks: {
          // Core React libraries
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Animation library
          "vendor-motion": ["motion"],
          // Charts library (only loaded when needed)
          "vendor-charts": ["recharts"],
          // UI components library
          "vendor-radix": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-progress",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-slider",
            "@radix-ui/react-slot",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
          ],
          // Query library
          "vendor-query": ["@tanstack/react-query"],
        },
        // Chunk naming for better caching
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,
  },
}));
