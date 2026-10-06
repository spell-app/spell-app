import { E, UIT } from "$/ui/core"
import { messageVocabulary } from "./ui-message.vocabulary.en"

/****************
 * ### `MessageFallback`
 * The element's markup, plain DOM:  `<div part="message" class="ui ... message">` with the icon box (a slotted
 * icon only), `<div class="content">` around the `header` shorthand and the slot, and a working close button.
 * - The close button still dispatches the cancelable `ui-dismiss` and hides the host, so dismissing works.
 ****************/
export class MessageFallback extends E.NativeFallback<Vocabulary> {
  @E.proto static vocabulary = messageVocabulary
  @E.proto static degraded = [
    "`icon` shorthand glyph and the close button's glyph (a `×` stands in)",
    "translated `dismiss` label (English only)"
  ]

  protected override build() {
    const hasIcon = this.host.querySelector(`:scope > [slot="${UIT.ICON}"]`) !== null
    const header = this.attr("header")
    const content = this.create("div", { class: UIT.CONTENT, part: UIT.CONTENT })
    if (header) content.append(this.create("div", { class: UIT.HEADER, part: UIT.HEADER }, header))
    content.append(this.slot())
    const message = this.create("div", { class: this.classes(hasIcon ? UIT.ICON_CLASS : undefined) })
    if (hasIcon) {
      const slot = this.create("slot", { name: UIT.ICON })
      message.append(this.create("span", { class: UIT.ICON, part: UIT.ICON }, slot))
    }
    message.append(content)
    if (this.flag("dismissible")) message.append(this.closeButton())
    return [this.decorate(message, "message")]
  }

  /** The close button:  `ui-dismiss`, then `hidden` unless cancelled. */
  private closeButton(): HTMLButtonElement {
    const label = this.vocabulary.texts.find(({ key }) => key === DISMISS)!.text
    const attributes = { type: "button", class: UIT.CLOSE_CLASS, part: UIT.CLOSE, "aria-label": label }
    const button = this.create("button", attributes, UIT.CLOSE_TEXT)
    this.listen<MouseEvent>(button, UIT.CLICK, (event) => {
      const detail: UIT.MessageDismissDetail = { originalEvent: event }
      const init = { bubbles: true, composed: true, cancelable: true, detail }
      if (this.host.dispatchEvent(new CustomEvent(DISMISS_EVENT, init))) this.host.hidden = true
    })
    return button
  }
}

/** Vocabulary type, for brevity. */
type Vocabulary = typeof messageVocabulary

/** Text key of the close button's label. */
const DISMISS = "dismiss"

/** Event the close button dispatches, checked against the vocabulary. */
const DISMISS_EVENT: E.EventName<Vocabulary> = "ui-dismiss"
