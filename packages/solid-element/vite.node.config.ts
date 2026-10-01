import { defineConfig } from "vite"

/**
 * Node-side build:  `src/vite.ts` => `dist/vite.js`, the `@spell-app/solid-element/vite` export (the HMR plugin).
 * - Its own build, after the library's (`yarn build` runs both):  one config with two entries would share a
 *   runtime chunk and change `dist/index.js`.
 * - Why built at all:  Vite loads a consumer's `vite.config.ts` by bundling it with EVERY bare import external,
 *   so Node itself imports this entry, and Node 22.17 can't load `.ts`.
 */
export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    sourcemap: false,
    minify: false,
    lib: {
      entry: { vite: "src/vite.ts" },
      formats: ["es"]
    },
    rolldownOptions: {
      external: (id) => /^vite$|^node:/.test(id),
      output: { keepNames: true }
    }
  }
})
