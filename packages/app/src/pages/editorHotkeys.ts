import { onSettled } from "solid-js"

import { editor } from "$/app/editor"

/**
 * The editor page's keyboard shortcuts, OUTSIDE Monaco:  ONE `keydown` listener on `document`, added once the
 * page is drawn and removed with it.
 * - Call in `<SpellEditor>`'s body.
 * - Inside Monaco its own commands run them (`editor.onInputDidMount()` adds the same keys):  this listener
 *   leaves alone a key typed into an editable field (Monaco's included) or already handled (`defaultPrevented`),
 *   so one press never runs twice.
 * - "Mod" is Command on a Mac, Control elsewhere -- either works on both.
 */
export function editorHotkeys(): void {
  onSettled(() => {
    document.addEventListener("keydown", onEditorKeyDown)
    return () => document.removeEventListener("keydown", onEditorKeyDown)
  })
}

/** One shortcut:  the key, with Mod (and Shift if `shift`), runs `run()`. */
type Hotkey = {
  /** `KeyboardEvent.key`, lower case for letters. */
  key: string
  /** Shift held too. */
  shift?: boolean
  /** What it does. */
  run: () => unknown
}

/**
 * The editor page's shortcuts, all with Mod:
 * - `Mod+S` saves the file
 * - `Mod+Shift+R` reloads it from the server
 * - `Mod+Enter` compiles and runs the program
 * - `Mod+N` makes a new file
 */
export const EDITOR_HOTKEYS: readonly Hotkey[] = [
  { key: "s", run: () => editor.saveFile() },
  { key: "r", shift: true, run: () => editor.reloadFile() },
  { key: "enter", run: () => editor.compileApp() },
  { key: "n", run: () => editor.createFile() }
]

/**
 * `keydown` on the editor page:  run the `EDITOR_HOTKEYS` entry it matches, and keep the browser's own meaning
 * (save page, reload, new window) from running too.
 * - NOTE: React's `react-hotkeys-hook` spelled reload `"shift-command+r"` (a `-`, not a `+`), which never matched
 *   (`hotkeys-js` took `shift-command` as one unknown modifier):  the browser reloaded the page instead.  Now
 *   `Mod+Shift+R` reloads the FILE, as Monaco's command does.
 */
export function onEditorKeyDown(event: KeyboardEvent): void {
  if (event.defaultPrevented || !(event.metaKey || event.ctrlKey) || event.altKey || isEditable(event)) return
  const key = event.key.toLowerCase()
  const hotkey = EDITOR_HOTKEYS.find((entry) => entry.key === key && !!entry.shift === event.shiftKey)
  if (!hotkey) return
  event.preventDefault()
  void hotkey.run()
}

/** Was `event` typed into something editable:  a field, a `contenteditable`, or Monaco? */
function isEditable(event: KeyboardEvent): boolean {
  const target = event.composedPath()[0]
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || target.matches("input, textarea, select") || !!target.closest(".monaco-editor")
}
