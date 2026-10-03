import type { RouteSectionProps } from "@solidjs/router"

import {
  Actions,
  AppMenu,
  AppRoot,
  ConsoleRoot,
  MoreMenu,
  ProjectDropdown,
  SpellPage,
  SplitPanel,
  Submenu
} from "$/app/solid"
import { followRoute } from "./followRoute"

/****************
 * ### `<SpellRunner>`
 * The run page:  `<AppRoot>` (the running program, no toolbar) above `<ConsoleRoot>` (its log).
 ****************/
export function SpellRunner() {
  return (
    <SpellPage id="SpellRunner" fillWindow dark rows>
      <RunnerToolbar />
      <SplitPanel id="spellRunner" rows="85%" resizable rounded spaced="tightly">
        <AppRoot showToolbar={false} />
        <ConsoleRoot />
      </SplitPanel>
    </SpellPage>
  )
}

/****************
 * ### `<RunnerToolbar>`
 * Top menu of `<SpellRunner>`:  the project dropdown, restart and edit;  the chooser;  about and docs.
 ****************/
export function RunnerToolbar() {
  return (
    <AppMenu>
      <Submenu left spring>
        <ProjectDropdown useRunner />
        <Actions.restartApp />
        <Actions.showEditor />
      </Submenu>
      <Submenu center spring>
        <Actions.showProjectChooser />
      </Submenu>
      <Submenu right spring>
        <Actions.aboutSpell />
        <Actions.showDocs />
        <MoreMenu stub />
      </Submenu>
    </AppMenu>
  )
}

/****************
 * ### `<SpellRunnerRoute>`
 * The `/run/...` routes:  `<SpellRunner>`, showing the project the URL names (`followRoute()`).
 ****************/
export function SpellRunnerRoute(props: RouteSectionProps) {
  followRoute(() => props.params, "runner")
  return <SpellRunner />
}
