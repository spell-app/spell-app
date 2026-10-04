import solid from "@solidjs/vite-plugin"
import { defineConfig } from "vite"

/**
 * Library build:  one ES module, `solid-js` / `@solidjs/*` external (peer dependencies, subpaths included).
 * - The Solid plugin only matters for the tests' JSX;  `src/` has none.
 */
export default defineConfig({
  plugins: [solid()],
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: false,
    lib: {
      entry: { index: "src/index.ts", server: "src/server.ts" },
      formats: ["es"]
    },
    rolldownOptions: {
      external: (id) => /^solid-js(\/|$)|^@solidjs\//.test(id),
      output: { keepNames: true }
    }
  }
})
