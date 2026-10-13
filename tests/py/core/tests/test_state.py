"""A program's state as JSON by id (`state.py`):  written by a `StateWriter`, read into a `StateMirror`.

- `stateById.expected.json`, with the JavaScript core's tests (`tests/core/`), holds the state these tests write.
  The JavaScript core's `state.test.ts` writes the same things and reads the same file, so the two cores agree.
- The classes are what spell compiles from:
  - `a chip is a thing` + `a chip has a color as text` + `a chip has a value as a number`
  - `a stack is a list of chips` + `a stack has a name as text` + `a chip belongs to one stack`
  - `a table is a thing` + `a table has stacks as a list of stacks` + `a table has a top as a chip`
"""

import json
from pathlib import Path

from spell_core import List, StateMirror, StateWriter, Thing, core, prop

EXPECTED = json.loads((Path(__file__).parents[3] / "core" / "stateById.expected.json").read_text(encoding="utf-8"))


class Chip(Thing):
    """`a chip is a thing`."""

    color = prop(type="text")
    value = prop(type="number")

    @property
    def stack(self) -> "Stack | None":
        """`the stack of a chip`, from `a chip belongs to one stack`."""
        return Stack.owner_of(self)


class Stack(List):
    """`a stack is a list of chips` + `a chip belongs to one stack`."""

    item_type = Chip
    exclusive = True
    name = prop(type="text")


class Table(Thing):
    """`a table is a thing`, holding the stacks, and one chip a second time, as its `top`."""

    stacks = prop(type="list")
    top = prop(type="Chip")


def a_table() -> Table:
    """A table of two stacks, its top the first chip of the first:  `EXPECTED["first"]`, written."""
    red = Chip(color="red", value=5)
    blue = Chip(color="blue", value=10)
    return Table(stacks=[Stack([red, blue], name="left"), Stack(name="right")], top=red)


def test_a_writer_writes_each_thing_once_then_by_its_id() -> None:
    assert StateWriter().state_of(a_table()) == EXPECTED["first"]


def test_a_writer_keeps_each_things_id() -> None:
    writer = StateWriter()
    table = a_table()
    writer.state_of(table)
    red = table.top
    core.move(red, table.stacks[1])
    assert writer.state_of(table) == EXPECTED["moved"]
    assert writer.id_of(red) == "3"


def test_a_mirror_reads_a_thing_mentioned_twice_as_one() -> None:
    table = StateMirror().read(EXPECTED["first"])
    assert isinstance(table, Table)
    assert table.top is table.stacks[0][0]
    assert table.top.stack is table.stacks[0]
    assert [chip.color for chip in table.stacks[0]] == ["red", "blue"]


def test_a_mirror_changes_what_it_holds_in_place() -> None:
    mirror = StateMirror()
    table = mirror.read(EXPECTED["first"])
    left, right = table.stacks
    red = table.top
    again = mirror.read(EXPECTED["moved"])
    assert again is table
    assert again.stacks[0] is left
    assert again.stacks[1] is right
    assert list(right) == [red]
    assert red.stack is right
    assert mirror.thing_with_id("3") is red


def test_a_mirror_unsets_what_a_thing_no_longer_has() -> None:
    mirror = StateMirror()
    chip = mirror.read({"$type": "Chip", "$id": "1", "color": "red", "value": 5})
    mirror.read({"$type": "Chip", "$id": "1", "color": "red"})
    assert chip.value is None
    assert "value" not in chip.to_json()


def test_from_json_reads_ids_too() -> None:
    table = core.from_json(json.dumps(EXPECTED["first"]))
    assert table.top is table.stacks[0][0]


def test_from_json_without_ids_makes_a_thing_each_time() -> None:
    chips = core.from_json([{"$type": "Chip", "color": "red"}, {"$type": "Chip", "color": "red"}])
    assert chips[0] is not chips[1]


def test_a_patch_is_only_what_changed() -> None:
    writer = StateWriter()
    table = a_table()
    writer.state_of(table)
    assert writer.patch() == []
    core.move(table.top, table.stacks[1])
    assert writer.patch() == EXPECTED["patch"]
    assert writer.patch() == []


def test_a_patch_writes_a_new_thing_whole_inside_what_holds_it() -> None:
    writer = StateWriter()
    table = a_table()
    writer.state_of(table)
    table.stacks[1].append(Chip(color="green", value=25))
    assert writer.patch() == [
        {
            "$type": "Stack",
            "$id": "5",
            "name": "right",
            "$items": [{"$type": "Chip", "$id": "6", "color": "green", "value": 25}],
        }
    ]


def test_a_full_state_covers_every_change_so_far() -> None:
    writer = StateWriter()
    table = a_table()
    writer.state_of(table)
    table.top.value = 7
    writer.state_of(table)
    assert writer.patch() == []


def test_patches_read_into_a_mirror_give_the_full_state() -> None:
    writer = StateWriter()
    table = a_table()
    mirror = StateMirror()
    copy = mirror.read(writer.state_of(table))
    red, blue = table.stacks[0]
    steps = [
        lambda: core.move(red, table.stacks[1]),
        lambda: setattr(blue, "value", 11),
        lambda: table.stacks[0].append(Chip(color="green")),
        lambda: setattr(red, "value", None),
        lambda: setattr(table, "top", blue),
        lambda: table.stacks[1].clear(),
    ]
    for step in steps:
        step()
        mirror.read(writer.patch())
        assert StateWriter().state_of(copy) == StateWriter().state_of(table)
