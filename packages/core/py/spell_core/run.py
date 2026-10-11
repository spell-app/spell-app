"""Run a compiled spell program:  `python -m spell_core.run FizzBuzz.compiled.py --seed 1`.

- What `spell run` does for the `py` target (epic python-target, P9), and what the core contract runs.
- `--seed`:  the random numbers start from it, so a game deals the same cards every run, as in JavaScript.
  Without it, each run deals differently.
- `--no-pauses`:  a pause doesn't wait, e.g. in the core contract, where only what's printed matters.
- The program's own folder is on the import path first:  another project it imports (`from cards import Card`)
  sits beside it.
"""

import argparse
import random
import runpy
import sys
from pathlib import Path

from spell_core import core


def main(argv: list[str] | None = None) -> None:
    """Run the program `argv` names, seeded as it says."""
    parser = argparse.ArgumentParser(prog="python -m spell_core.run", description="Run a compiled spell program.")
    parser.add_argument("program", help="the compiled program, e.g. FizzBuzz.compiled.py")
    parser.add_argument("--seed", type=int, help="where the random numbers start, from 1 to 2147483646")
    parser.add_argument("--no-pauses", action="store_true", help="don't wait at a pause, e.g. in a test run")
    args = parser.parse_args(argv)
    core.pauses = not args.no_pauses
    # unseeded:  a different game each run, as JavaScript's core does
    core.seed_random(args.seed if args.seed is not None else random.SystemRandom().randint(1, 2147483646))
    program = Path(args.program).resolve()
    sys.path.insert(0, str(program.parent))
    runpy.run_path(str(program), run_name="__main__")


if __name__ == "__main__":
    main()
