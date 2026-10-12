"""Playing a program the way its page does:  by the page's messages, checking each patch.

```python
game = play_page("Solitaire.compiled.py", seed=1)
stock = game.named("stock")                   # what the page holds of it:  its JSON, by id
patch = game.trigger("card-click", card=game.ref(stock["@items"][-1]))
assert [thing["@type"] for thing in patch] == ["Card", "StockPile", "DiscardPile"]
assert game.thing(stock["@id"])["@items"] == stock["@items"][:-1]
```

- What a test sees is what a page sees:  the state it started from, then each patch, by id (`spell_core.state`).
  - `thing(the_id)`:  a thing as the page holds it now, its JSON
  - `named(name)`:  one the program keeps at its top level
  - Each patch has each thing that changed, whole, so the latest JSON for an id is the thing.
- Each message is the page's own, run by its `PageSession` on asyncio, to its end:
  a function that waits is awaited.
  - Pauses don't wait unless asked (`pauses=True`).
- After each, a check that nothing was left out:
  a mirror reads every patch so far, and must hold the program's whole state;  else `PatchMismatchError`.
- A thing is named by its id, `{"@id": "12"}` (`ref()`), or by a reference, `"Card#queen-of-spades"` (`reference()`).
- Epic python-target, P30.
"""

import asyncio
from pathlib import Path
from typing import Any

from spell_core.page import PageSession
from spell_core.references import reference_for
from spell_core.run import run_program
from spell_core.state import ID_KEY, StateMirror, StateWriter


class PatchMismatchError(AssertionError):
    """The patches a page was sent don't add up to the program's state:  a change `note_change()` missed."""


class PagePlayer:
    """A program, played by a page's messages:  see the module's docs."""

    def __init__(self, session: PageSession) -> None:
        """Play `session`'s program:  its whole state read, as a page starts from it."""
        self.session = session
        self.patches: list[list[dict[str, Any]]] = []
        self._by_id: dict[str, dict[str, Any]] = {}
        self._mirror = StateMirror()
        self.state: dict[str, Any] = session.state()
        self._mirror.read(self.state)
        self._note(self.state)

    def thing(self, the_id: str) -> dict[str, Any]:
        """The thing with `the_id`, as the page holds it now:  its JSON, things it holds by id.

        - throws `KeyError` for an id the page was never sent
        """
        return self._by_id[the_id]

    def named(self, name: str) -> dict[str, Any]:
        """The thing the program keeps at its top level as `name`, as the page holds it now:  `named("stock")`."""
        return self.thing(self.state[name][ID_KEY])

    def ids_of_type(self, type_name: str) -> list[str]:
        """The ids of every thing of type `type_name` the page holds, in the order it was sent them."""
        return [the_id for the_id, thing in self._by_id.items() if thing.get("@type") == type_name]

    @staticmethod
    def ref(thing: dict[str, Any] | str) -> dict[str, str]:
        """How a message names `thing` (its JSON, or its id):  `{"@id": "12"}`."""
        return {ID_KEY: thing if isinstance(thing, str) else thing[ID_KEY]}

    def reference(self, the_id: str) -> str | None:
        """How a page names the thing with `the_id` by reference (P27):  `Card#queen-of-spades`, `Tableau#3`."""
        session = self.session
        return reference_for(session.writer.thing_with_id(the_id), session.writer.things_given_ids(), session.things)

    def trigger(self, event: str, target: str | list[str] | None = None, **details: Any) -> list[dict[str, Any]]:
        """Send the event the page sends for `event`, e.g. a click:  what it changed, the patch.

        - `target`:  what it happened to, by reference, `"Card#queen-of-spades"` (`reference()`);
          its handler gets it as `event.target`, and as `event.card`.
        - `details`:  the rest, each thing by `ref()` or reference.
        """
        message: dict[str, Any] = {"trigger": event, "details": details}
        if target is not None:
            message["target"] = target
        return self.send(message)

    def call(self, name: str, *args: Any, on: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        """Send a call of the program's function `name`, or of the method `name` of the thing `on`:  the patch."""
        message: dict[str, Any] = {"call": name, "args": list(args)}
        if on is not None:
            message["on"] = self.ref(on)
        return self.send(message)

    def send(self, message: dict[str, Any]) -> list[dict[str, Any]]:
        """Send the page's `message`, run to its end:  what it changed, the patch -- checked (`PatchMismatchError`)."""
        patch = asyncio.run(self.session.handle_async(message))
        self.patches.append(patch)
        self._note(patch)
        self._mirror.read(patch)
        self.check()
        return patch

    def check(self) -> None:
        """The patches so far add up to the program's whole state:  else `PatchMismatchError`."""
        mirrored = {name: self._mirror.thing_with_id(value[ID_KEY]) for name, value in self.state.items()}
        if StateWriter().state_of(mirrored) != StateWriter().state_of(self.session.things):
            messages = len(self.patches)
            raise PatchMismatchError(f"after {messages} messages, the patches don't add up to the program's state")

    def _note(self, value: Any) -> None:
        """SIDE EFFECT:  keep each thing written whole in `value`, by its id:  the page's view of it now."""
        if isinstance(value, list):
            for item in value:
                self._note(item)
        elif isinstance(value, dict):
            if ID_KEY in value and len(value) > 1:
                self._by_id[value[ID_KEY]] = {key: _by_ref(item) for key, item in value.items()}
            for key, item in value.items():
                if key != ID_KEY:
                    self._note(item)


def _by_ref(value: Any) -> Any:
    """`value`, each thing in it named by its id alone, `{"@id": "12"}`:  how one thing's JSON holds another."""
    if isinstance(value, list):
        return [_by_ref(item) for item in value]
    if isinstance(value, dict):
        if ID_KEY in value:
            return {ID_KEY: value[ID_KEY]}
        return {key: _by_ref(item) for key, item in value.items()}
    return value


def play_page(program: str | Path, seed: int = 1, pauses: bool = False) -> PagePlayer:
    """Run the compiled `program`, seeded, and play it by a page's messages:  see the module's docs."""
    return PagePlayer(PageSession(run_program(program, seed=seed, pauses=pauses)))


__all__ = ["PagePlayer", "PatchMismatchError", "play_page"]
