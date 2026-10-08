/**
 * Master import file for the classes `spellCore` exposes to compiled spell code.
 * - Re-exported from `$/core`'s own barrel (`export * from "./classes"`) so `Thing`/`List`/`App`
 *   are available alongside the rest of `spellCore`.
 *
 * NOTE: imports reach into `$/core/core` and `$/core/SpellCore` directly rather than
 * the `$/core` barrel -- this file helps BUILD that barrel, so going through it would
 * re-enter it circularly.
 */
import { spellCore } from "$/core/core"
import { defineSpellCoreModule, SPELL_BASE_TYPES } from "$/core/spellCore.types"

import { Thing } from "./Thing"
import { App } from "./App"
import { List } from "./List"

/** Anything with a `.Component` to render, e.g. a `Thing`. */
export type Drawable = {
  /** React component that renders this thing -- optional so a non-`Drawable` can still be checked safely. */
  Component?: ReactComponentType
}

/** Base-type registry plus safer `draw*` wrappers for `Thing`/`List`/`App`. */
export const classesMethods = defineSpellCoreModule({
  /** Base types known to the `spell` language/parser -- see `SPELL_BASE_TYPES`. */
  BASE_TYPES: [...SPELL_BASE_TYPES] as string[],

  /** DOM `id` for the react root element for `App` components. */
  REACT_APP_ROOT_ID: "spell-app-root",

  /**
   * Element `App.start()` mounts into, if the host says -- e.g. `<spell-app>`'s, inside its shadow root.
   * - Unset:  `#spell-app-root` in `document`, see `appElement()`.
   * - Also decides where `installStyles()` puts a project's styles -- see `domRoot()`.
   */
  appRoot: undefined as HTMLElement | undefined,

  /** Element the app mounts into:  `appRoot`, else `#spell-app-root` in `document` -- `null` if neither. */
  appElement(): HTMLElement | null {
    return spellCore.appRoot ?? document.getElementById(spellCore.REACT_APP_ROOT_ID)
  },

  /**
   * Document or shadow root the app lives in:  `appRoot`'s shadow root, if it's in one, else `document`.
   * - Look elements up and add styles HERE, NOT on `document` -- which can't see into a shadow root.
   */
  domRoot(): Document | ShadowRoot {
    const root = spellCore.appRoot?.getRootNode()
    return typeof ShadowRoot !== "undefined" && root instanceof ShadowRoot ? root : document
  },

  /**
   * Safer `drawThing()` routine -- returns `null` instead of throwing when `drawable` doesn't
   * implement `.Component` (e.g. wasn't a `Thing`/`Drawable`), unlike calling `.Component` directly.
   * - Compiles from `draw the card` -- see `draw.ts`.
   * - Takes ANYTHING, as it checks:  compiled spell draws what TypeScript can't type, e.g. the last card of a pile.
   */
  drawThing(drawable?: unknown): ReactElement | null {
    const thing = drawable as Drawable | undefined
    if (!thing?.Component) return null
    return spellCore.element({ tag: thing.Component })
  },

  /**
   * Safer `drawItems()` routine, which won't barf if not called on a list.
   * - Compiles from `draw each card in the deck` / `draw cards of the deck` -- see `draw.ts`.
   */
  drawItems(list: List): ReactNode | null {
    if (!list.drawItems) return null
    return list.drawItems()
  }
})
Object.assign(spellCore, classesMethods)

// Compiled spell imports these -- `import { spellCore, Thing, List, App } from "@spell/core"`.  No globals.
export { Thing, List, App }
