import { NativeFallback, proto, UIT } from "$/ui/core"

import { nagVocabulary } from "./ui-nag.vocabulary.en"
import { HIDE } from "./ui-nag.types"

/****************
 * ### `NagFallback`
 * The element's markup, plain DOM:  `<div part="nag" class="ui ... nag">` around the slot, with a working close
 * button -- so the nag still shows and still closes (`hidden` on the host, then `ui-hide`).
 ****************/
export class NagFallback extends NativeFallback<typeof nagVocabulary> {
  @proto static vocabulary = nagVocabulary
  @proto static degraded = [
    "remembering the dismissal (`key`, `storage`):  a dismissed nag shows again on the next page",
    "`display-time`, animations, `ui-show`, the cancelable `ui-close`",
    "the close glyph (a `×` stands in), translated `close` label (English only)"
  ]

  protected override build() {
    const nag = this.create("div", { class: this.classes() }, this.slot())
    const closable = this.host.getAttribute("closable")
    if (closable === null || this.flag("closable")) nag.append(this.closeButton())
    return [this.decorate(nag, "nag")]
  }

  /** The close button:  `hidden` on the host, then `ui-hide`. */
  private closeButton(): HTMLButtonElement {
    const label = this.vocabulary.texts.find(({ key }) => key === "close")!.text
    const button = this.create(
      "button",
      { type: "button", class: "close icon", part: "close", "aria-label": label },
      "×"
    )
    this.listen(button, "click", () => {
      this.host.hidden = true
      const detail: UIT.NagCloseDetail = { reason: "close" }
      this.host.dispatchEvent(new CustomEvent(HIDE, { bubbles: true, composed: true, detail }))
    })
    return button
  }
}
