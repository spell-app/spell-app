---
name: wtf
description: Remind Owen what's going on -- in THIS session, or (`/wtf <name>`) in the plan / isolate session named `<name>`:  the goal, where the work lives (worktree, branch), the plan doc and its phase, what's done, what's running, what's waiting on him -- with live links into the plan doc.  A `?` (`/wtf ?`, `/wtf <name>?`, or Owen typing `wtf?`) also puts the open questions in a modal.  Use for `/wtf`, or when Owen asks "where are we?", "what's going on?", "remind me what we're doing", "where is <name> at?".
argument-hint: "[<name>] [?]"
---

# /wtf

Owen has lost the thread:  hand it back in one screen.  Read-only -- change nothing, start nothing, commit nothing
(the one exception:  relaying his answers, step 4).

## 1. Arguments

- `$ARGUMENTS` holds an optional `<name>` and an optional `?` (alone, or stuck to the name:  `seo?`).
- `?`, or Owen typed `wtf?` without the slash:  ASK mode (step 4).
- No `<name>`:  THIS session.
- `<name>`:  the plan or isolate session of that name -- worktree `.claude/worktrees/<name>`, branch `<name>`, plan
  doc `packages/docs/plans/<name>/`, a session renamed `<name>`.  Nothing by that name:  say so in one line, list
  the names that do exist (worktrees, plan docs), stop.

## 2. Gather (in parallel where possible)

- The story so far:
  - this session:  the conversation itself
  - `<name>`:  `python3 .claude/skills/wtf/scripts/transcript.py --find <name>` (from the repo root) lists its
    sessions, newest first;  `transcript.py <id>` digests one:  Owen's prompts, its last reply, a question still
    waiting for an answer.  Several sessions:  digest the newest, mention the others.  Running or not:
    `python3 ~/.claude/skills/worktrees/scripts/worktrees.py`.
  - either way:  Owen's LAST stated intent (his words, not the plan's), what's been done, what was asked and not
    yet answered.
- Where:  in the session's checkout (`git -C .claude/worktrees/<name>` for `<name>`):  `git branch --show-current`,
  `git status --short`, `git log --oneline main..HEAD` (a worktree) or the session's own commits (`main`).
- Plan doc, if any:  the session's `/plan-doc <name>`, else a worktree name with `packages/docs/plans/<name>/`, else
  one the session wrote to.
  - `yarn plan-doc summary <name> --json`:  phases with status, next phase, open questions / issues / caveats / todos
  - its URL:  `yarn server url <ABSOLUTE path>`, run in the checkout the doc is in (a relative path resolves
    wrongly:  `SUSPECTED-BUGS.md`, "server")
- `/bedtime` run:  `MORNING-<name>.md` in the worktree.
- In flight:  `ListAgents` (agents this session started;  for `<name>`, whether its session is running),
  background shells, scheduled wakeups.

## 3. Reply

Plain words, no jargon;  coined names defined in a few words.  Every plan item named is a link:  the plan doc's
URL plus its id, lower-case (`<url>#p2`, `<url>#q1`, `<url>#i3`), text as the doc shows it (`P2 · Short Name`,
`Q1`).  Sections with nothing in them are left out.  For `<name>`, the first line says which session:  its name,
id, running / idle / waiting / not running.

1. **Goal** -- one or two sentences:  what Owen asked for, in his words.  If the work has drifted from his most
   recently stated intent, say how, in **bold**.
2. **Where** -- worktree and branch (or `main`), and what's uncommitted or staged.  The plan doc, linked.
3. **Plan** -- the phases as one line each, linked, with status:  done, ACTIVE, to do.
4. **Done** -- numbered, in the order it happened, each a few words.
5. **In flight** -- agents, background jobs, wakeups:  what each is doing.
6. **Waiting on you** -- numbered (Owen refers to them by number):  open questions (linked), a modal the session
   is sitting on, issues needing a call, staged work awaiting "commit?".
7. Last line:  where we are, as `/plan-doc` says it --
   "[P1 · Short Name](<url>#p1) complete.  Next is [P2 · Short Name](<url>#p2)." or "All done";
   without a plan doc, the same in words ("Skill edits staged.  Next is committing them.").

Not ASK mode:  stop here.

## 4. ASK mode (`?`)

- Nothing waiting on Owen:  add "Nothing to answer." and stop.
- Else, after the reply, AskUserQuestion with the questions from "Waiting on you" (4 per call, more calls if
  needed):  the plan doc's open questions with their options (labels as the doc's, recommended first), the
  session's waiting modal as it was asked, "commit?" for staged work.
- Answers:
  - this session:  act on them as if asked directly (`decide <name> Q<n> "..."` for plan questions).
  - `<name>`:  that session owns the work, so relay, don't act:  `SendMessage` to it (its name from `ListAgents`)
    with each question and Owen's answer.  Not running, or not in `ListAgents`:  give Owen the answers as one
    block to paste there, with `claude --resume <id>`.
