//----------------------------
// Base classes for spell
//--------
import React from "react"
import { createRoot } from "react-dom/client"
import _ from "lodash"

import { spellCore } from ".."
import { Thing } from "./Thing"

/**
 * DOM `id` for the react root element for `App` components.
 */
spellCore.REACT_APP_ROOT_ID = "spell-app-root"

//----------------------------
// `App`: a Drawable that renders a full application.
//  Set `draw` method and start things with `start app`.
//--------
export class App extends Thing {
  start() {
    let element = document.getElementById(spellCore.REACT_APP_ROOT_ID)
    if (!element) {
      element = document.createElement("div")
      element.id = spellCore.REACT_APP_ROOT_ID
      document.body.appendChild(element)
    }
    const root = createRoot(element)
    root.render(<this.Component />)
    // assign `root` to element so we can unmount it later
    element.REACT_ROOT = root
  }
}
spellCore.addExport("App", App)
