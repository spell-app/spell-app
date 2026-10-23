from __future__ import annotations

from typing import Any

from spell_core import core, List
from cards import Card, Suit, Rank, Deck, Pile


#########################################################################
# ## Counting from 0:  this project's lists start at 0 (its project file)
#########################################################################


def test_counting_from_zero() -> Any:
    """Numbers count from 0;  ordinal words don't change.  Its deck is the frozen card library's (`@spell/test/cards`):  ace of clubs first."""
    with core.test("test counting from zero"):
        core.echo_test_action("the deck is a new deck")
        deck = Deck()
        core.expect(
            getattr(deck.first_item, "name", None),
            "the name of card 0 of the deck",
            "ace-of-clubs",
            "\"ace-of-clubs\"",
        )
        core.expect(
            getattr(deck[1], "name", None),
            "the name of card 1 of the deck",
            "ace-of-diamonds",
            "\"ace-of-diamonds\"",
        )
        core.expect(
            getattr(deck.last_item, "name", None),
            "the name of card -1 of the deck",
            "king-of-spades",
            "\"king-of-spades\"",
        )
        core.expect(
            getattr(deck.first_item, "name", None),
            "the name of the first card of the deck",
            "ace-of-clubs",
            "\"ace-of-clubs\"",
        )
        core.expect(
            getattr(deck[1], "name", None),
            "the name of the second card of the deck",
            "ace-of-diamonds",
            "\"ace-of-diamonds\"",
        )
        core.expect(
            getattr(deck.last_item, "name", None),
            "the name of the last card of the deck",
            "king-of-spades",
            "\"king-of-spades\"",
        )
        core.echo_test_action("set the ace to the first card of the deck")
        ace = deck.first_item
        core.expect(deck.position_of(ace), "the position of the ace in the deck", 0, "0")
        core.echo_test_action("set the aces to cards 0 to 3 of the deck")
        aces = deck[0:4]
        core.expect(len(aces), "the number of cards in the aces", 4, "4")
        core.expect(
            getattr(aces.last_item, "name", None),
            "the name of the last card of the aces",
            "ace-of-spades",
            "\"ace-of-spades\"",
        )
        core.echo_test_action("set the kings to last two cards of the deck")
        kings = core.range_starting_at(deck, -2, 2)
        core.expect(len(kings), "the number of cards in the kings", 2, "2")
        core.expect(
            getattr(kings.first_item, "name", None),
            "the name of the first card of the kings",
            "king-of-hearts",
            "\"king-of-hearts\"",
        )
        core.echo_test_action("set the positions to a new list of numbers")
        positions = List(item_type="number")
        core.echo_test_action("for each card, position in the aces")
        for position_, card in enumerate(aces):
            positions.append(position_)
        core.echo(f"positions: {positions}")
        core.echo_test_action("remove card 0 of the deck")
        core.remove_item_at(deck, 0)
        core.expect(
            getattr(deck.first_item, "name", None),
            "the name of the first card of the deck",
            "ace-of-diamonds",
            "\"ace-of-diamonds\"",
        )


# -----------


test_counting_from_zero()
