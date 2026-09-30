import type { coreMethods } from "./core"
import type { collectionCoreMethods } from "./collection-core"
import type { collectionOtherMethods } from "./collection-other"
import type { stringMethods } from "./string"
import type { uiMethods } from "./ui"
import type { pathMethods } from "./paths"
import type { testMethods } from "./tests"
import type { consoleMethods } from "./console"
import type { runtimeMethods } from "./runtime"
import type { classesMethods } from "./classes"

// ## Importing spellCore

/**
 * ES module specifier compiled spell imports its runtime from:  `import { spellCore, Thing } from "@spell/core"`.
 * - The app's page resolves it with an import map -- see `vite.importMap.ts`.  The VS Code runner, which has
 *   none, points it at its own `spellCore` -- see `runCompiled()` in `src/app/runner/VSCodeRunner.tsx`.
 */
export const SPELL_CORE_MODULE = "@spell/core"

/** Names every compiled project imports from `SPELL_CORE_MODULE`:  `spellCore`, and the built-in types. */
export const SPELL_CORE_NAMES = ["spellCore", "Thing", "List", "App"]
import type { EventfulMethods } from "./SpellEvent"

/**
 * Assembled type of the `spellCore` singleton -- built by accretion: each module below does
 * `Object.assign(spellCore, { ...methods })` at runtime (see `index.ts` for the side-effect import
 * order), so this is the intersection of every module's methods.
 */
export type SpellCore = typeof coreMethods &
  typeof collectionCoreMethods &
  typeof collectionOtherMethods &
  typeof stringMethods &
  typeof uiMethods &
  typeof pathMethods &
  typeof testMethods &
  typeof consoleMethods &
  typeof runtimeMethods &
  typeof classesMethods &
  EventfulMethods

// ## Properties

/**
 * What a compiled property setter checks a new value against -- warns, NEVER rejects.
 * - e.g. `set title(value) { this.setProp('title', value, { type: 'text' }) }`
 * - see `spellCore.checkProp()`
 */
export type PropCheck = {
  /** type name, e.g. `text`, `choice`, `Card` -- see `spellCore.isOfType()` */
  type?: string
  /** legal values, e.g. `Card.Suits` */
  oneOf?: readonly unknown[]
}

// ## Modules

/**
 * Identity helper used to wrap each module's methods object.
 * NOTE: this intentionally does NOT try to type `this` as `SpellCore` (e.g. via `ThisType<SpellCore>`):
 * `SpellCore` is itself assembled from `typeof <module>Methods` for every module, so a signature here
 * that mentions `SpellCore` would make every module's methods type circularly depend on itself.
 * Module method bodies call sibling methods via the imported `spellCore` singleton instead of `this`.
 */
export function defineSpellCoreModule<T extends object>(methods: T): T {
  return methods
}
