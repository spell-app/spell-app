import { core, Thing, List, App, Drawable, DrawableList } from "@spell/core"
import { Card, Suit, Rank, Deck, Pile } from "@spell/project/@spell/library/cards"

core.heading("Counting from 0:  this project's lists start at 0 (its project file)")
//////////////////////////////////////////////////////////////////////////
// ## Counting from 0:  this project's lists start at 0 (its project file)
//////////////////////////////////////////////////////////////////////////
/** Numbers count from 0;  ordinal words don't change.  Its deck is the cards library's:  ace of clubs first. */
export function testCountingFromZero() {
  return core.test("test counting from zero", function testCountingFromZero() {
    core.echoTestAction(`the deck is a new deck`)
    const deck = new Deck()
    core.expect(deck.firstItem?.name!, `the name of card 0 of the deck`, "ace-of-clubs", `"ace-of-clubs"`)
    core.expect(deck.getItem(1)?.name!, `the name of card 1 of the deck`, "ace-of-diamonds", `"ace-of-diamonds"`)
    core.expect(deck.lastItem?.name!, `the name of card -1 of the deck`, "king-of-spades", `"king-of-spades"`)
    core.expect(deck.firstItem?.name!, `the name of the first card of the deck`, "ace-of-clubs", `"ace-of-clubs"`)
    core.expect(deck.getItem(1)?.name!, `the name of the second card of the deck`, "ace-of-diamonds", `"ace-of-diamonds"`)
    core.expect(deck.lastItem?.name!, `the name of the last card of the deck`, "king-of-spades", `"king-of-spades"`)
    core.echoTestAction(`set the ace to the first card of the deck`)
    const ace = deck.firstItem
    core.expect(deck.positionOf(ace!), `the position of the ace in the deck`, 0, `0`)
    core.echoTestAction(`set the aces to cards 0 to 3 of the deck`)
    const aces = deck.slice(0, 4)
    core.expect(aces.length, `the number of cards in the aces`, 4, `4`)
    core.expect(aces.lastItem?.name!, `the name of the last card of the aces`, "ace-of-spades", `"ace-of-spades"`)
    core.echoTestAction(`set the kings to last two cards of the deck`)
    const kings = core.rangeStartingAt(deck, -2, 2) as Deck
    core.expect(kings.length, `the number of cards in the kings`, 2, `2`)
    core.expect(kings.firstItem?.name!, `the name of the first card of the kings`, "king-of-hearts", `"king-of-hearts"`)
    core.echoTestAction(`set the positions to a new list of numbers`)
    const positions = new List<number>({ instanceType: "number" })
    core.echoTestAction(`for each card, position in the aces`)
    aces.forEach((card, position_) => positions.append(position_))
    core.echo(`positions: ${positions}`)
    core.echoTestAction(`remove card 0 of the deck`)
    core.removeItemAt(deck, 0)
    core.expect(deck.firstItem?.name!, `the name of the first card of the deck`, "ace-of-diamonds", `"ace-of-diamonds"`)
  })
}
// -----------
if (!core.isCarryingOver) testCountingFromZero()
