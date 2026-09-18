//
//  ## Master import file for the classes `spellCore` exposes to compiled spell code.
//
//  NOTE: imports reach into `~/spellCore/core` and `~/spellCore/SpellCore` directly rather than
//  the `~/spellCore` barrel -- this file helps BUILD that barrel, so going through it would
//  re-enter it circularly.
//

import { spellCore } from "~/spellCore/core"
import { defineSpellCoreModule } from "~/spellCore/SpellCore"

import { Thing } from "./Thing"
import { App } from "./App"
import { List } from "./List"

/** Anything with a `.Component` to render, e.g. a `Thing`. */
export type Drawable = { Component?: ReactComponentType }

export const classesMethods = defineSpellCoreModule({
  /** Base types known to the `spell` language/parser. */
  BASE_TYPES: ["Object", "Thing", "List", "App"] as string[],

  /** DOM `id` for the react root element for `App` components. */
  REACT_APP_ROOT_ID: "spell-app-root",

  /** Safer `drawThing()` routine -- */
  drawThing(drawable?: Drawable): ReactElement | null {
    if (!drawable?.Component) return null
    return spellCore.element({ tag: drawable.Component })
  },

  /** Safer `drawItems()` routine, which won't barf if not called on a list.  */
  drawItems(list: List): ReactNode | null {
    if (!list.drawItems) return null
    return list.drawItems()
  }
})
Object.assign(spellCore, classesMethods)

spellCore.addExport("Thing", Thing)
spellCore.addExport("List", List)
spellCore.addExport("App", App)

export { Thing, List, App }
