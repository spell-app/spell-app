"""Types and equality, as the JavaScript core's `typeOf()`, `isOfType()` and `equals()` answer them."""

import math

import pytest

from spell_core import SpellCore


class Thing:
    def __init__(self, **fields: object) -> None:
        self.__dict__.update(fields)


class Card(Thing):
    pass


class Joker(Card):
    pass


class Pile(list):
    pass


@pytest.mark.parametrize(
    ("value", "type_name"),
    [
        (None, "unknown"),
        (math.nan, "unknown"),
        (True, "choice"),
        (3, "number"),
        (3.5, "number"),
        ("queen", "text"),
        ([1, 2], "list"),
        ((1, 2), "list"),
        ({"rank": "queen"}, "object"),
        (len, "function"),
        (Card, "function"),
        (Joker(), "joker"),
        (Pile(), "pile"),
    ],
)
def test_type_of(core: SpellCore, value: object, type_name: str) -> None:
    assert core.type_of(value) == type_name


def test_types_of_lists_every_class_most_specific_first(core: SpellCore) -> None:
    assert core.types_of(Joker()) == ["joker", "card", "thing"]
    assert core.types_of(Pile()) == ["pile", "list"]
    assert core.types_of(True) == ["choice"]


@pytest.mark.parametrize(
    ("value", "type_name", "is_of_type"),
    [
        (3, "integer", True),
        (3.0, "integer", True),
        (3.5, "integer", False),
        (True, "integer", False),
        (1e21, "integer", False),
        (math.inf, "integer", False),
        ("q", "character", True),
        ("q", "char", True),
        ("qu", "character", False),
        ("🂡", "character", False),
        (3, "Number", True),
        (Joker(), "Card", True),
        (Card(), "joker", False),
        ([], "list", True),
    ],
)
def test_is_of_type(core: SpellCore, value: object, type_name: str, is_of_type: bool) -> None:
    assert core.is_of_type(value, type_name) is is_of_type


def test_matches_type_is_one_way(core: SpellCore) -> None:
    assert core.matches_type(Joker(), Card())
    assert not core.matches_type(Card(), Joker())


def test_numbers(core: SpellCore) -> None:
    assert core.is_a_number(3) and core.is_a_number(2.5)
    assert not core.is_a_number(True)
    assert not core.is_a_number(math.nan)
    assert not core.is_a_number("3")


@pytest.mark.parametrize(
    ("thing", "other", "equal"),
    [
        (3, 3.0, True),
        (1, True, False),
        (0, False, False),
        (math.nan, math.nan, True),
        ("1", 1, False),
        (None, None, True),
        (None, 0, False),
        ([1, [2, 3]], [1, [2, 3]], True),
        ([1, 2], (1, 2), True),
        ([1, 2], [2, 1], False),
        ({"a": [1, {"b": 2}]}, {"a": [1, {"b": 2.0}]}, True),
        ({"a": 1}, {"a": 1, "b": 2}, False),
        (Card(rank="queen"), Card(rank="queen"), True),
        (Card(rank="queen"), Card(rank="king"), False),
        (Card(rank="queen"), Joker(rank="queen"), False),
    ],
)
def test_equals_looks_inside_as_lodash_does(core: SpellCore, thing: object, other: object, equal: bool) -> None:
    assert core.equals(thing, other) is equal
