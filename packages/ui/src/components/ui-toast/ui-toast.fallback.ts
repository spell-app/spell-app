import { NativeFallback, proto, UIT } from "$/ui/core"

import { toastVocabulary } from "./ui-toast.vocabulary.en"
import { HIDE } from "./ui-toast.types"

/****************
 * ### `ToastFallback`
 * The element's markup, plain DOM:  `<div part="box" class="floating toast-box">` around `<div part="toast"
 * class="ui ... toast" role="status|alert">` with the content block (`header` / `message` shorthands, the slot),
 * a working close button and the `actions` slot -- so the message still shows, is announced and can be closed.
 * - `display-time` (a number) still closes it:  `hidden` on the host, then `ui-hide`, as the close button does.
 ****************/
export class ToastFallback extends NativeFallback<typeof toastVocabulary> {
  @proto static vocabulary = toastVocabulary
  @proto static degraded = [
    "entry / exit animations, invoker commands (`--close`), `ui-show`, the cancelable `ui-close`, `ui-approve` / `ui-deny`",
    'pausing the countdown, the progress bar, `display-time="auto"`, `close-on-click`, Escape, action buttons closing it',
    "icon glyph and the close glyph (a `×` stands in), translated `close` label (English only), action layouts"
  ]

  /** Pending countdown. */
  private timer?: ReturnType<typeof setTimeout>

  protected override build() {
    const header = this.attr("header")
    const message = this.attr("message")
    const content = this.create("div", { class: "content", part: "content" })
    if (header) content.append(this.create("div", { class: "header", part: "header" }, header))
    if (message) content.append(this.create("div", { class: "message", part: "message" }, message))
    content.append(this.slot())
    const role = this.attr("type") === "error" ? "alert" : "status"
    const toast = this.create("div", { class: this.classes(), part: "toast", role }, content)
    if (this.flag("closable")) toast.append(this.closeButton())
    const actions = this.create("div", { class: "actions", part: "actions" }, this.create("slot", { name: "actions" }))
    if (this.host.querySelector(`:scope > [slot="actions"]`)) toast.append(actions)
    const box = this.create("div", { class: "floating toast-box compact unclickable" }, toast)
    return [this.decorate(box, "box")]
  }

  protected override attached() {
    const time = Number(this.attr("display-time"))
    if (Number.isFinite(time) && time > 0) this.timer = setTimeout(() => this.hide(), time)
  }

  override dispose() {
    clearTimeout(this.timer)
    super.dispose()
  }

  /** Hide the host and say so. */
  private hide() {
    clearTimeout(this.timer)
    if (this.host.hidden) return
    this.host.hidden = true
    const detail: UIT.ToastCloseDetail = { reason: "close" }
    this.host.dispatchEvent(new CustomEvent(HIDE, { bubbles: true, composed: true, detail }))
  }

  /** The close button. */
  private closeButton(): HTMLButtonElement {
    const label = this.vocabulary.texts.find(({ key }) => key === "close")!.text
    const button = this.create(
      "button",
      { type: "button", class: "close icon", part: "close", "aria-label": label },
      "×"
    )
    this.listen(button, "click", () => this.hide())
    return button
  }
}
