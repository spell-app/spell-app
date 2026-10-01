import { defineConfig } from "vitest/config"
import { resolve } from "path"

// The parser's SOURCE runs in our tests, so it needs the parser's own vite plugins
import { standardDecorators } from "../../vite.decorators.ts"
import { packageVersion } from "../spell/vite.packageVersion.ts"

export default defineConfig({
  plugins: [standardDecorators(), packageVersion()],
  resolve: {
    // `~/cli` is us;  any other `~/...` is the parser's `src/`.  First match wins.
    // MUST match `paths` in `tsconfig.json`.
    alias: [
      { find: /^~\/cli(?=\/|$)/, replacement: resolve(import.meta.dirname, "src") },
      { find: /^~(?=\/)/, replacement: resolve(import.meta.dirname, "..", "spell", "src") }
    ]
  }
})
