---
name: whassup
description: Take stock of everything open in this repo -- worktrees, branches, running Claude sessions, `/park`ed and `/bedtime` work, plan docs with phases left -- sorted into what's in process, what's hung or parked, and what's dead but still hanging on;  then let Owen pick which groups to deal with, do the picked actions (remove, merge, end, open, unpark ...) and take stock again.  Use for `/whassup`, or when Owen asks "what's open?", "what's still hanging around?", "clean up the worktrees", "what did I leave running?".
---

# /whassup

Owen has lots going at once:  show it all in one screen, sort it, and clean up what he picks.  Nothing changes
before he picks it in a modal.

- `whassup.py`:  `python3 .claude/skills/whassup/scripts/whassup.py [--json]`, from the repo root or any worktree.
  Read-only.  Its docstring says what it looks at and how it groups.
- The three groups (the script's names in brackets):
  - **In process** (`active`):  a session working in it, or touched in the last 6 hours
  - **Hung or parked** (`stalled`):  `/park`ed, a `/bedtime` report not gone through, a busy session gone silent
    20 min, a question unanswered 30 min, work untouched 6 hours with no session, a plan with phases left and nothing
    working on it, a `park:` stash left behind
  - **Dead, still hanging on** (`dead`):  merged or empty worktrees and branches, sessions idle 24 hours (6 outside
    a worktree) or never used, window files for a worktree that's gone
- Each item comes with its `actions`;  `commands` are plain shell lines, `[]` means a step Claude takes.

## 1. Take stock

1. Run `whassup.py --json`.
2. Reply with the three groups, in the order above, as numbered lists (Owen refers to items by number:  1, 2 ... in
   the first group, carrying on in the next).  Per item:  its kind and name in bold (`worktree seo`, `session SVG
   from image`), then its `why` in plain words.  An empty group:  one line, "nothing".
3. Everything empty apart from this session:  "all clear" and stop.

## 2. What's next?

AskUserQuestion, multiSelect, question "What's next?", header "Next":
- one option per group with items in it:  "In process (<n>)", "Hung or parked (<n>)", "Dead (<n>)", each described
  in a few words from its items (e.g. "remove 2 merged worktrees, end 1 idle session")
- "Forget it":  stop, nothing more.  Picked along with groups:  it wins.

## 3. Pick the actions

For each picked group, AskUserQuestion, multiSelect, ONE question per item (4 per call;  more items:  more calls):
- question:  "<n>. <kind> <name>:  <why, short>",  header:  the name, cut to 12 characters
- options:  its `actions` (label as given;  description:  the commands, or what Claude will do), then "Leave it".
  More than 3 actions:  the first 3 (the script lists them most useful first), then "Leave it".
- skip this session's own item (`this: true`):  there's nothing to do to it from here
- nothing picked but "Leave it" for every item:  say so and skip to step 5

## 4. Do 'em

In the order Owen will want to see them:  quick looks (`wtf`, `open`, `answer`) last, so their output isn't buried.

- Commands:  each line its own Bash call, from the MAIN checkout's root (the report's `main`).  In a worktree
  session the harness refuses git commands aimed outside the worktree:  collect each refused line and give Owen the
  list at the end to paste, or to run `/whassup` again from a session in the main checkout.
- A command fails (a dirty worktree for `git worktree remove`, unmerged work for `git branch -d`):  NEVER retry with
  `--force` / `-D`.  Say why, and leave it for the next round.
- Per action id:
  - `remove`:  its commands.  `-D` there means its commits are already in `main` (squashed):  run
    `git cherry main <branch>` first and go on only if every line starts with `-`.
  - `discard`:  ALWAYS a second AskUserQuestion first, "Throw away `<name>`?", listing what goes:
    `git log --oneline main..<branch>` and `git -C <worktree> status --short`.  Options "Throw it away" / "Keep it".
  - `merge`:  as `/isolate done` steps 2 and 6 (`.claude/skills/isolate/SKILL.md`):  the main checkout must be on
    `main` with nothing uncommitted;  `git merge-tree --write-tree --name-only main <branch>` exit 1 (conflicts):
    don't, say which files and offer `/unpark <name>` or its session to fix them.  Picking it in the modal counts
    as the ask to commit the merge.  Then offer its `remove` next round.
  - `kill`:  `kill <pid>` (SIGTERM).  NEVER this session's own pid.  Its tab shows it ended;  `/session <id>` brings
    it back.
  - `wtf`:  the `wtf` skill with `<name>`;  show its reply.
  - `open`:  the `session` skill with the session id.
  - `answer`:  the `wtf` skill with `<name>?`, which shows the waiting question and relays Owen's answer.
  - `unpark` / `wakeup`:  they must run IN that work's session.  Running:  `SendMessage` to it ("Run `/unpark`" /
    "Run `/wakeup`", asked by this session).  Not running:  tell Owen to open a new session and run it there;
    running them here would move THIS session.
  - `nudge`:  `SendMessage` to the session that's waiting:  "`<target>` is done:  run `/unpark <name>`".
  - `apply` / `drop` (a stash):  `drop` shows `git stash show -p <sha>` first, then finds the entry's current
    `stash@{n}` by its sha (`git stash list --format='%H %gd'`) and drops that;  never a bare `git stash pop`.
- NEVER touch this session's own worktree, branch or window.

## 5. Where we stand

1. Run `whassup.py --json` again.
2. One line per item whose group changed or that went away ("**worktree ui-import**:  dead -> gone"), then the three
   groups again, as in step 1.  Commands refused in step 4:  listed last, ready to paste.
3. Stop there:  no second "What's next?" unless Owen asks.
