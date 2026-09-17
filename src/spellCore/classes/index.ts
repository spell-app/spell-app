import { spellCore } from ".."
import { Thing } from "./Thing"
import { App } from "./App"
import { List } from "./List"
import { defineSpellCoreModule } from "../SpellCore"

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
