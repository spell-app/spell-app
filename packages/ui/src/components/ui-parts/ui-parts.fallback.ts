import { E, UIT } from "$/ui/core"
import { headerVocabulary } from "./ui-header.vocabulary.en"
import { HEADING, PartVocabularies } from "./ui-parts.types"

/****************
 * ### `ContentPartFallback`
 * Any generic content part:  `<div class="<noun>" part="<noun>"><slot></slot></div>`, one class for all 13.
 * - The noun comes from the host's tag (`PartVocabularies`), so no per-part class is needed.
 * - Standalone `<ui-header>` is Fomantic's `<div class="ui ... header">`:  `<h1>` ... `<h6>` by `level`, `<a>`
 *   with `href`.  An OWNED header (in a card, another header ...) is the bare `header` class, with
 *   `role="heading"` + `aria-level` for a `level`.
 * - Owned or not:  the page-wide owner registry (`PartContext.ownerFor()`), so every DEFINED owner counts -- card,
 *   Items view item, message, list, menu, modal, popup, another header ... -- with the element's barriers.
 ****************/
export class ContentPartFallback extends E.NativeFallback {
  @E.proto static vocabularies = PartVocabularies
  @E.proto static degraded = ["owner-context states (`:state(in-card)`) that style owned parts"]

  protected override build() {
    const { noun } = this.vocabulary
    const level = this.attr("level")
    if (noun !== headerVocabulary.noun) {
      return [this.decorate(this.create("div", { class: this.classes() }, this.slot()), noun)]
    }
    if (E.PartContext.ownerFor(this.host, noun)) {
      const header = this.create(
        "div",
        { class: noun, role: level ? HEADING : undefined, "aria-level": level },
        this.slot()
      )
      return [this.decorate(header, noun)]
    }
    const href = this.attr("href")
    const tag = href !== undefined ? UIT.ANCHOR_TAG : level ? (`h${level}` as "h1") : "div"
    return [this.decorate(this.create(tag, { class: this.classes(), href }, this.slot()), noun)]
  }
}
