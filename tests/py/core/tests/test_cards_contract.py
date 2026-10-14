"""The Cards fixture, as compiled Python will say it, prints what the JavaScript core prints for it.

- The program below is the Cards fixture (`tests/spaces/@spell/test/cards/`) in the shape the Python writer emits:
  the contract between the writer and spell_core (plan doc python-target, P10).
- Its tests' lines must be the JavaScript run's, character for character:
  the contract's own `Cards.out.txt` (`packages/cli/src/__snapshots__/contract/`).
- `pause for 50 msec` is left out:  this program was written in P10, before pauses (P11).
- Its `to test` methods are named without `test_`, so pytest runs them only inside `core.test()`, as spell does.
"""

from pathlib import Path

import pytest

from spell_core import List, Thing, core, prop, spell_position

# What the JavaScript core prints for the Cards fixture:  its stdout.
CARDS_OUTPUT = Path(__file__).parents[3] / "cli" / "src" / "__snapshots__" / "contract" / "Cards.out.txt"


class Card(Thing):
    """Definition of a Card with nice english aliases for working with it."""

    # card ranks
    RANKS = ("ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king")
    rank = prop(one_of=RANKS)

    # card suits
    SUITS = ("clubs", "diamonds", "hearts", "spades")
    suit = prop(one_of=SUITS)

    # card direction:  up or down
    DIRECTIONS = ("up", "down")
    direction = prop(one_of=DIRECTIONS)

    @property
    def color(self) -> str:
        """Color as derivation of suit."""
        if self.suit in ["diamonds", "hearts"]:
            return "red"
        return "black"

    @property
    def value(self) -> int | None:
        """Value as a derivation of rank."""
        return spell_position(core.position_of(Card.RANKS, self.rank))

    @property
    def is_face_up(self) -> bool:
        """ "card is face up/down"."""
        return self.direction == "up"

    @property
    def is_face_down(self) -> bool:
        return self.direction == "down"

    @property
    def is_a_face_card(self) -> bool:
        """`card is a face card`."""
        return self.rank in ["jack", "queen", "king"]

    def is_a_suit(self, suit: str) -> bool:
        """ "card is a spade", "...is a club" etc."""
        return self.suit == suit

    def is_a_rank(self, rank: object) -> bool:
        """ "card is a queen", "...is an ace" etc."""
        return self.rank == rank

    def is_the_rank_of_suits(self, rank: object, suit: str) -> bool:
        """ "card is the queen of spades" etc."""
        return self.rank == rank and self.suit == suit

    @property
    def name(self) -> str:
        """Name as a derivation of name/suit."""
        return f"{self.rank}-of-{self.suit}"

    @property
    def short_suit(self) -> str:
        if self.is_a_suit("clubs"):
            return "♣️"
        if self.is_a_suit("diamonds"):
            return "♦️"
        if self.is_a_suit("hearts"):
            return "♥️"
        if self.is_a_suit("spades"):
            return "♠️"
        return "?"

    @property
    def short_rank(self) -> str:
        if self.rank is None:
            return "?"
        if isinstance(self.rank, int):
            return f"{self.rank}"
        return core.upper_case(core.get_item_at(self.rank, 0))

    @property
    def short_direction(self) -> str:
        if self.direction == "up":
            return "+"
        return "—"

    @property
    def short_name(self) -> str:
        return self.short_rank + self.short_suit

    @property
    def state(self) -> str:
        return self.short_rank + self.short_suit + self.short_direction

    def turn_face_up(self) -> None:
        """Turn card face up or face down."""
        self.direction = "up"

    def turn_face_down(self) -> None:
        self.direction = "down"

    def turn_over(self) -> None:
        """Flip card to opposite direction."""
        if self.direction == "up":
            self.turn_face_down()
        else:
            self.turn_face_up()

    @property
    def pile(self) -> "Pile | None":
        """A card belongs to one pile."""
        return Pile.owner_of(self)


def card_setup() -> None:
    """Create a card instance with default properties."""
    core.echo_test_action("the card is a new card whose rank is queen, suit is spades and direction is up")
    card = Card(rank="queen", suit="spades", direction="up")
    core.echo(card)
    core.expect(card.rank, "the rank of the card", "queen", "queen")
    core.expect(card.suit, "the suit of the card", "spades", "spades")
    core.expect(card.name, "the name of the card", "queen-of-spades", '"queen-of-spades"')
    core.expect(card.color, "the color of the card", "black", "black")
    core.expect(card.value, "the value of the card", 12, "12")
    core.expect(card.short_suit, "the short suit of the card", "♠️", '"♠️"')
    core.expect(card.short_rank, "the short rank of the card", "Q", '"Q"')
    core.expect(card.short_name, "the short name of the card", "Q♠️", '"Q♠️"')

    core.expect(card.is_face_up, "the card is face up", True, "yes")
    core.expect(card.is_face_down, "the card is face down", False, "no")

    core.expect(card.is_a_face_card, "the card is a face card", True, "yes")
    core.expect(not card.is_a_face_card, "the card is not a face card", False, "false")

    core.expect(card.is_a_suit("spades"), "the card is a spade", True, "true")
    core.expect(card.is_a_suit("clubs"), "the card is a club", False, "false")

    core.expect(card.is_a_rank("queen"), "the card is a queen", True, "true")
    core.expect(card.is_a_rank("ace"), "the card is an ace", False, "false")
    core.expect(card.is_a_rank(2), "the card is a 2", False, "false")

    core.expect(card.is_the_rank_of_suits("queen", "spades"), "the card is the queen of spades", True, "true")
    core.expect(card.is_the_rank_of_suits("queen", "clubs"), "the card is the queen of clubs", False, "false")
    core.expect(not card.is_the_rank_of_suits(2, "diamonds"), "the card is not the 2 of diamonds", True, "true")

    core.echo_test_action("turn the card face down")
    card.turn_face_down()
    core.expect(card.direction, "the direction of the card", "down", "down")

    core.echo_test_action("turn the card over")
    card.turn_over()
    core.expect(card.is_face_up, "the card is face up", True, "true")


class Deck(List):
    """Deck:  US standard card deck (without jokers currently)."""

    item_type = Card
    is_set_up = prop(type="choice")

    def set_up(self) -> None:
        if self.is_set_up:
            return
        for rank in Card.RANKS:
            for suit in Card.SUITS:
                it = Card(rank=rank, suit=suit)
                self.append(it)
        self.is_set_up = True

    def display(self) -> None:
        card_names = List()
        for card in self:
            card_names.append(card.short_name)
        core.echo(f"deck: {card_names}")


def deck_creation() -> None:
    core.echo_test_action("the deck is a new deck")
    deck = Deck()
    core.echo_test_action("set up the deck")
    deck.set_up()
    core.expect(len(deck), "the number of cards in the deck", 52, "52")
    core.echo_test_action("set up the deck")
    deck.set_up()
    core.expect(len(deck), "the number of cards in the deck", 52, "52")
    core.echo_test_action('set the queens to the cards in the deck where the rank of the card is "queen"')
    queens = deck.filter(lambda card: card.rank == "queen")
    core.expect(len(queens), "the number of cards in the queens", 4, "4")
    core.expect(deck.last_item.name, "the name of the bottom card of the deck", "king-of-spades", '"king-of-spades"')
    core.expect(deck.first_item.short_name, "the short name of the top card of the deck", "A♣️", '"A♣️"')

    core.echo("the deck before shuffling:")
    core.echo_test_action("display the deck")
    deck.display()
    core.expect(
        deck.first_item.is_the_rank_of_suits("ace", "clubs"),
        "the first card of the deck is the ace of clubs",
        True,
        "yes",
    )


class Pile(List):
    """Pile of playing cards."""

    item_type = Card
    exclusive = True

    @property
    def color(self) -> str:
        if self.is_empty:
            return "none"
        return self.last_item.color

    @property
    def value(self) -> int:
        if self.is_empty:
            return 0
        return self.last_item.value

    @property
    def state(self) -> str:
        state = f"{self.name or 'pile'}:"
        for card in self:
            state = f"{state} {card.state}"
        return state


####################
# ## The contract
####################


def test_cards_prints_what_javascript_prints(capsys: pytest.CaptureFixture[str]) -> None:
    core.test("test card setup", card_setup)
    core.test("test deck creation", deck_creation)
    printed = capsys.readouterr()
    assert printed.out == CARDS_OUTPUT.read_text(encoding="utf-8")
    # the card, echoed, is a dump:  on stderr, so stdout reads the same whatever a thing looks like printed
    assert "Card(rank='queen', suit='spades', direction='up')" in printed.err


def test_a_pile_of_cards() -> None:
    pile, other = Pile(), Pile()
    assert (pile.color, pile.value, pile.state) == ("none", 0, "pile:")
    ace, king = Card(rank="ace", suit="hearts", direction="up"), Card(rank="king", suit="spades", direction="down")
    pile.append(ace, king)
    assert (pile.color, pile.value, pile.state) == ("black", 13, "pile: A♥️+ K♠️—")
    other.append(king)
    assert (king.pile, list(pile), pile.color) == (other, [ace], "red")
