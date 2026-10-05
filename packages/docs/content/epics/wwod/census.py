"""Census of WWOD verdict tags in `triage/*.md` (P1's tagged copy of `wwod/`).
- counts per file and kind, and every untagged top-level bullet

`python3 packages/docs/content/epics/wwod/census.py` (from the repo root);  exits 1 when any top-level bullet is untagged.
- a tag sits right after a bullet's `- `:  `[HAVE → ...]`, `[ADOPT]`, `[ADAPT:  ...]`, `[CONFLICT → D3:  ...]`,
  `[DROP:  ...]`, `[SOLID:  ...]`
- top-level:  `- ` at column 0;  bullets inside fenced code are skipped
"""

import re
import sys
from collections import Counter
from pathlib import Path

KINDS = ("HAVE", "ADOPT", "ADAPT", "CONFLICT", "DROP", "SOLID")
TAG = re.compile(r"^\s*(?:[-|]\s*)?\[(" + "|".join(KINDS) + r")\b")
FOLDER = Path(__file__).parent / "triage"


def census(path):
    """Tag counts and untagged top-level bullets (line number, text) of one file."""
    counts = Counter()
    untagged = []
    in_code = False
    for number, line in enumerate(path.read_text().splitlines(), 1):
        if line.lstrip().startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            continue
        tag = TAG.match(line)
        if tag:
            counts[tag.group(1)] += 1
        elif line.startswith("- "):
            untagged.append((number, line[:90]))
    return counts, untagged


total = Counter()
missing = 0
print(f"{'file':<20}" + "".join(f"{kind:>10}" for kind in KINDS))
for path in sorted(FOLDER.glob("*.md")):
    counts, untagged = census(path)
    total += counts
    missing += len(untagged)
    print(f"{path.name:<20}" + "".join(f"{counts[kind]:>10}" for kind in KINDS))
    for number, text in untagged:
        print(f"  UNTAGGED {path.name}:{number}  {text}")
print(f"{'total':<20}" + "".join(f"{total[kind]:>10}" for kind in KINDS))
sys.exit(1 if missing else 0)
