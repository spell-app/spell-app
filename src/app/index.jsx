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

import { SpellPathRoute } from "./SpellPathRoute"

// Use the below to set up methods/etc in the browser for hacking
import "./debug"

// Load spell-specific CSS
import "./spell.less"
// Load spell-specific Semantic-UI customizations
import "./SUI-additions.less"

// Make the `spellCore` library available globally.
// TODO: other place to put this???
global.spellCore = spellCore

function renderApp() {
  ReactDOM.render(
    <Router>
      <SpellPathRoute path=":domain" />
      <SpellPathRoute path=":domain/:project" />
      <SpellPathRoute path=":domain/:project/*filePath" />
      <SpellPathRoute default domain="projects" />
    </Router>,
    // eslint-disable-next-line no-undef
    document.getElementById("react-root")
  )
}

renderApp()

// module.hot.accept(renderApp);
