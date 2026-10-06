import { E, UIT } from "$/ui/core"
import { toastVocabulary } from "./ui-toast.vocabulary.en"
import {
  ACTIONS,
  COMPACT,
  ERROR,
  FLOATING,
  HIDE_EVENT,
  TOAST_BOX,
  UNCLICKABLE,
  type Vocabulary
} from "./ui-toast.types"

/****************
 * ### `ToastFallback`
 * The element's markup, plain DOM:  `<div part="box" class="floating toast-box">` around `<div part="toast"
 * class="ui ... toast" role="status|alert">` with the content block (`header` / `message` shorthands, the slot),
 * a working close button and the `actions` slot -- so the message still shows, is announced and can be closed.
 * - `display-time` (a number) still closes it:  `hidden` on the host, then `ui-hide`, as the close button does.
 ****************/
export class ToastFallback extends E.NativeFallback<Vocabulary> {
  @E.proto static vocabulary = toastVocabulary
  @E.proto static degraded = [
    "entry / exit animations, invoker commands (`--close`), `ui-show`, the cancelable `ui-close`, `ui-approve` / `ui-deny`",
    'pausing the countdown, the progress bar, `display-time="auto"`, `close-on-click`, Escape, action buttons closing it',
    "icon glyph and the close glyph (a `×` stands in), translated `close` label (English only), action layouts"
  ]

  /** Pending countdown. */
  private timer?: ReturnType<typeof setTimeout>

  protected override build() {
    const header = this.attr("header")
    const message = this.attr("message")
    const content = this.create("div", { class: UIT.CONTENT, part: UIT.CONTENT })
    if (header) content.append(this.create("div", { class: UIT.HEADER, part: UIT.HEADER }, header))
    if (message) content.append(this.create("div", { class: UIT.MESSAGE, part: UIT.MESSAGE }, message))
    content.append(this.slot())
    const role = this.attr("type") === ERROR ? UIT.ALERT : UIT.STATUS
    const toast = this.create("div", { class: this.classes(), part: TOAST_PART, role }, content)
    if (this.flag("closable")) toast.append(this.closeButton())
    if (this.host.querySelector(`:scope > [slot="${ACTIONS}"]`)) {
      toast.append(this.create("div", { class: ACTIONS, part: ACTIONS }, this.create("slot", { name: ACTIONS })))
    }
    const box = this.create("div", { class: [FLOATING, TOAST_BOX, COMPACT, UNCLICKABLE].join(" ") }, toast)
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
    this.host.dispatchEvent(new CustomEvent(HIDE_EVENT, { bubbles: true, composed: true, detail }))
  }

  /** The close button. */
  private closeButton(): HTMLButtonElement {
    const label = this.vocabulary.texts.find(({ key }) => key === UIT.CLOSE)!.text
    const attributes = { type: "button", class: UIT.CLOSE_CLASS, part: UIT.CLOSE, "aria-label": label }
    const button = this.create("button", attributes, UIT.CLOSE_TEXT)
    this.listen(button, "click", () => this.hide())
    return button
  }
}

/** Part of the toast inside the box, from the vocabulary (`decorate()` would copy the host's ARIA onto it). */
const TOAST_PART: E.PartNameOf<Vocabulary> = "toast"
