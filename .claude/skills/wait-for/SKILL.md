---
name: wait-for
description: Park this session's work, wait in the background for another session / worktree / plan to finish (merged into `main`, worktree removed, session exited, or every plan phase done), then merge the new `main` in and carry on by itself.  `/wait-for ?` lists the candidates in a modal.  Use for `/wait-for <name>`, `/wait-for ?`, or when Owen says "wait for <name> to finish, then pick this back up".
argument-hint: "<name> | ?"
---

# /wait-for

Another session is changing things this one depends on (e.g. moving packages).  Park here, watch it, and resume
when it's done, with no one supervising.  Parking and resuming are `.claude/skills/park/SKILL.md`'s;  read it.

- Commands:  `spell dev worktree status <name>` and `spell dev park candidates|wait`, from the repo root or a
  worktree.
- Finished, any of:  `<name>`'s branch merged into `main`, its worktree removed, every running session of
  `<name>` exited, every phase of its plan doc done.  NEVER "idle":  a session goes idle whenever it waits for
  Owen.

## 1. Which one

- `$ARGUMENTS` is `?` (or empty):  `spell dev park candidates`.
  - none:  say so and stop
  - else AskUserQuestion "Wait for which?", one option per candidate, labelled with its `name`, described by its
    `label` (4 per question;  more in extra questions, or Owen types a name in "Other")
- Else `<name>` is `$ARGUMENTS`.  `spell dev worktree status <name>`:  nothing (no `worktree`, `branch`, `plan` or `sessions`):
  say so and offer `/wait-for ?`.
- `<name>` is this session's own worktree:  say so and stop.

## 2. Park

- Already parked (a `PARKED-*.md` at this worktree's root) and nothing uncommitted:  skip.
- Else `.claude/skills/park/SKILL.md` "Park this session", steps 0-5, WITHOUT its window move (its step 2 says
  why).
- Note:  line 1 `<!-- park: waiting:<name> -->`, and under "## Waiting for":  `<name>`, what it is (worktree /
  plan / session), and the `/wait-for <name>` that picks the wait up again.

## 3. Wait

1. `spell dev worktree status <name>` already `finished`:  say why in one line, then step 4.
2. Else `Bash` with `run_in_background: true`, `timeout: 7200000`:
   `spell dev park wait <name>` (checks every 60s;  gives up after ~2h).
3. One line:  "parked `<this>`;  waiting for `<name>` (checks every minute);  resumes on its own when it's
   <merged / done / ...>".  End the turn:  the poll's exit wakes this session.
4. When it exits:
   - 0:  finished.  Its JSON's `why` says which.  Step 4.
   - 2:  still going after 2 hours:  start it again (step 3.2), no message.
   - 3, or anything else:  say what it printed and stop, still parked.
   - Owen writes while it waits:  answer him;  the wait goes on.  "Stop waiting":  stop it (`TaskStop`), leave
     the note at `parked`.
- NOTE:  the wait lives only as long as this session.  Closed or restarted (VS Code reload, window move):
  `/wait-for <name>` again, or `/unpark`.

## 4. Resume

1. One line:  "`<name>` finished (<why>);  resuming `<this>`".
2. `.claude/skills/unpark/SKILL.md` step 3 (the right window), then `.claude/skills/park/SKILL.md` "Resume".
   - Its stopping points (conflicts it can't resolve, failing checks) still stop and ask:  that's the only time
     this needs Owen.
