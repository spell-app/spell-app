"""spell's events, processes and pauses (epic python-target, P11):  `events.py`, `runtime_methods.py`."""

import asyncio
import time

import pytest

from spell_core import Thing
from spell_core.core import SpellCore


class Card(Thing):
    """A thing with events of its own."""


def test_a_handler_hears_the_programs_event_with_its_payload(core: SpellCore) -> None:
    heard = []

    @core.on("card-click")
    def on_card_click(event):
        heard.append(event.card)

    card = Card()
    core.trigger("card-click", card=card)
    assert heard == [card]


def test_event_types_ignore_case_and_return_what_handlers_return(core: SpellCore) -> None:
    core.on("Card-Click", lambda: "first")
    core.on("card-click", lambda event: "second")
    assert core.trigger("CARD-CLICK") == ["first", "second"]


def test_once_hears_one_event_then_forgets(core: SpellCore) -> None:
    heard = []
    core.once("ping", lambda: heard.append("ping"))
    core.trigger("ping")
    core.trigger("ping")
    assert heard == ["ping"]


def test_off_stops_a_handler(core: SpellCore) -> None:
    def handler() -> None:
        raise AssertionError("not heard after off()")

    core.on("ping", handler)
    core.off("ping", handler)
    assert core.trigger("ping") == []


def test_a_failing_handler_warns_and_the_rest_still_run(core: SpellCore, capsys: pytest.CaptureFixture[str]) -> None:
    def broken() -> None:
        raise ValueError("oops")

    core.on("ping", broken)
    core.on("ping", lambda: "still here")
    assert core.trigger("ping") == ["still here"]
    assert "oops" in capsys.readouterr().err


def test_a_thing_has_events_of_its_own_and_passes_them_to_its_parent() -> None:
    parent, child = Card(), Card()
    child.event_parent = parent
    parent.on("flip", lambda event: f"parent heard {event.type}")
    child.on("flip", lambda: "child heard")
    assert child.trigger("flip") == ["child heard", "parent heard flip"]


def test_a_new_runtime_forgets_handlers_and_processes(core: SpellCore) -> None:
    core.on("ping", lambda: "heard")
    core.start_process("deal")
    core.reset_runtime()
    assert core.trigger("ping") == []
    assert not core.process_is_running("deal")


def test_processes_run_alone_or_counted(core: SpellCore) -> None:
    core.start_process("deal", "EXCLUSIVE")
    assert core.process_is_running("deal")
    assert core.stop_process("deal") is False
    core.start_process("animation")
    assert core.process_is_running("animation")
    assert core.stop_process("animation") is False


def test_a_pause_waits_unless_pauses_are_off(core: SpellCore) -> None:
    start = time.perf_counter()
    core.pause_for(30, "msec")
    assert time.perf_counter() - start >= 0.025
    core.pauses = False
    start = time.perf_counter()
    core.pause_for(10, "seconds")
    assert time.perf_counter() - start < 0.05


def test_ticks_are_sixtieths_of_a_second(core: SpellCore) -> None:
    assert core.TIME_UNITS_MAP["ticks"] == pytest.approx(1000 / 60)


def test_an_async_pause_waits_unless_pauses_are_off(core: SpellCore) -> None:
    start = time.perf_counter()
    asyncio.run(core.sleep(30, "msec"))
    assert time.perf_counter() - start >= 0.025
    core.pauses = False
    start = time.perf_counter()
    asyncio.run(core.sleep(10, "seconds"))
    assert time.perf_counter() - start < 0.05


def test_an_async_handler_runs_to_its_end_outside_a_loop(core: SpellCore) -> None:
    heard = []

    @core.on("ping")
    async def on_ping() -> None:
        await core.sleep(1, "msec")
        heard.append("ping")

    core.trigger("ping")
    assert heard == ["ping"]


def test_an_async_handler_is_a_task_inside_the_loop(core: SpellCore) -> None:
    heard = []

    @core.on("ping")
    async def on_ping() -> None:
        heard.append("ping")

    async def program() -> None:
        core.trigger("ping")
        await asyncio.sleep(0)

    asyncio.run(program())
    assert heard == ["ping"]
