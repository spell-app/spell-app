import type { RouteSectionProps } from "@solidjs/router"

import { SpellPage, SplitPanel } from "spell-app/app/solid"
import { AppPane, EditorToolbar } from "./SpellEditor"
import { followRoute } from "./followRoute"

/****************
 * ### `<SpellRunner>`
 * The run page, the editor's Run mode:  the program alone, under its header (`<AppPane>`), the whole window.
 * - Its top bar is the editor's (`<EditorToolbar>`), with Run pressed:  Edit or Debug go back to the code.
 * - Its log is Debug's:  the Program panel, under the code.
 ****************/
export function SpellRunner() {
  return (
    <SpellPage id="SpellRunner" fillWindow dark rows>
      <EditorToolbar mode="run" />
      <SplitPanel id="spellRunner" rows rounded spaced="tightly">
        <AppPane />
      </SplitPanel>
    </SpellPage>
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
