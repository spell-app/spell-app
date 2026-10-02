/** @jsxImportSource react */
// Common imports
import { createRoot } from "react-dom/client"

// Import parser bits
import "$/parser"
import { editor } from "$/app/editor"
import { UI, ErrorNotice, Notice } from "$/app/ui"

import { Routes } from "./pages/routes"

// Use the below to set up methods/etc in the browser for hacking
import "./debug"

// Programs run on the runtime `editor` loads -- start loading it now.  It registers the `UI` / `SUI` tags spell JSX
// draws with, NOT the editor's `UI` barrel.  NEVER import `$/core` here:  see `spellRuntime.ts`.
void editor.loadRuntime()

/**
 * Mount app into `#react-root`.
 * - `<Routes>` picks `ProjectChooser`/`SpellEditor`/`SpellRunner` by URL.
 * - `<UI.ModalRoot>`/`<Notice>`/`<ErrorNotice>` render `editor.modals`/`editor.notice`/`editor.error`.
 */
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
