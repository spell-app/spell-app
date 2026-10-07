---
name: epic
description: Run a planning session against a live plan doc, `epics/<name>/<name>.plan.html`, in its own worktree. Use for `/epic <name> [what to plan]` (name alone:  the plan comes in the next prompt), or when Owen says "make this a plan doc" / "turn this into a plan doc" about the work in the current session.  `/epic review [<name>]`:  open a plan doc in the side bar's Review tab, where Owen marks items on the page, and listen:  act on his marks (approvals, picks, todos), write details and replies in the background, talk revisits over ("review the seo epic", "go through unified-server's caveats").  `/epic resume [<name>]`:  pick an epic back up in a new session, in the right worktree and window, where its plan doc says it stopped ("resume the seo epic", "carry on with windows-and-review").  `/epic future <name> [idea]`:  write an idea down as a FUTURE epic, not planned yet:  a stub plan doc and an analysis page of its high-level open questions, answered in the Review tab;  no worktree ("save this as a future epic", "an epic for later").
argument-hint: <name> [what to plan] | review [<name>] | resume [<name>] | future <name> [idea] | color <look>
---

# /epic

An EPIC is a planning session and the work it plans;  its live record is the PLAN DOC.  (Was `/plan-doc` until
2026-10-02;  its tool keeps that name, `spell dev plan-doc`, since it edits the plan doc.)

Plan, then build, in worktree `<name>`, keeping `epics/<name>/<name>.plan.html` (the PLAN DOC) current
the whole time.  The plan doc is the user's view of the work:  they read it in VS Code's doc preview (the right side bar's "Spell Docs" view) while you work.

- Shared content:  the plan doc lives in `epics/`, which spell-app doesn't track:  in every
  checkout it's a link into ONE shared repo, `../spell-app-dev` (epic `shared-content`, 2026-10-04).
  - So there is ONE plan doc:  `main` and every worktree see each edit at once;  it never conflicts on merge.
  - Committed for you after every turn (the `Stop` hook `.claude/hooks/shared-commit.mjs`).  NEVER commit, stage,
    `git checkout --` or `git restore` it (or the changelog, the docs index, a details page) in spell-app.
- Rules for the doc (sections, ids, markers, prose):  `templates/epics/plan-doc.md`.  Read it first.
- Structured edits go through `spell dev plan-doc <command> <name> ...` (cheat sheet below), never by hand.  Hand-edit only
  prose:  the summary, Overview, phase bodies, item details.
  - A plan doc is SPLIT (P3 of `claude-design`;  new docs start so):  the skeleton `epics/<name>/<name>.plan.html` keeps
    the summary, the kickoff prompt and every section, phase and item line;  each BODY is a part file,
    `epics/<name>/parts/<id>.htm`, `<id>` its section's or item's:  `o3.htm` (Overview 1.3), `p2.htm` (phase 2's
    Goal / Done / Files / Verify), `q7.htm` (Q7's details), `log.htm`.  Edit a body's prose in ITS part file, at its
    real path (`/Users/owen/www/spell-app/spell-app-dev/epics/<name>/parts/<id>.htm`).  Its relative links are
    relative to `parts/` (one `../` more than the skeleton's).
  - A new Overview sub-section:  write it whole into the skeleton, inside `#overview`;  the next `plan-doc` command
    moves its body into `parts/<id>.htm`.  Nothing is dropped:  content beside a part is kept, after the part's.
  - `plan-doc.md`, "Parts", has the rules;  `plan-doc split <name>` / `join <name>` switch a doc's shape.
- Reload the plan doc whenever the session moves to a new stage (name -> worktree -> plan -> fill -> each phase ->
  doc review):  `spell dev plan-doc open <name>` reloads it in the side bar's doc preview.  `spell dev plan-doc phase` does it for you.
- Style, in the plan doc:  written for Owen coming back cold (`plan-doc.md`, "Rules"):  a plain lead sentence, then
  bullets (never a list run together in a sentence), full words, a concrete example for anything tricky, ids
  explained, and a **Net effect** list closing every question, issue, judgement call and decision.  NOT caveman
  (Owen, 2026-10-04).  Replies:  short, the same plain words.
- Naming a doc in a reply (the plan doc, a durable doc, any `packages/docs` page):  paste what
  `spell dev docs link <ABSOLUTE path> --hash <id> [--text "..."]`, run in the checkout the doc is in:  it prints
  the side bar link, then `(_browser_)` (`.claude/skills/details/SKILL.md`, "Links to pages").
  `--hash`:  the id of what you mean (`p2`, `q3`, `t4`).  A worktree's doc goes on the MAIN server when that one
  has the route, else the worktree's own.
- Phase complete:  the LAST line of that reply's text says where we are, each phase linked to its heading in the
  plan doc (`spell dev docs link <plan doc> --hash p1 --text "P1 · Short Name"`):
  - "<P1 link pair> complete.  Next is <P2 link pair>."
  - after the last phase:  "All done:  <P<N> · Doc Review link pair> complete."

## 1. Name

- First word `review`:  NOT a new epic.  Go to "7. Review" and skip everything else here.  `review` is reserved:
  never an epic's name.
- First word `resume`:  NOT a new epic either.  Go to "8. Resume".  Reserved too.
- First word `color`:  `/epic color <look>` recolours the window it's typed in:  `spell dev window color <look>`
  (no look:  it lists the 12), one line saying so, and nothing else.  Reserved too.
- First word `future`:  `/epic future <name> [text]` writes an idea down as a FUTURE epic, not planned yet:  go to
  "9. Future".  Reserved too.
- `<name>` is the first word of `$ARGUMENTS` (or a quoted phrase:  `"Docs Index"`), lower-kebab-cased
  (`Docs Index` -> `docs-index`).  The rest, if any, is the plan:  the prompt that kicks it off.  No argument:  ask
  for a name.
  - a look right after the name (`/epic new-thing -purple`, one of `spell dev window color`'s 12):  the window's
    colour, NOT the plan's:  `open <name> --color purple` in "2. Session" (or `color purple` when staying);  the
    prompt hook leaves it out of the text it saves (epic `windows-and-review` P5)
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
  - `epics/<name>/`, `guides/<name>/`, `guides/<name>.html`
  - the worktree and branch checks of `.claude/skills/isolate/SKILL.md`, "Start", step 2
  - any hit:  AskUserQuestion, options "Reuse `<name>`" (continue that doc / worktree) and "Different name" (the
    user types it in "Other").  Never overwrite an existing plan doc.
  - a FUTURE epic's doc (`plan-doc list --json`:  `status` `future`;  "9. Future"):  no modal, it's waiting to be
    planned:  say so in one line, then go on.  In "2. Session", step 3, `plan-doc new <name>` PROMOTES it where it
    is (its prompt, decided questions and analysis page kept;  the meta lines name the branch and worktree):  no
    `--prompt-file`.  "3. Plan" starts from its kickoff prompt, its decided questions and its analysis page
    (`epics/<name>/details/analysis.html`, answers in `spell dev details answer <name>/analysis`)
- Name and nothing after it, nothing saved (and not mid-session):  the user sends the plan in the NEXT prompt, in
  the new window.  Do "2. Session" now anyway (a stub doc with no prompt, then the move);  its last line asks for
  the plan.  That next message is the kickoff prompt:  `spell dev plan-doc prompt <name> --file <file>` first, then
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
2. `yarn install` in the worktree (a few seconds:  the work needs it;  `spell dev plan-doc` doesn't, it runs the MAIN
   checkout's CLI).
3. The STUB doc:  `spell dev plan-doc new <name> --title "<Title>" --prompt-file ~/.spell/prompts/<name>.md` (no file:
   no `--prompt-file`).  Quoted at the top of the Overview, and in the "Plan hung?" notice above it (copy button,
   restart steps;  it goes once P1 starts).  Then delete the prompt file.
   - Reusing a doc:  its prompt missing:  `spell dev plan-doc prompt <name> --file <file>`;  an older doc (before
     2026-10-01, or `section.s2` markup):  `spell dev plan-doc migrate <name>` first.  No phases yet:  a restart after
     a hang.  Plan again from its prompt ("3. Plan");  explore only what the doc doesn't say.
4. Isolate "Start", steps 4-5:  the worktree's own window, then `handoff <name> --prompt continue` (name alone, no
   plan yet:  no `--prompt`).
5. `spell dev plan-doc open <name>`, AFTER the handoff:  shown in VS Code's doc preview (the right side bar's "Spell
   Docs" view) of the window the session moves to, once it has (one tab, reloaded on every later `open`).  Needs
   the spell extension (`spell dev vscode`).
   - MUST print "... shows in ... once this session moves there".  Why:  only a PENDING move defers it;  before
     the handoff it shows in THIS window's side bar, the one being left.
6. Isolate "Start", step 6:  END THE TURN.  Last line:  "moving to `⎇ <name>`:  press enter on `continue`
   there" (no plan yet:  "send the plan there").
7. Next turn, in the new window:  isolate's "Continue" step 1 (old tab), then "3. Plan".

Staying in this window (step 0):  skip steps 4 and 6;  `spell dev window stay <name>` instead (the window titled
`⎇ <name>`, tinted;  isolate's "Stay", step 0).  Step 5's `plan-doc open` shows the doc in THIS window's side
bar, at once.  Then go straight on to "3. Plan", in this turn;  no plan yet:  the last line asks for it, here.

## 3. Plan

1. Explore (read-only), BEFORE plan mode.  NEVER `EnterPlanMode` before "2. Session" is done:  plan mode can't
   make the worktree or the doc.
2. Minimal plan doc, BEFORE presenting the plan:  only the Overview and the open questions, so the user can read
   them in the doc while the plan is up.  Nothing else yet (no phases, decisions, caveats ...).
   - Hand-write the Overview's sub-sections (shape:  "4. Fill the doc").
   - `spell dev plan-doc add <name> question "title" --details "..."` per open question, explained with examples
     ("5. Each phase", item 6).  Agents:  up to 5, don't ask -- unless the user said "watch token
     budget", then one question is "How many agents can I use for this?".
   - `spell dev plan-doc check <name>`, then `spell dev plan-doc open <name>`.
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
- `spell dev plan-doc add-phase <name> "Short Name" --symptom "..." --changes "..." --goal "<ul><li>...</li></ul>" --files
  "..." --verify "..." --estimate "1-2h"` per phase, in order (Owen, 2026-10-06:  "Symptom, Changes, then the
  details"):  the symptom ONE line (what's wrong today), the changes two or three (what changes), the goal the details,
  one bullet per outcome, in Owen's terms;  the estimate becomes the title's badge, and the Overview's total
  (`p.plan-estimate`) follows by itself
- `spell dev plan-doc add <name> decision|caveat|issue|todo|question "title" [--details "<p>...</p>"]` per item
- Questions answered in "3. Plan", the agents one included:  `decide <name> Q<n> "..."`
- Hand-write `p.plan-summary`;  bring the Overview (written in "3. Plan") in line with the approved plan, nested in
  `#overview`:
  `<ui-section id="o1" header="1.1 ..." sticky collapsible dividing collapsed>`, `#o2` ... (a title with markup:  a
  `<span slot="header">` first inside instead of `header`;  sub-sub-items:  `<h4 id>`).  Code in folded
  `ui-accordion.spell-code`, digressions in collapsed `ui-accordion.spell-aside`, links to items and phases
  (`<a href="#d2">D2</a>`).  NEVER change an existing `id`.
- `spell dev plan-doc check <name>`, then `spell dev plan-doc open <name>` (new stage:  reload)

## 5. Each phase

1. `spell dev plan-doc phase <name> <N> active`, and check the session's name (`.claude/skills/isolate/SKILL.md`,
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
   - changed a phase's PLAN (Owen's feedback, or something found while building):  `updated <name> <N> "<p>what
     changed, and why</p>"`, a dated line in its fenced Updated block under Symptom / Changes (never an "Updated" word
     in the text);  then `phase-body <name> <N> --changes ...` (or `--goal` ...) to make the fields say the new plan
   - changed a prose block:  put
     `<ui-message class="plan-update" state="warning" size="tiny" header="UPDATE" data-phase="N"><p>what changed</p></ui-message>`
     just before it (the script marks items itself)
3. Subagents:  paste the cheat sheet below into their prompts, with "record caveats, issues and decisions in the
   plan doc as you find them".
4. `spell dev plan-doc phase <name> <N> done --done "<ul><li>...</li></ul>"` (drops that phase's UPDATE markers, writes
   its Done field, brings the doc forward), then `spell dev plan-doc summary <name>`.  Done:  what was BUILT, ordered by
   what Owen asks about first:  where to see it, what changed in how he works, what's rough or not yet tried by hand.
   - commit messages, so the doc can list them (its phase's and items' "Commits"):  a phase `P<n>:  <Name> --
     <summary>` (`P4 + P5:` for two;  `WIP P3:` for a parked part), an item fix `<name> I3:  ...` (MUST carry the
     epic's name:  `commits --backfill` ignores a bare `Fix I3:`, since it can't tell which epic)
   - after the phase's commit:  `spell dev plan-doc commits <name> --backfill` (finds them by subject).  The plan doc
     is never in that commit:  it's shared content, committed for you (see "Shared content" at the top)
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
- Turn it into durable docs:  `spell dev docs new durable <page> --title "..."` (fixes asset paths for the depth):
  - one page:  `guides/<name>.html`;  several files (pages, experiments):
    `guides/<name>/<name>.html` (shared content too:  committed for you, like the plan doc)
  - from the plan doc:  Overview -> the body;  decisions -> a "Why" section;  open caveats -> "Limits"
  - finish as in `packages/docs/AGENTS.md`, "Finishing a page";  `spell dev docs index` (the index is shared too:
    `spell dev plan-doc` keeps the epic's own card current from any checkout)
- The plan doc stays in `epics/` as the record:  every phase done.
- Changelog:  write the epic's entry straight into the shared `guides/changelog.html` ("Changelog"
  in the root's `AGENTS.md`), linking the plan doc and the durable doc;  under "3. Merged into main" if "Finish"
  below merges it, else "2. In worktrees".  Nothing to commit on the branch for it, and no merge conflict:  every
  checkout sees the one file.
- Then leave the worktree:  follow `.claude/skills/isolate/SKILL.md`, "Finish".  No move back:  the session and its
  plan doc stay in the window they're in.
- Last line of the reply:  "All done ..." (see the top).

## 7. Review:  `/epic review [<name>]`

Owen reviews ON THE PAGE:  the plan doc in the side bar's Review tab, where he marks items (each item's four
buttons:  Approve, Make Todo, Revisit Now, Add Details Now;  Choose on option cards) and sends them with the page
header's paper plane, or with Review Now beside it (the wand:  every revisit waiting is asked now too, epic
`windows-and-review` P4).  A running Add Details Now / Revisit Now clicked again is "nevermind" (`canceled`, 7.3).
This session LISTENS:  it waits on the doc's review inbox and acts on what arrives -- mechanical marks at once, Add
Details and "revisit now" by background agents, "revisit soon" answered one at a time.  EVERY answer goes INTO its
item, on the page;  the chat only links them (Q3 of `windows-and-review`).  No modal walk through items any more
(epic `review-review`, 2026-10-04;  plan:  `epics/review-review/review-review.plan.html`, 1.1-1.2).

- Runs from ANY window, `main` or a worktree:  the prompt hook lets `/epic review` through, never renames the session.
  No worktree, no plan mode.
- Every `spell dev plan-doc` command edits the epic's ONE shared doc, from any checkout.
- The page's controls need a PAGE SERVER with the review routes (`spell dev server ensure`):  from `file://`, or a
  server without them, the page shows no menus.
- Owen comes to a review COLD:  never a bare id in chat, always what it is in words ("the highlight.js swap (T2)").

Commands, in the order a review uses them:
```
spell dev plan-doc list --json                           every epic:  status, checkout, not reviewed / items
spell dev plan-doc items <name> --json                   where reviews stand;  sections, items, states
spell dev docs link <ABS doc> --hash <id> --review --show   show the doc in the Review tab, at <id>;  prints its links
spell dev plan-doc inbox <name> listen  /  unlisten      this session is (no longer) reviewing:  the page says so
spell dev plan-doc inbox <name> wait                     Bash run_in_background:  exits with work (or 2:  timeout)
spell dev plan-doc inbox <name> apply [ids]              approve / pick / todo marks into the doc;  prints what's left
spell dev plan-doc inbox <name> working <id> on|off      the page's spinner on an item
spell dev plan-doc details <name> <id> --file f --more | --append   a More Details card (Add Details) / a reply appended
spell dev plan-doc inbox <name> done <id>  /  clear <ids>    an item's request finished  /  marks dropped after a talk
spell dev plan-doc inbox <name> [--json]                 what's waiting, sent or not
```

### 7.1 Pick a doc (no `<name>`)

- `spell dev plan-doc list --json`:  `{ name, title, status, checkout, notReviewed, total }` each, in progress first.
- As reply text, every epic in two groups (in progress / done), most not-reviewed first:  `- commands (worktree
  commands)  5 / 9`.  Then ONE modal, header `Epic Review`, "Which epic do you want to review?":  the epics with
  anything not reviewed, label `<name> (in progress)` / `<name> (done)`, description `5 of 9 items not reviewed`;  4
  or fewer:  all;  more:  the next 2 then "More" (the next names) until 4 or fewer;  any other:  typed in Other.
- (The Review tab's own start page, "What would you like to review?", will replace this:  todo T1 of
  `review-review`.)

### 7.2 Start

1. `spell dev plan-doc items <name> --json`;  the doc's summary for what the epic is.
2. In chat, three lines at most, for someone who remembers nothing:  what the epic is, what's waiting on him (e.g.
   "4 judgement calls not reviewed, 2 open questions"), and when he last reviewed it.
3. The FIRST thing worth his time:  the first item, in page order, whose state is `attention` (red:  an open
   question, an unreviewed judgement call or issue);  none:  the first `open` (blue) one;  none:  the top.
   `spell dev docs link <ABS doc> --hash <that id> --review --show`:  the doc opens in the Review tab, at it.
4. `spell dev plan-doc inbox <name> listen`, then `spell dev plan-doc inbox <name> wait` with Bash `run_in_background: true`.
5. END THE TURN, short:  "Mark items in the Review tab:  each item's buttons;  Add Details Now and Revisit Now start
   at once (click again to call one off);  the paper plane sends the rest.  I'm listening."  Then the doc's link
   pair.

### 7.3 Woken:  the `wait` command finished

Read what it printed.  Then, in this order:
1. Exit 2 (timeout, nothing happened):  arm `wait` again, end the turn with one line ("still listening").
1b. CANCELED (Owen said "nevermind" on a running Add Details Now / Revisit Now, epic `windows-and-review` P2):  stop
   that item's background agent (`TaskStop`), then `spell dev plan-doc inbox <name> done <id>`.  An agent that
   finishes anyway is refused (`plan-doc details` errors:  "Owen called this request off"):  nothing lands.
2. NOW requests (Add Details, revisit now;  after Review Now, every revisit Owen had marked) -- `wait` already
   marked them `working` (the page spins):  per item, a
   BACKGROUND `Agent` (`run_in_background: true`), each prompt:
   - which doc, which item (id, title), and the rules:  `plan-doc.md` "Rules" (cold reader, bullets, examples, Net
     effect)
   - Add Details:  read the item, the code and docs it names, then write what its text leaves out, as MORE
     details:  `spell dev plan-doc details <name> <id> --more --file <html>`.  The item's text stays on top
     ("Original Reply");  yours goes under it in a white "More Details" card (P3 of `windows-and-review`), so don't
     repeat the text:  build on it
   - revisit now:  answer Owen's note (quote it), in the reply block markup (`plan-doc.md`, "Reply"):  what he asked,
     the answer with evidence (real code, the command and its output), option cards when he must choose (he picks
     on the page), a Net effect;  `spell dev plan-doc details <name> <id> --append --file <html>`.  With a pick ("picks B
     · ..., asks:  ..."):  answer about THAT option;  never decide the question (he confirms with a plain pick)
   - last:  `spell dev plan-doc inbox <name> done <id>`
   Up to 5 agents at once (root rules);  more:  the rest after.
3. SENT marks:  `spell dev plan-doc inbox <name> apply`:  approvals, picks and todos land in the doc (it prints each).
   Then each "to talk over" (revisit soon), one at a time:  answer his note INTO the item, as a reply
   (`details --append`, the reply markup of "revisit now" above:  his note quoted, the answer with evidence, option
   cards when he must choose, so he picks ON THE PAGE), then `inbox clear <id>` and `review <name> <id>
   "<outcome>"`.  In chat:  one line per item, its link (`spell dev docs link ... --hash <id>`), never the answer
   itself (Q3 of `windows-and-review`:  a long review stays readable).  He answers on the page (Revisit again), or
   says so in chat;  a quick yes / no:  a modal.
   - "picks B · <card>, asks:  <note>" (a pick with a revisit, "B, but ..."):  `apply` leaves it;  answer the note
     about B, and once he agrees, `spell dev plan-doc decide <name> <id> "<card title>" --option B` yourself
   - the page counts this session as gone once its heartbeat is 90s old:  `wait` stamps it every 30s, and so do
     `inbox apply`, `done`, `clear` and `working`;  a long talk without them shows "nobody is reviewing" until `wait`
     runs again
4. Arm `wait` again (always, unless he said stop), then reply:  what landed (bullets, items in words, ids after),
   what's being worked on in the background, what needs him;  the doc's link pair last.
- A background agent's own completion notice wakes the session too:  nothing to do but check `inbox` shows the item
  done;  don't re-arm a second `wait` while one runs (`inbox` would print both;  check the background tasks).

### 7.4 Finish

When Owen says he's done ("stop reviewing", "that's it"), or the session must stop:
- stop the waiter (`TaskStop`), `spell dev plan-doc inbox <name> unlisten`
- `spell dev plan-doc log <name> "Review:  <n> approved, <n> answered, <n> to todos, <n> details added"`
- reply:  what was decided and done (in words, ids after), what's still waiting on him;  the link pair
- the doc's changes:  nothing to commit, from any checkout (shared content, committed for you at the turn's end)

## 8. Resume:  `/epic resume [<name>]`

A NEW session picks up an epic whose own session is gone (closed, crashed, compacted beyond use):  in the epic's
checkout, in a window Owen picks, from where the plan doc says it stopped.  The plan doc is the memory:  read it,
don't redo it.

1. Which epic:
   - `<name>` given:  that one.  No plan doc at `epics/<name>/`:  say so, then the list below.
   - none:  `spell dev plan-doc list --json`, status `in progress`, minus those with a running session
     (`spell dev worktree list`).  One:  use it, naming it in the reply.  Several:  AskUserQuestion "Which epic?",
     label `<name>`, description its next phase and checkout (`plan-doc summary`).
   - Rename this session `<name>`, first.  A typed `/epic resume <name>` already was, by the prompt hook
     (`.claude/hooks/prompt-gate.mjs`);  else `spell dev session title "🚧 <name>"`.
2. Its own session still running (`spell dev worktree status <name>`, `sessions`, `running: true`, not this one):
   as `.claude/skills/unpark/SKILL.md`, step 2:  tell it, or resume here.
3. Where:  the plan doc's checkout (`list --json`, `checkout`).
   - `main`:  no worktree;  work in the main checkout, this window.
   - `.claude/worktrees/<name>`:  as `.claude/skills/unpark/SKILL.md`, step 3 (`stay-check --epic`, new window
     or stay;  `EnterWorktree` with `path`).  A `PARKED-<name>.md` there:  it was parked;  `/unpark`'s steps
     instead, and stop here.
   - the worktree is gone but branch `<name>` isn't:  `EnterWorktree` with `name: "<name>"` re-makes it on that
     branch (the `WorktreeCreate` hook);  neither:  say so, and ask before starting the epic over.
4. Catch up, in the checkout:
   - `spell dev plan-doc summary <name>`, the active phase's part file, the log's last lines, `git status
     --short` and `git log --oneline -5`:  what's done, what's half done
   - behind `main` (`git log --oneline HEAD..main` not empty):  `spell dev worktree merge-main`, as
     `.claude/skills/park/SKILL.md` "Resume", steps 2-4 (resuming is the go-ahead for its merge commit)
   - no `node_modules/`:  `yarn install`
   - `spell dev plan-doc open <name>` (in a new window:  after the handoff, as "2. Session", step 5)
5. Reply:  for someone who remembers nothing, three lines at most:  what the epic is, where it stopped, what's
   waiting on Owen (open questions, issues, tests);  uncommitted work in bold.  Then:
   - a phase `active` with work under way:  AskUserQuestion "Carry on with P<N> · <Name> (Recommended)" /
     "Stop here"
   - else, as "5. Each phase", step 5:  "Start P<N> · <Name> (Recommended)", the top open issue, "Stop here"
   - no phases yet (it hung while planning):  "3. Plan", from the prompt quoted in its Overview
   - a new window:  do all of this THIS turn, then end it (the move happens when it ends);  the modal waits for the
     next turn, in the new window
   - Never start a phase without that pick:  Owen reviews each phase before the next.

## 9. Future:  `/epic future <name> [text]`

Write an idea down as a FUTURE epic (epic `epic-future`, 2026-10-07):  a stub plan doc and an analysis page, NO
plan, worktree, window or phases.  `/epic <name>` plans it later, from what this leaves.

- Runs from ANY window, `main` or a worktree:  the prompt hook lets it through and titles the session `📅 <name>`.  No
  worktree, no plan mode, no move.
1. Name, collisions, kickoff prompt:  as "1. Name" (the rest of the text is the idea, kept verbatim in
   `~/.spell/prompts/<name>.md` until the doc holds it).  An existing epic of that name:  say so and stop.
2. The stub:  `spell dev plan-doc new <name> --future --title "<Title>" --prompt-file ~/.spell/prompts/<name>.md`,
   then delete the prompt file, and hand-write its `p.plan-summary`:  the idea in two sentences, what changes for
   Owen.  It's a plan doc with `<body data-future>`:  a violet FUTURE label, a "Future epic"
   notice in place of "Plan hung?", no branch or worktree;  `plan-doc list` says `future`, the Epics index gives
   it a seedling, between the open epics and the done ones.
3. Explore, read-only (agents allowed, root rules):  just enough to see the problem, the options and the hard parts.
   Not a plan:  no phases, no estimates.
4. The ANALYSIS page:  `spell dev details new analysis --epic <name> --title "<Title>:  analysis"`, written as the
   details skill says (`.claude/skills/details/SKILL.md`):
   - "Where we are":  that it's a future epic, from which idea, and that answering shapes the plan, later
   - Context:  the problem in plain words, what exists today (real code), the shape you'd propose (an example), what
     goes away, the catch (what makes it hard), a rough size
   - one question per HIGH-LEVEL open choice (what, where, how far, when):  options side by side, one recommended.
     Not the small ones:  those are the plan's
   - `yarn vp fmt <its real path>`, then `spell dev details show <name>/analysis --wait` (Bash, in the background;
     it opens in the side bar's Review tab).  End the turn with its link pair (`spell dev docs link <page> --review`)
5. The answer (the waiter wakes the session):  each question `spell dev plan-doc add <name> decision "<answer>"
   --details "<p>the question, the pick, Owen's note, a link:  <a href=\"details/analysis.html#q2\">analysis
   Q2</a></p>"`;  a note asking something:  answer it in the reply, and in the decision's details.
6. Reply:  what the future epic is, what was decided, and that `/epic <name>` plans it;  the plan doc's link pair.

## Cheat sheet (`spell dev plan-doc ...`, from anywhere in the repo)

```
new <name> [--title "Title"] [--prompt "..." | --prompt-file f] [--future]
                                                    create from the template, update the docs index;  --future:  a
                                                    future epic (9.);  new on a future epic's doc plans it (promoted)
add-phase <name> "Short Name" --symptom .. --changes .. [--goal ..] [--files ..] [--verify ..] [--estimate 2h]
phase-body <name> <N> [--symptom ..] [--changes ..] [--goal ..] [--files ..] [--verify ..]   set ("" removes) fields
updated <name> <N> "<p>what changed</p>"            a change to phase N's plan:  fenced, dated, under Symptom / Changes
estimate <name> <N> "1-2h"                          change a phase's estimate;  the Overview's total follows
phase <name> <N> todo|active|done [--no-open]       done drops UPDATE markers;  reloads the VS Code tab
add <name> question|judgement|caveat|issue|todo|test|decision "title" [--details "<p>html</p>"]   prints the id (C3)
decide <name> <Q id> "answer" [--details html]     answer a question, INTO it:  prints its id (Q3)
commit <name> <sha> --phase N | --item <id> "..."   list a commit under a phase or an item
commits <name> --backfill                           every phase / item commit (`P3:`, `<name> I3:`), once
close <name> <id>  /  reopen <name> <id>            close (done) / open again, never delete
cancel <name> <id> ["why"]                          made moot by another decision:  struck;  reopen undoes it
log <name> "text"                                   timestamped line in the doc's log
bedtime <name> start "P3-P6" | done "summary"       bedtime mode on / off:  the run's changes stay green (`/bedtime`)
overnight <name> remove                             an older doc's Overnight report (before 2026-10-05), once read
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
list [--json]                                       every epic once:  status, where it runs, not reviewed / all
backfill <name> | --all [--apply]                   one-off:  mark what past sessions show Owen went through
```
- Every command edits the epic's ONE shared doc, wherever it's called from ("Shared content" at the top).
