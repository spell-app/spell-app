"""Spell's own tests:  `expect`, `echo`, and the ✅ / ❌ / ❓ lines a test prints.

A test prints its result first, as a group heading, then what happened inside it, indented:

```text
✅ test card setup
  ▶️ Executing   `turn the card face down`
  ✅ As expected `the direction of the card` is `down`
```

- ✅ when every `expect` passed, ❌ when any failed, ❓ when there was none.
- Lines inside a test wait until it ends, so they can print under its heading.
- Outside a test, each line prints at once.
- The lines are the JavaScript core's, character for character.
"""

import math
from collections.abc import Callable, Iterator
from contextlib import AbstractContextManager, contextmanager
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, overload

from spell_core.js_text import js_string
from spell_core.kinds import deep_equals

if TYPE_CHECKING:
    from spell_core.console import SpellConsole

PASSED = "✅"  # ✅
FAILED = "❌"  # ❌
UNDECIDED = "❓"  # ❓
# What starts the line `echo_test_action()` prints:  ▶️, then the same 2 spaces as the JavaScript core.
EXECUTING = "▶️ Executing  "

# Stands for "no expected value given":  `None` can't, it's a value someone might expect.
_NOTHING = object()


@dataclass
class ActiveTest:
    """The test running now:  its heading, and the lines it prints when it ends."""

    # what the test is called:  its group heading, after its ✅ / ❌ / ❓
    message: object
    # whether its group starts folded, where a console can fold one
    collapse: bool = True
    # `None` until its first `expect`;  then `False` for good once one fails
    result: bool | None = None
    # lines to print under its heading:  each a list of values for one line, or one value
    output: list[object] = field(default_factory=list)


class SpellTestMethods:
    """`core`'s side of spell's tests:  `test()`, `expect()`, `echo()` ..."""

    # where every line goes:  `SpellCore` sets it
    console: "SpellConsole"
    # the test running now, if any
    active_test: ActiveTest | None = None

    @overload
    def test(
        self, message: object, test_method: None = None, collapse: bool = True
    ) -> AbstractContextManager[None]: ...

    @overload
    def test(self, message: object, test_method: Callable[[], object], collapse: bool = True) -> None: ...

    def test(
        self, message: object, test_method: Callable[[], object] | None = None, collapse: bool = True
    ) -> AbstractContextManager[None] | None:
        """Run `test_method` as a test called `message`, then print its result and its lines.

        - With no `test_method`, the test is the block under a `with`, as compiled spell writes it:

          ```python
          with core.test("test card setup"):
              core.expect(card.rank, "the rank of the card", "queen", "queen")
          ```

        - An error inside it ends it there:  the error goes to stderr, and the lines so far print as usual.
        """
        if test_method is None:
            return self._testing(message, collapse)
        with self._testing(message, collapse):
            test_method()
        return None

    @contextmanager
    def _testing(self, message: object, collapse: bool) -> Iterator[None]:
        """The block under it, as a test called `message` -- see `test()`."""
        self.start_test(message, collapse)
        try:
            yield
        except Exception as error:  # a failing test mustn't stop the program
            self.console.error(f"Error in test {js_string(message)}:", repr(error))
        finally:
            self.end_test()

    def start_test(self, message: object, collapse: bool = True) -> None:
        """Start a test called `message`:  `start test`, or `start quiet test` (`collapse`).

        - Ends the one running first, if any.
        """
        if self.active_test:
            self.end_test()
        self.active_test = ActiveTest(message, collapse)

    def end_test(self) -> None:
        """End the test running now:  print its ✅ / ❌ / ❓ heading, and its lines under it.  `end test`."""
        test = self.active_test
        if not test:
            return
        self.active_test = None
        heading = f"{self.test_result_icon(test.result)} {js_string(test.message)}"
        if test.collapse:
            self.console.group_collapsed(heading)
        else:
            self.console.group(heading)
        for line in test.output:
            if isinstance(line, list):
                self.console.log(*line)
            else:
                self.console.log(line)
        self.console.group_end()

    def expect(self, thing: object, thing_source: str, other_thing: object = _NOTHING, other_source: str = "") -> None:
        """Check `thing`, and print a ✅ or ❌ line saying so:  spell's `expect ...`.

        - Without `other_thing`, `thing` must be yes, as JavaScript counts it:
          `0`, `""`, `None` and not-a-number aren't, but an empty list is.
        - With it, the two must be equal (`equals()`).
        - `thing_source` and `other_source` are the spell they came from, for the line:

        ```python
        core.expect(card.rank, "the rank of the card", "queen", "queen")
        # ✅ As expected `the rank of the card` is `queen`
        ```
        """
        if other_thing is _NOTHING:
            success = _is_js_truthy(thing)
            other_source = "truthy"
        else:
            success = deep_equals(thing, other_thing)
            other_source = self.back_tick_quote(other_source)

        thing_source = self.back_tick_quote(thing_source)
        output: list[object] = [self.test_result_icon(success)]
        if success:
            output += ["As expected", thing_source, "is", other_source]
        else:
            actual = self.back_tick_quote(thing)
            output += ["Unexpected:", thing_source, "should be", other_source, "but is actually", actual]

        test = self.active_test
        if test:
            test.result = success if test.result is None else test.result and success
            test.output.append(output)
        else:
            self.console.log(*output)

    def echo(self, message: object) -> None:
        """Print `message`:  under the test running now, or at once.  Spell's `echo ...`."""
        if self.active_test:
            self.active_test.output.append(message)
        else:
            self.console.info(message)

    def echo_test_action(self, message: object) -> None:
        """Print `▶️ Executing` and the spell about to run:  each statement of a `to test ...` method does."""
        output = [EXECUTING, self.back_tick_quote(message)]
        if self.active_test:
            self.active_test.output.append(output)
        else:
            self.console.info(*output)

    @staticmethod
    def test_result_icon(success: bool | None) -> str:
        """✅ for passed, ❌ for failed, ❓ for not known yet (`None`)."""
        if success is None:
            return UNDECIDED
        return PASSED if success else FAILED

    @staticmethod
    def back_tick_quote(thing: object) -> str:
        """`thing` as text in back-ticks:  `` `queen` ``.  Text already in back-ticks stays as it is.

        - The text is JavaScript's (`js_string()`):  `True` is `true`, `3.0` is `3`.
        """
        if isinstance(thing, str) and thing.startswith("`") and thing.endswith("`"):
            return thing
        return f"`{js_string(thing)}`"


def _is_js_truthy(value: object) -> bool:
    """Is `value` yes, as JavaScript's `!!value` counts it?

    - No:  `None`, `False`, `0`, `""` and not-a-number.
    - Yes:  everything else, an empty list or dict too, where Python's `bool()` says no.
    """
    if value is None or value is False or (isinstance(value, str) and not value):
        return False
    if isinstance(value, int | float) and not isinstance(value, bool):
        return value != 0 and not math.isnan(value)
    return True
