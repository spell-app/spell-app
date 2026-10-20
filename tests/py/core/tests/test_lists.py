"""Spell lists as Python sequences, and spell's own list words on them.

- Python's words:  `len()`, `in`, `for`, `deck[0]`, `append()`, `insert()`, `del` ...
  and where a spell list differs from a Python list (see `List`'s docstring).
- Spell's words:  each beside its `core` twin, as the JavaScript core's `List.test.ts` checks them.
"""

import re
from collections.abc import Callable, Iterator
from typing import Any

import pytest

from spell_core import List, Thing, core, end_position, position, prop, spell_position, with_spell_positions


class Deck(List):
    """`a deck is a list`, with a name of its own."""

    name = prop(type="text")


class Shoe(Deck):
    """`a shoe is a deck`."""


@pytest.fixture
def seeded_core() -> Iterator[None]:
    """The program's `core` seeded with 1 again, after a test that drew random numbers from it."""
    yield
    core.seed_random(1)


def numbers(*items: float) -> List:
    """A plain spell list of `items`."""
    return List(items)


####################
# ## Python's own words
####################


def test_len_in_for_and_truthiness() -> None:
    deck = Deck(["a", "b", "c"])
    assert len(deck) == 3
    assert "b" in deck
    assert "z" not in deck
    assert list(deck) == ["a", "b", "c"]
    assert list(reversed(deck)) == ["c", "b", "a"]
    assert deck
    assert not Deck()


def test_in_looks_for_the_same_item_never_true_for_1() -> None:
    assert 1.0 in numbers(1, 2)
    assert True not in numbers(1, 2)
    assert numbers(1, 2, 1).count(1) == 2


def test_an_index_from_0_negatives_from_the_end() -> None:
    deck = Deck(["a", "b", "c"])
    assert (deck[0], deck[2], deck[-1], deck[-3]) == ("a", "c", "c", "a")
    assert deck[2.0] == "c"


def test_out_of_range_is_none_never_index_error() -> None:
    deck = Deck(["a", "b"])
    assert deck[2] is None
    assert deck[-3] is None
    assert Deck()[0] is None
    assert Deck().pop() is None


def test_no_index_reads_none_and_changes_nothing() -> None:
    deck = Deck(["a", "b"])
    assert deck[None] is None
    deck[None] = "nothing changes"
    del deck[None]
    assert list(deck) == ["a", "b"]


def test_a_bad_index_raises_type_error_as_pythons_lists_do() -> None:
    with pytest.raises(TypeError, match="Deck indices must be integers or slices, not str"):
        _ = Deck()["a"]


def test_a_slice_is_a_scratch_list_of_the_same_class() -> None:
    shoe = Shoe(["a", "b", "c", "d"], name="six-deck")
    part = shoe[1:3]
    assert type(part) is Shoe
    assert list(part) == ["b", "c"]
    assert part.name is None
    assert list(shoe[::-1]) == ["d", "c", "b", "a"]
    assert list(shoe) == ["a", "b", "c", "d"]


def test_a_copy_runs_no_create() -> None:
    class DealtDeck(List):
        def create(self) -> None:
            self.append("ace", "king", "queen")

    deck = DealtDeck()
    assert list(deck) == ["ace", "king", "queen"]
    queens = core.filter(deck, lambda card: card == "queen")
    assert type(queens) is DealtDeck
    assert list(queens) == ["queen"]


def test_setting_and_deleting_by_index_and_slice() -> None:
    deck = Deck(["a", "b", "c"])
    deck[0] = "A"
    deck[-1] = "C"
    deck[-9] = "nothing changes"
    assert list(deck) == ["A", "b", "C"]
    deck[5] = "F"
    assert list(deck) == ["A", "b", "C", None, None, "F"]
    deck[3:5] = ["d", "e"]
    del deck[0]
    del deck[9]
    assert list(deck) == ["b", "C", "d", "e", "F"]
    del deck[1:3]
    assert list(deck) == ["b", "e", "F"]


def test_insert_append_extend_as_pythons() -> None:
    deck = Deck(["b"])
    deck.insert(0, "a")
    deck.insert(99, "d")
    deck.insert(-1, "c")
    assert list(deck) == ["a", "b", "c", "d"]
    deck.append("e")
    deck.extend(["f", "g"])
    deck += ["h"]
    assert list(deck) == ["a", "b", "c", "d", "e", "f", "g", "h"]
    assert deck.pop() == "h"
    assert deck.pop(0) == "a"


def test_remove_takes_every_copy_and_never_raises() -> None:
    deck = Deck(["a", "b", "a", "c"])
    deck.remove("a")
    deck.remove("z")
    assert list(deck) == ["b", "c"]
    deck.remove("b", "c")
    assert deck.is_empty


def test_index_raises_as_pythons_and_position_of_gives_none() -> None:
    deck = Deck(["a", "b"])
    assert deck.index("b") == 1
    with pytest.raises(ValueError, match="z is not in the Deck"):
        deck.index("z")
    assert deck.position_of("z") is None


def test_a_loop_sees_the_items_as_they_were_when_it_started() -> None:
    deck = Deck(["a", "b", "c"])
    seen = []
    for item in deck:
        seen.append(item)
        deck.remove(item)
    assert seen == ["a", "b", "c"]
    assert list(deck) == []


def test_items_is_a_copy_and_setting_it_replaces_them() -> None:
    deck = Deck(["a"])
    deck.items.append("lost")
    assert list(deck) == ["a"]
    deck.items = ["x", "y"]
    assert list(deck) == ["x", "y"]


def test_str_and_repr_are_javascripts_to_string() -> None:
    deck = Deck(["A♣️", 2, 3.0, None, True])
    assert str(deck) == "A♣️, 2, 3, , true"
    assert repr(deck) == str(deck)
    assert f"deck: {deck}" == "deck: A♣️, 2, 3, , true"
    nested = List()
    nested.append(nested, "x")
    assert str(nested) == ", x"


def test_equality_is_identity() -> None:
    assert Deck(["a"]) != Deck(["a"])
    assert Deck(["a"]) != ["a"]


def test_props_and_items_together() -> None:
    deck = Deck(["a"], name="spare")
    assert (deck.name, list(deck), deck.type) == ("spare", ["a"], "Deck")
    assert deck.colour is None
    assert deck.is_of_type("list")


def test_an_id_as_a_things_none_until_read_then_a_property_before_its_items() -> None:
    deck = Deck(["a"], name="spare")
    assert deck.to_json() == {"$type": "Deck", "name": "spare", "$items": ["a"]}
    assert re.fullmatch(r"deck-[0-9a-z]{8}", deck.id)
    assert list(deck.to_json()) == ["$type", "name", "id", "$items"]
    assert deck[0:1].id != deck.id
    assert Deck(id="spare-deck").id == "spare-deck"


####################
# ## Positions:  indexes, from 0
####################


def test_positions_are_indexes_from_0() -> None:
    deck = Deck(["a", "b", "c"])
    assert [deck.get_item(0), deck.get_item(2), deck.get_item(-1), deck.get_item(3), deck.get_item(None)] == [
        "a",
        "c",
        "c",
        None,
        None,
    ]
    assert [deck.position_of("a"), deck.position_of("c"), deck.position_of("z")] == [0, 2, None]
    deck.set_item(1, "B")
    deck.remove_item(0)
    assert list(deck) == ["B", "c"]
    deck.set_item(-9, "nothing changes")
    deck.set_item(None, "nothing changes")
    deck.remove_item(-9)
    deck.remove_item(None)
    assert list(deck) == ["B", "c"]


def test_add_at_an_index_as_insert() -> None:
    assert list(numbers(1, 2).add_at(1, 7)) == [1, 7, 2]
    assert list(numbers(1, 2).add_at(0, 7)) == [7, 1, 2]
    assert list(numbers(1, 2).add_at(2, 7)) == [1, 2, 7]
    assert list(numbers(1, 2).add_at(9, 7)) == [1, 2, 7]
    assert list(numbers(1, 2).add_at(-1, 7)) == [1, 7, 2]
    assert list(numbers(1, 2).add_at(-9, 7)) == [7, 1, 2]
    assert list(numbers(1, 2).add_at(None, 7)) == [7, 1, 2]


####################
# ## Spell's positions, from 1, for code counting from 1:  `position()` and its kin
####################


def test_position_is_one_less_negatives_as_they_are_0_is_none() -> None:
    assert [position(n) for n in (1, 3, 2.0, -1, -3, "key", None)] == [0, 2, 1.0, -1, -3, "key", None]
    assert position(0) is None


def test_item_0_counting_from_1_reads_nothing_never_the_last_item() -> None:
    deck = Deck(["a", "b", "c"])
    assert deck[position(0)] is None
    assert deck[position(1)] == "a"
    assert deck[position(-1)] == "c"
    assert core.get_item_at(deck, position(0)) is None
    assert core.get_item_at(["a", "b", "c"], position(0)) is None


def test_end_position_is_a_slices_end() -> None:
    assert [end_position(n) for n in (4, 1, 0, -1, -2, -3, None, "key")] == [4, 1, 0, None, -1, -2, None, None]
    deck = Deck(["a", "b", "c", "d", "e"])
    assert list(deck[position(2) : end_position(4)]) == ["b", "c", "d"]
    assert list(deck[position(2) : end_position(-1)]) == ["b", "c", "d", "e"]
    assert list(deck[position(1) : end_position(-2)]) == ["a", "b", "c", "d"]
    assert core.range_between(list(deck), position(2), end_position(4)) == ["b", "c", "d"]


def test_spell_position_is_one_more_none_stays_none() -> None:
    assert [spell_position(index) for index in (0, 2, 2.0, -1, None)] == [1, 3, 3.0, -1, None]
    assert spell_position(Deck(["a", "b"]).position_of("b")) == 2
    assert spell_position(Deck(["a"]).position_of("z")) is None


def test_with_spell_positions_hands_a_loop_spells_positions() -> None:
    deck = Deck(["a", "b"])
    seen: list[object] = []
    deck.for_each(with_spell_positions(lambda value, n: seen.append((value, n))))
    core.for_each(["x"], with_spell_positions(lambda value, n, of_list: seen.append((value, n, of_list))))
    deck.for_each(with_spell_positions(lambda value: seen.append(value)))
    assert seen == [("a", 1), ("b", 2), ("x", 1, ["x"]), "a", "b"]
    assert list(deck.map(with_spell_positions(lambda value, n: f"{value}{n}"))) == ["a1", "b2"]
    assert list(deck.map(with_spell_positions(str.upper))) == ["A", "B"]


####################
# ## Spell's words, each beside its `core` twin
####################

# `[name, the list's method, its core twin]`, each run on its own list of 1, 2, 3, 4.
TWINS: list[tuple[str, Callable[[List], Any], Callable[[List], Any]]] = [
    ("first_item", lambda it: it.first_item, lambda it: core.get_item_at(it, 0)),
    ("last_item", lambda it: it.last_item, lambda it: core.get_item_at(it, -1)),
    ("is_empty", lambda it: it.is_empty, lambda it: core.is_empty(it)),
    ("largest", lambda it: it.largest, lambda it: core.largest_of(it)),
    ("smallest", lambda it: it.smallest, lambda it: core.smallest_of(it)),
    ("includes", lambda it: [it.includes(2, 3), it.includes(2, 9)], lambda it: [core.includes(it, 2, 3), False]),
    ("includes_any", lambda it: it.includes_any(9, 3), lambda it: core.includes_any(it, 9, 3)),
    ("all", lambda it: it.all(lambda n: n > 0), lambda it: core.all(it, lambda n: n > 0)),
    ("any", lambda it: it.any(lambda n: n > 3), lambda it: core.any(it, lambda n: n > 3)),
    ("map", lambda it: it.map(lambda n, at: n * at), lambda it: core.map(it, lambda n, at: n * at)),
    ("filter", lambda it: it.filter(lambda n: n % 2), lambda it: core.filter(it, lambda n: n % 2)),
    ("append", lambda it: it.append(7, 8), lambda it: core.append(it, 7, 8)),
    ("prepend", lambda it: it.prepend(7, 8), lambda it: core.prepend(it, 7, 8)),
    ("add_at", lambda it: it.add_at(1, 7), lambda it: core.add_at_position(it, 1, 7)),
    ("add_before", lambda it: it.add_before(3, 7), lambda it: core.add_before(it, 3, 7)),
    ("add_after", lambda it: it.add_after(3, 7), lambda it: core.add_after(it, 3, 7)),
    ("remove", lambda it: it.remove(2, 4), lambda it: core.remove(it, 2, 4)),
    ("remove_where", lambda it: it.remove_where(lambda n: n > 2), lambda it: core.remove_where(it, lambda n: n > 2)),
    ("remove_between", lambda it: it.remove_between(1, 3), lambda it: core.remove_range_between(it, 1, 3)),
    ("set_items", lambda it: it.set_items(1, 7, 8), lambda it: core.set_items_of(it, 1, 7, 8)),
    ("reverse", lambda it: it.reverse(), lambda it: core.reverse(it)),
    ("starting_from", lambda it: it.starting_from(-2), lambda it: core.range_starting_at(it, -2)),
    ("starting_with", lambda it: it.starting_with(3), lambda it: core.range_starting_at(it, core.position_of(it, 3))),
    ("slice", lambda it: it[1:3], lambda it: core.range_between(it, 1, 3)),
    ("starts_with", lambda it: [it.starts_with(1), it.starts_with(2)], lambda it: [core.starts_with(it, 1), False]),
    ("ends_with", lambda it: [it.ends_with(4), it.ends_with(3)], lambda it: [core.ends_with(it, 4), False]),
    ("clone", lambda it: it.clone(), lambda it: core.duplicate_list(it)),
    ("append_all", lambda it: it.append_all([7], numbers(8)), lambda it: core.merge_lists_into(it, [7], numbers(8))),
]


def outcome(result: object, of_list: List) -> dict[str, object]:
    """What to compare of `result`, from a method on `of_list`:  a list result as its class and items, then the list.

    - A change returns its list, and its twin `None`:  both are `"changed"`, and the items after say how.
    """
    answer = "changed" if result is of_list or result is None else result
    if isinstance(answer, List):
        answer = {"class": type(answer), "items": list(answer)}
    return {"answer": answer, "after": list(of_list)}


@pytest.mark.parametrize(("method", "twin"), [(method, twin) for _, method, twin in TWINS], ids=[t[0] for t in TWINS])
def test_each_word_does_what_its_core_twin_does(method: Callable[[List], Any], twin: Callable[[List], Any]) -> None:
    mine, theirs = numbers(1, 2, 3, 4), numbers(1, 2, 3, 4)
    assert outcome(method(mine), mine) == outcome(twin(theirs), theirs)


def test_on_an_empty_list_none_items_and_empty_results_of_its_class() -> None:
    empty = Deck()
    assert [empty.first_item, empty.last_item, empty.largest, empty.smallest, empty.random_item()] == [None] * 5
    assert empty.is_empty
    assert empty.all() is False
    for result in [empty[0:2], empty.starting_from(0), empty.filter(), empty.random_items(2)]:
        assert type(result) is Deck
        assert list(result) == []


def test_callbacks_get_value_position_list_or_as_many_as_they_take() -> None:
    deck = Deck(["a", "b"])
    seen: list[object] = []
    deck.for_each(lambda value, position, of_list: seen.append((value, position, of_list is deck)))
    deck.for_each(lambda value: seen.append(value))
    assert seen == [("a", 0, True), ("b", 1, True), "a", "b"]
    assert list(deck.map(str.upper)) == ["A", "B"]


def test_a_change_returns_the_list_so_calls_chain() -> None:
    assert list(numbers(1, 2, 3).append(4).reverse().remove(1).prepend(0)) == [0, 4, 3, 2]


def test_add_before_after_an_item_that_is_not_there() -> None:
    assert list(numbers(1, 2).add_before(9, 7)) == [7, 1, 2]
    assert list(numbers(1, 2).add_after(9, 7)) == [1, 2, 7]
    assert list(numbers(1, 2, 3).starting_with(9)) == [1, 2, 3]


def test_ranges_as_a_slice() -> None:
    deck = Deck(["a", "b", "c", "d"])
    assert list(deck[1:3]) == ["b", "c"]
    assert list(deck.starting_from(2)) == ["c", "d"]
    assert list(deck.starting_from(-3)) == ["b", "c", "d"]
    assert list(deck.remove_between(0, 2)) == ["c", "d"]
    assert list(deck.remove_between(-1)) == ["c"]


def test_copies_keep_the_class_or_take_one() -> None:
    shoe = Shoe(["a", "b"])
    assert type(shoe.clone()) is Shoe
    assert list(shoe.clone()) == ["a", "b"]
    assert type(shoe.clone_as(Deck)) is Deck
    lists = List([numbers(1, 2), numbers(3)])
    assert list(lists.merged()) == [1, 2, 3]
    assert type(lists.merged(Deck)) is Deck
    assert List().merged() is None


def test_random_ones_from_cores_seeded_numbers(seeded_core: None) -> None:
    deck = Deck(range(1, 11))
    assert deck.includes(deck.random_item())
    picked = deck.random_items(3)
    assert type(picked) is Deck
    assert len(set(picked)) == 3
    assert picked.all(lambda it: it in deck)


def test_largest_and_smallest_of_things_python_can_not_compare_keep_the_first() -> None:
    assert numbers(3, 9, 1).largest == 9
    assert List(["b", 2, "a"]).smallest == "a"


def test_a_thing_list_reads_its_things() -> None:
    class Gem(Thing):
        """`a gem is a thing` with a size."""

        size = prop(type="number")

    gems = List([Gem(size=3), Gem(size=1)])
    assert gems.filter(lambda gem: gem.size > 2).first_item is gems[0]
