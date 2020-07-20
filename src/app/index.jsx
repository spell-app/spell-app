// Guarantee async/await works in all environments.
import "@babel/polyfill"

// Common imports
import global from "global"
import React from "react"
import ReactDOM from "react-dom"
import { Router } from "@reach/router"

// Import parser bits
import "~/parser"
import { spellCore } from "~/languages/spell"

import { store } from "./store"
import { SpellRoute } from "./SpellEditor"

// Use the below to set up methods/etc in the browser for hacking
import "./debug"

// Make the `spellCore` library available globally.
// TODO: other place to put this???
global.spellCore = spellCore

function renderApp() {
  ReactDOM.render(
    <Router>
      <SpellRoute path=":domain" />
      <SpellRoute path=":domain/:project" />
      <SpellRoute path=":domain/:project/*filePath" />
      <SpellRoute default domain="projects" />
    </Router>,
    // eslint-disable-next-line no-undef
    document.getElementById("react-root")
  )
  // store.start()
}

renderApp()

// module.hot.accept(renderApp);
