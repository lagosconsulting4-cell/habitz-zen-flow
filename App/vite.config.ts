import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

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
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

