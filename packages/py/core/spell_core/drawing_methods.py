"""`core`'s drawing:  drawing a thing or a list's items, mounting an app, and the page it's drawn on (P12).

```python
class Tableau(Pile):
    def draw(self):
        return h("div", {"class": "Pile Tableau staggered"}, core.draw_items(self))

h("td", core.draw_thing(stock))   # the stock's own draw(), or nothing for None
game.start()                      # the game is drawn on `core.page`, when the page is written
```

- The twins of the JavaScript core's:
  - `drawThing()`, `drawOwn()`, `drawItems()` and `mountApp()`, in `drawing.ts`
  - `installStyles()`, in `ui.ts`
  - `appElement()`, in `classes/index.ts`
- Python has no page to draw on:  `core.page` stands in for the JavaScript run's fake one.
  - An app mounted on it is drawn each time the page is WRITTEN, not when it starts:
    so it shows its things as they are then, as a live page would.
  - `python -m spell_core.run --page` writes it when the program ends:  what the core contract compares.
- A drawable thing is never its own element here (`<solitaire-card>`):  that's the browser's, which defines it.
  Every thing draws as its own drawing, as in the JavaScript run, which defines no elements either.
"""

from typing import TYPE_CHECKING

from spell_core.drawing import Element, Page, h

if TYPE_CHECKING:
    from spell_core.console import SpellConsole


class MountedApp:
    """An app mounted into an element, as `core.mount_app()` returns it:  `unmount()` takes it down again."""

    def __init__(self, element: Element) -> None:
        """The app drawn into `element`."""
        self.element = element

    def unmount(self) -> None:
        """SIDE EFFECT:  take the app's drawing down, emptying its element."""
        self.element.children.clear()


class DrawingMethods:
    """`core.draw_thing()`, `core.draw_items()`, `core.mount_app()`, `core.install_styles()`, and the page."""

    # DOM `id` of the element an app mounts into when the host set no `app_root`:  `<div id="spell-app-root">`
    REACT_APP_ROOT_ID = "spell-app-root"

    # where a drawing that fails says so:  `SpellCore` sets it
    console: "SpellConsole"

    # the page this core draws on:  `reset_page()` makes it
    page: Page

    # the element an app mounts into, if the host says;  else `#spell-app-root` on the page (`app_element()`)
    app_root: Element | None = None

    def reset_page(self) -> None:
        """SIDE EFFECT:  start a new, empty page:  nothing drawn, no styles."""
        self.page = Page()

    ################
    # ## Drawing things
    ################

    def draw_thing(self, drawable: object = None) -> object:
        """`drawable` drawn:  what its own `draw()` returns -- `None` if it can't draw (no `draw()`).

        - Compiled from `draw the card`, as `h("td", core.draw_thing(stock))`.
        - Takes anything, as it checks:  the last card of an empty pile is `None`, which draws nothing.
        """
        return self.draw_own(drawable)

    def draw_own(self, drawable: object = None) -> object:
        """`drawable`'s own drawing, in its own error boundary -- `None` if it can't draw.

        - A `draw()` that throws shows a stand-in instead, and says so on the console (`drawing_failed()`):
          the rest of the page still draws.
        """
        draw = getattr(drawable, "draw", None)
        if not callable(draw):
            return None
        try:
            return draw()
        except Exception as error:  # one thing that can't draw mustn't stop the page
            return self.drawing_failed(drawable, error)

    def draw_items(self, items: object = None) -> list[object] | None:
        """Each item of spell list `items`, drawn (`draw_thing()`) -- `None` if it isn't a spell list.

        - Compiled from `draw each card in the deck`, as `h("div", ..., core.draw_items(self))`.
        - An item that can't draw shows nothing.
        """
        from spell_core.lists import List

        if not isinstance(items, List):
            return None
        return [self.draw_thing(item) for item in items]

    def drawing_failed(self, thing: object, error: Exception) -> Element:
        """What a thing whose `draw()` threw shows:  a stand-in naming it, `⚠ Card can't draw`.

        - SIDE EFFECT:  one line on the program's console, on stderr.
        - The JavaScript core's also tells the page (a `ui-error` event):  Python's page has no events.
        """
        type_name = getattr(thing, "type", None) or type(thing).__name__
        self.console.error(f"{type_name}:  draw() failed", repr(error))
        return h(
            "span", {"class": "spell-draw-error", "title": str(error), "role": "alert"}, f"⚠ {type_name} can't draw"
        )

    ################
    # ## Mounting
    ################

    def app_element(self) -> Element | None:
        """The element an app mounts into:  `app_root`, else the page's `#spell-app-root` -- `None` if neither."""
        return self.app_root or self.page.body.find(self.REACT_APP_ROOT_ID)

    def mount_app(self, app: object, element: Element) -> MountedApp:
        """Draw `app` into `element`, replacing what was there:  what `App.start()` does, into `app_element()`.

        - The app is drawn each time the page is written (a LIVE drawing), not now:
          things change after `start the game`, and the page shows them as they are.
        """
        element.children[:] = [lambda: self.draw_thing(app)]
        return MountedApp(element)

    def install_styles(self, name: str | None = None, safe_css: str = "") -> None:
        """SIDE EFFECT:  keep a project's CSS on the page, under `name`:  compiled from its `.css` files.

        - `¬` in `safe_css` is a line break, as the compiled text writes one.
        - Kept, never written:  the core contract compares only what's drawn,
          as the JavaScript run's page adds no styles either.
        """
        self.page.styles[name or "anonymous-css"] = safe_css.replace("¬", "\n")
