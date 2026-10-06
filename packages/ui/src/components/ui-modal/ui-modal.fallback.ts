import { E, UIT } from "$/ui/core"
import { modalVocabulary } from "./ui-modal.vocabulary.en"
import {
  APPROVE_EVENT,
  ARIA_LABELLEDBY,
  CLOSABLE,
  CLOSEDBY,
  DENY_EVENT,
  DialogActions,
  HIDE_EVENT,
  OPEN,
  type DialogAttributeName,
  type Vocabulary
} from "./ui-modal.types"

/****************
 * ### `ModalFallback`
 * The element's markup on a NATIVE `<dialog>`, plain DOM:  `<dialog part="modal" class="ui ... modal">` with the
 * `header` / `content` shorthands, the slot and a close button, shown with `showModal()` while the host has
 * `open` -- so a modal still opens, traps focus, dims the page and closes on Escape.
 * - Follows the host's `open` attribute (a `MutationObserver`), with the `active` class;  any close (Escape, the
 *   close button, an approve / deny click) removes it again.
 * - Approve / deny elements still fire the cancelable `ui-approve` / `ui-deny` before closing.
 * - Generic over the dialog vocabulary, as `DialogElement` is:  `FlyoutFallback` extends it with the flyout's
 *   vocabulary and `rootPart` -- the same dialog, a flyout's classes.
 ****************/
export class ModalFallback<V extends E.ComponentVocabulary = Vocabulary> extends E.NativeFallback<V> {
  // typed wide, so a subclass's vocabulary (the flyout's) fits the static side
  @E.proto static vocabulary: E.ComponentVocabulary = modalVocabulary
  @E.proto static rootPart = "modal"
  @E.proto static degraded = [
    "`ui-open` / `ui-close` (no veto), `ui-show`, invoker commands;  `ui-hide` fires at once, without a transition",
    "`closedby` (the browser's own Escape handling;  no dimmer clicks), page scroll lock, the overlay stack",
    "close icon glyph (a `×` stands in), translated `close` label (English only), a slotted header naming it"
  ]

  /** Part name of the `<dialog>`, e.g. `modal`. */
  declare rootPart: E.PartNameOf<V>

  /** The dialog. */
  private dialog?: HTMLDialogElement

  /** Watches the host's `open`. */
  private observer?: MutationObserver

  protected override build() {
    const header = this.dialogAttr("header")
    const content = this.dialogAttr("content")
    const dialog = this.create("dialog", { class: this.classes() })
    if (header) {
      const id = `${this.host.id || `ui-${this.vocabulary.noun}`}-fallback-header`
      dialog.append(this.create("div", { id, class: UIT.HEADER, part: UIT.HEADER }, header))
      dialog.setAttribute(ARIA_LABELLEDBY, id)
    }
    if (content) dialog.append(this.create("div", { class: UIT.CONTENT, part: UIT.CONTENT }, content))
    dialog.append(this.slot())
    const isClosable = this.flag(CLOSABLE as E.AttributeNameOf<V>)
    if (isClosable) dialog.append(this.closeButton())
    this.listen<MouseEvent>(dialog, UIT.CLICK, (event) => this.onClick(event))
    this.listen(dialog, CLOSE_EVENT, () => this.onClosed())
    // `closable="false"` (Fomantic's `closable: false`) with no explicit `closedby`:  Escape does nothing
    if (this.dialogAttr(CLOSABLE) !== undefined && !isClosable && this.dialogAttr(CLOSEDBY) === undefined) {
      this.listen(dialog, CANCEL_EVENT, (event) => event.preventDefault())
    }
    this.dialog = this.decorate(dialog, this.rootPart)
    return [this.dialog]
  }

  protected override attached() {
    this.sync()
    this.observer = new MutationObserver(() => this.sync())
    this.observer.observe(this.host, { attributeFilter: [OPEN] })
  }

  override dispose() {
    this.observer?.disconnect()
    if (this.dialog?.open) this.dialog.close()
    super.dispose()
  }

  /** One of the attributes every dialog vocabulary names (`DialogAttributes`), or `undefined` when absent. */
  private dialogAttr(name: DialogAttributeName): string | undefined {
    return this.attr(name as E.AttributeNameOf<V>)
  }

  /** Show or close the dialog as the host's `open` says. */
  private sync() {
    const dialog = this.dialog
    if (!dialog?.isConnected) return
    const isOpen = E.Converters.boolean(this.dialogAttr(OPEN), OPEN)
    dialog.classList.toggle(this.openClass(), isOpen)
    if (isOpen && !dialog.open) dialog.showModal()
    else if (!isOpen && dialog.open) dialog.close()
  }

  /** The dialog closed (Escape, a button):  drop `open`, tell the page. */
  private onClosed() {
    this.dialog?.classList.remove(this.openClass())
    if (this.host.hasAttribute(OPEN)) this.host.removeAttribute(OPEN)
    const detail: UIT.ModalOpenDetail = { open: false }
    this.host.dispatchEvent(new CustomEvent(HIDE_EVENT, { bubbles: true, composed: true, detail }))
  }

  /** Approve / deny:  the cancelable event, then close. */
  private onClick(event: MouseEvent) {
    const found = DialogActions.actionFor(event, this.host)
    if (!found) return
    const [kind, action] = found
    const detail: UIT.ModalActionDetail = { action, originalEvent: event }
    const init = { bubbles: true, composed: true, cancelable: true, detail }
    const name = kind === "approve" ? APPROVE_EVENT : DENY_EVENT
    if (this.host.dispatchEvent(new CustomEvent(name, init))) this.dialog?.close()
  }

  /** Class word of `open` (`active` on a modal, `visible` on a flyout):  the vocabulary's `key`. */
  private openClass(): string {
    const spec = this.vocabulary.attributes.find(({ name }) => name === OPEN) as { key?: string } | undefined
    return spec?.key ?? OPEN
  }

  /** The close button:  closes the dialog. */
  private closeButton(): HTMLButtonElement {
    const label = this.vocabulary.texts.find(({ key }) => key === UIT.CLOSE)!.text
    const attributes = { type: "button", class: UIT.CLOSE_CLASS, part: UIT.CLOSE, "aria-label": label }
    const button = this.create("button", attributes, UIT.CLOSE_TEXT)
    this.listen(button, UIT.CLICK, () => this.dialog?.close())
    return button
  }
}

/** The `<dialog>`'s event once it has closed, however. */
const CLOSE_EVENT = "close"

/** The `<dialog>`'s event before Escape closes it. */
const CANCEL_EVENT = "cancel"
