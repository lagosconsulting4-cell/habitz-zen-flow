import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { copyFileSync, cpSync, existsSync, mkdirSync } from "fs";

// Plugin para copiar a pasta tdah para o dist após o build
const copyTdahPlugin = () => ({
  name: "copy-tdah",
  closeBundle() {
    const srcDir = path.resolve(__dirname, "tdah");
    const destDir = path.resolve(__dirname, "dist", "tdah");

    if (existsSync(srcDir)) {
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }
      cpSync(srcDir, destDir, { recursive: true });
      console.log("[vite] Pasta tdah copiada para dist/tdah");
    }
  },
});

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), copyTdahPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
    },
  },
}));
