import type { JSX } from "@solidjs/web"

import { proto, UIElement, type CardSharedVariation } from "$/core"

import { cardsVocabulary } from "./card.vocabulary.en"
import { CardFallback } from "./card.fallback"

import cardCSS from "./card.css?inline"

/****************
 * ### `<ui-cards>`
 * A group of cards:  `<div class="ui ... cards" part="group" role="list"><slot></slot></div>`, a wrapping row.
 * - Owner of its cards (`ownsParts:  card`):  each `<ui-card>` finds this group (`PartContext`), becomes a
 *   `role=listitem` host with `:state(in-cards)`, and takes the group's shared variations as its own classes
 *   (`shared()`, `CardSharedVariation`), so a raised group's cards are `ui raised card`s.
 * - Count, spacing and width reach the cards as private inherited tokens (`--_cards-*`, `card.css`);
 *   `doubling` / `stackable` answer to THIS host's width:  it's a block and the size container `ui-cards`
 *   (`:state(cards)`, always on).
 * - A list:  a group of cards reads as "list, 3 items" -- each card is still its own `<article>` / link.
 ****************/
export class UICards extends UIElement<typeof cardsVocabulary> {
  @proto static vocabulary = cardsVocabulary
  @proto static styles = { card: cardCSS }
  @proto static Fallback = CardFallback
  @proto static delegatesFocus = false

  /** The group's value of variation `name`, which its cards take when they don't set it.  Tracked. */
  shared(name: CardSharedVariation): unknown {
    return this.attrs[name]
  }

  protected hostStates() {
    return { cards: true }
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("group")} role={LIST}>
        <slot />
      </div>
    )
  }
}

/** Role of the group root. */
const LIST = "list"
