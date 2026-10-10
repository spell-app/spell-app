import type { coreMethods } from "./core"
import type { collectionCoreMethods } from "./collection-core"
import type { collectionOtherMethods } from "./collection-other"
import type { stringMethods } from "./string"
import type { uiMethods } from "./ui"
import type { drawingMethods } from "./drawing"
import type { pathMethods } from "./paths"
import type { testMethods } from "./tests"
import type { consoleMethods } from "./console"
import type { runtimeMethods } from "./runtime"
import type { thingsMethods } from "./things"
import type { classesMethods } from "./classes"

// ## Importing spellCore

/**
 * ES module specifier compiled spell imports its runtime from:  `import { spellCore, Thing } from "@spell/core"`.
 * - Every runner -- the app, VS Code's, `<spell-app>` -- points it at the copy of the runtime the program runs on,
 *   by rewriting it -- see `linkModule()` in `src/app/runner/runCompiled.ts`.  No import map.
 */
export const SPELL_CORE_MODULE = "@spell/core"

/**
 * Spell's own classes, from `spellCore/classes`:  what a project's types are made from, e.g. `a card is a thing`.
 * - What a Type Explorer lists as built in -- see `LSP.ScopeExplorer`.
 */
export const SPELL_CLASSES = ["Thing", "List", "App"]

/** Names every compiled project imports from `SPELL_CORE_MODULE`:  `spellCore`, and spell's classes. */
export const SPELL_CORE_NAMES = ["spellCore", ...SPELL_CLASSES]

/**
 * Types built into spell, which every project starts with -- `spellCore.BASE_TYPES`.
 * - Spell's classes, plus javascript's own `Object`, so spell can say `create an object` and `a list of objects`.
 *   NOT a spell class, so a Type Explorer leaves it out.
 * - Here, so the parser can read them WITHOUT importing `spellCore`, whose code must stay in the runtime's own
 *   bundle entry -- see `spellRuntime.ts`.
 */
export const SPELL_BASE_TYPES = ["Object", ...SPELL_CLASSES]

/**
 * Assembled type of the `spellCore` singleton -- built by accretion: each module below does
 * `Object.assign(spellCore, { ...methods })` at runtime (see `index.ts` for the side-effect import
 * order), so this is the intersection of every module's methods.
 * - It's the CORE CONTRACT too:  what another target's core must have (Python's, later -- epic `output-targets`), and
 *   what it must print is pinned by the `cli`'s `contract.test.ts`.
 */
export type SpellCore = typeof coreMethods &
  typeof collectionCoreMethods &
  typeof collectionOtherMethods &
  typeof stringMethods &
  typeof uiMethods &
  typeof drawingMethods &
  typeof pathMethods &
  typeof testMethods &
  typeof consoleMethods &
  typeof runtimeMethods &
  typeof thingsMethods &
  typeof classesMethods

// ## Properties

/**
 * What a compiled property setter checks a new value against -- warns, NEVER rejects.
 * - e.g. `set title(value) { this.setProp('title', value, { type: 'text' }) }`
 * - see `spellCore.checkProp()`
 */
export type PropCheck = {
  /** type name, e.g. `text`, `choice`, `Card` -- see `spellCore.isOfType()` */
  type?: string
  /**
   * legal values, e.g. `Card.Suits` -- or a function returning them, read when a value is set, e.g.
   * `() => Deck.Suits`:  a value kind's list is on ANOTHER class, which may be defined after ours
   */
  oneOf?: readonly unknown[] | (() => readonly unknown[])
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
