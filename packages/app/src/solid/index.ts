/**
 * Barrel for `$/app/solid`:  the app's Solid side while React and Solid live side by side.
 * - Plumbing:
 *   - `loadUI.ts`:  SIDE EFFECT, defines every `@spell-app/ui` `<ui-*>` and adds the app's icon packs
 *     (`uiReady`).  The ONE place the app loads `$/ui`:  importing this barrel loads it.
 *   - `tracked()`:  Solid sees `easy-state` (spell Things, the editor store) change.
 *   - `solidIsland()`:  a React component around a Solid one, for React pages until they move (P8).
 *   - `on()`:  a `ref` listening for a `ui-*` event.
 *   - `solid.types.ts`:  `<ui-*>` tags in Solid JSX.
 * - Shared UI, Solid twins of `$/app/ui`'s (same names;  the React ones stay until P8):
 *   - `chrome.tsx`:  `AppMenu`, `PanelMenu`, `Submenu`, `MenuHeader`, `Spring`, `MoreMenu`, `DropdownLabel`,
 *     `ProjectActionsDropdown`, `FileActionsDropdown`, the icon names
 *   - `Actions.tsx`:  `Action`, `Actions`
 *   - `ErrorBoundary.tsx`:  `ErrorBoundary`, replacing React's `ErrorHandler`
 *   - `ErrorNotice.tsx`:  `ErrorDisplay`, `ErrorNotice`;  `Notice.tsx`;  `Markdown.tsx`
 * - NOTE: no namespace of its own (the app's are `UI` and `F`):  import by name,
 *   e.g. `import { tracked, PanelMenu } from "$/app/solid"`.  Names may match `UI.*`'s:  they're never mixed.
 */

export * from "./solid.types"

export * from "./loadUI"
export * from "./tracked"
export * from "./solidIsland"
export * from "./on"
export * from "./Actions"
export * from "./chrome"
export * from "./ErrorNotice"
export * from "./ErrorBoundary"
export * from "./Notice"
export * from "./Markdown"
