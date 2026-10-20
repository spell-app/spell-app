import type { coreMethods } from "./core"
import type { collectionCoreMethods } from "./collection-core"
import type { collectionOtherMethods } from "./collection-other"
import type { stringMethods } from "./string"
import type { uiMethods } from "./ui"
import type { drawingMethods } from "./drawing"
import type { elementsMethods } from "./elements"
import type { referencesMethods } from "./references"
import type { pathMethods } from "./paths"
import type { testMethods } from "./tests"
import type { consoleMethods } from "./console"
import type { runtimeMethods } from "./runtime"
import type { thingsMethods } from "./things"
import type { jsonMethods } from "./json"
import type { carryMethods } from "./carry"
import type { classesMethods } from "./classes"
import type { deprecatedMethods } from "./deprecated"
import type { PropRule } from "$/util"

// ## Importing core

/**
 * ES module specifier compiled spell imports its runtime from:  `import { core, Thing } from "@spell/core"`.
 * - Every runner -- the app, VS Code's, `<spell-app>` -- points it at the copy of the runtime the program runs on,
 *   by rewriting it:  see `linkModule()` in app's `runner/runCompiled.ts`.
 * - No import map.
 */
export const SPELL_CORE_MODULE = "@spell/core"

/**
 * Where compiled TypeScript imports the base class of each drawable type's element from, as a module name:
 * `import { E, SpellElement } from "@spell/elements"` (epic `drawable-thing` P10, J41).
 * - A name of its own, since core never imports Spell UI:  app's `SpellElement` is behind it.
 * - Resolved in three places:
 *   - a runner points it at the runtime copy, as `SPELL_CORE_MODULE`:  `linkModule()` in app's `runCompiled.ts`
 *   - the type check maps it to app's source:  `typecheck()` in spell's `node/typecheck.ts`
 *   - the headless run (`spell run`, the core contract) maps it to a stand-in:  cli's `runner/hooks.mjs`
 */
export const SPELL_ELEMENTS_MODULE = "@spell/elements"

/**
 * Spell's own classes, from `core/classes`:  what a project's types are made from, e.g. `a card is a thing`.
 * - What a Type Explorer lists as built in -- see `LSP.ScopeExplorer`.
 */
export const SPELL_CLASSES = ["Thing", "List", "App", "Drawable", "DrawableList"]

/** Names every compiled project imports from `SPELL_CORE_MODULE`:  `core`, and spell's classes. */
export const SPELL_CORE_NAMES = ["core", ...SPELL_CLASSES]

/**
 * Types built into spell, which every project starts with -- `core.BASE_TYPES`.
 * - Spell's classes, plus javascript's own `Object`, so spell can say `create an object` and `a list of objects`.
 *   NOT a spell class, so a Type Explorer leaves it out.
 * - Here, so the parser can read them WITHOUT importing `core`,
 *   whose code must stay in the runtime's own bundle entry -- see `spellRuntime.ts`.
 */
export const SPELL_BASE_TYPES = ["Object", ...SPELL_CLASSES]

/**
 * The type of the `core` singleton:  every module's methods, together.
 * - Built by accretion:  each module below does `Object.assign(core, { ...methods })` at runtime,
 *   so this is the intersection of every module's methods.
 *   `index.ts` has the side-effect imports, in order.
 * - It's the CORE CONTRACT too:  what another target's core must have (Python's `spell_core`, in `py/`).
 *   - What it must print is pinned by the `cli`'s `contract.test.ts`.
 *   - Except `deprecatedMethods`:  old names, for programs compiled before they changed.
 *     A new core has none.
 *   - Listed by name, for another core to check itself against, in `core.declarations.json5`:
 *     see `coreDeclarations()`.  A module added here goes in its `CORE_MODULES` too.
 */
export type Core = typeof coreMethods &
  typeof collectionCoreMethods &
  typeof collectionOtherMethods &
  typeof stringMethods &
  typeof uiMethods &
  typeof drawingMethods &
  typeof elementsMethods &
  typeof referencesMethods &
  typeof pathMethods &
  typeof testMethods &
  typeof consoleMethods &
  typeof runtimeMethods &
  typeof thingsMethods &
  typeof jsonMethods &
  typeof carryMethods &
  typeof classesMethods &
  typeof deprecatedMethods

// ## Properties

/**
 * What a compiled property setter checks a new value against -- warns, NEVER rejects.
 * - e.g. `set title(value) { this.setProp('title', value, { type: 'text' }) }`
 * - see `core.checkProp()`
 */
export type PropCheck = {
  /** type name, e.g. `text`, `choice`, `Card` -- see `core.isOfType()` */
  type?: string
  /**
   * legal values, e.g. `Card.Suits` -- or a function returning them, read when a value is set,
   * e.g. `() => Deck.Suits`:  a value kind's list is on ANOTHER class, which may be defined after ours
   */
  oneOf?: readonly unknown[] | (() => readonly unknown[])
  /** what its value must be, beyond its type, e.g. `[{ type: "empty" }]` -- see `PropRule` (epic `property-editor` P9) */
  rules?: readonly PropRule[]
}

// ## Modules

/**
 * Wrap a module's methods object, returning it as is:  marks it as part of `core`.
 * - Module method bodies call sibling methods through the imported `core` singleton, NOT `this`.
 * - NOTE: this intentionally does NOT try to type `this` as `Core` (e.g. via `ThisType<Core>`):
 *   `Core` is itself assembled from `typeof <module>Methods` for every module,
 *   so a signature here that mentions `Core` would make every module's methods type circularly depend on itself.
 */
export function defineCoreModule<T extends object>(methods: T): T {
  return methods
}
