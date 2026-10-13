import { defineConfig } from "vite-plus"

import { fmtConfig, packageLint } from "../../vite.lint.ts"

/**
 * `spell-solid`'s Vite+ config:  only the `lint` / `fmt` blocks (`vp lint`, `vp fmt`), from the repo root's `vite.lint.ts`.
 * - No build of its own:  it's source, bundled by whoever draws with it (Spell UI's `core` entry carries it).
 * - Not under Spell UI's lint guard (`spell-ui/*`):  it's the element core those rules point at, as Spell UI's
 *   `src/elements/` is.
 * - Tests:  `vitest.config.ts` beside this.
 */
export default defineConfig({
  fmt: fmtConfig,
  lint: packageLint({ name: "spell-solid", ignorePatterns: ["dist", ".vitest"] })
})
