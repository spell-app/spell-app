"""spell_quart:  a Python spell program served as a web app, on Quart (epic python-target P20).

- A program compiled to `py/asyncio` runs on the server, a game per visitor (`SpellSessions`).
- Its page draws it in javascript, with its drawing half, `<Project>.elements.js`, from the state sent down a
  WebSocket;  clicks go back up it (`page_html()`).
- Compiling to `py/asyncio` writes the app itself beside the program, `<Project>.app.py`:  its routes, spelled out.
"""

from spell_quart.page import ASSETS_URL, assets_folder, page_html
from spell_quart.sessions import VISITOR_COOKIE, SpellSessions, Visit, remember_visitor, visitor_of

__all__ = [
    "ASSETS_URL",
    "VISITOR_COOKIE",
    "SpellSessions",
    "Visit",
    "assets_folder",
    "page_html",
    "remember_visitor",
    "visitor_of",
]
