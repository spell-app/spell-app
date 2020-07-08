//----------------------------
// Base classes for spell
//--------
import React from "react"
import ReactDOM from "react-dom"
import _ from "lodash"

import { spellCore } from ".."
import { Drawable } from "./Drawable"

//----------------------------
// `App`: a Drawable that renders a full application.
//  Set `draw` method and start things with `start app`.
//--------
export class App extends Drawable {
  start() {
    let root = document.getElementById("app-root")
    if (!root) {
      root = document.createElement("div")
      document.id = "app-root"
      document.body.appendChild(root)
    }
    const AppComponent = this.Component
    ReactDOM.render(<AppComponent />, root)
  }
}
spellCore.addExport("App", App)
