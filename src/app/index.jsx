// Common imports
import global from "global"
import React from "react"
import { createRoot } from "react-dom/client"
import * as SUI from "semantic-ui-react"

// Import parser bits
import "~/parser"
import { spellCore } from "~/spellCore"
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
  const container = document.getElementById("react-root")
  const root = createRoot(container)
  root.render(
    <>
      <Routes />
      <UI.ModalRoot />
      <Notice />
      <ErrorNotice />
    </>
  )
}

renderApp()

// module.hot.accept(renderApp);
