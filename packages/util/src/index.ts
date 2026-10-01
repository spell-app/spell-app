/**
 * Barrel for `#util` (`@spell/util`) -- small generic helpers shared by `ui`, `spell` and `cli`.
 * - Imports NOTHING from the other packages and has no runtime dependencies:  `@spell/ui` is published, and
 *   whatever lands here is bundled into it.
 * - Safe to import anywhere, including `*.types.ts` files and SSR / node tooling.
 * - NOTE: no namespace here (unlike `UI` / `E`):  utilities are imported by name,
 *   e.g. `import { proto, kebabCase } from "#util"`.
 * - NOTE: other packages import `#util` ONLY, never `#util/<file>`.  Each keeps its own `util` barrel
 *   (`#spell-util`, `$/util`) for its package-specific helpers, and that barrel re-exports this one.
 */

export * from "./util.types"

export * from "./class"
export * from "./decorators"
export * from "./string"
export * from "./dom"
