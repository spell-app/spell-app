import solid from "@solidjs/vite-plugin"
import { defineConfig, lazyPlugins } from "vite-plus"

import { fmtConfig, packageLint } from "../../vite.lint.ts"

/**
 * Library build:  one ES module, `solid-js` / `@solidjs/*` external (peer dependencies, subpaths included).
 * - The Solid plugin only matters for the tests' JSX;  `src/` has none.
 */
export default defineConfig({
  // `vp lint` / `vp fmt`:  the repo root's `vite.lint.ts`.  A fork of upstream code, so no React rules.
  fmt: fmtConfig,
  lint: packageLint({ ignorePatterns: ["dist", ".yarn", ".vitest", "node_modules"] }),
  plugins: lazyPlugins(() => [solid()]),
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: false,
    lib: {
      entry: { index: "src/index.ts" },
      formats: ["es"]
    },
    rolldownOptions: {
      external: (id) => /^solid-js(\/|$)|^@solidjs\//.test(id),
      output: { keepNames: true }
    }
  }
})
