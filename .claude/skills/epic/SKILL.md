---
name: epic
description: Run a planning session against a live plan doc, `epics/<name>/<name>.plan.html`, in its own worktree. Use for `/epic <name> [what to plan]` (name alone:  the plan comes in the next prompt), or when Owen says "make this a plan doc" / "turn this into a plan doc" about the work in the current session.  `/epic review [<name>]`:  open a plan doc in the side bar's Review tab, where Owen marks items on the page, and listen:  act on his marks (approvals, picks, todos), write details and replies in the background, talk revisits over ("review the seo epic", "go through unified-server's caveats").  `/epic resume [<name>]`:  pick an epic back up in a new session, in the right worktree and window, where its plan doc says it stopped ("resume the seo epic", "carry on with windows-and-review").  `/epic future <name> [idea]`:  write an idea down as a FUTURE epic, not planned yet:  a stub plan doc and an analysis page of its high-level open questions, answered in the Review tab;  no worktree ("save this as a future epic", "an epic for later").  `/epic phase [ids] [name]`:  add a phase to this session's epic, from its items (`/epic phase J1 J5, t3`) or from scratch;  `/epic start <P1 | ids>`:  work a phase, or a block of its items, now.  `/epic request <epic> [<rN>]`:  take up a request Owen sent from another session (`/send`), into a phase.  `/epic done`:  the same as `/isolate done`.
argument-hint: <name> [what to plan] | done | review [<name>] | resume [<name>] | future <name> [idea] | phase [ids] [name] | start <P1 | ids> | request <epic> [<rN>] | color <look>
---

# /epic

An EPIC is a planning session and the work it plans;  its live record is the PLAN DOC.
- It was `/plan-doc` until 2026-10-02.
- Its tool is `epic` (`spell dev plan-doc` until epic `epic-workflow` P9).

Plan, then build, in worktree `<name>`, keeping the PLAN DOC current the whole time.
- The plan doc:  `epics/<name>/<name>.plan.html`.
- It's the user's view of the work:  they read it in the right side bar's REVIEW tab while you work.
  - That's the checkbox icon;  never the "Spell Docs" hat tab (Owen's rule, 2026-10-07).

- Shared content:  the plan doc lives in `epics/`, which spell-app doesn't track
  (epic `shared-content`, 2026-10-04).
  - In every checkout, `epics/` is a link into ONE shared repo, `../spell-app-dev`.
  - So there is ONE plan doc:  `main` and every worktree see each edit at once;  it never conflicts on merge.
  - Committed for you after every turn
    (the `Stop` hook, [shared-commit.mjs](.claude/hooks/shared-commit.mjs)).
  - NEVER commit, stage, `git checkout --` or `git restore` it in spell-app.
    Nor the changelog, the docs index, or a details page.
- Rules for the doc (sections, ids, markers, prose):  [plan-doc.md](templates/epics/plan-doc.md).
  Read it first.
- Structured edits go through `epic <verb> <name>[#<id>] ...` (cheat sheet below), never by hand.
  - Hand-edit only prose:  the summary, Overview, phase bodies, item details.
  - A plan doc is SPLIT (P3 of `claude-design`;  new docs start so):
    - The skeleton, `epics/<name>/<name>.plan.html`, keeps the summary, the kickoff prompt,
      and every section, phase and item line.
    - Each BODY is a part file, `epics/<name>/parts/<id>.html`, `<id>` its section's or item's:
      - `o3.html`:  Overview 1.3
      - `p2.html`:  phase 2's Goal / Done / Files / Verify
      - `q7.html`:  Q7's details
      - `log.html`
    - Edit a body's prose in ITS part file, at its real path:
      `/Users/owen/www/spell-app/spell-app-dev/epics/<name>/parts/<id>.html`.
    - Its relative links are relative to `parts/`:  one `../` more than the skeleton's.
  - A new Overview sub-section:  write it whole into the skeleton, inside `#overview`.
    - The next `epic` command moves its body into `parts/<id>.html`.
    - Nothing is dropped:  content beside a part is kept, after the part's.
  - `plan-doc.md`, "Parts", has the rules.
    `epic split <name>` / `join <name>` switch a doc's shape.
- Reload the plan doc whenever the session moves to a new stage:
  name -> worktree -> plan -> fill -> each phase -> doc review.
  - `epic open <name> --review` reloads it in the side bar's Review tab.
  - `epic phase` does it for you.
- Style, in the plan doc:  written for Owen coming back cold (`plan-doc.md`, "Rules"):
  - a plain lead sentence, then bullets:  never a list run together in a sentence
  - full words, and a concrete example for anything tricky
  - ids explained
  - a **Net effect** list (`<epic-net-effect>`) closing every question, issue, judgement call and decision
  - NOT caveman (Owen, 2026-10-04).
  - Replies:  short, the same plain words.
- Naming a doc in a reply (the plan doc, a durable doc, any `packages/docs` page):
  paste what `spell dev docs link` prints, run in the checkout the doc is in.
  - In full:  `spell dev docs link <ABSOLUTE path> --hash <id> [--text "..."]`.
  - It prints the side bar link, then `• 🌐` (the browser link)
    ([the details skill](.claude/skills/details/SKILL.md), "Links to pages").
  - `--hash`:  the id of what you mean (`p2`, `q3`, `t4`).
  - A worktree's doc goes on the MAIN server when that one has the route, else the worktree's own.
- Phase complete:  the LAST line of that reply's text says where we are.
  - Each phase is linked to its heading in the plan doc:
    `spell dev docs link <plan doc> --hash p1 --text "P1 · Short Name"`.
  - "<P1 link pair> complete.  Next is <P2 link pair>."
  - After the last phase:  "All done:  <P<N> · Doc Review link pair> complete."

## 1. Name

- Some first words are reserved:  never an epic's name.
  - `review`:  NOT a new epic.
    Go to "7. Review", and skip everything else here.
  - `resume`:  NOT a new epic either.
    Go to "8. Resume".
  - `color`:  `/epic color <look>` recolours the window it's typed in.
    - That's `spell dev window color <look>`;  no look:  it lists the 12.
    - One line saying so, and nothing else.
  - `future`:  `/epic future <name> [text]` writes an idea down as a FUTURE epic, not planned yet.
    Go to "9. Future".
  - `phase`:  `/epic phase [ids] [name]` adds a phase to THIS session's epic.
    Go to "10. Add a phase".
  - `start`:  `/epic start <P1 | ids>` works a phase, or a block of items in it.
    Go to "11. Start".
  - `phase` and `start`:  epic `skillz` P4.
  - `request`:  `/epic request <epic> [<rN>...]` takes up a request Owen sent from another session.
    Go to "12. Request" (epic `epic-workflow`).
  - `done`:  `/epic done` is `/isolate done`, word for word.
    Follow [the isolate skill](.claude/skills/isolate/SKILL.md)'s "Finish", and skip everything else here.
    - The same steps "6. Doc Review" ends with.
- `<name>` is the first word of `$ARGUMENTS`, or a quoted phrase (`"Docs Index"`).
  - Lower-kebab-cased:  `Docs Index` -> `docs-index`.
  - The rest, if any, is the plan:  the prompt that kicks it off.
  - No argument:  ask for a name.
  - A look right after the name (`/epic new-thing -purple`, one of `spell dev window color`'s 12)
    is the window's colour, NOT the plan's.
    - It's `open <name> --color purple` in "2. Session", or `color purple` when staying.
    - The prompt hook leaves it out of the text it saves (epic `windows-and-review` P5).
  - "Make this a plan doc" (invoked mid-session):
    propose a name from the work so far in AskUserQuestion, recommended first.
    The user can type another in "Other".
- Checks and rename, BEFORE anything else:
  as [the isolate skill](.claude/skills/isolate/SKILL.md)'s "Start", step 0.
  - A typed `/epic <name> ...` got them from the repo's `UserPromptSubmit` hook
    ([prompt-gate.mjs](.claude/hooks/prompt-gate.mjs)).
  - It renamed the session `<name>`, or blocked the prompt (plan mode) and saved its text.
  - EXCEPT in another worktree (isolate's step 0 test;  the hook's note says so too):
    NOT a failure, and NOT this session's epic.
    Go to "From another worktree", and skip everything else.
  - In `<name>`'s OWN window, its worktree already made
    (`spell dev window which`:  `workspaces/ongoing/<name>`):
    a session "From another worktree" launched.  See "Launched" there.
- The kickoff prompt, SAFE before anything else:  the text after `<name>`, verbatim.
  - Write it to `~/.spell/prompts/<name>.md` at once, as the hook does when it blocks.
  - An older, different file there:  rename it `<name>.<time>.md` first.
  - No text, but that file exists:  it IS the kickoff prompt (the hook saved it).
    Say so in one line.
  - Delete the file only once the plan doc holds it (`epic new --prompt-file`).
- Look for collisions (from the repo root), every time:
  - `epics/<name>/`, `guides/<name>/`, `guides/<name>.html`
  - the worktree and branch checks of the isolate skill's "Start", step 2
  - any hit:  AskUserQuestion, options:
    - "Reuse `<name>`":  continue that doc / worktree
    - "Different name":  the user types it in "Other"
    - Never overwrite an existing plan doc.
  - A FUTURE epic's doc ("9. Future";  `epic list --json` says `status` `future`):
    no modal, it's waiting to be planned.
    - Say so in one line, then go on.
    - In "2. Session", step 3, `epic new <name>` PROMOTES it where it is:  no `--prompt-file`.
      Its prompt, decided questions and analysis page are kept;  the meta lines name the branch and worktree.
    - "3. Plan" starts from its kickoff prompt, its decided questions and its analysis page.
      The page is `epics/<name>/details/analysis.html`;  its answers, from `epic ask answer <name>/analysis`.
- Name and nothing after it, nothing saved (and not mid-session):
  the user sends the plan in the NEXT prompt, in the new window.
  - Do "2. Session" now anyway:  a stub doc with no prompt, then the move.
    Its last line asks for the plan.
  - That next message is the kickoff prompt:
    `epic prompt <name> --file <file>` first, then "3. Plan".

## Mid-session

When the session already has work under way ("make this a plan doc"), carry it over -- don't start again:
- Plan mode, and edits already made on `main`:  the isolate skill's "Start", step 0.
- Step 3:  start from the plan drafted so far (harness plan file, conversation),
  reshaped into the plan doc's shape.
  - Explore only to fill gaps.
  - Decisions and questions already settled become `decision` items (questions born answered:  `Q7`).

## From another worktree

`/epic <name> ...`, typed in a session working in ANOTHER worktree (`<other>`),
means "open a window for epic `<name>`" (Owen, 2026-10-07).
- This session stays `<other>`'s:  no rename, no `EnterWorktree`, no plan here.

1. The text after `<name>`:  the hook saved it in `~/.spell/prompts/<name>.md`.
   - A natural-language trigger:  save it yourself, as "1. Name" says.
2. Collisions, as "1. Name".
   Not the future-epic case:  it goes on as usual in the new window.
3. AskUserQuestion "Open epic `<name>` in a new window?",
   the question saying this session works in `<other>` and stays there:
   - "New window `⎇ <name>`" (Recommended):  step 4
   - "Not now":  one line, where the text is saved,
     and that `/epic <name>` alone picks it up from any other window
4. `spell dev window launch <name> [--color <look>]`, a look after the name as in "1. Name".
   - It makes the worktree, opens its window,
     and starts a NEW session there with `/epic <name>` typed in.
   - One line:  "`⎇ <name>` is open:  press enter on `/epic <name>` there".
   - Then carry on with `<other>`'s work, if any was waiting.
   - It fails (no window bridge, an old extension:  `unknown op` / `bad session id`):
     say so in one line;  the text stays saved.

**Launched:**  the new session's `/epic <name>`, its worktree made, this window its own:
- The worktree:  `.claude/worktrees/<name>`.
- "1. Name" as usual, but the worktree and branch `<name>` are THIS epic's:  no "Reuse" modal for them.
  - A plan doc or guide already there still asks.
- "2. Session" as "Staying in this window", with no question and no `window stay`:
  the window is already `⎇ <name>`, tinted.
  - `EnterWorktree` with `path: ".claude/worktrees/<name>"`.
  - Then steps 2, 3 and 5, then "3. Plan".

## 2. Session:  stub doc, then move

All in the FIRST turn, in this order, then the turn ends.
- Why:  the move to the worktree's window waits for the turn to end,
  and the stub doc keeps the kickoff prompt safe whatever happens to this session.

0. Where:  isolate's "Start", step 2b, with `stay-check --epic`:  a new window, or stay in this one.
1. Isolate:  read [the isolate skill](.claude/skills/isolate/SKILL.md),
   and follow "Start", step 3 (and step 0 mid-session), with this `<name>`:  `EnterWorktree`.
   - A skill can't invoke another, so follow its steps here.
2. `yarn install` in the worktree, a few seconds.
   - The work needs it;  `epic` doesn't, since it runs the MAIN checkout's CLI.
3. The STUB doc:

   ```sh
   epic new <name> --title "<Title>" --prompt-file ~/.spell/prompts/<name>.md   # no file:  no --prompt-file
   ```

   - The prompt is quoted at the top of the Overview, and in the "Plan hung?" notice above it.
     That notice has a copy button and restart steps;  it goes once P1 starts.
   - Then delete the prompt file.
   - Reusing a doc:
     - its prompt missing:  `epic prompt <name> --file <file>`
     - an older doc (before the `<epic-*>` elements):
       `epic convert <name> --out <folder>` first, then copy it back
     - No phases yet:  a restart after a hang.
       Plan again from its prompt ("3. Plan");  explore only what the doc doesn't say.
4. Isolate "Start", steps 4-5:  the worktree's own window, then `handoff <name> --prompt continue`.
   - Name alone, no plan yet:  no `--prompt`.
5. `epic open <name> --review`, AFTER the handoff.
   - It shows in the right side bar's Review tab (the checkbox icon) of the window the session moves to,
     once it has:  one tab, reloaded on every later `open`.
   - Needs the spell extension (`spell dev vscode`).
   - MUST print "... shows in ... once this session moves there".
     Why:  only a PENDING move defers it;  before the handoff, it shows in THIS window's side bar, the one being left.
6. Isolate "Start", step 6:  END THE TURN.
   - Last line:  "moving to `⎇ <name>`:  press enter on `continue` there".
   - No plan yet:  "send the plan there".
7. Next turn, in the new window:  isolate's "Continue" step 1 (old tab), then "3. Plan".

Staying in this window (step 0):  skip steps 4 and 6.
- `spell dev window stay <name>` instead:  the window titled `⎇ <name>`, tinted (isolate's "Stay", step 0).
- Step 5's `epic open` shows the doc in THIS window's side bar, at once.
- Then go straight on to "3. Plan", in this turn.
  No plan yet:  the last line asks for it, here.

## 3. Plan

1. Explore (read-only), BEFORE plan mode.
   - NEVER `EnterPlanMode` before "2. Session" is done:  plan mode can't make the worktree or the doc.
2. Minimal plan doc, BEFORE presenting the plan:  only the Overview and the open questions.
   - So the user can read them in the doc while the plan is up.
   - Nothing else yet:  no phases, decisions, caveats ...
   - Hand-write the Overview's sub-sections (shape:  "4. Fill the doc").
   - Per open question, explained with examples ("5. Each phase", item 6):
     `epic add <name>#Q "title" --details "..."`.
   - Agents:  up to 5, don't ask.
     Unless the user said "watch token budget":  then one question is "How many agents can I use for this?".
   - `epic check <name>`, then `epic open <name> --review`.
   - Why here:  plan mode allows editing ONLY the harness plan file.
3. `EnterPlanMode`.
   Draft the plan in the harness plan file, in the plan doc's shape:
   1. Summary:  2 sentences
   2. Phases:  `P1 · Short Name`, 2-4 words each, so "start P2" is unambiguous.
      - Each with goal, files, verify, and estimate.
      - The estimate:  wall-clock for Claude, agents included, review not (`30m`, `2h`, `1-2h`).
      - The LAST phase is always `Doc Review`.
      - Its goal names the text pass ("6. Doc Review"):
        - `/fussbudget branch` and `/fussbudget epic <name>`:  the branch's text and the plan doc, rewritten
        - the durable doc, written from the cleaned plan doc to the same rules
        - `spell dev docs fuss --branch` last:  its misses fixed, or listed for Owen
   3. Overview:  the total estimate, then numbered sections (structure, code, flows):
      what will become durable docs
   4. Caveats, issues, todos, decisions (what + why), open questions (the doc's ids:  `Q1` ...)
4. Ask the open questions with AskUserQuestion (labels matching the doc's) before ExitPlanMode.

## 4. Fill the doc (right after ExitPlanMode is approved)

The filling goes to a background agent, `<name>-plan-doc`, as if Owen had typed `/bg "plan-doc" ...`
([the bg skill](.claude/skills/bg/SKILL.md);  Owen, 2026-10-07).
- That's everything below, except naming the plan file.
- Its prompt has these steps, the approved plan's path, and the answers.
- The session stays free meanwhile, and relays its report.
- So does every later plan-doc edit bigger than one command:
  a phase's Done list and items at its end, a reorder, Doc Review's pruning.

- Name the harness plan file after the epic, so it traces back (Owen, 2026-10-04).
  In `~/.claude/plans/` (the harness still reads the old name, hence the link):

  ```sh
  mv <file>.md epic-<name>--<file>.md
  ln -s epic-<name>--<file>.md <file>.md
  ```

- Per phase, in order, `add-phase`
  (Owen, 2026-10-06:  "Symptom, Changes, then the details"):

  ```sh
  epic add-phase <name> "Short Name" --symptom "..." --changes "..." --goal "<ul><li>...</li></ul>" \
    --files "..." --verify "..." --estimate "1-2h"
  ```

  - The symptom:  ONE line, what's wrong today.
  - The changes:  two or three, what changes.
  - The goal:  the details, one bullet per outcome, in Owen's terms.
  - The estimate becomes the title's badge, and the Overview's total (`<epic-overview estimate>`) follows by itself.
- Per item:  `epic add <name>#D|#C|#I|#T|#Q "title" [--details "<p>...</p>"]`.
- Questions answered in "3. Plan", the agents one included:  `decide <name>#Q<n> "..."`.
- Hand-write the summary, `<epic-summary>`:  two sentences.
- Bring the Overview (written in "3. Plan") in line with the approved plan,
  nested in `<epic-overview id="overview">`:
  - Each sub-section:  `<epic-section id="o1" kind="overview-part" title="...">`, then `#o2` ...
  - A title with markup:  a `<span slot="title">` first inside, instead of `title`.
  - Sub-sub-items:  `<h4 id>`.
  - A split doc:  the prose goes in `parts/o1.html`.
- The prose blocks are ELEMENTS, never hand-shaped
  (`PLAN-DOC.md`, "Prose elements";  P14 of `epic-components`):
  - code:  in a folded `<epic-code title="file.ts · N lines" language="ts"><pre>...</pre></epic-code>`
  - digressions:  in a folded `<epic-aside title="...">`
  - the Net effect:  in `<epic-net-effect [option="A" recommended]>`
  - options, on any item:  in `<epic-choices>`
  - labelled blocks:  in `<epic-field label="Where">`
  - links to items and phases:  `<a href="#d2">D2</a>`
  - NEVER change an existing `id`.
- `epic check <name>`, then `epic open <name> --review` (new stage:  reload).

## 5. Each phase

1. `epic phase <name>#P<N> active`.
   - Check the session's name (the isolate skill's "Session name").
2. Do the work.
   Record as you go, not at the end:
   - Found a problem:  `add <name>#I`.
   - A limit we accept:  `add <name>#C`.
   - A choice:  `add <name>#D` (a question born answered).
   - A choice made WITHOUT Owen (he is away, or an agent decided):  `add <name>#J`.
     - Ids `J1` ...;  see `/bedtime`.
     - CALM by default:  `--calm` (last), yellow (open) rather than red.  The same for an issue.
       - Owen:  "if what you picked was reasonable, and I didn't explicitly state otherwise, [it] should be yellow"
         (2026-10-10, "the principle of least surprise").
       - RED (no `--calm`) only when it would surprise him:
         - it goes against something he said
         - it drops, narrows or changes what he asked for
         - a real fork he'd plausibly have picked differently, AND that matters to him
           (cost, behaviour he'll notice, something hard to undo)
         - it needs his answer before work can go on
       - Following WWOD is one case of calm, not the only one.
       - Never ask:  decide, and record it.
       - Owen flips it from its id chip while reviewing;  `epic calm <name>#<id> [<id>...] [--loud]` from the CLI.
   - Items added while the phase is active carry it.
     - The phase's "To review" line lists the ones Owen hasn't reviewed;  the script writes it on every edit.
     - Never hand-write a "Judgement calls:" line.
   - Something only Owen can check (a live window, a click, a look):  a test, into "To test".
     - `add <name>#V "<step>" --details "<p>what should happen</p>"`
     - `close` it once he says it passed.
   - Fixed or done:  `close <name>#<id>`.
     It stays, closed, NOT struck.
   - Made moot by another decision:  `cancel <name>#<id> "why"`.
     It's struck through:  the one struck status (J16 of `review-review`).
   - An item talked through with Owen (he answered, accepted, or said leave it):
     `review <name>#<id> "outcome"`, so the next `/epic review` doesn't bring it up again ("7. Review").
   - Changed a phase's PLAN (Owen's feedback, or something found while building):
     - `updated <name>#P<N> "<p>what changed, and why</p>" --summary "..."`:
       an `<epic-update>` block at the end of the phase's description, after Goal:  **Update**: <summary>, dated.
       Never an "Updated" word in the text.
     - ALWAYS pass `--summary`:  5-10 words saying WHAT changed (Owen, 2026-10-11).
       Never who or when ("From Owen's comment CM2 ...", "Owen, 2026-10-11:"):  the text says who, the block shows when.
       E.g. `--summary "Tab labelled App/UI, right after App"`.
     - Then `update <name>#P<N> --changes ...` (or `--goal` ...), to make the fields say the new plan.
   - Changed a prose block:  put
     `<epic-update at="YYYY-MM-DD HH:MM" summary="what changed, one line" phase="N"><p>why</p></epic-update>`
     right AFTER it (an update to a whole Overview sub-section:  last inside it).
     - The script marks items itself (a bare label in the title);  `phase <name>#P<N> done` drops both.
     - Its plan changes (`updated`) stay.
     - A note that should stay:  `<epic-note state="update" title="...">` (`plan-doc.md`, "UPDATE markers").
3. Subagents:  named and listed, as the root `CLAUDE.md`'s "Delegated work" says
   (`epic agents add` / `done`).
   - Paste the cheat sheet below into their prompts,
     with "record caveats, issues and decisions in the plan doc as you find them".
4. Close the phase:  `epic phase <name>#P<N> done --done "<ul><li>...</li></ul>"`.
   - It drops that phase's UPDATE markers, writes its Done field, and brings the doc forward.
   - Then `epic summary <name>`.
   - With the phase's items, this runs in a background `<name>-plan-doc` agent ("4. Fill the doc"),
     while the reply below goes out.
   - Done:  what was BUILT, ordered by what Owen asks about first:
     where to see it, what changed in how he works, what's rough or not yet tried by hand.
   - Commit messages, so the doc can list them (its phase's and items' "Commits"):
     - a phase:  `P<n>:  <Name> -- <summary>`;  `P4 + P5:` for two;  `WIP P3:` for a parked part
     - an item fix:  `<name> I3:  ...`.
       It MUST carry the epic's name:  `commits --backfill` ignores a bare `Fix I3:`, since it can't tell which epic.
   - After the phase's commit:  `epic commits <name> --backfill`, which finds them by subject.
     - The plan doc is never in that commit:
       it's shared content, committed for you (see "Shared content" at the top).
   - A STANDING epic (`<epic-page standing>`, `epic summary --json`'s `standing`;  epic `epic-workflow`):
     the phase goes onto `main` AT ONCE, once its commit is made and its checks pass (Q8 of `epic-workflow`).
     - Its own short doc pass comes first, in place of one Doc Review at the end:
       `/fussbudget` on the files the phase changed, and the durable doc brought in line, before the commit.
     - Then, no asking (the standing epic is the ask):
       1. `main` moved (`git log --oneline HEAD..main` not empty):  `spell dev worktree merge-main`.
       2. `ExitWorktree` with `action: "keep"`:  a worktree session can't move `main`.
       3. `epic merge <name>`, in the main checkout:  checks it's on `main` and clean, then fast-forwards.
          It refuses, saying why (`main` moved again, uncommitted work there):  `add <name>#I`, and go on.
       4. `EnterWorktree` with `path: ".claude/worktrees/<name>"`:  back, the window and session unchanged.
       5. The changelog:  the epic's entry, under "3. Merged into main", gets the phase's bullets.
     - Never `/isolate done`:  the worktree, the window and the session stay, for the next request.
     - In bedtime mode, nothing merges:  `add <name>#T "merge P<n>"`, as `/bedtime` says.
     - `epic update <name> --standing [on|off]` makes an epic standing, or not;
       the docs index, `/epics` and its step label then never call it done (STANDING, when every phase is).
5. Reply:  a short bulleted list (done, issues, caveats, next), and the "complete.  Next is" line (see the top).
   - THEN AskUserQuestion, so the user picks without copying anything.
     Options, most useful first:
     - "Start P<N+1> · <Name> (Recommended)"
     - the top open issue(s):  "Fix I<n>:  <title>"
     - a caveat or todo worth acting on now
     - "Stop here"
   - Questions the user must answer also go in the doc (`add <name>#Q`).
   - Once answered:  `decide <name>#Q3 "what was decided"`.
     Never `close`:  `decide` writes the answer INTO the question (D13 of `review-review`).
6. Explain every question and every issue the user must weigh in on WITH EXAMPLES, in the doc,
   so the user can decide from the doc alone (rules:  `plan-doc.md`, "Explaining a question or issue"):
   - define each coined word in plain language ("stacking", "nudge")
   - show the real code / markup it's about
   - compare many values in a table
   - put the options side by side, with one recommended
   - add a LIVE example when the doc's widgets can show it
   - Then ask, with option labels that match the doc's.

## 6. Doc Review (last phase)

- Prune:  close stale items;  make the summary and Overview true to what was BUILT.
- "To test":  every hand check the work needs before merging is there, each a step and what should happen.
  - List the open ones in the reply, as bullets.
- The text pass (epic `skillz` P7;  [the fussbudget skill](.claude/skills/fussbudget/SKILL.md)), in this order:
  1. First, both named in full, so nothing asks:
     - `/fussbudget branch`:  the text this branch changed, docstrings and comments
     - `/fussbudget epic <name>`:  the plan doc's prose.
       Plan-doc work, so the background `<name>-plan-doc` agent runs it ("4. Fill the doc"),
       right after its pruning.
     - Both rewrite in place, uncommitted:
       the branch's diff waits for Owen in Source Control, before the phase's commit.
  2. Then the durable doc (below), written from the CLEANED plan doc, to the same rules:
     WWOD §6 and [writing.md](agents/wwod/writing.md).
  3. Last, the checker, on both:
     - `spell dev docs fuss --branch`
     - `spell dev docs fuss <the durable doc's page>`:  it's shared content, not in the branch's diff
     - Its misses fixed, or listed for Owen in the reply.
- Turn it into durable docs:  `spell dev docs new durable <page> --title "..."` (fixes asset paths for the depth).
  - One page:  `guides/<name>.html`.
  - Several files (pages, experiments):  `guides/<name>/<name>.html`.
    Shared content too:  committed for you, like the plan doc.
  - From the plan doc:  Overview -> the body;  decisions -> a "Why" section;  open caveats -> "Limits".
  - Finish as [docs' AGENTS.md](packages/docs/AGENTS.md) says, "Finishing a page".
  - Then `spell dev docs index`.
    The index is shared too:  `epic` keeps the epic's own card current from any checkout.
- The plan doc stays in `epics/` as the record:  every phase done.
- Changelog:  write the epic's entry straight into the shared [changelog](guides/changelog.html)
  ("Changelog" in the root's `AGENTS.md`).
  - It links the plan doc and the durable doc.
  - Under "3. Merged into main" if "Finish" below merges it, else "2. In worktrees".
  - Nothing to commit on the branch for it, and no merge conflict:  every checkout sees the one file.
- Then leave the worktree:  follow the isolate skill's "Finish".
  - No move back:  the session and its plan doc stay in the window they're in.
- Last line of the reply:  "All done ..." (see the top).

## 7. Review:  `/epic review [<name>]`

Owen reviews ON THE PAGE:  the plan doc in the side bar's Review tab, where he marks items.
- Each item's buttons:  one group, Approve, Revisit, Make Todo;
  then Do Now apart, the wand, for Add Details or a revisit now.
- A TODO's instead:  the plane, "do it in the next phase" (`next`);  Revisit;  the x, "drop it" (`drop`).
  `inbox apply` applies both.
- Every other note box:  Revisit Later;  the x, "skip this" (`skip`:  nothing to do).
  `inbox apply` applies it as reviewed:  the note kept, the status left as it was.
- Choose, on option cards.
- Their colours and fills:  `plan-doc.md`, "Colours".
- He sends them with the page header's paper plane,
  or with Review Now beside it (the wand:  every revisit waiting is asked now too, epic `windows-and-review` P4).
- A running Do Now clicked again is "nevermind" (`canceled`, 7.3).

This session LISTENS:  it waits on the doc's review inbox, and acts on what arrives.
- Mechanical marks:  at once.
- Add Details and "revisit now":  by background agents.
- "Revisit soon":  answered one at a time.
- EVERY answer goes INTO its item, on the page;  the chat only links them (Q3 of `windows-and-review`).
- No modal walk through items any more (epic `review-review`, 2026-10-04;  [its plan doc](epics/review-review/review-review.plan.html), 1.1-1.2).

- Runs from ANY window, `main` or a worktree.
  - The prompt hook lets `/epic review` through, and never renames the session.
  - EXCEPT in a session titled for a DIFFERENT epic (`🚧 seo` typing `/epic review airplane`):
    the hook refuses it, with a one-line reason (epic `airplane` P12, Q10 B).
    Untitled and main sessions are allowed.
  - No worktree, no plan mode.
- Started from the PAGE too (epic `airplane` P12):  Owen clicks the "No Claude session is reviewing" pill
  (or the review line).
  - The page server finds the ONE running session titled for the epic (`🚧 <name>`, or the name as a word),
    and types `/epic review <name>` into its tab through its window's bridge:  Owen presses Enter there.
  - None, or several:  nothing is sent, and the page says which sessions it found.
- And WOKEN by the page (epic `epic-workflow` P16):  Send, Review Now or Do Now pressed with NO session listening.
  - The page server types `/epic review <name>` into the epic's running session (`🚧 <name>`);
    else opens a new session in the epic's worktree window (opening the window if it's closed);
    else, with no worktree, a new session in a main window.  Owen presses Enter.
  - Once per epic per 10 minutes, or until a session listens;  never with several sessions titled for it,
    in airplane mode, or for a Send with nothing new.
  - So marks no longer wait for Owen to remember `/epic review`:  a session typed into mid-turn reads it after.
- Every `epic` command edits the epic's ONE shared doc, from any checkout.
- The page's controls need a PAGE SERVER with the review routes (`spell dev server ensure`).
  From `file://`, or a server without them, the page shows no menus.
- Owen comes to a review COLD:  never a bare id in chat.
  Always what it is in words ("the highlight.js swap (T2)").

Commands, in the order a review uses them:
```
epic list --json                           every epic:  status, checkout, not reviewed / items
epic items <name> --json                   where reviews stand;  sections, items, states
spell dev docs link <ABS doc> --hash <id> --review --show   show the doc in the Review tab, at <id>;  prints its links
epic inbox <name> listen  /  unlisten      this session is (no longer) reviewing:  the page says so
epic inbox <name> wait                     Bash run_in_background:  exits with work (or 2:  timeout)
epic inbox <name> apply [ids]              approve / pick / todo marks into the doc;  prints what's left
epic inbox <name>#<id> working on|off      the page's spinner on an item
epic status <name>#<id> underway "<reading>"   Claude's blue status card on an item, spinner on
epic status <name>#<id> done ["<summary>"]     WORK done:  that card green (Done), the summary under it;  spinner off
epic status <name>#<id> noted "<what>"         only RECORDED Owen's choice:  an outlined Noted card (what;  what's next)
epic details <name>#<id> --file f --more | --append   a More Details card (Add Details) / a reply appended
epic inbox <name>#<id> done  /  clear      an item's request finished  /  marks dropped after a talk
epic inbox <name> [--json]                 what's waiting, sent or not
```

### 7.1 Pick a doc (no `<name>`)

- `epic list --json`:  `{ name, title, status, checkout, notReviewed, total }` each, in progress first.
- As reply text, every epic in two groups (in progress / done), most not-reviewed first.
  - E.g. `- commands (worktree commands)  5 / 9`.
- Then ONE modal, header `Epic Review`, "Which epic do you want to review?":
  - the epics with anything not reviewed
  - label `<name> (in progress)` / `<name> (done)`;  description `5 of 9 items not reviewed`
  - 4 or fewer:  all
  - more:  the next 2, then "More" (the next names), until 4 or fewer
  - any other:  typed in Other
- (The Review tab's own start page, "What would you like to review?", will replace this:
  todo T1 of `review-review`.)

### 7.2 Start

1. `epic items <name> --json`;  the doc's summary for what the epic is.
2. In chat, three lines at most, for someone who remembers nothing:
   - what the epic is
   - what's waiting on him (e.g. "4 judgement calls not reviewed, 2 open questions")
   - when he last reviewed it
3. The FIRST thing worth his time:
   - the first item, in page order, whose state is `attention`
     (red:  an open question, an unreviewed judgement call or issue)
   - none:  the first `open` (yellow) one
   - none:  the top
   - `spell dev docs link <ABS doc> --hash <that id> --review --show`:  the doc opens in the Review tab, at it.
4. `epic inbox <name> listen`.
   - Then `epic inbox <name> wait`, with Bash `run_in_background: true`.
5. END THE TURN, short:
   "Mark items in the Review tab:  each item's buttons;
   Do Now (an item's wand) starts at once (click again to call one off);
   a todo's plane queues it for the next phase, its x drops it;
   a note box's x skips it (nothing to do);
   the header's paper plane sends the rest.  I'm listening."
   - Then the doc's link pair.

### 7.3 Woken:  the `wait` command finished

Read what it printed.
Then, in this order.

Every card you finish says what REALLY happened
(Owen, 2026-10-10:  "Claude Done entries are confusing ... you haven't apparently done anything"):
- `status ... done` ONLY for work done:  an answer or reply written, details added, code changed, a phase built.
- `status ... noted "<what was recorded;  what happens next>"`, when all you did was RECORD his choice
  ("B it is";  a todo made;  "do it next phase").
  - E.g. `"Chose B · Bananas:  recorded as the answer;  waiting for the next phase, P9 · Build"`.
  - An underway card turns noted.
- Called off:  `done "Called off on the page:  nothing written."` stays (it says what happened).

The item's id chip follows too (PLAN-DOC.md "Colours"):
- dashed:  not sent
- OUTLINED:  sent / on it / still due
- solid:  done
- Leave work you queued `queued` until it's built, so his chip stays outlined.

1. Exit 2 (timeout, nothing happened):  arm `wait` again, and end the turn with one line ("still listening").

1b. CANCELED:  Owen said "nevermind" on a running Do Now (epic `windows-and-review` P2).
   - Stop that item's background agent (`TaskStop`).
   - Then `epic status <name>#<id> done "Called off on the page:  nothing written."`.
   - And `epic inbox <name>#<id> done`.
   - An agent that finishes anyway is refused (`epic details` errors:  "Owen called this request off"):
     nothing lands.
2. NOW requests:  Add Details, revisit now;  after Review Now, every revisit Owen had marked.
   - `wait` already marked them `working`:  the page spins.
   - Per item, FIRST its status card:  `epic status <name>#<id> underway "<reading>"`.
     - What you take the task to be:  one or two sentences, plain words, no file names.
     - Owen sees it at once, blue, under his note (P13 of `epic-components`).
   - THEN a BACKGROUND `Agent` (`run_in_background: true`).
     Each prompt carries:
   - Which doc, which item (id, title), and the rules:
     - `plan-doc.md` "Rules":  cold reader, bullets, examples, Net effect
     - and "Prose":  the blocks are ELEMENTS
       (`<epic-code>`, `<epic-aside>`, `<epic-net-effect>`, `<epic-choices>`, `<epic-field label>`)
     - never `ui-accordion.spell-code`, or a `<p><b>Net effect:</b></p>` by hand
   - Add Details:  read the item, the code and docs it names, then write what its text leaves out, as MORE details.
     - `epic details <name>#<id> --more --file <html>`.
     - The item's text stays on top ("Original Reply").
     - Yours goes under it, in a white "More Details" card (P3 of `windows-and-review`).
       So don't repeat the text:  build on it.
   - Revisit now:  answer Owen's note (quote it), in an `<epic-reply from="Claude" at re>`
     (`plan-doc.md`, "Review inbox", its example).
     - What he asked, then the answer with evidence:
       real code in an `<epic-code>`, the command and its output.
     - Option cards when he must choose:  an `<epic-choices>` inside the reply, so he picks on the page.
     - An `<epic-net-effect>`.
     - `epic details <name>#<id> --append --file <html>`.
     - With a pick ("picks B · ..., asks:  ..."):  answer about THAT option.
       Never decide the question:  he confirms with a plain pick.
   - Last:  `epic status <name>#<id> done ["<summary>"]`:  the card turns green.
     - A summary only when there's something worth saying:  a surprise, a choice made, something left undone.
     - Then `epic inbox <name>#<id> done`.
   - Up to 5 agents at once (root rules);  more:  the rest after.
3. SENT marks:  `epic inbox <name> apply`.
   - Approvals, picks and todos land in the doc;  it prints each.
   - A pick works on ANY item's cards, a reply's too (I8 of `epic-components`):
     a question is answered with it, any other item approved with it.
   - `apply` itself gives each pick, todo and queued todo its outlined NOTED card;  an approval gets none (Q19):
     - "Chose B · ...:  recorded ...;  waiting for ..."
     - "Made todo T23 ..."
     - "Queued for P10 · ..."
   - Then each "to talk over" (revisit soon), one at a time:
     - `status ... underway "<reading>"` as you take it up.
     - Answer his note INTO the item, as a reply:  `details --append`, with the reply markup of "revisit now" above.
       His note quoted, the answer with evidence, option cards when he must choose, so he picks ON THE PAGE.
     - Then `status ... done ["<summary>"]`, since you wrote an answer.
       Only noting what he said, no answer needed:  `status ... noted "<what>"`.
     - Then `inbox <name>#<id> clear`, and `review <name>#<id> "<outcome>"`.
   - In chat:  one line per item, with its link (`spell dev docs link ... --hash <id>`), never the answer itself.
     (Q3 of `windows-and-review`:  a long review stays readable.)
   - He answers on the page (Revisit again), or says so in chat.
     A quick yes / no:  a modal.
   - A call made name by name (he wants each name's context before a rule's renames go in):
     a SYNTAX-CHOICES page ([the syntax-choices guide](guides/syntax-choices.html)).
     - `epic choices new <slug> --epic <name> --rows <rows.json>`.
     - Then `show <slug> --wait`, in the background.
   - "picks B · <card>, asks:  <note>" (a pick with a revisit, "B, but ..."):  `apply` leaves it.
     - `status ... underway`, then answer the note about B.
     - A question, once he agrees:  decide it yourself,
       `epic decide <name>#<id> "<card title>" --option B`.
       Any other item:  he confirms with a plain pick.
     - Then `status ... done`.
     - `inbox clear` / `done` KEEP his pick as that set's `chosen` (with a Noted card), unless you decided otherwise.
       Once he picked, the card says Chosen.
   - The page counts this session as gone once its heartbeat is 90s old.
     - `wait` stamps it every 30s.
     - So do `inbox apply`, `done`, `clear`, `working` and `status`.
     - A long talk without them shows "nobody is reviewing", until `wait` runs again.

3b. COMMENTS (epic `airplane` P11):  Owen's comments on the doc's blocks, or on text he selected (the bullhorns).
   - Ids `cm1` ...
   - Each is a THREAD on the page:  his comment, your answers, his replies, until he closes it
     ("that's good" / "skip it").
   - `epic inbox <name>` lists the ones waiting, under "comments".
     Each with the block's anchor (`p3#field-2`, an item's id) and the quoted text.
     - A REPLY of his on a thread is waiting work too, as a new comment is:  listed under its comment,
       "Owen replied:  ...".  Answer his latest words, the thread above for context.
   - Owen's SEND hands them over, as it does marks (Owen, 2026-10-10:  Send stays the way comments reach you).
     - A new comment, or his reply on a thread, turns Send blue on the page;  pressing it (or Review Now) wakes `wait`.
     - `wait` prints them under the send:  "comments, to answer on their threads", with his latest reply.
     - Each goes over once, until he speaks on its thread again.
     - A comment never wakes `wait` by itself, unsent.  Still check `inbox` on every wake:  one may wait unsent.
   - FIRST, as you start on one:  `epic inbox <name>#cm3 working on`.
     - His thread shows "Claude: thinking…" at its end (a turning notch) until your answer lands:
       `inbox <name>#cm3 done` turns it off.  Dropped without an answer:  `inbox <name>#cm3 working off`.
     - What he said before it counts as read:  more words of his go after it, as a new reply (waiting again).
   - Answer each like a revisit's note:  INTO the item it's on (`details --append`, his comment quoted).
     On a phase field or Overview prose:  into that phase or part.
   - Then `epic inbox <name>#cm3 done --file <answer.html> [--commit <sha>]`.
     - The answer goes on his thread too (a line or two;  the full one is in the doc):  his turn, the thread opens.
     - `--commit`:  the commit it was built in;  his Done line shows it.
     - No `--file`:  the thread says "Answered in the plan doc".
4. Arm `wait` again (always, unless he said stop), then reply:
   - what landed:  bullets, items in words, ids after
   - what's being worked on in the background
   - what needs him
   - the doc's link pair last

- A background agent's own completion notice wakes the session too.
  - Nothing to do but check `inbox` shows the item done.
  - Don't re-arm a second `wait` while one runs:  `inbox` would print both.
    Check the background tasks.

### 7.4 Finish

When Owen says he's done ("stop reviewing", "that's it"), or the session must stop:
- stop the waiter (`TaskStop`), then `epic inbox <name> unlisten`
- `epic log <name> "Review:  <n> approved, <n> answered, <n> to todos, <n> details added"`
- reply:  what was decided and done (in words, ids after), and what's still waiting on him;  the link pair
- the doc's changes:  nothing to commit, from any checkout.
  It's shared content, committed for you at the turn's end.

## 8. Resume:  `/epic resume [<name>]`

A NEW session picks up an epic whose own session is gone (closed, crashed, compacted beyond use).
- It works in the epic's checkout, in a window Owen picks, from where the plan doc says it stopped.
- The plan doc is the memory:  read it, don't redo it.

0. Already home:  this window or this session is ALREADY the epic's own (Owen, 2026-10-10):
   - the window:  `spell dev window which` says `workspaces/ongoing/<name>`
   - or the session:  its folder is `.claude/worktrees/<name>`
   - and `<name>` has a plan doc (`epics/<name>/`), and is the `<name>` typed, if one was.
   - Then that's the epic, and nothing is asked:
     no "Which epic?" modal (step 1), no new-window-or-stay modal (step 3).
     - Step 3 is `EnterWorktree` with `path` (if not in it yet), then `spell dev window stay <name>`.
   - One line says so:  "this window is `⎇ <name>`:  resuming it".
1. Which epic:
   - `<name>` given:  that one.
     No plan doc at `epics/<name>/`:  say so, then the list below.
   - none given:  the epics in progress, minus those with a running session.
     - `epic list --json`, status `in progress`
     - the running sessions:  `spell dev worktree list`
     - One:  use it, naming it in the reply.
     - Several:  AskUserQuestion "Which epic?", label `<name>`,
       description its next phase and checkout (`epic summary`).
   - Rename this session `<name>`, first.
     - A typed `/epic resume <name>` already was, by the prompt hook
       ([prompt-gate.mjs](.claude/hooks/prompt-gate.mjs)).
     - Else `spell dev session title "🚧 <name>"`.
2. Its own session still running (not this one):  as [the unpark skill](.claude/skills/unpark/SKILL.md), step 2.
   Tell it, or resume here.
   - Found by `spell dev worktree status <name>`:  `sessions`, `running: true`.
3. Where:  the plan doc's checkout (`list --json`, `checkout`).
   - `main`:  no worktree;  work in the main checkout, this window.
   - `.claude/worktrees/<name>`:  as [the unpark skill](.claude/skills/unpark/SKILL.md), step 3.
     - That's `stay-check --epic`, a new window or stay, and `EnterWorktree` with `path`.
     - A `PARKED-<name>.md` there:  it was parked.
       `/unpark`'s steps instead, and stop here.
   - The worktree is gone but branch `<name>` isn't:
     `EnterWorktree` with `name: "<name>"` re-makes it on that branch (the `WorktreeCreate` hook).
   - Neither:  say so, and ask before starting the epic over.
4. Catch up, in the checkout:
   - What's done, what's half done:
     - `epic summary <name>`
     - the active phase's part file, and the log's last lines
     - `git status --short` and `git log --oneline -5`
   - Behind `main` (`git log --oneline HEAD..main` not empty):
     `spell dev worktree merge-main`, as [the park skill](.claude/skills/park/SKILL.md)'s "Resume", steps 2-4.
     - Resuming is the go-ahead for its merge commit.
   - No `node_modules/`:  `yarn install`.
   - `epic open <name> --review`.
     In a new window:  after the handoff, as "2. Session", step 5.
5. Reply, for someone who remembers nothing:  three lines at most.
   - What the epic is, where it stopped, and what's waiting on Owen (open questions, issues, tests).
   - Uncommitted work in bold.
   - Then:
     - a phase `active` with work under way:
       AskUserQuestion "Carry on with P<N> · <Name> (Recommended)" / "Stop here"
     - else, as "5. Each phase", step 5:  "Start P<N> · <Name> (Recommended)", the top open issue, "Stop here"
     - no phases yet (it hung while planning):  "3. Plan", from the prompt quoted in its Overview
     - a new window:  do all of this THIS turn, then end it (the move happens when it ends).
       The modal waits for the next turn, in the new window.
   - Never start a phase without that pick:  Owen reviews each phase before the next.

## 9. Future:  `/epic future <name> [text]`

Write an idea down as a FUTURE epic (epic `epic-future`, 2026-10-07).
- A stub plan doc and an analysis page;  NO plan, worktree, window or phases.
- `/epic <name>` plans it later, from what this leaves.

- Runs from ANY window, `main` or a worktree:  the prompt hook lets it through, and titles the session `📅 <name>`;
  not one titled for another epic, which keeps its title (epic-workflow I5).
  - No worktree, no plan mode, no move.
1. Name, collisions, kickoff prompt:  as "1. Name".
   - The rest of the text is the idea, kept verbatim in `~/.spell/prompts/<name>.md` until the doc holds it.
   - An existing epic of that name:  say so and stop.
2. The stub:

   ```sh
   epic new <name> --future --title "<Title>" --prompt-file ~/.spell/prompts/<name>.md
   ```

   - Then delete the prompt file.
   - Hand-write its `<epic-summary>`:  the idea in two sentences, what changes for Owen.
   - It's a plan doc with `<epic-page future>`:
     - a FUTURE label
     - a "Future epic" notice, in place of "Plan hung?"
     - no branch or worktree
   - `epic list` says `future`.
     The Epics index gives it a seedling, between the open epics and the done ones.
3. Explore, read-only (agents allowed, root rules):  just enough to see the problem, the options and the hard parts.
   - Not a plan:  no phases, no estimates.
4. The ANALYSIS page:

   ```sh
   epic ask new analysis --epic <name> --title "<Title>:  analysis"
   ```

   Written as [the details skill](.claude/skills/details/SKILL.md) says:
   - "Where we are":  that it's a future epic, from which idea, and that answering shapes the plan, later
   - Context:
     - the problem in plain words
     - what exists today (real code)
     - the shape you'd propose (an example)
     - what goes away
     - the catch (what makes it hard)
     - a rough size
   - one question per HIGH-LEVEL open choice (what, where, how far, when):  options side by side, one recommended.
     Not the small ones:  those are the plan's.
   - Then `yarn vp fmt <its real path>`.
   - Then `epic ask show <name>/analysis --wait`:  Bash, in the background.
     It opens in the side bar's Review tab.
   - End the turn with its link pair (`spell dev docs link <page> --review`).
5. The answer (the waiter wakes the session):  each question becomes a decision:

   ```sh
   epic add <name>#D "<answer>" --details "<p>the question, the pick, Owen's note, a link:  <a href=\"details/analysis.html#q2\">analysis Q2</a></p>"
   ```

   - A note asking something:  answer it in the reply, and in the decision's details.
6. Reply:  what the future epic is, what was decided, and that `/epic <name>` plans it.
   Then the plan doc's link pair.

## 10. Add a phase:  `/epic phase [ids] [name]`

Owen adds a phase to the epic under way, from items it already has, or from scratch.
- Epic `skillz` P4, Owen 2026-10-07:
  "`/epic phase J1 J5, t3` => take judgement 1+2 and todo #3 and make a new phase".

```
/epic phase                      a new phase with no antecedents:  the text on the lines after says what
/epic phase J1 J5, t3            from those items (spaces or commas, any case)
/epic phase add-phases           named "Add Phases"
/epic phase t3 Retry Logic       both:  from T3, named "Retry Logic"
  <text on the lines after>      Owen's input:  what the phase is for, how
```

- THIS epic:  the session's own, its worktree's plan doc (`epic list --json`, `checkout`).
  - None (the main checkout, no epic in this session):  say so in one line, and stop.
- The first line, after `phase`:
  - each word that's an item id of the doc (`[a-z]\d+`:  `J1`, `t3`, `Q2`, `I4`) is an ANTECEDENT
  - the other words, in order, are the phase's name (`add-phases` -> `Add Phases`)
  - no name:  make one, 2-4 words, from the items and the text
  - an id the doc doesn't have:  say so, and go on without it
- The rest of the prompt (the lines after):  Owen's input, word for word, into the phase's goal.
- The work goes to a background `<name>-plan-doc` agent (root `CLAUDE.md`, "Delegated work").
  - Reply one line, `adding:  P<n> · <Name> (from J1, J5, T3)`, and end the turn.
  - Its prompt:
    1. read each antecedent whole (`epic items <name> --json`, its part file), and the code it names
    2. draft the phase as "4. Fill the doc" does:
       - symptom (one line), changes (two or three)
       - goal:  a bullet per outcome, Owen's input in it, each antecedent linked (`<a href="#j1">J1</a>`)
       - files, verify, estimate
    3. where:
       - before Doc Review, while Doc Review is still to do (`--before <its number>`:  it moves down one)
       - else last
       - it prints the new number:

       ```sh
       epic add-phase <name> "<Name>" --symptom ... --changes ... --goal ... --files ... --verify ... --estimate ... [--before <N>]
       ```

    4. each antecedent:  `epic queue <name>#<id> "P<n> · <Name>"`.
       It's that phase's work now;  closed when the phase does it.
    5. `epic log <name> "P<n> added from <ids>:  <Name> (Owen)"`, `check`, `open`
- When its report comes back:
  - the new phase's link pair (`spell dev docs link <doc> --hash p<n> --review`)
  - and the next step, as "5. Each phase", step 5's modal ("Start P<n> · <Name>" among them)

## 11. Start:  `/epic start <P1 | ids>`

Owen starts work in THIS epic, in one block:  a phase, or a handful of its items together.

```
/epic start P3                   phase 3, as "5. Each phase"
/epic start J3 J4 T6             those three items, worked as one block
  <text on the lines after>      Owen's input for the work, word for word
```

- THIS epic:  as "10. Add a phase".
  An id it doesn't have:  say so and stop (nothing half-started).
- A phase (`P<n>`):  "5. Each phase" for it.
  - Not the next one in order:  say so in one line, then go anyway.
  - Done already:  say so and ask (modal) "Reopen P<n>?" before touching it.
- Items (`J3 J4 T6`, spaces or commas, any case):  one block of work in this epic.
  - Read each whole:  together they're the task, Owen's text the steer.
  - Mark each in progress:  `epic queue <name>#<id> "started with <the other ids>"`.
  - Do the work, recording as "5. Each phase", step 2 does.
  - Each done:  `close <name>#<id>` (a question:  `decide`).
    Each talked through:  `review <name>#<id> "<outcome>"`.
  - ONE commit for the block:  `<name> J3 + J4 + T6:  <summary>`.
    - The epic's name first, so `commits --backfill` files it under each item.
    - Then `epic commits <name> --backfill`.
  - Reply as a phase's end does:  what was done per item (in words, ids after), checks with numbers, what's next.
- Bedtime mode on (`epic summary <name> --json`, `bedtime`):  no modals, as `/bedtime` says.

## 12. Request:  `/epic request <epic> [<rN>...]`

A REQUEST is something Owen asked for in another session, sent here instead of done there
(the `/send` skill, [.claude/skills/send/SKILL.md](.claude/skills/send/SKILL.md);  epic `epic-workflow`).
- It's a folder, `epics/<epic>/requests/r3/`:  `request.md` (his words verbatim, the sender, what it was looking at)
  and the screenshots he pasted.
- It reaches this session one of three ways:
  - a message from the sender:  "New request r3 for epic `<epic>` ...":  the same steps
  - a NEW session in the epic's window, `/epic request <epic> r3` typed in (the epic's session wasn't running):
    first `EnterWorktree` with `path: ".claude/worktrees/<epic>"`, as "Launched" does
  - the sender IS this epic's session:  it follows these steps itself
- The prompt hook titled the session `🚧 <epic>` (so later requests reach it), and refuses `/epic request` in a session
  titled for another epic.
- No `<rN>`:  every request still `new` (`epic requests <epic>`).

```
/epic request epic-workflow r3        take up r3
/epic request epic-workflow           every new one
```

1. `epic requests <epic> --json`:  the request(s), status `new`.
   - Read each `request.md`, and look at each screenshot (`Read` on the image).
2. One line, at once:  "taking r3 (from `🚧 python`):  <his first words>".
3. The filing goes to a background `<epic>-plan-doc` agent (root `CLAUDE.md`, "Delegated work"), the session free.
   Its prompt, per request (Q3 of `epic-workflow`:  join a matching phase, else a new one):
   1. read the request, and every to-do phase (`epic summary <epic> --json`, each one's part file)
   2. a phase still TO DO (never active or done) about the SAME thing:  the request JOINS it
      - its goal gets a bullet, Owen's ask in short, linked:  `<a href="requests/r3/request.md">r3</a>`
        (`update <epic>#P<N> --goal ...`, the old bullets kept)
      - `updated <epic>#P<N> "<p>r3 joined:  ...</p>"`
   3. else a NEW phase, drafted as "10. Add a phase" drafts one, his words as Owen's input
      - `--before <Doc Review's number>` while Doc Review is still to do;  else last
   4. `epic file <epic> r3 <N>`:  his words, the context and the screenshots go into phase N's Requests field,
      and the request is marked filed (`P<N>`)
   5. `epic check <epic>`;  report one line per request:  "r3 joined P6 · Comment Threads" or
      "r3:  new P8 · Retry Logic"
4. Its report back:
   - one line per request, with the phase's link pair (`spell dev docs link <doc> --hash p<N> --review`)
   - then, when no phase is under way and bedtime mode is off:  "5. Each phase", step 5's modal,
     "Start P<N> · <Name>" first
   - a phase under way:  no modal;  the new work waits its turn.
- A request that needs no phase (already done, a duplicate):  `epic file <epic> r3 "<why>"`, and say so.

## Migrations:  bringing epic pages up to today's markup

Epic `epic-workflow` P8.  `epic migrate` runs named, dated steps over pages, by page kind
([PLAN-DOC.md](../../../packages/epics/src/tool/PLAN-DOC.md), "Migrations").
- After ANY change to epic page markup (or another page kind's):  its step goes in the same commit (epics'
  `AGENTS.md`, "Rules").  Before merging:  `epic migrate --all --dry-run`, its report in the phase's
  summary.
- Once it's on `main` (a standing epic:  right after the phase merges):
  1. `epic migrate --all --notify`:  idle epics are migrated there and then;  each epic with a RUNNING
     session is skipped, and printed under `TELL:` with its line.
  2. Send each `TELL:` line, as is, with `SendMessage` to the session it names (`to 🚧 seo:  ...`):  the command
     can't send them itself.  One message each, never a request (`epic send`):  it's a chore, not a phase.
  3. Report one line:  "migrated N epics;  told seo, docs".
- A session RECEIVING a migrate message ("New epic page migration step ... run `epic migrate <epic>`"):
  - run it on its OWN epic only, at its leisure:  now if idle or between phases;  else at the end of the phase under
    way, when running it now would disrupt that work
  - it may commit what changed WITHOUT asking (Owen's standing OK, 2026-10-11), as `<epic> migrate <step>:  ...`
    - epic pages are shared content, committed by the turn-end hook:  usually nothing is left for the branch
    - "commit" means the branch's own changes, when a step touched tracked files
  - what the report leaves for a person ("left for you":  a link to a gone id, a comment whose words changed):
    fix it in the doc, or bring it up at the next review

## Cheat sheet (`epic ...`, from anywhere in the repo)

```
new <name> [--title "Title"] [--prompt "..." | --prompt-file f] [--future]
                                                    create from the template, update the docs index;  --future:  a
                                                    future epic (9.);  new on a future epic's doc plans it (promoted)
add-phase <name> "Short Name" --symptom .. --changes .. [--goal ..] [--files ..] [--verify ..] [--estimate 2h]
          [--before N]                              --before:  inserted as PN;  the to-do phases from N move down
update <name>#P<N> [--symptom ..] [--changes ..] [--goal ..] [--files ..] [--verify ..]   set ("" removes) fields
updated <name>#P<N> "<p>what changed</p>" [--summary ".."]   phase N's plan changed:  <epic-update>, after Goal
add-request <name>#P<N> <rN> --from "..." --file f   a request into phase N's Requests field (`epic file` runs it)
update <name>#P<N> --estimate "1-2h"                change a phase's estimate;  the Overview's total follows
phase <name>#P<N> todo|active|done [--no-open]      done drops UPDATE labels / prose updates;  reloads the tab
add <name>#Q|#J|#C|#I|#T|#V|#D "title" [--details "<p>html</p>"] [--calm]   prints the id (C3)
calm <name>#<id> [<id>...] [--loud]                 calls / issues not urgent (yellow);  --loud:  red again
decide <name>#<Q id> "answer" [--details html]      answer a question, INTO it:  prints its id (Q3)
commit <name>#P<N> | <name>#<id>  <sha> "..."       list a commit under a phase or an item
commits <name> --backfill                           every phase / item commit (`P3:`, `<name> I3:`), once
update <name> --standing [on|off]                   a standing epic:  each phase merges on its own, never done
close <name>#<id>  /  reopen <name>#<id>            close (done) / open again, never delete
cancel <name>#<id> ["why"]                          made moot by another decision:  struck;  reopen undoes it
log <name> "text"                                   timestamped line in the doc's log
bedtime <name> start "P3-P6" | done "summary"       bedtime mode on / off:  the run's changes stay green (`/bedtime`)
overnight <name> remove                             an older doc's Overnight report (before 2026-10-05), once read
prompt <name> "text" | --file f                     set the prompt quoted in the Overview
migrate [<kind>] [<name>... | --all] [--file f] [--step s] [--dry-run] [--notify] [--list]
                                                    pages up to today's markup, every step of their kind, oldest
                                                    first, safe to run again;  alone:  every kind, every page;
                                                    --notify:  running epics told (TELL lines), idle ones migrated
summary <name> [--json]                             phases, next phase, open questions/issues/caveats/todos
check <name> [--no-browser]                         ids, links, phases, then the browser check
open <name> --review                                show in the side bar's Review tab
review <name>#<id> ["outcome"]                      mark reviewed today (outcome to the log)
defer <name>#<id>                                   deferred:  dated, still not reviewed
queue <name>#<id> "work"  /  unqueue <name>#<id>    work a review decided on, waiting  /  started or dropped
items <name> --section s --spec <file>              a review's item picker, as a details page spec
items <name> [--section s] [--filter unreviewed|open|reviewed|queued|all] [--json]
                                                    where reviews stand, the to-do list, sections and items
list [--json]                                       every epic once:  status, where it runs, not reviewed / all
backfill <name> | --all [--apply]                   one-off:  mark what past sessions show Owen went through
```
- Every command edits the epic's ONE shared doc, wherever it's called from ("Shared content" at the top).
