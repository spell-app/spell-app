---
name: epic
description: Run a planning session against a live plan doc, `packages/docs/content/epics/<name>/<name>.plan.html`, in its own worktree. Use for `/epic <name> [what to plan]` (name alone:  the plan comes in the next prompt), or when Owen says "make this a plan doc" / "turn this into a plan doc" about the work in the current session.  `/epic review [<name>]`:  open a plan doc in the side bar's Review tab, where Owen marks items on the page, and listen:  act on his marks (approvals, picks, todos), write details and replies in the background, talk revisits over ("review the seo epic", "go through unified-server's caveats").
argument-hint: <name> [what to plan] | review [<name>]
---

# /epic

An EPIC is a planning session and the work it plans;  its live record is the PLAN DOC.  (Was `/plan-doc` until
2026-10-02;  `yarn plan-doc` keeps its name, since it edits the plan doc.)

Plan, then build, in worktree `<name>`, keeping `packages/docs/content/epics/<name>/<name>.plan.html` (the PLAN DOC) current
the whole time.  The plan doc is the user's view of the work:  they read it in VS Code's doc preview (the right side bar's "Spell Docs" view) while you work.

- Rules for the doc (sections, ids, markers, prose):  `packages/docs/content/templates/epics/plan-doc.md`.  Read it first.
- Structured edits go through `yarn plan-doc <command> <name> ...` (cheat sheet below), never by hand.  Hand-edit only
  prose:  the summary, Overview, phase bodies, item details.
- Reload the plan doc whenever the session moves to a new stage (name -> worktree -> plan -> fill -> each phase ->
  doc review):  `yarn plan-doc open <name>` reloads it in the side bar's doc preview.  `yarn plan-doc phase` does it for you.
- Style, in the plan doc:  written for Owen coming back cold (`plan-doc.md`, "Rules"):  a plain lead sentence, then
  bullets (never a list run together in a sentence), full words, a concrete example for anything tricky, ids
  explained, and a **Net effect** list closing every question, issue, judgement call and decision.  NOT caveman
  (Owen, 2026-10-04).  Replies:  short, the same plain words.
- Naming a doc in a reply (the plan doc, a durable doc, any `packages/docs` page):  paste what
  `yarn docs:link <ABSOLUTE path> --hash <id> [--text "..."]`, run in the checkout the doc is in:  it prints
  the side bar link, then `(_browser_)` (`.claude/skills/details/SKILL.md`, "Links to pages").
  `--hash`:  the id of what you mean (`p2`, `q3`, `t4`).  A worktree's doc goes on the MAIN server when that one
  has the route, else the worktree's own.
- Phase complete:  the LAST line of that reply's text says where we are, each phase linked to its heading in the
  plan doc (`yarn docs:link <plan doc> --hash p1 --text "P1 · Short Name"`):
  - "<P1 link pair> complete.  Next is <P2 link pair>."
  - after the last phase:  "All done:  <P<N> · Doc Review link pair> complete."

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
  - `packages/docs/content/epics/<name>/`, `packages/docs/<name>/`, `packages/docs/<name>.html`
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
  shape;  explore only to fill gaps.  Decisions and questions already settled become `decision` items (questions
  born answered:  `Q7`).

## 2. Session:  stub doc, then move

All in the FIRST turn, in this order, then the turn ends.  Why:  the move to the worktree's window waits for the
turn to end, and the stub doc keeps the kickoff prompt safe whatever happens to this session.
0. Where:  isolate's "Start", step 2b, with `stay-check --epic`:  a new window, or stay in this one.
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

Staying in this window (step 0):  skip steps 4 and 6.  Step 5's `plan-doc open` shows the doc in THIS window's side
bar, at once.  Then go straight on to "3. Plan", in this turn;  no plan yet:  the last line asks for it, here.

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

- Name the harness plan file after the epic, so it traces back (Owen, 2026-10-04):  in `~/.claude/plans/`,
  `mv <file>.md epic-<name>--<file>.md`, then `ln -s epic-<name>--<file>.md <file>.md` (the harness still reads
  the old name).
- `yarn plan-doc add-phase <name> "Short Name" --goal "<ul><li>...</li></ul>" --files "..." --verify "..." --estimate
  "1-2h"` per phase, in order:  the goal one bullet per outcome, in Owen's terms;  the estimate becomes the title's
  badge, and the Overview's total (`p.plan-estimate`) follows by itself
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
   - found a problem:  `add ... issue`;  a limit we accept:  `add ... caveat`;  a choice:  `add ... decision` (a
     question born answered);  a choice made WITHOUT Owen (he is away, or an agent decided):  `add ... judgement`
     (ids `J1` ...;  see `/bedtime`)
   - items added while the phase is active carry it:  the phase's "To review" line (written by the script on every
     edit) lists the ones Owen hasn't reviewed.  Never hand-write a "Judgement calls:" line
   - something only Owen can check (a live window, a click, a look):  `add ... test "<step>" --details "<p>what
     should happen</p>"`, into "To test";  `close` it once he says it passed
   - fixed or done:  `close <name> <id>` (it stays, closed, NOT struck);  made moot by another decision:
     `cancel <name> <id> "why"` (struck through:  the one struck status, J16 of `review-review`)
   - an item talked through with Owen (he answered, accepted, or said leave it):  `review <name> <id> "outcome"`,
     so the next `/epic review` doesn't bring it up again ("7. Review")
   - changed a prose block:  put
     `<ui-message class="plan-update" state="warning" size="tiny" header="UPDATE" data-phase="N"><p>what changed</p></ui-message>`
     just before it (the script marks items itself)
3. Subagents:  paste the cheat sheet below into their prompts, with "record caveats, issues and decisions in the
   plan doc as you find them".
4. `yarn plan-doc phase <name> <N> done --done "<ul><li>...</li></ul>"` (drops that phase's UPDATE markers, writes
   its Done field, brings the doc forward), then `yarn plan-doc summary <name>`.  Done:  what was BUILT, ordered by
   what Owen asks about first:  where to see it, what changed in how he works, what's rough or not yet tried by hand.
   - commit messages, so the doc can list them (its phase's and items' "Commits"):  a phase `P<n>:  <Name> --
     <summary>` (`P4 + P5:` for two;  `WIP P3:` for a parked part), an item fix `Fix I3:  ...`
   - after the phase's commit:  `yarn plan-doc commits <name> --backfill` (its change goes in with the next commit)
5. Reply:  a short bulleted list (done, issues, caveats, next), the "complete.  Next is" line (see the top), THEN
   AskUserQuestion so the user picks without copying anything.  Options, most useful first:
   - "Start P<N+1> · <Name> (Recommended)"
   - the top open issue(s):  "Fix I<n>:  <title>"
   - a caveat or todo worth acting on now
   - "Stop here"
   Questions the user must answer also go in the doc (`add ... question`);  once answered,
   `decide <name> Q3 "what was decided"` (never `close`:  `decide` writes the answer INTO the question, D13 of
   `review-review`).
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
    doc's own card:  `yarn plan-doc` doesn't touch the index in a worktree (until now the main server added its
    card to the index's Epics section)
- The plan doc stays in `epics/` as the record:  every phase done.
- Changelog:  add the epic's entry to `packages/docs/content/changelog.html` ("Changelog" in the root's `AGENTS.md`), linking
  the plan doc and the durable doc;  under "3. Merged into main" if "Finish" below merges it, else "2. In worktrees".
- Then leave the worktree:  follow `.claude/skills/isolate/SKILL.md`, "Finish".  No move back:  the session and its
  plan doc stay in the window they're in.
- Last line of the reply:  "All done ..." (see the top).

## 7. Review:  `/epic review [<name>]`

Owen reviews ON THE PAGE:  the plan doc in the side bar's Review tab, where he marks items (each item's ⋯ menu:
Approve, Add to todo, Add Details, Revisit;  Choose on option cards) and sends them with the page header's paper
plane.  This session LISTENS:  it waits on the doc's review inbox and acts on what arrives -- mechanical marks at
once, Add Details and "revisit now" by background agents, "revisit soon" talked over in chat.  No modal walk through
items any more (epic `review-review`, 2026-10-04;  plan:  `epics/review-review/review-review.plan.html`, 1.1-1.2).

- Runs from ANY window, `main` or a worktree:  the prompt hook lets `/epic review` through, never renames the session.
  No worktree, no plan mode.
- Every `yarn plan-doc` command edits the epic's LIVE doc wherever it is (its worktree, else `main`).
- The page's controls need the PAGE SERVER of the checkout the doc lives in (`yarn server ensure` there):  from
  `file://`, or a server without the review routes, the page shows no menus.
- Owen comes to a review COLD:  never a bare id in chat, always what it is in words ("the highlight.js swap (T2)").

Commands, in the order a review uses them:
```
yarn plan-doc list --json                           every epic:  status, checkout, not reviewed / items
yarn plan-doc items <name> --json                   where reviews stand;  sections, items, states
yarn docs:link <ABS doc> --hash <id> --review --show   show the doc in the Review tab, at <id>;  prints its links
yarn plan-doc inbox <name> listen  /  unlisten      this session is (no longer) reviewing:  the page says so
yarn plan-doc inbox <name> wait                     Bash run_in_background:  exits with work (or 2:  timeout)
yarn plan-doc inbox <name> apply [ids]              approve / pick / todo marks into the doc;  prints what's left
yarn plan-doc inbox <name> working <id> on|off      the page's spinner on an item
yarn plan-doc details <name> <id> --file f [--append]   an item's details replaced (Add Details) / a reply appended
yarn plan-doc inbox <name> done <id>  /  clear <ids>    an item's request finished  /  marks dropped after a talk
yarn plan-doc inbox <name> [--json]                 what's waiting, sent or not
```

### 7.1 Pick a doc (no `<name>`)

- `yarn plan-doc list --json`:  `{ name, title, status, checkout, notReviewed, total }` each, in progress first.
- As reply text, every epic in two groups (in progress / done), most not-reviewed first:  `- commands (worktree
  commands)  5 / 9`.  Then ONE modal, header `Epic Review`, "Which epic do you want to review?":  the epics with
  anything not reviewed, label `<name> (in progress)` / `<name> (done)`, description `5 of 9 items not reviewed`;  4
  or fewer:  all;  more:  the next 2 then "More" (the next names) until 4 or fewer;  any other:  typed in Other.
- (The Review tab's own start page, "What would you like to review?", will replace this:  todo T1 of
  `review-review`.)

### 7.2 Start

1. `yarn plan-doc items <name> --json`;  the doc's summary for what the epic is.
2. In chat, three lines at most, for someone who remembers nothing:  what the epic is, what's waiting on him (e.g.
   "4 judgement calls not reviewed, 2 open questions"), and when he last reviewed it.
3. The FIRST thing worth his time:  the first item, in page order, whose state is `attention` (red:  an open
   question, an unreviewed judgement call or issue);  none:  the first `open` (blue) one;  none:  the top.
   `yarn docs:link <ABS doc> --hash <that id> --review --show`:  the doc opens in the Review tab, at it.
4. `yarn plan-doc inbox <name> listen`, then `yarn plan-doc inbox <name> wait` with Bash `run_in_background: true`.
5. END THE TURN, short:  "Mark items in the Review tab:  each item's ⋯ menu;  Add Details and revisit now start at
   once;  the paper plane sends the rest.  I'm listening."  Then the doc's link pair.

### 7.3 Woken:  the `wait` command finished

Read what it printed.  Then, in this order:
1. Exit 2 (timeout, nothing happened):  arm `wait` again, end the turn with one line ("still listening").
2. NOW requests (Add Details, revisit now) -- `wait` already marked them `working` (the page spins):  per item, a
   BACKGROUND `Agent` (`run_in_background: true`), each prompt:
   - which doc, which item (id, title), and the rules:  `plan-doc.md` "Rules" (cold reader, bullets, examples, Net
     effect)
   - Add Details:  read the item, the code and docs it names, then write its FULL details again, nothing lost,
     `yarn plan-doc details <name> <id> --file <html>`
   - revisit now:  answer Owen's note (quote it), in the reply block markup (`plan-doc.md`, "Reply"):  what he asked,
     the answer with evidence (real code, the command and its output), option cards when he must choose (he picks
     on the page), a Net effect;  `yarn plan-doc details <name> <id> --append --file <html>`.  With a pick ("picks B
     · ..., asks:  ..."):  answer about THAT option;  never decide the question (he confirms with a plain pick)
   - last:  `yarn plan-doc inbox <name> done <id>`
   Up to 5 agents at once (root rules);  more:  the rest after.
3. SENT marks:  `yarn plan-doc inbox <name> apply`:  approvals, picks and todos land in the doc (it prints each).
   Then each "to talk over" (revisit soon), one at a time, in chat:  the item in words, his note quoted, your
   answer (short;  evidence when it matters).  A choice he must make:  write it into the item as a reply with option
   cards (`details --append`) so he picks ON THE PAGE;  a quick yes / no:  a modal.  Done:  `inbox clear <id>` and
   `review <name> <id> "<outcome>"`.
   - "picks B · <card>, asks:  <note>" (a pick with a revisit, "B, but ..."):  `apply` leaves it;  answer the note
     about B, and once he agrees, `yarn plan-doc decide <name> <id> "<card title>" --option B` yourself
   - the page counts this session as gone once its heartbeat is 90s old:  `wait` stamps it every 30s, and so do
     `inbox apply`, `done`, `clear` and `working`;  a long talk without them shows "nobody is reviewing" until `wait`
     runs again
4. Arm `wait` again (always, unless he said stop), then reply:  what landed (bullets, items in words, ids after),
   what's being worked on in the background, what needs him;  the doc's link pair last.
- A background agent's own completion notice wakes the session too:  nothing to do but check `inbox` shows the item
  done;  don't re-arm a second `wait` while one runs (`inbox` would print both;  check the background tasks).

### 7.4 Finish

When Owen says he's done ("stop reviewing", "that's it"), or the session must stop:
- stop the waiter (`TaskStop`), `yarn plan-doc inbox <name> unlisten`
- `yarn plan-doc log <name> "Review:  <n> approved, <n> answered, <n> to todos, <n> details added"`
- reply:  what was decided and done (in words, ids after), what's still waiting on him;  the link pair
- committing the doc's changes:  in THIS checkout:  stage, then ask;  in another (`main` from a worktree, another
  epic's worktree):  say which checkout holds them, for Owen or that epic's session to commit

## Cheat sheet (`yarn plan-doc ...`, from anywhere in the repo)

```
new <name> [--title "Title"] [--prompt "..." | --prompt-file f]   create from the template, update the docs index
add-phase <name> "Short Name" [--goal ..] [--files ..] [--verify ..] [--estimate 2h]
estimate <name> <N> "1-2h"                          change a phase's estimate;  the Overview's total follows
phase <name> <N> todo|active|done [--no-open]       done drops UPDATE markers;  reloads the VS Code tab
add <name> question|judgement|caveat|issue|todo|test|decision "title" [--details "<p>html</p>"]   prints the id (C3)
decide <name> <Q id> "answer" [--details html]     answer a question, INTO it:  prints its id (Q3)
commit <name> <sha> --phase N | --item <id> "..."   list a commit under a phase or an item
commits <name> --backfill                           every phase / item commit in the doc's git history, once
close <name> <id>  /  reopen <name> <id>            close (done) / open again, never delete
cancel <name> <id> ["why"]                          made moot by another decision:  struck;  reopen undoes it
log <name> "text"                                   timestamped line in the doc's log
overnight <name> start|phase|problem|done|remove    a /bedtime run's report, on top of the doc (`/bedtime`)
prompt <name> "text" | --file f                     set the prompt quoted in the Overview
migrate <name>                                      an older doc (any layout) into the current one;  its D
                                                    items merge into its questions
summary <name> [--json]                             phases, next phase, open questions/issues/caveats/todos
check <name> [--no-browser]                         ids, links, phases, then the browser check
open <name>                                         show in VS Code's doc preview (right side bar)
review <name> <id> ["outcome"]                      mark reviewed today (outcome to the log)
defer <name> <id>                                   deferred:  dated, still not reviewed
queue <name> <id> "work"  /  unqueue <name> <id>    work a review decided on, waiting  /  started or dropped
items <name> --section s --spec <file>              a review's item picker, as a details page spec
items <name> [--section s] [--filter unreviewed|open|reviewed|queued|all] [--json]
                                                    where reviews stand, the to-do list, sections and items
list [--json]                                       every epic (main + worktrees):  status, not reviewed / all
backfill <name> | --all [--apply]                   one-off:  mark what past sessions show Owen went through
```
- Every command but `new` edits the epic's LIVE doc wherever it is:  its own worktree, else main, else any
  worktree (never the stale copy a worktree took of a merged epic).
