import { NativeFallback, PartContext, proto } from "$/ui/core"

import { PART_VOCABULARIES } from "./ui-parts.types"
import { headerVocabulary } from "./ui-header.vocabulary.en"

/****************
 * ### `ContentPartFallback`
 * Any generic content part:  `<div class="<noun>" part="<noun>"><slot></slot></div>`, one class for all 13.
 * - The noun comes from the host's tag (`PART_VOCABULARIES`), so no per-part class is needed.
 * - Standalone `<ui-header>` is Fomantic's `<div class="ui ... header">`:  `<h1>` ... `<h6>` by `level`, `<a>`
 *   with `href`.  An OWNED header (in a card, another header ...) is the bare `header` class, with
 *   `role="heading"` + `aria-level` for a `level`.
 * - Owned or not:  the page-wide owner registry (`PartContext.ownerFor()`), so every DEFINED owner counts -- card,
 *   Items view item, message, list, menu, modal, popup, another header ... -- with the element's barriers.
 ****************/
export class ContentPartFallback extends NativeFallback {
  @proto static vocabularies = PART_VOCABULARIES
  @proto static degraded = ["owner-context states (`:state(in-card)`) that style owned parts"]

  protected override build() {
    const { noun } = this.vocabulary
    const level = this.host.getAttribute("level")
    if (noun !== headerVocabulary.noun)
      return [this.decorate(this.create("div", { class: this.classes() }, this.slot()), noun)]
    const owned = PartContext.ownerFor(this.host, noun)
    if (owned) {
      const header = this.create(
        "div",
        { class: noun, role: level ? "heading" : null, "aria-level": level },
        this.slot()
      )
      return [this.decorate(header, noun)]
    }
    const href = this.host.getAttribute("href")
    const tag = href !== null ? "a" : level ? (`h${level}` as "h1") : "div"
    return [this.decorate(this.create(tag, { class: this.classes(), href }, this.slot()), noun)]
  }
}
