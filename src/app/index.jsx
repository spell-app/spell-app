// Guarantee async/await works in all environments.
import "@babel/polyfill"

// Common imports
import global from "global"
import React from "react"
import ReactDOM from "react-dom"
import * as SUI from "semantic-ui-react"

// Import parser bits
import "~/parser"
import { spellCore } from "~/languages/spell"
import { Routes } from "./pages/routes"
import { ErrorNotice } from "~/app/components/ErrorNotice"
import { Notice } from "~/app/components/Notice"
import { UI } from "~/app/components/ui"

// Use the below to set up methods/etc in the browser for hacking
import "./debug"

// Load spell-specific CSS
import "~/app/components/spell.less"
// Load spell-specific Semantic-UI customizations
import "~/app/components/SUI-additions.less"

// Make the `spellCore` library available globally.
// TODO: other place to put this???
global.spellCore = spellCore

// Register `UI` and `SUI` elements so we can use them in spell JSX.
spellCore.registerElements({ UI, SUI })

function renderApp() {
  ReactDOM.render(
    <>
      <Routes />
      {/* Modals / Notice / ErrorNotice for all pages */}
      <UI.ModalRoot />
      <Notice />
      <ErrorNotice />
    </>,
    // eslint-disable-next-line no-undef
    document.getElementById("react-root")
  )
}

renderApp()

// module.hot.accept(renderApp);
