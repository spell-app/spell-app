"""Property rules (epic `property-editor` P9):  what a value must be, beyond its type -- `prop_rules.py`."""

from spell_core import Thing, core, prop
from spell_core.prop_rules import broken_rule, rule_text

EMPTY = {"type": "empty"}
DIGITS = {"type": "regExp", "value": "/^\\d+$/", "prompt": "Digits only"}


def test_each_rule_word_keeps_and_breaks():
    assert broken_rule("", [EMPTY]) == EMPTY
    assert broken_rule("x", [EMPTY]) is None
    assert broken_rule("12a", [DIGITS]) == DIGITS
    assert broken_rule("12", [DIGITS]) is None
    assert broken_rule("ab", [{"type": "minLength", "value": "3"}]) is not None
    assert broken_rule("abcd", [{"type": "maxLength", "value": "3"}]) is not None
    assert broken_rule(6, [{"type": "range", "value": "1..5"}]) is not None
    assert broken_rule(5, [{"type": "range", "value": "1..5"}]) is None
    assert broken_rule(17, [{"type": "minValue", "value": "18"}]) is not None
    assert broken_rule("me@example.com", [{"type": "email"}]) is None
    assert broken_rule("me", [{"type": "email"}]) is not None
    assert broken_rule("https://spell.example", [{"type": "url"}]) is None


def test_an_empty_value_breaks_only_empty():
    assert broken_rule("", [{"type": "minLength", "value": "3"}, DIGITS]) is None


def test_the_rule_in_words():
    assert rule_text(EMPTY) == "must not be empty"
    assert rule_text({"type": "range", "value": "1..5"}) == "must be between 1 and 5"
    assert rule_text(DIGITS) == "Digits only"


class Card(Thing):
    title = prop(type="text", rules=[EMPTY])


Card.declare_rules("title", [DIGITS])


def test_a_value_breaking_a_rule_warns_and_is_set(capsys):
    card = Card()
    card.title = "seven"
    assert card.title == "seven"
    assert capsys.readouterr().err == "title:  Digits only, got: seven\n"
    assert core.check_prop("title", "7", Card.title)
