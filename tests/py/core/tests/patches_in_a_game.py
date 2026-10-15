"""Plays a compiled game seeded, checking after every click that its patches give the same state as writing it whole.

`python tests/py/core/tests/patches_in_a_game.py Solitaire.spell.py --seed 1 --clicks 300` (from the repo root)

- Run by the core contract (cli's `contract.test.ts`), in a process of its own:
  the game's classes (`Card`, `Pile` ...) are known by name, and would stand in for the test files' own.
- Each click is a `card-click`, as `onClick` triggers one:
  every other one on the top card of the game's `stock`, if it has one, turning a card over;
  the rest on a card of its `deck`, picked by the seeded random.
- Played by the page's own messages (`spell_core.playing`):
  after each, the patches so far must add up to the game's whole state.
- Prints how many clicks changed something;  exits 1 at the first that doesn't match.
"""

import argparse
import sys

from spell_core import core
from spell_core.playing import PatchMismatchError, play_page


def main() -> None:
    """Play the game `sys.argv` names:  see the module's docs."""
    parser = argparse.ArgumentParser()
    parser.add_argument("program")
    parser.add_argument("--seed", type=int, default=1)
    parser.add_argument("--clicks", type=int, default=300)
    args = parser.parse_args()
    game = play_page(args.program, seed=args.seed)
    cards = [card["$id"] for card in game.named("deck")["$items"]]
    changed = 0
    for click in range(args.clicks):
        stock = game.state.get("stock") and game.named("stock")["$items"]
        card = stock[-1] if click % 2 == 0 and stock else {"$id": core.random_item_of(cards)}
        try:
            changed += bool(game.trigger("card-click", card=game.ref(card)))
        except PatchMismatchError:
            print(f"click {click + 1}:  the patched state differs from the whole state", file=sys.stderr)
            sys.exit(1)
    print(f"{changed} of {args.clicks} clicks changed something;  every patch matched")


if __name__ == "__main__":
    main()
