import { resolve } from "node:path"
import { defineConfig } from "vite-plus"

// The parser's SOURCE runs in our tests, so it needs the parser's own vite plugins
import { standardDecorators } from "spell-kit/toolchain/decorators"
import { packageVersion } from "spell-kit/toolchain/packageVersion"

export default defineConfig({
  plugins: [standardDecorators(), packageVersion(import.meta.dirname)],
  resolve: {
    // `$/cli` is us;  any other `~/...` is the parser's `src/`:  the repo root's `tsconfig.base.json`
    tsconfigPaths: true
  },
  // the tests live in the repo's tests/ folder, at the same paths as the code
  test: { dir: resolve(import.meta.dirname, "../tests/cli") }
})
