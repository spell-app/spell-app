"""The seeded random:  every expected value here is what JavaScript gave for the same seed.

Made in node with the same generator, and lodash's own `shuffle()` running on it:

```js
let seed = 1
const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
Math.random = random
const _ = require("lodash").runInContext()
```
"""

import pytest

from spell_core import SpellCore, core
from spell_core.seeded_random import ParkMiller

DECK = [f"{rank}-{suit}" for suit in ["clubs", "diamonds", "hearts", "spades"] for rank in
        ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"]]  # fmt: skip


def test_the_generator_gives_javascripts_numbers() -> None:
    generator = ParkMiller(1)
    numbers = [generator.random() for _ in range(5)]
    assert numbers == [
        0.000007825903601782307,
        0.13153778773875702,
        0.7556053220812281,
        0.4586501316713636,
        0.5327672371945971,
    ]


def test_a_negative_seed_keeps_javascripts_remainder() -> None:
    generator = ParkMiller(-5)
    assert [generator.random(), generator.random()] == [-0.00003913231197663798, -0.6576889414877528]


def test_a_new_core_starts_seeded_with_1(core: SpellCore) -> None:
    assert core.random() == 0.000007825903601782307


def test_the_shared_core_starts_seeded_with_1_too() -> None:
    assert core.generator.state == 1


def test_seeding_repeats_the_numbers(core: SpellCore) -> None:
    core.seed_random(42)
    rolls = [core.random_number(6) for _ in range(10)]
    assert rolls == [1, 4, 5, 2, 3, 2, 6, 4, 4, 2]
    core.seed_random(42)
    assert [core.random_number(1, 6) for _ in range(10)] == rolls


def test_random_number_warns_without_numbers(core: SpellCore, capsys: pytest.CaptureFixture[str]) -> None:
    assert core.random_number("six") is None  # type: ignore[arg-type]
    assert capsys.readouterr().err == "random_number(): you must pass two numbers, got 1 six\n"


def test_shuffled_is_lodashs_shuffle(core: SpellCore) -> None:
    core.seed_random(7)
    items = list(range(1, 11))
    assert core.shuffled(items) == [1, 10, 5, 3, 9, 8, 6, 2, 7, 4]
    assert items == list(range(1, 11))


def test_one_seed_deals_the_same_cards(core: SpellCore) -> None:
    deck = list(DECK)
    core.shuffle(deck)
    assert deck[:8] == [
        "ace-clubs",
        "8-clubs",
        "ace-spades",
        "king-diamonds",
        "4-hearts",
        "3-diamonds",
        "9-clubs",
        "queen-hearts",
    ]
    assert sorted(deck) == sorted(DECK)


def test_a_shuffle_takes_a_number_for_every_item(core: SpellCore) -> None:
    core.seed_random(3)
    assert core.shuffled([1]) == [1]
    assert core.random() == 0.3946133641475936


def test_random_item_of(core: SpellCore) -> None:
    core.seed_random(42)
    assert core.random_item_of(["a", "b", "c", "d", "e", "f"]) == "a"
    assert core.random_item_of(["a", "b", "c", "d", "e", "f"]) == "d"
    assert core.random_item_of({"x": 1}) == 1
    assert core.random_item_of([]) is None
