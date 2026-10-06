/**
 * Barrel for `$/ui/util` -- general-purpose utilities with no dependency on the rest of the package.
 * - Re-exports `packages/util`'s GENERIC files (`@proto`, class / string / DOM helpers, `Prettify` ...), shared with
 *   `spell`:  they live there, not here, so every package shares ONE copy.
 * - NOTE: imports them one by one (`$/util/class` ...), NEVER `$/util`'s barrel:  that also flattens in `$/util/spell`
 *   (lodash, `chalk`, `pluralize`, fetch, tasks ...), which would land in `ui`'s `core` bundle and published
 *   declarations.  An allowed exception to "import another package's barrel only";  add a file here when `util`
 *   gains a GENERIC one.  `yarn measure` and `yarn smoke` catch a leak.
 * - Safe to import anywhere, including `*.types.ts` files and the runtime's lazily-loaded chunk.
 * - NOTE: no namespace here (unlike `UI` / `E`):  utilities are imported by name,
 *   e.g. `import { proto, kebabCase } from "$/ui/util"`.
 * - Package-specific:  `Warnings` (`ui`'s console warnings).
 */

export * from "$/util/class"
export * from "$/util/decorators"
export * from "$/util/dom"
export * from "$/util/string"
export * from "$/util/util.types"

export * from "./Warnings"
