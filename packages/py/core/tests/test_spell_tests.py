"""Spell's tests:  the ✅ / ❌ / ❓ lines, character for character as the JavaScript core prints them.

The expected lines come from the JavaScript core's own run of Cards.spell,
`packages/cli/src/__snapshots__/contract/Cards.out.txt`.
"""

import math

import pytest

from spell_core import SpellCore


def test_a_test_prints_its_result_then_its_lines(core: SpellCore, capsys: pytest.CaptureFixture[str]) -> None:
    def card_setup() -> None:
        core.echo_test_action("turn the card face down")
        core.expect("down", "the direction of the card", "down", "down")
        core.expect(12.0, "the value of the card", 12, "12")
        core.expect('"queen-of-spades"' == '"queen-of-spades"', "the card is the queen of spades", True, "true")
        core.expect(True, "the card is face up", True, "yes")

    core.test("test card setup", card_setup)
    assert capsys.readouterr().out == (
        "✅ test card setup\n"
        "  ▶️ Executing   `turn the card face down`\n"
        "  ✅ As expected `the direction of the card` is `down`\n"
        "  ✅ As expected `the value of the card` is `12`\n"
        "  ✅ As expected `the card is the queen of spades` is `true`\n"
        "  ✅ As expected `the card is face up` is `yes`\n"
    )


def test_a_test_is_the_block_under_a_with(core: SpellCore, capsys: pytest.CaptureFixture[str]) -> None:
    with core.test("test card setup"):
        core.echo_test_action("turn the card face down")
        core.expect("down", "the direction of the card", "down", "down")
    assert capsys.readouterr().out == (
        "✅ test card setup\n"
        "  ▶️ Executing   `turn the card face down`\n"
        "  ✅ As expected `the direction of the card` is `down`\n"
    )


def test_an_error_in_a_with_block_ends_the_test_not_the_program(
    core: SpellCore, capsys: pytest.CaptureFixture[str]
) -> None:
    with core.test("test breaking"):
        core.expect(True, "it runs", True, "yes")
        raise ValueError("oops")
    captured = capsys.readouterr()
    assert captured.out == "✅ test breaking\n  ✅ As expected `it runs` is `yes`\n"
    assert "oops" in captured.err


def test_one_failure_fails_the_test(core: SpellCore, capsys: pytest.CaptureFixture[str]) -> None:
    def deck_size() -> None:
        core.expect(52, "the number of cards in the deck", 52, "52")
        core.expect(51.0, "the number of cards in the deck", 52, "52")
        core.expect(True, "the deck is shuffled")

    core.test("test deck", deck_size)
    assert capsys.readouterr().out == (
        "❌ test deck\n"
        "  ✅ As expected `the number of cards in the deck` is `52`\n"
        "  ❌ Unexpected: `the number of cards in the deck` should be `52` but is actually `51`\n"
        "  ✅ As expected `the deck is shuffled` is truthy\n"
    )


def test_a_test_with_no_expect_is_undecided(core: SpellCore, capsys: pytest.CaptureFixture[str]) -> None:
    core.start_test("test nothing", collapse=False)
    core.echo("just looking")
    core.end_test()
    assert capsys.readouterr().out == "❓ test nothing\n  just looking\n"


@pytest.mark.parametrize(
    ("thing", "passes"),
    [(0, False), ("", False), (None, False), (math.nan, False), (False, False), ([], True), ({}, True), ("0", True)],
)
def test_expect_alone_counts_yes_as_javascript_does(
    core: SpellCore, capsys: pytest.CaptureFixture[str], thing: object, passes: bool
) -> None:
    core.expect(thing, "it")
    icon = "✅" if passes else "❌"
    assert capsys.readouterr().out.startswith(icon)


def test_a_failure_shows_the_actual_value_as_javascript_writes_it(
    core: SpellCore, capsys: pytest.CaptureFixture[str]
) -> None:
    core.expect([1, None, True], "the list", [1], "[1]")
    assert capsys.readouterr().out == "❌ Unexpected: `the list` should be `[1]` but is actually `1,,true`\n"


def test_lines_outside_a_test_print_at_once(core: SpellCore, capsys: pytest.CaptureFixture[str]) -> None:
    core.echo("hello")
    core.echo_test_action("`already quoted`")
    assert capsys.readouterr().out == "hello\n▶️ Executing   `already quoted`\n"


def test_starting_a_test_ends_the_one_running(core: SpellCore, capsys: pytest.CaptureFixture[str]) -> None:
    core.start_test("first")
    core.expect(1, "one", 1, "1")
    core.start_test("second")
    core.end_test()
    core.end_test()  # none running:  nothing printed
    assert capsys.readouterr().out == "✅ first\n  ✅ As expected `one` is `1`\n❓ second\n"


def test_echoing_a_list_in_a_test_prints_its_items(core: SpellCore, capsys: pytest.CaptureFixture[str]) -> None:
    """As the JavaScript core does:  a test's lines that are lists are spread over one line."""
    core.start_test("lists")
    core.echo(["a", 2])
    core.end_test()
    assert capsys.readouterr().out == "❓ lists\n  a 2\n"


def test_an_error_in_a_test_goes_to_stderr_and_the_test_ends(
    core: SpellCore, capsys: pytest.CaptureFixture[str]
) -> None:
    def broken() -> None:
        core.expect(1, "one", 1, "1")
        raise ValueError("no such card")

    core.test("test broken", broken)
    printed = capsys.readouterr()
    assert printed.out == "✅ test broken\n  ✅ As expected `one` is `1`\n"
    assert printed.err == "Error in test test broken: ValueError('no such card')\n"
