import { NativeFallback, proto, type MessageDismissDetail } from "$/core"

import { messageVocabulary } from "./message.vocabulary.en"

/****************
 * ### `MessageFallback`
 * The element's markup, plain DOM:  `<div part="message" class="ui ... message">` with the icon box (a slotted
 * icon only), `<div class="content">` around the `header` shorthand and the slot, and a working close button.
 * - The close button still dispatches the cancelable `ui-dismiss` and hides the host, so dismissing works.
 ****************/
export class MessageFallback extends NativeFallback<typeof messageVocabulary> {
  @proto static vocabulary = messageVocabulary
  @proto static degraded = [
    "`icon` shorthand glyph and the close button's glyph (a `×` stands in)",
    "translated `dismiss` label (English only)"
  ]

  protected override build() {
    const slotted = this.host.querySelector(`:scope > [slot="icon"]`) !== null
    const header = this.attr("header")
    const content = this.create("div", { class: "content", part: "content" })
    if (header) content.append(this.create("div", { class: "header", part: "header" }, header))
    content.append(this.slot())
    const message = this.create("div", { class: this.classes(slotted ? "icon" : undefined) })
    if (slotted) {
      message.append(this.create("span", { class: "icon", part: "icon" }, this.create("slot", { name: "icon" })))
    }
    message.append(content)
    if (this.flag("dismissible")) message.append(this.closeButton())
    return [this.decorate(message, "message")]
  }

  /** The close button:  `ui-dismiss`, then `hidden` unless cancelled. */
  private closeButton(): HTMLButtonElement {
    const dismiss = this.vocabulary.texts.find(({ key }) => key === "dismiss")!.text
    const button = this.create(
      "button",
      { type: "button", class: "close icon", part: "close", "aria-label": dismiss },
      "×"
    )
    this.listen<MouseEvent>(button, "click", (event) => {
      const detail: MessageDismissDetail = { originalEvent: event }
      const init = { bubbles: true, composed: true, cancelable: true, detail }
      if (this.host.dispatchEvent(new CustomEvent(this.vocabulary.events[0].name, init))) this.host.hidden = true
    })
    return button
  }
}
