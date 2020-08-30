// Guarantee async/await works in all environments.
import "@babel/polyfill"

// Common imports
import global from "global"
import React from "react"
import ReactDOM from "react-dom"
import * as SUI from "semantic-ui-react"

// Import parser bits
import "~/parser"
import { spellCore } from "~/spell-core"
import { Routes } from "./pages/routes"
import { ErrorNotice } from "~/app/components/ErrorNotice"
import { Notice } from "~/app/components/Notice"
import { UI } from "~/app/components/ui"

// Use the below to set up methods/etc in the browser for hacking
import "./debug"

// Make the `spellCore` library available globally.
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
