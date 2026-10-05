---
name: bedtime
description: Work through an epic's remaining phases unattended overnight -- pick phases and answer questions up-front, then build each in order with a commit per phase, record judgement calls in the plan doc and an "Overnight" report section on top of it, never merge.  User-invoked as `/bedtime`;  in the morning, `/epic review <name>` goes through the night.
disable-model-invocation: true
---

# /bedtime

Owen is going to sleep.  Ask everything NOW, then run the chosen phases to the end without him.  The PLAN DOC is
the record:  every judgement call, problem and todo is an item in it, and an OVERNIGHT section on top of it says
what the night did.  In the morning, `/epic review <name>` goes through it, judgement calls first, and removes the
Overnight section once he has.

- `<name>`:  the plan doc's name.
- OVERNIGHT section:  `#overnight`, unnumbered, above the Overview, written ONLY by `yarn plan-doc overnight <name>
  start | phase | problem | done` (cheat sheet below).  TEMPORARY:  everything in it is also in the items or the
  log, so removing it loses nothing.
- Bedtime mode is on while the section says so:  `yarn plan-doc summary <name> --json` has `"overnight": "active"`.
  That's how a compacted session knows it's still running.
- Style:  as in `/epic`:  the plan doc written for Owen coming back cold (`plan-doc.md`, "Rules").

## 1. Find the phases

- Plan doc (`packages/docs/content/epics/<name>/`, or the one this session has been keeping):
  `yarn plan-doc summary <name> --json`.  To-do phases:  every one whose `status` isn't `done`.
- No plan doc (only a plan drafted in this session):  make one FIRST, as `/epic` does mid-session
  (`.claude/skills/epic/SKILL.md`, "Mid-session":  "make this a plan doc"), which isolates it too.  Its name
  question goes in step 2's modal or page.  The move to the worktree's window ends the turn;  the session picks up
  with `continue` in the new window, at step 2.
- No phases:  say so in one line and stop.
- In plan mode:  ask Owen to leave it (shift+tab) first, as in `.claude/skills/isolate/SKILL.md`, "Start", step 0.

## 2. Pick phases (modal, or one page with step 3)

More than fits ONE modal call (the phase pick plus step 3's questions, over 4 questions, or over 4 options in
one):  steps 2 and 3 go on ONE details page instead (Owen, 2026-10-03), so he answers everything in one sitting:
- the spec:  `where`:  the epic and what it's for, just now "about to run P<a>-P<b> overnight", decides "what I do
  while you sleep:  anything left open becomes a judgement call"
- questions:  `phases` (`multiple`, "All" `recommended`, then each to-do phase), "Isolate first?" when step 3 says
  so, then every real question of step 3, each with its options, one `recommended`
- `--epic <name>`, slug `bedtime-<date>`, so the page stays with the plan doc
- `yarn details new <slug> --from <spec.json>` (the spec in the scratchpad;  its shape:  `DetailsSpec` in
  `packages/docs/tools/details.js`), then `yarn details show <slug> --wait` with Bash `run_in_background: true`,
  and END THE TURN with the page's link pair (`yarn docs:link <page>`).  Owen's Send wakes the session with the
  answers as text (`.claude/skills/details/SKILL.md`;  write it as "Writing for Owen" there says)
- woken:  record the answers (step 3's "Record the answers"), then step 3's "Then" and on into the night.  The
  session must run unattended from here:  say so in the reply before ending the turn (auto mode or allow-rules)

Else, the modals:

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

Record the answers:  `yarn plan-doc decide <name> <Q id> ...` for the doc's questions, `add <name> decision ...`
for the rest.

Then:
- Isolate if chosen:  `.claude/skills/isolate/SKILL.md`, "Start" (step 0 too).
- `yarn plan-doc overnight <name> start "P<a>-P<b>" --branch <branch>`:  the Overnight section, and bedtime mode on.
- One line:  "Bedtime:  P<a>-P<b> in `<name>`, commits on branch `<branch>`.  Runs unattended only if permission
  prompts won't stop it (auto mode or allow-rules)."

## 4. Bedtime mode

Until the run ends (step 6), these OVERRIDE the root rules and memory:
- NO AskUserQuestion, no "should I go on?":  Owen's asleep and a question stalls the night.  Decide, record, go on.
- Commit after each phase without asking:  the `/bedtime` run is the ask.  Stage the phase's files by name, never
  `git add -A`.
- Don't stop between phases for review.
- NEVER merge into `main`, push, `/isolate done`, `ExitWorktree`, or delete anything outside the worktree.
  Something needing those:  `add <name> todo` and go on.

Owen writing in this session mid-run means he's awake:  bedtime mode ends there.  Say which phase it was on, run
step 6's "At the end" for what's done, and go back to the root rules.

Everything else stands:  `yarn vscode` after each stage, the parser speed test on parser changes, `agents/PAPERCUTS.md`,
`agents/SUSPECTED-BUGS.md`, `agents/CODE-DEBT.md`, the plan doc's rules.

## 5. Each phase, in plan order

1. `yarn plan-doc phase <name> <N> active`.
2. Do the work and run its verify and the touched packages' checks (`yarn ts`, `yarn test`).
3. JUDGEMENT CALL (a choice Owen might have made differently):  pick the option the plan and code best support,
   then record it, with the options and why:
   - `add <name> judgement "<the call>" --details "<p>chose ... over ... because ...</p><ul><li>options ...</li>
     </ul>"` -- it prints the id (`J4`):  the plan doc's "Judgement calls" section is where Owen finds them, open
     until he reviews each.  Then link it from the phase's body (hand-edited):
     `<ui-item icon="compass"><b>Judgement calls:</b>  <a href="#j4">J4</a> ...</ui-item>` after Goal / Files /
     Verify, one link per call.  Agents you start record theirs the same way (put the command in their prompt).
4. Checks fail and you can't fix them:
   - commit what's there as `WIP P<n>:  <name>`
   - `add <name> issue ...`, and `overnight <name> problem "P<n> WIP:  <what fails>  (I<k>)"`
   - go on only with later phases that don't build on this one;  skip the rest, saying why:
     `overnight <name> problem "P<m> skipped:  builds on WIP P<n>"`
5. `yarn plan-doc phase <name> <N> done --done "<ul>...</ul>"` (what was built, as `/epic` writes it;  not for a WIP
   phase:  it stays `active`).
6. `yarn plan-doc log <name> "P<n> done|WIP:  <what was built>;  checks:  <results>"`, BEFORE the commit so the line
   goes in with it.
7. Commit:  `P<n>:  <Name> -- <one-line summary>` (`WIP P<n>:  ...` for WIP).
8. `overnight <name> phase <N> "<hash>  <what was built>;  checks:  <results>;  J4, J5"`:  ids link to their items.
   It goes in with the next phase's commit (or step 6's).

## 6. At the end

- `overnight <name> done "<done / WIP / skipped counts>;  <n> judgement calls;  branch <branch>"`:  bedtime mode
  off.
- `yarn plan-doc check <name>`, commit what's uncommitted in the plan doc (`Bedtime:  overnight report`), then
  `yarn plan-doc open <name>`:  Owen wakes to the Overnight section on top.
- Final reply:  the summary, the judgement calls by phase (in words, ids after) and the problems, then ONE
  AskUserQuestion (Owen answers in the morning):  "Go through the night?", options "Review it now
  (Recommended)":  runs `/epic review <name>` (`.claude/skills/epic/SKILL.md`, "7. Review"), which starts with the
  Overnight section;  "Later":  `/epic review <name>` any time.
- Do NOT merge.

## Cheat sheet (`yarn plan-doc overnight <name> ...`)

```
start "P3-P6" [--branch b]     the Overnight section, above the Overview;  bedtime mode on;  logs "Bedtime started"
phase <N> "text"               a line under Phases (hash, what, checks, judgement ids)
problem "text"                 a line under Problems (WIP, skipped, a suspected bug)
done "summary"                 the run is over:  the summary replaces "Running ...";  bedtime mode off
remove                         gone through:  `/epic review` removes it
```
