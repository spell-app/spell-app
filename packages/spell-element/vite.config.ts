import { defineConfig } from "vite-plus"

import { fmtConfig, packageLint } from "@spell-app/toolchain/lint"

/**
 * `spell-element`'s Vite+ config:  only the `lint` / `fmt` blocks (`vp lint`, `vp fmt`).
 * - Both from the toolchain's settings (`@spell-app/toolchain/lint`).
 * - No build of its own:  it's source, bundled by whoever draws with it (Spell UI's `core` entry carries it).
 * - Not under Spell UI's lint guard (`spell-ui/*`):
 *   it's the element core those rules point at, as Spell UI's `src/elements/` is.
 * - Tests:  `vitest.config.ts` beside this.
 */
export default defineConfig({
  fmt: fmtConfig,
  lint: packageLint({ name: "spell-element", ignorePatterns: ["dist", ".vitest"] })
})
