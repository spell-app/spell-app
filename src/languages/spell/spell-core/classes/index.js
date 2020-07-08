import { spellCore } from ".."
import { Thing } from "./Thing"
import { Drawable } from "./Drawable"
import { App } from "./App"
import { List } from "./List"

spellCore.addExport("Thing", Thing)
spellCore.addExport("Drawable", Drawable)
spellCore.addExport("App", App)
spellCore.addExport("List", List)

spellCore.BASE_TYPES = ["Object", "Thing", "Drawable", "App", "List"]

export { Thing, Drawable, App, List }
