from __future__ import annotations

from typing import Any

from spell_core import core, Drawable, prop, h


#########################################################################
# ## A counter -- in the outline style:  its name, then what's true of it
#########################################################################


class Counter(Drawable):
    """
    A library other projects import:  `counter-app` makes one and draws it.
    A drawable thing:  each counter is its own element on the page, e.g. `<counter-counter>`.
    """

    element_tag = "test-project-counter"

    # - its "count" is a number
    count = prop(type="number")

    def create(self) -> None:
        """a new counter starts at 0"""
        self.count = 0

    def increment(self) -> None:
        self.count = self.count + 1

    # drawing:  a button showing its count;  a click counts

    def draw(self) -> Any:
        return h(
            "ui-button",
            {
                "class": "Counter",
                "onClick": lambda event: self.increment(),
                "style": "cursor:pointer;user-select:none",
            },
            f"Count: {self.count}",
        )


def test_counting() -> Any:
    """Tests"""
    with core.test("test counting"):
        core.echo_test_action("get a new counter")
        it = Counter()
        core.expect(it.count, "its count", 0, "0")
        core.echo_test_action("increment it")
        it.increment()
        core.echo_test_action("increment it")
        it.increment()
        core.expect(it.count, "its count", 2, "2")


# -----------


test_counting()
