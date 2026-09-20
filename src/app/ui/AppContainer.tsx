import React from "react"

import { spellCore } from "~/spellCore"
import { Actions } from "./Actions"
import { UI } from "~/app/ui"
import "./AppContainer.less"

/****************
 * ### `<AppRoot>`
 * Top-level wrapper for the compiled spell app: an optional `<AppToolbar>` plus `<AppContainer>`.
 ****************/
export const AppRoot = React.memo(function AppRoot({
  showToolbar = true,
  scrolling = true,
  padded = true
}: AppRootProps) {
  return (
    <div className="AppRoot">
      {!!showToolbar && <AppToolbar />}
      <AppContainer scrolling={scrolling} padded={padded} />
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

/****************
 * ### `<AppContainer>`
 * Holds the DOM mount point (`id={spellCore.REACT_APP_ROOT_ID}`) the compiled spell app's own React
 * root attaches to -- see `store.selectPath()`, which unmounts whatever's there when switching projects.
 ****************/
export function AppContainer({ scrolling, padded }: AppContainerProps) {
  const classNames = ["AppContainer"]
  if (scrolling) classNames.push("scrolling")
  if (padded) classNames.push("padded")
  return (
    <div className={classNames.join(" ")}>
      <div id={spellCore.REACT_APP_ROOT_ID} className="App" />
    </div>
  )
}

/** Props for `<AppContainer>`. */
export type AppContainerProps = {
  /** Add `"scrolling"` class. */
  scrolling?: boolean
  /** Add `"padded"` class. */
  padded?: boolean
}
