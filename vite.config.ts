import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === "production" && isGitHubPages ? "/habitz-zen-flow/" : "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
