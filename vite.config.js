import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // GitHub Pages serves the site from /<repo>/; Vercel and local dev stay at the root.
  base: process.env.GITHUB_PAGES === "true" ? "/PowerHouse_4318_26098/" : "/",
  plugins: [react()],
  build: {
    // Three.js chunks are large by nature but are lazy-loaded only for the 3D views.
    chunkSizeWarningLimit: 700,
  },
});
