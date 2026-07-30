import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@ecom/ui": resolve(__dirname, "src/ecom-ui"),
    },
    dedupe: ["@heroicons/vue", "lucide-vue-next", "vue", "vue-toastification", "date-fns"],
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
