/**
 * `spellCore` barrel -- core runtime library that compiled `spell` JS calls into (`spellCore.foo(...)`).
 * - All compiled spell modules can assume that `spellCore` and `assert` are in scope.
 *   TODO: could only confirm `spellCore` actually ends up global (`global.spellCore = spellCore` in
 *   `src/app/index.tsx`) -- didn't find where `assert` is made available the same way, worth checking.
 * - `spellCore` is a single singleton (constructed in `core.ts`) assembled by ACCRETION: every
 *   sibling module here (`collection-core`, `collection-other`, `paths`, `string`, `tests`, `console`,
 *   `runtime`, `ui`, plus `core` itself) does `Object.assign(spellCore, <module>Methods)` as a
 *   top-level side effect when its file first loads -- see `defineSpellCoreModule()` in `spellCore.types.ts`.
 * - NOTE: most of those modules are imported here ONLY for that side effect (bare `import "./x"`, no
 *   named import) -- importing this barrel (or anything that transitively imports `~/spellCore`) is
 *   what triggers the assembly.  `SpellCore` (the assembled TYPE) is exported separately as a
 *   `type`-only export, so it costs nothing at runtime.
 * - NOTE: `SC` ~== `~/spellCore`, this sub-system's self-namespace.
 * - NOTE: `classes/` (`Thing`, `List`, ...) is flattened in via `export * from "./classes"` rather
 *   than getting its own namespace.
 */
export * as SC from "."

import { assert } from "./assert"
import { spellCore } from "./core"
import "./collection-core"
import "./collection-other"
import "./paths"
import "./string"
import { SpellEvent, Eventful } from "./SpellEvent"
import "./tests"
import "./console"
import "./runtime"
import "./ui"

export { spellCore, assert, SpellEvent, Eventful }
export type { SpellCore } from "./spellCore.types"
export * from "./classes"
