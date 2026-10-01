import { NativeFallback, PART_STATIC_CLASS_PREFIX, proto, type NativeFallbackRoot } from "$/ui/core"

import { cardVocabulary, cardsVocabulary } from "./card.vocabulary.en"

/** Either vocabulary, for brevity. */
type Vocabulary = typeof cardVocabulary | typeof cardsVocabulary

/****************
 * ### `CardFallback`
 * A card or a group of cards without Solid, keyed by the host's tag -- one class for both, as they share
 * `card.css`.
 * - `<ui-cards>`:  `<div class="ui ... cards" part="group" role="list"><slot>`.
 * - `<ui-card>`:  `<article class="ui ... card" part="card">` (`<a href>` with `href`, which `disabled` drops)
 *   holding the `image`, content (`header`, `meta`, `description`) and `extra` shorthands as static parts around
 *   the slot, as the element renders them;  `role=listitem` on the host inside a `<ui-cards>` parent.
 ****************/
export class CardFallback extends NativeFallback<Vocabulary> {
  @proto static degraded = [
    "the group's variations on its cards (`raised cards` doesn't raise a card) and `:state(in-cards)` spacing",
    "a group through translated or slotted parents (only a direct `<ui-cards>` parent counts)",
    "shorthands yielding to slotted parts;  `aria-busy`, the loading announcement"
  ]

  constructor(host: HTMLElement, root: NativeFallbackRoot, error?: unknown, internals?: ElementInternals) {
    super(host, root, error, internals)
    // Shadows the prototype's placeholder vocabulary, see `@proto`.
    this.vocabulary = host.localName === cardsVocabulary.tag ? cardsVocabulary : cardVocabulary
  }

  protected override build() {
    if (this.vocabulary === cardsVocabulary) {
      return [this.decorate(this.create("div", { class: this.classes(), role: LIST }, this.slot()), "group")]
    }
    if (this.internals && this.host.parentElement?.localName === cardsVocabulary.tag) this.internals.role = LISTITEM
    const href = this.attr("href")
    const disabled = this.flag("disabled")
    const card =
      href === null
        ? this.create("article", { class: this.classes() })
        : this.create("a", {
            class: this.classes(),
            href: disabled ? null : href,
            target: this.attr("target"),
            "aria-disabled": disabled ? TRUE : null
          })
    const image = this.attr("image")
    if (image)
      card.append(this.create("div", { class: IMAGE }, this.create("img", { src: image, alt: this.attr("alt") ?? "" })))
    const blocks = CONTENT_NOUNS.filter((noun) => this.attr(noun)).map((noun) => this.part(noun, this.attr(noun)!))
    if (blocks.length) card.append(this.create("div", { class: this.staticClass(CONTENT) }, ...blocks))
    card.append(this.slot())
    const extra = this.attr("extra")
    if (extra) card.append(this.part("extra", extra))
    return [this.decorate(card, "card")]
  }

  /** A shorthand's static part:  `<div class="<noun> in-card">text</div>`. */
  private part(noun: string, text: string): HTMLDivElement {
    return this.create("div", { class: this.staticClass(noun) }, text)
  }

  /** `<noun> in-card`. */
  private staticClass(noun: string): string {
    return `${noun} ${PART_STATIC_CLASS_PREFIX}${cardVocabulary.noun}`
  }
}

/** Shorthands of the content block, in order. */
const CONTENT_NOUNS = ["header", "meta", "description"] as const

/** Classes of the shorthand boxes. */
const IMAGE = "image"
const CONTENT = "content"

/** Group root role;  host role of a card in a group. */
const LIST = "list"
const LISTITEM = "listitem"

/** ARIA boolean. */
const TRUE = "true"
