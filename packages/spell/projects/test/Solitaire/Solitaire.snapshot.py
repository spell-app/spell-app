from __future__ import annotations

from spell_core import core, Thing, List, App, prop, h


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
        return core.upper_case(core.get_item_at(self.rank, 1))

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

    def turn_face_up(self) -> None:
        """
        Turn card face up or face down
        Note that this will animate if you `wait for turn the card face up`
        """
        self.direction = "up"
        core.pause_for(50, "msec")

    def turn_face_down(self) -> None:
        self.direction = "down"
        core.pause_for(50, "msec")

    def turn_over(self) -> None:
        """
        Flip card to opposite direction
        Note that this will animate if you `wait for turn the card face up`
        """
        if self.direction == "up":
            self.turn_face_down()
        else:
            self.turn_face_up()
        core.pause_for(50, "msec")

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

    def move_to_pile(self, pile: Pile) -> None:
        """
        "move" a card
        NOTE: use this rather than `add` to make sure card is only in one pile at a time
        if you `wait for: move the card to the pile` the move will be animated
        """
        if self.pile is not None:
            self.pile.remove(self)
        self.pile = pile
        pile.append(self)
        core.pause_for(50, "msec")

    def play(self) -> bool | None:
        start_pile = self.pile
        if not start_pile.can_pick_up_card(self):
            return False

        if start_pile == stock:
            play_from_the_stock_pile()
            return

        droppable_piles = all_piles.filter(lambda pile: pile.droppable and pile.can_play_card(self))
        end_pile = droppable_piles.first_item
        if end_pile is None:
            return False

        cards_to_move = start_pile.starting_with(self)
        cards_to_move.name = start_pile.name
        print(f"moving ({cards_to_move.state}) to ({end_pile.state})")
        for card in cards_to_move:
            card.move_to_pile(end_pile)

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

    pile = prop(type="Pile")


def test_card_setup():
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
        core.expect(card.value, "the value of the card", 12, "12")
        core.expect(card.short_suit, "the short-suit of the card", "♠️", "\"♠️\"")
        core.expect(card.short_rank, "the short-rank of the card", "Q", "\"Q\"")
        core.expect(card.short_name, "the short-name of the card", "Q♠️", "\"Q♠️\"")

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
        card.turn_face_down()
        core.expect(card.direction, "the direction of the card", "down", "down")

        core.echo_test_action("turn the card over")
        card.turn_over()
        core.expect(card.is_face_up, "the card is face up", True, "true")


test_card_setup()


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
            "the short-name of the top card of the deck",
            "A♣️",
            "\"A♣️\"",
        )

        core.echo("the deck before shuffling:")
        core.echo_test_action("display the deck")
        deck.display()
        core.echo_test_action("get the first card of the deck")
        it = deck.first_item
        core.expect(
            it.is_the_rank_of_suits("ace", "clubs"),
            "it is the ace of clubs",
            True,
            "yes",
        )


test_deck_creation()


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

    name = prop()


# -----------


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

    def can_pick_up_card(self, card: Card) -> bool:
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

    def can_pick_up_card(self, card: Card) -> bool:
        return card == self.last_item

    def draw(self):
        return h("div", {"class": "Pile Discards stacked"}, core.draw_thing(self.last_item))


discards = DiscardPile(name="discards", droppable=False)
all_piles.append(discards)


class Foundation(Pile):
    """set up foundation piles: where we build up from ace => king"""

    def can_pick_up_card(self, card: Card) -> bool:
        return False

    def can_play_card(self, card: Card) -> bool:
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

    def can_pick_up_card(self, card: Card) -> bool:
        return card.is_face_up

    def can_play_card(self, card: Card) -> bool:
        if not self:
            return card.is_a_rank("king")
        return self.color != card.color and self.value == card.value + 1

    def draw(self):
        return h("div", {"class": "Pile Tableau staggered"}, core.draw_items(self))


for number in range(1, 8):
    it_5 = Tableau(name=f"Tableau{number}", droppable=True)
    tableaus.append(it_5)
    all_piles.append(it_5)

# set up deck of cards
deck = Deck()
deck.set_up()
# start with cards in the stock pile
for card in deck:
    card.move_to_pile(stock)


def debug_the_game() -> None:
    for line in game.state:
        core.console.log(line)


def reset_the_stock_pile() -> None:
    cards = discards.clone()
    cards.reverse()
    for card in cards:
        card.move_to_pile(stock)
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
        it_5.move_to_pile(discards)
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
                card.move_to_pile(stock)
        stock.randomize()

        # deal cards into tableaus
        for row in range(1, 8):
            stock.last_item.turn_face_up()
            for column in core.get_range(row, 7):
                stock.last_item.move_to_pile(tableaus.get_item(column))

        play_from_the_stock_pile()
    finally:
        core.stop_process("deal_the_cards")


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
        if foundation.can_play_card(test_card):
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
    card.move_to_pile(discards)


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
