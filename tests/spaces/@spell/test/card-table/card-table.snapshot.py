from __future__ import annotations

from typing import Any

from spell_core import core, App, Drawable, DrawableList, prop, h


# A card table:  a drawable list whose frame has a named place, filled by a child that says it goes there


class Card(Drawable):
    rank = prop(type="text")

    def draw(self) -> Any:
        return h("div", {"class": "card"}, self.rank)


class Pile(DrawableList):
    """its frame:  a header place, then where its cards show"""

    item_type = Card

    name = prop(type="text")

    def draw(self) -> Any:
        return h(
            "div",
            {"class": "pile"},
            h("div", {"class": "header"}, h("slot", {"name": "header"})),
            h("slot"),
        )


class Table(App):
    def draw(self) -> Any:
        """
        a pile written by hand, its <h3> in its header place
        - its tag is its project's and its type's:  this fixture compiles as project "test-project"
        """
        return h(
            "div",
            {"class": "table"},
            core.draw_thing(pile),
            h("test-project-pile", h("h3", {"slot": "header"}, "Discards")),
        )


table = Table()
pile = Pile(name="Pile 1")
pile.append(Card(rank="A"))
pile.append(Card(rank="K"))

table.start()
