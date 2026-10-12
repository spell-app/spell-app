"""
A drawn element tree as a Textual app:  the board in the terminal, its cards clicked with the mouse.

Epic `python-target`, P15 · Terminal Drawing Study.
- Run it from `packages/py/core` (`q` quits):

      uv run --group study python experiments/terminal/textual_board.py

- In a browser instead, through `textual-serve` (not installed:  `uv run --group study --with textual-serve ...`):

      from textual_serve.server import Server
      Server("uv run --group study python experiments/terminal/textual_board.py").serve()

- How the page's elements become Textual's widgets (`build()`, below):
  - `<tr>`:  a row, its cells side by side
  - an element holding only text (`<div class="Card">Q <span>♠️</span></div>`):  one line of styled text
  - anything else (`<div>`, `<table>`, `<td>` ...):  a box, its children one under another
  - each keeps its classes, and gets its tag as one more (`el-td`),
    so the style sheet below (Textual's own CSS) picks them out
    as `styles.css` does the page's (`.Card.red`, `.Pile.stacked`)
- A click calls the element's `onClick`, as the page does:  a card's fires `card-click` with the card.
  - Then the whole board is drawn again, since this tree doesn't track what changed (Solid's does, on the page).
"""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from elements import Element
from rich.text import Text
from rich_board import ICON_TEXT, inline_text, terminal_text
from textual import events
from textual.app import App, ComposeResult
from textual.binding import Binding
from textual.containers import Horizontal, Vertical
from textual.message import Message
from textual.widget import Widget
from textual.widgets import Static

# Textual's CSS for the board, from the classes the page's `styles.css` and Fomantic's use
BOARD_CSS = """
Screen { background: #0b5d1e; }
.el-table, .el-thead, .el-tbody, .el-tr, .el-td, .el-th, .el-div { height: auto; }
.el-td, .el-th { width: 1fr; padding: 0 1; }
.el-thead { border-bottom: solid #8fbf9f; color: white; text-style: bold; }
.el-th.right { content-align: right middle; }
.el-tbody > .el-tr { margin-top: 1; }
.el-th .button { background: #d0d0d0; color: black; content-align: center middle; }
.el-th .button:hover { background: white; }

.Card { height: 1; width: 100%; background: #eeeeee; color: black; text-style: bold; padding: 0 1; }
.Card.red { color: #c00000; }
.Card.face-down { background: #1f4fbf; color: #8fb0ff; text-style: none; }
.Card:hover { background: #ffffbb; }
.Placeholder { height: 1; width: 100%; background: #0e4a1b; color: #7fbf8f; padding: 0 1; }
.Placeholder.red { color: #ff9090; }

/* the page lays a stacked pile's cards on top of each other (position: absolute):  docking does it here */
.Pile.stacked { height: 1; }
.Pile.stacked > * { dock: top; }
.Pile.Tableau { min-height: 1; }
"""


class Clicked(Message):
    """An element with an `onClick` was clicked:  sent to the app, which calls the handler and draws again."""

    def __init__(self, handler: Callable[[], Any]) -> None:
        """A click on the element whose `onClick` is `handler`."""
        super().__init__()
        self.handler = handler


class Node:
    """What every drawn element's widget shares:  its element's click handler."""

    handler: Callable[[], Any] | None = None

    def on_click(self, event: events.Click) -> None:
        """Textual's click:  tell the app to call our handler, if we have one, and stop the click there."""
        if self.handler is None:
            return
        event.stop()
        # to the app, not run here:  drawing again removes this widget, which can't wait for its own removal
        self.app.post_message(Clicked(self.handler))  # type: ignore[attr-defined]


class Box(Node, Vertical):
    """A block element:  its children one under another."""


class Row(Node, Horizontal):
    """A `<tr>`:  its cells side by side."""


class Line(Node, Static):
    """An element holding only text, as one line."""


def textual_class(name: str) -> str:
    """
    A page's class name as Textual takes it.
    - Textual's must not start with a digit, and a card's rank is one (`<div class="Card 8 clubs">`):  `_8`.
    - The page's CSS can't name it plainly either (`.\\38`), so no style sheet loses anything.
    """
    return f"_{name}" if name[:1].isdigit() else name


def build(node: Element | str) -> Widget:
    """The widget for a drawn element, and its children's under it."""
    if isinstance(node, str):
        return Line(Text(terminal_text(node)))
    classes = " ".join([f"el-{node.tag}", *map(textual_class, node.classes)])
    widget: Widget
    if node.has_class("icon"):
        widget = Line(ICON_TEXT, classes=classes)
    elif node.holds_only_text and node.children:
        content = Text()
        for child in node.children:
            content.append_text(inline_text(child))
        widget = Line(content, classes=classes)
    elif node.tag == "tr":
        widget = Row(*(build(child) for child in node.children), classes=classes)
    elif node.has_class("Placeholder") and not node.children:
        widget = Line(" ", classes=classes)
    else:
        widget = Box(*(build(child) for child in node.children), classes=classes)
    if "colspan" in node.props:
        widget.styles.width = f"{node.props['colspan']}fr"
    widget.handler = node.on_click  # type: ignore[attr-defined]
    widget.element = node  # type: ignore[attr-defined]
    return widget


class Board(Vertical):
    """Where the app's drawn tree goes:  drawn again after every click."""

    DEFAULT_CSS = "Board { height: auto; }"

    def __init__(self, draw: Callable[[], Element]) -> None:
        """A board drawn by `draw()`, the app's own."""
        super().__init__()
        self.draw = draw

    def compose(self) -> ComposeResult:
        """The widgets for the tree `draw()` makes now."""
        yield build(self.draw())


class SpellApp(App):
    """A spell app (`a game is an app`) in the terminal:  its `draw()`, and clicks back to its handlers."""

    CSS = BOARD_CSS
    BINDINGS = [Binding("q", "quit", "Quit")]  # noqa: RUF012 -- Textual's own way to declare them

    def __init__(self, draw: Callable[[], Element]) -> None:
        """An app showing what `draw()` makes:  `game.draw`, say."""
        super().__init__()
        self.draw = draw

    def compose(self) -> ComposeResult:
        """The board, its only widget."""
        yield Board(self.draw)

    async def on_clicked(self, message: Clicked) -> None:
        """Call a click's handler, then draw the board again."""
        message.handler()
        await self.query_one(Board).recompose()


def solitaire_app() -> SpellApp:
    """The sample Solitaire game (`sample_solitaire.py`), as a Textual app."""
    import sample_solitaire

    return SpellApp(lambda: sample_solitaire.game.draw())


if __name__ == "__main__":
    solitaire_app().run()
