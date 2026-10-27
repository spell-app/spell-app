from __future__ import annotations

import asyncio
from typing import Any

from spell_core import core, List, App, TwoSidedView, ViewableList, prop, h, position, spell_position


###################
# ## A playing card
###################
# A card says what its rank, suit and color are:  a deck, a pile or the game only reads them.
# It's a two sided view:  face up it shows its picture, face down the back every card shares.
# On the page each card is its own element, `<solitaire-card>`.


class Card(TwoSidedView):
    element_tag = "test-project-card"

    # - its "rank" is one of ace, 2 ... 10, jack, queen, king
    #   - it "is a (rank)"
    RANKS = ("ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king")
    rank = prop(one_of=RANKS)

    def is_a_rank(self, rank: Any) -> bool:
        return self.rank == rank

    @property
    def value(self) -> float:
        return spell_position(core.position_of(Card.RANKS, self.rank))

    @property
    def is_a_face_card(self) -> bool:
        return self.rank in ["jack", "queen", "king"]

    @property
    def is_a_number_card(self) -> bool:
        return not self.is_a_face_card

    # - its "suit" is one of clubs, diamonds, hearts or spades
    #   - it "is a (suit)"
    SUITS = ("clubs", "diamonds", "hearts", "spades")
    suit = prop(one_of=SUITS)

    def is_a_suit(self, suit: Any) -> bool:
        return self.suit == suit

    # - its "color" is one of red, black :
    #   red if it is a diamond or it is a heart
    #   black otherwise
    COLORS = ("red", "black")

    @property
    def color(self) -> str:
        if self.is_a_suit("diamonds") or self.is_a_suit("hearts"):
            return "red"
        return "black"

    @property
    def symbol(self) -> str:
        if self.is_a_suit("clubs"):
            return "♣"
        if self.is_a_suit("diamonds"):
            return "♦"
        if self.is_a_suit("hearts"):
            return "♥"
        return "♠"

    @property
    def name(self) -> str:
        return f"{self.rank} of {self.suit}"

    def is_the_rank_of_suit(self, rank: Any, suit: Any) -> bool:
        return self.rank == rank and self.suit == suit

    @property
    def state(self) -> str:
        """Its short name:  Q♠↓ is the queen of spades, face down"""
        rank = 10 if self.value == 10 else core.upper_case(core.get_item_at(self.rank, 0))
        direction = "↑" if self.is_face_direction("up") else "↓"
        return f"{rank}{self.symbol}{direction}"

    @property
    def picture(self) -> str | None:
        """Its face:  https://www.compart.com/en/unicode/block/U+1F0A0"""
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
        return core.get_item_at(
            ["🂡", "🂢", "🂣", "🂤", "🂥", "🂦", "🂧", "🂨", "🂩", "🂪", "🂫", "🂭", "🂮"],
            position(column),
        )

    def draw_front(self) -> Any:
        return h("ui-text", {"color": self.color, "part": "front"}, self.picture)

    def draw_back(self) -> Any:
        return h("ui-text", {"color": "blue", "part": "back"}, "🂠")

    ###################
    # ## Playing a card
    ###################
    # What a click or a drag does:  the card's own moves, and each pile's, as the game plays them.

    async def play(self) -> Any:
        """
        the card, and every card on it, onto the first pile that takes it;  it says whether it moved
        - the stock's card turns over onto the discards instead
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
        points = self.count_the_points_for_card_on_pile(pile)
        for card in start_pile.starting_with(self):
            core.move(card, pile)
        if isinstance(start_pile, Tableau) and (start_pile):
            await core.pause_for(200, "msec")
            start_pile.last_item.turn_face_up()
        solitaire.score = solitaire.score + points
        return True

    def count_the_points_for_card_on_pile(self, pile: Pile) -> float:
        """what the move scores:  10 on a foundation, 5 from the discards, else nothing"""
        if isinstance(pile, Foundation):
            return 10
        if self.pile == solitaire.discards:
            return 5
        return 0

    async def on_click(self, event: Any) -> Any:
        """a click plays it"""
        return await self.play()

    can_be_dragged = True

    @property
    def pile(self) -> Pile | None:
        return Pile.owner_of(self)


# Ace is low:  ace = 1 ... king = 13

# What a person, a test or the console calls it

# A drag puts it where it's dropped, if its pile's rules let it go;  what a click does is the game's

# One letter of unicode's Playing Cards, at the size of the text around it:  its pile scales it to fit -- styles.css


def test_card_setup() -> Any:
    with core.test("test card setup"):
        it = Card()
        core.echo_test_action(
            "get a new card whose rank is queen, suit is spades and direction is down",
        )
        it_2 = Card(rank="queen", suit="spades", direction="down")
        core.expect(it_2.name, "its name", "queen of spades", "\"queen of spades\"")
        core.expect(it_2.color, "its color", "black", "black")
        core.expect(it_2.value, "its value", 12, "12")
        core.expect(it_2.state, "its state", "Q♠↓", "\"Q♠↓\"")
        core.expect(it_2.is_a_face_card, "it is a face card", True, "yes")
        core.expect(it_2.is_a_suit("spades"), "it is a spade", True, "yes")
        core.expect(it_2.is_a_suit("clubs"), "it is a club", False, "no")
        core.expect(it_2.is_a_rank("queen"), "it is a queen", True, "yes")
        core.expect(it_2.is_a_rank(2), "it is a 2", False, "no")
        core.expect(
            it_2.is_the_rank_of_suit("queen", "spades"),
            "it is the queen of spades",
            True,
            "yes",
        )
        core.expect(
            it_2.is_the_rank_of_suit("queen", "clubs"),
            "it is the queen of clubs",
            False,
            "no",
        )
        core.expect(it_2.picture, "its picture", "🂭", "\"🂭\"")

        core.echo_test_action("turn it over")
        it_2.turn_over()
        core.expect(it_2.is_face_direction("up"), "it is face up", True, "yes")
        core.expect(it_2.state, "its state", "Q♠↑", "\"Q♠↑\"")

        core.echo_test_action("set seven to a new card whose rank is 7 and suit is hearts")
        seven = Card(rank=7, suit="hearts")
        core.expect(seven.is_a_number_card, "seven is a number card", True, "yes")
        core.expect(seven.color, "the color of seven", "red", "red")
        core.expect(seven.picture, "the picture of seven", "🂷", "\"🂷\"")
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


# -----------


###########
# ## A deck
###########
# The 52 cards of a standard deck, ace of clubs first.


class Deck(List):
    item_type = Card

    def create(self) -> None:
        """One of each card, ace of clubs first:  each starts face down, as every two sided view does"""
        for rank in Card.RANKS:
            for suit in Card.SUITS:
                self.append(Card(rank=rank, suit=suit))

    @property
    def state(self) -> str:
        """Its cards' short names, top to bottom"""
        card_names = List(item_type="text")
        for card in self:
            card_names.append(card.state)
        return f"deck: {card_names}"


def test_a_new_deck() -> Any:
    with core.test("test a new deck"):
        it = Deck()
        core.echo_test_action("the deck is a new deck")
        deck = Deck()
        core.expect(len(deck), "the number of cards in the deck", 52, "52")
        core.expect(
            len(deck.filter(lambda card: card.is_a_rank("queen"))),
            "the number of (cards in the deck where it is a queen)",
            4,
            "4",
        )
        core.expect(
            getattr(deck.first_item, "state", None),
            "the state of the first card of the deck",
            "A♣↓",
            "\"A♣↓\"",
        )
        core.expect(
            getattr(deck.last_item, "name", None),
            "the name of the last card of the deck",
            "king of spades",
            "\"king of spades\"",
        )
        core.echo_test_action("shuffle the deck")
        deck.randomize()
        core.expect(len(deck), "the number of cards in the deck", 52, "52")


# -----------


####################
# ## A pile of cards
####################
# A game's stock, its discards, a column on the table:  the game names its piles, and says what each kind takes.
# Each pile is its own element around its cards' elements, `<solitaire-tableau>` around `<solitaire-card>`s.


class Pile(ViewableList):
    item_type = Card
    element_tag = "test-project-pile"

    # What the game calls it, e.g. stock
    # - its "name" is text
    name = prop(type="text")

    # How its cards lie:  on top of each other, down a column, along a row, or fanned as a hand is held -- styles.css
    # - its "layout" is one of stacked, vertical, horizontal or fanned
    LAYOUTS = ("stacked", "vertical", "horizontal", "fanned")
    layout = prop(one_of=LAYOUTS)

    @property
    def color(self) -> str:
        """Its last card's:  what the next card goes on"""
        if not self:
            return "none"
        return self.last_item.color

    @property
    def value(self) -> float:
        """Its last card's"""
        if not self:
            return 0
        return self.last_item.value

    @property
    def state(self) -> str:
        """Its name, then its cards' short names:  stock: Q♠↑ 7♥↓"""
        state = f"{self.name or "pile"}:"
        for card in self:
            state = f"{state} {card.state}"
        return state

    def while_card_dragged_over(self, card: Card) -> None:
        """while a card it would take is over it, the score shows what the move would add -- gone as the card leaves"""
        points = card.count_the_points_for_card_on_pile(self)
        if core.can_take(self, card) and points > 0:
            solitaire.hint = f" (+{points})"

    async def when_card_dropped_on(self, card: Card) -> None:
        await card.put_on_pile(self)

    can_be_dropped_on = True

    exclusive = True


# A card dragged over it glows when it would take the card, by its own rules


def test_piles() -> Any:
    with core.test("test piles"):
        it = Pile()
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
        core.expect(stock.color, "the color of the stock", "red", "red")
        core.expect(stock.value, "the value of the stock", 7, "7")
        core.expect(
            stock.state,
            "the state of the stock",
            "stock: Q♠↑ 7♥↓",
            "\"stock: Q♠↑ 7♥↓\"",
        )

        # a card is in one pile at a time
        discards = Pile(name="discards")
        core.echo_test_action("get the last card of the stock")
        it_2 = stock.last_item
        core.echo_test_action("add it to the discards")
        discards.append(it_2)
        core.expect(
            getattr(it_2, "pile", None) == discards,
            "its pile is the discards",
            True,
            "yes",
        )
        core.expect(len(stock), "the number of cards in the stock", 1, "1")
        core.expect(
            discards.state,
            "the state of the discards",
            "discards: 7♥↓",
            "\"discards: 7♥↓\"",
        )


# a card is in one pile at a time:  putting it on another pile takes it off this one


# -----------


#######################
# ## Klondike Solitaire
#######################
# Deal seven columns, then build four foundations, ace to king, one suit each:
# [wikipedia](https://en.wikipedia.org/wiki/Klondike_(solitaire)) has its rules, and what each pile is called.
# The cards, the deck and the piles are this project's own:  `Card`, `Deck` and `Pile`.


class StockPile(Pile):
    """The cards not played yet, face down:  a click turns the next one over, so none can be taken from it"""

    element_tag = "test-project-stock-pile"

    @property
    def layout(self) -> str:
        return "stacked"

    def can_take(self, card: Card) -> bool:
        return False

    def can_give_up(self, card: Card) -> bool:
        return False

    # A light grey card, face down

    def draw_its_placeholder(self) -> Any:
        return h("ui-text", {"part": "placeholder"}, "🂠")

    async def on_click(self, event: Any) -> None:
        """Empty:  a click turns the discards back over;  a click on one of its cards is the card's"""
        await solitaire.play_from_the_stock()


class DiscardPile(Pile):
    """Where the stock's cards go as they're turned over"""

    element_tag = "test-project-discard-pile"

    @property
    def layout(self) -> str:
        return "stacked"

    def can_take(self, card: Card) -> bool:
        return False

    def can_give_up(self, card: Card) -> bool:
        return card == self.last_item


class Foundation(Pile):
    """Where a suit is built up, ace to king, one card at a time"""

    element_tag = "test-project-foundation"

    @property
    def layout(self) -> str:
        return "stacked"

    # - its "suit" is a card suit
    suit = prop(one_of=lambda: Card.SUITS)

    def can_give_up(self, card: Card) -> bool:
        return False

    def can_take(self, card: Card) -> bool:
        assert card.pile is not None
        if card != card.pile.last_item:
            return False
        return self.suit == card.suit and self.value + 1 == card.value

    # A light grey ace of its suit, face up

    def draw_its_placeholder(self) -> Any:
        return h("ui-text", {"part": "placeholder"}, Card(rank="ace", suit=self.suit).picture)


class Tableau(Pile):
    """A column, built down from king to ace, red and black in turn"""

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
    element_tag = "test-project-app"

    # - its "score" is a number
    score = prop(type="number")

    # What the card being dragged would add to the score, e.g. (+10):  shown beside it
    # - its "hint" is text
    hint = prop(type="text")

    # - its "deck" is a new deck
    deck = prop(init=lambda: Deck(), early=True)

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
        """Every card of its deck into the stock:  inside the loop `it` is the card, so the stock is the solitaire's"""
        for card in self.deck:
            self.stock.append(card)

    def reset_the_stock(self) -> None:
        """The discards, turned over, back into the stock"""
        cards = self.discards.clone()
        cards.reverse()
        for card in cards:
            self.stock.append(card)
            card.turn_face_down()

    async def play_from_the_stock(self) -> None:
        """turn the stock's next card over, onto the discards:  the discards back into the stock when it's empty"""
        if core.process_is_running("play_from_the_stock"):
            return
        core.start_process("play_from_the_stock", "EXCLUSIVE")
        try:
            if not self.stock:
                self.reset_the_stock()
            it = self.stock.last_item
            it.turn_face_up()
            await core.pause_for(50, "msec")
            self.discards.append(it)
        finally:
            core.stop_process("play_from_the_stock")

    async def deal_the_cards(self) -> None:
        """gather every card into the stock, shuffle it, and deal the tableaus:  one card more in each, left to right"""
        if core.process_is_running("deal_the_cards"):
            return
        core.start_process("deal_the_cards", "EXCLUSIVE")
        try:
            for card in self.deck:
                start_pile = card.pile
                card.turn_face_down()
                if start_pile != self.stock:
                    self.stock.append(card)
                    await core.pause_for(50, "msec")
            self.stock.randomize()
            for row in range(1, 8):
                self.stock.last_item.turn_face_up()
                for column in core.get_range(row, 7):
                    core.get_item_at(core.every_thing(Tableau), position(column)).append(self.stock.last_item)
                    await core.pause_for(50, "msec")
            await self.play_from_the_stock()
        finally:
            core.stop_process("deal_the_cards")

    def draw(self) -> Any:
        """Its menu, then its piles seven to a line, the third cell empty;  a right click on the board shows the game menu"""
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
                h("ui-item", {"kind": "header"}, "Klondike Solitaire"),
                h("ui-item", "Score: ", self.score, self.hint),
                h(
                    "ui-menu",
                    {"position": "right"},
                    h(
                        "ui-item",
                        {
                            "aria-label": "Auto play",
                            "title": "Auto play",
                            "onClick": _each_1,
                            "style": "cursor:pointer;user-select:none",
                        },
                        h("ui-icon", {"name": "fast forward"}),
                    ),
                    h(
                        "ui-item",
                        {
                            "aria-label": "Cheat",
                            "title": "Cheat",
                            "onClick": _each_2,
                            "style": "cursor:pointer;user-select:none",
                        },
                        h("ui-icon", {"name": "eye"}),
                    ),
                    h(
                        "ui-item",
                        {
                            "aria-label": "Restart",
                            "title": "Restart",
                            "onClick": _each_3,
                            "style": "cursor:pointer;user-select:none",
                        },
                        h("ui-icon", {"name": "redo"}),
                    ),
                ),
            ),
            h(
                "ui-grid",
                {"class": "Board", "columns": "7", "context-menu": "game menu"},
                core.draw_thing(self.stock),
                core.draw_thing(self.discards),
                h("ui-column"),
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

    async def start_a_new_game(self) -> None:
        self.score = 0
        self.hint = ""
        await self.deal_the_cards()

    async def auto_play(self) -> None:
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

    async def cheat(self) -> None:
        remaining_piles = core.filter(
            core.every_thing(Tableau),
            lambda pile: (pile) and pile.first_item.is_face_direction("down"),
        )
        if core.is_empty(remaining_piles):
            return
        pile = core.random_item_of(remaining_piles)
        card = pile.filter(lambda card: card.is_face_direction("down")).random_item()
        card.turn_face_up()
        await core.pause_for(30, "ticks")
        self.discards.append(card)


solitaire = Solitaire()

# One of each, made with the solitaire

# Each pauses a moment, so a deal animates

# Its moves:  the menu's buttons, its keys, and the board's right click
core.describe_action(Solitaire, "start_a_new_game", {"title": "start a new game", "shortcuts": ["N"]})

# Play every card that can go somewhere, until none can
core.describe_action(Solitaire, "auto_play", {"title": "auto play", "shortcuts": ["A"]})

# Turn up a face-down card from a tableau, at random, onto the discards
core.describe_action(Solitaire, "cheat", {"title": "cheat", "shortcuts": ["C"]})

# - its "game menu" is a menu of "start a new game" , "-" , "auto play" and "cheat"
core.describe_menu(Solitaire, "game_menu", {"items": ["start_a_new_game", "-", "auto_play", "cheat"]})

##############
# ## The piles
##############
# Each kind of pile, what it may take or give up, and how it lies.
# While one's empty, it shows its placeholder, if it has one.


def test_the_moves() -> Any:
    with core.test("test the moves"):
        it = Tableau()
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
        queen.turn_face_down()
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


asyncio.run(solitaire.start_a_new_game())
solitaire.start()


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
  ui-item[kind="header"] {
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
  /* in the font that draws the cards, so the page's font never moves them:  a line's height comes from its FIRST font,
     and a theme's (Fruity's system font) set them 0.027em higher than Lato did, cutting off their tops */
  font-family: "Apple Symbols", "Segoe UI Symbol", "Noto Sans Symbols 2", sans-serif;
  /* the card's spare room above and below its ink (0.008em) padding, its white face only the content, so it hugs the ink
     (not a border:  a browser rounds a border to whole pixels) */
  box-sizing: border-box;
  padding-block: 0.008em;
  /* Apple Symbols rises 0.67em and drops 0.25em, its card's ink 0.666em above its baseline:
     a line of 0.917 starts the ink at the top of the face (measured:  0.912 by the font's rounded numbers) */
  line-height: 0.917;
  --ui-text-line-height: 0.917;
  text-indent: -0.049em;
  user-select: none;
}
/* a card's letter is only its ink:  a white face, its corners rounded as the letter's are, hides the cards below */
[layout] > * {
  background: #fff;
  background-clip: content-box;
  border-radius: 0.035em;
}

/* An empty pile's placeholder:  a faint card in the page's text colour, so it shows on a dark page too */
[layout]::part(placeholder) {
  color: var(--ui-text-color, #000);
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


test_card_setup()
test_a_new_deck()
test_piles()
test_the_moves()
