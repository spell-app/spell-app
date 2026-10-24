import { render } from "@solidjs/web"

// Import parser bits
import "spell-parser/parser"
import { editor } from "spell-app/app/editor"
import { AppTexts } from "spell-app/app/ui/AppTexts"
import { EditorTheme, ErrorNotice, Notice, addAppIconsPageWide } from "spell-app/app/solid"
import { Routes } from "spell-app/app/pages/routes"

// Use the below to set up methods/etc in the browser for hacking
import "./debug"
// Solid follows spell cells:  BEFORE anything renders
import "spell-app/app/solid/cellsBridge"

// The editor speaks the page's language:  the browser's, when `index.html` names none.
// BEFORE anything draws, so `<ui-root>` loads Spell UI's words in it too.
AppTexts.namePageLanguage()

// Programs run on the runtime `editor` loads -- start loading it now.
// - It registers the `UI` / `SUI` tags spell JSX draws with, NOT the editor's `spell-app/app/solid`.
// - NEVER import `spell-parser/core` here:  see `spellRuntime.ts`.
void editor.loadRuntime()

// The editor's icon names are Fomantic's, page-wide too:  its dialogs open on `<body>`, outside `index.html`'s `<ui-root>`.
void addAppIconsPageWide()

// The editor's look:  the theme and light / dark picked last, Fruity at first (`EditorTheme`).
void EditorTheme.restore()

/**
 * Draw the app, in Solid, into `#app-root` (inside `index.html`'s `<ui-root icons="fomantic">`).
 * - `<Routes>` picks `<ProjectChooser>` / `<SpellEditor>` / `<SpellRunner>` by URL.
 * - `<Notice>` / `<ErrorNotice>` show `editor.notice` / `editor.error` over every page.
 * - Dialogs need no root:  each `editor.alert()` / `choose()` ... opens its own `<ui-modal>`.
 * - A running program draws with the page's Solid, in its own root on `<AppRoot>`'s element:
 *   see `editor.setAppRoot()`.
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
