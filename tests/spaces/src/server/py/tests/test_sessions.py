"""A spell app on Quart:  its page, and its WebSocket, a game per visitor -- on Quart's own test client."""

import json
from pathlib import Path

import pytest
from quart import Quart, make_response, request, websocket

from spell_quart import SpellSessions, page_html, remember_visitor, visitor_of

PROGRAM = """\
from spell_core import List, Thing, core, prop


class Lamp(Thing):
    is_on = prop(type="choice", default=False)
    color = prop(type="text")


class Room(List):
    item_type = Lamp


room = Room([Lamp(), Lamp()])


@core.on("lamp-click")
async def on_lamp_click(event):
    event.lamp.is_on = True
    await core.pause_for(1, "msec")
    event.lamp.color = "red"
"""


@pytest.fixture
def app(tmp_path: Path) -> Quart:
    """A Quart app serving the program above, as a compiled program's `.app.py` does."""
    program = tmp_path / "Room.spell.py"
    program.write_text(PROGRAM)
    app = Quart(__name__)
    sessions = SpellSessions(program, seed=1)

    @app.get("/")
    async def page():
        response = await make_response(page_html("Room", elements="/Room.elements.spell.js"))
        return remember_visitor(response, visitor_of(request))

    @app.websocket("/ws")
    async def ws():
        await sessions.serve(websocket, visitor_of(websocket))

    return app


async def test_the_page_loads_the_core_and_the_programs_drawing_half(app: Quart) -> None:
    response = await app.test_client().get("/")
    text = await response.get_data(as_text=True)
    assert '"@spell/core": "/spell/spell-page.js"' in text
    assert 'import * as program from "/Room.elements.spell.js"' in text
    assert "spell-visitor=" in response.headers["Set-Cookie"]


async def test_the_socket_sends_the_state_then_what_each_click_changed_pauses_and_all(app: Quart) -> None:
    async with app.test_client().websocket("/ws", headers={"Cookie": "spell-visitor=ann"}) as socket:
        state = json.loads(await socket.receive())
        assert state["room"]["$items"] == [{"$type": "Lamp", "$id": "2"}, {"$type": "Lamp", "$id": "3"}]
        await socket.send(json.dumps({"trigger": "lamp-click", "details": {"lamp": {"$id": "3"}}}))
        # before the pause, then after it
        assert json.loads(await socket.receive()) == [{"$type": "Lamp", "$id": "3", "is_on": True}]
        assert json.loads(await socket.receive()) == [{"$type": "Lamp", "$id": "3", "is_on": True, "color": "red"}]


async def test_each_visitor_plays_their_own_game(app: Quart) -> None:
    client = app.test_client()
    async with client.websocket("/ws", headers={"Cookie": "spell-visitor=ann"}) as ann:
        await ann.receive()
        await ann.send(json.dumps({"trigger": "lamp-click", "details": {"lamp": {"$id": "2"}}}))
        await ann.receive()
        await ann.receive()
    async with client.websocket("/ws", headers={"Cookie": "spell-visitor=bob"}) as bob:
        state = json.loads(await bob.receive())
        assert state["room"]["$items"][0] == {"$type": "Lamp", "$id": "2"}
    async with client.websocket("/ws", headers={"Cookie": "spell-visitor=ann"}) as again:
        state = json.loads(await again.receive())
        assert state["room"]["$items"][0] == {"$type": "Lamp", "$id": "2", "is_on": True, "color": "red"}
