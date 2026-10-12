"""Drawing as HTML text:  `h()` builds elements, written out as HTML.

```python
h("div", {"class": "Card queen spades", "onClick": on_click}, "Q ", h("span", {"class": "suit"}, "♠️"))
# <div class="Card queen spades">Q <span class="suit">♠️</span></div>, as str() writes it
```

- The JavaScript core's `h()` is Solid's, building elements on a page.
  Python has no page:  `h()` builds an `Element`, and `str()` writes it as HTML text.
- Written EXACTLY as the JavaScript run's fake page writes the same drawing,
  so the core contract compares the two line for line:
  - that page is linkedom's (a DOM that runs in node, with no browser),
    and the run sorts each tag's attributes (`withSortedAttributes()`, `runProject.ts`)
  - `tests/test_drawing.py` pins what linkedom wrote for a handful of tricky drawings
- `Page` is that fake page's `<body>`:  what an app is drawn into (`core.page`, `App.start()`).
- Epic python-target, P12, decision Q2.
"""

import re
from collections.abc import Iterable, Mapping

from spell_core.js_text import js_string

# Elements HTML never closes:  `<br>`, not `<br></br>`.  linkedom's list.
VOID_ELEMENTS = frozenset({
    "area", "base", "br", "col", "embed", "hr", "img", "input", "keygen", "link", "menuitem", "meta", "param",
    "source", "track", "wbr",
})  # fmt: skip
# Elements whose text is written as it is, never escaped:  `<style>a > b</style>`.  linkedom's `TextElement`s.
RAW_TEXT_ELEMENTS = frozenset(["script", "style", "textarea", "title"])
# Attributes linkedom writes bare when empty:  `hidden`, not `hidden=""`.
# - Except `id`, `class` and `style`:  empty, they're left out altogether.
EMPTY_ATTRIBUTES = frozenset({
    "allowfullscreen", "allowpaymentrequest", "async", "autofocus", "autoplay", "checked", "class",
    "contenteditable", "controls", "default", "defer", "disabled", "draggable", "formnovalidate", "hidden", "id",
    "ismap", "itemscope", "loop", "multiple", "muted", "nomodule", "novalidate", "open", "playsinline", "readonly",
    "required", "reversed", "selected", "style", "truespeed",
})  # fmt: skip
# Attributes left out when empty:  linkedom doesn't write them.
LEFT_OUT_WHEN_EMPTY = frozenset(["id", "class", "style"])
# Props Solid sets on the element itself, never as attributes:  so the page never shows them.
ELEMENT_PROPERTIES = frozenset(["innerHTML", "textContent", "innerText", "children", "ref"])
# What splits a class into its names:  JavaScript's `\s`.
CLASS_SPACE = re.compile(r"[\t\n\v\f\r \u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+")
# Text characters written as entities:  linkedom's.
TEXT_ENTITIES = {"&": "&amp;", "<": "&lt;", ">": "&gt;", "\u00a0": "&#160;"}
TEXT_ESCAPED = re.compile("[&<>\u00a0]")


class Element:
    """One element of a drawing:  its `tag`, its `attributes` as the page holds them, and its `children`.

    - Made by `h()`, which works out what the page would hold:  `str()` writes it as HTML, as linkedom does.
    - `children`:  elements and text, in order.
      - A function among them is a LIVE drawing:  called each time the element is written,
        for what to show then (an app, see `core.mount_app()`).
    """

    __slots__ = ("attributes", "children", "tag")

    def __init__(
        self, tag: str, attributes: dict[str, str] | None = None, children: list[object] | None = None
    ) -> None:
        """An element `<tag>`, with `attributes` (each text, `""` for one with no value) and `children`."""
        self.tag = tag
        self.attributes: dict[str, str] = attributes or {}
        self.children: list[object] = children or []

    def append(self, *children: object) -> "Element":
        """SIDE EFFECT:  add `children` at the end, as `h()` takes them.  Returns the element."""
        self.children.extend(drawn_children(children))
        return self

    def find(self, id: str) -> "Element | None":
        """The element with this `id` here or anywhere inside, as `document.getElementById()` finds it.

        - Live drawings aren't looked inside:  they're drawn only when written.
        """
        if self.attributes.get("id") == id:
            return self
        for child in self.children:
            if isinstance(child, Element) and (found := child.find(id)):
                return found
        return None

    @property
    def inner_html(self) -> str:
        """The HTML of what's inside us:  `<body>`'s is the page the core contract compares."""
        return "".join(child_html(child) for child in self.children)

    def __str__(self) -> str:
        """Our HTML, as linkedom writes it with each tag's attributes sorted:  see `element_html()`."""
        return element_html(self)

    def __repr__(self) -> str:
        """`<Element <div class="board">>`:  our tag, for a reader in a debugger."""
        return f"<Element {start_tag(self)}>"


def h(tag: str, props: Mapping[str, object] | object = None, *children: object) -> Element:
    """Element `tag`, with attributes from `props` and `children` inside it:  what compiled `to draw` returns.

    ```python
    h("th", {"class": "left aligned", "colspan": "2"}, "Klondike Solitaire")
    h("thead", h("tr", ...))   # no props:  the second argument is the first child
    ```

    - `props`:  a dict, or `None`;  anything else is the first child.  Each prop is an attribute, except:
      - an event handler (`"onClick"`, any `on...`) or a Solid property (`"prop:thing"`, `"ref"` ...):
        left out, as the page shows no handler
      - a function is called for its value:  `{"class": lambda: class_name}`
      - `True` is the attribute with no value (`hidden`);  `False` and `None` leave it out
      - a number is written as JavaScript writes it:  `3.0` is `3`
      - `"class"`:  its names split on spaces and written once each, single-spaced, as the page keeps them
    - `children`:  elements, text, numbers (as JavaScript writes them), lists of them, all in order:
      - a function is called for its value
      - `None` shows nothing;  `True` and `False` show `true` and `false`, as Solid's `h()` does
    """
    if props is not None and not isinstance(props, Mapping):
        children = (props, *children)
        props = None
    attributes = {}
    for name, value in (props or {}).items():
        written = attribute_value(name, value)
        if written is not None:
            attributes[name] = written
    return Element(tag, attributes, drawn_children(children))


def attribute_value(name: str, value: object) -> str | None:
    """What prop `name` set to `value` puts on the page:  its attribute's text, or `None` for none -- see `h()`."""
    if (name.startswith("on") and ":" not in name) or name.startswith("prop:") or name in ELEMENT_PROPERTIES:
        return None
    if callable(value):
        value = value()
    if value is None or value is False:
        return None
    if value is True:
        return ""
    text = js_string(value)
    if name == "class":
        return " ".join(dict.fromkeys(name for name in CLASS_SPACE.split(text) if name))
    return text


def drawn_children(children: Iterable[object]) -> list[object]:
    """`children` as an element holds them:  elements and text, lists opened up, functions called -- see `h()`."""
    drawn: list[object] = []
    for child in children:
        if callable(child):
            child = child()
        if child is None:
            continue
        if isinstance(child, Element | str):
            drawn.append(child)
        elif isinstance(child, Iterable) and not isinstance(child, Mapping):
            drawn.extend(drawn_children(child))
        else:
            drawn.append(js_string(child))
    return drawn


################
# ## Writing HTML
################


def element_html(element: Element, in_svg: bool = False) -> str:
    """`element`'s HTML, as linkedom writes it, each tag's attributes sorted (as the JavaScript run sorts them).

    - A void element with nothing inside is its start tag alone:  `<br>`.
    - An SVG element with nothing inside closes itself:  `<path d="M0"/>`.
    - Inside `<style>`, `<script>`, `<textarea>` and `<title>`, text is written as it is.
    """
    in_svg = in_svg or element.tag == "svg"
    start = start_tag(element)
    if not element.children:
        if in_svg:
            return start[:-1] + "/>"
        if element.tag in VOID_ELEMENTS:
            return start
    if element.tag in RAW_TEXT_ELEMENTS:
        return f"{start}{text_content(element)}</{element.tag}>"
    inside = "".join(child_html(child, in_svg) for child in element.children)
    return f"{start}{inside}</{element.tag}>"


def start_tag(element: Element) -> str:
    """`<tag a="1" b>`:  `element`'s start tag, its attributes sorted as written (`withSortedAttributes()`)."""
    attributes = sorted(text for name, value in element.attributes.items() if (text := attribute_html(name, value)))
    return f"<{element.tag}{''.join(' ' + attribute for attribute in attributes)}>"


def attribute_html(name: str, value: str) -> str:
    """`name="value"`, as linkedom writes an attribute:  `""` for one it leaves out, `name` alone for a bare one.

    - Only `"` is escaped, as `&quot;`:  linkedom writes `&`, `<` and `>` as they are in an HTML page.
    """
    if not value and name in EMPTY_ATTRIBUTES:
        return "" if name in LEFT_OUT_WHEN_EMPTY else name
    escaped = value.replace('"', "&quot;")
    return f'{name}="{escaped}"'


def child_html(child: object, in_svg: bool = False) -> str:
    """One child's HTML:  an element's, escaped text, or a live drawing's, drawn now."""
    if isinstance(child, Element):
        return element_html(child, in_svg)
    if isinstance(child, str):
        return TEXT_ESCAPED.sub(lambda match: TEXT_ENTITIES[match[0]], child)
    if callable(child):
        return "".join(child_html(drawn, in_svg) for drawn in drawn_children([child]))
    return ""


def text_content(node: object) -> str:
    """All the text in `node` and inside it, unescaped, as the DOM's `textContent` reads it."""
    if isinstance(node, Element):
        return "".join(text_content(child) for child in node.children)
    if isinstance(node, str):
        return node
    if callable(node):
        return "".join(text_content(child) for child in drawn_children([node]))
    return ""


################
# ## The page
################


class Page:
    """The page a program draws on:  its `body`, and the styles it installed.

    - What the JavaScript run's fake page is:  a `<body>` the app is drawn into (`App.start()`).
    - The core contract compares `body_html()`, printed when the program ends (`python -m spell_core.run --page`).
    """

    def __init__(self) -> None:
        """An empty page:  nothing drawn, no styles."""
        self.body = Element("body")
        # each project's CSS, by its name:  `core.install_styles()`
        # - kept, never written:  the contract compares only what's drawn
        self.styles: dict[str, str] = {}

    def body_html(self) -> str:
        """What's drawn on the page, as one line of HTML:  `<div id="spell-app-root">...</div>`.

        - Drawn NOW:  an app's drawing shows what its things are now,
          as the JavaScript run's live page shows them when it ends.
        """
        return self.body.inner_html
