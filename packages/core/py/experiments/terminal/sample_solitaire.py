"""
A small Klondike Solitaire, hand-written in the shape compiled spell's Python takes, to draw in a terminal.

Epic `python-target`, P15 · Terminal Drawing Study.
- Its `draw()` methods make the same elements as the test project's (`projects/test/Solitaire/*.spell`):
  the same tags, the same classes, the same `onClick`s.
  - Written as the Python writer writes `to draw (a card)`:  `h("div", {"class": ..., "onClick": lambda: ...}, ...)`.
- Hand-written rather than compiled:  the study came before Python compiled Solitaire (P12).  Its rules are cut down:
  - a card goes to its foundation, or onto a tableau's last card (one lower, the other colour),
    or a king to an empty tableau
  - clicking the stock turns its top card onto the discards, or turns the discards back over when it's empty
"""

from __future__ import annotations

import random
from dataclasses import dataclass, field

from elements import Element, clear_handlers, draw_items, draw_thing, h, on, trigger

RANKS = ["ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king"]
SUITS = ["clubs", "diamonds", "hearts", "spades"]
SYMBOLS = {"clubs": "♣️", "diamonds": "♦️", "hearts": "♥️", "spades": "♠️"}


@dataclass(eq=False)
class Card:
    """`a card is a thing`:  its rank, suit and direction (up or down)."""

    rank: str
    suit: str
    direction: str = "down"

    @property
    def color(self) -> str:
        return "red" if self.suit in ("diamonds", "hearts") else "black"

    @property
    def value(self) -> int:
        return RANKS.index(self.rank) + 1

    @property
    def is_face_up(self) -> bool:
        return self.direction == "up"

    @property
    def short_suit(self) -> str:
        return SYMBOLS[self.suit]

    @property
    def short_rank(self) -> str:
        return self.rank if self.rank.isdigit() else self.rank[0].upper()

    def draw(self) -> Element:
        class_name = f"Card face-{self.direction} {self.rank} {self.suit} ui button compact fluid "
        if not self.is_face_up:
            return h(
                "div",
                {"class": class_name, "onClick": lambda: trigger("card-click", card=self)},
                h("i", {"class": "fitted bicycle icon"}),
            )
        return h(
            "div",
            {"class": class_name + self.color, "onClick": lambda: trigger("card-click", card=self)},
            f"{self.short_rank} ",
            h("span", {"class": "suit"}, self.short_suit),
        )


@dataclass(eq=False)
class Pile:
    """`a pile is a list of cards`."""

    name: str
    cards: list[Card] = field(default_factory=list)

    @property
    def last_card(self) -> Card | None:
        return self.cards[-1] if self.cards else None

    def __iter__(self):
        return iter(self.cards)


class StockPile(Pile):
    def draw(self) -> Element:
        return h(
            "div",
            {"class": "Pile Stock stacked"},
            h("div", {"class": "Placeholder ui button basic compact fluid", "onClick": lambda: game.play_from_stock()}),
            draw_thing(self.last_card),
        )


class DiscardPile(Pile):
    def draw(self) -> Element:
        return h("div", {"class": "Pile Discards stacked"}, draw_thing(self.last_card))


class Foundation(Pile):
    @property
    def value(self) -> int:
        return self.last_card.value if self.last_card else 0

    def draw(self) -> Element:
        color = "red" if self.name in ("diamonds", "hearts") else "black"
        return h(
            "div",
            {"class": "Pile Foundation stacked"},
            h(
                "div",
                {"class": f"Placeholder ui button basic compact fluid {color} {self.name}"},
                h("div", {"class": f"suit {self.name}"}, SYMBOLS[self.name]),
            ),
            draw_thing(self.last_card),
        )


class Tableau(Pile):
    def draw(self) -> Element:
        return h("div", {"class": "Pile Tableau staggered"}, draw_items(self))


class Game:
    """`a game is an app`:  its piles, its score, and how it plays a card."""

    def __init__(self, seed: int = 1) -> None:
        self.events: list[tuple[str, Card]] = []
        self.reset(seed)

    def reset(self, seed: int | None = None) -> None:
        self.seed = self.seed if seed is None else seed
        self.score = 0
        deck = [Card(rank, suit) for suit in SUITS for rank in RANKS]
        random.Random(self.seed).shuffle(deck)
        self.stock = StockPile("stock")
        self.discards = DiscardPile("discards")
        self.foundations = [Foundation(suit) for suit in SUITS]
        self.tableaus = [Tableau(f"Tableau{number}") for number in range(1, 8)]
        for number, tableau in enumerate(self.tableaus, start=1):
            tableau.cards = [deck.pop() for _ in range(number)]
            tableau.cards[-1].direction = "up"
        self.stock.cards = deck

    def pile_of(self, card: Card) -> Pile:
        piles = [self.stock, self.discards, *self.foundations, *self.tableaus]
        return next(pile for pile in piles if card in pile.cards)

    #####
    # Playing:  `on card-click with a card`, `play the card`
    #####

    def on_card_click(self, card: Card) -> None:
        self.events.append(("card-click", card))
        self.play(card)

    def play(self, card: Card) -> bool:
        pile = self.pile_of(card)
        if pile is self.stock:
            return self.play_from_stock()
        if not card.is_face_up:
            if card is pile.last_card and isinstance(pile, Tableau):
                card.direction = "up"
                self.score += 5
                return True
            return False
        if card is pile.last_card:
            for foundation in self.foundations:
                if foundation.name == card.suit and foundation.value + 1 == card.value:
                    self.move([card], pile, foundation)
                    self.score += 10
                    return True
        moving = pile.cards[pile.cards.index(card) :]
        for tableau in self.tableaus:
            if tableau is not pile and self.takes(tableau, card):
                self.move(moving, pile, tableau)
                self.score += 3
                return True
        return False

    @staticmethod
    def takes(tableau: Tableau, card: Card) -> bool:
        last = tableau.last_card
        if last is None:
            return card.rank == "king"
        return last.is_face_up and last.color != card.color and last.value == card.value + 1

    @staticmethod
    def move(cards: list[Card], source: Pile, target: Pile) -> None:
        del source.cards[len(source.cards) - len(cards) :]
        target.cards.extend(cards)

    def play_from_stock(self) -> bool:
        if self.stock.cards:
            card = self.stock.cards.pop()
            card.direction = "up"
            self.discards.cards.append(card)
            return True
        for card in reversed(self.discards.cards):
            card.direction = "down"
            self.stock.cards.append(card)
        self.discards.cards.clear()
        return False

    def auto_play(self) -> None:
        while any(self.play(pile.last_card) for pile in self.foundation_sources() if pile.last_card):
            pass

    def foundation_sources(self) -> list[Pile]:
        """The piles whose last card may go to a foundation."""
        return [self.discards, *self.tableaus]

    def cheat(self) -> None:
        for tableau in self.tableaus:
            for card in tableau:
                card.direction = "up"

    #####
    # Drawing:  `to draw (a game)`
    #####

    def draw(self) -> Element:
        def button(label: str, handler) -> Element:
            return h("th", h("div", {"class": "tiny fluid ui button compact", "onClick": handler}, label))

        return h(
            "div",
            {"class": "ui container"},
            h(
                "div",
                {"class": "board"},
                h(
                    "table",
                    {"class": "ui table fixed"},
                    h(
                        "thead",
                        h(
                            "tr",
                            h("th", {"class": "left aligned", "colspan": "2"}, "Klondike Solitaire"),
                            h("th", {"class": "right aligned"}, f"Score: {self.score}"),
                            button("AutoPlay", self.auto_play),
                            button("Cheat", self.cheat),
                            button("Debug", lambda: None),
                            button("Restart", lambda: self.reset()),
                        ),
                    ),
                    h(
                        "tbody",
                        h(
                            "tr",
                            h("td", draw_thing(self.stock)),
                            h("td", draw_thing(self.discards)),
                            h("td"),
                            *[h("td", draw_thing(foundation)) for foundation in self.foundations],
                        ),
                        h("tr", *[h("td", draw_thing(tableau)) for tableau in self.tableaus]),
                    ),
                ),
            ),
        )


def new_game(seed: int = 1) -> Game:
    """A fresh game, its `on card-click` handler hooked up:  for a test, or a restart with another deal."""
    global game
    clear_handlers()
    game = Game(seed)
    on("card-click", lambda card: game.on_card_click(card))
    return game


# `the game`, made as the compiled module makes it, and its `on card-click with a card`
game = new_game()
