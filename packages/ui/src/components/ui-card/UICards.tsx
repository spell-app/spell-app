import type { JSX } from "@solidjs/web"

import { proto, UIElement, UIT } from "$/ui/core"

import { cardsVocabulary } from "./ui-cards.vocabulary.en"
import { CardFallback } from "./ui-card.fallback"

import cardCSS from "./ui-card.css?inline"

/****************
 * ### `<ui-cards>`
 * A group of cards:  `<div class="ui ... cards" part="group" role="list"><slot></slot></div>`, a wrapping row.
 * - Owner of its cards (`ownsParts:  card`):  each `<ui-card>` finds this group (`PartContext`), becomes a
 *   `role=listitem` host with `:state(in-cards)`, and takes the group's shared variations as its own classes
 *   (`shared()`, `CardSharedVariation`), so a raised group's cards are `ui raised card`s.
 * - Count, spacing and width reach the cards as private inherited tokens (`--_cards-*`, `ui-card.css`);
 *   `doubling` / `stackable` answer to THIS host's width:  it's a block and the size container `ui-cards`
 *   (`:state(cards)`, always on);  or to the screen's, with `stack-with="page"` (a private class after the noun).
 * - A list:  a group of cards reads as "list, 3 items" -- each card is still its own `<article>` / link.
 ****************/
export class UICards extends UIElement<typeof cardsVocabulary> {
  @proto static vocabulary = cardsVocabulary
  @proto static styles = { card: cardCSS }
  @proto static Fallback = CardFallback
  @proto static delegatesFocus = false

  /** The group's value of variation `name`, which its cards take when they don't set it.  Tracked. */
  shared(name: UIT.CardSharedVariation): unknown {
    return this.attrs[name]
  }

  protected hostStates() {
    return { cards: true }
  }

  /** `stack-with`'s class (`UIT.StackClasses`). */
  protected extraClasses(): string | undefined {
    return UIT.StackClasses.of(this.attrs.stackWith)
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("group")} role={UIT.LIST}>
        <slot />
      </div>
    )
  }
}
