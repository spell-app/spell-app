"""Values written as JavaScript writes them:  each expected string here is what node 24 printed for the same value."""

import math

import pytest

from spell_core.js_text import format_line, inspect, js_length, js_number_text, js_string, quote, string_width


@pytest.mark.parametrize(
    ("number", "text"),
    [
        (3, "3"),
        (3.0, "3"),
        (-2.5, "-2.5"),
        (0.1 + 0.2, "0.30000000000000004"),
        (1e20, "100000000000000000000"),
        (1e21, "1e+21"),
        (10**21, "1e+21"),
        (0.000001, "0.000001"),
        (5e-7, "5e-7"),
        (1.23e-18, "1.23e-18"),
        (123456.789, "123456.789"),
        (2**53, "9007199254740992"),
        (-0.0, "-0"),
        (math.nan, "NaN"),
        (math.inf, "Infinity"),
        (-math.inf, "-Infinity"),
    ],
)
def test_numbers_are_written_as_javascript_writes_them(number: float, text: str) -> None:
    assert js_number_text(number) == text


@pytest.mark.parametrize(
    ("value", "text"),
    [
        (None, "undefined"),
        (True, "true"),
        (False, "false"),
        (3.0, "3"),
        (-0.0, "0"),
        ("queen", "queen"),
        ([1, [2, 3], None, True], "1,2,3,,true"),
        ({"rank": "queen"}, "[object Object]"),
    ],
)
def test_js_string_is_javascripts_string(value: object, text: str) -> None:
    assert js_string(value) == text


def test_text_is_printed_as_it_is_and_other_values_inspected() -> None:
    assert format_line(["deck:", [1, 2.5, True, None], "done"]) == "deck: [ 1, 2.5, true, undefined ] done"
    assert format_line(["queen", 3.0, True, False, None]) == "queen 3 true false undefined"
    assert format_line([]) == ""


def test_a_percent_sign_is_never_a_format_code() -> None:
    assert format_line(["50%d", 1]) == "50%d 1"


def test_text_inside_a_list_is_quoted() -> None:
    assert inspect(["it's", 'say "hi"', "both ' \"", "nl\nx"]) == """[ "it's", 'say "hi"', `both ' "`, 'nl\\nx' ]"""
    assert quote("tab\there") == "'tab\\there'"
    assert quote("back\\slash") == "'back\\\\slash'"
    assert quote("all ' \" ` three") == "'all \\' \" ` three'"


def test_nesting_deeper_than_two_levels_is_summarized() -> None:
    value = {"a": {"b": {"c": {"d": 1}}}, "list": [1, [2, [3, [4]]]]}
    assert inspect(value) == "{ a: { b: { c: [Object] } }, list: [ 1, [ 2, [Array] ] ] }"


def test_dict_keys_are_in_javascripts_order() -> None:
    assert inspect({"b": 1, 2: "x", "1": "y", "a-b": 3}) == "{ '1': 'y', '2': 'x', b: 1, 'a-b': 3 }"


def test_empty_lists_and_dicts() -> None:
    assert inspect([]) == "[]"
    assert inspect({}) == "{}"
    assert inspect([[]]) == "[ [] ]"


def test_a_long_list_of_numbers_is_lined_up_in_columns_to_the_right() -> None:
    assert inspect([number * 7 for number in range(30)]) == "\n".join(
        [
            "[",
            "    0,   7,  14,  21,  28,  35,  42,  49,",
            "   56,  63,  70,  77,  84,  91,  98, 105,",
            "  112, 119, 126, 133, 140, 147, 154, 161,",
            "  168, 175, 182, 189, 196, 203",
            "]",
        ]
    )


def test_a_long_list_of_text_is_lined_up_to_the_left_counting_what_the_terminal_shows() -> None:
    cards = ["Q♠️", "10♥️", "A♣️", "K♦️", "J♠️", "2♥️", "3♣️", "4♦️", "5♠️", "6♥️", "7♣️", "8♦️"]
    assert inspect(cards) == "\n".join(
        [
            "[",
            "  'Q♠️', '10♥️', 'A♣️',",
            "  'K♦️', 'J♠️',  '2♥️',",
            "  '3♣️', '4♦️',  '5♠️',",
            "  '6♥️', '7♣️',  '8♦️'",
            "]",
        ]
    )


def test_only_the_first_hundred_items_are_shown() -> None:
    lines = inspect(list(range(120))).split("\n")
    assert lines[1] == "   0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11,"
    assert lines[-3:] == ["  96, 97, 98, 99,", "  ... 20 more items", "]"]


def test_items_that_dont_fit_on_a_line_get_a_line_each() -> None:
    assert inspect([1, 2.5, "x" * 30, True, None, "y" * 30]) == "\n".join(
        ["[", "  1,", "  2.5,", f"  '{'x' * 30}',", "  true,", "  undefined,", f"  '{'y' * 30}'", "]"]
    )


def test_lengths_and_widths_count_as_javascript_and_the_terminal_do() -> None:
    assert js_length("🂡") == 2
    assert js_length("Q♠️") == 3
    assert string_width("Q♠️") == 2
    assert string_width("日本") == 4
    assert string_width("✅") == 2
