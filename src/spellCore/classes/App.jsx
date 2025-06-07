//----------------------------
// Base classes for spell
//--------
import React from "react"
import ReactDOM from "react-dom"
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
    let root = document.getElementById(spellCore.REACT_APP_ROOT_ID)
    if (!root) {
      root = document.createElement("div")
      root.id = spellCore.REACT_APP_ROOT_ID
      document.body.appendChild(root)
    }
    const AppComponent = this.Component
    ReactDOM.render(<AppComponent />, root)
  }
}
spellCore.addExport("App", App)
