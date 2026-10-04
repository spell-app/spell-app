---
name: goals-open
description: Open a goals page (a set, topic, section or item) in a new browser window, starting the page server so the page updates by itself and its buttons work. Use for `/goals-open [set/topic/item]`, e.g. `/goals-open spell`, `/goals-open motivation/G1`, or "show me the plan".
argument-hint: "[set/][topic][/item-or-section]"
---

# /goals-open

1. `G open $ARGUMENTS`, where `G` is `scripts/goals.sh` in the `goals` skill's base directory
   (`../goals/scripts/goals.sh` from this skill's base directory, e.g. `.claude/skills/goals/scripts/goals.sh`).
   - It starts the page server (`yarn server`) if it isn't running, then opens the page in a NEW window of the browser named in
     `goals.preferences.json5` (`browser`).
   - Nothing given:  the active set's contents page.
2. "which goal set?" or "no topic":  AskUserQuestion with the printed `maybe:` choices, then run it again.
3. Reply in one line:  what opened, and where.
