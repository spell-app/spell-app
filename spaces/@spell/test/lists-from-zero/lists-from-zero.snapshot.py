from __future__ import annotations

from typing import Any

from spell_core import core, Thing, List, prop


#########################################################################
# ## Counting from 0:  this project's lists start at 0 (its project file)
#########################################################################


class Tile(Thing):
    """Numbers count from 0;  ordinal words don't change.  Its rack is its own:  five tiles, A first."""

    # - its "letter" is text
    letter = prop(type="text")


class Rack(List):
    item_type = Tile

    def create(self) -> None:
        """a new rack holds five tiles, A to E"""
        self.append(Tile(letter="A"))
        self.append(Tile(letter="B"))
        self.append(Tile(letter="C"))
        self.append(Tile(letter="D"))
        self.append(Tile(letter="E"))


def test_counting_from_zero() -> Any:
    """Tests"""
    with core.test("test counting from zero"):
        core.echo_test_action("the rack is a new rack")
        rack = Rack()
        core.expect(
            getattr(rack.first_item, "letter", None),
            "the letter of tile 0 of the rack",
            "A",
            "\"A\"",
        )
        core.expect(
            getattr(rack[1], "letter", None),
            "the letter of tile 1 of the rack",
            "B",
            "\"B\"",
        )
        core.expect(
            getattr(rack.last_item, "letter", None),
            "the letter of tile -1 of the rack",
            "E",
            "\"E\"",
        )
        core.expect(
            getattr(rack.first_item, "letter", None),
            "the letter of the first tile of the rack",
            "A",
            "\"A\"",
        )
        core.expect(
            getattr(rack[1], "letter", None),
            "the letter of the second tile of the rack",
            "B",
            "\"B\"",
        )
        core.expect(
            getattr(rack.last_item, "letter", None),
            "the letter of the last tile of the rack",
            "E",
            "\"E\"",
        )
        core.echo_test_action("set the start to the first tile of the rack")
        start = rack.first_item
        core.expect(rack.position_of(start), "the position of the start in the rack", 0, "0")
        core.echo_test_action("set the front to tiles 0 to 2 of the rack")
        front = rack[0:3]
        core.expect(len(front), "the number of tiles in the front", 3, "3")
        core.expect(
            getattr(front.last_item, "letter", None),
            "the letter of the last tile of the front",
            "C",
            "\"C\"",
        )
        core.echo_test_action("set the back to last two tiles of the rack")
        back = core.range_starting_at(rack, -2, 2)
        core.expect(len(back), "the number of tiles in the back", 2, "2")
        core.expect(
            getattr(back.first_item, "letter", None),
            "the letter of the first tile of the back",
            "D",
            "\"D\"",
        )
        core.echo_test_action("set the positions to a new list of numbers")
        positions = List(item_type="number")
        core.echo_test_action("for each tile, position in the front")
        for position_, tile in enumerate(front):
            positions.append(position_)
        core.echo(f"positions: {positions}")
        core.echo_test_action("remove tile 0 of the rack")
        core.remove_item_at(rack, 0)
        core.expect(
            getattr(rack.first_item, "letter", None),
            "the letter of the first tile of the rack",
            "B",
            "\"B\"",
        )


# -----------


test_counting_from_zero()
