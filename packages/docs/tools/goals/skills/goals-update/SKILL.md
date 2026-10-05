---
name: goals-update
description: Digest the new thoughts on goals pages -- work each one into its page (edits, new goals, questions, decisions), mark it digested with what came of it, and keep the agent notes in step. Use for `/goals-update [set/topic/item]` (e.g. `/goals-update spell/motivation` for one topic, `/goals-update spell` for a whole set, no argument for the active set), or when Owen says "go through my thoughts".
argument-hint: "[set/][topic][/item-or-section]"
---

# /goals-update

Owen leaves thoughts on goals pages (the bubble buttons, or `/goals-thought`).  Work them in, then mark each
digested with what came of it.  Thoughts stay on the page as a record:  never delete one.

- `G` is `scripts/goals.sh` in the `goals` skill's base directory (`../goals/scripts/goals.sh` from this skill's
  base directory, e.g. `.claude/skills/goals/scripts/goals.sh`).  Rules:  the goals folder's `AGENTS.md`.

## 1. Gather

- `$ARGUMENTS` is the scope:  a set, topic, section or item;  nothing:  the active set.  "which goal set?":
  AskUserQuestion with the printed choices.
- `G thoughts <scope> --json`.  None:  say so in one line, and stop.
- Group them by topic.  For each, read the topic's `.md` and the page around each thought (the item or section it's
  on:  `for` in the JSON).

## 2. Work each thought in

Decide what the thought means for the page, then do the smallest thing that captures it:

- **it answers an open question clearly:**  add a decision (`G add <set/topic> decision ... --details "<p>Why:
  Owen's words</p>"`), close the question, log it (`--icon gavel`)
- **it adds or changes a goal, idea, risk or work item:**  `G add ...`, or edit that item's note / details by hand
- **it corrects or adds facts:**  edit the Summary or Today prose by hand, minimally
- **it raises something to decide:**  add a question, with your suggestion in its details
- **it's a note for later, or already covered:**  nothing to change;  say so in the digest note

Then mark it digested with what came of it, item ids included (they become links):
`G digest <set/topic/T3> "D2 added;  Q3 closed"`.

- Owen's words are the source:  quote them in details rather than paraphrase.
- NEVER contradict a decision silently:  a thought against a decision is a new question naming the decision.
- Ambiguous, or it changes a decision:  ask Owen (AskUserQuestion, batched:  up to 4 thoughts at once).  Running
  headless (`claude -p`, `spell goals update --print`):  don't ask;  add a question for it instead, and digest the
  thought as "→ Q<n>".

## 3. Finish

- Per topic touched:  `G log <set/topic> "Digested T2-T4:  ..." --icon "comment dots"`, then bring the `.md` in step
  (decisions, work, open questions;  same ids and titles), then `G check <set/topic> --no-browser`.
- Reply:  a short list per topic:  thought → what came of it;  then anything waiting on Owen.
