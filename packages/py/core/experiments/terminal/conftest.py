"""
The terminal study's tests (epic `python-target`, P15):  run only when asked for, with the `study` group.
- Not in spell_core's own run:  `pytest` alone collects `tests/` only (`testpaths`, pyproject.toml).
- Run them from `packages/py/core`:  `uv run --group study pytest experiments/terminal`
- Without Textual and Rich installed, they're skipped rather than failing to import.
"""

import sys
from importlib.util import find_spec
from pathlib import Path

# the study's modules import each other by name (`from elements import h`), as its scripts do when run
sys.path.insert(0, str(Path(__file__).parent))

collect_ignore_glob = [] if find_spec("textual") and find_spec("rich") else ["test_*.py"]
