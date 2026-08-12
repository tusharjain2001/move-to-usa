import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative asset paths, so one build works both at the domain root
  // (move-to-usa.vercel.app) and under a subpath
  // (apacrelocation.com/moving-to-usa/). Safe here because the site is a single
  // page with hash anchors only — no client-side router with absolute paths.
  base: "./",
  plugins: [react()],
});
