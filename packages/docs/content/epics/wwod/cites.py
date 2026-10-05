"""Check every `WWOD §N` and `WWOD §N › "title"` citation resolves, and every repo path in backticks exists.

`python3 packages/docs/content/epics/wwod/cites.py [folder] [more files...]` (from the repo root);  exits 1 on any problem.
- `folder`:  the WWOD files (default:  this epic's `wwod/`;  P3 passes `packages/agents/wwod`)
- `more files`:  other files whose citations to check against it (root `AGENTS.md`, package `AGENTS.md` ...)
- a section is `## N. Title`;  a rule title is a bullet's leading `**bold**` or a `### Heading`, trailing `:`
  ignored
- skipped:  `From:` provenance lines (they cite the ORIGINAL WWOD's numbers), bare `SKILL.md`, and
  `packages/agents/...` paths until P3 installs it
- "title" matches a rule in section N when one starts with it (case-insensitive, backticks ignored)
- paths:  backticked `packages/...`, `scripts/...`, `.claude/...` or root `*.md`, without spaces or globs
"""

import re
import sys
from pathlib import Path

REPO = next(p for p in Path(__file__).resolve().parents if (p / "tsconfig.base.json").exists())  # the repo root
CITE = re.compile(r"(?:WWOD\s+)?§(\d+)(?:\s*›\s*\"([^\"]+)\")?")
PATH = re.compile(r"`((?:packages|scripts|\.claude|types)/[^`\s*<>{}]+|[A-Z][A-Z-]+\.md)`")


def clean(text):
    """Title text for comparing:  no backticks, no trailing colon, lowercase."""
    return text.replace("`", "").rstrip(":").strip().lower()


def sections_of(files):
    """`{N: [rule titles]}` across `files`."""
    sections, current = {}, None
    for path in files:
        for line in path.read_text().splitlines():
            heading = re.match(r"^##\s+(\d+)\.", line)
            if heading:
                current = int(heading.group(1))
                sections.setdefault(current, [])
                continue
            title = re.match(r"^\s*-\s+\*\*(.+?)\*\*", line) or re.match(r"^###\s+(.+)", line)
            if title and current is not None:
                sections[current].append(clean(title.group(1)))
    return sections


folder = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).parent / "wwod"
wwod = sorted(folder.glob("*.md"))
extra = [Path(arg) for arg in sys.argv[2:]]
sections = sections_of(wwod)
problems = []
for path in wwod + extra:
    for number, line in enumerate(path.read_text().splitlines(), 1):
        where = f"{path.name}:{number}"
        if line.startswith("From:"):
            continue
        for cite in CITE.finditer(line):
            n, title = int(cite.group(1)), cite.group(2)
            if n not in sections:
                problems.append(f"{where}  §{n}:  no such section")
            elif title and not any(rule.startswith(clean(title)) for rule in sections[n]):
                problems.append(f"{where}  §{n} › \"{title}\":  no such rule (has:  {', '.join(sections[n][:6])} ...)")
        for found in PATH.finditer(line):
            target = found.group(1).rstrip(".,:;")
            target = re.sub(r":\d+(-\d+)?$", "", target)
            if target == "SKILL.md" or (target.startswith("packages/agents/") and "agents" not in folder.parts):
                continue
            if not (REPO / target).exists():
                problems.append(f"{where}  `{target}`:  no such path")
print("\n".join(problems) or "ok")
print(f"{len(sections)} sections, {sum(map(len, sections.values()))} rules, {len(problems)} problems")
sys.exit(1 if problems else 0)
