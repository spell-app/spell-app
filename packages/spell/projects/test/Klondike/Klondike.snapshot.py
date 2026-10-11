from __future__ import annotations

from spell_core import core, List, App, prop, h
from cards import Card, Deck, Pile


#################################
# ## Klondike Solitaire Card Game
#################################
# See [wikipedia](https://en.wikipedia.org/wiki/Klondike_(solitaire)) for rules & naming conventions.


class Game(App):
    """Game bits"""

    score = prop(type="number")

    # actions

    @property
    def state(self) -> list:
        state = []
        for pile in all_piles:
            state.append(pile.state)
        return state

    def draw(self):
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
                            h(
                                "th",
                                h(
                                    "div",
                                    {"class": "tiny fluid ui button compact", "onClick": lambda event: auto_play()},
                                    "AutoPlay",
                                ),
                            ),
                            h(
                                "th",
                                h(
                                    "div",
                                    {"class": "tiny fluid ui button compact", "onClick": lambda event: cheat()},
                                    "Cheat",
                                ),
                            ),
                            h(
                                "th",
                                h(
                                    "div",
                                    {"class": "tiny fluid ui button compact", "onClick": lambda event: debug_the_game()},
                                    "Debug",
                                ),
                            ),
                            h(
                                "th",
                                h(
                                    "div",
                                    {"class": "tiny fluid ui button compact", "onClick": lambda event: reset_the_game()},
                                    "Restart",
                                ),
                            ),
                        ),
                    ),
                    h(
                        "tbody",
                        h(
                            "tr",
                            h("td", core.draw_thing(stock)),
                            h("td", core.draw_thing(discards)),
                            h("td"),
                            h("td", core.draw_thing(foundations.first_item)),
                            h("td", core.draw_thing(foundations[1])),
                            h("td", core.draw_thing(foundations[2])),
                            h("td", core.draw_thing(foundations[3])),
                        ),
                        h(
                            "tr",
                            h("td", core.draw_thing(tableaus.first_item)),
                            h("td", core.draw_thing(tableaus[1])),
                            h("td", core.draw_thing(tableaus[2])),
                            h("td", core.draw_thing(tableaus[3])),
                            h("td", core.draw_thing(tableaus[4])),
                            h("td", core.draw_thing(tableaus[5])),
                            h("td", core.draw_thing(tableaus[6])),
                        ),
                    ),
                ),
            ),
        )


game = Game()
core.console.log(game)

# set up all piles
all_piles = List(item_type="Pile")
foundations = List(item_type="Pile")
tableaus = List(item_type="Pile")


class StockPile(Pile):
    """set up stock pile: unplayed cards"""

    def can_give_up(self, card: Card) -> bool:
        return card == self.last_item

    def draw(self):
        return h(
            "div",
            {"class": "Pile Stock stacked"},
            h(
                "div",
                {
                    "class": "Placeholder ui button basic compact fluid",
                    "onClick": lambda event: play_from_the_stock_pile(),
                },
            ),
            core.draw_thing(self.last_item),
        )


stock = StockPile(name="stock", droppable=False)
all_piles.append(stock)


class DiscardPile(Pile):
    """set up discards: where played cards go when turning over stock"""

    def can_give_up(self, card: Card) -> bool:
        return card == self.last_item

    def draw(self):
        return h("div", {"class": "Pile Discards stacked"}, core.draw_thing(self.last_item))


discards = DiscardPile(name="discards", droppable=False)
all_piles.append(discards)


class Foundation(Pile):
    """set up foundation piles: where we build up from ace => king"""

    def can_give_up(self, card: Card) -> bool:
        return False

    def can_take(self, card: Card) -> bool:
        """one card at a time:  the last of its pile"""
        if card != card.pile.last_item:
            return False
        return self.name == card.suit and self.value + 1 == card.value

    #
    # rendering the bits

    # note: tableaus just draw as a (vertical) list of cards

    def draw(self):
        color = "red" if self.name == "diamonds" or self.name == "hearts" else "black"
        return h(
            "div",
            {"class": "Pile Foundation stacked"},
            h(
                "div",
                {"class": f"Placeholder ui button basic compact fluid {color} {self.name}"},
                h("div", {"class": f"suit {self.name}"}, self.symbol),
            ),
            core.draw_thing(self.last_item),
        )


it = Foundation(name="clubs", symbol="♣️", droppable=True)
foundations.append(it)
it_2 = Foundation(name="diamonds", symbol="♦️", droppable=True)
foundations.append(it_2)
it_3 = Foundation(name="hearts", symbol="♥️", droppable=True)
foundations.append(it_3)
it_4 = Foundation(name="spades", symbol="♠️", droppable=True)
foundations.append(it_4)
for pile in foundations:
    all_piles.append(pile)


class Tableau(Pile):
    """set up tableau piles: vertical piles where we arrange from king to ace"""

    def can_give_up(self, card: Card) -> bool:
        return card.is_face_up

    def can_take(self, card: Card) -> bool:
        if not self:
            return card.is_a_rank("king")
        return self.color != card.color and self.value == card.value + 1

    def draw(self):
        return h("div", {"class": "Pile Tableau staggered"}, core.draw_items(self))


for number in range(1, 8):
    it_5 = Tableau(name=f"T{number}", droppable=True)
    tableaus.append(it_5)
    all_piles.append(it_5)

# set up deck of cards
deck = Deck()
deck.set_up()
# start with cards in the stock pile
for card in deck:
    stock.append(card)


def debug_the_game() -> None:
    for line in game.state:
        core.console.log(line)


def reset_the_stock_pile() -> None:
    cards = discards.clone()
    cards.reverse()
    for card in cards:
        stock.append(card)
        card.turn_face_down()


def play_from_the_stock_pile() -> None:
    if core.process_is_running("play_from_the_stock_pile"):
        return
    core.start_process("play_from_the_stock_pile", "EXCLUSIVE")
    try:
        if not stock:
            reset_the_stock_pile()

        it_5 = stock.last_item
        it_5.turn_face_up()
        # pause for 150 msec
        core.move(it_5, discards)
    finally:
        core.stop_process("play_from_the_stock_pile")


def deal_the_cards() -> None:
    if core.process_is_running("deal_the_cards"):
        return
    core.start_process("deal_the_cards", "EXCLUSIVE")
    try:
        # pull all cards into stock with a nice animation
        cards = all_piles.merged(Pile)
        cards.reverse()
        for card in cards:
            start_pile = card.pile
            card.turn_face_down()
            if start_pile != stock:
                stock.append(card)
                core.pause_for(50, "msec")
        stock.randomize()

        # deal cards into tableaus
        for row in range(1, 8):
            stock.last_item.turn_face_up()
            for column in core.get_range(row, 7):
                tableaus.get_item(column).append(stock.last_item)
                core.pause_for(50, "msec")

        play_from_the_stock_pile()
    finally:
        core.stop_process("deal_the_cards")


def play(self) -> bool | None:
    start_pile = self.pile
    if not core.can_give_up(start_pile, self):
        return False

    if start_pile == stock:
        play_from_the_stock_pile()
        return

    end_pile = all_piles.filter(lambda pile: pile.droppable and core.can_take(pile, self)).first_item
    if end_pile is None:
        return False

    cards_to_move = start_pile.starting_with(self)
    cards_to_move.name = start_pile.name
    print(f"moving ({cards_to_move.state}) to ({end_pile.state})")
    for card in cards_to_move:
        core.move(card, end_pile)

    if isinstance(start_pile, Tableau) and (start_pile):
        core.pause_for(200, "msec")
        it = start_pile.last_item
        print(f"turning over ({start_pile.name}: {getattr(it, "state", None)})")
        it.turn_face_up()

    if isinstance(end_pile, Foundation):
        game.score = game.score + 10
    elif start_pile == discards:
        game.score = game.score + 5
    return True


@core.on("card-click")
def on_card_click(event) -> None:
    card = event.card
    card.play()


def auto_play() -> None:
    anything_changed = False
    if discards:
        test_card = discards.last_item
        if test_card.play():
            anything_changed = True
            core.pause_for(500, "msec")

    # attempt to move bottom card of tableaus to foundations
    for pile in tableaus:
        if not pile:
            continue
        test_card = pile.last_item
        foundation = foundations.filter(lambda pile: pile.name == getattr(test_card, "suit", None)).first_item
        if core.can_take(foundation, test_card):
            anything_changed = True
            test_card.play()
            core.pause_for(100, "msec")

    # attempt to move the entire pile of face-up cards
    for pile in tableaus:
        face_up_cards = pile.filter(lambda card: card.is_face_up)
        if not face_up_cards:
            continue
        test_card = face_up_cards.first_item
        if test_card.is_a_rank("king") and test_card == pile.first_item:
            continue
        if test_card.play():
            anything_changed = True
            core.pause_for(500, "msec")

    # call auto-play again if anything actually changed
    if anything_changed:
        auto_play()


def reset_the_game() -> None:
    game.score = 0
    deal_the_cards()


def cheat() -> None:
    remaining_piles = tableaus.filter(lambda pile: (pile) and getattr(pile.first_item, "is_face_down", None))
    if not remaining_piles:
        return
    pile = remaining_piles.random_item()
    unplaid_cards = pile.filter(lambda card: card.is_face_down)
    card = unplaid_cards.random_item()
    card.turn_face_up()
    core.pause_for(30, "ticks")
    core.move(card, discards)


reset_the_game()
game.start()


# -----------


core.install_styles(None, """/* File styles.css */
.Card {
	position: relative;
	height: 30px;
}

.Card .suit {
	position: relative;
	font-size: 1.5rem;
	padding-left: 1px;
	vertical-align: top;
	top: -0.15rem;
}

.Pile {
	position: relative;
	min-height: 30px;
}

.Pile.Tableau {
	min-height: 500px;
}

.Pile.stacked .Card {
	position: absolute;
	left: 0;
	top: 0;
}

.Pile.staggered .Card {
	margin-bottom: 8px !important;
}

.Pile > .Placeholder {
	position: relative;
	height: 30px;
}

.Pile > .Placeholder .suit {
	position: relative;
	font-size: 1.6rem;
}

.Pile > .Placeholder .suit.diamonds,
.Pile > .Placeholder .suit.spades {
	font-size: 1.75rem;
	top: -0.1rem;
}""")
