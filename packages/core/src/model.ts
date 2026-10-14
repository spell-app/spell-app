/**
 * `$/core/model`:  the core WITHOUT drawing, for code that uses spell's things as plain data, e.g. the server
 * holding a `Person` (epic `people-and-orgs` P3).
 * - What a compiled LIBRARY imports, e.g. `People.lib.ts`:  the `ts/lib` target, `P.LibraryWriter`.
 * - The same `spellCore`, `Thing` and `List` as the barrel, assembled from the same modules, minus:
 *   - drawing (`drawing.ts`, `elements.ts`, `Drawable`, `DrawableList`):  they load Solid
 *   - the registry of a running program's things, `spellCore.things` (`things.ts`):
 *     a thing made here belongs to no program, so it registers nowhere -- see `registerThing()`
 *   - what reads that registry:  carrying a program over a recompile (`carry.ts`), and references to a
 *     program's things by name or place (`references.ts`, `Tableau#T1`)
 * - So a `Loader` made here must be told the classes:  `new Loader({ entryFor, classNamed })`.
 * - NEVER import the barrel (`$/core`) from here, or from any module this loads:  it loads drawing.
 *   The modules below import each other directly for that reason.
 * - Loading the barrel too, in the same process, is fine:  it's the same modules, assembled once.
 */
import { assert } from "./assert"
import { spellCore } from "./core"
import "./collection-core"
import "./collection-other"
import "./deprecated"
import "./paths"
import "./string"
import { SpellEvent, Eventful } from "./SpellEvent"
import "./tests"
import "./console"
import { on, off, once, trigger } from "./runtime"
import "./json"
import "./ui"
import { Thing } from "./classes/Thing"
import { List } from "./classes/List"
import { App } from "./classes/App"

export { spellCore, assert, SpellEvent, Eventful, Thing, List, App }
export { on, off, once, trigger }
export { positionOf } from "./collection-core"
export { position, spellPosition, endPosition, withSpellPositions } from "./positions"
// what compiled TypeScript's classes are declared with, e.g. `@prop({ type: "text" }) accessor name!: string`
export { prop, state, derived, thing } from "$/util"
export {
  Saver,
  Loader,
  REF_KEY,
  parseRef,
  refText,
  type Saved,
  type SavedRef,
  type SaverOptions,
  type LoaderOptions
} from "./saving"
export { checkEntry, jsonSchemaFor, kindOf, type EntryProblem, type CheckOptions, type Kind } from "./checking"
export { SPELL_CORE_MODULE, type SpellCore, type PropCheck } from "./spellCore.types"
export type { ListCallback } from "./classes/List"
