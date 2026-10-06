import { E, UIT } from "$/ui/core"
import { cardVocabulary } from "./ui-card.vocabulary.en"
import { cardsVocabulary } from "./ui-cards.vocabulary.en"
import { ARTICLE, ContentShorthands, EXTRA } from "./ui-card.types"

/****************
 * ### `CardFallback`
 * A card or a group of cards without Solid, keyed by the host's tag -- one class for both, as they share
 * `ui-card.css`.
 * - `<ui-cards>`:  `<div class="ui ... cards" part="group" role="list"><slot>`.
 * - `<ui-card>`:  `<article class="ui ... card" part="card">` (`<a href>` with `href`, which `disabled` drops)
 *   holding the `image`, content (`header`, `meta`, `description`) and `extra` shorthands as static parts around
 *   the slot, as the element renders them;  `role=listitem` on the host inside a `<ui-cards>` parent.
 ****************/
export class CardFallback extends E.NativeFallback<FallbackVocabulary> {
  @E.proto static vocabularies = [cardVocabulary, cardsVocabulary]
  @E.proto static degraded = [
    "the group's variations on its cards (`raised cards` doesn't raise a card) and `:state(in-cards)` spacing",
    "a group through translated or slotted parents (only a direct `<ui-cards>` parent counts)",
    "shorthands yielding to slotted parts;  `aria-busy`, the loading announcement"
  ]

  protected override build() {
    if (this.vocabulary === cardsVocabulary) {
      return [this.decorate(this.create("div", { class: this.classes(), role: UIT.LIST }, this.slot()), "group")]
    }
    if (this.internals && this.host.parentElement?.localName === cardsVocabulary.tag) this.internals.role = UIT.LISTITEM
    const href = this.attr("href")
    const isDisabled = this.flag("disabled")
    const card =
      href === undefined
        ? this.create(ARTICLE, { class: this.classes() })
        : this.create(UIT.ANCHOR_TAG, {
            class: this.classes(),
            href: isDisabled ? undefined : href,
            target: this.attr("target"),
            "aria-disabled": isDisabled ? UIT.TRUE : undefined
          })
    const image = this.attr("image")
    if (image) {
      card.append(
        this.create("div", { class: UIT.IMAGE }, this.create("img", { src: image, alt: this.attr("alt") ?? "" }))
      )
    }
    const blocks = ContentShorthands.filter((noun) => this.attr(noun)).map((noun) => this.part(noun, this.attr(noun)!))
    if (blocks.length) card.append(this.create("div", { class: this.staticClass(UIT.CONTENT) }, ...blocks))
    card.append(this.slot())
    const extra = this.attr(EXTRA)
    if (extra) card.append(this.part(EXTRA, extra))
    return [this.decorate(card, "card")]
  }

  /** A shorthand's static part:  `<div class="<noun> in-card">text</div>`. */
  private part(noun: string, text: string): HTMLDivElement {
    return this.create("div", { class: this.staticClass(noun) }, text)
  }

  /** `<noun> in-card`. */
  private staticClass(noun: string): string {
    return `${noun} ${UIT.PART_STATIC_CLASS_PREFIX}${cardVocabulary.noun}`
  }
}

/** Either vocabulary:  the fallback serves both tags. */
type FallbackVocabulary = typeof cardVocabulary | typeof cardsVocabulary
