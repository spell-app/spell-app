/**
 * What TypeScript says about the JS today's grammar emits -- the evidence behind section 9 of `precedence.html`.
 * - Run from `packages/docs`:
 *   `yarn tsc --ignoreConfig --noEmit --strict --target es2022 --pretty false precedence/experiments/typescript-check.ts`
 * - EXPECTED to report errors:  each line under "as emitted today" is what the parser emits for the spell above it
 *   (see `grammar-today.mts`), typed the way the proposed backend would type it.  The errors are the point.
 * - The lines under "as the proposal parses them" MUST report nothing.
 * - Stand-ins for `@spell/core`:  just enough of `Thing`, `List` and `spellCore` to type these lines.
 * - NOTE: each class carries a private brand.  TypeScript is structural, spell's types are nominal:  without it a
 *   `Deck` and a `Pile` with the same members are the same type, and `card.add_to_$pile(deck)` passes.
 */

// oxlint-disable no-unused-expressions -- each line is a sample of compiled spell, there for `tsc` to check

declare class Thing {}
declare class List<Item> extends Thing {
  items: Item[]
}
declare const spellCore: {
  getItemOf<Item>(list: List<Item> | Item[], position: number): Item
  itemCountOf(list: List<unknown> | unknown[]): number
  isEmpty(thing: List<unknown> | unknown[] | string): boolean
  endsWith(thing: string | unknown[], ending: unknown): boolean
  append<Item>(list: List<Item>, item: Item): void
}

class Card extends Thing {
  declare private readonly $Card: true
  declare suit: "clubs" | "diamonds" | "hearts" | "spades"
  declare color: "red" | "black"
  get is_face_up(): boolean {
    return true
  }
  put_on_$pile(pile: Pile): void {}
  add_to_$pile(pile: Pile): void {}
}
class Pile extends List<Card> {
  declare private readonly $Pile: true
}
class Deck extends List<Card> {
  declare private readonly $Deck: true
}
class Chip extends Thing {
  declare private readonly $Chip: true
  put_on_$pot(pot: Pot): void {}
}
class Pot extends List<Chip> {
  declare private readonly $Pot: true
}

declare const card: Card
declare const deck: Deck
declare const chip: Chip
declare const pot: Pot
declare const x: number
declare const y: number

////////////////
// ## As emitted today
////////////////

// P4a  put the chip on the pot
chip.put_on_$pile(pot)
// P4c  add the card to the deck  (after a user's `to add (a card) to (a pile)`)
card.add_to_$pile(deck)
// P1a  the first card of the deck is face up
spellCore.getItemOf(deck.is_face_up, 1)
// P1b  the number of cards in the deck is 52
spellCore.itemCountOf(deck == 52)
// P1c  the number of cards in the deck + 1
spellCore.itemCountOf(deck + 1)
// P1d  the suit of the first card of the deck is hearts
spellCore.getItemOf(deck == "hearts", 1).suit
// P3   x + y is empty
x + spellCore.isEmpty(y)
// P2b  x ends with y and 1
spellCore.endsWith(x, y && 1)
// a typo no rule catches:  the colour of the card
card.colour

////////////////
// ## As the proposal parses them
////////////////

chip.put_on_$pot(pot)
spellCore.append(deck, card)
spellCore.getItemOf(deck, 1).is_face_up
spellCore.itemCountOf(deck) == 52
spellCore.itemCountOf(deck) + 1
spellCore.getItemOf(deck, 1).suit == "hearts"
card.color
