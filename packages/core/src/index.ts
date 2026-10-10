/**
 * `spellCore` barrel -- core runtime library that compiled `spell` JS calls into (`spellCore.foo(...)`).
 * - Compiled spell modules `import` what they use:  `import { spellCore, Thing } from "@spell/core"` --
 *   see `SPELL_CORE_MODULE`.  No globals.
 * - `spellCore` is a single singleton (constructed in `core.ts`) assembled by ACCRETION: every
 *   sibling module here (`collection-core`, `collection-other`, `paths`, `string`, `tests`, `console`,
 *   `runtime`, `things`, `ui`, plus `core` itself) does `Object.assign(spellCore, <module>Methods)` as a
 *   top-level side effect when its file first loads -- see `defineSpellCoreModule()` in `spellCore.types.ts`.
 * - NOTE: most of those modules are imported here ONLY for that side effect (bare `import "./x"`, no
 *   named import) -- importing this barrel (or anything that transitively imports `$/core`) is
 *   what triggers the assembly.  `SpellCore` (the assembled TYPE) is exported separately as a
 *   `type`-only export, so it costs nothing at runtime.
 * - NOTE: `SC` ~== `$/core`, this sub-system's self-namespace.
 * - NOTE: `classes/` (`Thing`, `List`, ...) is flattened in via `export * from "./classes"` rather
 *   than getting its own namespace.
 */
export * as SC from "./"

import { assert } from "./assert"
import { spellCore } from "./core"
import "./collection-core"
import "./collection-other"
import "./paths"
import "./string"
import { SpellEvent, Eventful } from "./SpellEvent"
import "./tests"
import "./console"
import { on, off, once, trigger } from "./runtime"
import "./things"
import "./ui"
import "./drawing"

export { spellCore, assert, SpellEvent, Eventful }
// Events, as hand-written TypeScript says them:  `trigger("card-click", { card: this })`.  Compiled JavaScript says
// `spellCore.trigger(...)`:  the same functions.
export { on, off, once, trigger }
// Helpers hand-written TypeScript imports by name, e.g. `itemOf(Card.Ranks, this.rank)`.
export { itemOf } from "./collection-core"
// The decorators compiled TypeScript (`ts/solid`) writes, e.g. `@prop({ oneOf: RANKS }) accessor rank!: Rank`:
// `$/util`'s shared reactive ones, spell's `@thing`, and `@drawn` (`drawing.ts`).  Compiled JavaScript has none.
export { prop, state, derived, thing } from "$/util"
export { drawn } from "./drawing"
export { SPELL_CORE_MODULE, SPELL_CORE_NAMES, type SpellCore, type PropCheck } from "./spellCore.types"
export * from "./classes"
