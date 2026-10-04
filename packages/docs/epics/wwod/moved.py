"""Check that every bullet of the root `AGENTS.md` sections moving into WWOD has landed in `wwod/*.md`.

`python3 packages/docs/epics/wwod/moved.py [AGENTS.md]` (from the repo root);  exits 1 when any bullet is missing.
- `AGENTS.md`:  the file to read the sections from;  default the repo root's (use `git show main:AGENTS.md > x` once
  P3 has slimmed it)
- a bullet "lands" when some stretch of `wwod/` matches it closely:  its words, in order, mostly there
  (`difflib` ratio over normalized text);  rewording passes, a dropped clause doesn't
- prints each bullet's best match and score, worst first;  MISSING below `THRESHOLD`
"""

import difflib
import re
import sys
from pathlib import Path

SECTIONS = ("Documentation", "Functions", "Decorators", "Types / Exports", "Imports")
THRESHOLD = 0.6
ROOT = Path(__file__).resolve().parents[4]
WWOD = Path(__file__).parent / "wwod"


def normalize(text):
    """Lowercase words only:  markdown, punctuation and spacing don't count."""
    return " ".join(re.findall(r"[a-z0-9$@#_.]+", text.lower()))


def bullets(markdown, sections):
    """The bullets (with their wrapped lines) under the `## <section>` headings named."""
    found, current, keep = [], None, False
    for line in markdown.splitlines():
        heading = re.match(r"^## (.+)", line)
        if heading:
            keep = heading.group(1).strip() in sections
            continue
        if not keep:
            continue
        if re.match(r"^\s*- ", line):
            current = [line]
            found.append(current)
        elif current is not None and line.startswith("  ") and line.strip():
            current.append(line)
        else:
            current = None
    return [" ".join(part.strip() for part in bullet) for bullet in found]


def best_match(needle, lines):
    """Best ratio of `needle` against any window of consecutive `lines` about its length."""
    best, where = 0.0, ""
    for size in (1, 2, 3, 4):
        for i in range(len(lines) - size + 1):
            window = " ".join(lines[i : i + size])
            score = difflib.SequenceMatcher(None, needle, window, autojunk=False).ratio()
            if score > best:
                best, where = score, window
    return best, where


source = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "AGENTS.md"
targets = [normalize(line) for path in sorted(WWOD.glob("*.md")) for line in path.read_text().splitlines()]
targets = [line for line in targets if line]
results = []
for bullet in bullets(source.read_text(), SECTIONS):
    needle = normalize(bullet)
    score, where = best_match(needle, targets)
    results.append((score, bullet, where))
results.sort()
missing = 0
for score, bullet, where in results:
    flag = "MISSING" if score < THRESHOLD else "ok"
    missing += score < THRESHOLD
    print(f"{flag:7} {score:.2f}  {bullet[:100]}")
    if score < THRESHOLD:
        print(f"{'':15}best:  {where[:100]}")
print(f"\n{len(results)} bullets, {missing} missing")
sys.exit(1 if missing else 0)
