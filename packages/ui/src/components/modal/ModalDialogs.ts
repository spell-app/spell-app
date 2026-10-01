import { UI, type ModalOptions, type ModalProvider } from "$/ui/core"

import { modalVocabulary } from "./modal.vocabulary.en"

/****************
 * ### `ModalDialogs`
 * `UI.modals.confirm()` / `alert()` / `prompt()` (Fomantic's `$.modal('confirm', ...)`):  a `<ui-modal>` built for
 * the call, appended to `<body>`, opened, and removed once hidden.
 * - Markup:  `<ui-modal size="tiny" closedby="closerequest" header="title">` holding a `<ui-content>` (the message
 *   as a `<p>`, or for `prompt()` a `<label>` around it and an `<input>`) and `<ui-actions>` with a deny button
 *   (`cancel`, first:  it takes the initial focus, the least destructive choice) and a primary approve button.
 * - Escape denies (`closedby="closerequest"`:  no dimmer clicks, so a stray click can't answer);  the promise
 *   settles once the modal is HIDDEN (`ui-hide`), so a caller can open the next dialog straight away.
 * - Button texts:  `okText` / `cancelText`, else the translated `ok` / `cancel` texts (`UI.i18n`).
 * - Everything is light DOM built with `createElement` / `textContent`:  never `innerHTML` with caller text.
 * - Other families' tags (`<ui-content>`, `<ui-actions>`, `<ui-button>`) are looked up at CALL time in the
 *   vocabulary registry (`UI.vocabulary`), by class noun:  importing their vocabulary files would reach into
 *   other families' leaves, which `AGENTS.md` keeps behind `$/ui/core`.  The family barrel imports `parts` and
 *   `button` for their side effect, so both are registered before any dialog opens.
 ****************/
export class ModalDialogs implements ModalProvider {
  confirm(options: ModalOptions): Promise<boolean> {
    return this.run(options, { deny: true }, (approved) => approved)
  }

  alert(options: ModalOptions): Promise<void> {
    return this.run(options, { deny: false }, () => undefined)
  }

  prompt(options: ModalOptions): Promise<string | null> {
    return this.run(options, { deny: true, input: options.value ?? "" }, (approved, value) => (approved ? value : null))
  }

  /**
   * Build, open and await one dialog;  `result()` turns "approved?" and the input's value into the answer.
   * - SIDE EFFECT:  a `<ui-modal>` in `<body>` until it has hidden.
   */
  private run<T>(
    options: ModalOptions,
    { deny, input }: { deny: boolean; input?: string },
    result: (approved: boolean, value: string) => T
  ): Promise<T> {
    const modal = document.createElement(modalVocabulary.tag) as HTMLElement & { open: boolean }
    modal.setAttribute(SIZE, TINY)
    modal.setAttribute(CLOSEDBY, CLOSEREQUEST)
    if (options.title) modal.setAttribute(HEADER, options.title)
    else modal.setAttribute(ARIA_LABEL, options.message)
    const content = document.createElement(ModalDialogs.tag(CONTENT))
    const field = input === undefined ? undefined : ModalDialogs.input(input)
    content.append(field ? ModalDialogs.label(options.message, field) : ModalDialogs.paragraph(options.message))
    const actions = document.createElement(ModalDialogs.tag(ACTIONS))
    if (deny) actions.append(ModalDialogs.button(options.cancelText ?? UI.i18n.t(CANCEL), CANCEL))
    const approve = ModalDialogs.button(options.okText ?? UI.i18n.t(OK), APPROVE)
    approve.setAttribute(PRIMARY, "")
    actions.append(approve)
    modal.append(content, actions)
    field?.addEventListener("keydown", (event) => {
      if (event.key === ENTER) approve.click()
    })
    document.body.append(modal)
    modal.open = true
    return new Promise<T>((resolve) => {
      let approved = false
      modal.addEventListener(APPROVE_EVENT, () => (approved = true))
      modal.addEventListener(
        HIDE_EVENT,
        () => {
          modal.remove()
          resolve(result(approved, field?.value ?? ""))
        },
        { once: true }
      )
    })
  }

  /**
   * Canonical tag of the registered component whose class noun is `noun` (`button` => `ui-button`).
   * - Throws when none is registered:  a dialog built from undefined elements would look right and not work.
   */
  private static tag(noun: string): string {
    for (const vocabulary of UI.vocabulary.vocabularies.values()) if (vocabulary.noun === noun) return vocabulary.tag
    throw new Error(`UI.modals:  no component with the class noun "${noun}" is registered`)
  }

  /** The message as a paragraph. */
  private static paragraph(message: string): HTMLParagraphElement {
    const paragraph = document.createElement("p")
    paragraph.textContent = message
    return paragraph
  }

  /** `prompt()`'s text input, focused when the dialog opens. */
  private static input(value: string): HTMLInputElement {
    const input = document.createElement("input")
    input.type = "text"
    input.value = value
    input.autofocus = true
    return input
  }

  /** The message as the input's `<label>`, in the opt-in native look (`native.css`). */
  private static label(message: string, input: HTMLInputElement): HTMLLabelElement {
    const label = document.createElement("label")
    label.className = NATIVE_LOOK
    label.style.cssText = LABEL_LAYOUT
    label.append(message, input)
    return label
  }

  /** A `<ui-button>` with Fomantic's action class (`approve` / `cancel`). */
  private static button(text: string, action: string): HTMLElement {
    const button = document.createElement(ModalDialogs.tag(BUTTON))
    button.className = action
    button.textContent = text
    return button
  }
}

/** `<ui-modal>` attributes it sets (canonical names). */
const SIZE = "size"
const TINY = "tiny"
const CLOSEDBY = "closedby"
const CLOSEREQUEST = "closerequest"
const HEADER = "header"
const ARIA_LABEL = "aria-label"

/** Class nouns of the elements a dialog is built from (`UI.vocabulary` lookups, see `tag()`). */
const CONTENT = "content"
const ACTIONS = "actions"
const BUTTON = "button"

/** `<ui-button>` attribute of the approve button. */
const PRIMARY = "primary"

/** Fomantic's action classes (`MODAL_ACTION_SELECTORS`), and the text keys of the same names. */
const APPROVE = "approve"
const CANCEL = "cancel"
const OK = "ok"

/** Events it waits for. */
const APPROVE_EVENT = "ui-approve"
const HIDE_EVENT = "ui-hide"

/** Key that submits a prompt. */
const ENTER = "Enter"

/** `native.css`'s opt-in class, for the prompt's input. */
const NATIVE_LOOK = "ui-native"

/** The prompt's label:  message above a full-width input. */
const LABEL_LAYOUT = "display: grid; gap: 0.5em"
