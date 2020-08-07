import React from "react"

import { actions } from "./actions"
import { UI } from "./ui"
import { AppRoot } from "./AppContainer"
import { ConsoleRoot } from "./ConsoleViewer"
import { SpellPage } from "./SpellPage"
import { SplitPanel } from "./SplitPanel"

/** Runner page. */
export const SpellRunner = React.memo(function SpellRunner() {
  return (
    <SpellPage id="SpellRunner" fillWindow dark rows>
      <RunnerToolbar />
      <SplitPanel id="spellRunner" rows="85%" resizable rounded spaced="tightly">
        <AppRoot showToolbar={false} />
        <ConsoleRoot />
      </SplitPanel>
    </SpellPage>
  )
})
/** RunnerToolbar. */
export function RunnerToolbar() {
  return (
    <UI.AppMenu>
      <UI.Submenu left spring>
        <UI.ProjectDropdown useRunner />
        <actions.restartApp />
        <actions.showEditor />
      </UI.Submenu>
      <UI.Submenu center spring>
        <actions.showProjectChooser noBorder />
        <actions.createProject />
      </UI.Submenu>
      <UI.Submenu right spring>
        <actions.aboutSpell />
        <actions.showDocs noBorder />
        {/* <actions.showHelp /> */}
        {/* <actions.logIn /> */}
        <UI.MoreMenu stub />
      </UI.Submenu>
    </UI.AppMenu>
  )
}
