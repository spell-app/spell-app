//----------------------------
// Base classes for spell
//--------
import React from "react"
import ReactDOM from "react-dom"
import _ from "lodash"

import { REACT_APP_ROOT_ID } from "~/util"
import { spellCore } from ".."
import { Drawable } from "./Drawable"

//----------------------------
// `App`: a Drawable that renders a full application.
//  Set `draw` method and start things with `start app`.
//--------
export class App extends Drawable {
  start() {
    let root = document.getElementById(REACT_APP_ROOT_ID)
    if (!root) {
      root = document.createElement("div")
      document.id = REACT_APP_ROOT_ID
      document.body.appendChild(root)
    }
    const AppComponent = this.Component
    ReactDOM.render(<AppComponent />, root)
  }
}
spellCore.addExport("App", App)
