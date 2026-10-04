---
name: epic
description: Run a planning session against a live plan doc, `packages/docs/epics/<name>/<name>.html`, in its own worktree. Use for `/epic <name> [what to plan]` (name alone:  the plan comes in the next prompt), or when Owen says "make this a plan doc" / "turn this into a plan doc" about the work in the current session.  `/epic review [<name>]`:  walk a plan doc's open items with Owen, one at a time ("review the seo epic", "go through unified-server's caveats").
argument-hint: <name> [what to plan] | review [<name>]
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

- First word `review`:  NOT a new epic.  Go to "7. Review" and skip everything else here.  `review` is reserved:
  never an epic's name.
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
4. `yarn plan-doc open <name>`:  shown in VS Code's doc preview (the right side bar's "Spell Docs" view) of the
   window the session moves to, once it has (`yarn window`;  one tab, reloaded on every later `open`).  Needs the
   spell extension (`yarn vscode`).
5. Isolate "Start", steps 4-6:  the worktree's own window, `handoff <name> --prompt continue` (name alone, no plan
   yet:  no `--prompt`), END THE TURN.  Last line:  "moving to `<pkg> ⎇ <name>`:  press enter on `continue`
   there" (no plan yet:  "send the plan there").
6. Next turn, in the new window:  isolate's "Continue" step 1 (old tab), then "3. Plan".

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
  `<ui-section id="o1" header="1.1 ..." sticky collapsible dividing>`, `#o2` ... (a title with markup:  a
  `<span slot="header">` first inside instead of `header`;  sub-sub-items:  `<h4 id>`).  Code in folded
  `ui-accordion.spell-code`, digressions in collapsed `ui-accordion.spell-aside`, links to items and phases
  (`<a href="#d2">D2</a>`).  NEVER change an existing `id`.
- `yarn plan-doc check <name>`, then `yarn plan-doc open <name>` (new stage:  reload)

## 5. Each phase

1. `yarn plan-doc phase <name> <N> active`, and check the session's name (`.claude/skills/isolate/SKILL.md`,
   "Session name").
2. Do the work.  Record as you go, not at the end:
   - found a problem:  `add ... issue`;  a limit we accept:  `add ... caveat`;  a choice:  `add ... decision`
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

## 7. Review:  `/epic review [<name>]`

Walk a plan doc's open items with Owen:  pick a section, pick items, one item at a time.  FAST by default (the item
as clean bullets, one modal);  deeper only when he asks.  Plan:  `epics/epic-review/epic-review.html`.

> **MOCK (P1 of epic-review).**  Until `plan-doc` knows review state, the whole flow runs on CANNED data,
> `review-mock.json` beside this file:  `epics` for the doc list, `doc` for the doc (any name reviews it, titled as
> the name picked).  Write NOTHING:  no `plan-doc`, no files, no worktree, no handoff.  Keep the marks in the
> conversation, so they show when a list comes round again.  Say ONCE, in the first reply's text:  "Mock:  made-up
> data, every epic opens the same fake doc, nothing is saved."  Never in a modal.  Where a step would write, say in one italic line what
> it would do (`_would run:  plan-doc review mock I4 "accepted:  skip short sections"_`).  Explain further:  the
> explanation in chat, and a visual page only if Owen asks (say where it would go).

Words:
- OUTSTANDING:  open (or deferred), not reviewed.  REVIEWED:  marked reviewed, struck, decided, or linked from a
  decision.  QUEUED:  work a review decided on, not started yet.  DEFERRED:  skipped for now;  still outstanding.
- Sections:  Questions (open questions in "Questions & Decisions"), Issues, Caveats, Todos, To test.
- These words are the SKILL's.  Owen never sees "queue", "outstanding", "Start modal", "kickoff prompt" or "mock" in
  a modal.  Say "waiting to be done", "not reviewed yet", "pick a section", "a new window".

Every modal:
- header:  `Epic Review: <name>` (`Epic Review: commands`);  before an epic is picked, `Epic Review`.  Never a step
  name ("Queue", "Start").  The tool says headers are 12 characters at most, but takes longer ones.
- Owen comes to a review COLD:  he doesn't remember earlier reviews, or what an id means.  NEVER a bare id, in chat
  or a modal:  always what it is in words ("the highlight.js swap (T2)").  In a modal, the words alone.
- question:  one plain sentence, WITHOUT the epic's name (the header has it);  the context (lists, ids) goes in the
  chat text just before it.
- each option:  a short verb label;  its description says what happens NEXT, as Owen sees it ("Opens a new window
  to work on T2;  this review stops"), never which step of this skill runs.

### 7.1 Pick a doc (no `<name>`)

- FIRST, as reply text BEFORE the modal (never skip it:  Owen reads the list, then picks), every epic, in two
  groups, most not-reviewed first in each:
  ```
  **In progress** (phases left)          not reviewed / items
  - commands        (worktree commands)   5 / 9
  - epic-review     (worktree)            3 / 12

  **Done**
  - unified-server                        27 / 41
  - seo                                   15 / 38
  - ui-import                             12 / 30
  - cli-additions                          2 / 17
  - docs-workspace                         0 / 11
  ```
- THEN the modal, header `Epic Review`, nothing else in the question:  "Which epic do you want to review?"
  - epics with anything not reviewed, in the list's order;  label `<name> (in progress)` / `<name> (done)`,
    description `5 of 9 items not reviewed`
  - 4 or fewer left:  all of them.  More:  the next 2, then "More" (description:  the next names, `ui-import,
    cli-additions`);  "More" opens the same modal on the rest, 2 at a time + "More" until 4 or fewer are left
  - any epic, even one with nothing to review:  Owen can type its name in Other
- NEVER put mechanics in a modal (mock, canned data, "type in Other"):  say them in the chat text, once.

### 7.2 Start

- First, in chat, where things stand, for someone who remembers nothing:
  - reviewed before:  when, how much, what came of it.  "You last reviewed commands on Oct 2:  4 of 13 items gone
    through, 1 decision, 1 deferred."  Never reviewed:  "commands hasn't been reviewed yet:  13 items."
  - work an earlier review decided on, not done yet, each in words, its id after:
    ```
    That review also decided to do this, and it isn't done yet:
    - Swap the CDN highlight.js for <ui-code> on docs pages (T2).  Why:  ui-code already ships the languages.
    ```
- Work waiting:  then the modal "Start the work now, or review first?":
  - "Resume review (Recommended)" ("Start review" when never reviewed):  "The highlight.js swap waits on the to-do
    list.  Next you pick what to review."  -> the Start modal
  - "Start work":  "Opens a new window to swap highlight.js for ui-code.  This review stops until you run
    `/epic review commands` again."  Does:  a new worktree `<name>-fixes`, its own window, the waiting work as its
    kickoff prompt (`/isolate` "Start", steps 3-6);  ends the turn.
  - several waiting:  "the 3 waiting changes" in the descriptions, each listed in the chat text above
  - Why review first:  Owen came to review;  the work waits safely in the doc.
- Start modal:
  - first, in chat, every section with its counts, one line each:  `Issues · 3 of 5 not reviewed`,
    `Caveats · all 3 reviewed`;  sections with no items left out
  - question "What do you want to review?"
  - sections by most not reviewed, ties in page order:  label `Issues · 3/5`, description `3 not reviewed yet`.
    NEVER list item ids in a description.
  - "Finish Review" LAST, just above Other ("Wrap up:  a summary of what was decided")
  - 3 sections or fewer with items:  those, then Finish.  More:  the top 2, then "More…" with description
    `Todos 1/11 · To test 2/14` (the rest, `not reviewed/all`), then Finish;  "More…" opens the same modal with the
    rest (up to 3 sections, then Finish)

### 7.3 Section review

- In chat:  the section, its filter, then its items, deferred ones marked:
  ```
  Issues · 3 outstanding of 5  (showing:  outstanding)
  - I4  plan-doc check fails on a stub doc:  empty Phases can't stick
  - I5  yarn -s is not a yarn 4 flag
  - I3  Log timestamps use local time without a zone   (deferred 10-02)

  Which?  ids ("I4, I5") · go (all shown) · all · open · reviewed · queued · back
  ```
- Then END THE TURN:  Owen types the reply (a modal can't take a list of ids).  His reply:
  - ids:  those, in his order
  - `go` (or `.`):  every item shown
  - `all` / `open` / `reviewed` / `queued`:  this section again, that filter ("show all" works too)
  - `back`:  the Start modal
- Struck or decided items show only under `all` and `reviewed`.

### 7.4 Item review

Per picked item, in order:
1. In chat, short:  `**I4 · title**`, then its details as 2-5 clean bullets (Claude's words, nothing lost), then its
   state if not outstanding ("reviewed 10-01:  accepted").
2. Modal (multiSelect:  Explore + Explain further together is a deep dive), "I4:  what now?":
   - "Accept:  <recommendation>":  ONLY when the item already has one;  first
   - "Explore":  find other options now
   - "Explain further":  the full explanation now (real code, examples, a table);  a visual page when words won't do
   - "Defer":  dated, still outstanding;  next item
   - question text ends:  "type `exit` in Other to stop this section"
3. Explore / Explain further:  do it in chat, then a second modal:  up to 2 options, recommended first, then "Defer",
   then "Exit".
4. Record the answer AT ONCE, then the next item:
   - question -> `decide`;  issue -> close / to todo / queue;  caveat -> accept / to issue;  todo -> keep / close /
     queue / to phase;  test -> passed (`close`) / failed (an issue)
   - every answer also marks the item reviewed;  Defer marks it deferred
   - work to do (fix it, build it) is QUEUED, never done mid-review
5. `exit` / "Exit":  drop the rest of the picked items, back to 7.3 (same filter).  After the last item:  7.5.
- Picked combinations that clash (Accept + Defer):  Accept wins;  say so in one line.
- Visual page:  `epics/<name>/review/<id>.html` (git-ignored, on the template's assets), shown with
  `node scripts/window.mjs show <file>`;  `yarn plan-doc open <name>` once the item is done (the preview shows one
  doc).

### 7.5 Section done

- Summary line:  "Issues:  2 reviewed, 1 deferred, 1 to do".
- Work waiting:  list it in chat (as 7.2), then the modal "Do this now or keep planning?":
  - "Resume review (Recommended)":  "It waits on the to-do list.  Next you pick what to review."  -> Start modal
  - "Start work":  as 7.2's "Start work", same description
- Else:  the Start modal.

### 7.6 Finish Review

- A log line in the doc:  `Review:  7 items, 3 decisions, 2 deferred, 1 queued`.
- Reply:  what was decided, deferred, queued (ids linked to the doc), and the queue, which stays for next time.
- The doc on `main`:  stage, then ask before committing.  In a worktree:  leave it to that epic's session.
- End with `/epic review <name>` picks up where this stopped.

## Cheat sheet (`yarn plan-doc ...`, from anywhere in the repo)

```
new <name> [--title "Title"] [--prompt "..." | --prompt-file f]   create from the template, update the docs index
add-phase <name> "Short Name" [--goal ..] [--files ..] [--verify ..] [--estimate 2h]
estimate <name> <N> "1-2h"                          change a phase's estimate;  the Overview's total follows
phase <name> <N> todo|active|done [--no-open]       done drops UPDATE markers;  reloads the VS Code tab
add <name> question|caveat|issue|todo|test|decision "title" [--details "<p>html</p>"]   prints the id (C3)
decide <name> <Q id> "decision" [--details html]   answer a question:  prints the decision's id (D7)
close <name> <id>  /  reopen <name> <id>            strike / unstrike, never delete
log <name> "text"                                   timestamped line in the doc's log
prompt <name> "text" | --file f                     set the prompt quoted in the Overview
migrate <name>                                      an older doc (any layout) into the current one
summary <name> [--json]                             phases, next phase, open questions/issues/caveats/todos
check <name> [--no-browser]                         ids, links, phases, then the browser check
open <name>                                         show in VS Code's doc preview (right side bar)
review <name> <id> ["outcome"]                      mark reviewed today (outcome to the log)
defer <name> <id>                                   deferred:  dated, still not reviewed
queue <name> <id> "work"  /  unqueue <name> <id>    work a review decided on, waiting  /  started or dropped
items <name> [--section s] [--filter unreviewed|open|reviewed|queued|all] [--json]
                                                    where reviews stand, the to-do list, sections and items
list [--json]                                       every epic (main + worktrees):  status, not reviewed / all
backfill <name> | --all [--apply]                   one-off:  mark what past sessions show Owen went through
```
- `review` ... `items` edit the epic's LIVE doc wherever it is:  its own worktree, else main, else any worktree.
  Every other command:  this checkout's.
