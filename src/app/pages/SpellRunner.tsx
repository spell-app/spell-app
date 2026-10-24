import type { RouteSectionProps } from "@solidjs/router"
import { Show, createSignal } from "solid-js"

import { getPref, setPref } from "spell/util"

import {
  Actions,
  AppMenu,
  AppRoot,
  ConsoleRoot,
  ProjectDropdown,
  SpellPage,
  SplitPanel,
  Submenu
} from "spell-app/app/solid"
import { appTexts } from "spell-app/app/ui/AppTexts"
import { followRoute } from "./followRoute"

/****************
 * ### `<SpellRunner>`
 * The run page:  `<AppRoot>` (the running program, no toolbar), and below it `<ConsoleRoot>` (its log) when shown.
 * - The log starts hidden:  the toolbar's console button shows it, and the page remembers which (`CONSOLE_PREF`).
 * - Showing it never redraws the program:  the panel keeps each pane by its node.
 ****************/
export function SpellRunner() {
  const [isShowingConsole, setShowingConsole] = createSignal(getPref(CONSOLE_PREF, false) === true)
  const toggleConsole = () => {
    setShowingConsole(!isShowingConsole())
    setPref(CONSOLE_PREF, isShowingConsole())
  }
  return (
    <SpellPage id="SpellRunner" fillWindow dark rows>
      <RunnerToolbar isShowingConsole={isShowingConsole()} onToggleConsole={toggleConsole} />
      <SplitPanel id="spellRunner" rows={isShowingConsole() ? "85%" : "100%"} resizable rounded spaced="tightly">
        <AppRoot showToolbar={false} />
        <Show when={isShowingConsole()}>
          <ConsoleRoot />
        </Show>
      </SplitPanel>
    </SpellPage>
  )
}

/** The preference that remembers whether the run page shows its console. */
const CONSOLE_PREF = "spellRunner.showConsole"

/****************
 * ### `<RunnerToolbar>`
 * Top menu of `<SpellRunner>`:  the project dropdown, restart and edit;  the chooser;  about, and the console button.
 ****************/
export function RunnerToolbar(props: RunnerToolbarProps) {
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
        <ui-item link="" class="console" selected={props.isShowingConsole} onClick={() => props.onToggleConsole()}>
          <ui-icon name="terminal" />
          {appTexts.text(props.isShowingConsole ? "hideConsole" : "showConsole")}
        </ui-item>
      </Submenu>
    </AppMenu>
  )
}

/** Props for `<RunnerToolbar>`. */
type RunnerToolbarProps = {
  /** Is the console shown?  Its button is selected while it is. */
  isShowingConsole: boolean
  /** The console button was pressed. */
  onToggleConsole: () => void
}

/****************
 * ### `<SpellRunnerRoute>`
 * The `/run/...` routes:  `<SpellRunner>`, showing the project the URL names (`followRoute()`).
 ****************/
export function SpellRunnerRoute(props: RouteSectionProps) {
  followRoute(() => props.params, "runner")
  return <SpellRunner />
}
