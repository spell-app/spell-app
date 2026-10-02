/** @jsxImportSource react */
import React from "react"

import { editor } from "$/app/editor"
import { UI } from "$/app/ui"
import { Actions } from "./Actions"
import { AppContainer } from "./AppContainer"

import "./AppRoot.css"

/****************
 * ### `<AppRoot>`
 * Top-level wrapper for the compiled spell app: an optional `<AppToolbar>` plus `<AppContainer>`.
 * - Its mount point is where `editor` runs programs -- see `editor.setAppRoot()`.
 ****************/
export const AppRoot = React.memo(function AppRoot({
  showToolbar = true,
  scrolling = true,
  padded = true
}: AppRootProps) {
  return (
    <div className="AppRoot">
      {!!showToolbar && <AppToolbar />}
      <AppContainer scrolling={scrolling} padded={padded} appRef={editor.setAppRoot} />
    </div>
  )
})

/** Props for `<AppRoot>`. */
export type AppRootProps = {
  /** Show `<AppToolbar>` above `<AppContainer>`.  Defaults `true`. */
  showToolbar?: boolean
  /** Passed through to `<AppContainer>`. */
  scrolling?: boolean
  /** Passed through to `<AppContainer>`. */
  padded?: boolean
}

/****************
 * ### `<AppToolbar>`
 * Toolbar shown above the running app: restart / publish actions, plus a stubbed "..." menu.
 ****************/
export function AppToolbar() {
  return (
    <UI.PanelMenu>
      <UI.Submenu left spring>
        <UI.MenuHeader content="App" />
      </UI.Submenu>
      <UI.Submenu right spring>
        <Actions.restartApp />
        {/* <Actions.showRunner /> */}
        <Actions.publishApp />
        <UI.MoreMenu stub />
      </UI.Submenu>
    </UI.PanelMenu>
  )
}
