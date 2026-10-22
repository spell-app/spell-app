from __future__ import annotations

import asyncio
from typing import Any

from spell_core import core, App, prop, h, position
from cards import Card, Suit, Rank, Deck, Pile


#######################
# ## Klondike Solitaire
#######################
# See [wikipedia](https://en.wikipedia.org/wiki/Klondike_(solitaire)) for its rules, and what each pile is called.
# The cards, the deck and the piles are the cards library's, `@spell/library/cards`:
# this file adds the game, its kinds of piles, what each may take or give up, and how each is laid out.
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

#######################################
# ## Playing a card:  what a click does
#######################################


@Card.add_method("play")
async def _card_play(self) -> bool | None:
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


asyncio.run(test_the_moves())
