---
name: bedtime
description: Work through the plan's remaining phases unattended overnight -- pick phases and answer questions up-front, then build each in order with a commit per phase, record judgement calls for the morning, never merge.  User-invoked as `/bedtime`;  `/wakeup` leaves bedtime mode.
disable-model-invocation: true
---

# /bedtime

Owen is going to sleep.  Ask everything NOW, then run the chosen phases to the end without him, and leave a
MORNING PLAN:  what was done, every judgement call, every problem.  `/wakeup` ends bedtime mode.

- `<name>`:  the plan doc's name if there is one, else the worktree / branch name.
- MORNING PLAN:  `MORNING-<name>.md` at the worktree root (gitignored, never committed).  Its first line is
  `<!-- bedtime: active -->` while the run goes on.  It's how a compacted session knows it's still in bedtime mode.
- Style:  caveman lite, as in `/plan-doc`.

## 1. Find the phases

- Plan doc (`packages/docs/plans/<name>/`, or the one this session has been keeping):
  `yarn plan-doc summary <name> --json`.  To-do phases:  every one whose `status` isn't `done`.
- No plan doc:  the phases of the plan this session drafted (harness plan file, conversation).
- No phases:  say so in one line and stop.
- In plan mode:  ask Owen to leave it (shift+tab) first, as in `.claude/skills/isolate/SKILL.md`, "Start", step 0.

## 2. Pick phases (modal)

- AskUserQuestion, `multiSelect`, "Which phases tonight?":
  - first option "All", then the to-do phases in order, labelled `P<n> · <Name>`
  - 4 options per question:  "All" + 3 phases in the first, 4 phases per question after (up to 4 questions);
    more than 15 phases:  Owen types a range in "Other" (`P5-P9`)
- "All", or nothing picked:  every to-do phase.  Run them in plan order, whatever order they were picked in.

## 3. Ask up-front (modal)

Read the chosen phases IN FULL (plan doc bodies, items, Overview) and the code they touch, enough to find what
would otherwise stop you mid-night.  Then ask, in one or more AskUserQuestion calls (4 questions each, recommended
option first):
- Not in a worktree (the session's folder isn't under `.claude/worktrees/`):  "Isolate first?", options
  "Isolate as `<proposed-name>` (Recommended)", "New branch here (`git switch -c`)", "Stop".  Never commit to `main`.
- How many agents may the work use:  ONLY if Owen said "watch token budget";  otherwise up to 5, unasked.
- Every real question:  ambiguous goals, choices between designs, anything a phase's text leaves open.  Ask
  generously -- this is the LAST chance;  a question asked now beats a judgement call made at 3am.

Record the answers:  plan doc `add <name> decision ...`;  else in the MORNING PLAN under "Decisions".

Then:
- Isolate if chosen:  `.claude/skills/isolate/SKILL.md`, "Start" (step 0 too).
- Write the MORNING PLAN skeleton (sections in step 6), `<!-- bedtime: active -->` first.
- One line:  "Bedtime:  P<a>-P<b> in `<name>`, commits on branch `<branch>`.  Runs unattended only if permission
  prompts won't stop it (auto mode or allow-rules)."

## 4. Bedtime mode

Until `/wakeup`, these OVERRIDE the root rules and memory:
- NO AskUserQuestion, no "should I go on?":  Owen's asleep and a question stalls the night.  Decide, record, go on.
- Commit after each phase without asking:  the `/bedtime` run is the ask.  Stage the phase's files by name, never
  `git add -A`.
- Don't stop between phases for review.
- NEVER merge into `main`, push, `/isolate done`, `ExitWorktree`, or delete anything outside the worktree.
  Something needing those:  record it as a todo (plan doc `add <name> todo`, and the MORNING PLAN's "Todos for
  Owen") and go on.

With a plan doc, it is the RECORD:  everything in the MORNING PLAN also goes into the doc (items or `log` lines),
so nothing is lost when the gitignored MORNING PLAN goes.

Everything else stands:  `yarn vscode` after each stage, the parser speed test on parser changes, `PAPERCUTS.md`,
`SUSPECTED-BUGS.md`, `CODE-DEBT.md`, the plan doc's rules.

## 5. Each phase, in plan order

1. Plan doc:  `yarn plan-doc phase <name> <N> active`.
2. Do the work and run its verify and the touched packages' checks (`yarn ts`, `yarn test`).
3. JUDGEMENT CALL (a choice Owen might have made differently):  pick the option the plan and code best support,
   then record it, with the options and why:
   - MORNING PLAN, under the phase in "Phases":  `J<k>` (numbered across the night), what, the choice, the
     alternatives
   - plan doc:  ALSO `add <name> todo "Review:  <the call>" --details "<p>chose ... over ... because ...</p>"`, so
     every call is an open todo there, and link it from the phase's body (hand-edited prose):  a
     `<li><b>Judgement calls:</b>  <a href="#t4">T4</a> ...</li>` after its Goal / Files / Verify, one link per
     call
4. Checks fail and you can't fix them:
   - commit what's there as `WIP P<n>:  <name>`
   - record an issue (plan doc `add ... issue`, and the MORNING PLAN's "Problems")
   - go on only with later phases that don't build on this one;  skip the rest, saying why
     (plan doc:  `log <name> "P<m> skipped:  builds on WIP P<n>"`, and the MORNING PLAN's "Problems")
5. Plan doc:  `yarn plan-doc phase <name> <N> done` (not for a WIP phase:  it stays `active`).
6. Plan doc:  `yarn plan-doc log <name> "P<n> done|WIP:  <what was built>;  checks:  <results>"`, BEFORE the commit
   so the line goes in with it.
7. Commit:  `P<n>:  <Name> -- <one-line summary>` (`WIP P<n>:  ...` for WIP).  Add the hash and the same one-line
   result to the MORNING PLAN.

## 6. Morning report

The MORNING PLAN's sections:
1. Summary:  phases done / skipped / WIP, branch, commits (`git log --oneline main..HEAD`)
2. Phases:  per phase, the hash, what was built, check results, then its judgement calls (`J<k>`:  the choice and
   the alternatives)
3. Problems:  failing checks, skipped phases and why, suspected bugs found
4. Decisions:  the up-front answers
5. Todos for Owen:  anything needing a merge, push, delete or decision

At the end:
- plan doc:  `log <name> "Bedtime done:  <done / WIP / skipped counts>"`, `yarn plan-doc check <name>`, commit
  any plan doc changes still uncommitted (`Bedtime:  morning log`), then `yarn plan-doc open <name>`
- link the MORNING PLAN in the reply (`[MORNING-<name>.md](MORNING-<name>.md)`), so Owen opens it with a click
- final reply:  the Summary, the judgement calls by phase (`J<k>`) and the problems, then ONE AskUserQuestion,
  "Dig into which?", options:  the top problems / judgement calls ("Look at J2:  ..."), "All fine".
  Owen answers in the morning.
- Do NOT merge.  Bedtime mode lasts until `/wakeup`.
