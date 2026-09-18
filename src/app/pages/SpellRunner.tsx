import React from "react"
import type { RouteComponentProps } from "@reach/router"

import { SP } from "~/languages/spell"
import { Actions } from "~/app/actions"
import { UI, AppRoot, ConsoleRoot, SpellPage, SplitPanel } from "~/app/components"
import { store } from "~/app/store"
import type { SpellRouteParams } from "./SpellEditor"

/** Runner page. */
export const SpellRunner = React.memo(function SpellRunner() {
  store.projectPage = "runner"
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
        <Actions.restartApp />
        <Actions.showEditor />
      </UI.Submenu>
      <UI.Submenu center spring>
        <Actions.showProjectChooser />
      </UI.Submenu>
      <UI.Submenu right spring>
        <Actions.aboutSpell />
        <Actions.showDocs />
        {/* <Actions.showHelp /> */}
        {/* <Actions.logIn /> */}
        <UI.MoreMenu stub />
      </UI.Submenu>
    </UI.AppMenu>
  )
}

/**
 * Reach-router `<Route/>` to show a project/example/etc by path.
 */
export function SpellRunnerRoute(props: RouteComponentProps<SpellRouteParams>) {
  const { domain, project, filePath } = props
  const path = SP.SpellLocation.pathForUrl({ domain, project, filePath })
  // console.info("SpellRunnerRoute", path, props)
  // HACK: Actually navigate on a timeout to avoid hook / rerender problems.
  setTimeout(() => store.selectPath(path), 0)
  return <SpellRunner />
}
