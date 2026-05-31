// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://boozeonhormuz.com', // apex domain — NO `base`
  output: 'static',
  vite: {
    // @tailwindcss/vite@4.3 is typed against Vite 8; Astro 6.4 bundles Vite 7.
    // The plugin is runtime-compatible — this cast resolves the type-only skew.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
