// ----------------------------
// Assembled type of the `spellCore` singleton.
// `spellCore` is built by accretion: each module below does `Object.assign(spellCore, { ...methods })`
// at runtime (see `index.ts` for the side-effect import order), so its full type is the
// intersection of every module's methods.
// ----------------------------
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
import type { EventfulMethods } from "./SpellEvent"

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
