---
name: epics
description: List the open epics -- every `/epic` plan doc (`epics/<name>/`, shared by `main` and every worktree) with phases left, still planning, or done but not merged -- with each one's phase, worktree, session, what's waiting on Owen, and links to its plan doc.  List only:  changes nothing.  Use for `/epics` (open ones), `/epics all` (finished ones too), or when Owen asks "what epics are open?", "which plans are running?", "where are my epics at?".  Everything else open (sessions, worktrees, clean-up):  `/worktrees`.
argument-hint: "[all]"
---

# /epics

Owen runs several epics at once:  one screen saying where each stands.  Read-only:  it lists, Owen acts
(`/wtf <name>`, `/epic <name>`, `/unpark <name>`, `/worktrees` to clean up).

- Every plan doc is shared content:  ONE copy, in `../spell-app-dev`, linked into every checkout as `epics`
  (`packages/docs/content/epics` on code from before 2026-10-05).  So any checkout lists every epic, and there's
  no "worktree copy" to prefer.
- An epic's worktree and branch are both `<name>` (`.claude/worktrees/<name>`);  it may have none (planned on
  `main`, or merged and removed).
- A worktree cut before 2026-10-04 that hasn't run `spell dev shared migrate <name>` still has its own old copy
  (`packages/docs/epics/<name>/`):  `plan-doc` reads that one for it.

## Steps

1. Gather, in parallel (one Bash call each, from the repo root or any worktree):
   - `spell dev plan-doc list --json`:  every epic once, `{ name, title, status, checkout, notReviewed, total, file }`,
     in progress first
     - `status`:  `in progress` while any phase isn't done (or there are none yet), else `done`
     - `checkout`:  `main`, or `.claude/worktrees/<name>`:  where it runs
   - `spell dev worktree list --json`:  `{ sessions[] }`, each with `name`, `branch`, `checkout`, `state`
     (`busy`, `waiting`, `idle` ...), `question`, `id`
2. Keep the open ones (`/epics all`:  every one):  `in progress`, or `done` with a worktree whose branch has work
   not in `main`.  Then, for those:
   - `spell dev plan-doc summaries <file> ...` (every `file` in one call):  JSON `{ <file>: summary }`, each with
     `phases[]` (`n`, `name`, `status`), `active`, `next`, `open` (items by kind), `bedtime` (the phases a `/bedtime`
     run is on, while it goes);  or `{ error }`
   - a worktree epic:  `spell dev worktree status <name>` (`ahead`, `merged`), `git -C .claude/worktrees/<name>
     status --short` (uncommitted files), and a `PARKED-<name>.md` at its root (`/park`)
   - its sessions:  the ones whose `branch` or `name` is `<name>`
3. Its STATE, from those:
   - `planning`:  no phases yet
   - `working`:  a phase `active`, or a session on it `busy` / `waiting`
   - `stalled`:  phases left, nothing working on it
   - `unmerged`:  every phase done, but its branch has commits not in `main` (`ahead` > 0)
   - `done`:  every phase done, nothing left outside `main` (`all` only)
   - `unreadable`:  `summaries` gave an `error` (`all` only, unless it's in a worktree)
4. Links:  each listed epic's plan doc, `spell dev docs link <file> --text "<name>"` (one Bash call for all of them, one
   line each;  no `--show`).  It gives the side bar link and the `(_browser_)` link.
5. Reply:
   - one line:  "<n> open epics" (`all`:  "<n> epics, <m> open")
   - a markdown table, open first, in `list`'s order:
     - **epic**:  the side bar link, then `(_browser_)`, as `docs:link` printed them
     - **state**:  step 3's
     - **phase**:  `P3 · Name` active, or `next P3 · Name`, with `2/5`;  "planning" when there are no phases
     - **where**:  worktree / branch `<name>`, or `main`;  commits not in `main`, uncommitted files
     - **session**:  its title and state (`waiting`, `idle` ...), or "none"
     - **waiting on you**:  open questions, judgement calls, tests (issues only when nothing else), and
       `notReviewed` / `total`;  parked, or a `/bedtime` run still going
   - then one line per epic worth acting on, numbered (Owen refers to them by number), with the command for it:
     - a `stalled` one:  `/wtf <name>`, or `/epic <name>` in a new session to pick it up
     - questions or judgement calls waiting:  its session (`/session <id>`), or `/wtf <name>?` to answer here
     - many items not reviewed:  `/epic review <name>`
     - `unmerged`:  `/isolate done` in its session, or `/worktrees` to merge it
     - parked:  `/unpark <name>`
   - then "Done, but still waiting on you":  each `done` epic with open questions, judgement calls or tests, one line
     each
6. Stop there.  Don't act on any of it unless Owen asks.

## Notes

- A plan doc `plan-doc` can't read shows as `unreadable`, with its error:  say so, don't guess its state.
- State comes from the plan doc's phase statuses (`spell dev plan-doc phase`), so a phase nobody marked done reads as
  not done.  Doubt it:  `/wtf <name>` reads the session.
