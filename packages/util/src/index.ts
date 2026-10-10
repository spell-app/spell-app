/**
 * Barrel for `$/util` (`@spell-app/util`) -- helpers shared by `ui`, `spell` and `cli`, in two layers.
 * - GENERIC (the files beside this one):  `@proto`, class, name-case string and shadow-aware DOM helpers.  No runtime
 *   dependencies, safe anywhere, including `*.types.ts` files and SSR / node tooling.  `@spell-app/ui` is published and
 *   bundles what it imports from here.
 * - REACTIVE (`./reactive`):  the reactive engine every reactive class shares -- spell cells, the records, the schema,
 *   `@prop` / `@state` / `@derived`.  Generic too:  no lodash, no Solid.
 * - SPELL'S (`./spell`, flattened in LAST):  lodash, `chalk`, `pluralize`, fetch,
 *   tasks, prefs.  NEVER import them from `ui`:  `ui`'s `src/util/index.ts` imports the generic files one by one
 *   (`$/util/class` ...) and never this barrel, so none of it lands in `ui`'s bundles or published declarations.
 * - NOTE: no namespace here (unlike `UI` / `E`):  utilities are imported by name,
 *   e.g. `import { proto, kebabCase } from "$/util"`.
 * - NOTE: other packages import `$/util` ONLY, never `$/util/<file>` -- except `ui`'s util barrel, see above.
 */

export * from "./util.types"

export * from "./class"
export * from "./decorators"
export * from "./string"
export * from "./dom"

export * from "./reactive"

export * from "./spell"
