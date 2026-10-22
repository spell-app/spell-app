import { resolve } from "node:path"
import { defineConfig } from "vite-plus"

/**
 * The extension's unit tests, `tests/`, at the same paths as its code in `src/`:  plain node, no VS Code.
 * - `vscode` is a stand-in (`tests/fakeVscode.ts`):  the real one exists only inside VS Code.
 * - Run by spell-app's `yarn test` (a project of its Vitest config, which names this file),
 *   or alone:  `yarn test` here.
 * - The kit's packages (`spell-kit/element-tools/...`) are read as source, through the kit's install.
 */
export default defineConfig({
  resolve: { alias: { vscode: resolve(import.meta.dirname, "tests/fakeVscode.ts") } },
  test: { name: "vscode", environment: "node", include: ["tests/**/*.test.ts"] }
})
