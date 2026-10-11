"""Plays a compiled game seeded, checking after every click that its patches give the same state as writing it whole.

`python tests/patches_in_a_game.py Solitaire.compiled.py --seed 1 --clicks 300`

- Run by the core contract (cli's `contract.test.ts`), in a process of its own:
  the game's classes (`Card`, `Pile` ...) are known by name, and would stand in for the test files' own.
- Each click is a `card-click`, as `onClick` triggers one:
  every other one on the top card of the game's `stock`, if it has one, turning a card over;
  the rest on a card of its `deck`, picked by the seeded random.
- After each:  a mirror reads the writer's `patch()`, and its state must equal the game's.
- Prints how many clicks changed something;  exits 1 at the first that doesn't match.
"""

import argparse
import runpy
import sys
from pathlib import Path

from spell_core import StateMirror, StateWriter, core
from spell_core.things import SpellObject


def main() -> None:
    """Play the game `sys.argv` names:  see the module's docs."""
    parser = argparse.ArgumentParser()
    parser.add_argument("program")
    parser.add_argument("--seed", type=int, default=1)
    parser.add_argument("--clicks", type=int, default=300)
    args = parser.parse_args()
    core.pauses = False
    core.seed_random(args.seed)
    program = Path(args.program).resolve()
    sys.path.insert(0, str(program.parent))
    names = runpy.run_path(str(program), run_name="__main__")
    state = {name: value for name, value in names.items() if isinstance(value, SpellObject)}
    writer = StateWriter()
    mirror = StateMirror()
    copy = mirror.read(writer.state_of(state))
    cards = list(names["deck"])
    stock = names.get("stock")
    changed = 0
    for click in range(args.clicks):
        on_stock = click % 2 == 0 and stock
        core.trigger("card-click", card=stock[-1] if on_stock else core.random_item_of(cards))
        patch = writer.patch()
        changed += bool(patch)
        mirror.read(patch)
        if StateWriter().state_of(copy) != StateWriter().state_of(state):
            print(f"click {click + 1}:  the patched state differs from the whole state", file=sys.stderr)
            sys.exit(1)
    print(f"{changed} of {args.clicks} clicks changed something;  every patch matched")


if __name__ == "__main__":
    main()
