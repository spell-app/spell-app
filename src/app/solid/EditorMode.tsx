import { For, createSignal } from "solid-js"
import type { JSX } from "@solidjs/web"

import { editor } from "spell-app/app/editor"
import { editorPrefs } from "spell-app/app/editorPrefs"
import { appTexts, type AppTextKey } from "spell-app/app/ui/AppTexts"

/****************
 * ### `EditorMode`
 * How the editor shows a project:  Run, Edit or Debug, picked from the top bar's `<ModeButtons>`.
 * - Run:  the program alone, the whole window (the run page, `editor.showRunner()`).
 * - Edit:  the code beside the program (the editor page).
 * - Debug:  Edit, plus the Program panel under the code:  its output, things, types and compiled code.
 * - Edit or Debug is remembered in the browser (`MODE_PREF`), so the editor page opens the way it was left.
 *   Run isn't:  it's a page of its own, with its own address.
 ****************/
export class EditorMode {
  /** Edit or Debug, as the editor page shows now (reactive). */
  static get editing(): EditingMode {
    return editingMode()
  }

  /**
   * Show the project in `mode`.
   * - Run:  the run page.
   * - Edit, Debug:  the editor page, remembering which.
   */
  static show(mode: Mode): void {
    if (mode === "run") {
      void editor.showRunner()
      return
    }
    setEditingMode(mode)
    editorPrefs.set(MODE_PREF, mode)
    editor.showEditor()
  }
}

/** One of the editor's ways of showing a project. */
export type Mode = (typeof MODES)[number]
/** Edit or Debug:  the editor page's two. */
export type EditingMode = Exclude<Mode, "run">

/** The modes, in the top bar's order. */
const MODES = ["run", "edit", "debug"] as const
/** The editor page's modes:  Edit first, its default. */
const EDITING_MODES = ["edit", "debug"] as const satisfies readonly EditingMode[]
/** The preference that remembers Edit or Debug. */
const MODE_PREF = "mode"
/** Each mode's icon (Fomantic's names) and its name's text key. */
const MODE_LOOKS: Record<Mode, { icon: string; text: AppTextKey }> = {
  run: { icon: "play", text: "runMode" },
  edit: { icon: "pencil", text: "editMode" },
  debug: { icon: "tree", text: "debugMode" }
}

// TODO:  drop the rename once every browser has opened the editor since epic `prefs-and-undo` P1
editorPrefs.declare(MODE_PREF, { oneOf: EDITING_MODES }).rename("spellEditor.mode", MODE_PREF)
const [editingMode, setEditingMode] = createSignal(editorPrefs.get(MODE_PREF) as EditingMode)

/****************
 * ### `<ModeButtons>`
 * Run | Edit | Debug, a group of buttons in the top bar:  the one showing is pressed.
 * - `current`:  the mode the page is in, e.g. `"run"` on the run page.
 ****************/
export function ModeButtons(props: { current: Mode }): JSX.Element {
  return (
    <ui-item class="ModeButtons">
      <ui-buttons size="small">
        <For each={MODES}>
          {(mode) => (
            <ui-button
              icon={MODE_LOOKS[mode].icon}
              active={props.current === mode}
              aria-pressed={props.current === mode ? "true" : "false"}
              onClick={() => EditorMode.show(mode)}
            >
              {appTexts.text(MODE_LOOKS[mode].text)}
            </ui-button>
          )}
        </For>
      </ui-buttons>
    </ui-item>
  )
}
