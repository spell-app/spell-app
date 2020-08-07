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

import { SpellEditorRoute } from "./SpellEditorRoute"
import { SpellRunnerRoute } from "./SpellRunnerRoute"
import { ErrorNotice } from "./ErrorNotice"
import { Notice } from "./Notice"
import { UI } from "./ui"

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
    <>
      <Router>
        <SpellEditorRoute path="edit/:domain" />
        <SpellEditorRoute path="edit/:domain/:project" />
        <SpellEditorRoute path="edit/:domain/:project/*filePath" />
        <SpellEditorRoute default domain="projects" />

        <SpellRunnerRoute path="run/:domain" />
        <SpellRunnerRoute path="run/:domain/:project" />
        <SpellRunnerRoute path="run/:domain/:project/*filePath" />
      </Router>
      {/* Modals / Notice / ErrorNotice for all pages */}
      <UI.ModalContainer />
      <Notice />
      <ErrorNotice />
    </>,
    // eslint-disable-next-line no-undef
    document.getElementById("react-root")
  )
}

renderApp()

// module.hot.accept(renderApp);
