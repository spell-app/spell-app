---
name: epic
description: Run a planning session against a live plan doc, `packages/docs/epics/<name>/<name>.html`, in its own worktree. Use for `/epic <name> [what to plan]` (name alone:  the plan comes in the next prompt), or when Owen says "make this a plan doc" / "turn this into a plan doc" about the work in the current session.
argument-hint: <name> [what to plan]
---

# /epic

An EPIC is a planning session and the work it plans;  its live record is the PLAN DOC.  (Was `/plan-doc` until
2026-10-02;  `yarn plan-doc` keeps its name, since it edits the plan doc.)

Plan, then build, in worktree `<name>`, keeping `packages/docs/epics/<name>/<name>.html` (the PLAN DOC) current
the whole time.  The plan doc is the user's view of the work:  they read it in VS Code's doc preview (the right side bar's "Spell Docs" view) while you work.

- Rules for the doc (sections, ids, markers, prose):  `packages/docs/templates/epics/plan-doc.md`.  Read it first.
- Structured edits go through `yarn plan-doc <command> <name> ...` (cheat sheet below), never by hand.  Hand-edit only
  prose:  the summary, Overview, phase bodies, item details.
- Reload the plan doc whenever the session moves to a new stage (name -> worktree -> plan -> fill -> each phase ->
  doc review):  `yarn plan-doc open <name>` reloads it in the side bar's doc preview.  `yarn plan-doc phase` does it for you.
- Style, in replies, the plan and the doc:  caveman lite.  Drop filler and articles where they don't help, fragments
  OK, a full sentence where a fragment would be ambiguous, identifiers exact.  Lists bulleted, or numbered when
  order or reference matters.
- Naming a doc in a reply (the plan doc, a durable doc, any `packages/docs` page):  link it on the page server,
  `[<name>](<url>)`, `<url>` from `yarn server url <ABSOLUTE path>` run in the checkout the doc is in (a relative
  path resolves wrongly).  A worktree's doc gets the MAIN server's URL (`/worktrees/<name>/...`) when that one runs;
  else the worktree's own server's.
- Phase complete:  the LAST line of that reply's text says where we are, each phase linked to its heading in the
  plan doc (`<url>#p1`):
  - "[P1 · Short Name](<url>#p1) complete.  Next is [P2 · Short Name](<url>#p2)."
  - after the last phase:  "All done:  [P<N> · Doc Review](<url>#p<N>) complete."

## 1. Name

- `<name>` is the first word of `$ARGUMENTS` (or a quoted phrase:  `"Docs Index"`), lower-kebab-cased
  (`Docs Index` -> `docs-index`).  The rest, if any, is the plan:  the prompt that kicks it off.  No argument:  ask
  for a name.
  - "Make this a plan doc" (invoked mid-session):  propose a name from the work so far in AskUserQuestion,
    recommended first;  the user can type another in "Other".
- Checks and rename, BEFORE anything else:  as `.claude/skills/isolate/SKILL.md` "Start", step 0.  A typed
  `/epic <name> ...` got them from the repo's `UserPromptSubmit` hook (`.claude/hooks/prompt-gate.mjs`):  it
  renamed the session `<name>`, or blocked the prompt (plan mode, another worktree) and saved its text.
- The kickoff prompt, SAFE before anything else:  the text after `<name>`, verbatim.  Write it to
  `~/.spell/prompts/<name>.md` at once (as the hook does when it blocks;  an older, different file there:  rename
  it `<name>.<time>.md` first).  No text, but that file exists:  it IS the kickoff prompt (the hook saved it);  say
  so in one line.  Delete the file only once the plan doc holds it (`plan-doc new --prompt-file`).
- Look for collisions (from the repo root), every time:
  - `packages/docs/epics/<name>/`, `packages/docs/<name>/`, `packages/docs/<name>.html`
  - the worktree and branch checks of `.claude/skills/isolate/SKILL.md`, "Start", step 2
  - any hit:  AskUserQuestion, options "Reuse `<name>`" (continue that doc / worktree) and "Different name" (the
    user types it in "Other").  Never overwrite an existing plan doc.
- Name and nothing after it, nothing saved (and not mid-session):  the user sends the plan in the NEXT prompt, in
  the new window.  Do "2. Session" now anyway (a stub doc with no prompt, then the move);  its last line asks for
  the plan.  That next message is the kickoff prompt:  `yarn plan-doc prompt <name> --file <file>` first, then
  "3. Plan".

## Mid-session

When the session already has work under way ("make this a plan doc"), carry it over -- don't start again:
- Plan mode and edits already made on `main`:  `.claude/skills/isolate/SKILL.md`, "Start", step 0.
- Step 3:  start from the plan drafted so far (harness plan file, conversation), reshaped into the plan doc's
  shape;  explore only to fill gaps.  Decisions and questions already settled become `decision` items.

## 2. Session:  stub doc, then move

All in the FIRST turn, in this order, then the turn ends.  Why:  the move to the worktree's window waits for the
turn to end, and the stub doc keeps the kickoff prompt safe whatever happens to this session.
1. Isolate:  read `.claude/skills/isolate/SKILL.md` and follow "Start", step 3 (and step 0 mid-session), with this
   `<name>` (a skill can't invoke another):  `EnterWorktree`.
2. `yarn install` in the worktree (a few seconds:  `yarn plan-doc` needs it).
3. The STUB doc:  `yarn plan-doc new <name> --title "<Title>" --prompt-file ~/.spell/prompts/<name>.md` (no file:
   no `--prompt-file`).  Quoted at the top of the Overview, and in the "Plan hung?" notice above it (copy button,
   restart steps;  it goes once P1 starts).  Then delete the prompt file.
   - Reusing a doc:  its prompt missing:  `yarn plan-doc prompt <name> --file <file>`;  an older doc (before
     2026-10-01, or `section.s2` markup):  `yarn plan-doc migrate <name>` first.  No phases yet:  a restart after
     a hang.  Plan again from its prompt ("3. Plan");  explore only what the doc doesn't say.
4. Isolate "Start", steps 4-5:  the worktree's own window, then `handoff <name> --prompt continue` (name alone, no
   plan yet:  no `--prompt`).
5. `yarn plan-doc open <name>`, AFTER the handoff:  shown in VS Code's doc preview (the right side bar's "Spell
   Docs" view) of the window the session moves to, once it has (one tab, reloaded on every later `open`).  Needs
   the spell extension (`yarn vscode`).
   - MUST print "... shows in ... once this session moves there".  Why:  only a PENDING move defers it;  before
     the handoff it shows in THIS window's side bar, the one being left.
6. Isolate "Start", step 6:  END THE TURN.  Last line:  "moving to `<pkg> ⎇ <name>`:  press enter on `continue`
   there" (no plan yet:  "send the plan there").
7. Next turn, in the new window:  isolate's "Continue" step 1 (old tab), then "3. Plan".

## 3. Plan

1. Explore (read-only), BEFORE plan mode.  NEVER `EnterPlanMode` before "2. Session" is done:  plan mode can't
   make the worktree or the doc.
2. Minimal plan doc, BEFORE presenting the plan:  only the Overview and the open questions, so the user can read
   them in the doc while the plan is up.  Nothing else yet (no phases, decisions, caveats ...).
   - Hand-write the Overview's sub-sections (shape:  "4. Fill the doc").
   - `yarn plan-doc add <name> question "title" --details "..."` per open question, explained with examples
     ("5. Each phase", item 6).  Agents:  up to 5, don't ask -- unless the user said "watch token
     budget", then one question is "How many agents can I use for this?".
   - `yarn plan-doc check <name>`, then `yarn plan-doc open <name>`.
   - Why here:  plan mode allows editing ONLY the harness plan file.
3. `EnterPlanMode`.  Draft the plan in the harness plan file, in the plan doc's shape:
   1. Summary:  2 sentences
   2. Phases:  `P1 · Short Name`, 2-4 words each, so "start P2" is unambiguous;  each with goal, files, verify,
      estimate (wall-clock for Claude, agents included, review not:  `30m`, `2h`, `1-2h`).  The LAST phase is
      always `Doc Review`.
   3. Overview:  the total estimate, then numbered sections (structure, code, flows):  what will become durable
      docs
   4. Caveats, issues, todos, decisions (what + why), open questions (the doc's ids:  `Q1` ...)
4. Ask the open questions with AskUserQuestion (labels matching the doc's) before ExitPlanMode.

## 4. Fill the doc (right after ExitPlanMode is approved)

- `yarn plan-doc add-phase <name> "Short Name" --goal "..." --files "..." --verify "..." --estimate "1-2h"` per
  phase, in order:  the Overview's total (`p.plan-estimate`) follows by itself
- `yarn plan-doc add <name> decision|caveat|issue|todo|question "title" [--details "<p>...</p>"]` per item
- Questions answered in "3. Plan", the agents one included:  `decide <name> Q<n> "..."`
- Hand-write `p.plan-summary`;  bring the Overview (written in "3. Plan") in line with the approved plan, nested in
  `#overview`:
  `<ui-section id="o1" header="1.1 ..." sticky collapsible dividing collapsed>`, `#o2` ... (a title with markup:  a
  `<span slot="header">` first inside instead of `header`;  sub-sub-items:  `<h4 id>`).  Code in folded
  `ui-accordion.spell-code`, digressions in collapsed `ui-accordion.spell-aside`, links to items and phases
  (`<a href="#d2">D2</a>`).  NEVER change an existing `id`.
- `yarn plan-doc check <name>`, then `yarn plan-doc open <name>` (new stage:  reload)

## 5. Each phase

1. `yarn plan-doc phase <name> <N> active`, and check the session's name (`.claude/skills/isolate/SKILL.md`,
   "Session name").
2. Do the work.  Record as you go, not at the end:
   - found a problem:  `add ... issue`;  a limit we accept:  `add ... caveat`;  a choice:  `add ... decision`;  a
     choice made WITHOUT Owen (he is away, or an agent decided):  `add ... judgement` (ids `J1` ...;  see `/bedtime`)
   - something only Owen can check (a live window, a click, a look):  `add ... test "<step>" --details "<p>what
     should happen</p>"`, into "To test";  `close` it once he says it passed
   - fixed or obsolete:  `close <name> <id>` (it stays, struck through)
   - changed a prose block:  put
     `<ui-message class="plan-update" state="warning" size="tiny" header="UPDATE" data-phase="N"><p>what changed</p></ui-message>`
     just before it (the script marks items itself)
3. Subagents:  paste the cheat sheet below into their prompts, with "record caveats, issues and decisions in the
   plan doc as you find them".
4. `yarn plan-doc phase <name> <N> done` (drops that phase's UPDATE markers, reloads the tab), then
   `yarn plan-doc summary <name>`.
5. Reply:  a short bulleted list (done, issues, caveats, next), the "complete.  Next is" line (see the top), THEN
   AskUserQuestion so the user picks without copying anything.  Options, most useful first:
   - "Start P<N+1> · <Name> (Recommended)"
   - the top open issue(s):  "Fix I<n>:  <title>"
   - a caveat or todo worth acting on now
   - "Stop here"
   Questions the user must answer also go in the doc (`add ... question`);  once answered,
   `decide <name> Q3 "what was decided"` (never `close`:  `decide` records the answer beside the question).
6. Explain every question and every issue the user must weigh in on WITH EXAMPLES, in the doc (rules:
   `plan-doc.md`, "Explaining a question or issue"), so the user can decide from the doc alone:  define each coined
   word in plain language ("stacking", "nudge"), show the real code / markup it's about, compare many values in a
   table, put the options side by side with one recommended, and add a LIVE example when the doc's widgets can show
   it.  Then ask, with option labels that match the doc's.

## 6. Doc Review (last phase)

- Prune:  close stale items;  make the summary and Overview true to what was BUILT.
- "To test":  every hand check the work needs before merging is there, each a step and what should happen;  list
  the open ones in the reply, as bullets.
- Turn it into durable docs:  `yarn docs:new durable <page> --title "..."` (fixes asset paths for the depth):
  - one page:  `packages/docs/<name>.html`;  several files (pages, experiments):
    `packages/docs/<name>/<name>.html`
  - from the plan doc:  Overview -> the body;  decisions -> a "Why" section;  open caveats -> "Limits"
  - finish as in `packages/docs/AGENTS.md`, "Finishing a page";  `yarn docs:index`, which also adds the plan
    doc's own card:  `yarn plan-doc` doesn't touch the index in a worktree (until now the main server listed it
    under "Running epics")
- The plan doc stays in `epics/` as the record:  every phase done.
- Changelog:  add the epic's entry to `packages/docs/changelog.html` ("Changelog" in the root's `AGENTS.md`), linking
  the plan doc and the durable doc;  under "3. Merged into main" if "Finish" below merges it, else "2. In worktrees".
- Then leave the worktree:  follow `.claude/skills/isolate/SKILL.md`, "Finish".  Right after its step 4
  (`handoff --back`), still in the worktree:  `yarn plan-doc open <name>` one last time, so the doc follows the
  session back to its package's window (the worktree's window closes).
- Last line of the reply:  "All done ..." (see the top).

## Cheat sheet (`yarn plan-doc ...`, from anywhere in the repo)

```
new <name> [--title "Title"] [--prompt "..." | --prompt-file f]   create from the template, update the docs index
add-phase <name> "Short Name" [--goal ..] [--files ..] [--verify ..] [--estimate 2h]
estimate <name> <N> "1-2h"                          change a phase's estimate;  the Overview's total follows
phase <name> <N> todo|active|done [--no-open]       done drops UPDATE markers;  reloads the VS Code tab
add <name> question|judgement|caveat|issue|todo|test|decision "title" [--details "<p>html</p>"]   prints the id (C3)
decide <name> <Q id> "decision" [--details html]   answer a question:  prints the decision's id (D7)
close <name> <id>  /  reopen <name> <id>            strike / unstrike, never delete
log <name> "text"                                   timestamped line in the doc's log
prompt <name> "text" | --file f                     set the prompt quoted in the Overview
migrate <name>                                      an older doc (any layout) into the current one
summary <name> [--json]                             phases, next phase, open questions/issues/caveats/todos
check <name> [--no-browser]                         ids, links, phases, then the browser check
open <name>                                         show in VS Code's doc preview (right side bar)
```
