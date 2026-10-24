/**
 * Barrel for `spell-app/app/solid`:  the app's UI, in Solid 2 on `spell-ui`'s `<ui-*>` elements.
 * - Plumbing:
 *   - `loadUI.ts`:  SIDE EFFECT, defines every `spell-ui` `<ui-*>` and adds the app's icon packs (`uiReady`).
 *     The ONE place the app loads `spell-ui`:  importing this barrel loads it.
 *   - `cellsBridge.ts`:  SIDE EFFECT, Solid follows spell cells (spell Things, `SP.*`, the editor).
 *   - `tracked()`:  a memo over a read of spell state.
 *   - `on()`:  a `ref` listening for a `ui-*` event.
 *   - `solid.types.ts`:  `<ui-*>` tags in Solid JSX, Spell UI's exact types (`spell-ui/jsx`).
 * - Shared UI:
 *   - `chrome.tsx`:  `AppMenu`, `PanelMenu`, `Submenu`, `MenuHeader`, `Spring`, `MoreMenu`,
 *     `ProjectActionsDropdown`, the icon names
 *   - `Actions.tsx`:  `Action`, `Actions`
 *   - `EditorTheme.tsx`, `EditorMode.tsx`:  the editor's look, and its Run / Edit / Debug modes
 *   - `ErrorBoundary.tsx`:  `ErrorBoundary`
 *   - `ErrorNotice.tsx`:  `ErrorDisplay`, `ErrorNotice`;  `Notice.tsx`;  `Markdown.tsx`
 * - The pages' shell (P8):
 *   - `SpellPage`
 *   - `SplitPanel` (+ `SplitPane` ...)
 *   - `AppRoot` / `AppContainer`:  where a program draws, with React
 *   - `ProjectMenu` / `ProjectDropdown`
 *   - The pages and the router are `spell-app/app/pages`.
 * - The editor's panes (P6):
 *   console, match and AST viewers, type and thing explorers, the Monaco editors, `FileDropdown`.
 * - NOTE: deliberately NOT here:
 *   - `./monaco`:  Monaco loads on first use, through `LazyMonaco`;  NEVER import it statically, types aside
 *   - `./modals`:  `editor.ts` imports it on first use (`import()`), so the editor never loads Solid up front
 * - NOTE: runner bundles import the files they need DIRECTLY (`spell-app/app/solid/ThingExplorer`, `.../loadUI`):
 *   this barrel pulls in the editor.
 * - Their docs:  App UI, a page per component at `/components/app/` (spell-app's `app/docs/`, `yarn site:data`).
 * - NOTE: no namespace of its own (the app's are `UI` and `F`):
 *   import by name, e.g. `import { tracked, PanelMenu } from "spell-app/app/solid"`.
 */

export * from "./solid.types"

export * from "./loadUI"
export * from "./tracked"
export * from "./on"
export * from "./Actions"
export * from "./chrome"
export * from "./EditorTheme"
export * from "./EditorMode"
export * from "./ErrorNotice"
export * from "./ErrorBoundary"
export * from "./Notice"
export * from "./Markdown"

export * from "./ConsoleLines"
export * from "./ConsoleViewer"
export * from "./TreeViewer"
export * from "./ScopeDetailsPane"
export * from "./TypeExplorer"
export * from "./ThingExplorer"
export * from "./LazyMonaco"
export * from "./InputEditor"
export * from "./OutputEditor"
export * from "./FileDropdown"

export * from "./SpellPage"
export * from "./SplitPanel"
export * from "./AppContainer"
export * from "./AppRoot"
export * from "./ProjectDropdown"
