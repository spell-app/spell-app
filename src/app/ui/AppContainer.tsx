import React from "react"

import { spellCore } from "~/spellCore"
import { Actions } from "./Actions"
import { UI } from "."
import "./AppContainer.less"

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

export type AppRootProps = {
  showToolbar?: boolean
  scrolling?: boolean
  padded?: boolean
}
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

export type AppContainerProps = {
  scrolling?: boolean
  padded?: boolean
}
