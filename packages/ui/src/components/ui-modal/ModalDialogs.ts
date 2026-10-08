import { E, UI, UIT } from "$/ui/core"
import { modalVocabulary } from "./UIModal.vocabulary.en"
import { CLOSEDBY, type Vocabulary } from "./UIModal.types"

/****************
 * ### `ModalDialogs`
 * The dialogs behind `UI.modals.confirm()` / `alert()` / `prompt()` (Fomantic's `$.modal('confirm', …)`):
 * a `<ui-modal>` built for the call, appended to `<body>`, opened, and removed once hidden.
 *
 * - Markup:  `<ui-modal size="tiny" closedby="closerequest" header="title">` holding
 *   - a `<ui-content>`:  the message as a `<p>`, or for `prompt()` a `<label>` around it and an `<input>`
 *   - `<ui-actions>`:  a deny button (`cancel`, first:  it takes the initial focus, the least destructive choice)
 *     and a primary approve button.
 * - Escape denies (`closedby="closerequest"`:  no dimmer clicks, so a stray click can't answer).
 * - The promise settles once the modal is HIDDEN (`ui-hide`), so a caller can open the next dialog straight away.
 * - Button texts:  `okText` / `cancelText`, else the translated `ok` / `cancel` texts (`UI.i18n`).
 * - Everything is light DOM built with `createElement` / `textContent`:  never `innerHTML` with caller text.
 * - Other families' tags (`<ui-content>`, `<ui-actions>`, `<ui-button>`) are looked up at CALL time,
 *   by class noun, in the vocabulary registry (`UI.vocabulary`):
 *   importing their vocabulary files would reach into other families' files, which `AGENTS.md` keeps behind
 *   `$/ui/core`.  The family barrel imports `parts` and `button`, so both are defined before any dialog opens.
 * - Registered by the family barrel as `UI.modals`' provider;  the runtime never imports it.
 ****************/
export class ModalDialogs implements E.ModalProvider {
  /** Page the dialogs are made in;  a test passes its own. */
  readonly document: Document

  constructor({ document = globalThis.document }: ModalDialogsProps = {}) {
    this.document = document
  }

  /** Ask a yes / no question:  resolves `true` on approve, `false` on deny or Escape. */
  confirm(options: E.ModalOptions): Promise<boolean> {
    return this.run(options, { canDeny: true }, (isApproved) => isApproved)
  }

  /** Tell `options.message`:  resolves once the dialog has hidden, however it closed. */
  alert(options: E.ModalOptions): Promise<void> {
    return this.run(options, { canDeny: false }, () => undefined)
  }

  /** Ask for one line of text:  resolves with it on approve, `undefined` on deny or Escape. */
  prompt(options: E.ModalOptions): Promise<string | undefined> {
    return this.run(options, { canDeny: true, input: options.value ?? "" }, (isApproved, value) =>
      isApproved ? value : undefined
    )
  }

  /**
   * Build, open and await one dialog;  `result()` turns "approved?" and the input's value into the answer.
   * - SIDE EFFECT:  a `<ui-modal>` in `<body>` until it has hidden.
   * - Throws when the parts or `<ui-button>` aren't registered (`tagFor()`).
   */
  private run<T>(
    options: E.ModalOptions,
    { canDeny, input }: { canDeny: boolean; input?: string },
    result: (isApproved: boolean, value: string) => T
  ): Promise<T> {
    const modal = this.document.createElement(modalVocabulary.tag) as HTMLElement & { open: boolean }
    modal.setAttribute(SIZE, TINY)
    modal.setAttribute(CLOSEDBY, CLOSEREQUEST)
    if (options.title) modal.setAttribute(UIT.HEADER, options.title)
    else modal.setAttribute(UIT.ARIA_LABEL, options.message)
    const content = this.document.createElement(ModalDialogs.tagFor(UIT.CONTENT))
    const field = input === undefined ? undefined : this.input(input)
    content.append(field ? this.label(options.message, field) : this.paragraph(options.message))
    const actions = this.document.createElement(ModalDialogs.tagFor(ACTIONS))
    if (canDeny) actions.append(this.button(options.cancelText ?? UI.i18n.t(CANCEL), CANCEL))
    const approve = this.button(options.okText ?? UI.i18n.t(OK), APPROVE_CLASS)
    approve.setAttribute(PRIMARY, "")
    actions.append(approve)
    modal.append(content, actions)
    field?.addEventListener("keydown", (event) => {
      if (event.key === UIT.Key.enter) approve.click()
    })
    this.document.body.append(modal)
    modal.open = true
    return new Promise<T>((resolve) => {
      let isApproved = false
      modal.addEventListener(APPROVE_EVENT, () => (isApproved = true))
      modal.addEventListener(
        HIDE_EVENT,
        () => {
          modal.remove()
          resolve(result(isApproved, field?.value ?? ""))
        },
        { once: true }
      )
    })
  }

  /** The message as a paragraph. */
  private paragraph(message: string): HTMLParagraphElement {
    const paragraph = this.document.createElement("p")
    paragraph.textContent = message
    return paragraph
  }

  /** `prompt()`'s text input, focused when the dialog opens. */
  private input(value: string): HTMLInputElement {
    const input = this.document.createElement("input")
    input.type = "text"
    input.value = value
    input.autofocus = true
    return input
  }

  /** The message as the input's `<label>`, in the opt-in native look (`native.css`). */
  private label(message: string, input: HTMLInputElement): HTMLLabelElement {
    const label = this.document.createElement("label")
    label.className = NATIVE_LOOK
    label.style.cssText = LABEL_LAYOUT
    label.append(message, input)
    return label
  }

  /** A `<ui-button>` with Fomantic's action class (`approve` / `cancel`). */
  private button(text: string, actionClass: string): HTMLElement {
    const button = this.document.createElement(ModalDialogs.tagFor(UIT.BUTTON))
    button.className = actionClass
    button.textContent = text
    return button
  }

  /**
   * Canonical tag of the registered component whose class noun is `noun` (`button` => `ui-button`).
   * - Throws when none is registered:  a dialog built from undefined elements would look right and not work.
   * - Static:  it reads only the page-wide vocabulary registry.
   */
  private static tagFor(noun: string): string {
    for (const vocabulary of UI.vocabulary.vocabularies.values()) if (vocabulary.noun === noun) return vocabulary.tag
    throw new Error(
      `UI.modals:  no component with the class noun "${noun}" is registered;  ` +
        `import its family (\`$/ui/components/ui-parts\`, \`ui-button\`) before opening a dialog`
    )
  }
}

/** Constructor props for `ModalDialogs`. */
export type ModalDialogsProps = {
  /** page to build in.  Default:  the global `document`. */
  document?: Document
}

/** An approve element was activated:  the dialog answers yes. */
const APPROVE_EVENT: E.EventName<Vocabulary> = "ui-approve"

/** Hidden:  the call settles. */
const HIDE_EVENT: E.EventName<Vocabulary> = "ui-hide"

/** `<ui-modal>` width attribute (canonical name). */
const SIZE = "size"

/** The dialogs' width. */
const TINY = "tiny"

/** `closedby` of the dialogs:  Escape only, so a stray click on the dimmer can't answer. */
const CLOSEREQUEST = "closerequest"

/** Class noun of the actions part (`<ui-actions>`). */
const ACTIONS = "actions"

/** `<ui-button>` attribute of the approve button. */
const PRIMARY = "primary"

/** Fomantic's approve class of a button. */
const APPROVE_CLASS = "approve"

/** Fomantic's deny class of a button, and the text key of its label. */
const CANCEL = "cancel"

/** Text key of the approve button's label. */
const OK = "ok"

/** `native.css`'s opt-in class, for the prompt's input. */
const NATIVE_LOOK = "ui-native"

/** The prompt's label:  message above a full-width input. */
const LABEL_LAYOUT = "display: grid; gap: 0.5em"
