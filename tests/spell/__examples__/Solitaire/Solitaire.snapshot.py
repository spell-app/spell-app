from __future__ import annotations

import asyncio
from typing import Any

from spell_core import core, List, App, Drawable, DrawableList, prop, h, position, spell_position


##############################################################################
# ## A playing card -- in the outline style:  its name, then what's true of it
##############################################################################


class Card(Drawable):
    """
    The card says what its suits, ranks and colors are:  a deck, a pile or a game only reads them.
    A drawable thing:  each card is its own element on the page, e.g. `<solitaire-card>`.
    """

    # its suit and rank
    # - its "suit" is a suit
    suit = prop(one_of=lambda: Card.SUITS)

    # - its "rank" is a rank
    rank = prop(one_of=lambda: Card.RANKS)

    @property
    def color(self) -> Any:
        return Suit.color(self.suit)

    @property
    def value(self) -> float:
        """ace 1 ... king 13"""
        return spell_position(core.position_of(Card.RANKS, self.rank))

    def is_a_suit(self, suit: Any) -> bool:
        """e.g. "the card is a spade\""""
        return self.suit == suit

    def is_a_rank(self, rank: Any) -> bool:
        """e.g. "the card is a queen\""""
        return self.rank == rank

    def is_the_rank_of_suits(self, rank: Any, suit: Any) -> bool:
        """e.g. "the card is the queen of spades\""""
        return self.rank == rank and self.suit == suit

    @property
    def is_a_face_card(self) -> bool:
        return Rank.is_a_face_card(self.rank)

    def is_the_color_joker(self, color: Color) -> bool:
        return isinstance(self, Joker) and self.color == color

    # its direction:  face up or face down
    # - its "direction" is up or down
    DIRECTIONS = ("up", "down")
    direction = prop(one_of=DIRECTIONS)

    @property
    def is_face_up(self) -> bool:
        return self.direction == "up"

    @property
    def is_face_down(self) -> bool:
        return self.direction == "down"

    # its names
    # e.g. "queen-of-spades"

    @property
    def name(self) -> str:
        return f"{self.rank}-of-{self.suit}"

    @property
    def short_suit(self) -> str:
        return Suit.symbol(self.suit)

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

    #########################################################
    # ## its picture:  a character of unicode's Playing Cards
    #########################################################

    @property
    def picture_column(self) -> float:
        """
        SEE:  https://www.compart.com/en/unicode/block/U+1F0A0
        The block is a grid:  a row for each suit, and in each row, a column for each rank.
        - The rows start at 1F0A0 (spades), 1F0B0 (hearts), 1F0C0 (diamonds) and 1F0D0 (clubs).
        - The columns run ace 1, 2 ... 10, jack B, then a knight our deck doesn't have, C, then queen D and king E.
        """
        # past the knight
        if self.is_a_rank("queen") or self.is_a_rank("king"):
            return self.value + 1
        return self.value

    @property
    def picture(self) -> str:
        if self.is_a_suit("spades"):
            return core.unicode(0x1F0A0 + self.picture_column)
        if self.is_a_suit("hearts"):
            return core.unicode(0x1F0B0 + self.picture_column)
        if self.is_a_suit("diamonds"):
            return core.unicode(0x1F0C0 + self.picture_column)
        return core.unicode(0x1F0D0 + self.picture_column)

    def draw(self) -> Any:
        """drawing:  its picture face up, the back every card shares face down"""
        if self.is_face_down:
            return h(
                "ui-text",
                {
                    "class": "Card",
                    "size": "massive",
                    "color": "blue",
                    "onClick": lambda event: core.trigger("card-click", card=self),
                },
                "🂠",
            )
        return h(
            "ui-text",
            {
                "class": "Card",
                "size": "massive",
                "prop:color": self.color,
                "onClick": lambda event: core.trigger("card-click", card=self),
            },
            self.picture,
        )

    ####################
    # ## turning it over
    ####################

    async def turn_face_up(self) -> None:
        """each pauses a moment, so `wait for: turn the card face up` animates"""
        self.direction = "up"
        await core.pause_for(50, "msec")

    async def turn_face_down(self) -> None:
        self.direction = "down"
        await core.pause_for(50, "msec")

    async def turn_over(self) -> None:
        if self.is_face_up:
            await self.turn_face_down()
        else:
            await self.turn_face_up()
        await core.pause_for(50, "msec")

    #######################################
    # ## Playing a card:  what a click does
    #######################################

    async def play(self) -> bool | None:
        """the card, and every card on it, onto the first pile that can take it;  it says whether it moved"""
        start_pile = self.pile
        assert start_pile is not None
        if not core.can_give_up(start_pile, self):
            return False

        if start_pile == solitaire.stock:
            await solitaire.play_from_the_stock()
            return

        end_pile = core.filter(core.every_thing(Pile), lambda pile: core.can_take(pile, self)).first_item
        if end_pile is None:
            return False

        moving_cards = start_pile.starting_with(self)
        moving_cards.name = start_pile.name
        print(f"moving ({moving_cards.state}) to ({end_pile.state})")

        for card in moving_cards:
            core.move(card, end_pile)

        if isinstance(start_pile, Tableau) and (start_pile):
            await core.pause_for(200, "msec")
            it = start_pile.last_item
            print(f"turning over ({start_pile.name}: {getattr(it, "state", None)})")
            await it.turn_face_up()

        if isinstance(end_pile, Foundation):
            solitaire.score = solitaire.score + 10
        elif start_pile == solitaire.discards:
            solitaire.score = solitaire.score + 5
        return True

    # "suits" as one of clubs, diamonds, hearts or spades
    SUITS = ("clubs", "diamonds", "hearts", "spades")

    # "ranks" as one of ace, 2 ... 10, jack, queen or king
    RANKS = ("ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king")

    # "colors" as one of red or black
    COLORS = ("red", "black")

    @property
    def pile(self) -> Pile | None:
        return Pile.owner_of(self)


class Joker(Card):
    """A joker:  a wild card with no rank or suit -- there's a red one and a black one"""

    # set when it's made:  it has no suit to work its color out from
    # - its "color" is a color
    color = prop(one_of=lambda: Card.COLORS)

    @property
    def name(self) -> str:
        """e.g. "red-joker\""""
        return f"{self.color}-joker"

    @property
    def short_name(self) -> str:
        return "🃏"

    @property
    def state(self) -> str:
        return self.short_name + self.short_direction

    @property
    def picture(self) -> str:
        if self.color == "red":
            return "🂿"
        return "🃏"


class Suit:
    """suits, ranks and colors:  the card's own kinds of values"""

    @staticmethod
    def color(suit: Any) -> str:
        if suit in ["diamonds", "hearts"]:
            return "red"
        return "black"

    @staticmethod
    def symbol(suit: Any) -> str:
        if suit == "clubs":
            return "♣️"
        if suit == "diamonds":
            return "♦️"
        if suit == "hearts":
            return "♥️"
        if suit == "spades":
            return "♠️"
        return "?"


class Rank:
    @staticmethod
    def is_a_face_card(rank: Any) -> bool:
        return rank in ["jack", "queen", "king"]


class Color:
    pass


async def test_card_setup() -> Any:
    """Tests"""
    with core.test("test card setup"):
        core.echo_test_action(
            "get a new card whose rank is queen, suit is spades and direction is up",
        )
        it = Card(rank="queen", suit="spades", direction="up")
        core.echo(it)
        core.expect(it.rank, "its rank", "queen", "queen")
        core.expect(it.suit, "its suit", "spades", "spades")
        core.expect(it.name, "its name", "queen-of-spades", "\"queen-of-spades\"")
        core.expect(it.color, "its color", "black", "black")
        core.expect(it.value, "its value", 12, "12")
        core.expect(it.short_suit, "its short suit", "♠️", "\"♠️\"")
        core.expect(it.short_rank, "its short rank", "Q", "\"Q\"")
        core.expect(it.short_name, "its short name", "Q♠️", "\"Q♠️\"")
        core.expect(it.state, "its state", "Q♠️+", "\"Q♠️+\"")
        core.expect(it.picture, "its picture", "🂭", "\"🂭\"")

        core.expect(it.is_face_up, "it is face up", True, "yes")
        core.expect(it.is_face_down, "it is face down", False, "no")

        core.expect(it.is_a_face_card, "it is a face card", True, "yes")
        core.expect(not it.is_a_face_card, "it is not a face card", False, "no")

        core.expect(it.is_a_suit("spades"), "it is a spade", True, "yes")
        core.expect(it.is_a_suit("clubs"), "it is a club", False, "no")

        core.expect(it.is_a_rank("queen"), "it is a queen", True, "yes")
        core.expect(it.is_a_rank("ace"), "it is an ace", False, "no")
        core.expect(it.is_a_rank(2), "it is a 2", False, "no")

        core.expect(
            it.is_the_rank_of_suits("queen", "spades"),
            "it is the queen of spades",
            True,
            "yes",
        )
        core.expect(
            it.is_the_rank_of_suits("queen", "clubs"),
            "it is the queen of clubs",
            False,
            "no",
        )
        core.expect(
            not it.is_the_rank_of_suits(2, "diamonds"),
            "it is not the 2 of diamonds",
            True,
            "yes",
        )

        core.echo_test_action("turn it face down")
        await it.turn_face_down()
        core.expect(it.direction, "its direction", "down", "down")
        core.expect(it.is_face_down, "it is face down", True, "yes")

        core.echo_test_action("turn it over")
        await it.turn_over()
        core.expect(it.is_face_up, "it is face up", True, "yes")

        # a number card:  its rank as it is, and its picture in the row of its suit
        seven = Card(rank=7, suit="hearts", direction="up")
        core.expect(seven.short_name, "the short name of the seven", "7♥️", "\"7♥️\"")
        core.expect(seven.color, "the color of the seven", "red", "red")
        core.expect(seven.picture, "the picture of the seven", "🂷", "\"🂷\"")
        core.expect(
            Card(rank="ace", suit="clubs").picture,
            "the picture of a new card whose rank is ace and suit is clubs",
            "🃑",
            "\"🃑\"",
        )
        core.expect(
            Card(rank="king", suit="diamonds").picture,
            "the picture of a new card whose rank is king and suit is diamonds",
            "🃎",
            "\"🃎\"",
        )


async def test_jokers() -> Any:
    with core.test("test jokers"):
        core.echo_test_action("get a new joker whose color is red and direction is up")
        it = Joker(color="red", direction="up")
        core.echo(it)
        core.expect(isinstance(it, Joker), "it is a joker", True, "yes")
        core.expect(isinstance(it, Card), "it is a card", True, "yes")
        core.expect(it.color, "its color", "red", "red")
        core.expect(it.name, "its name", "red-joker", "\"red-joker\"")
        core.expect(it.short_name, "its short name", "🃏", "\"🃏\"")
        core.expect(it.picture, "its picture", "🂿", "\"🂿\"")
        core.expect(it.is_the_color_joker("red"), "it is the red joker", True, "yes")
        core.expect(it.is_the_color_joker("black"), "it is the black joker", False, "no")
        core.expect(
            not it.is_the_color_joker("black"),
            "it is not the black joker",
            True,
            "yes",
        )

        core.expect(it.is_face_up, "it is face up", True, "yes")
        core.echo_test_action("turn it over")
        await it.turn_over()
        core.expect(it.is_face_down, "it is face down", True, "yes")

        core.echo_test_action("set black joker to a new joker whose color is black")
        black_joker = Joker(color="black")
        core.expect(black_joker.picture, "the picture of black joker", "🃏", "\"🃏\"")

        core.echo_test_action(
            "set the card to a new card whose rank is queen and suit is spades",
        )
        card = Card(rank="queen", suit="spades")
        core.expect(isinstance(card, Joker), "the card is a joker", False, "no")
        core.expect(not isinstance(card, Joker), "the card is not a joker", True, "yes")
        core.expect(card.is_the_color_joker("red"), "the card is the red joker", False, "no")


# -----------


######################################################################################################
# ## A deck:  the 52 cards of a US standard deck, ace of clubs first -- and its two jokers, if you ask
######################################################################################################


class Deck(List):
    """It reads the card's own suits and ranks:  `card suits`, `card ranks`."""

    item_type = Card

    # no jokers, unless it's made `with jokers`
    # - its "jokers" is yes or no
    jokers = prop(type="choice")

    def create(self) -> None:
        """a new deck holds one of each card, ace of clubs first, then its two jokers, red then black"""
        for rank in Card.RANKS:
            for suit in Card.SUITS:
                # `the deck`, not `it`:  in a `for each`, `it` is the loop's item, here the suit
                self.append(Card(rank=rank, suit=suit))
        if self.jokers:
            self.append(Joker(color="red"))
            self.append(Joker(color="black"))

    def display(self) -> None:
        """echo its cards' short names, top to bottom"""
        card_names = List(item_type="text")
        for card in self:
            card_names.append(card.short_name)
        core.echo(f"deck: {card_names}")


def test_deck_creation() -> Any:
    """Tests"""
    with core.test("test deck creation"):
        core.echo_test_action("the deck is a new deck")
        deck = Deck()
        core.expect(len(deck), "the number of cards in the deck", 52, "52")
        core.echo_test_action(
            "set the queens to the cards in the deck where the rank of the card is queen",
        )
        queens = deck.filter(lambda card: card.rank == "queen")
        core.expect(len(queens), "the number of cards in the queens", 4, "4")
        core.expect(
            getattr(deck.first_item, "name", None),
            "the name of the top card of the deck",
            "ace-of-clubs",
            "\"ace-of-clubs\"",
        )
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
        core.expect(
            deck.first_item.is_the_rank_of_suits("ace", "clubs"),
            "the first card of the deck is the ace of clubs",
            True,
            "yes",
        )

        core.echo("the deck before shuffling:")
        core.echo_test_action("display the deck")
        deck.display()
        core.echo_test_action("shuffle the deck")
        deck.randomize()
        core.expect(len(deck), "the number of cards in the deck", 52, "52")
        core.echo("the deck after shuffling:")
        core.echo_test_action("display the deck")
        deck.display()


def test_deck_with_jokers() -> Any:
    with core.test("test deck with jokers"):
        core.echo_test_action("the deck is a new deck with jokers")
        deck = Deck(jokers=True)
        core.expect(len(deck), "the number of cards in the deck", 54, "54")
        core.echo_test_action("set wild cards to the cards in the deck where it is a joker")
        wild_cards = deck.filter(lambda card: isinstance(card, Joker))
        core.expect(len(wild_cards), "the number of cards in wild cards", 2, "2")
        core.expect(
            deck.first_item.is_the_rank_of_suits("ace", "clubs"),
            "the first card of the deck is the ace of clubs",
            True,
            "yes",
        )
        # the red joker, then the black one, last
        core.expect(
            deck.last_item.is_the_color_joker("black"),
            "the last card of the deck is the black joker",
            True,
            "yes",
        )
        core.expect(
            getattr(deck.last_item, "name", None),
            "the name of the bottom card of the deck",
            "black-joker",
            "\"black-joker\"",
        )


# -----------


#########################################################
# ## A pile of cards, e.g. a game's stock or its discards
#########################################################


class Pile(DrawableList):
    """
    The game that uses these cards names its piles, and says what each kind of pile takes.
    A drawable list:  its element holds its cards' elements, e.g. `<solitaire-pile>` around `<solitaire-card>`s.
    """

    item_type = Card

    # what the game calls it, e.g. "stock"
    # - its "name" is text
    name = prop(type="text")

    @property
    def color(self) -> Any:
        """the color and value of its last card:  what the next card goes on"""
        if not self:
            return "none"
        return self.last_item.color

    @property
    def value(self) -> float:
        if not self:
            return 0
        return self.last_item.value

    @property
    def state(self) -> str:
        """its name, then each card's state, e.g. "stock: Q♠️+ 7♥️—\""""
        state = f"{self.name or "pile"}:"
        for card in self:
            state = f"{state} {card.state}"
        return state

    exclusive = True


# a card is in one pile at a time:  putting it on another pile takes it off this one


def test_piles() -> Any:
    """Tests"""
    with core.test("test piles"):
        core.echo_test_action("set the stock to a new pile with name = \"stock\"")
        stock = Pile(name="stock")
        core.echo_test_action("set the discards to a new pile with name = \"discards\"")
        discards = Pile(name="discards")
        core.expect(stock.color, "the color of the stock", "none", "\"none\"")
        core.expect(stock.value, "the value of the stock", 0, "0")

        core.echo_test_action(
            "add (a new card whose rank is queen, suit is spades and direction is up) to the stock",
        )
        stock.append(Card(rank="queen", suit="spades", direction="up"))
        core.echo_test_action(
            "add (a new card whose rank is 7, suit is hearts and direction is down) to the stock",
        )
        stock.append(Card(rank=7, suit="hearts", direction="down"))
        core.expect(stock.color, "the color of the stock", "red", "red")
        core.expect(stock.value, "the value of the stock", 7, "7")
        core.expect(
            stock.state,
            "the state of the stock",
            "stock: Q♠️+ 7♥️—",
            "\"stock: Q♠️+ 7♥️—\"",
        )

        # a card is in one pile at a time
        card = stock.last_item
        core.echo_test_action("add the card to the discards")
        discards.append(card)
        core.expect(len(stock), "the number of cards in the stock", 1, "1")
        core.expect(
            getattr(card, "pile", None) == discards,
            "the pile of the card is the discards",
            True,
            "yes",
        )
        core.expect(
            discards.state,
            "the state of the discards",
            "discards: 7♥️—",
            "\"discards: 7♥️—\"",
        )


# -----------


#######################
# ## Klondike Solitaire
#######################
# See [wikipedia](https://en.wikipedia.org/wiki/Klondike_(solitaire)) for its rules, and what each pile is called.
# The cards, the deck and the piles are this project's own:  Card, Deck and Pile.
# This file adds the game, its kinds of piles, what each may take or give up, and how each is laid out.
# What's where, top to bottom:
#   the solitaire:  its piles, its moves, auto play and drawing
#   playing a card:  what a click does
#   start
#   the piles:  each kind, what it may take or give up, and how it draws
#   tests


class StackedPile(Pile):
    """a stacked pile:  its cards on top of each other, the last one showing, over a place for the first"""

    css = "\n  :host {\n  \tdisplay: block;\n  \tposition: relative;\n  \tmin-height: 6.5rem;\n  }\n  /* where its first card goes:  a card-sized outline */\n  .Placeholder {\n  \tposition: absolute;\n  \ttop: 1.5rem;\n  \tleft: 0.3rem;\n  \twidth: 4.25rem;\n  \theight: 5.65rem;\n  \tbox-sizing: border-box;\n  \tborder: 2px dashed #c8c8c8;\n  \tborder-radius: 0.4rem;\n  \tdisplay: flex;\n  \talign-items: center;\n  \tjustify-content: center;\n  \tfont-size: 2rem;\n  \tcursor: pointer;\n  }\n  ::slotted(*) {\n  \tposition: absolute;\n  \ttop: 0;\n  \tleft: 0;\n  }\n"


class StockPile(StackedPile):
    """the stock:  the cards not played yet, face down;  a click turns the next one over"""

    def can_take(self, card: Card) -> bool:
        return False

    def can_give_up(self, card: Card) -> bool:
        return card == self.last_item

    def draw(self) -> Any:
        async def _each_1(event: Any) -> Any:
            return await solitaire.play_from_the_stock()

        return h(
            "div",
            {"class": "Stock"},
            h("div", {"class": "Placeholder", "onClick": _each_1}),
            h("slot"),
        )


class DiscardPile(StackedPile):
    """the discards:  where the stock's cards go as they're turned over"""

    def can_take(self, card: Card) -> bool:
        return False

    def can_give_up(self, card: Card) -> bool:
        return card == self.last_item


class Foundation(StackedPile):
    """a foundation:  where a suit is built up, ace to king"""

    # - its "suit" is a suit
    suit = prop(one_of=lambda: Card.SUITS)

    def can_give_up(self, card: Card) -> bool:
        return False

    def can_take(self, card: Card) -> bool:
        """one card at a time:  the last of its pile"""
        assert card.pile is not None
        if card != card.pile.last_item:
            return False
        return self.suit == card.suit and self.value + 1 == card.value

    def draw(self) -> Any:
        return h(
            "div",
            {"class": "Foundation"},
            h("div", {"class": "Placeholder"}, Suit.symbol(self.suit)),
            h("slot"),
        )


class Tableau(Pile):
    """a tableau:  a column, built down from king to ace, red and black in turn"""

    def can_give_up(self, card: Card) -> bool:
        return card.is_face_up

    def can_take(self, card: Card) -> bool:
        if not self:
            return card.is_a_rank("king")
        return self.color != card.color and self.value == card.value + 1

    css = "\n  :host {\n  \tdisplay: block;\n  \tmin-height: 30rem;\n  }\n  /* each card below the one before, its top showing;  the last one whole */\n  ::slotted(*) {\n  \tdisplay: block;\n  }\n  ::slotted(:not(:last-child)) {\n  \theight: 2.6rem;\n  \toverflow: hidden;\n  }\n"


class Solitaire(App):
    """The solitaire:  its piles, its moves, auto play and drawing"""

    # - its "score" is a number
    score = prop(type="number")

    # - its "deck" is a new deck
    deck = prop(init=lambda: Deck(), early=True)

    # one of each pile, made with the solitaire
    # - its "stock" is a new stock pile with name = "stock"
    stock = prop(init=lambda: StockPile(name="stock"), early=True)

    # - its "discards" is a new discard pile with name = "discards"
    discards = prop(init=lambda: DiscardPile(name="discards"), early=True)

    # - its "clubs" is a new foundation with name = "clubs", suit = clubs
    clubs = prop(init=lambda: Foundation(name="clubs", suit="clubs"), early=True)

    # - its "diamonds" is a new foundation with name = "diamonds", suit = diamonds
    diamonds = prop(init=lambda: Foundation(name="diamonds", suit="diamonds"), early=True)

    # - its "hearts" is a new foundation with name = "hearts", suit = hearts
    hearts = prop(init=lambda: Foundation(name="hearts", suit="hearts"), early=True)

    # - its "spades" is a new foundation with name = "spades", suit = spades
    spades = prop(init=lambda: Foundation(name="spades", suit="spades"), early=True)

    # - its "T1" is a new tableau with name = "T1"
    t1 = prop(init=lambda: Tableau(name="T1"), early=True)

    # - its "T2" is a new tableau with name = "T2"
    t2 = prop(init=lambda: Tableau(name="T2"), early=True)

    # - its "T3" is a new tableau with name = "T3"
    t3 = prop(init=lambda: Tableau(name="T3"), early=True)

    # - its "T4" is a new tableau with name = "T4"
    t4 = prop(init=lambda: Tableau(name="T4"), early=True)

    # - its "T5" is a new tableau with name = "T5"
    t5 = prop(init=lambda: Tableau(name="T5"), early=True)

    # - its "T6" is a new tableau with name = "T6"
    t6 = prop(init=lambda: Tableau(name="T6"), early=True)

    # - its "T7" is a new tableau with name = "T7"
    t7 = prop(init=lambda: Tableau(name="T7"), early=True)

    def create(self) -> None:
        """
        once, as the solitaire is made:  every card of the deck into the stock
        - its deck and piles are made with it, before this runs
        - inside the loop `it` is the card:  so the stock is `the stock of solitaire`
        """
        for card in self.deck:
            self.stock.append(card)

    def debug(self) -> None:
        """print each pile's cards, e.g. "stock: Q♠️— 7♥️—\""""
        for pile in core.every_thing(Pile):
            print(pile.state)

    async def reset_the_stock(self) -> None:
        """the discards, turned over, back into the stock"""
        cards = self.discards.clone()
        cards.reverse()
        for card in cards:
            self.stock.append(card)
            await card.turn_face_down()

    async def play_from_the_stock(self) -> None:
        """turn the stock's next card over, onto the discards"""
        if core.process_is_running("play_from_the_stock"):
            return
        core.start_process("play_from_the_stock", "EXCLUSIVE")
        try:
            if not self.stock:
                await self.reset_the_stock()

            it = self.stock.last_item
            await it.turn_face_up()
            self.discards.append(it)
        finally:
            core.stop_process("play_from_the_stock")

    async def deal_the_cards(self) -> None:
        """gather every card of its deck into the stock, shuffle it, and deal the tableaus:  one card more in each, left to right"""
        if core.process_is_running("deal_the_cards"):
            return
        core.start_process("deal_the_cards", "EXCLUSIVE")
        try:
            for card in self.deck:
                start_pile = card.pile
                await card.turn_face_down()
                if start_pile != self.stock:
                    self.stock.append(card)
                    await core.pause_for(50, "msec")
            self.stock.randomize()

            for row in range(1, 8):
                await self.stock.last_item.turn_face_up()
                for column in core.get_range(row, 7):
                    core.get_item_at(core.every_thing(Tableau), position(column)).append(self.stock.last_item)
                    await core.pause_for(50, "msec")

            await self.play_from_the_stock()
        finally:
            core.stop_process("deal_the_cards")

    async def start_a_new_game(self) -> None:
        self.score = 0
        await self.deal_the_cards()

    async def cheat(self) -> None:
        """turn up a face-down card from a tableau, at random, onto the discards"""
        remaining_piles = core.filter(
            core.every_thing(Tableau),
            lambda pile: (pile) and getattr(pile.first_item, "is_face_down", None),
        )
        if core.is_empty(remaining_piles):
            return
        pile = core.random_item_of(remaining_piles)
        hidden_cards = pile.filter(lambda card: card.is_face_down)
        card = hidden_cards.random_item()
        await card.turn_face_up()
        await core.pause_for(30, "ticks")
        self.discards.append(card)

    async def auto_play(self) -> None:
        """play every card that can go somewhere, until none can"""
        anything_changed = False
        if self.discards:
            test_card = self.discards.last_item
            if await test_card.play():
                anything_changed = True
                await core.pause_for(500, "msec")

        # each tableau's last card onto its foundation
        for pile in core.every_thing(Tableau):
            if not pile:
                continue
            test_card = pile.last_item
            foundation = core.filter(core.every_thing(Foundation), lambda pile: pile.suit == test_card.suit).first_item
            if core.can_take(foundation, test_card):
                anything_changed = True
                await test_card.play()
                await core.pause_for(100, "msec")

        # each tableau's face-up cards, all together, onto another tableau
        for pile in core.every_thing(Tableau):
            face_up_cards = pile.filter(lambda card: card.is_face_up)
            if not face_up_cards:
                continue
            test_card = face_up_cards.first_item
            if test_card.is_a_rank("king") and test_card == pile.first_item:
                continue
            if await test_card.play():
                anything_changed = True
                await core.pause_for(500, "msec")

        if anything_changed:
            await self.auto_play()

    def draw(self) -> Any:
        async def _each_1(event: Any) -> Any:
            return await self.auto_play()

        async def _each_2(event: Any) -> Any:
            return await self.cheat()

        async def _each_3(event: Any) -> Any:
            return await self.start_a_new_game()

        return h(
            "ui-container",
            h(
                "ui-menu",
                h("ui-item", {"type": "header"}, "Klondike Solitaire"),
                h("ui-item", f"Score: {self.score}"),
                h(
                    "ui-menu",
                    {"position": "right"},
                    h("ui-item", {"onClick": _each_1}, "AutoPlay"),
                    h("ui-item", {"onClick": _each_2}, "Cheat"),
                    h("ui-item", {"onClick": lambda event: self.debug()}, "Debug"),
                    h("ui-item", {"onClick": _each_3}, "Restart"),
                ),
            ),
            h(
                "ui-grid",
                {"columns": "7"},
                h(
                    "ui-row",
                    h("ui-column", core.draw_thing(self.stock)),
                    h("ui-column", core.draw_thing(self.discards)),
                    h("ui-column"),
                    h("ui-column", core.draw_thing(self.clubs)),
                    h("ui-column", core.draw_thing(self.diamonds)),
                    h("ui-column", core.draw_thing(self.hearts)),
                    h("ui-column", core.draw_thing(self.spades)),
                ),
                h(
                    "ui-row",
                    h("ui-column", core.draw_thing(self.t1)),
                    h("ui-column", core.draw_thing(self.t2)),
                    h("ui-column", core.draw_thing(self.t3)),
                    h("ui-column", core.draw_thing(self.t4)),
                    h("ui-column", core.draw_thing(self.t5)),
                    h("ui-column", core.draw_thing(self.t6)),
                    h("ui-column", core.draw_thing(self.t7)),
                ),
            ),
        )


solitaire = Solitaire()


@core.on("card-click")
async def on_card_click(event: Any) -> None:
    card = event.card
    await card.play()


# Start
core.console.log(solitaire)
asyncio.run(solitaire.start_a_new_game())
solitaire.start()

#########################################################################
# ## The piles:  each kind, what it may take or give up, and how it draws
#########################################################################
# Each pile is a drawable list:  an element of its own, e.g. `<solitaire-tableau>`, around its cards' elements.
# So each kind styles itself, in its `<css>`, and where its cards go:  styles.css can't reach inside it.


async def test_the_moves() -> Any:
    """Tests"""
    with core.test("test the moves"):
        core.echo_test_action("set the column to a new tableau with name = \"T1\"")
        column = Tableau(name="T1")
        core.echo_test_action(
            "set the king to a new card whose rank is king, suit is spades and direction is up",
        )
        king = Card(rank="king", suit="spades", direction="up")
        core.echo_test_action(
            "set the queen to a new card whose rank is queen, suit is hearts and direction is up",
        )
        queen = Card(rank="queen", suit="hearts", direction="up")
        core.echo_test_action(
            "set the jack to a new card whose rank is jack, suit is clubs and direction is up",
        )
        jack = Card(rank="jack", suit="clubs", direction="up")
        # an empty tableau takes only a king, then one lower in the other color
        core.expect(core.can_take(column, queen), "the column can take the queen", False, "no")
        core.expect(core.can_take(column, king), "the column can take the king", True, "yes")
        core.echo_test_action("add the king to the column")
        column.append(king)
        core.expect(core.can_take(column, jack), "the column can take the jack", False, "no")
        core.expect(core.can_take(column, queen), "the column can take the queen", True, "yes")
        core.echo_test_action("add the queen to the column")
        column.append(queen)
        core.expect(
            column.state,
            "the state of the column",
            "T1: K♠️+ Q♥️+",
            "\"T1: K♠️+ Q♥️+\"",
        )
        core.expect(
            core.can_give_up(column, queen),
            "the column can give up the queen",
            True,
            "yes",
        )
        core.echo_test_action("turn the queen face down")
        await queen.turn_face_down()
        core.expect(
            core.can_give_up(column, queen),
            "the column can give up the queen",
            False,
            "no",
        )

        # a foundation takes its suit, ace first, then one higher:  each the last card of its pile
        foundation = Foundation(name="hearts", suit="hearts")
        core.echo_test_action(
            "set the two to a new card whose rank is 2, suit is hearts and direction is up",
        )
        two = Card(rank=2, suit="hearts", direction="up")
        core.echo_test_action(
            "set the ace to a new card whose rank is ace, suit is hearts and direction is up",
        )
        ace = Card(rank="ace", suit="hearts", direction="up")
        core.echo_test_action("set the column to a new tableau with name = \"T2\"")
        column = Tableau(name="T2")
        core.echo_test_action("add the two to the column")
        column.append(two)
        core.echo_test_action("add the ace to the column")
        column.append(ace)
        core.expect(
            core.can_take(foundation, two),
            "the foundation can take the two",
            False,
            "no",
        )
        core.expect(
            core.can_take(foundation, ace),
            "the foundation can take the ace",
            True,
            "yes",
        )
        core.echo_test_action("move the ace to the foundation")
        core.move(ace, foundation)
        core.expect(
            core.can_take(foundation, two),
            "the foundation can take the two",
            True,
            "yes",
        )
        core.echo_test_action("add the queen to the column")
        column.append(queen)
        core.expect(
            core.can_take(foundation, queen),
            "the foundation can take the queen",
            False,
            "no",
        )


# -----------


core.install_styles(None, """/* File styles.css:  the board's own styles.
   Each kind of pile styles itself, and where its cards go:  its <css>, in Solitaire.spell.
   A pile is a drawable list, drawn in its own element's shadow root, which styles here can't reach. */
""")


# -----------


asyncio.run(test_card_setup())
asyncio.run(test_jokers())
test_deck_creation()
test_deck_with_jokers()
test_piles()
asyncio.run(test_the_moves())
