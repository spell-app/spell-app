import { Show, onCleanup } from "solid-js"

import { editor } from "$/app/editor"
import { Actions, MenuHeader, MoreMenu, PanelMenu, Submenu } from "$/app/solid"
import { AppContainer } from "./AppContainer"

import "./AppRoot.css"

/****************
 * ### `<AppRoot>`
 * The running program in the editor's pages:  an optional `<AppToolbar>` above an `<AppContainer>`.
 * - SIDE EFFECT:  its container is where `editor` runs programs (`editor.setAppRoot()`), until it goes
 *   (`editor.releaseAppRoot()`).
 ****************/
export function AppRoot(props: AppRootProps) {
  let appElement: HTMLDivElement | undefined
  onCleanup(() => {
    if (appElement) editor.releaseAppRoot(appElement)
  })
  return (
    <div class="AppRoot">
      <Show when={props.showToolbar ?? true}>
        <AppToolbar />
      </Show>
      <AppContainer
        scrolling={props.scrolling ?? true}
        padded={props.padded ?? true}
        appRef={(element) => {
          appElement = element
          editor.setAppRoot(element)
        }}
      />
    </div>
  )
}

/** Props for `<AppRoot>`. */
export type AppRootProps = {
  /** Show `<AppToolbar>` above the program.  Default:  `true`. */
  showToolbar?: boolean
  /** Scrolls the program's drawing.  Default:  `true`. */
  scrolling?: boolean
  /** Padding around the program's drawing.  Default:  `true`. */
  padded?: boolean
}

/****************
 * ### `<AppToolbar>`
 * Toolbar above the running program:  restart and publish, and a stub "..." menu.
 ****************/
export function AppToolbar() {
  return (
    <PanelMenu>
      <Submenu left spring>
        <MenuHeader>App</MenuHeader>
      </Submenu>
      <Submenu right spring>
        <Actions.restartApp />
        <Actions.publishApp />
        <MoreMenu stub />
      </Submenu>
    </PanelMenu>
  )
}
