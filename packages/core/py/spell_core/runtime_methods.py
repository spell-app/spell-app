"""`core`'s side of the running program:  its events, its processes, and pauses (epic python-target, P11).

- The twin of the JavaScript core's `runtime.ts` and `ui.ts`'s `pauseFor()`.
- A pause sleeps:  compiled Python is plain functions, not `async` (decision Q3);  the `py/asyncio` target waits with
  `asyncio.sleep()` instead.  `core.pauses = False` skips them, e.g. in a test run (`python -m spell_core.run
  --no-pauses`).
- Processes are names with a flag, "!" (running alone) or a count:  `start exclusive process deal the cards`.
"""

import time
from typing import Any, ClassVar

from spell_core.events import Eventful, Handler, SpellEvent


class SpellRuntime(Eventful):
    """The running program:  its events (`core.on()`, `core.trigger()`) and its state, e.g. its processes."""

    def __init__(self) -> None:
        self.state: dict[str, Any] = {}


class RuntimeMethods:
    """`core.on()`, `core.trigger()`, the processes and `core.pause_for()`."""

    # Milliseconds in each unit spell says:  `pause for 30 ticks` (a tick is 1/60 of a second, HyperCard's)
    TIME_UNITS_MAP: ClassVar[dict[str, float]] = {
        "second": 1000,
        "seconds": 1000,
        "sec": 1000,
        "millisecond": 1,
        "milliseconds": 1,
        "msec": 1,
        "tick": 1000 / 60,
        "ticks": 1000 / 60,
    }

    # Do pauses wait?  `False` in a test run, where only what's printed matters
    pauses: bool = True

    # the running program:  `SpellCore` makes one, `reset_runtime()` a new one
    RUNTIME: SpellRuntime

    def reset_runtime(self) -> None:
        """Start the program again:  no handlers, no processes."""
        self.RUNTIME = SpellRuntime()

    def pause_for(self, number: float, units: str = "seconds") -> None:
        """Wait `number` `units`:  `pause for 50 msec`.

        - An unknown unit is seconds;  no wait at all when `pauses` is off.
        """
        if not self.pauses:
            return
        milliseconds = round(number * self.TIME_UNITS_MAP.get(units, 1000)) if number == number else 0
        time.sleep(max(milliseconds, 0) / 1000)

    def on(self, event_type: str, handler: Handler | None = None) -> Any:
        """Call `handler` each time the program triggers `event_type`;  with no handler, a decorator:

        ```python
        @core.on("card-click")
        def on_card_click(event):
            event.card.play()
        ```
        """
        return self.RUNTIME.on(event_type, handler)

    def once(self, event_type: str, handler: Handler | None = None) -> Any:
        """Call `handler` the NEXT time the program triggers `event_type` -- see `on()`."""
        return self.RUNTIME.once(event_type, handler)

    def off(self, event_type: str, handler: Handler | None = None) -> None:
        """Stop calling `handler` for `event_type`."""
        self.RUNTIME.off(event_type, handler)

    def trigger(self, event: SpellEvent | str, **props: object) -> list[object]:
        """Trigger `event` in the program:  `core.trigger("card-click", card=card)`;  what each handler returned."""
        return self.RUNTIME.trigger(event, **props)

    def get_runtime_state(self, key: str, initializer: Any = None) -> Any:
        """The program's state under `key`, made by `initializer()` the first time."""
        state = self.RUNTIME.state
        if key not in state and initializer is not None:
            state[key] = initializer()
        return state.get(key)

    def clear_runtime_state(self) -> None:
        """Forget the program's state."""
        self.RUNTIME.state.clear()

    def get_process_flags(self) -> dict[str, object]:
        """Each process's flag, by name:  "!" running alone, or how many are running."""
        return self.get_runtime_state("process_flags", dict)

    def start_process(self, name: str, exclusively: str | None = None) -> None:
        """Start process `name`:  `"EXCLUSIVE"` running alone, else one more of it running."""
        flags = self.get_process_flags()
        if exclusively:
            flags[name] = "!"
        else:
            count = flags.get(name)
            flags[name] = (count if isinstance(count, int) else 0) or 1

    def process_is_running(self, name: str) -> bool:
        """Is process `name` running?  `if deal the cards is running`."""
        flag = self.get_process_flags().get(name)
        return flag == "!" or (isinstance(flag, int) and flag > 0)

    def stop_process(self, name: str) -> bool:
        """Stop process `name` (one of it, if counted):  is it still running?"""
        flags = self.get_process_flags()
        flag = flags.get(name)
        if flag == "!":
            del flags[name]
        elif isinstance(flag, int) and flag > 0:
            flags[name] = flag - 1
        return bool(flags.get(name))
