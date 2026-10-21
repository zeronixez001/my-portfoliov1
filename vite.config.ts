import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * GitHub Pages serves this project from /my-portfoliov1/ (a project site),
 * so Vite must prefix built asset URLs with the repository path.
 */
export default defineConfig({
  base: "/my-portfoliov1/",
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
