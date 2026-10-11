"""Apps and drawable things:  what `a game is an app`, `a card is a drawable thing` compile to.

```python
from spell_core import App, h

class Game(App):
    def draw(self):
        return h("div", {"class": "ui container"}, ...)

game = Game()
game.start()   # drawn on the page:  `core.page.body_html()` writes it
```

- The twins of the JavaScript core's `App`, `Drawable` and `DrawableList` (`classes/`).
"""

from spell_core.drawing import Element, h
from spell_core.lists import List
from spell_core.things import Thing, program_core


class App(Thing):
    """A thing that draws a whole application:  what `a game is an app` compiles to, `class Game(App)`.

    - Its `draw()` is compiled from `to draw (a game)`;  `start()` from `start the game`.
    """

    def start(self) -> None:
        """SIDE EFFECT:  mount our drawing on the page, into `core.app_element()` (see `core.mount_app()`).

        - Makes the page's `<div id="spell-app-root">` the first time, when the host set no `core.app_root`.
        - Starting again replaces the app drawn there.
        - We're drawn when the page is written, not now:  as we are then.
        """
        core = program_core()
        element = core.app_element()
        if element is None:
            element = Element("div", {"id": core.REACT_APP_ROOT_ID})
            core.page.body.append(element)
        core.mount_app(self, element)


class Drawable(Thing):
    """A thing drawn as its own element in a browser (`<solitaire-card>`):  what `a card is a drawable thing` extends.

    - Python's page defines no elements:  it draws as any thing does, its own `draw()`.
    """


class DrawableList(List):
    """A list drawn as its own element in a browser, its items inside:  `a pile is a drawable list of cards`.

    - Python's page defines no elements:  it draws as any thing does, its own `draw()`.
      That's just a `<slot>` by default, as in the JavaScript run:  its items show inside its element, which only
      a browser has.
    """

    def draw(self) -> Element:
        """Our outside, with a `<slot>` where our items show:  just the slot, by default."""
        return h("slot")
