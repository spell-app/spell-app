"""Drawing as HTML text:  `h()`, written as the JavaScript run's page writes it;  drawing things, apps, `--page`.

- The `LINKEDOM` strings are what the JavaScript run printed for the same drawings:
  Solid's `h()` on linkedom, attributes sorted (`runProject.ts`, `withSortedAttributes()`).
  The core contract compares them line for line.
"""

from collections.abc import Iterator
from pathlib import Path

import pytest

from spell_core import App, Core, Drawable, DrawableList, List, Thing, core, h, prop
from spell_core.drawing import Element
from spell_core.run import main

# What the JavaScript run printed for each drawing in `test_written_as_linkedom_writes_it()`, by its name
LINKEDOM = {
    "attributes": (
        '<p alpha="" beta="2.5" data-="3" data-a="1" data="2" hidden title="say &quot;hi&quot; & <b>" zed="0"></p>'
    ),
    "text": (
        "<b>a &amp; &lt;b&gt; &#160; \"q\" 'q'"
        "31e+210.30000000000000004falsetrue0.33333333333333332.5e-7NaNInfinity0</b>"
    ),
    "classes": '<div class="lead tab nl trail a"><i></i><i></i></div>',
    "void and svg": '<div><br><img src="x"><hr>kid</hr><svg/><svg><g><circle r="1"/></g></svg></div>',
    "raw text": "<div><style>a > b & c</style><script>a < b</script><textarea>x & y</textarea><title><t></title></div>",
    "no props": "<thead><tr>t</tr>deeper7thunk</thead>",
    "a child for props": "<b>5</b>",
    "empty": "<td></td>",
    "live props": '<custom-el class="live"></custom-el>',
}


def drawings() -> dict[str, Element]:
    """The drawings `LINKEDOM` pins, as compiled Python would make them."""
    return {
        "attributes": h(
            "p",
            {
                "title": 'say "hi" & <b>',
                "hidden": True,
                "data-x": None,
                "disabled": False,
                "onClick": lambda event: None,
                "zed": 0,
                "alpha": True,
                "data-": "3",
                "data-a": "1",
                "data": "2",
                "beta": 2.5,
            },
        ),
        "text": h(
            "b",
            None,
            "a & <b> \u00a0 \"q\" 'q'",
            3,
            1e21,
            0.1 + 0.2,
            None,
            False,
            True,
            1 / 3,
            2.5e-7,
            float("nan"),
            float("inf"),
            -0.0,
        ),
        "classes": h(
            "div", {"class": " lead\ttab\nnl  trail a a "}, h("i", {"class": ""}), h("i", {"id": "", "style": ""})
        ),
        "void and svg": h(
            "div",
            None,
            h("br"),
            h("img", {"src": "x"}),
            h("hr", None, "kid"),
            h("svg"),
            h("svg", None, h("g", None, h("circle", {"r": 1}))),
        ),
        "raw text": h(
            "div",
            None,
            h("style", None, "a > b & c"),
            h("script", None, "a < b"),
            h("textarea", None, "x & y"),
            h("title", None, "<t>"),
        ),
        "no props": h("thead", h("tr", "t"), [["deep", ["er"]], 7], lambda: "thunk"),
        "a child for props": h("b", 5),
        "empty": h("td"),
        "live props": h("custom-el", {"prop:thing": {"a": 1}, "class": lambda: "live"}),
    }


@pytest.mark.parametrize("name", LINKEDOM)
def test_written_as_linkedom_writes_it(name: str) -> None:
    assert str(drawings()[name]) == LINKEDOM[name]


def test_h_leaves_handlers_out_and_never_calls_them() -> None:
    clicked: list[int] = []
    drawn = h("div", {"onClick": lambda event: clicked.append(1), "class": "Card queen"}, "Q ", h("span", {}, "♠️"))
    assert str(drawn) == '<div class="Card queen">Q <span>♠️</span></div>'
    assert drawn.attributes == {"class": "Card queen"}
    assert clicked == []


def test_an_element_finds_by_id_and_says_what_it_is() -> None:
    board = h("div", {"class": "board"}, h("table", None, h("td", {"id": "stock"})))
    assert board.find("stock") is board.children[0].children[0]  # type: ignore[union-attr]
    assert board.find("nowhere") is None
    assert repr(board) == '<Element <div class="board">>'


class Card(Thing):
    rank = prop()

    def draw(self) -> Element:
        return h("div", {"class": "card"}, self.rank)


class Pile(List):
    item_type = Card

    def draw(self) -> Element:
        return h("div", {"class": "pile"}, core.draw_items(self))


class Broken(Thing):
    def draw(self) -> Element:
        raise ValueError("no rank")


def test_draw_thing_draws_what_can_draw_and_nothing_else(core: Core) -> None:
    assert str(core.draw_thing(Card(rank="ace"))) == '<div class="card">ace</div>'
    assert core.draw_thing(None) is None
    assert core.draw_thing("text") is None
    assert core.draw_thing(Thing()) is None


def test_draw_items_draws_each_item_of_a_spell_list(core: Core) -> None:
    pile = Pile([Card(rank="ace"), None, Card(rank=2)])
    assert str(core.draw_thing(pile)) == '<div class="pile"><div class="card">ace</div><div class="card">2</div></div>'
    assert core.draw_items(Pile()) == []
    assert core.draw_items([Card(rank="ace")]) is None
    assert core.draw_items(None) is None


def test_a_draw_that_fails_shows_a_stand_in(core: Core, capsys: pytest.CaptureFixture[str]) -> None:
    drawn = h("td", None, core.draw_thing(Broken()), core.draw_thing(Card(rank="ace")))
    assert str(drawn) == (
        '<td><span class="spell-draw-error" role="alert" title="no rank">⚠ Broken can\'t draw</span>'
        '<div class="card">ace</div></td>'
    )
    assert capsys.readouterr().err == "Broken:  draw() failed ValueError('no rank')\n"


def test_drawable_things_draw_as_any_thing_and_a_drawable_list_as_its_slot(core: Core) -> None:
    class Token(Drawable):
        def draw(self) -> Element:
            return h("i", {"class": "token"})

    assert str(core.draw_thing(Token())) == '<i class="token"></i>'
    assert str(core.draw_thing(DrawableList([Token()]))) == "<slot></slot>"


def test_install_styles_keeps_the_css_and_draws_nothing(core: Core) -> None:
    core.install_styles(None, ".card {¬  color: red;¬}")
    assert core.page.styles == {"anonymous-css": ".card {\n  color: red;\n}"}
    assert core.page.body_html() == ""


class Game(App):
    score = prop(type="number")

    def draw(self) -> Element:
        return h("div", {"class": "game"}, f"Score: {self.score}")


@pytest.fixture
def page() -> Iterator[None]:
    """The program's `core`, on a new page:  an app starts on it.  Its page is new again afterwards."""
    core.reset_page()
    yield
    core.reset_page()


@pytest.mark.usefixtures("page")
def test_an_app_is_drawn_when_the_page_is_written_as_it_is_then() -> None:
    game = Game(score=0)
    game.start()
    game.score = 10
    assert core.page.body_html() == '<div id="spell-app-root"><div class="game">Score: 10</div></div>'
    assert core.app_element() is core.page.body.children[0]


@pytest.mark.usefixtures("page")
def test_an_app_started_again_replaces_the_one_drawn_there() -> None:
    Game(score=1).start()
    Game(score=2).start()
    assert core.page.body_html() == '<div id="spell-app-root"><div class="game">Score: 2</div></div>'


@pytest.mark.usefixtures("page")
def test_an_app_mounts_into_the_hosts_root_and_unmounts() -> None:
    root = Element("main")
    core.app_root = root
    try:
        Game(score=3).start()
        assert core.page.body_html() == ""
        assert str(root) == '<main><div class="game">Score: 3</div></main>'
        core.mount_app(Game(score=4), root).unmount()
        assert str(root) == "<main></main>"
    finally:
        core.app_root = None


@pytest.mark.usefixtures("page")
def test_page_prints_what_the_program_drew_when_it_ends(tmp_path: Path, capsys: pytest.CaptureFixture[str]) -> None:
    program = tmp_path / "Game.spell.py"
    program.write_text(
        "from spell_core import App, h\n"
        "class Game(App):\n"
        "    def draw(self):\n"
        "        return h('p', {'class': 'game'}, self.status)\n"
        "game = Game()\n"
        "game.status = 'dealing'\n"
        "game.start()\n"
        "print('dealt')\n"
        "game.status = 'dealt'\n"
    )
    main([str(program), "--page"])
    assert capsys.readouterr().out == 'dealt\n\n<div id="spell-app-root"><p class="game">dealt</p></div>\n'


@pytest.mark.usefixtures("page")
def test_page_prints_nothing_for_a_program_that_drew_nothing(
    tmp_path: Path, capsys: pytest.CaptureFixture[str]
) -> None:
    program = tmp_path / "FizzBuzz.spell.py"
    program.write_text("print('fizz')\n")
    main([str(program), "--page"])
    assert capsys.readouterr().out == "fizz\n"
