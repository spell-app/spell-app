"""
The element tree a spell program's `to draw` methods make, as a TREE rather than HTML text.

Epic `python-target`, P15 · Terminal Drawing Study:  a prototype, not part of spell_core.
- P12's `h()` (spell_core) turns each element into HTML text at once.
- This one keeps the element:  its tag, its props (`class`, `onClick` ...) and its children.
  - So one tree can be drawn three ways:  as HTML (`to_html()`, below), with Rich, or with Textual.
- The calls are the ones the Python writer makes (PyWriter's `ASTJSXElement()`):

      h("div", {"class": "Pile Tableau staggered"}, draw_items(self))
      h("thead", h("tr", ...))          # no props:  the children come straight after the tag

- `on()` / `trigger()` stand in for spell's events (`on card-click with a card`, `fire event card-click ...`),
  which spell_core doesn't have yet.
"""

from __future__ import annotations

from collections.abc import Callable, Iterable
from dataclasses import dataclass, field
from html import escape
from typing import Any

# What an element's children may be, once flattened:  another element, or text
Child = "Element | str"

# The tags that flow inside a line of text, as a browser draws them
INLINE_TAGS = frozenset({"span", "i", "b", "strong", "em", "small", "code", "a", "label"})


@dataclass
class Element:
    """One element of a drawn tree:  `<div class="Card">Q ♠️</div>`, before it's drawn anywhere."""

    tag: str
    props: dict[str, Any] = field(default_factory=dict)
    children: list[Element | str] = field(default_factory=list)

    @property
    def classes(self) -> list[str]:
        """The words of its `class` prop:  `["Card", "face-up", "queen", ...]`."""
        return str(self.props.get("class", "")).split()

    @property
    def on_click(self) -> Callable[[], Any] | None:
        """Its click handler, if it has one (`onClick`, as the page names it)."""
        return self.props.get("onClick")

    def has_class(self, *names: str) -> bool:
        """True if it has every one of `names` as a class."""
        return all(name in self.classes for name in names)

    def walk(self) -> Iterable[Element]:
        """It, then every element under it, depth first."""
        yield self
        for child in self.children:
            if isinstance(child, Element):
                yield from child.walk()

    @property
    def is_inline(self) -> bool:
        """True if it draws inside a line of text:  an inline tag holding only text and inline tags."""
        return self.tag in INLINE_TAGS and all(isinstance(c, str) or c.is_inline for c in self.children)

    @property
    def holds_only_text(self) -> bool:
        """True if everything under it flows as one line of text:  `<div>Q <span>♠️</span></div>`."""
        return all(isinstance(c, str) or c.is_inline for c in self.children)


def h(tag: str, props: Any = None, *children: Any) -> Element:
    """
    An element:  `h("span", {"class": "suit"}, "♠️")`.
    - `props` may be left out:  `h("tr", h("td", ...))`.
    - Children are flattened:  a list (from `draw_items()`) adds each item, and nothing (`None`, `False`) adds none.
    - A number is its text.
    """
    if props is not None and not isinstance(props, dict):
        children = (props, *children)
        props = None
    return Element(tag, dict(props or {}), list(_flatten(children)))


def _flatten(children: Iterable[Any]) -> Iterable[Element | str]:
    for child in children:
        if child is None or child is False or child is True:
            continue
        if isinstance(child, Element | str):
            yield child
        elif isinstance(child, int | float):
            yield str(child)
        elif isinstance(child, Iterable):
            yield from _flatten(child)
        else:
            yield str(child)


def draw_thing(thing: Any) -> Element | None:
    """A thing drawn by its own `draw()`, or nothing for nothing:  spell's `draw its bottom card`."""
    return thing.draw() if thing is not None else None


def draw_items(items: Iterable[Any]) -> list[Element]:
    """Every item of a list, drawn:  spell's `draw cards in it`."""
    return [item.draw() for item in items]


def to_html(node: Element | str) -> str:
    """The tree as HTML text, as P12's `h()` writes it:  handlers left out, since a page can't call them back."""
    if isinstance(node, str):
        return escape(node)
    attrs = "".join(
        f' {name}="{escape(str(value))}"' for name, value in node.props.items() if not name.startswith("on")
    )
    return f"<{node.tag}{attrs}>{''.join(to_html(child) for child in node.children)}</{node.tag}>"


#####
# Events:  a stand-in for spell's `on <event>` and `fire event <event>`
#####

_handlers: dict[str, list[Callable[..., Any]]] = {}


def on(name: str, handler: Callable[..., Any]) -> None:
    """Call `handler(**data)` whenever `name` fires:  spell's `on card-click with a card`."""
    _handlers.setdefault(name, []).append(handler)


def trigger(name: str, **data: Any) -> None:
    """Fire event `name` with its data:  spell's `fire event card-click with card = it`."""
    for handler in _handlers.get(name, []):
        handler(**data)


def clear_handlers() -> None:
    """Forget every handler:  for a fresh game in a test."""
    _handlers.clear()
