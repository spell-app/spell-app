---
name: goals-open-vs
description: Open a goals page (a set, topic, section or item) in VS Code's doc preview (the right side bar's "Spell Docs" view), served live by the page server. Use for `/goals-open-vs [set/topic/item]`, or when Owen is in VS Code and wants to read the plan next to the code.
argument-hint: "[set/][topic][/item-or-section]"
---

# /goals-open-vs

1. `G open-vs $ARGUMENTS`, where `G` is `scripts/goals.sh` in the `goals` skill's base directory
   (`../goals/scripts/goals.sh` from this skill's base directory, e.g. `~/.claude/skills/goals/scripts/goals.sh`).
   - It starts the page server (`yarn server`) if need be, then asks VS Code (through the spell extension's `doc-preview` link)
     to show the page in the doc preview:  the "Spell Docs" view in the right side bar (or Simple Browser beside the
     editor, setting `spell.docPreview.location`).
2. "which goal set?" or "no topic":  AskUserQuestion with the printed `maybe:` choices, then run it again.
3. Nothing shows up in VS Code:  the spell extension is missing or older than the page server's `url` support:  `yarn vscode` at the repo root.
   In the spell repo:  `yarn vscode` (builds and installs it), then try again.  Meanwhile `/goals-open` works in
   the browser.
4. Reply in one line.
