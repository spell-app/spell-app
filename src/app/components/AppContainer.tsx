import React from "react"

import { spellCore } from "~/spellCore"
import { actions } from "~/app/actions"
import { UI } from "./ui"
import "./AppContainer.less"

export type AppRootProps = {
  showToolbar?: boolean
  scrolling?: boolean
  padded?: boolean
}

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

export function AppToolbar() {
  return (
    <UI.PanelMenu>
      <UI.Submenu left spring>
        <UI.MenuHeader content="App" />
      </UI.Submenu>
      <UI.Submenu right spring>
        <actions.restartApp />
        {/* <actions.showRunner /> */}
        <actions.publishApp />
        <UI.MoreMenu stub />
      </UI.Submenu>
    </UI.PanelMenu>
  )
}

export type AppContainerProps = {
  scrolling?: boolean
  padded?: boolean
}

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
