"""Text:  what spell's `as upper case` and `as lower case` compile to, where the value may be nothing.

```python
core.upper_case(core.get_item_at(self.rank, 0))   # "Q" for "queen";  "" for no rank
```

- Python's own `.upper()` is the word where the Python writer knows it has text.
- The twins of the JavaScript core's `string.ts`.
"""

from spell_core.js_text import js_string


class TextMethods:
    """`core`'s text words:  `upper_case()`, `lower_case()`."""

    def upper_case(self, text: object) -> str:
        """`text` as text, in UPPER CASE:  `{x} as upper case`.

        - `None` is `""`, as JavaScript's `${x ?? ""}`.
        - Anything else as JavaScript writes it:  `True` is `TRUE`.
        """
        return "" if text is None else js_string(text).upper()

    def lower_case(self, text: object) -> str:
        """`text` as text, in lower case:  `{x} as lower case`.

        - `None` is `""`.
        """
        return "" if text is None else js_string(text).lower()
