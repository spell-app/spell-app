"""Text:  `upper_case()`, `lower_case()`.  Drawing's tests are in `test_drawing.py`."""

from spell_core import Core


def test_upper_and_lower_case_nothing_is_empty(core: Core) -> None:
    assert core.upper_case(core.get_item_at("queen", 0)) == "Q"
    assert core.upper_case(None) == ""
    assert core.upper_case(True) == "TRUE"
    assert core.lower_case(3.0) == "3"
    assert core.lower_case("ACE") == "ace"
