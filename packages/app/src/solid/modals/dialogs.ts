import { UI as SpellUI, type ModalOptions } from "$/ui"
import { uiReady } from "$/app/solid/loadUI"
import type { AlertModalProps, ChooserModalProps, ConfirmModalProps, PromptModalProps } from "$/app/solid/modals"

import { openChooser } from "./Chooser"

/**
 * The app's dialogs, behind `editor.alert()` / `confirm()` / `prompt()` / `promptForNumber()` / `choose()`:
 * `@spell-app/ui`'s `UI.modals` for the first four, `<Chooser>` for `choose()`.
 * - Each builds its own `<ui-modal>` in `<body>` and removes it once hidden:  no `editor.modals` stack, no root
 *   component to mount.  Several at once stack in the top layer, newest on top.
 * - Each waits for `uiReady` first:  `UI.modals` throws until `<ui-modal>` has registered its provider.
 * - `editor` reaches these through a DYNAMIC `import()`, so `editor.ts` stays free of Solid and `$/ui`.
 * - Props map onto `UI.modals`' options:  `header` => `title`, `ok` / `cancel` => `okText` / `cancelText`,
 *   `defaultValue` => `value`.
 */

////////////////
// ## Dialogs
////////////////

/** One OK button;  always resolves `undefined`. */
export async function alert(props: string | AlertModalProps): Promise<undefined> {
  const options = modalOptions(props)
  await uiReady
  await SpellUI.modals.alert(options)
  return undefined
}

/** Resolves `true` for OK, `false` for Cancel or Escape. */
export async function confirm(props: string | ConfirmModalProps): Promise<boolean> {
  const options = modalOptions(props)
  await uiReady
  return SpellUI.modals.confirm(options)
}

/**
 * One input field;  resolves its text on OK, `undefined` on Cancel / Escape or when it's empty.
 * - `type` / `inputProps` (which `UI.modals.prompt()` can't take) are set on its input:  see `fitInput()`.
 */
export async function prompt(props: string | PromptModalProps): Promise<string | undefined> {
  const field = asProps(props)
  const options = { ...modalOptions(field), value: field.defaultValue }
  await uiReady
  const answer = SpellUI.modals.prompt(options)
  if (field.type || field.inputProps) fitInput(field)
  const value = await answer
  return value === null || value === "" ? undefined : value
}

/**
 * As `prompt()`, with `type: "number"` and `step: 1` unless given.
 * - Resolves the TEXT, e.g. `"42"`, as its signature always said.
 *   NOTE: the React form resolved a NUMBER once the user had typed (`parseFloat`), against that signature.
 */
export function promptForNumber(props: string | PromptModalProps): Promise<string | undefined> {
  const field = asProps(props)
  return prompt({ type: "number", ...field, inputProps: { step: 1, ...field.inputProps } })
}

/** Resolves the chosen value (an array with `multiple`), or `undefined` on Cancel -- see `<Chooser>`. */
export function choose(props: ChooserModalProps): Promise<unknown> {
  return openChooser(props)
}

////////////////
// ## Helpers
////////////////

/** A bare `message` string as props. */
function asProps<P extends AlertModalProps>(props: string | P): P {
  return (typeof props === "string" ? { message: props } : props) as P
}

/** Our props as `UI.modals`' options. */
function modalOptions(props: string | ConfirmModalProps): ModalOptions {
  const { message, header, ok, cancel } = asProps<ConfirmModalProps>(props)
  return { message, title: header, okText: ok, cancelText: cancel }
}

/**
 * Give the input of the `UI.modals.prompt()` dialog just opened `field.type` and `field.inputProps`, and keep OK
 * from closing it while the input is invalid (e.g. below `min`).
 * - HACK: `UI.modals.prompt()` takes no input type or attributes, so this reaches into the dialog it built:  its
 *   `ModalDialogs` appends the `<ui-modal>` to `<body>` SYNCHRONOUSLY, so it's `<body>`'s last child right after
 *   the call, and its markup (`<ui-content>` > `<label>` > `<input>`) is light DOM.  TODO: input options on
 *   `ModalOptions` in `@spell-app/ui`, then drop this.
 * - Enter in the field clicks OK, so it's gated too.
 */
function fitInput(field: PromptModalProps) {
  const modal = document.body.lastElementChild
  const input = modal?.localName === "ui-modal" ? modal.querySelector("input") : null
  if (!modal || !input) {
    console.warn("editor.prompt():  can't find the dialog's input", field)
    return
  }
  if (field.type) input.type = field.type
  for (const [name, value] of Object.entries(field.inputProps ?? {})) {
    if (value === false || value === null || value === undefined) input.removeAttribute(name)
    else input.setAttribute(name, value === true ? "" : String(value))
  }
  modal.addEventListener("ui-approve", (event) => {
    if (input.checkValidity()) return
    event.preventDefault()
    input.reportValidity()
  })
}
