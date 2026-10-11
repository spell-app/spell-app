"""`core`'s list words on plain lists, tuples, text and dicts:  what compiled Python calls for an unknown value.

- Positions from 1, or from 0 with `start_at=0`,
  as the JavaScript core's `collection-core.test.ts` and `collection-other.test.ts` check them.
- Each test uses its own `core` (`conftest.py`), except where a spell list asks the program's.
"""

import json
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import pytest

from spell_core import List, SpellCore
from spell_core import core as program_core

# What each seed must give:  shared with the JavaScript core's tests.
EXPECTED: dict[str, Any] = json.loads(
    (Path(__file__).parents[2] / "seededRandom.expected.json").read_text(encoding="utf-8")
)


@pytest.fixture
def seeded_core() -> Iterator[None]:
    """The program's `core` seeded with 1 again, after a test that drew random numbers from it."""
    yield
    program_core.seed_random(1)


####################
# ## Reading and writing one item
####################


@pytest.mark.parametrize(
    ("position", "start_at", "expected"),
    [(1, 1, "a"), (3, 1, "c"), (0, 1, None), (4, 1, None), (-1, 1, "c"), (-4, 1, None), (0, 0, "a"), (2, 0, "c"),
     (3, 0, None), (-1, 0, "c")],
)  # fmt: skip
def test_get_item_at_from_1_or_0(core: SpellCore, position: int, start_at: int, expected: object) -> None:
    for collection in (["a", "b", "c"], ("a", "b", "c"), "abc", List("abc")):
        assert core.get_item_at(collection, position, start_at) == expected  # type: ignore[arg-type]


def test_get_item_at_a_dict_or_a_thing_by_key(core: SpellCore) -> None:
    assert core.get_item_at({"a": 1}, "a") == 1
    assert core.get_item_at({"a": 1}, "b") is None
    assert core.get_item_at(List(), "anything") is None


def test_set_item_at_from_1_or_0_growing_past_the_end(core: SpellCore) -> None:
    items = ["a", "b"]
    assert core.set_item_at(items, 1, "A") == "A"
    core.set_item_at(items, 1, "B", 0)
    core.set_item_at(items, 0, "nothing")
    core.set_item_at(items, 4, "D")
    assert items == ["A", "B", None, "D"]
    record: dict[str, int] = {}
    core.set_item_at(record, "a", 1)
    assert record == {"a": 1}


def test_remove_item_at_from_1_or_0(core: SpellCore) -> None:
    items = ["a", "b", "c", "d"]
    core.remove_item_at(items, 1)
    core.remove_item_at(items, 0, 0)
    core.remove_item_at(items, 9)
    assert items == ["c", "d"]
    record = {"a": 1, "b": 2}
    core.remove_item_at(record, "a")
    assert record == {"b": 2}


def test_position_of_from_1_or_0_never_minus_1(core: SpellCore) -> None:
    ranks = ["ace", 2, 3, "queen"]
    assert [core.position_of(ranks, "queen"), core.position_of(ranks, "queen", 0)] == [4, 3]
    assert [core.position_of(ranks, "king"), core.position_of(ranks, "king", 0)] == [None, None]
    assert core.position_of(ranks, 2.0) == 2
    assert core.position_of([1], True) is None
    assert core.position_of("queen", "e") == 3
    assert core.position_of({"a": 1, "b": 2}, 2) == "b"
    assert core.position_of(List(["x"]), "x", 0) == 0


def test_counting_and_emptiness(core: SpellCore) -> None:
    assert [core.item_count_of(it) for it in ([1, 2], "abc", {"a": 1}, List([1]), 7)] == [2, 3, 1, 1, 0]
    assert [core.is_empty(it) for it in ([], "", {}, List(), [0], float("nan"), 0)] == [
        True, True, True, True, False, True, False
    ]  # fmt: skip
    assert core.keys_of(["a", "b"]) == [1, 2]
    assert core.keys_of({"x": 1}) == ["x"]
    assert core.values_of({"x": 1}) == [1]


def test_nothing_warns_and_gives_nothing(core: SpellCore, capsys: pytest.CaptureFixture[str]) -> None:
    assert core.get_item_at(None, 1) is None
    assert core.is_empty(None) is True
    assert core.includes(None, 1) is False
    assert core.item_count_of(None) == 0
    assert capsys.readouterr().err.count("expected a value, got undefined") == 4
    assert core.append("text", 1) is None
    assert "core.add_at_position():  expected a list, got text" in capsys.readouterr().err


####################
# ## Adding, taking out, ranges
####################


def test_append_prepend_add_before_after(core: SpellCore) -> None:
    items = [2]
    core.append(items, 3, 4)
    core.prepend(items, 1)
    core.add_before(items, 3, "before 3")
    core.add_after(items, 3, "after 3")
    core.add_before(items, "missing", "front")
    core.add_after(items, "missing", "end")
    assert items == ["front", 1, 2, "before 3", 3, "after 3", 4, "end"]


def test_add_at_position_0_negative_and_past_the_end(core: SpellCore) -> None:
    items = [1, 2]
    core.add_at_position(items, 0, "front")
    core.add_at_position(items, -1, "before last")
    core.add_at_position(items, 99, "end")
    assert items == ["front", 1, "before last", 2, "end"]


def test_remove_everywhere_and_remove_where(core: SpellCore) -> None:
    items = [1, 2, 1, 3]
    core.remove(items, 1, 9)
    assert items == [2, 3]
    core.remove_where(items, lambda n: n > 2)
    assert items == [2]
    record = {"a": 1, "b": 2}
    core.remove_where(record, lambda value: value > 1)
    assert record == {"a": 1}


def test_ranges_from_1_or_0(core: SpellCore) -> None:
    items = ["a", "b", "c", "d"]
    assert core.range_between(items, 2, 3) == ["b", "c"]
    assert core.range_between(items, 1, 2, 0) == ["b", "c"]
    assert core.range_between(items, 3, 9) == ["c", "d"]
    assert core.range_between(items, 3, 2) == []
    assert core.range_between(items, -2) == ["c", "d"]
    assert core.range_starting_at(items, 2, 2) == ["b", "c"]
    assert core.range_starting_at(items, 1, 2, 0) == ["b", "c"]
    assert core.range_starting_at(items, -3) == ["b", "c", "d"]
    assert core.range_starting_at(items, 9) == []
    assert type(core.range_between(List(items), 9, 10)) is List
    core.remove_range_between(items, 2, 3)
    assert items == ["a", "d"]
    core.remove_range_between(items, 0, 0, 0)
    assert items == ["d"]


def test_starts_ends_with_reverse_set_items(core: SpellCore) -> None:
    items = [1, 2, 3]
    assert [core.starts_with(items, 1), core.starts_with(items, 3), core.starts_with(items, None)] == [
        True, False, False
    ]  # fmt: skip
    assert core.ends_with(items, 3)
    core.reverse(items)
    assert items == [3, 2, 1]
    core.set_items_of(items, 2, "b", "c", "d")
    assert items == [3, "b", "c", "d"]


####################
# ## Going through each item
####################


def test_for_each_map_filter_with_positions_from_1_or_0(core: SpellCore) -> None:
    seen: list[object] = []
    core.for_each(["a", "b"], lambda value, position: seen.append((value, position)))
    core.for_each(["a", "b"], lambda value, position: seen.append(position), 0)
    assert seen == [("a", 1), ("b", 2), 0, 1]
    assert core.map([1, 2, 3], lambda n, position: n * position) == [1, 4, 9]
    assert core.map([1, 2, 3], lambda n, position: n * position, 0) == [0, 2, 6]
    assert core.map({"a": 1}, lambda n: n + 1) == {"a": 2}
    assert core.filter([0, 1, "", "x", [], None]) == [1, "x", []]
    assert core.filter({"a": 1, "b": 2}, lambda value, key: key == "b") == {"b": 2}
    assert core.filter("hello", lambda letter: letter == "l") == ["l", "l"]


def test_all_and_any_javascripts_yes(core: SpellCore) -> None:
    assert core.all([1, 2], lambda n: n > 0)
    assert core.all([]) is False
    assert core.all([[], "x"]) is True
    assert core.any([0, ""]) is False
    assert core.any([0, 3], lambda n: n)
    assert core.includes([1, 2, 3], 1, 3)
    assert core.includes([1, 2, 3]) is False
    assert core.includes_any([1, 2, 3], 9, 3)


def test_smallest_and_largest(core: SpellCore) -> None:
    assert [core.smallest_of([3, 1, 2]), core.largest_of([3, 1, 2])] == [1, 3]
    assert core.largest_of(["b", "c", "a"]) == "c"
    assert core.largest_of([]) is None


####################
# ## Copies and merges, moving
####################


def test_copies_and_merges(core: SpellCore) -> None:
    items = [1, 2]
    copy = core.duplicate_list(items)
    assert copy == items
    assert copy is not items
    assert type(core.duplicate_list(items, List)) is List
    assert core.merge_lists([[1, 2], [3]]) == [1, 2, 3]
    assert list(core.merge_lists([[1], List([2])], List)) == [1, 2]
    assert core.merge_lists_into([0], [1], None, (2, 3)) == [0, 1, 2, 3]
    assert core.new_thing_like({"a": 1}) == {}
    assert core.new_thing_like((1, 2)) == []


def test_a_plain_list_has_no_guards(core: SpellCore) -> None:
    items: list[object] = []
    assert core.move("card", items) is True
    assert items == ["card"]
    assert core.can_take(items, "card")
    assert core.can_give_up(items, "card")


####################
# ## Random:  the same deal as the JavaScript core
####################


@pytest.mark.parametrize("expected", EXPECTED["seeds"], ids=lambda each: f"seed {each['seed']}")
def test_randomize_deals_what_the_javascript_core_deals(seeded_core: None, expected: dict[str, Any]) -> None:
    program_core.seed_random(expected["seed"])
    deck = List(EXPECTED["deck"])
    deck.randomize()
    assert list(deck) == expected["deck"]
    program_core.seed_random(expected["seed"])
    plain = list(EXPECTED["toShuffle"])
    program_core.randomize(plain)
    assert plain == expected["shuffled"]


def test_random_items_each_at_most_once(core: SpellCore) -> None:
    picked = core.random_items_of([1, 2, 3, 4], 2)
    assert len(set(picked)) == 2
    assert set(picked) <= {1, 2, 3, 4}
    assert core.random_items_of([1, 2], 0) == []
    assert sorted(core.random_items_of({"a": 1, "b": 2})) == ["a", "b"]
