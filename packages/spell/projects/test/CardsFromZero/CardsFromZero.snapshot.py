from __future__ import annotations

import asyncio

from spell_core import core, Thing, List, prop, h


class Card(Thing):
    """definition of a Card with nice english aliases for working with it"""

    ########################
    # ## properties of cards
    ########################
    # card ranks
    RANKS = ("ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king")
    rank = prop(one_of=RANKS)

    # card suits
    SUITS = ("clubs", "diamonds", "hearts", "spades")
    suit = prop(one_of=SUITS)

    @property
    def color(self) -> str:
        """color as derivation of suit"""
        if self.suit in ["diamonds", "hearts"]:
            return "red"
        return "black"

    @property
    def value(self) -> float:
        """value as a derivation of rank"""
        return core.position_of(Card.RANKS, self.rank)

    # card direction:  up or down
    DIRECTIONS = ("up", "down")
    direction = prop(one_of=DIRECTIONS)

    ############
    # ## aliases
    ############

    @property
    def is_face_up(self) -> bool:
        """\"card is face up/down\""""
        return self.direction == "up"

    @property
    def is_face_down(self) -> bool:
        return self.direction == "down"

    @property
    def is_a_face_card(self) -> bool:
        """`card is a face card`"""
        return self.rank in ["jack", "queen", "king"]

    def is_a_suit(self, suit) -> bool:
        """\"card is a spade", "...is a club" etc"""
        return self.suit == suit

    def is_a_rank(self, rank) -> bool:
        """\"card is a queen", "...is an ace" etc"""
        return self.rank == rank

    def is_the_rank_of_suits(self, rank, suit) -> bool:
        """\"card is the queen of spades" etc"""
        return self.rank == rank and self.suit == suit

    @property
    def name(self) -> str:
        """name as a derivation of name/suit"""
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
        if isinstance(self.rank, (int, float)):
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

    # actions

    async def turn_face_up(self) -> None:
        """
        Turn card face up or face down
        Note that this will animate if you `wait for turn the card face up`
        """
        self.direction = "up"
        await core.pause_for(50, "msec")

    async def turn_face_down(self) -> None:
        self.direction = "down"
        await core.pause_for(50, "msec")

    async def turn_over(self) -> None:
        """
        Flip card to opposite direction
        Note that this will animate if you `wait for turn the card face up`
        """
        if self.direction == "up":
            await self.turn_face_down()
        else:
            await self.turn_face_up()
        await core.pause_for(50, "msec")

    def draw(self):
        class_name = f"Card face-{self.direction} {self.rank} {self.suit} ui button compact fluid "
        if self.is_face_down:
            return h(
                "div",
                {"class": class_name, "onClick": lambda event: core.trigger("card-click", card=self)},
                h("i", {"class": "fitted bicycle icon"}),
            )
        return h(
            "div",
            {
                "class": class_name + self.color,
                "onClick": lambda event: core.trigger("card-click", card=self),
            },
            f"{self.short_rank} ",
            h("span", {"class": "suit"}, self.short_suit),
        )

    @property
    def pile(self) -> Pile | None:
        return Pile.owner_of(self)


async def test_card_setup():
    """create a card instance with default properties"""
    with core.test("test card setup"):
        core.echo_test_action(
            "the card is a new card whose rank is queen, suit is spades and direction is up",
        )
        card = Card(rank="queen", suit="spades", direction="up")
        core.echo(card)
        core.expect(card.rank, "the rank of the card", "queen", "queen")
        core.expect(card.suit, "the suit of the card", "spades", "spades")
        core.expect(card.name, "the name of the card", "queen-of-spades", "\"queen-of-spades\"")
        core.expect(card.color, "the color of the card", "black", "black")
        core.expect(card.value, "the value of the card", 11, "11")
        core.expect(card.short_suit, "the short suit of the card", "♠️", "\"♠️\"")
        core.expect(card.short_rank, "the short rank of the card", "Q", "\"Q\"")
        core.expect(card.short_name, "the short name of the card", "Q♠️", "\"Q♠️\"")

        core.expect(card.is_face_up, "the card is face up", True, "yes")
        core.expect(card.is_face_down, "the card is face down", False, "no")

        core.expect(card.is_a_face_card, "the card is a face card", True, "yes")
        core.expect(not card.is_a_face_card, "the card is not a face card", False, "false")

        core.expect(card.is_a_suit("spades"), "the card is a spade", True, "true")
        core.expect(card.is_a_suit("clubs"), "the card is a club", False, "false")

        core.expect(card.is_a_rank("queen"), "the card is a queen", True, "true")
        core.expect(card.is_a_rank("ace"), "the card is an ace", False, "false")
        core.expect(card.is_a_rank(2), "the card is a 2", False, "false")

        core.expect(
            card.is_the_rank_of_suits("queen", "spades"),
            "the card is the queen of spades",
            True,
            "true",
        )
        core.expect(
            card.is_the_rank_of_suits("queen", "clubs"),
            "the card is the queen of clubs",
            False,
            "false",
        )
        core.expect(
            not card.is_the_rank_of_suits(2, "diamonds"),
            "the card is not the 2 of diamonds",
            True,
            "true",
        )

        core.echo_test_action("turn the card face down")
        await card.turn_face_down()
        core.expect(card.direction, "the direction of the card", "down", "down")

        core.echo_test_action("turn the card over")
        await card.turn_over()
        core.expect(card.is_face_up, "the card is face up", True, "true")


asyncio.run(test_card_setup())


# -----------


# Deck:   US standard card deck (without jokers currently)


class Deck(List):
    item_type = Card

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

    is_set_up = prop(type="choice")


def test_deck_creation():
    with core.test("test deck creation"):
        core.echo_test_action("the deck is a new deck")
        deck = Deck()
        core.echo_test_action("set up the deck")
        deck.set_up()
        core.expect(len(deck), "the number of cards in the deck", 52, "52")
        core.echo_test_action("set up the deck")
        deck.set_up()
        core.expect(len(deck), "the number of cards in the deck", 52, "52")
        core.echo_test_action(
            "set the queens to the cards in the deck where the rank of the card is \"queen\"",
        )
        queens = deck.filter(lambda card: card.rank == "queen")
        core.expect(len(queens), "the number of cards in the queens", 4, "4")
        core.expect(
            getattr(deck.last_item, "name", None),
            "the name of the bottom card of the deck",
            "king-of-spades",
            "\"king-of-spades\"",
        )
        core.expect(
            getattr(deck.first_item, "short_name", None),
            "the short name of the top card of the deck",
            "A♣️",
            "\"A♣️\"",
        )

        core.echo("the deck before shuffling:")
        core.echo_test_action("display the deck")
        deck.display()
        core.expect(
            deck.first_item.is_the_rank_of_suits("ace", "clubs"),
            "the first card of the deck is the ace of clubs",
            True,
            "yes",
        )


test_deck_creation()


def test_counting_from_zero():
    """this project's lists start at 0 (project.json):  numbers count from 0, ordinal words don't change"""
    with core.test("test counting from zero"):
        core.echo_test_action("the deck is a new deck")
        deck = Deck()
        core.echo_test_action("set up the deck")
        deck.set_up()
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


test_counting_from_zero()


# -----------


class Pile(List):
    """Pile of playing cards"""

    item_type = Card

    @property
    def color(self) -> str | None:
        if not self:
            return "none"
        return getattr(self.last_item, "color", None)

    @property
    def value(self) -> float | None:
        if not self:
            return 0
        return getattr(self.last_item, "value", None)

    @property
    def state(self) -> str:
        state = f"{self.name or "pile"}:"
        for card in self:
            state = f"{state} {card.state}"
        return state

    exclusive = True


# a card is in one pile at a time:  putting it on another pile takes it off this one
