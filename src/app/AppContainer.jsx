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

const bound = {
  restartApp: () => store.compile(),
  showRunner: () => store.showRunner(),
  publish: () => store.publish()
}

export function AppToolbar() {
  return (
    <Menu inverted attached="top" className="short tight light-grey">
      <Menu.Item header className="no-border">
        App
      </Menu.Item>
      <Menu.Menu position="right">
        <Menu.Item content="Restart" icon="redo" className="no-border" onClick={bound.restartApp} />
        <Menu.Item content="Preview" icon="hand point up" onClick={bound.showRunner} />
        <Menu.Item content="Publish" disabled icon="world" onClick={bound.publish} />
        <Menu.Item disabled icon="ellipsis horizontal" />
      </Menu.Menu>
    </Menu>
  )
}
