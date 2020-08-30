import { spellCore } from ".."
import { Thing } from "./Thing"
import { App } from "./App"
import { List } from "./List"

spellCore.addExport("Thing", Thing)
spellCore.addExport("List", List)
spellCore.addExport("App", App)

spellCore.BASE_TYPES = ["Object", "Thing", "List", "App"]

export { Thing, List, App }
