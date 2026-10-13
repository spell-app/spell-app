"""Exclusive lists:  an item is in at most ONE list of a family at a time, and guards on a move.

- The JavaScript core's `List.test.ts`, "exclusive lists" and "guards", test for test.
- The classes are what spell compiles from:
  - `a pile is a list of cards` + `a card belongs to one pile`
  - `a tableau is a pile`
  - `a deck is a list of cards`
  - `a hand is a list of cards` + `a card belongs to one hand`
"""

import gc

from spell_core import List, Thing, core
from spell_core.lists import ListFamily


class Card(Thing):
    """A card:  `pile` and `hand` are what its `belongs to one` lines compile to."""

    @property
    def pile(self) -> "Pile | None":
        """`the pile of a card`."""
        return Pile.owner_of(self)

    @property
    def hand(self) -> "Hand | None":
        """`the hand of a card`."""
        return Hand.owner_of(self)


class Pile(List):
    """`a pile is a list of cards` + `a card belongs to one pile`:  the family's root."""

    item_type = Card
    exclusive = True


class Tableau(Pile):
    """`a tableau is a pile`:  the same family."""


class Deck(List):
    """`a deck is a list of cards`:  no family."""

    item_type = Card


class Hand(List):
    """`a hand is a list of cards` + `a card belongs to one hand`:  a family of its own."""

    item_type = Card
    exclusive = True


class Foundation(Pile):
    """`a foundation is a pile`, with guards:  it takes a card only when empty, and never lets one go."""

    def can_take(self, item: object) -> bool:
        """`a foundation can take a card if: it is empty`."""
        return core.is_empty(self)

    def can_give_up(self, item: object) -> bool:
        """`a foundation can never let go of a card`."""
        return False


class StockPile(Pile):
    """`a stock-pile can give up a card if: the card is its last card`."""

    def can_give_up(self, item: object) -> bool:
        """Only its last card."""
        return item is core.get_item_at(self, -1)


def cards(count: int) -> list[Card]:
    """`count` new cards."""
    return [Card() for _ in range(count)]


####################
# ## Exclusive lists
####################


def test_adding_a_card_makes_its_pile_the_owner() -> None:
    [card] = cards(1)
    pile = Pile()
    assert card.pile is None
    core.append(pile, card)
    assert card.pile is pile


def test_adding_to_another_list_of_the_family_moves_it_a_sub_types_too() -> None:
    card, other = cards(2)
    pile, tableau = Pile(), Tableau()
    core.append(pile, card, other)
    core.append(tableau, card)
    assert list(pile) == [other]
    assert list(tableau) == [card]
    assert card.pile is tableau
    assert Tableau.owner_of(card) is tableau


def test_a_card_can_be_in_the_deck_and_one_pile() -> None:
    [card] = cards(1)
    deck, pile = Deck(), Pile()
    core.append(deck, card)
    core.append(pile, card)
    assert list(deck) == [card]
    assert list(pile) == [card]
    assert Pile.owner_of(card) is pile
    assert Deck.owner_of(card) is None


def test_each_exclusive_family_keeps_its_own_owners() -> None:
    [card] = cards(1)
    pile, hand = Pile(), Hand()
    core.append(pile, card)
    core.append(hand, card)
    assert card.pile is pile
    assert card.hand is hand


def test_adding_a_card_it_holds_moves_it_never_twice() -> None:
    a, b, c = cards(3)
    pile = Pile()
    core.append(pile, a, b, c)
    core.append(pile, a)
    assert list(pile) == [b, c, a]
    core.prepend(pile, c)
    assert list(pile) == [c, b, a]
    core.add_at_position(pile, 2, c)
    assert list(pile) == [b, c, a]
    pile.insert(0, a)
    assert list(pile) == [a, b, c]
    assert a.pile is pile


def test_removing_leaves_it_with_no_owner() -> None:
    a, b, c, d = cards(4)
    pile = Pile([a, b, c, d])
    core.remove(pile, a)
    assert a.pile is None
    core.remove_item_at(pile, 0)
    assert b.pile is None
    del pile[0]
    assert c.pile is None
    core.clear(pile)
    assert d.pile is None
    assert list(pile) == []


def test_setting_an_item_the_new_one_joins_the_old_one_leaves_reversing_keeps_every_owner() -> None:
    a, b, c, d = cards(4)
    pile, other = Pile([a, b, c]), Pile([d])
    core.set_item_at(pile, 1, d)
    assert list(pile) == [a, d, c]
    assert list(other) == []
    assert d.pile is pile
    assert b.pile is None
    core.reverse(pile)
    assert list(pile) == [c, d, a]
    assert [card.pile for card in (a, c, d)] == [pile, pile, pile]
    pile[0] = b
    assert (b.pile, c.pile) == (pile, None)


def test_shuffling_keeps_every_card_and_every_owner() -> None:
    deal = cards(10)
    pile = Pile(deal)
    core.randomize(pile)
    core.seed_random(1)
    assert set(pile) == set(deal)
    assert all(card.pile is pile for card in deal)


def test_setting_items_keeps_the_owners_too() -> None:
    a, b = cards(2)
    pile, other = Pile([a]), Pile()
    other.items = [a, b]
    assert list(pile) == []
    assert a.pile is other
    other.items = [b]
    assert a.pile is None


def test_scratch_results_own_nothing() -> None:
    a, b, c = cards(3)
    pile, tableau = Pile([a, b]), Tableau([c])
    results = [
        core.filter(pile, lambda _: True),
        core.map(pile, lambda card: card),
        core.range_starting_at(pile, 0),
        core.duplicate_list(pile),
        core.duplicate_list(pile, Pile),
        core.merge_lists([pile, tableau]),
        core.merge_lists([pile, tableau], Pile),
        pile[0:2],
    ]
    assert all(isinstance(result, Pile) for result in results)
    assert list(results[0]) == [a, b]
    assert list(results[6]) == [a, b, c]
    assert list(pile) == [a, b]
    assert list(tableau) == [c]
    assert [card.pile for card in (a, b, c)] == [pile, pile, tableau]
    # moving a card out of a scratch copy's source leaves the copy alone
    copy = results[3]
    core.append(tableau, a)
    assert list(copy) == [a, b]
    assert a.pile is tableau


def test_a_number_or_text_cant_be_owned_the_list_just_holds_it() -> None:
    pile, other = Pile(), Pile()
    core.append(pile, 1, "x")
    core.append(other, 1)
    assert list(pile) == [1, "x"]
    assert Pile.owner_of(1) is None


def test_a_pile_and_its_cards_that_are_gone_are_forgotten() -> None:
    family = ListFamily.of(Pile)
    assert family is not None
    gc.collect()
    before = len(family._owners)
    pile = Pile(cards(3))
    assert len(family._owners) == before + 3
    del pile
    gc.collect()
    assert len(family._owners) == before


def test_a_pile_nothing_else_holds_is_let_go() -> None:
    [card] = cards(1)
    Pile([card])
    gc.collect()
    assert card.pile is None


####################
# ## Guards:  only a move asks them
####################


def test_a_move_asks_the_cards_pile_to_give_it_up_then_the_new_pile_to_take_it() -> None:
    a, b = cards(2)
    stock, foundation = StockPile([a, b]), Foundation()
    # `a` isn't the stock's last card:  the stock won't give it up
    assert core.move(a, foundation) is False
    assert list(stock) == [a, b]
    assert a.pile is stock
    # `b` is, and the foundation is empty:  it moves
    assert core.move(b, foundation) is True
    assert list(stock) == [a]
    assert list(foundation) == [b]
    assert b.pile is foundation


def test_refused_by_the_new_pile_nothing_changes() -> None:
    a, b = cards(2)
    foundation, pile = Foundation([a]), Pile([b])
    assert core.move(b, foundation) is False
    assert list(pile) == [b]
    assert list(foundation) == [a]


def test_a_list_that_can_never_let_go_still_lets_append_remove_and_clear_through() -> None:
    a, b, c = cards(3)
    foundation, pile = Foundation([a, b, c]), Pile()
    assert core.move(a, pile) is False
    pile.append(a)
    foundation.remove(b)
    assert list(pile) == [a]
    assert list(foundation) == [c]
    foundation.clear()
    assert c.pile is None


def test_outside_a_family_only_the_new_list_is_asked() -> None:
    a, b = cards(2)
    foundation, deck = Foundation(), Deck()
    assert core.move(a, foundation) is True
    # the deck is outside the pile family:  the foundation isn't asked to give it up
    assert deck.move_here(a) is True
    assert list(deck) == [a]
    assert a.pile is foundation
    plain: list[object] = []
    assert core.move(b, plain) is True
    assert plain == [b]


def test_asking_without_moving_a_plain_list_allows_anything() -> None:
    [a] = cards(1)
    foundation = Foundation()
    assert core.can_take(foundation, a) is True
    assert core.can_give_up(foundation, a) is False
    assert core.can_take(Pile(), a) is True
    assert core.can_give_up([a], a) is True
