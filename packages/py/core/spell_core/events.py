"""spell's events:  `when a card is clicked:` in Python (epic python-target, P11).

```python
@core.on("card-click")
def on_card_click(event):
    event.card.play()

core.trigger("card-click", card=card)
```

- The twin of the JavaScript core's `SpellEvent.ts`:  each target keeps its handlers by event type, case ignored,
  and an event passes on to its target's `event_parent`, if it has one.
- `core.on()` / `core.trigger()` are the running program's:  see `runtime_methods.py`.
  A thing has its own, `card.on("click", ...)`.
- A handler that fails doesn't stop the others:  its error is a warning on the program's console.
"""

import asyncio
import inspect
from collections.abc import Callable, Coroutine
from typing import Any

# What a handler is called with:  the event, and what it was triggered on
Handler = Callable[..., object]


class SpellEvent:
    """An event:  its `type`, e.g. `card-click`, and what it carries, read as attributes -- `event.card`."""

    def __init__(self, type: str, **props: object) -> None:
        self.type = type
        self.__dict__.update(props)

    def __repr__(self) -> str:
        props = ", ".join(f"{key}={value!r}" for key, value in self.__dict__.items() if key != "type")
        return f"SpellEvent({self.type!r}{', ' + props if props else ''})"


class Eventful:
    """What anything that has events has:  `on()`, `once()`, `off()` and `trigger()`.

    - Handlers are kept per object, by event type in lower case:  `Card-Click` is `card-click`.
    - `on()` without a handler is a decorator:  `@card.on("click")` above a `def`.
    """

    def _handlers_for(self, event_type: str, make: bool = False) -> list[Handler] | None:
        """This object's handlers for `event_type`;  a new, empty list when there are none and `make` says so."""
        handlers: dict[str, list[Handler]] | None = self.__dict__.get("_handlers")
        if handlers is None:
            if not make:
                return None
            handlers = self.__dict__["_handlers"] = {}
        key = event_type.lower()
        if key not in handlers and make:
            handlers[key] = []
        return handlers.get(key)

    def on(self, event_type: str, handler: Handler | None = None) -> Any:
        """Call `handler` each time `event_type` is triggered here;  with no handler, a decorator that adds one."""
        if handler is None:
            return lambda handler: self.on(event_type, handler)
        handlers = self._handlers_for(event_type, make=True)
        assert handlers is not None
        handlers.append(handler)
        return handler

    def once(self, event_type: str, handler: Handler | None = None) -> Any:
        """Call `handler` the NEXT time `event_type` is triggered here, then forget it -- see `on()`."""
        if handler is None:
            return lambda handler: self.once(event_type, handler)

        def just_once(*args: object) -> object:
            self.off(event_type, just_once)
            return _call(handler, args)

        return self.on(event_type, just_once) and handler

    def off(self, event_type: str, handler: Handler | None = None) -> None:
        """Stop calling `handler` for `event_type` here;  with no handler, stop calling any."""
        handlers = self._handlers_for(event_type)
        if handlers is None:
            return
        if handler is None:
            handlers.clear()
        elif handler in handlers:
            handlers.remove(handler)

    def trigger(self, event: "SpellEvent | str", **props: object) -> list[object]:
        """Call each handler for `event`, then pass it to `event_parent`, if any:  what each returned, in order.

        - `event`:  a `SpellEvent`, or its type, `"card-click"`.
        - `props` go on it:  `event.card`.
        """
        from spell_core import core  # the program's console, for a handler that fails

        if isinstance(event, str):
            event = SpellEvent(event)
        event.__dict__.update(props)
        results: list[object] = []
        for handler in list(self._handlers_for(event.type) or []):
            try:
                results.append(_call(handler, (event, self)))
            except Exception as error:  # one failing handler mustn't stop the others
                core.console.warn(f"Error calling event '{event.type}': ", repr(error))
        parent = self.__dict__.get("event_parent")
        if isinstance(parent, Eventful):
            results.extend(parent.trigger(event))
        return results


def _call(handler: Handler, args: tuple[object, ...]) -> object:
    """`handler(*args)`, given only as many arguments as it takes:  a handler may take the event alone, or nothing.

    - An `async def` handler (one that waits) runs too:
      - while the program's loop is running, as a task, so it goes on beside it, as javascript's does
      - else to its end, there and then
    """
    code = getattr(handler, "__code__", None)
    if code is None or code.co_flags & 0x04:  # not plain Python, or takes `*args`:  everything
        result = handler(*args)
    else:
        takes = code.co_argcount - (1 if hasattr(handler, "__self__") else 0)
        result = handler(*args[:takes])
    return _run(result) if inspect.iscoroutine(result) else result


# the handlers' tasks still running:  kept, so none is let go before it ends
_tasks: set[asyncio.Task[object]] = set()


def _run(coroutine: Coroutine[object, object, object]) -> object:
    """Run an `async def` handler's `coroutine` -- see `_call()`:  its task, or what it returned."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(coroutine)
    task = loop.create_task(coroutine)
    _tasks.add(task)
    task.add_done_callback(_tasks.discard)
    return task
