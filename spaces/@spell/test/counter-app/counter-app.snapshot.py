from __future__ import annotations

from typing import Any

from spell_core import core, App, prop, h
from counter import Counter


###################################################################
# ## A counter app:  a counter from another project, made and drawn
###################################################################


class Tally(App):
    """Its counter is the frozen counter library's (`@spell/test/counter`), which its project file imports."""

    element_tag = "test-project-app"

    # - its "counter" is a new counter
    counter = prop(init=lambda: Counter(), early=True)

    # the counter draws itself:  a button showing its count

    def draw(self) -> Any:
        return h("div", {"class": "Tally"}, core.draw_thing(self.counter))


tally = Tally()


def test_the_imported_counter() -> Any:
    """Tests"""
    with core.test("test the imported counter"):
        core.echo_test_action("set the counter to a new counter")
        counter = Counter()
        core.expect(counter.count, "the count of the counter", 0, "0")
        core.echo_test_action("increment the counter")
        counter.increment()
        core.expect(counter.count, "the count of the counter", 1, "1")


# Start
tally.start()


# -----------


test_the_imported_counter()
