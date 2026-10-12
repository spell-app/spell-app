"""A program's side of its page (`page.py`):  the state it starts from, each message run, answered by a patch."""

from collections.abc import Iterator
from pathlib import Path

import pytest

from spell_core import core
from spell_core.page import PageSession, python_name
from spell_core.run import run_program

PROGRAM = """\
from spell_core import List, Thing, core, prop


class Lamp(Thing):
    is_on = prop(type="choice", default=False)

    def switch(self, on):
        self.is_on = on


class Room(List):
    item_type = Lamp


room = Room([Lamp(), Lamp()])
clicks = []


def switch_all_on():
    for lamp in room:
        lamp.switch(True)


@core.on("lamp-click")
def on_lamp_click(event):
    clicks.append(event.lamp)
    event.lamp.switch(not event.lamp.is_on)
"""


@pytest.fixture
def session(tmp_path: Path) -> Iterator[PageSession]:
    """A session with the program above, run;  its handler taken off the shared core after."""
    program = tmp_path / "Room.compiled.py"
    program.write_text(PROGRAM)
    try:
        yield PageSession(run_program(program, seed=1))
    finally:
        core.off("lamp-click")
        # the shared core, as every other test expects it:  seeded with 1
        core.seed_random(1)


def test_the_state_is_the_programs_things_by_id(session: PageSession) -> None:
    assert session.state() == {
        "room": {
            "@type": "Room",
            "@id": "1",
            "@items": [
                {"@type": "Lamp", "@id": "2"},
                {"@type": "Lamp", "@id": "3"},
            ],
        }
    }


def test_a_call_of_a_function_answers_what_it_changed(session: PageSession) -> None:
    session.state()
    assert session.handle({"call": "switch_all_on", "args": []}) == [
        {"@type": "Lamp", "@id": "2", "is_on": True},
        {"@type": "Lamp", "@id": "3", "is_on": True},
    ]


def test_a_call_of_a_things_method(session: PageSession) -> None:
    session.state()
    assert session.handle({"call": "switch", "on": {"@id": "3"}, "args": [True]}) == [
        {"@type": "Lamp", "@id": "3", "is_on": True}
    ]


def test_an_event_reaches_the_programs_handlers_its_things_by_id(session: PageSession) -> None:
    session.state()
    patch = session.handle({"trigger": "lamp-click", "details": {"lamp": {"@id": "2"}}})
    assert patch == [{"@type": "Lamp", "@id": "2", "is_on": True}]
    assert session.names["clicks"] == [session.writer.thing_with_id("2")]


def test_what_isnt_there_throws(session: PageSession) -> None:
    session.state()
    with pytest.raises(ValueError, match="no function 'switch_off'"):
        session.handle({"call": "switch_off", "args": []})
    with pytest.raises(ValueError, match="doesn't have"):
        session.handle({"call": "switch", "on": {"@id": "99"}, "args": [True]})
    with pytest.raises(ValueError, match="a call or an event"):
        session.handle({"wave": True})


def test_javascripts_names_read_as_pythons() -> None:
    assert python_name("startPile") == "start_pile"
    assert python_name("card") == "card"
    assert python_name("isAFaceCard") == "is_a_face_card"
