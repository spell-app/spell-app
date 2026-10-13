"""`python -m spell_core.run`:  runs a compiled program, seeded, with its folder on the import path."""

from pathlib import Path

import pytest

from spell_core import core
from spell_core.run import main


def test_runs_the_program_with_its_folder_on_the_import_path(
    tmp_path: Path, capsys: pytest.CaptureFixture[str]
) -> None:
    (tmp_path / "cards.py").write_text('NAME = "cards"\n')
    program = tmp_path / "Game.compiled.py"
    program.write_text("from cards import NAME\nprint('playing', NAME)\n")
    main([str(program)])
    assert capsys.readouterr().out == "playing cards\n"


def test_a_seed_deals_the_same_every_run(tmp_path: Path, capsys: pytest.CaptureFixture[str]) -> None:
    program = tmp_path / "Dice.compiled.py"
    program.write_text("from spell_core import core\nprint(core.random_number(1, 6), core.random_number(1, 6))\n")
    main([str(program), "--seed", "42"])
    main([str(program), "--seed", "42"])
    first, second = capsys.readouterr().out.splitlines()
    assert first == second


def test_unseeded_it_starts_somewhere_else(tmp_path: Path) -> None:
    program = tmp_path / "Nothing.compiled.py"
    program.write_text("")
    try:
        firsts = []
        for _ in range(3):
            core.seed_random(1)
            main([str(program)])
            firsts.append(core.random())
        assert len(set(firsts)) > 1
    finally:
        # the shared core, as every other test expects it:  seeded with 1
        core.seed_random(1)


def test_state_prints_its_top_level_things_by_id(tmp_path: Path, capsys: pytest.CaptureFixture[str]) -> None:
    program = tmp_path / "Bag.compiled.py"
    program.write_text(
        "from spell_core import List, Thing, prop\n"
        "class Marble(Thing):\n    color = prop(type='text')\n"
        "class Bag(List): pass\n"
        "marble = Marble(color='red')\n"
        "bag = Bag([marble])\n"
        "count = 1\n"
    )
    try:
        main([str(program), "--state"])
    finally:
        # the shared core, as every other test expects it:  seeded with 1
        core.seed_random(1)
    assert capsys.readouterr().out == (
        '\n{"marble": {"$type": "Marble", "$id": "1", "color": "red"}, '
        '"bag": {"$type": "Bag", "$id": "2", "$items": [{"$id": "1"}]}}\n'
    )
