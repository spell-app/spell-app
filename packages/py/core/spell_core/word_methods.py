"""spell's own wording of a program's members, for reflection (epic python-target, P14).

```python
core.load_words("Solitaire.py.en.json")
core.words_of(card)["move_to_pile"]  # "move (a card) to (a pile)"
```

- Python names a member `move_to_pile`, which loses where spell's values go:  `move (a card) to (a pile)`.
- The compiler writes each program's words beside its Python, `<Project>.py.en.json`, keyed by the Python names --
  the same data as javascript's `<Project>.en.js`, which the Thing Explorer reads.
- Loading them is up to whoever reflects on the program:  a compiled program never needs them to run.
"""

import json
from pathlib import Path


class WordMethods:
    """`core.load_words()` and `core.words_of()`."""

    # Each type's members, by Python name, in spell's words:  `{"Card": {"move_to_pile": "move (a card) ..."}}`
    words: dict[str, dict[str, str]]

    def load_words(self, path: str | Path) -> None:
        """Load a program's words file, e.g. `Solitaire.py.en.json`, beside those already loaded."""
        data = json.loads(Path(path).read_text(encoding="utf-8"))
        if not hasattr(self, "words"):
            self.words = {}
        for type_name, members in data.get("types", {}).items():
            self.words.setdefault(type_name, {}).update(members)

    def words_of(self, thing: object) -> dict[str, str]:
        """`thing`'s members in spell's words, its own class's and those it extends, by Python name."""
        known = getattr(self, "words", {})
        words: dict[str, str] = {}
        for cls in reversed(type(thing).__mro__):
            words.update(known.get(cls.__name__, {}))
        return words
