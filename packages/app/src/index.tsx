import { render } from "@solidjs/web"

// Import parser bits
import "$/parser"
import { editor } from "$/app/editor"
import { ErrorNotice, Notice, addAppIconsPageWide } from "$/app/solid"
import { Routes } from "$/app/pages/routes"

// Use the below to set up methods/etc in the browser for hacking
import "./debug"

// Programs run on the runtime `editor` loads -- start loading it now.  It registers the `UI` / `SUI` tags spell JSX
// draws with, NOT the editor's `$/app/solid`.  NEVER import `$/core` here:  see `spellRuntime.ts`.
void editor.loadRuntime()

// The editor's icon names are Fomantic's, page-wide too:  its dialogs open on `<body>`, outside `index.html`'s `<ui-root>`.
void addAppIconsPageWide()

/**
 * Draw the app, in Solid, into `#app-root` (inside `index.html`'s `<ui-root icons="fomantic">`).
 * - `<Routes>` picks `<ProjectChooser>` / `<SpellEditor>` / `<SpellRunner>` by URL.
 * - `<Notice>` / `<ErrorNotice>` show `editor.notice` / `editor.error` over every page.  Dialogs need no root:  each
 *   `editor.alert()` / `choose()` ... opens its own `<ui-modal>`.
 * - A running program draws with REACT, in its own root on `<AppRoot>`'s element:  see `editor.setAppRoot()`.
 */
render(
  () => (
    <>
      <Routes />
      <Notice />
      <ErrorNotice />
    </>
  ),
  document.getElementById("app-root")!
)
