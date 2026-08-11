import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
  plugins: [
    tanstackStart({
      router: { entry: "router.tsx" },
      client: { entry: "client.tsx" },
      server: { entry: "server.ts" },
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
