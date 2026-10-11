"""Run a compiled spell program:  `python -m spell_core.run FizzBuzz.compiled.py --seed 1`.

- What the core contract runs for the `py` targets (epic python-target, P9).
  `spell run` doesn't run Python yet (the plan doc's T4).
- `--seed`:  the random numbers start from it, so a game deals the same cards every run, as in JavaScript.
  Without it, each run deals differently.
- `--no-pauses`:  a pause doesn't wait, e.g. in the core contract, where only what's printed matters.
- `--page`:  when the program ends, print what it drew (`core.page`),
  for the core contract to compare with what the JavaScript run prints from its fake page.
  - a blank line, then the page's HTML on one line
  - nothing when the program drew nothing, or when it failed
- `--state`:  when the program ends, print its state as JSON, each thing by its id (`StateWriter`):
  what a page mirrors.  After `--page`'s HTML, if both.
  - its state:  each thing or spell list it keeps at its top level, by its name there,
    e.g. `{"game": {...}, "stock": {...}, "deck": {...}}`
  - a blank line, then the JSON on one line
  - nothing when it failed
- The program's own folder is first on the import path:
  another project it imports (`from cards import Card`) sits beside it.
"""

import argparse
import json
import random
import runpy
import sys
from pathlib import Path

from spell_core import StateWriter, core
from spell_core.things import SpellObject


def main(argv: list[str] | None = None) -> None:
    """Run the program `argv` names, seeded as it says."""
    parser = argparse.ArgumentParser(prog="python -m spell_core.run", description="Run a compiled spell program.")
    parser.add_argument("program", help="the compiled program, e.g. FizzBuzz.compiled.py")
    parser.add_argument("--seed", type=int, help="where the random numbers start, from 1 to 2147483646")
    parser.add_argument("--no-pauses", action="store_true", help="don't wait at a pause, e.g. in a test run")
    parser.add_argument("--page", action="store_true", help="print what the program drew, as HTML, when it ends")
    parser.add_argument("--state", action="store_true", help="print its state, as JSON by id, when it ends")
    args = parser.parse_args(argv)
    core.pauses = not args.no_pauses
    # unseeded:  a different game each run, as JavaScript's core does
    core.seed_random(args.seed if args.seed is not None else random.SystemRandom().randint(1, 2147483646))
    program = Path(args.program).resolve()
    sys.path.insert(0, str(program.parent))
    names = runpy.run_path(str(program), run_name="__main__")
    if args.page:
        print_page()
    if args.state:
        print_state(names)


def print_page() -> None:
    """SIDE EFFECT:  print what the program drew, a blank line before it:  as `runProject.ts` prints its fake page.

    - Drawn now, at the end:  the page shows each thing as the program left it.
    """
    drawn = core.page.body_html()
    if drawn:
        sys.stdout.write(f"\n{drawn}\n")


def print_state(names: dict[str, object]) -> None:
    """SIDE EFFECT:  print the program's state as JSON by id, a blank line before it -- see the module's docs.

    - `names`:  the program's top level, as it ended.
    """
    state = {name: value for name, value in names.items() if isinstance(value, SpellObject)}
    sys.stdout.write(f"\n{json.dumps(StateWriter().state_of(state), ensure_ascii=False)}\n")


if __name__ == "__main__":
    main()
