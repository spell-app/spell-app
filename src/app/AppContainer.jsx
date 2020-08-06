import React from "react"
import { Menu } from "semantic-ui-react"

import { spellCore } from "~/languages/spell"
import "./AppContainer.less"

export function AppRoot({ showToolbar = true, scrolling = true, padded = true }) {
  return (
    <div className="AppRoot">
      {!!showToolbar && <AppToolbar />}
      <AppContainer scrolling={scrolling} padded={padded} />
    </div>
  )
}

export function AppContainer({ scrolling, padded }) {
  const classNames = ["AppContainer"]
  if (scrolling) classNames.push("scrolling")
  if (padded) classNames.push("padded")
  return (
    <div className={classNames.join(" ")}>
      <div id={spellCore.REACT_APP_ROOT_ID} className="App" />
    </div>
  )
}

export function AppToolbar() {
  return (
    <Menu inverted attached="top" className="short tight light-grey">
      <Menu.Item header className="no-border">
        App
      </Menu.Item>
      <Menu.Menu position="right">
        <Menu.Item icon="redo" content="Restart" className="no-border" />
        <Menu.Item icon="hand point up" content="Preview" />
        <Menu.Item icon="world" content="Publish" />
        <Menu.Item icon="ellipsis horizontal" />
      </Menu.Menu>
    </Menu>
  )
}
