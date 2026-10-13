"""Spell's ranges include their end, and count down as readily as up."""

import pytest

from spell_core import SpellCore


@pytest.mark.parametrize(
    ("start", "end", "numbers"),
    [
        (1, 5, [1, 2, 3, 4, 5]),
        (3, 1, [3, 2, 1]),
        (2, 2, [2]),
        (-1, 1, [-1, 0, 1]),
        (0.5, 2, [0.5, 1.5]),
    ],
)
def test_get_range_includes_both_ends(core: SpellCore, start: float, end: float, numbers: list[float]) -> None:
    assert core.get_range(start, end) == numbers


def test_get_range_warns_without_two_numbers(core: SpellCore, capsys: pytest.CaptureFixture[str]) -> None:
    assert core.get_range("a", 3) == []  # type: ignore[arg-type]
    assert capsys.readouterr().err == "get_range(): you must pass two numbers, got a 3\n"


@pytest.mark.parametrize(("count", "numbers"), [(3, [1, 2, 3]), (1, [1]), (0, []), (-2, []), (2.5, [1, 2])])
def test_count_to_counts_from_1(core: SpellCore, count: float, numbers: list[int]) -> None:
    assert core.count_to(count) == numbers
