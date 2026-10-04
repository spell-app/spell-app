---
name: epics
description: List the open epics -- every `/epic` plan doc (`packages/docs/epics/<name>/`, on `main` or in its own worktree) with phases left, still planning, or done but not merged -- with each one's phase, worktree, session, what's waiting on Owen, and links to its plan doc.  List only:  changes nothing.  Use for `/epics` (open ones), `/epics all` (finished ones too), or when Owen asks "what epics are open?", "which plans are running?", "where are my epics at?".  Everything else open (sessions, worktrees, clean-up):  `/worktrees`.
argument-hint: "[all]"
---

# /epics

Owen runs several epics at once:  one screen saying where each stands.  Read-only:  it lists, Owen acts
(`/wtf <name>`, `/epic <name>`, `/unpark <name>`, `/worktrees` to clean up).

- `epics.py`:  `python3 .claude/skills/epics/scripts/epics.py [--all] [--json]`, from the repo root or any
  worktree.  Its docstring says what it looks at and what each `state` means.
- An epic's LIVE plan doc is its worktree's copy (`.claude/worktrees/<name>/packages/docs/epics/<name>/`) while
  the worktree exists, else `main`'s.

## Steps

1. Run `epics.py --json` (`/epics all`:  `--all --json`).  Also the text report (`epics.py`, same flags) for its
   "Done, but still waiting on you" lines.
2. Links:  each listed epic's plan doc, `yarn docs:link <file> --text "<name>"` (one Bash call for all of them, one
   line each;  no `--show`).  It gives the side bar link and the `(_browser_)` link;  a worktree's doc comes from
   the MAIN checkout's page server.
3. Reply:
   - one line:  "<n> open epics" (`all`:  "<n> epics, <m> open")
   - a markdown table, open first, in the script's order:
     - **epic**:  the side bar link, then `(_browser_)`, as `docs:link` printed them
     - **state**:  `planning` / `working` / `stalled` / `unmerged` (`done`, `unreadable` with `all`)
     - **phase**:  `P3 · Name` active, or `next P3 · Name`, with `2/5`;  "planning" when there are no phases
     - **where**:  worktree / branch `<name>`, or `main`;  commits not in `main`, uncommitted files
     - **session**:  its title and state (`waiting`, `idle` ...), or "none"
     - **waiting on you**:  open questions, judgement calls, tests (issues only when nothing else);  parked, an
       overnight report not gone through (or a `/bedtime` run still going)
   - then one line per epic worth acting on, numbered (Owen refers to them by number), with the command for it:
     - a `stalled` one:  `/wtf <name>`, or `/epic <name>` in a new session to pick it up
     - questions or judgement calls waiting:  its session (`/session <id>`), or `/wtf <name>?` to answer here
     - `unmerged`:  `/isolate done` in its session, or `/worktrees` to merge it
     - parked:  `/unpark <name>`;  an overnight report:  `/epic review <name>`
   - then the "Done, but still waiting on you" lines, if any
4. Stop there.  Don't act on any of it unless Owen asks.

## Notes

- A plan doc `plan-doc` can't read shows as `unreadable`, with its error:  say so, don't guess its state.
- `state` comes from the plan doc's phase statuses (`yarn plan-doc phase`), so a phase nobody marked done reads as
  not done.  Doubt it:  `/wtf <name>` reads the session.
