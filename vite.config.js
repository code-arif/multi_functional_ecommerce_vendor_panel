import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@ecom/ui": resolve(__dirname, "../packages/ui/src"),
    },
    dedupe: ["@heroicons/vue", "lucide-vue-next", "vue"],
  },
  server: {
    port: 3003,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
