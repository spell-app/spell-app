---
name: bedtime
description: Work through an epic's remaining phases unattended overnight -- pick phases and answer questions up-front, then build each in order with a commit per phase, record judgement calls in the plan doc, never merge.  User-invoked as `/bedtime`;  in the morning, `/epic review <name>` goes through the night.
disable-model-invocation: true
---

# /bedtime

Owen is going to sleep.  Ask everything NOW, then get it all done:  run the chosen phases to the end without him.
The PLAN DOC is the record, as on any day:  every judgement call, problem and todo is an item in it, each phase gets
its Done list and Commits, and the night's judgement calls and issues show RED there until he reviews them.  So no
morning report (D5 of `review-review`):  in the morning, `/epic review <name>` goes through what's red.

- `<name>`:  the plan doc's name.
- Bedtime mode:  `spell dev plan-doc bedtime <name> start "P<a>-P<b>"` turns it on, `... done "<summary>"` off (both go
  in the log).  While it's on, every item a command touches is marked the night's:  green until reviewed (D2),
  unless it waits on Owen (an open judgement call or issue:  red beats green).  And
  `spell dev plan-doc summary <name> --json` has `"bedtime": "P<a>-P<b>"` (`null` when off):  that's how a compacted
  session knows it's still running.
- Style:  as in `/epic`:  the plan doc written for Owen coming back cold (`plan-doc.md`, "Rules").

## 1. Find the phases

- Plan doc (`epics/<name>/`, or the one this session has been keeping):
  `spell dev plan-doc summary <name> --json`.  To-do phases:  every one whose `status` isn't `done`.
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
- `spell dev details new <slug> --from <spec.json>` (the spec in the scratchpad;  its shape:  `DetailsSpec` in
  `packages/docs/tools/details.js`), then `spell dev details show <slug> --wait` with Bash `run_in_background: true`,
  and END THE TURN with the page's link pair (`spell dev docs link <page>`).  Owen's Send wakes the session with the
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

Record the answers:  `spell dev plan-doc decide <name> <Q id> ...` for the doc's questions, `add <name> decision ...`
for the rest.

Then:
- Isolate if chosen:  `.claude/skills/isolate/SKILL.md`, "Start" (step 0 too).
- `spell dev plan-doc bedtime <name> start "P<a>-P<b>"`:  bedtime mode on.
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

Everything else stands:  `spell dev vscode` after each stage, the parser speed test on parser changes, `agents/PAPERCUTS.md`,
`agents/SUSPECTED-BUGS.md`, `agents/CODE-DEBT.md`, the plan doc's rules.

## 5. Each phase, in plan order

1. `spell dev plan-doc phase <name> <N> active`.
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
   - `add <name> issue "P<n> WIP:  <what fails>" ...`:  red in the doc until Owen reviews it
   - go on only with later phases that don't build on this one;  skip the rest, saying why in the skipped phase's
     log line:  `log <name> "P<m> skipped:  builds on WIP P<n> (I<k>)"`
5. `spell dev plan-doc phase <name> <N> done --done "<ul>...</ul>"` (what was built, as `/epic` writes it;  not for a WIP
   phase:  it stays `active`).
6. `spell dev plan-doc log <name> "P<n> done|WIP:  <what was built>;  checks:  <results>;  J4, J5"`, ids its
   judgement calls.
7. Commit:  `P<n>:  <Name> -- <one-line summary>` (`WIP P<n>:  ...` for WIP;  an item fix `<name> I3:  ...`).  The
   plan doc is never in it:  shared content (`epics/`, a link into `../spell-app-dev`), committed
   for you at the turn's end.
8. `spell dev plan-doc commit <name> <sha> --phase <N> "<what was built>"`:  the commit under the phase's Commits.

## 6. At the end

- `spell dev plan-doc bedtime <name> done "<done / WIP / skipped counts>;  <n> judgement calls;  branch <branch>"`:
  bedtime mode off.
- `spell dev plan-doc check <name>`, then `spell dev plan-doc open <name>`:  Owen wakes to the doc, the night's calls
  and issues red.  Nothing to commit for the doc (shared content, committed for you).
- Final reply:  the summary, the judgement calls by phase (in words, ids after) and the problems, then ONE
  AskUserQuestion (Owen answers in the morning):  "Go through the night?", options "Review it now
  (Recommended)":  runs `/epic review <name>` (`.claude/skills/epic/SKILL.md`, "7. Review"), judgement calls
  first;  "Later":  `/epic review <name>` any time.
- Do NOT merge.

## Cheat sheet (`spell dev plan-doc ... <name>`)

```
bedtime <name> start "P3-P6"            bedtime mode on;  logs "Bedtime started"
phase <name> <N> active|done            each phase;  done --done "<ul>...</ul>" writes its Done list
add <name> judgement|issue|todo ...     every call, problem, loose end:  an item (calls and issues red)
commit <name> <sha> --phase <N> "..."   the phase's commit, under its Commits
log <name> "P<n> done|WIP|skipped ..."  what happened, timestamped
bedtime <name> done "summary"           bedtime mode off;  logs "Bedtime done"
```
