"""
A drawn element tree printed with Rich:  a still picture of the board, no clicks.

Epic `python-target`, P15 · Terminal Drawing Study.
- Run it from `packages/py/core`:

      uv run --group study python experiments/terminal/rich_board.py

- How the page's elements become Rich's:
  - a `<table>`:  a Rich `Table`, its `<thead>` row the header
  - an element holding only text (`<div class="Card">Q <span>♠️</span></div>`):  one styled `Text`
  - anything else:  its children one under another (a `Group`)
  - a `stacked` pile:  only its last child, as the page's CSS lays the cards on top of each other
- The styles come from the element's classes (`STYLES`, below), as the page's come from `styles.css`.
"""

from __future__ import annotations

import io

from elements import Element
from rich import box
from rich.console import Console, Group, RenderableType
from rich.table import Table
from rich.text import Text

# Rich's style for an element by its classes:  the first row whose classes it ALL has wins
STYLES: list[tuple[tuple[str, ...], str]] = [
    (("Card", "face-down"), "white on blue"),
    (("Card", "red"), "bold red on grey93"),
    (("Card",), "bold black on grey93"),
    (("Placeholder",), "grey50 on grey15"),
    (("button",), "reverse"),
]

# What an icon draws as:  Fomantic's `<i class="bicycle icon">` is a picture the terminal doesn't have
ICON_TEXT = "░░░░"


def terminal_text(text: str) -> str:
    """
    Text as a terminal draws it:  emoji's "draw me as a picture" mark (U+FE0F) left out.
    - `♠️` is two characters:  `♠` and that mark.
    - With it, some terminals draw the suit two cells wide and some one, so columns slip.
    """
    return text.replace("️", "")


def style_of(node: Element) -> str:
    return next((style for classes, style in STYLES if node.has_class(*classes)), "")


def inline_text(node: Element | str) -> Text:
    """An element holding only text, as one `Text`, each span styled as its classes say."""
    if isinstance(node, str):
        return Text(terminal_text(node))
    if node.has_class("icon"):
        return Text(ICON_TEXT)
    text = Text(style=style_of(node))
    for child in node.children:
        text.append_text(inline_text(child))
    if node.has_class("Card") or node.has_class("button"):
        text = Text(" ", style=text.style) + text + Text(" ", style=text.style)
    return text


def to_rich(node: Element | str) -> RenderableType:
    """The tree as Rich renderables."""
    if isinstance(node, str):
        return Text(terminal_text(node))
    if node.tag == "table":
        return table(node)
    if node.has_class("stacked"):
        drawn = [child for child in node.children if isinstance(child, Element)]
        return to_rich(drawn[-1]) if drawn else Text("")
    if node.has_class("Placeholder") and not node.children:
        return Text(" " * 5, style=style_of(node))
    if (node.holds_only_text and node.children) or node.has_class("icon"):
        return inline_text(node)
    return Group(*(to_rich(child) for child in node.children))


def table(node: Element) -> Table:
    """
    A `<table>` as a Rich `Table`.
    - Rich has no `colspan`:  a cell spanning two columns is followed by an empty one.
    """
    rows = [row for row in node.walk() if row.tag == "tr"]
    head = [
        row
        for section in node.children
        if isinstance(section, Element) and section.tag == "thead"
        for row in section.walk()
        if row.tag == "tr"
    ]

    def cells(row: Element) -> list[RenderableType]:
        out: list[RenderableType] = []
        for cell in row.children:
            if isinstance(cell, Element):
                out.append(to_rich(cell))
                out.extend(Text("") for _ in range(int(cell.props.get("colspan", 1)) - 1))
        return out

    width = max(len(cells(row)) for row in rows)
    grid = Table(box=box.SIMPLE_HEAD, expand=True, show_header=bool(head), header_style="bold")
    header = cells(head[0]) if head else []
    for column in range(width):
        grid.add_column(header[column] if column < len(header) else "", ratio=1)
    for row in rows:
        if row not in head:
            grid.add_row(*cells(row))
    return grid


def render_text(root: Element, width: int = 100) -> str:
    """The tree drawn by Rich, as plain text:  for a test, or to read without a terminal."""
    console = Console(record=True, width=width, file=io.StringIO(), color_system="truecolor")
    console.print(to_rich(root))
    return console.export_text()


def save_svg(root: Element, path: str, width: int = 100) -> None:
    """The tree drawn by Rich, saved as an SVG picture of the terminal."""
    console = Console(record=True, width=width, file=io.StringIO(), color_system="truecolor")
    console.print(to_rich(root))
    console.save_svg(path, title="Solitaire, drawn by Rich")


if __name__ == "__main__":
    import sample_solitaire

    Console().print(to_rich(sample_solitaire.game.draw()))
