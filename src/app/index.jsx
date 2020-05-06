// Guarantee async/await works in all environments.
import "@babel/polyfill"

// Common imports
import global from "global"
import React from "react"
import ReactDOM from "react-dom"

// Import parser bits
import "~/parser"
import "~/languages/spell"
import { spellCore } from "~/languages/spell/spell-core"

// import "./debug"
import { store } from "./store"
import { SpellEditor } from "./SpellEditor"

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
