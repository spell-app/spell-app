import { E, UIT } from "$/ui/core"
import { nagVocabulary } from "./ui-nag.vocabulary.en"
import { HIDE_EVENT, type Vocabulary } from "./ui-nag.types"

/****************
 * ### `NagFallback`
 * The element's markup, plain DOM:  `<div part="nag" class="ui ... nag">` around the slot, with a working close
 * button -- so the nag still shows and still closes (`hidden` on the host, then `ui-hide`).
 ****************/
export class NagFallback extends E.NativeFallback<Vocabulary> {
  @E.proto static vocabulary = nagVocabulary
  @E.proto static degraded = [
    "remembering the dismissal (`key`, `storage`):  a dismissed nag shows again on the next page",
    "`display-time`, animations, `ui-show`, the cancelable `ui-close`",
    "the close glyph (a `×` stands in), translated `close` label (English only)"
  ]

  protected override build() {
    const nag = this.create("div", { class: this.classes() }, this.slot())
    // `closable` defaults on:  only a written `closable="false"` drops the button
    if (this.attr("closable") === null || this.flag("closable")) nag.append(this.closeButton())
    return [this.decorate(nag, "nag")]
  }

  /** The close button:  `hidden` on the host, then `ui-hide`. */
  private closeButton(): HTMLButtonElement {
    const label = this.vocabulary.texts.find(({ key }) => key === UIT.CLOSE)!.text
    const attributes = { type: "button", class: UIT.CLOSE_CLASS, part: UIT.CLOSE, "aria-label": label }
    const button = this.create("button", attributes, UIT.CLOSE_TEXT)
    this.listen(button, UIT.CLICK, () => {
      this.host.hidden = true
      const detail: UIT.NagCloseDetail = { reason: "close" }
      this.host.dispatchEvent(new CustomEvent(HIDE_EVENT, { bubbles: true, composed: true, detail }))
    })
    return button
  }
}
