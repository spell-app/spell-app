"""
The terminal study's prototype draws Solitaire's board three ways from one tree, and a click reaches spell's event.

Run from `packages/py/core`:  `uv run --group study pytest experiments/terminal`
"""

import asyncio

import pytest
import sample_solitaire
from elements import h, to_html
from rich_board import render_text
from sample_solitaire import Card
from textual_board import Line, solitaire_app


@pytest.fixture(autouse=True)
def fresh_game():
    """The same deal every test:  seed 1, which puts the 2 of diamonds where the 3 of spades can take it."""
    return sample_solitaire.new_game(seed=1)


def test_h_builds_a_tree_that_is_still_the_html_p12_writes():
    card = Card("queen", "spades", "up")
    assert to_html(card.draw()) == (
        '<div class="Card face-up queen spades ui button compact fluid black">Q <span class="suit">♠️</span></div>'
    )
    # no props:  the children come straight after the tag;  nothing is left out
    assert to_html(h("tr", h("td", None, "a"), None)) == "<tr><td>a</td></tr>"


def test_rich_draws_the_board_as_text():
    text = render_text(sample_solitaire.game.draw(), width=110)
    assert "Klondike" in text
    assert "Score: 0" in text
    # each tableau's last card, face up;  the suits without emoji's "draw as a picture" mark
    for label in ["9 ♣", "10 ♠", "8 ♣", "3 ♠", "2 ♣", "2 ♦", "K ♦"]:
        assert label in text


def clicked_card(app, rank, suit):
    """The widget of the face-up card `rank` of `suit`."""
    return next(line for line in app.query(Line) if line.has_class("Card", "face-up", rank, suit))


def test_textual_draws_the_board_and_a_click_fires_card_click():
    game = sample_solitaire.game
    two_of_diamonds = game.tableaus[5].last_card
    assert (two_of_diamonds.rank, two_of_diamonds.suit) == ("2", "diamonds")

    async def play():
        app = solitaire_app()
        async with app.run_test(size=(110, 30)) as pilot:
            await pilot.pause()
            assert len(app.query(".Card.face-up")) == 7

            await pilot.click(clicked_card(app, "_2", "diamonds"))
            await pilot.pause()
            # the click fired `card-click` with the card, and `on card-click` played it onto the 3 of spades
            assert game.events == [("card-click", two_of_diamonds)]
            assert game.tableaus[3].last_card is two_of_diamonds
            # and the board was drawn again:  the 2 of diamonds is now under the 3 of spades
            tableau = app.query(".Tableau")[3]
            assert [str(line.render()) for line in tableau.query(".face-up")] == ["3 ♠", "2 ♦"]

            # a button's own `onClick`:  turn a card from the stock onto the discards
            await pilot.click(".Stock .Placeholder")
            await pilot.pause()
            assert len(game.discards.cards) == 1
            assert len(app.query(".Discards .Card")) == 1

    asyncio.run(play())
