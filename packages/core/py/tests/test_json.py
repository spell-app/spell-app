"""Spell's JSON:  `to_json()` writes `"@type"` and `"@items"`;  `core.from_json()` reads them back as they were.

- The classes' names are this file's own (`JsonCard` ...):  `from_json()` finds a class by its name.
"""

import json

import pytest

from spell_core import List, Thing, core, prop


class JsonCard(Thing):
    """`a card is a thing` with a rank."""

    rank = prop(type="text")


class JsonPile(List):
    """`a pile is a list of cards` + `a card belongs to one pile`, with a name."""

    exclusive = True
    name = prop(type="text")

    def create(self) -> None:
        """Deals itself a card on set-up:  `from_json()` replaces it with the JSON's items."""
        self.append(JsonCard(rank="joker"))

    @property
    def top(self) -> object:
        """No setter:  a getter only."""
        return self.last_item


class JsonHand(List):
    """`a hand is a list of cards` + `a card belongs to one hand`."""

    exclusive = True


class JsonTable(Thing):
    """`a table is a thing` with a name and a pile."""

    name = prop(type="text")
    pile = prop(type="JsonPile")


def test_a_list_is_its_type_its_properties_then_its_items_each_by_its_own_json() -> None:
    pile = JsonPile([JsonCard(rank="A"), JsonCard(rank="K")], name="stock")
    table = JsonTable(name="table", pile=pile)
    assert json.dumps(table.to_json(), separators=(",", ":")) == (
        '{"@type":"JsonTable","name":"table","pile":{"@type":"JsonPile","name":"stock","@items":['
        '{"@type":"JsonCard","rank":"A"},{"@type":"JsonCard","rank":"K"},{"@type":"JsonCard","rank":"joker"}]}}'
    )


def test_a_plain_list_and_a_scratch_one() -> None:
    assert List([1, 2]).to_json() == {"@type": "List", "@items": [1, 2]}
    hand = JsonHand([JsonCard(rank="Q"), JsonCard(rank="K")])
    assert hand.filter(lambda card: card.rank == "K").to_json() == {
        "@type": "JsonHand",
        "@items": [{"@type": "JsonCard", "rank": "K"}],
    }


def test_from_json_makes_each_object_again_as_its_class() -> None:
    table = JsonTable(name="table", pile=JsonPile([JsonCard(rank="A")], name="stock"))
    again = core.from_json(json.dumps(table.to_json()))
    assert type(again) is JsonTable
    assert again.name == "table"
    assert type(again.pile) is JsonPile
    assert [card.rank for card in again.pile] == ["A", "joker"]
    assert again.to_json() == table.to_json()


def test_a_lists_items_are_set_so_an_exclusive_one_owns_them_and_create_s_are_replaced() -> None:
    pile = core.from_json({"@type": "JsonPile", "name": "stock", "@items": [{"@type": "JsonCard", "rank": "A"}]})
    assert len(pile) == 1
    assert JsonPile.owner_of(pile[0]) is pile


def test_an_unknown_type_is_a_plain_dict_its_type_kept() -> None:
    data = {"@type": "Nobody", "inner": {"@type": "JsonCard", "rank": "Q"}, "list": [1, {"@type": "JsonCard"}]}
    again = core.from_json(data)
    assert again["@type"] == "Nobody"
    assert type(again["inner"]) is JsonCard
    assert type(again["list"][1]) is JsonCard


def test_a_property_with_no_setter_is_set_after_and_reads_back() -> None:
    card = core.from_json({"@type": "JsonCard", "rank": "Q", "suit": "hearts"})
    assert card.suit == "hearts"
    assert card.to_json() == {"@type": "JsonCard", "rank": "Q", "suit": "hearts"}
    pile = core.from_json({"@type": "JsonPile", "top": "ignored by the getter", "@items": []})
    assert pile.top is None


def test_plain_values_come_back_as_they_are() -> None:
    assert core.from_json('[1, "two", null, true]') == [1, "two", None, True]


def test_text_that_is_not_json_raises() -> None:
    with pytest.raises(json.JSONDecodeError):
        core.from_json("{not json")
