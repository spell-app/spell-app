"""Drawing, for now:  `h()` writes HTML text, so a compiled `to draw a card` runs and gives something sensible.

```python
h("div", {"class": "Card queen spades", "onClick": on_click}, "Q ", h("span", {"class": "suit"}, "♠️"))
# '<div class="Card queen spades">Q <span class="suit">♠️</span></div>'
```

- A stand-in:  plan doc python-target P12 does drawing properly.
- The JavaScript core's `h()` is Solid's, building elements on a page;  Python has no page, so this writes text.
"""

import html
from collections.abc import Iterable, Mapping

from spell_core.js_text import js_string

# Elements HTML never closes:  `<br>`, not `<br></br>`.
VOID_ELEMENTS = frozenset(
    ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]
)


class Html(str):
    """Text that's HTML already:  what `h()` gives, so an `h()` inside another isn't escaped twice."""

    __slots__ = ()


def h(tag: str, props: Mapping[str, object] | None = None, *children: object) -> Html:
    """The HTML for element `tag`, with attributes `props` and `children` inside it.

    - `props`:  each an attribute, `"class"` first.
      - An event handler (a function, under `"onClick"` ...) is left out:  text can't run it.
      - Any other function is called for its value:  `{"class": lambda: class_name}`.
      - `True` is the attribute alone (`disabled`);  `False` and `None` leave it out.
    - `children`:  text (escaped), numbers, another `h()`, lists of them;  functions are called for theirs.
      `None`, `True` and `False` show nothing.
    """
    attributes = "".join(_attribute(name, value) for name, value in _class_first(props or {}))
    if tag in VOID_ELEMENTS:
        return Html(f"<{tag}{attributes}>")
    inside = "".join(_child_html(child) for child in children)
    return Html(f"<{tag}{attributes}>{inside}</{tag}>")


def _class_first(props: Mapping[str, object]) -> list[tuple[str, object]]:
    """`props`' items, `"class"` (or `"className"`) first, the rest in order."""
    return sorted(props.items(), key=lambda item: item[0] not in ("class", "className"))


def _attribute(name: str, value: object) -> str:
    """` name="value"` for one attribute, or `""` for one left out (see `h()`)."""
    if callable(value):
        if name.startswith("on"):
            return ""
        value = value()
    if value is None or value is False:
        return ""
    name = "class" if name == "className" else name
    if value is True:
        return f" {name}"
    return f' {name}="{html.escape(js_string(value))}"'


def _child_html(child: object) -> str:
    """One child's HTML:  see `h()`."""
    if callable(child):
        child = child()
    if child is None or isinstance(child, bool):
        return ""
    if isinstance(child, Html):
        return child
    if isinstance(child, Iterable) and not isinstance(child, str):
        return "".join(_child_html(item) for item in child)
    return html.escape(js_string(child), quote=False)
