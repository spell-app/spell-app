"""A program's side of a page that draws it (epic python-target, P19):  its state for the page, the page's messages run.

```python
session = PageSession(run_program("Solitaire.compiled.py", seed=1))
session.state()        # the whole state, by id, for the page to start from
session.handle({"trigger": "card-click", "details": {"card": {"@id": "12"}}})
# => the patch:  only what that click changed
```

- `python -m spell_core.page Solitaire.compiled.py --seed 1` talks to a page over stdin and stdout, a JSON line each:
  it writes the state first, then reads each message, writing what it changed.
- The page draws with the program's drawing half in javascript, `<Project>.elements.js`, from the state it's sent;
  see `startPage()` in the JavaScript core's `page.ts`.
- What it sends, each thing in it by its id (`{"@id": "3"}`):
  - a call of one of the program's functions:  `{"call": "play_from_the_stock_pile", "args": []}`
  - a call of a thing's method:  `{"call": "turn_over", "on": {"@id": "3"}, "args": []}`
  - an event, for the program's handlers:  `{"trigger": "card-click", "details": {"card": {"@id": "3"}}}`
- Each message is run, then answered with what it changed (`StateWriter.patch()`).
- Python's names in what it sends:  the page's javascript was written with them (`P.ElementsWriter`).
  An event's details are javascript's (`camelCase`):  read as Python's (`snake_case`).
"""

import argparse
import inspect
import json
import re
import sys
from typing import Any

from spell_core.core import core
from spell_core.state import ID_KEY, StateWriter
from spell_core.things import SpellObject


class PageSession:
    """One page's session with a program:  see the module's docs."""

    def __init__(self, names: dict[str, Any]) -> None:
        """A session with the program whose top level is `names`, as it ended its run (`run_program()`)."""
        self.names = names
        self.writer = StateWriter()

    @property
    def things(self) -> dict[str, SpellObject]:
        """The things the program keeps at its top level, by their names:  its state."""
        return {name: value for name, value in self.names.items() if isinstance(value, SpellObject)}

    def state(self) -> Any:
        """The program's whole state, by id:  what the page starts from."""
        return self.writer.state_of(self.things)

    def handle(self, message: dict[str, Any]) -> list[dict[str, object]]:
        """Run `message`, then answer what it changed:  see the module's docs.

        - throws `ValueError` for a message that's neither a call nor an event, or names nothing the program has.
        """
        self.run(message)
        return self.writer.patch()

    async def handle_async(self, message: dict[str, Any]) -> list[dict[str, object]]:
        """As `handle()`, on asyncio:  a handler or function that's `async def` (one that waits) is awaited.

        - So the patch has all it changed, after any pause in it.
          A pause on the way sends what changed so far, through `core.before_pause`:  see `spell_quart`.
        """
        await self.run_async(message)
        return self.writer.patch()

    async def run_async(self, message: dict[str, Any]) -> None:
        """Run `message` to its end, awaiting what's `async def` -- see `handle_async()`."""
        for result in self.run(message):
            if inspect.isawaitable(result):
                await result

    def run(self, message: dict[str, Any]) -> list[object]:
        """Run `message`:  what it returned, each handler's for an event -- see `handle()`."""
        if "trigger" in message:
            details = message.get("details") or {}
            props = {python_name(key): self.read(value) for key, value in details.items()}
            return core.trigger(message["trigger"], **props)
        if "call" in message:
            return [self.callable(message)(*[self.read(arg) for arg in message.get("args") or []])]
        raise ValueError(f"A page's message is a call or an event:  {message!r}")

    def callable(self, message: dict[str, Any]) -> Any:
        """What `message`'s `"call"` names:  a function of the program's, or a method of the thing it's `"on"`."""
        name = message["call"]
        if "on" in message:
            thing = self.read(message["on"])
            if thing is None:
                raise ValueError(f"The page named a thing the program doesn't have:  {message['on']!r}")
            return getattr(thing, name)
        found = self.names.get(name)
        if not callable(found):
            raise ValueError(f"The program has no function '{name}'")
        return found

    def read(self, value: Any) -> Any:
        """`value` from a page's message:  each `{"@id": ...}` the thing with that id;  the rest as it is."""
        if isinstance(value, dict):
            if set(value) == {ID_KEY}:
                return self.writer.thing_with_id(value[ID_KEY])
            return {key: self.read(item) for key, item in value.items()}
        if isinstance(value, list):
            return [self.read(item) for item in value]
        return value


def python_name(name: str) -> str:
    """javascript's `name` as Python names it:  `startPile` => `start_pile`, `isAFaceCard` => `is_a_face_card`."""
    return re.sub(r"(?<!^)(?=[A-Z])", "_", name).lower()


def main(argv: list[str] | None = None) -> None:
    """Talk to a page over stdin and stdout, a JSON line each:  see the module's docs."""
    # imported here:  `run.py` imports this module
    from spell_core.run import run_program

    parser = argparse.ArgumentParser(prog="python -m spell_core.page", description="A program's side of its page.")
    parser.add_argument("program", help="the compiled program, e.g. Solitaire.compiled.py")
    parser.add_argument("--seed", type=int, help="where the random numbers start, from 1 to 2147483646")
    parser.add_argument("--no-pauses", action="store_true", help="don't wait at a pause")
    args = parser.parse_args(argv)
    session = PageSession(run_program(args.program, seed=args.seed, pauses=not args.no_pauses))
    print(json.dumps(session.state(), ensure_ascii=False), flush=True)
    for line in sys.stdin:
        if line.strip():
            print(json.dumps(session.handle(json.loads(line)), ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
