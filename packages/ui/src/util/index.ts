/**
 * Barrel for `$/ui/util` -- general-purpose utilities with no dependency on the rest of the package.
 * - Re-exports `packages/util`'s GENERIC files (`@proto`, class / string / DOM helpers, `Prettify` ...),
 *   shared with `spell`:  they live there, not here, so every package shares ONE copy.
 * - NOTE: imports them one by one (`$/util/class` ...), NEVER `$/util`'s barrel:
 *   that also flattens in `$/util/spell` (lodash, `chalk`, `pluralize`, fetch, tasks ...),
 *   which would land in `ui`'s `core` bundle and published declarations.
 *   - An allowed exception to "import another package's barrel only".
 *   - Add a file here when `util` gains a GENERIC one.
 *   - `yarn measure` and `yarn smoke` catch a leak.
 * - Its place in the import graph:  the BOTTOM of `ui`, importing nothing of it,
 *   so it's safe to import anywhere, including `*.types.ts` files, node tooling and the runtime's lazily-loaded chunk.
 * - NOTE: no namespace of its own.
 *   `core.ts` re-exports it, so component files and the element core use it as `E.proto`, `E.Warnings` ...
 *   (`AGENTS.md`, "Solid authoring").
 *   - Only what sits BELOW `core` imports it by name (`import { proto, suggest } from "$/ui/util"`):
 *     `$/ui/vocabulary`, `$/ui/icons`, the runtime, types files.
 * - Package-specific:
 *   - `timing.ts` -- run a function later:
 *     `afterSolidUpdate()`, `beforeNextPaint()`, `soon()`, `after()`, `every()`
 *   - `Warnings` -- `ui`'s console warnings
 */

export * from "$/util/class"
export * from "$/util/decorators"
export * from "$/util/dom"
export * from "$/util/string"
export * from "$/util/util.types"

export * from "./timing"
export * from "./Warnings"
