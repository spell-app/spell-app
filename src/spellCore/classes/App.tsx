//----------------------------
// Base classes for spell
//--------
import { createRoot } from "react-dom/client"

import { spellCore } from ".."
import { Thing } from "./Thing"

//----------------------------
// `App`: a Drawable that renders a full application.
//  Set `draw` method and start things with `start app`.
//--------
export class App extends Thing {
  start(): void {
    let element = document.getElementById(spellCore.REACT_APP_ROOT_ID)
    if (!element) {
      element = document.createElement("div")
      element.id = spellCore.REACT_APP_ROOT_ID
      document.body.appendChild(element)
    }
    const root = createRoot(element)
    root.render(<this.Component />)
    // assign `root` to element so we can unmount it later
    ;(element as HTMLElement & { REACT_ROOT?: ReturnType<typeof createRoot> }).REACT_ROOT = root
  }
}
spellCore.addExport("App", App)
