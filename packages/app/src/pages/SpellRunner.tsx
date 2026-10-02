/** @jsxImportSource react */
import React from "react"
import type { RouteComponentProps } from "@reach/router"

import { SP } from "$/spell"
import { UI, Actions, AppRoot, ConsoleRoot, SpellPage, SplitPanel } from "$/app/ui"
import { editor } from "$/app/editor"
import type { SpellRouteParams } from "./pages.types"

/****************
 * ### `<SpellRunner />`
 * Run page: `<UI.AppRoot>` (live rendered app, no editor toolbar) plus `<UI.ConsoleRoot>` (run log).
 * - SIDE EFFECT: sets `editor.projectPage = "runner"` on every render.
 ****************/
export const SpellRunner = React.memo(function SpellRunner() {
  editor.projectPage = "runner"
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

/****************
 * ### `<RunnerToolbar />`
 * Top menu bar for `<SpellRunner>` -- project dropdown, restart/edit actions, and about/docs links.
 ****************/
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

/****************
 * ### `<SpellRunnerRoute />`
 * Reach-router `<Route/>` to show a project/example/etc by path.
 * - HACK: navigates on a timeout to avoid hook/rerender problems.
 ****************/
export function SpellRunnerRoute(props: RouteComponentProps<SpellRouteParams>) {
  const { domain, project, filePath } = props
  const path = SP.SpellLocation.pathForUrl({ domain, project, filePath })
  // console.info("SpellRunnerRoute", path, props)
  // HACK: Actually navigate on a timeout to avoid hook / rerender problems.
  setTimeout(() => editor.selectPath(path), 0)
  return <SpellRunner />
}
