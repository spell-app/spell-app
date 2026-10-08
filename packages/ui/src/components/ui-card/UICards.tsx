import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { cardsVocabulary } from "./UICards.en"

import cardCSS from "./UICard.css?inline"

/****************
 * ### `UICards`
 * The component behind `<ui-cards>`:  a group of cards in a wrapping row,
 * `<div class="ui ... cards" part="group" role="list"><slot></slot></div>`.
 *
 * - It owns its cards (`ownsParts:  card`):  each `<ui-card>` finds this group (`PartContext`),
 *   its DOM element becomes a `role=listitem` with `:state(in-cards)`,
 *   and it takes the group's shared variations as its own classes (`variationFor()`, `CardSharedVariation`),
 *   so a raised group's cards are `ui raised card`s.
 *
 * - Count, spacing and width reach the cards as private inherited tokens (`--_cards-*`, `UICard.css`).
 *   - `doubling` and `stackable` answer to THIS DOM element's width:
 *     it's a block and the size container `ui-cards` (`:state(cards)`, always on).
 *   - With `stack-with="page"` (a private class after the noun), they answer to the screen's.
 *
 * - A list:  a group of cards reads as "list, 3 items";  each card is still its own `<article>` or link.
 * - It shares the card's sheet, `UICard.css`.
 ****************/
export class UICards extends E.UIComponent<typeof cardsVocabulary> {
  @E.proto static vocabulary = cardsVocabulary
  @E.proto static styleSheets = { card: cardCSS }
  @E.proto static elementSetup = { delegatesFocus: false } satisfies Partial<E.ElementSetup>

  /** The group's value of variation `name`, which its cards take when they don't set it.  Tracked. */
  variationFor(name: UIT.CardSharedVariation): unknown {
    return this[name]
  }

  /** Always on:  the DOM element is the `ui-cards` size container (`:state(cards)`). */
  @E.cssState("cards")
  get isCards(): boolean {
    return true
  }

  /** `stack-with`'s class (`UIT.StackClasses`). */
  protected get extraClasses(): string | undefined {
    return UIT.StackClasses.classFor(this.stackWith)
  }

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("group")} role="list">
        <slot />
      </div>
    )
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UICards extends E.AttributeValues<typeof cardsVocabulary> {}
