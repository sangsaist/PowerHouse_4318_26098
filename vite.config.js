import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Three.js chunks are large by nature but are lazy-loaded only for the 3D views.
    chunkSizeWarningLimit: 700,
  },
});
