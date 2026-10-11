"""A game per visitor, a page per WebSocket:  what a spell app's `/ws` route serves.

```python
sessions = SpellSessions(HERE / "Solitaire.compiled.asyncio.py")

@app.websocket("/ws")
async def ws():
    await sessions.serve(websocket, visitor_of(websocket))
```

- A VISITOR is a browser, named by a cookie (`visitor_of()`, `remember_visitor()`).
  - Each plays their own game:  the program runs once for them, on a core of their own (`using_core()`).
  - Their tabs share it:  a click in one shows in every one.
  - Their game lives in this process's memory:  a restart ends it.
- Each page, a tab, gets the whole state when it opens, then a patch after each of its messages,
  and at each pause (`core.before_pause`):  so a game animates.
- A message that fails is logged, and the page goes on.
"""

import asyncio
import json
import logging
import os
import secrets
from collections.abc import Awaitable, Callable
from pathlib import Path
from typing import Any, Protocol

from spell_core.core import SpellCore, using_core
from spell_core.page import PageSession
from spell_core.run import run_program

# The cookie naming a visitor:  see `visitor_of()`.
VISITOR_COOKIE = "spell-visitor"

log = logging.getLogger("spell_quart")


class Socket(Protocol):
    """What `serve()` needs of a WebSocket:  Quart's `websocket`."""

    async def send(self, data: str) -> None: ...
    async def receive(self) -> str | bytes: ...


class Visit:
    """One visitor's game:  their core, the program's top level as it ran for them, and their pages."""

    def __init__(self, core: SpellCore, names: dict[str, Any]) -> None:
        """A visit to the program that ran on `core`, its top level `names`."""
        self.core = core
        self.names = names
        # each open page:  its session (its own ids), and how to send it something
        self.pages: list[tuple[PageSession, Callable[[str], Awaitable[None]]]] = []

    async def send_changes(self) -> None:
        """SIDE EFFECT:  send each page what changed since it was last sent anything, if anything did."""
        for page, send in list(self.pages):
            patch = page.writer.patch()
            if patch:
                await send(json.dumps(patch, ensure_ascii=False))


class SpellSessions:
    """The visitors of a program compiled to `py/asyncio`, each with their own game:  see the module's docs."""

    def __init__(self, program: str | Path, seed: int | None = None, pauses: bool = True) -> None:
        """The visitors of `program`.

        - `seed`:  where every visitor's random numbers start, so each is dealt the same game;  a test's.
          Left out:  `$SPELL_SEED`, if it's set;  else a different game each.
        - `pauses`:  do pauses wait?  Off in a test, where only what changes matters.
        """
        self.program = Path(program)
        named = os.environ.get("SPELL_SEED")
        self.seed = seed if seed is not None else int(named) if named else None
        self.pauses = pauses
        self.visits: dict[str, Visit] = {}

    async def visit(self, visitor: str) -> Visit:
        """`visitor`'s game:  the program, run for them the first time they come."""
        visit = self.visits.get(visitor)
        if visit is None:
            core = SpellCore()
            with using_core(core):
                # in a thread:  the program's top level may run `asyncio.run()`, which this loop can't
                names = await asyncio.to_thread(run_program, self.program, self.seed, self.pauses)
            visit = Visit(core, names)
            core.before_pause.append(visit.send_changes)
            self.visits[visitor] = visit
        return visit

    async def serve(self, socket: Socket, visitor: str) -> None:
        """Serve one page of `visitor`'s over `socket`, until it closes:  see the module's docs."""
        visit = await self.visit(visitor)
        with using_core(visit.core):
            page = PageSession(visit.names)

            async def send(data: str) -> None:
                await socket.send(data)

            await send(json.dumps(page.state(), ensure_ascii=False))
            visit.pages.append((page, send))
            try:
                while True:
                    message = json.loads(await socket.receive())
                    try:
                        await page.run_async(message)
                    except Exception:
                        log.exception("spell_quart:  the page's message %r failed", message)
                    await visit.send_changes()
            finally:
                visit.pages.remove((page, send))


def visitor_of(request: Any) -> str:
    """The visitor `request` (or `websocket`) comes from, by their cookie:  a new name if they have none."""
    return request.cookies.get(VISITOR_COOKIE) or secrets.token_urlsafe(16)


def remember_visitor(response: Any, visitor: str) -> Any:
    """SIDE EFFECT:  `response` sets the visitor's cookie, so their next request names them.  Returns `response`."""
    response.set_cookie(VISITOR_COOKIE, visitor, httponly=True, samesite="Lax")
    return response
