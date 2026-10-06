import { Converters, NativeFallback, proto, type PartNameOf, UIT } from "$/ui/core"

import { modalVocabulary } from "./ui-modal.vocabulary.en"
import { OPEN, CLOSEDBY, APPROVE_EVENT_NAME, DENY_EVENT_NAME, HIDE_EVENT_NAME } from "./ui-modal.types"

/****************
 * ### `ModalFallback`
 * The element's markup on a NATIVE `<dialog>`, plain DOM:  `<dialog part="modal" class="ui ... modal">` with the
 * `header` / `content` shorthands, the slot and a close button, shown with `showModal()` while the host has
 * `open` -- so a modal still opens, traps focus, dims the page and closes on Escape.
 * - Follows the host's `open` attribute (a `MutationObserver`), with the `active` class;  any close (Escape, the
 *   close button, an approve / deny click) removes it again.
 * - Approve / deny elements still fire the cancelable `ui-approve` / `ui-deny` before closing.
 * - `FlyoutFallback` extends it with its own vocabulary and `rootPart`:  the same dialog, a flyout's classes.
 ****************/
export class ModalFallback extends NativeFallback<typeof modalVocabulary> {
  /** Part name of the `<dialog>`, e.g. `modal`. */
  declare rootPart: string

  @proto static vocabulary = modalVocabulary
  @proto static rootPart = "modal"
  @proto static degraded = [
    "`ui-open` / `ui-close` (no veto), `ui-show`, invoker commands;  `ui-hide` fires at once, without a transition",
    "`closedby` (the browser's own Escape handling;  no dimmer clicks), page scroll lock, the overlay stack",
    "close icon glyph (a `×` stands in), translated `close` label (English only), a slotted header naming it"
  ]

  /** The dialog. */
  private dialog?: HTMLDialogElement

  /** Watches the host's `open`. */
  private observer?: MutationObserver

  protected override build() {
    const header = this.attr("header")
    const content = this.attr("content")
    const dialog = this.create("dialog", { class: this.classes() })
    if (header) {
      const id = `${this.host.id || `ui-${this.vocabulary.noun}`}-fallback-header`
      dialog.append(this.create("div", { id, class: "header", part: "header" }, header))
      dialog.setAttribute("aria-labelledby", id)
    }
    if (content) dialog.append(this.create("div", { class: "content", part: "content" }, content))
    dialog.append(this.slot())
    if (this.flag("closable")) dialog.append(this.closeButton())
    this.listen<MouseEvent>(dialog, "click", (event) => this.onClick(event))
    this.listen(dialog, "close", () => this.onClosed())
    // `closable="false"` (Fomantic's `closable: false`) with no explicit `closedby`:  Escape does nothing
    if (this.attr("closable") !== null && !this.flag("closable") && this.attr(CLOSEDBY) === null) {
      this.listen(dialog, "cancel", (event) => event.preventDefault())
    }
    // a cast:  a `FlyoutFallback`'s vocabulary, so its `rootPart`, is typed as the modal's
    this.dialog = this.decorate(dialog, this.rootPart as PartNameOf<typeof modalVocabulary>)
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

  /** Show or close the dialog as the host's `open` says. */
  private sync() {
    const dialog = this.dialog
    if (!dialog?.isConnected) return
    const open = Converters.boolean(this.host.getAttribute(OPEN), OPEN)
    dialog.classList.toggle(this.openClass(), open)
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }

  /** The dialog closed (Escape, a button):  drop `open`, tell the page. */
  private onClosed() {
    this.dialog?.classList.remove(this.openClass())
    if (this.host.hasAttribute(OPEN)) this.host.removeAttribute(OPEN)
    const detail: UIT.ModalOpenDetail = { open: false }
    this.host.dispatchEvent(new CustomEvent(HIDE_EVENT_NAME, { bubbles: true, composed: true, detail }))
  }

  /** Approve / deny:  the cancelable event, then close. */
  private onClick(event: MouseEvent) {
    const scope = this.host.getRootNode()
    for (const target of event.composedPath()) {
      if (target === this.host) return
      if (!(target instanceof Element) || target.getRootNode() !== scope) continue
      const kind = target.matches(UIT.MODAL_ACTION_SELECTORS.approve)
        ? APPROVE_EVENT_NAME
        : target.matches(UIT.MODAL_ACTION_SELECTORS.deny)
          ? DENY_EVENT_NAME
          : undefined
      if (!kind) continue
      const detail: UIT.ModalActionDetail = { action: target, originalEvent: event }
      const init = { bubbles: true, composed: true, cancelable: true, detail }
      if (this.host.dispatchEvent(new CustomEvent(kind, init))) this.dialog?.close()
      return
    }
  }

  /** Class word of `open` (`active` on a modal, `visible` on a flyout):  the vocabulary's `key`. */
  private openClass(): string {
    const spec = this.vocabulary.attributes.find(({ name }) => name === OPEN) as { key?: string } | undefined
    return spec?.key ?? OPEN
  }

  /** The close button. */
  private closeButton(): HTMLButtonElement {
    const label = this.vocabulary.texts.find(({ key }) => key === "close")!.text
    const button = this.create(
      "button",
      { type: "button", class: "close icon", part: "close", "aria-label": label },
      "×"
    )
    this.listen(button, "click", () => this.dialog?.close())
    return button
  }
}
