---
name: unpark
description: Pick a parked session's work back up -- find its worktree and PARKED note, offer to open the worktree's own VS Code window if this isn't it, merge the new `main` in and carry on with its next steps.  Use for `/unpark [<name>]`, or when Owen says "unpark <name>" / "pick <name> back up" / "resume the parked <name>".
argument-hint: "[<name>]"
---

# /unpark

The other half of `/park`.  The steps that do the work are `.claude/skills/park/SKILL.md` "Resume";  this skill
finds what to resume and makes sure it happens in the right place.

## 1. What to unpark

- `$ARGUMENTS` given:  `.claude/worktrees/<name>/PARKED-<name>.md`.  Missing:  say so, then the list below.
- None, and this session is in a worktree with a `PARKED-*.md`:  that one.
- Else `spell dev park list`:
  - none:  say "nothing parked" and stop
  - one:  use it, naming it in the reply
  - several:  AskUserQuestion "Which parked work?", one option per entry, labelled `<name>`, description its
    `stopped` line and `state` (4 per question;  more in extra questions)

- Rename this session `<name>`, BEFORE anything else.  A typed `/unpark <name>` already was, by the repo's
  `UserPromptSubmit` hook (`.claude/hooks/prompt-gate.mjs`).  Else (no argument, or plain words):
  `spell dev session title <name>`, which lands on the next prompt, or when the
  session opens in its new window.

## 2. Parked by a session that's still open

`spell dev worktree status <name>`:  a session in `sessions` with `running: true`, other than
this one.  AskUserQuestion:

- "Tell it to unpark (Recommended)":  `SendMessage` to it:  "Run `/unpark <name>` (asked by `<this session>`)."
  Then one line and stop.  Why:  it has the whole context;  this session only has the note.
- "Unpark here":  go on.  Say in one line that the other session should be closed, so the two don't both edit.

## 3. The right window

- This window:  `node scripts/window.mjs which`, its `workspace` line.
- `<name>`'s window file:  `workspaces/ongoing/<name>.code-workspace` in the main checkout.
- Different (or no window file):  `node scripts/window.mjs stay-check` first, then AskUserQuestion "This window
  isn't `<name>`'s.  Open it in a new window?", its reasons in the question, the option it recommends first with
  "(Recommended)" (`.claude/skills/isolate/SKILL.md`, "Start", step 2b):
  - "Open new window":
    1. not yet in the worktree:  `EnterWorktree` with `path: ".claude/worktrees/<name>"`
    2. `node scripts/window.mjs open <name>` (`--pkg <pkg>` when this isn't a package window), then
       `node scripts/window.mjs handoff <name>`, both from the worktree's root, as `.claude/skills/isolate/SKILL.md`
       "Start" steps 4-5.  The session moves there when this turn ends.
  - "Stay in this window":  step 1 only.
- Same:  `EnterWorktree` if not in it yet, and go on.

## 4. Resume

Follow `.claude/skills/park/SKILL.md` "Resume", all steps.  Moving windows (step 3):  do it all THIS turn;  the
move happens when the turn ends, with the work already resumed.
