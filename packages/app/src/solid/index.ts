/**
 * Barrel for `$/app/solid`:  the app's UI, in Solid 2 on `@spell-app/ui`'s `<ui-*>` elements.
 * - Plumbing:
 *   - `loadUI.ts`:  SIDE EFFECT, defines every `@spell-app/ui` `<ui-*>` and adds the app's icon packs
 *     (`uiReady`).  The ONE place the app loads `$/ui`:  importing this barrel loads it.
 *   - `cellsBridge.ts`:  SIDE EFFECT, Solid follows spell cells (spell Things, `SP.*`, the editor).
 *   - `tracked()`:  a memo over a read of spell state.
 *   - `on()`:  a `ref` listening for a `ui-*` event.
 *   - `solid.types.ts`:  `<ui-*>` tags in Solid JSX.
 * - Shared UI:
 *   - `chrome.tsx`:  `AppMenu`, `PanelMenu`, `Submenu`, `MenuHeader`, `Spring`, `MoreMenu`, `DropdownLabel`,
 *     `ProjectActionsDropdown`, `FileActionsDropdown`, the icon names
 *   - `Actions.tsx`:  `Action`, `Actions`
 *   - `ErrorBoundary.tsx`:  `ErrorBoundary`
 *   - `ErrorNotice.tsx`:  `ErrorDisplay`, `ErrorNotice`;  `Notice.tsx`;  `Markdown.tsx`
 * - The pages' shell (P8):  `SpellPage`, `SplitPanel` (+ `SplitPane` ...), `AppRoot` / `AppContainer` (where a
 *   program draws, with React), `ProjectMenu` / `ProjectDropdown`.  The pages and the router are `$/app/pages`.
 * - The editor's panes (P6):  console, match and AST viewers, type and thing explorers, the Monaco editors,
 *   `FileDropdown`.
 * - NOTE: deliberately NOT here:
 *   - `./monaco`:  Monaco loads on first use, through `LazyMonaco`;  NEVER import it statically, types aside
 *   - `./modals`:  `editor.ts` imports it on first use (`import()`), so the editor never loads Solid up front
 * - NOTE: runner bundles import the files they need DIRECTLY (`$/app/solid/ThingExplorer`, `.../loadUI`):  this
 *   barrel pulls in the editor.
 * - NOTE: no namespace of its own (the app's are `UI` and `F`):  import by name,
 *   e.g. `import { tracked, PanelMenu } from "$/app/solid"`.
 */

export * from "./solid.types"

export * from "./loadUI"
export * from "./tracked"
export * from "./on"
export * from "./Actions"
export * from "./chrome"
export * from "./ErrorNotice"
export * from "./ErrorBoundary"
export * from "./Notice"
export * from "./Markdown"

export * from "./ConsoleLines"
export * from "./ConsoleViewer"
export * from "./MatchView"
export * from "./MatchViewer"
export * from "./ASTViewer"
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
