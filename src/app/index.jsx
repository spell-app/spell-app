// Guarantee async/await works in all environments.
import "@babel/polyfill"

// Common imports
import global from "global"
import React from "react"
import ReactDOM from "react-dom"

// Import parser bits
import "~/parser"
import { spellCore } from "~/languages/spell"

import { store } from "./store"
import { SpellEditor } from "./SpellEditor"

// Use the below to set up methods/etc in the browser for hacking
import "./debug"

// Make the `spellCore` library available globally.
// TODO: other place to put this???
global.spellCore = spellCore

function renderApp() {
  ReactDOM.render(
    <SpellEditor />,
    // eslint-disable-next-line no-undef
    document.getElementById("react-root")
  )
  store.start()
}

renderApp()

// module.hot.accept(renderApp);
