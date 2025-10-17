// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import netlify from "@astrojs/netlify"; 
// ou "@astrojs/netlify/edge-functions" si tu veux du Edge

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  output: "server", // ou "hybrid" si tu as à la fois du statique + SSR
  adapter: netlify(),
});
