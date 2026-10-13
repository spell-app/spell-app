"""Playing Solitaire the way its page does (`playing.py`):  by the page's messages, asserting on each patch."""

from collections.abc import Iterator
from pathlib import Path

import pytest

from spell_core import core
from spell_core.playing import PagePlayer, PatchMismatchError, play_page

# Solitaire compiled to Python:  the test fixture's snapshot, which imports nothing but spell_core.
SOLITAIRE = Path(__file__).parents[3] / "spell" / "projects" / "test" / "Solitaire" / "Solitaire.snapshot.py"


@pytest.fixture
def game() -> Iterator[PagePlayer]:
    """Solitaire on seed 1, as its page starts it;  its handler taken off the shared core after."""
    try:
        yield play_page(SOLITAIRE, seed=1)
    finally:
        core.off("card-click")
        # the shared core, as every other test expects it:  seeded with 1
        core.seed_random(1)


def ids(pile: dict[str, object]) -> list[str]:
    """The ids of the cards in `pile`, as the page holds it."""
    return [card["$id"] for card in pile["$items"]]  # type: ignore[index, union-attr]


def test_the_page_starts_with_the_whole_deal(game: PagePlayer) -> None:
    assert len(game.ids_of_type("Card")) == 52
    assert len(ids(game.named("stock"))) == 23
    assert [len(ids(game.thing(pile["$id"]))) for pile in game.named("tableaus")["$items"]] == [1, 2, 3, 4, 5, 6, 7]


def test_a_click_on_the_stocks_top_card_turns_it_onto_the_discards(game: PagePlayer) -> None:
    stock, discards = ids(game.named("stock")), ids(game.named("discards"))
    top = stock[-1]
    patch = game.trigger("card-click", card=game.ref(top))
    # only what the click changed:  the card, the pile it left, the pile it joined
    assert [thing["$type"] for thing in patch] == ["Card", "StockPile", "DiscardPile"]
    assert game.thing(top)["direction"] == "up"
    assert game.thing(top)["pile"] == game.ref(game.named("discards"))
    assert ids(game.named("stock")) == stock[:-1]
    assert ids(game.named("discards")) == [*discards, top]


def test_a_click_names_its_card_by_reference(game: PagePlayer) -> None:
    top = ids(game.named("stock"))[-1]
    reference = game.reference(top)
    assert reference is not None and reference.startswith("Card#") and "-of-" in reference
    patch = game.trigger("card-click", target=reference)
    assert [thing["$type"] for thing in patch] == ["Card", "StockPile", "DiscardPile"]
    assert ids(game.named("discards"))[-1] == top


def test_a_call_of_a_function_plays_from_the_stock(game: PagePlayer) -> None:
    top = ids(game.named("stock"))[-1]
    patch = game.call("play_from_the_stock_pile")
    assert [thing["$type"] for thing in patch] == ["Card", "StockPile", "DiscardPile"]
    assert ids(game.named("discards"))[-1] == top


def test_a_few_moves_each_patch_only_what_changed(game: PagePlayer) -> None:
    for _ in range(5):
        before = {the_id: dict(game.thing(the_id)) for the_id in game.ids_of_type("Card")}
        patch = game.call("play_from_the_stock_pile")
        changed = [the_id for the_id, card in before.items() if game.thing(the_id) != card]
        assert changed == [thing["$id"] for thing in patch if thing["$type"] == "Card"]
    assert len(game.patches) == 5


def test_a_face_down_card_that_cant_move_changes_nothing(game: PagePlayer) -> None:
    last_tableau = game.thing(game.named("tableaus")["$items"][-1]["$id"])
    under = ids(last_tableau)[0]
    assert game.thing(under)["direction"] == "down"
    assert game.trigger("card-click", card=game.ref(under)) == []


def test_a_change_the_patches_left_out_fails_the_check(game: PagePlayer) -> None:
    game.session.writer.patch = lambda: []  # type: ignore[method-assign]
    with pytest.raises(PatchMismatchError):
        game.call("play_from_the_stock_pile")
