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
    A drawable thing:  each card is its own element on the page, e.g. `<cards-card>`.
    """

    element_tag = "test-project-card"

    # card rank
    # - its "rank" is one of ace, 2 ... 10, jack, queen, king
    RANKS = ("ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king")
    rank = prop(one_of=RANKS)

    @property
    def value(self) -> float:
        """ace = 1 ... king = 13"""
        return spell_position(core.position_of(Card.RANKS, self.rank))

    def is_a_rank(self, rank: Any) -> bool:
        """\"card is a king\""""
        return self.rank == rank

    @property
    def is_a_face_card(self) -> bool:
        """\"card is a face card\""""
        return self.rank in ["jack", "queen", "king"]

    @property
    def is_a_number_card(self) -> bool:
        """\"card is a number card\""""
        return not self.is_a_face_card

    # card suit
    # - its "suit" is one of clubs, diamonds, hearts or spades
    SUITS = ("clubs", "diamonds", "hearts", "spades")
    suit = prop(one_of=SUITS)

    def is_a_suit(self, suit: Any) -> bool:
        """\"card is a diamond\""""
        return self.suit == suit

    @property
    def color(self) -> Any:
        if self.suit in ["diamonds", "hearts"]:
            return "red"
        return "black"

    # specific cards
    # "queen of spades"

    @property
    def name(self) -> str:
        return f"{self.rank} of {self.suit}"

    def is_the_rank_of_suit(self, rank: Any, suit: Any) -> bool:
        """\"card is the queen of spades\""""
        return self.rank == rank and self.suit == suit

    # its direction:  face up or face down
    # - its "direction" is up or down
    DIRECTIONS = ("up", "down")
    direction = prop(one_of=DIRECTIONS)

    def is_face_direction(self, direction: Any) -> bool:
        """card is face up"""
        return self.direction == direction

    ##########################
    # ## turning the card over
    ##########################

    async def turn_face_up(self) -> None:
        """each pauses a moment, so `wait for: turn the card face up` animates"""
        self.direction = "up"
        await core.pause_for(50, "msec")

    async def turn_face_down(self) -> None:
        self.direction = "down"
        await core.pause_for(50, "msec")

    async def turn_over(self) -> None:
        if self.is_face_direction("up"):
            await self.turn_face_down()
        else:
            await self.turn_face_up()

    @property
    def picture(self) -> Any:
        """
        Card picture:  drawn with special letters in the unicode character set
        - SEE:  https://www.compart.com/en/unicode/block/U+1F0A0
        """
        if self.is_face_direction("down"):
            # "Playing Card Back"
            return "🂠"

        column = self.value
        if self.is_a_suit("clubs"):
            return core.get_item_at(
                ["🃑", "🃒", "🃓", "🃔", "🃕", "🃖", "🃗", "🃘", "🃙", "🃚", "🃛", "🃝", "🃞"],
                position(column),
            )
        if self.is_a_suit("diamonds"):
            return core.get_item_at(
                ["🃁", "🃂", "🃃", "🃄", "🃅", "🃆", "🃇", "🃈", "🃉", "🃊", "🃋", "🃍", "🃎"],
                position(column),
            )
        if self.is_a_suit("hearts"):
            return core.get_item_at(
                ["🂱", "🂲", "🂳", "🂴", "🂵", "🂶", "🂷", "🂸", "🂹", "🂺", "🂻", "🂽", "🂾"],
                position(column),
            )
        if self.is_a_suit("spades"):
            return core.get_item_at(
                ["🂡", "🂢", "🂣", "🂤", "🂥", "🂦", "🂧", "🂨", "🂩", "🂪", "🂫", "🂭", "🂮"],
                position(column),
            )

    def draw(self) -> Any:
        """one letter, at the size of the text around it:  its pile scales it to fit -- styles.css"""
        return h(
            "ui-text",
            {
                "part": "picture",
                "color": self.color if self.is_face_direction("up") else "blue",
                "onClick": lambda event: core.trigger("card-click", card=self),
                "style": "cursor:pointer;user-select:none",
            },
            self.picture,
        )

    @property
    def symbol(self) -> Any:
        if self.is_a_suit("clubs"):
            return "♣"
        if self.is_a_suit("diamonds"):
            return "♦"
        if self.is_a_suit("hearts"):
            return "♥"
        if self.is_a_suit("spades"):
            return "♠"
        return "?"

    @property
    def state(self) -> str:
        """card "state", used for debugging"""
        rank = 10 if self.value == 10 else core.upper_case(core.get_item_at(self.rank, 0))
        suit = self.symbol
        direction = "↑" if self.is_face_direction("up") else "↓"
        return f"{rank}{suit}{direction}"

    #################################################
    # ## Playing a card:  what a click or a drag does
    #################################################

    async def play(self) -> Any:
        """
        the card, and every card on it, onto the first pile that can take it;  it says whether it moved
        - the stock's card is turned over onto the discards instead
        """
        if self.pile == solitaire.stock:
            await solitaire.play_from_the_stock()
            return

        end_pile = core.filter(core.every_thing(Pile), lambda pile: core.can_take(pile, self)).first_item
        if end_pile is None:
            return False
        return await self.put_on_pile(end_pile)

    async def put_on_pile(self, pile: Pile) -> bool:
        """
        the card, and every card on it, onto the pile, if the piles' rules let it go and take it;  it says whether it moved
        - the pile it left turns its new last card up, and the move scores
        """
        start_pile = self.pile
        assert start_pile is not None
        if not core.can_give_up(start_pile, self):
            return False
        if not core.can_take(pile, self):
            return False

        moving_cards = start_pile.starting_with(self)
        moving_cards.name = start_pile.name
        print(f"moving ({moving_cards.state}) to ({pile.state})")

        for card in moving_cards:
            core.move(card, pile)

        if isinstance(start_pile, Tableau) and (start_pile):
            await core.pause_for(200, "msec")
            it = start_pile.last_item
            print(f"turning over ({start_pile.name}: {getattr(it, "state", None)})")
            await it.turn_face_up()

        if isinstance(pile, Foundation):
            solitaire.score = solitaire.score + 10
        elif start_pile == solitaire.discards:
            solitaire.score = solitaire.score + 5
        return True

    can_be_dragged = True

    @property
    def pile(self) -> Pile | None:
        return Pile.owner_of(self)


########################################################################
# ## drawing:  its picture face up, the back every card shares face down
########################################################################
# on the page, a card can be dragged to another pile:  its pile's rules say which cards it gives up


class Joker(Card):
    """A joker:  a wild card with no rank or suit -- there's a red one and a black one"""

    element_tag = "test-project-joker"

    # - its "color" is one of red or black
    COLORS = ("red", "black")
    color = prop(one_of=COLORS)

    @staticmethod
    def is_the_color_joker(card: Card, color: Any) -> bool:
        """\"card is the red joker\""""
        return isinstance(card, Joker) and card.color == color

    @property
    def value(self) -> float:
        if Joker.is_the_color_joker(self, "red"):
            return 53
        return 54

    @property
    def picture(self) -> str:
        return "🃟"

    @property
    def name(self) -> str:
        return f"{self.color} joker"

    @property
    def state(self) -> str:
        color = core.upper_case(core.get_item_at(self.color, 0))
        direction = "↑" if self.is_face_direction("up") else "↓"
        return f"*{color}{direction}"


async def test_card_setup() -> Any:
    """Tests"""
    with core.test("test card setup"):
        core.echo_test_action(
            "get a new card whose rank is queen, suit is spades and direction is down",
        )
        it = Card(rank="queen", suit="spades", direction="down")
        core.echo(f"testing the {it.name}")
        core.expect(it.rank, "its rank", "queen", "queen")
        core.expect(it.suit, "its suit", "spades", "spades")
        core.expect(it.name, "its name", "queen of spades", "\"queen of spades\"")
        core.expect(it.color, "its color", "black", "black")
        core.expect(it.value, "its value", 12, "12")
        core.expect(it.state, "its state", "Q♠↓", "\"Q♠↓\"")

        core.expect(it.is_face_direction("down"), "it is face down", True, "yes")
        core.expect(it.picture, "its picture", "🂠", "\"🂠\"")
        core.echo_test_action("turn it face up")
        await it.turn_face_up()
        core.expect(it.is_face_direction("up"), "it is face up", True, "yes")
        core.expect(it.picture, "its picture", "🂭", "\"🂭\"")

        core.expect(it.is_a_face_card, "it is a face card", True, "yes")
        core.expect(not it.is_a_number_card, "it is not a number card", True, "yes")

        core.expect(it.is_a_suit("spades"), "it is a spade", True, "yes")
        core.expect(it.is_a_suit("clubs"), "it is a club", False, "no")

        core.expect(it.is_a_rank("queen"), "it is a queen", True, "yes")
        core.expect(it.is_a_rank("ace"), "it is an ace", False, "no")
        core.expect(it.is_a_rank(2), "it is a 2", False, "no")

        core.expect(
            it.is_the_rank_of_suit("queen", "spades"),
            "it is the queen of spades",
            True,
            "yes",
        )
        core.expect(
            it.is_the_rank_of_suit("queen", "clubs"),
            "it is the queen of clubs",
            False,
            "no",
        )
        core.expect(it.is_the_rank_of_suit(2, "clubs"), "it is the 2 of clubs", False, "no")
        # it is the red joker should be no

        # a number card:  its rank as it is, and its picture in the row of its suit
        seven = Card(rank=7, suit="hearts", direction="up")
        core.echo(f"testing the {seven.name}")
        core.expect(seven.is_a_number_card, "seven is a number card", True, "yes")
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
        core.expect(isinstance(it, Card), "it is a card", True, "yes")
        core.expect(isinstance(it, Joker), "it is a joker", True, "yes")
        core.expect(it.color, "its color", "red", "red")
        core.expect(it.name, "its name", "red joker", "\"red joker\"")
        core.expect(it.state, "its state", "*R↑", "\"*R↑\"")
        core.expect(it.picture, "its picture", "🃟", "\"🃟\"")
        core.expect(Joker.is_the_color_joker(it, "red"), "it is the red joker", True, "yes")
        core.expect(Joker.is_the_color_joker(it, "black"), "it is the black joker", False, "no")
        core.expect(
            not Joker.is_the_color_joker(it, "black"),
            "it is not the black joker",
            True,
            "yes",
        )

        core.expect(it.is_face_direction("up"), "it is face up", True, "yes")
        core.echo_test_action("turn it over")
        await it.turn_over()
        core.expect(it.is_face_direction("down"), "it is face down", True, "yes")

        core.echo_test_action("set black joker to a new joker whose color is black")
        black_joker = Joker(color="black")
        core.expect(black_joker.picture, "the picture of black joker", "🃟", "\"🃟\"")

        core.echo_test_action(
            "set the card to a new card whose rank is queen and suit is spades",
        )
        card = Card(rank="queen", suit="spades")
        core.expect(isinstance(card, Joker), "the card is a joker", False, "no")
        core.expect(not isinstance(card, Joker), "the card is not a joker", True, "yes")
        core.expect(
            Joker.is_the_color_joker(card, "red"),
            "the card is the red joker",
            False,
            "no",
        )


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

    async def create(self) -> None:
        """a new deck holds one of each card, ace of clubs first, then its two jokers, red then black"""
        for rank in Card.RANKS:
            for suit in Card.SUITS:
                self.append(Card(rank=rank, suit=suit))
        if self.jokers:
            self.append(Joker(color="red"))
            self.append(Joker(color="black"))
        for card in self:
            await card.turn_face_down()

    @property
    def state(self) -> str:
        """echo its cards' short names, top to bottom"""
        card_names = List(item_type="text")
        for card in self:
            card_names.append(card.state)
        return f"deck: {card_names}"


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
        # ace of clubs is the top card
        core.expect(
            getattr(deck.first_item, "name", None),
            "the name of the top card of the deck",
            "ace of clubs",
            "\"ace of clubs\"",
        )
        core.expect(
            getattr(deck.first_item, "state", None),
            "the state of the top card of the deck",
            "A♣↓",
            "\"A♣↓\"",
        )
        core.expect(
            getattr(deck.first_item, "direction", None),
            "the direction of the top card of the deck",
            "down",
            "down",
        )
        core.expect(
            deck.first_item.is_the_rank_of_suit("ace", "clubs"),
            "the first card of the deck is the ace of clubs",
            True,
            "yes",
        )

        core.expect(
            getattr(deck.last_item, "name", None),
            "the name of the bottom card of the deck",
            "king of spades",
            "\"king of spades\"",
        )
        # no jokers!
        core.expect(
            isinstance(deck.random_item(), Joker),
            "a random card of the deck is a joker",
            False,
            "no",
        )
        core.expect(
            Joker.is_the_color_joker(deck.random_item(), "red"),
            "a random card of the deck is the red joker",
            False,
            "no",
        )

        core.echo("the deck before shuffling:")
        core.echo(deck.state)
        core.echo_test_action("shuffle the deck")
        deck.randomize()
        core.expect(len(deck), "the number of cards in the deck", 52, "52")
        core.echo("the deck after shuffling:")
        core.echo(deck.state)


def test_deck_with_jokers() -> Any:
    with core.test("test deck with jokers"):
        core.echo_test_action("the deck is a new deck with jokers")
        deck = Deck(jokers=True)
        core.expect(len(deck), "the number of cards in the deck", 54, "54")
        core.echo_test_action("set wild cards to the cards in the deck where it is a joker")
        wild_cards = deck.filter(lambda card: isinstance(card, Joker))
        core.expect(len(wild_cards), "the number of cards in wild cards", 2, "2")
        # first card is still ace of clubs
        core.expect(
            deck.first_item.is_the_rank_of_suit("ace", "clubs"),
            "the first card of the deck is the ace of clubs",
            True,
            "yes",
        )
        # last card should be the black joker
        core.expect(
            Joker.is_the_color_joker(deck.last_item, "black"),
            "the last card of the deck is the black joker",
            True,
            "yes",
        )
        core.expect(
            getattr(deck.last_item, "name", None),
            "the name of the bottom card of the deck",
            "black joker",
            "\"black joker\"",
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
    element_tag = "test-project-pile"

    # what the game calls it, e.g. "stock"
    # - its "name" is text
    name = prop(type="text")

    # how its cards lie:  on top of each other, down a column, along a row, or fanned as a hand is held -- styles.css
    # - its "layout" is one of stacked, vertical, horizontal or fanned
    LAYOUTS = ("stacked", "vertical", "horizontal", "fanned")
    layout = prop(one_of=LAYOUTS)

    @property
    def color(self) -> str:
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
        """pile state for debugging"""
        state = f"{self.name or "pile"}:"
        for card in self:
            state = f"{state} {card.state}"
        return state

    can_be_dropped_on = True

    exclusive = True


# on the page, a card can be dropped on it:  it glows when it would take the card, by its own rules

# a card is in one pile at a time:  putting it on another pile takes it off this one


def test_piles() -> Any:
    """Tests"""
    with core.test("test piles"):
        core.echo_test_action("set the stock to a new pile with name = \"stock\"")
        stock = Pile(name="stock")
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
        core.echo(stock.state)
        core.expect(stock.color, "the color of the stock", "red", "red")
        core.expect(stock.value, "the value of the stock", 7, "7")
        core.expect(
            stock.state,
            "the state of the stock",
            "stock: Q♠↑ 7♥↓",
            "\"stock: Q♠↑ 7♥↓\"",
        )

        # a card can only be in one pile at a time
        discards = Pile(name="discards")

        core.echo_test_action("get the last card of the stock")
        it = stock.last_item
        core.echo_test_action("add it to the discards")
        discards.append(it)
        core.expect(
            getattr(it, "pile", None) == discards,
            "its pile is the discards",
            True,
            "yes",
        )

        core.expect(len(stock), "the number of cards in the stock", 1, "1")
        core.expect(len(discards), "the number of cards in the discards", 1, "1")
        core.expect(
            discards.state,
            "the state of the discards",
            "discards: 7♥↓",
            "\"discards: 7♥↓\"",
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
#   playing a card:  what a click or a drag does
#   start
#   the piles:  each kind, what it may take or give up, and how it lies
#   tests


class StockPile(Pile):
    """the stock:  the cards not played yet, face down;  a click turns the next one over"""

    element_tag = "test-project-stock-pile"

    @property
    def layout(self) -> str:
        return "stacked"

    def can_take(self, card: Card) -> bool:
        """a click turns its card over:  none can be taken from it, so none can be dragged"""
        return False

    def can_give_up(self, card: Card) -> bool:
        return False

    # empty:  a light grey card, face down -- a click turns the discards back over

    def draw_its_placeholder(self) -> Any:
        async def _each_1(event: Any) -> Any:
            return await solitaire.play_from_the_stock()

        return h(
            "div",
            {"part": "placeholder", "onClick": _each_1, "style": "cursor:pointer;user-select:none"},
            "🂠",
        )


class DiscardPile(Pile):
    """the discards:  where the stock's cards go as they're turned over"""

    element_tag = "test-project-discard-pile"

    @property
    def layout(self) -> str:
        return "stacked"

    def can_take(self, card: Card) -> bool:
        return False

    def can_give_up(self, card: Card) -> bool:
        return card == self.last_item


class Foundation(Pile):
    """a foundation:  where a suit is built up, ace to king"""

    element_tag = "test-project-foundation"

    @property
    def layout(self) -> str:
        return "stacked"

    # - its "suit" is a card suit
    suit = prop(one_of=lambda: Card.SUITS)

    def can_give_up(self, card: Card) -> bool:
        return False

    def can_take(self, card: Card) -> bool:
        """one card at a time:  the last of its pile"""
        assert card.pile is not None
        if card != card.pile.last_item:
            return False
        return self.suit == card.suit and self.value + 1 == card.value

    # empty:  a light grey ace of its suit, face up

    def draw_its_placeholder(self) -> Any:
        return h(
            "div",
            {"part": "placeholder"},
            Card(rank="ace", suit=self.suit, direction="up").picture,
        )


class Tableau(Pile):
    """a tableau:  a column, built down from king to ace, red and black in turn"""

    element_tag = "test-project-tableau"

    @property
    def layout(self) -> str:
        return "vertical"

    def can_give_up(self, card: Card) -> bool:
        return card.is_face_direction("up")

    def can_take(self, card: Card) -> bool:
        if not self:
            return card.is_a_rank("king")
        return self.color != card.color and self.value == card.value + 1


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

    async def create(self) -> None:
        """
        once, as the solitaire is made:  every card of the deck into the stock
        - its deck and piles are made with it, before this runs
        - inside the loop `it` is the card:  so the stock is `the stock of solitaire`
        """
        for card in self.deck:
            self.stock.append(card)

    def debug(self) -> None:
        """print each pile's cards, e.g. "stock: Q♠↓ 7♥↓\""""
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
            lambda pile: (pile) and pile.first_item.is_face_direction("down"),
        )
        if core.is_empty(remaining_piles):
            return
        pile = core.random_item_of(remaining_piles)
        hidden_cards = pile.filter(lambda card: card.is_face_direction("down"))
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
            face_up_cards = pile.filter(lambda card: card.is_face_direction("up"))
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
        """
        its menu, then its piles:  seven to a line, each a cell of its own, the third left empty
        - its buttons are icons, each with a tooltip:  the popup right after its icon shows as the pointer rests on it
        """
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
                    h(
                        "ui-item",
                        {
                            "aria-label": "Auto play",
                            "onClick": _each_1,
                            "style": "cursor:pointer;user-select:none",
                        },
                        h("ui-icon", {"name": "fast forward"}),
                        h("ui-popup", {"content": "Auto play", "inverted": True, "size": "small"}),
                    ),
                    h(
                        "ui-item",
                        {"aria-label": "Cheat", "onClick": _each_2, "style": "cursor:pointer;user-select:none"},
                        h("ui-icon", {"name": "eye"}),
                        h("ui-popup", {"content": "Cheat", "inverted": True, "size": "small"}),
                    ),
                    h(
                        "ui-item",
                        {
                            "aria-label": "Restart",
                            "onClick": _each_3,
                            "style": "cursor:pointer;user-select:none",
                        },
                        h("ui-icon", {"name": "redo"}),
                        h("ui-popup", {"content": "Restart", "inverted": True, "size": "small"}),
                    ),
                ),
            ),
            h(
                "ui-grid",
                {"class": "Board", "columns": "7"},
                core.draw_thing(self.stock),
                core.draw_thing(self.discards),
                h("div"),
                core.draw_thing(self.clubs),
                core.draw_thing(self.diamonds),
                core.draw_thing(self.hearts),
                core.draw_thing(self.spades),
                core.draw_thing(self.t1),
                core.draw_thing(self.t2),
                core.draw_thing(self.t3),
                core.draw_thing(self.t4),
                core.draw_thing(self.t5),
                core.draw_thing(self.t6),
                core.draw_thing(self.t7),
            ),
        )


solitaire = Solitaire()


@core.on("card-click")
async def on_card_click(event: Any) -> None:
    card = event.card
    await card.play()


@core.on("card-drop")
async def on_card_drop(event: Any) -> None:
    card = event.card
    pile = event.pile
    await card.put_on_pile(pile)


# Start
core.console.log(solitaire)
asyncio.run(solitaire.start_a_new_game())
solitaire.start()

########################################################################
# ## The piles:  each kind, what it may take or give up, and how it lies
########################################################################
# Each pile is a drawable list:  an element of its own, e.g. `<solitaire-tableau>`, around its cards' elements.
# How its cards lie is its layout:  styles.css draws each one.
# While it's empty, it shows its placeholder, if it has one.


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
        core.expect(column.state, "the state of the column", "T1: K♠↑ Q♥↑", "\"T1: K♠↑ Q♥↑\"")
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


core.install_styles(None, """/* File styles.css:  how the board looks -- each card, and how each pile lays its cards out.
   - Every pile and card is an element of its own on the board, so these rules reach them all:
     - a pile by its layout, e.g. <solitaire-tableau layout="vertical">
     - each card in it by its place, --index from 0, and how many there are, --count:  the pile numbers them
     - an empty pile's placeholder, which it draws itself, by its part:  ::part(placeholder)
   - A card is one letter of unicode's Playing Cards, at its pile's width:
     so a card is as wide as its column, whatever the window's width. */

/* A card's picture, in ems of its own letter (measured in Chrome on a Mac):
   0.604em wide, 0.805em tall, its left edge 0.049em into the letter;  its outline reaches a little past that, so a
   card keeps 0.008em to spare above and below. */
:root,
:host {
  /* how wide a card is, for each em of its letter */
  --card-width: 0.604;
  /* how tall it is, for each of its widths:  (0.805 + 2 x 0.008) / 0.604 */
  --card-height: 1.359;
  /* down a column, how much of each card shows under the next:  a fifth of it, its rank and suit */
  --card-step-down: 0.2;
  /* along a row, how much of each card the next one covers:  a tenth of it */
  --card-overlap: 0.1;
  /* fanned, how far each card turns from the one before */
  --card-turn: 8deg;
}

/****************
 * The board:  below the game's menu, its piles seven to a line
 ****************/

.Board {
  /* gutters that shrink with a narrow window, so the cards keep most of its width */
  --ui-grid-gutter: min(2rem, 2.5vw);
  --ui-grid-row-spacing: min(2rem, 4vw);
  /* 1.5rem below the menu:  the grid pulls itself up by half a row's spacing */
  margin-top: calc(1.5rem + var(--ui-grid-row-spacing) / 2);
}

/* A narrow window, a phone's:  the menu loses its title, so the score and buttons fit on one line */
@media (width < 36rem) {
  ui-item[type="header"] {
    display: none;
  }
}

/****************
 * A pile:  as wide as its cell of the board, and as tall as its cards
 ****************/

[layout] {
  /* a box of its own, holding its floated sizer */
  display: flow-root;
  position: relative;
  /* its cards size themselves by its width */
  container-type: inline-size;
  /* the glow when a dragged card would land here:  0.6em around its cards, inside the board's gutters */
  --spell-drop-glow-inset: calc(var(--ui-grid-row-spacing) / 2 - 0.6em) calc(var(--ui-grid-gutter) / 2 - 0.6em);
}
/* its height:  a card's, by default -- a percentage of padding is one of its width */
[layout]::before {
  content: "";
  /* floated, so its cards start at the top of its content, not below it */
  float: left;
  width: 100%;
  padding-top: calc(100% * var(--card-height));
}

/* Each card, and the placeholder:  a card's letter as wide as the pile, cut to the card it draws */
[layout] > *,
[layout]::part(placeholder) {
  position: absolute;
  display: block;
  /* where its pile's content starts, inside the cell's gutters:  its offsets in a layout are margins */
  top: auto;
  left: auto;
  font-size: calc(100cqi / var(--card-width));
  width: calc(var(--card-width) * 1em);
  height: calc(var(--card-width) * var(--card-height) * 1em);
  overflow: hidden;
  /* its letter's ink starts 0.224em below a line's top at a line height of 1:  a line of 0.568 starts it 0.008em down */
  line-height: 0.568;
  --ui-text-line-height: 0.568;
  text-indent: -0.049em;
  user-select: none;
}
/* a card's letter is only its ink:  a white face, its corners rounded as the letter's are, hides the cards below */
[layout] > * {
  background: #fff;
  border-radius: 0.035em;
}

/* An empty pile's placeholder:  a light grey card */
[layout]::part(placeholder) {
  color: #000;
  opacity: 0.15;
}
[layout]::part(placeholder):hover {
  opacity: 0.25;
}

/****************
 * The layouts:  stacked puts every card on top of the one before
 ****************/

/* vertical:  each card a step below the one before */
[layout="vertical"]::before {
  padding-top: calc(100% * var(--card-height) * (1 + (max(var(--count, 1), 1) - 1) * var(--card-step-down)));
}
[layout="vertical"] > * {
  margin-top: calc(var(--index) * var(--card-width) * var(--card-height) * 1em * var(--card-step-down));
}

/* horizontal:  side by side, each covering the edge of the one before;  smaller as there are more, to fit the pile */
[layout="horizontal"] {
  --spread: calc(1 + (max(var(--count, 1), 1) - 1) * (1 - var(--card-overlap)));
}
[layout="horizontal"]::before {
  padding-top: calc(100% * var(--card-height) / var(--spread));
}
[layout="horizontal"] > * {
  font-size: calc(100cqi / var(--card-width) / var(--spread));
  margin-left: calc(var(--index) * var(--card-width) * 1em * (1 - var(--card-overlap)));
}

/* fanned:  as a hand of cards is held, each turned a little from the one before, around a point below them */
[layout="fanned"] > * {
  font-size: calc(60cqi / var(--card-width));
  left: calc(50% - var(--card-width) * 0.5em);
  margin-top: 10%;
  transform-origin: 50% 200%;
  rotate: calc((var(--index) - (var(--count) - 1) / 2) * var(--card-turn));
}
""")


# -----------


asyncio.run(test_card_setup())
asyncio.run(test_jokers())
test_deck_creation()
test_deck_with_jokers()
test_piles()
asyncio.run(test_the_moves())
