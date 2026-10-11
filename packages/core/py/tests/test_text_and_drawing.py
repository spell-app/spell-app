"""Text (`upper_case()`, `lower_case()`) and the stand-in `h()`, which writes HTML text until P12 draws properly."""

from spell_core import SpellCore, h


def test_upper_and_lower_case_nothing_is_empty(core: SpellCore) -> None:
    assert core.upper_case(core.get_item_at("queen", 1)) == "Q"
    assert core.upper_case(None) == ""
    assert core.upper_case(True) == "TRUE"
    assert core.lower_case(3.0) == "3"
    assert core.lower_case("ACE") == "ace"


def test_h_writes_html_class_first_handlers_left_out() -> None:
    clicked: list[int] = []
    suit = h("span", {"class": "suit"}, "♠️")
    html = h("div", {"onClick": lambda: clicked.append(1), "class": "Card queen"}, "Q ", suit)
    assert html == '<div class="Card queen">Q <span class="suit">♠️</span></div>'
    assert clicked == []


def test_h_escapes_text_calls_other_functions_and_skips_nothing() -> None:
    assert h("p", {"title": 'say "hi"', "hidden": True, "data-x": None}, "<b>", None, False, 3.0) == (
        '<p title="say &quot;hi&quot;" hidden>&lt;b&gt;3</p>'
    )
    assert h("i", {"className": lambda: "icon"}, lambda: "x", ["a", "b"]) == '<i class="icon">xab</i>'
    assert h("br") == "<br>"
