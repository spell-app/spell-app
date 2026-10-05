---
name: worktrees
description: Take stock of every running Claude session (which worktree, branch and folder each is in) and everything open in this repo -- worktrees, branches, `/park`ed and `/bedtime` work, plan docs with phases left -- sorted into what's in process, what's hung or parked, and what's dead but still hanging on;  then let Owen pick which groups to deal with, do the picked actions (remove, merge, end, open, unpark ...) and take stock again.  Use for `/worktrees`, `/worktrees sessions` (the table alone), or when Owen asks "what's open?", "what worktree is X in", "which sessions are running where", "what did I leave running?", "clean up the worktrees", or can't find a session.  Epics alone:  `/epics`.
argument-hint: "[sessions]"
---

# /worktrees

Owen has lots going at once:  show it all in one screen, sort it, and clean up what he picks.  Nothing changes
before he picks it in a modal.  (Was `/whassup` plus the old global `/worktrees`, merged 2026-10-03.)

- `spell dev stock [--json]` (the whole report) and `spell dev worktree list` (the sessions table alone), from the
  repo root or any worktree.  Read-only.  What it looks at and how it groups:  `packages/cli/src/dev/stock.ts`.
- The sessions (`sessions[]`):  every LIVE session on the machine (`~/.claude/sessions/<pid>.json`, dead pids
  skipped), in this repo or not:  title, agent name (what `ListAgents` and `SendMessage` call it), id (`/session`
  and `claude --resume` take its first 8), status, where it runs (VS Code / terminal / Desktop), worktree, branch,
  folder.  The folder is the session's LATEST `cwd` (from its transcript), not where it started.  `idle[]`:  this
  repo's worktrees with no session in them.
- The three groups (the script's names in brackets):
  - **In process** (`active`):  a session working in it, or touched in the last 6 hours
  - **Hung or parked** (`stalled`):  `/park`ed, a `/bedtime` report not gone through, a busy session gone silent
    20 min, a question unanswered 30 min, work untouched 6 hours with no session, a plan with phases left and nothing
    working on it, a `park:` stash left behind
  - **Dead, still hanging on** (`dead`):  merged or empty worktrees and branches, sessions idle 24 hours (6 outside
    a worktree) or never used, window files for a worktree that's gone
- Each item comes with its `actions`;  `commands` are plain shell lines, `[]` means a step Claude takes.

## 1. Take stock

1. Run `spell dev stock --json`.  `/worktrees sessions`:  `spell dev worktree list` instead, reply with step 2's
   table and its "worth acting on" lines, and stop.
2. The sessions, as a markdown table (drop empty columns;  mark this session "(this one)"), then one line per thing
   worth acting on:  a session `waiting` for input, two sessions in the SAME worktree (their edits collide), a
   session whose branch isn't the one its worktree is named for.  Then the worktrees no session is in, one line.
3. The three groups, in the order above, as numbered lists (Owen refers to items by number:  1, 2 ... in the first
   group, carrying on in the next).  Per item:  its kind and name in bold (`worktree seo`, `session SVG from
   image`), then its `why` in plain words.  An empty group:  one line, "nothing".
4. Everything empty apart from this session:  "all clear" and stop.
5. A session Owen asks about isn't listed:  it isn't running.  Find its transcript (`ls
   ~/.claude/projects/*/<id>*.jsonl`) and offer `/session <id>`, or `cd <its cwd> && claude --resume <id>`.

## 2. What's next?

More than 4 items in all (the modals below would take several calls):  skip steps 2 and 3's modals.  ONE details
page asks about every item instead (Owen, 2026-10-03):
- the spec:  `where`:  epic "none:  repo housekeeping", just now "what `/worktrees` found" (counts per group),
  decides "what happens to each;  anything left stays listed next time"
- one question per item, in the groups' order, `title`:  `<n> · <kind> <name>`, `text`:  its `why` in plain words
  and when it was last touched;  `options`:  its `actions`, most useful first and `recommended` (NEVER `discard`),
  each `summary` what it does and `details` its commands;  then "Leave it"
- skip this session's own item, as below
- `yarn details new <slug> --from <spec.json>` (the spec in the scratchpad;  its shape:  `DetailsSpec` in
  `packages/docs/tools/details.js`), then `yarn details show <slug> --wait` with Bash `run_in_background: true`,
  and END THE TURN with the page's link pair (`yarn docs:link <page>`).  Owen's Send wakes the session with the
  answers as text (`.claude/skills/details/SKILL.md`;  write it as "Writing for Owen" there says)
- woken:  each answer is that item's pick ("Other" text and notes:  follow them;  unclear:  ask in chat), then
  step 4.  `discard` still gets its own "Throw away?" modal there.

Else (4 items or fewer), the modals:

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
  list at the end to paste, or to run `/worktrees` again from a session in the main checkout.
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

1. Run `spell dev stock --json` again.
2. One line per item whose group changed or that went away ("**worktree ui-import**:  dead -> gone"), then the three
   groups again, as in step 1.  Commands refused in step 4:  listed last, ready to paste.
3. Stop there:  no second "What's next?" unless Owen asks.
