// Common imports
import global from "global"
import { createRoot } from "react-dom/client"
import * as SUI from "semantic-ui-react"

// Import parser bits
import "~/parser"
import { spellCore } from "~/spellCore"
import { UI, ErrorNotice, Notice } from "~/app/ui"

import { Routes } from "./pages/routes"

// Use the below to set up methods/etc in the browser for hacking
import "./debug"

// Make the `spellCore` library available globally.
global.spellCore = spellCore

// Register `UI` and `SUI` elements so we can use them in spell JSX.
// NEVER rename the `UI` key -- `.spell` sources write `<UI.Form>`, `<UI.Button>` etc, so it is the
// spell language's public namespace.  Renaming the barrel would silently break every spell program,
// so if it ever changes, alias it back to `UI` here rather than following the rename.
spellCore.registerElements({ UI, SUI })

function renderApp() {
  const container = document.getElementById("react-root")!
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
