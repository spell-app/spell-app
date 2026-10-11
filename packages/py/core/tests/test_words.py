"""`core.load_words()` / `core.words_of()`:  spell's wording of a program's members (epic python-target, P14)."""

import json
from pathlib import Path

from spell_core import List, Thing
from spell_core.core import SpellCore


class Tile(Thing):
    """A tile."""


class BlankTile(Tile):
    """A tile of its own kind."""


def test_a_things_words_come_from_its_class_and_those_it_extends(core: SpellCore, tmp_path: Path) -> None:
    words = tmp_path / "Cards.py.en.json"
    words.write_text(
        json.dumps(
            {
                "lang": "en",
                "types": {
                    "Tile": {"move_to_pile": "move (a card) to (a pile)", "is_face_up": "is face up"},
                    "BlankTile": {"is_wild": "is wild"},
                },
            }
        )
    )
    core.load_words(words)
    assert core.words_of(BlankTile()) == {
        "move_to_pile": "move (a card) to (a pile)",
        "is_face_up": "is face up",
        "is_wild": "is wild",
    }
    assert core.words_of(List()) == {}
