import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import { comlink } from "vite-plugin-comlink";
import tsconfigPaths from "vite-tsconfig-paths";
// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [comlink(), tsconfigPaths(), react()],
  worker: {
    plugins: [comlink()],
  },
});
