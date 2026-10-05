# Plan docs

How to write and update `epics/<name>/<name>.plan.html`, the live doc behind a `/epic <name>` session.
`plan.html` beside this is the template;  `scripts/plan-doc.js` (`spell dev plan-doc`) edits the structured parts.

## Rules

- Use `spell dev plan-doc <command>` wherever one exists (below):  it keeps ids, icons, UPDATE markers and the
  "updated" date consistent, and locks the file against parallel agents.  Hand-edit only prose:  the summary,
  Overview, phase bodies, item details.
- Write for Owen coming back COLD (2026-10-04;  the details skill's "Writing for Owen" is the same rule):  he runs
  5+ epics, and reads an item weeks later, from another session.  Enough that he can pick up ONE phase or item on
  its own.  NOT caveman:
  - a plain lead sentence first:  what it is, for whom, how he'd notice it
  - then bullets, one idea each, nested for sub-points;  never a list run together inside a sentence ("a, b, c and
    d" is four bullets)
  - full words, the articles back in;  short sentences
  - a concrete example for anything tricky:  the real code, the command and what it prints, a before / after, a
    table of values
  - ids explained:  "the inbox file decision (D1)", never a bare `D1`
  - identifiers, paths and numbers exact
- Questions, issues, judgement calls and decisions end with a **Net effect** (Owen, 2026-10-04):  what concretely
  changes, one bullet each:

  ```html
  <p><b>Net effect:</b></p>
  <ul>
    <li><code>D7 (Q3)</code> becomes <code>Q3</code>, answered</li>
    <li>rule semantics changed:  an answered question is no longer struck</li>
  </ul>
  ```

  For a question:  the recommended option's net effect (each option card may carry its own).
- Lists:  bulleted, or numbered when order or reference matters.
- NEVER delete an item:  close it (`spell dev plan-doc close`), and it stays, closed (not struck).  An item another
  decision made moot:  `spell dev plan-doc cancel`, the one status shown struck through (J16 of `review-review`).
- NEVER drop an item's earlier text (Owen, 2026-10-04, I7 of `review-review`):  the question as first asked, its
  explanation, its option cards, an earlier answer.  A rewrite -- Add Details, an agent's or a phase's rewrite (e.g.
  `review-review`'s P8 "Rewrite The Rest"), or one by hand -- MOVES it into the item's folded **Original
  Discussion** (markup under "Markup the script writes"):
  - `details <name> <id> --file` and `decide` (answering again) do it for you
  - rewriting by hand:  write the new text through `details --file`, or put the old text in with `original <name>
    <id> --file <old.html>`;  never just overwrite it
  - text already lost:  recover it from the shared content repo's git history, then `original ... --as-of
    "YYYY-MM-DD HH:MM"` (when it was replaced)
- Keep the doc current as you go:  a caveat, issue or decision found mid-phase goes in NOW, not at the end.

## Page header

The h1 sits in a sticky header, `<ui-sticky class="spell-h1"><header class="spell-page-head">`, with the step
label at its right (`.plan-step`, written by the script):  the active phase (orange), else `DONE` (green) once every
phase is, else the next phase (grey).

- The h1 and `<title>` read `Epic: <Title>` (`new` writes both;  `migrate` brings an old doc's in line).  Scripts
  reading the title drop the `Epic: ` (`plan-doc.js` `TITLE_PREFIX`).
- Under the header, the runtime adds the review line (every plan doc, no markup):  "To review this doc, type
  `/epic review <name>`";  a click copies the command.  Never write it by hand.

The meta lines (`ui-list.plan-meta`) end with the durable doc, once Doc Review has written one (2026-10-04);  the
durable doc's own meta list (`ui-list.spell-meta`) starts with the plan doc, ONE standard line each way:

```html
<!-- the plan doc's last meta line -->
<ui-item icon="book"><b>Durable doc:</b>  <a href="../../server.html">Page Server</a></ui-item>
<!-- the durable doc's first meta line -->
<ui-item icon="map"><b>Plan doc:</b>  <a href="epics/unified-server/unified-server.plan.html" target="unified-server">epic unified-server</a></ui-item>
```

Below the meta lines, while planning:  the "Plan hung?" notice, `ui-message.plan-hung`.
- How to restart a hung plan:  a new session in the worktree's window, `/epic <name>`, "Reuse".  Plus the kickoff
  prompt in a `ui-code.plan-hung-prompt` with a copy button (`setPrompt()` keeps it in step with the Overview's
  quote).
- Why:  `/epic` writes this stub doc BEFORE planning, so the prompt survives a hung or lost session.
- The script removes it when the first phase is added (`add-phase`):  the plan exists;  never add it back by hand.

## Sections (ids are fixed)

| Section | id | What |
|---|---|---|
| 1. Overview | `#overview` | 2-sentence summary (`p.plan-summary lede`), the prompt that started the plan (`blockquote.plan-prompt`, folded in a "Kickoff prompt" aside), the total estimate (`p.plan-estimate`, written by the script), then the substance in numbered sub-sections (`#o1` "1.1 Structure" ...):  becomes durable docs |
| 2. Phases | `#phases` | progress bar, then one sub-section per phase (`#p1` ...):  its estimate as the title's badge;  Goal (bullets), Done (bullets, once done), Files and Verify (hidden until the folder / flask toggle on the Phases title is pressed) |
| 3. Questions | `#decisions` | open questions first (waiting on the user;  each also asked with AskUserQuestion), then the answered ones, in id order:  settled unless new facts arrive.  A decision IS an answered question (D13 of `review-review`, 2026-10-04):  `decide` writes the answer INTO the question;  `add ... decision` makes a question born answered.  Icon `file circle question` |
| 4. Judgement calls | `#judgements` | choices Claude made WITHOUT the user (a `/bedtime` run, an agent mid-phase):  title the choice, details "chose X over Y because Z" + the options;  open until the user reviews it, `close` = accepted, disagreement becomes a question.  Its phase's "To review" line lists it while it's open and not reviewed (never hand-write a "Judgement calls:" line;  an old doc's stay, J14 of `review-review`).  Icon `gavel` |
| 5. Caveats | `#caveats` | limits and risks we accept |
| 6. Todos | `#todos` | later work that isn't a caveat or an issue |
| 7. Issues | `#issues` | problems found, open until fixed |
| 8. To test | `#tests` | what Owen checks by hand before merging:  each a step and what should happen (`add <name> test`);  `close` one once it passes |
| 9. Log | `#log` | one-liners of plan changes, stamped with local date and time |

- Every section is a `<ui-section>` (markup below):  its title sticks, it folds from its chevron (the reader's folds
  are remembered per page), a rule runs under its title.
- A section with items shows `open/all` at its title's right (its `badge`, set by the page runtime), and its open
  count as a badge in the contents and the rail.  Open:  any `data-status` but `done` and `decided`, so "Questions"
  counts the questions waiting.
- Older docs:  `spell dev plan-doc migrate <name>` brings one up to date, whatever its age, and prints what it changed:
  - before 2026-10-01:  a `#plan` section (summary + phase list), a separate `#questions`, another order (an
    answered question moves beside the decision whose title names it, `(Q8)`)
  - before 2026-10-02:  `section.s2|s3` > `ui-sticky.spell-h2|h3` > `h2|h3` sections, phases in
    `#phases-section` (the id is gone:  `#phases` is the section now), `data-fold="closed"`
  - before 2026-10-04:  `D` items (`d7`) beside the struck questions they answer.  `migrate` merges each INTO its
    question, as its answer card (`<div class="plan-answer-block" id="d7">`, titled `D7 · ...`:  old `#d7` links
    still land, opening the question);  a stand-alone one becomes a question born answered;  a struck one
    `canceled`.  It chooses the option card the decision names (`B: ...`, `option B`, or the option's words)
  - before 2026-10-05:  an answered question's answer card FIRST, the question and its option cards below it.
    `relayout <name>` (or `--all`;  `migrate` does it too) puts each in the order it happened:  the question, its
    Choices, the answer (I9 of `review-review`, markup under "Markup the script writes");  idempotent, and nothing
    is dropped

Section markup (the template's;  a hand-written Overview sub-section is the same, nested in `#overview`):

```html
<ui-section id="overview" header="1. Overview" sticky collapsible dividing collapsed>
  <ui-icon slot="icon" name="lightbulb"></ui-icon>
  <p class="plan-summary lede">...</p>
  <ui-section id="o1" header="1.1 Structure" sticky collapsible dividing collapsed>
    ...  <!-- sub-sub-items:  <h4 id> -->
  </ui-section>
</ui-section>
```

- `header` is the title;  a title with markup is a `<span slot="header">` first inside instead (`1.2 The <code>x</code>
  API`)
- every section `sticky collapsible dividing collapsed`:  everything starts folded, the reader opens what they want
  (`packages/docs/AGENTS.md`, "Writing a page")
- in the browser, EVERY section of a plan doc starts folded (`spell-doc-runtime.js` `wireSectionFolds()`), unless
  the reader opened or closed it before.  `collapsed` in the markup still matters for pages opened from disk
  without the runtime, and for the script's own bookkeeping.  A link to any id inside (`#q3`, `#p2`) unfolds the
  sections around it and lands on it
- NEVER change an `id`:  the items, the log and other docs link to them

## Ids:  short, so they're easy to say in chat

- Items:  `q1` questions (answered ones are the decisions), `j1` judgement calls, `c1` caveats, `i1` issues, `t1`
  todos, `v1` tests ("verify":  `t` is taken).  Shown as `Q1`, `J1`, `C1` ...
  - docs from before 2026-10-04 also have `d1` decisions, each beside the struck question it answers;  the script
    reads both shapes, and `migrate` merges them (the `d7` id stays, on the answer card:  `close d7` finds its question)
- Phases:  `p1` ...  Shown as `P1 · Short Name`:  a 2-4 word name, so "start P2" is unambiguous.
- Link to them in prose:  `<a href="#i2">I2</a>`.  `spell dev plan-doc check` fails on a link to a missing id.

## Markup the script writes

Step label (in the page header's `.plan-step`):

```html
<ui-label basic color="orange" icon="circle half stroke" href="#p2">P2 · Short Name</ui-label>
```

Phase section (in `#phases`, after `<ui-progress class="plan-progress">`:  `value` = phases done, `total` = all,
`hidden` while there are none):

```html
<ui-section id="p2" data-phase="2" data-status="done" header="P2 · Short Name" badge="1-2h" sticky collapsible dividing collapsed>
  <ui-icon slot="icon" name="circle check" color="green"></ui-icon>
  <ui-list class="plan-phase-body">
    <ui-item icon="bullseye"><b>Goal:</b>  <ul><li>what it's for, a bullet per outcome</li></ul></ui-item>
    <ui-item icon="circle check"><b>Done:</b>  <ul><li>what was built, most-asked-about first</li></ul></ui-item>
    <ui-item icon="code branch" class="plan-commits"><b>Commits:</b>  <ul class="plan-commit-list">
      <li data-sha="2c71ac57..."><a class="plan-commit" href="https://github.com/spell-app/spell-app/commit/2c71ac57..." target="github">2c71ac5</a>  one or two sentences</li>
    </ul></ui-item>
    <ui-item icon="folder"><b>Files:</b>  what changes</ui-item>
    <ui-item icon="flask"><b>Verify:</b>  how we know it worked</ui-item>
    <ui-item icon="list check" class="plan-to-review"><b>To review:</b>  <a href="#j1">J1</a>, <a href="#c3">C3</a></ui-item>
  </ui-list>
</ui-section>
```

- Goal:  a `<ul>`, one bullet per outcome, in Owen's terms (what he'll see or be able to do), not the build steps.
- Done:  written when the phase is done (`phase <name> <N> done --done "<ul>..."`), a `<ul>` of what was BUILT,
  ordered by what Owen asks about first:  where to see it, what changed in how he works, what's still rough or
  untested by hand, then the rest.  Not the commit list:  that's Commits.
- Commits:  written by the script, after Done (else Goal), oldest first:  `commit <name> <sha> --phase N "..."`
  adds one;  `commits <name> --backfill` reads the doc's git history (`git log --follow`) and adds what's missing
  - phase commits by subject:  `P3:  Name -- summary` (also `P4 + P5:`, `WIP P3:`, `<epic> P3:`, `P6a:`,
    `P1 follow-up:`);  the sentence is what follows ` -- `, else the colon
  - item fixes:  `Fix I3:  ...` (or `<epic> I3:`), listed in the item's details
  - the short sha links to GitHub (from `git remote get-url origin`);  no GitHub remote:  `<code class="plan-commit">`
- To review:  written by the script on every edit, LAST:  the items added while this phase was active
  (`data-phase`) that are still open, not reviewed and not under way, in page order;  none:  no line.  It replaces
  the hand-written "Judgement calls:" line;  an old doc keeps its own (J14 of `review-review`), the line after it.
- Files and Verify:  hidden in the browser until the folder / flask toggle on the Phases title is pressed
  (`spell-doc-runtime.js` `wirePhaseToggles()`);  still written for every phase.
- Estimate:  the title's `badge`.  Wall-clock time for Claude to do the phase, agents included, Owen's review not.
  `30m`, `2h`, `1h30m`, or a range, `1-2h`.  `spell dev plan-doc estimate <name> <N> "..."` changes it;  docs before
  2026-10-04 had an Estimate field (`migrate` moves it into the badge).
- The total, in the Overview below the summary and the prompt:

  ```html
  <p class="plan-estimate"><b>Estimate:</b>  4h-5h 30m in all, 2h-3h left (P5 not estimated)</p>
  ```

  every phase's estimate added up, and the phases not done;  rewritten whenever a phase is added, estimated or
  changes status.  An estimate that won't parse is named as not counted.

- the status icon (`slot="icon"`):  `todo` -> `circle outline` grey, `active` -> `circle half stroke` orange,
  `done` -> `circle check` green;  it shows in the contents sidebar too
- `collapsed`:  every phase starts folded.  Setting a phase `done` folds every done phase;  no status change ever
  unfolds one
- docs not yet migrated (`section.s3[data-phase]` in `#phases-section`, an h3 with the icon, `data-fold="closed"`):
  the script still edits them as they are

Item (in any `ui-list.plan-items`):

```html
<ui-item id="c3" data-status="open"><a class="plan-id" href="#c3">C3</a> <span class="plan-title">One line</span></ui-item>
```

With details, the item's line IS the panel's title (it opens on a click, or on a link to `#c3`):

```html
<ui-item id="c3" data-status="open">
  <ui-accordion class="plan-item">
    <ui-title><a class="plan-id" href="#c3">C3</a> <span class="plan-title">One line</span></ui-title>
    <ui-content>...</ui-content>
  </ui-accordion>
</ui-item>
```

- `data-status`:  `open` (questions, caveats, issues, todos), `decided` (an answered question:  a decision in
  force), `done` (closed, never removed:  fixed, passed, accepted;  NOT struck), `canceled` (made moot by another
  decision, or a superseded answer:  closed like `done`, its title struck through;  `cancel`, `reopen` undoes it)
- an answered question (`decide`) keeps its title;  `data-answered`, and its details read in the order it
  happened (Owen, 2026-10-04, I9 of `review-review`):  "Original question", "Choices", then the answer

  ```html
  <ui-item id="q3" data-status="decided" data-answered data-phase="3" data-changed="2026-10-04T12:46:05-04:00" data-state="recent">
    <ui-accordion class="plan-item">
      <ui-title><a class="plan-id" href="#q3">Q3</a> <span class="plan-title">Which browser first?</span></ui-title>
      <ui-content>
        <div class="plan-question"><p>the question as asked ...</p><p><b>Net effect:</b></p><ul><li>...</li></ul></div>
        <ui-accordion class="spell-aside plan-choices" styled>
          <ui-title>Choices</ui-title>
          <ui-content>
            <ui-accordion class="plan-options" styled fluid exclusive="no" open="1">
              <ui-title>A · Firefox</ui-title><ui-content><ul><li>...</li></ul></ui-content>
              <ui-title data-chosen>B · Chrome (recommended)</ui-title><ui-content><ul><li>...</li></ul></ui-content>
            </ui-accordion>
          </ui-content>
        </ui-accordion>
        <div class="plan-answer-block" id="d4"><div class="plan-answer-title"><b>D4</b> · Chrome</div><p>why ...</p></div>
      </ui-content>
    </ui-accordion>
  </ui-item>
  ```

  - `div.plan-question`:  the question's text as it was asked, its Net effect too;  the page labels it "Original
    question".  None when the question had no text
  - Choices:  the question's option cards, ONE folded aside holding an accordion, a panel per card:  its title the
    card's label (`B · Chrome (recommended)`), its content the card's body.  The chosen option's title carries
    `data-chosen` (a green check and green text on the page, not a frame), and `open` opens the accordion on it;
    `exclusive="no"`:  several can be open to compare.  No option cards:  no Choices.  An OPEN question keeps its
    option cards (`ui-grid.spell-pros-cons`) and their Choose pills
  - the answer card:  titled `D4 · ...` when it carries a migrated decision's id (old `#d4` links land on it),
    else `Answer · ...`
  - then replies (`.plan-reply`, after the answer), the Original Discussion, the commits
  - `decide` writes it;  answering again replaces the answer card IN PLACE (the old one into the Original
    Discussion);  `details --file` on an answered question rewrites the question's text, before the answer card,
    and lays it out again (its new option cards become the Choices;  the chosen letter stays chosen when the new
    options have it);  `relayout` converts docs from before 2026-10-05
  - written by the script:  by hand, write the question's text with its option cards (`ui-grid.spell-pros-cons`)
    through `details --file`, then `decide --option`;  never hand-write the Choices

  `add ... decision "title"`:  a question born answered, its title the answer (no answer block)
- docs from before 2026-10-04:  a struck question with `<a class="plan-answer" href="#d7">→ D7</a>`, then decision
  `D7` titled `... (<a href="#q3">Q3</a>)`;  read as they are until `migrate` merges them ("Older docs" above)
- an item's commits (`commit <name> <sha> --item I3 "..."`):  `<div class="plan-commits"><b>Commits:</b>  <ul
  class="plan-commit-list">...</ul></div>` at the end of its details;  an item without details gets a panel
- details are optional;  they start collapsed
- an item's earlier text (I7 of `review-review`):  its ORIGINAL DISCUSSION, a folded aside after its current text,
  before its commits.  `details --file` and `decide` (answering again) move what they replace into it;
  `original` adds text recovered from git:

  ```html
  <ui-accordion class="spell-aside plan-original" styled>
    <ui-title>Original Discussion</ui-title>
    <ui-content>
      <div class="plan-version"><h5>As first written</h5><p>the question as first asked ...</p></div>
      <div class="plan-version" data-as-of="2026-10-04 20:49"><h5>As of 2026-10-04 20:49</h5><p>...</p></div>
    </ui-content>
  </ui-accordion>
  ```

  - one `div.plan-version` per version, oldest first:  the first undated (its "As first written" heading comes with
    the second), each later one dated when it was replaced;  a version saying the same as one there isn't added
  - ids inside become `data-original-id`:  no duplicate ids, nothing links into it
  - ignored by everything that reads an item:  its option cards are never counted or chosen (`approve`, `pick`,
    the page's Choose pills), `items --json` gives the current text (`details`) and the old apart (`original`),
    `check` skips its links, the contents leave out its headings

Item state (written by the script on every edit;  the page colors the id badge by it):

- `data-changed`:  when a command last changed the item's status or review marks (`add`, `close`, `reopen`,
  `decide`, `review`, `defer`, `queue`, `unqueue`), ISO local time with offset;  `data-bedtime` too while a
  `/bedtime` run is on (`<body data-bedtime>` below), until `review` (or `queue`) clears it
- `data-phase="N"`:  the phase active when it was added (its "To review" line lists it)
- `<body data-recent-since>`:  the commit time of `HEAD~2` in the doc's checkout (D2:  green = changed in this
  commit or the last);  none without git history
- `<body data-bedtime="P3-P6">`:  a `/bedtime` run is on, and what it runs (`bedtime <name> start` / `done`)
- `data-state`, from those:

  | State | Color | When |
  |---|---|---|
  | `attention` | red | open and needs Owen:  an open question;  an open judgement call or issue not reviewed |
  | `progress` | orange | `data-queued` (a review's to-do) or `data-working` |
  | `open` | blue | open, not urgent:  todos, caveats, tests;  reviewed issues and judgement calls |
  | `recent` | green | decided, reviewed or closed since `data-recent-since`;  or `data-bedtime` |
  | `old` | grey | decided, reviewed or closed before that |
- docs made before 2026-10-01 have `ol.plan-items` of `<li>`s with a "details" panel, and a phase list under
  `#plan`;  the script still edits those, and `migrate` converts them

Review marks (`/epic review`, and any session that talks an item through with Owen;  `review`, `defer`, `queue`,
`unqueue` write them):

```html
<ui-item id="i4" data-status="open" data-reviewed="2026-10-03" data-queued="2026-10-03" data-work="Skip short sections">
  <ui-accordion class="plan-item">
    <ui-title><a class="plan-id" href="#i4">I4</a> <ui-label class="plan-review" size="mini" basic color="orange" title="Skip short sections">to do</ui-label> <span class="plan-title">One line</span></ui-title>
    ...
```

- `data-reviewed`:  gone through with Owen, that day.  `data-deferred`:  put off for now;  still not reviewed.
  `data-queued` + `data-work`:  work a review decided on, not started yet;  the next review offers it first.
- the label shows the strongest:  "to do" (orange), else "deferred" (grey, its date on hover), else "reviewed
  10-03" (green while the item is `recent`, then grey)
- REVIEWED also counts:  closed (`done`, `canceled`), `decided`, or linked (`href="#i4"`) from a decision's details (an answered
  question's, or an old doc's `D` item's).  So a doc reviewed before the marks existed isn't all "not reviewed".
- the outcome goes in the log (`I4 reviewed:  accepted`), not on the item

Log line (in `#log`'s `<ui-feed class="plan-log">`;  a `<ul>` of `<time>` + text before 2026-10-01):

```html
<ui-event icon="pen to square">
  <ui-content><ui-summary><ui-date><time datetime="...">2026-10-01 09:05</time></ui-date> P2 active</ui-summary></ui-content>
</ui-event>
```

Each top-level section carries an icon (`<ui-icon slot="icon">`:  `lightbulb`, `layer group`, `gavel` ...):  keep
it when editing a section.  It is also the section's entry in the rail.

Prompt (in `#overview`, after the summary, folded away in a closed aside;  `new --prompt` / `prompt` write it,
escaped;  `migrate` folds an old doc's bare quote):

```html
<ui-accordion class="plan-prompt-panel spell-aside" styled>
  <ui-title>Kickoff prompt</ui-title>
  <ui-content>
    <blockquote class="plan-prompt"><p>first paragraph<br>next line</p><p>second paragraph</p></blockquote>
  </ui-content>
</ui-accordion>
```

## UPDATE markers

While a phase is active, flag what changed so the user can spot it:

- a new or changed item gets `<ui-label class="plan-update" size="mini" color="orange" data-phase="2">UPDATE</ui-label>`
  (the script adds it)
- a changed prose block gets, just before it:
  `<ui-message class="plan-update" state="warning" size="tiny" header="UPDATE" data-phase="2"><p>what changed</p></ui-message>`
- `spell dev plan-doc phase <name> 2 done` removes every `.plan-update[data-phase="2"]`

## Review inbox

Owen marks items ON the page (served by the page server):  approve, todo, Add Details, revisit (soon / now, with a
note), pick an option card.  A question may carry a pick AND a revisit note together ("pick B, but ..."):  the
revisit mark holds the `pick`.  An ANSWERED question's Choices take Choose pills too, on every option but the chosen one, only while
Owen revisits it (its Revisit box open, or a revisit or pick mark):  "pick B instead, because ..." is a revisit
carrying the pick, talked over;  a plain pick there, once applied, answers it again with that option.  The marks wait in `<name>.inbox.json` beside the doc (git-ignored) until "send to
Claude";  Add Details and revisit now go at once (the inbox's `now` queue).  Read it with `spell dev plan-doc inbox
<name>`;  shape, routes and helpers:  `packages/docs/AGENTS.md`, "Review inbox".  NEVER edit the file by hand:  go
through `tools/inbox.js` (its lock).

How a `/epic review` session takes the marks (nothing outside a session can wake it, except a background command
it started ending):

1. `spell dev plan-doc inbox <name> listen`:  the page stops saying nobody is reviewing.
   - a HEARTBEAT keeps it so:  `wait` stamps `listening.seen` every 30s, and `apply`, `done`, `clear`, `working`
     each time;  silent for 90s (a killed session, no `unlisten`), the page says nobody is reviewing again
2. `spell dev plan-doc inbox <name> wait` in the BACKGROUND, then end the turn.  It exits when there's work, which wakes
   the session;  it prints, for each item, its id, kind, status and title, the mark, the note, and a pick's option
   card:

   ```text
   now (1):  start a background agent for each;  `spell dev plan-doc inbox review-review done <id>` after
     - I1  issue, open · The phases' progress bar label is cut off at its left end
         Add Details
   sent 2026-10-04T17:32:26.086-04:00 (4 marks):
     approve (1):
       - J9  judgement, open · A reload lands on the remembered section without unfolding it
     pick (1):
       - Q7  question, open · Should a reload land on the remembered section without unfolding it?
           picks B · Land and unfold it
     revisit, to talk over (1):
       - Q3  question, open · Where should the send button sit?
           picks A · In the page header, asks:  "A, but only on plan docs?"
     ...
   next:  `spell dev plan-doc inbox review-review apply` (approve, pick, todo)
   ```

   - `now`:  Add Details and revisit now, TAKEN off the queue, each item marked `working` (its spinner);  the mark
     stays until `done`, unless Owen changed it meanwhile to one waiting for a send (e.g. chose a card:  a revisit
     `soon` with the pick):  that one stays for the next send
   - `sent`:  every mark the last "send to Claude" covered, once per send (`handedOver` in the inbox);  a mark an
     earlier send already handed over (a revisit still being talked over) says "(sent before)"
   - timeout (3300s):  exit 2, nothing taken;  run it again
3. `spell dev plan-doc inbox <name> apply`:  the mechanical marks, applied and cleared:

   | Mark | On | Does |
   |---|---|---|
   | approve | an open question | answered with the option card marked "(recommended)" (`decide`, that card chosen), reviewed;  no recommended card:  left, "needs talk" |
   | approve | an open judgement call | closed (accepted), reviewed |
   | approve | an open test | closed (passed), reviewed |
   | approve | anything else (open caveat, issue, todo;  closed or answered items) | reviewed |
   | pick | a question | answered with that card's title, the card chosen, reviewed |
   | todo | any item | a new todo "Follow up:  <title>" linking back, the item reviewed |
   | revisit soon | any item | left:  talk it over in the chat, then `inbox <name> clear <id>` |
   | revisit with a pick | a question | left, NOT answered ("to talk over:  picks B · ..., asks:  ..."):  answer the note about that option;  once Owen agrees, `decide <name> <id> "<card title>" --option B`, then `clear` |

   Each applied mark logs one line (`J9 approved:  closed (accepted)`);  a mark Owen changed meanwhile stays.
4. Requests for now:  a background agent per item writes into it with `spell dev plan-doc details <name> <id> --file
   <html>` (Add Details:  replaces the details;  revisit now:  `--append` a reply), then `inbox <name> done <id>`.
5. `wait` again.  On leaving:  `inbox <name> unlisten`.

A reply to Owen's revisit note (`details --append`), dated, quoting the note:

```html
<div class="plan-reply">
  <div class="plan-reply-title"><b>Claude</b> · <time>2026-10-04 17:20</time> · re:  "why not reuse the details route?"</div>
  <p>The answer ...</p>
  <ul><li>bullets;  option cards if Owen must choose;  a Net effect</li></ul>
</div>
```

## Prose

- Code:  ALWAYS folded and colored:
  `<ui-accordion class="spell-code" styled><ui-title>file.ts · N lines</ui-title><ui-content><pre><code class="language-ts">`
  (never `open`).
- Digressions:  a collapsed `<ui-accordion class="spell-aside" styled>`, title starting "Aside:".
- Link caveats, issues, decisions and phases wherever prose mentions them.

## Explaining a question or issue

Anything the user must decide or weigh in on (a question, an issue with options) gets an explanation the user can
decide from WITHOUT asking back:  in the item's details, or an Overview sub-section the item links to when it's long.

- Plain words first:  what goes wrong (or what's being chosen), for whom, and how they'd notice.  Define every
  coined or jargon word on first use:  "stacking:  things side by side go one under another when there's no room".
- The real thing:  the actual code / markup / CSS rule it's about, excerpted from the file (folded `spell-code`),
  never pseudo-code.
- Concrete cases:  name the affected components / examples / tests ("breadcrumb `divider-icon`:  the divider stays
  empty in Safari").
- Many values:  a `ui-table` (the 19 renamed emoji:  name, today, if changed, other names that reach each).
- Options:  side by side, `<ui-grid class="spell-pros-cons" columns="2" stackable>` of `<ui-segment>` with a
  top-`attached` `<ui-label>` naming the option;  each says what changes, the cost, and a short code sample;  mark
  ONE "(recommended)" and say why.
- Live:  when the doc's bundle has the components, a working example (a resizable box for layout;  real buttons
  for behaviour);  click it through in a browser before handing back.
- Keep code in side-by-side boxes short (~40 columns) or it clips;  look at the screenshot.
- End with the **Net effect** (see "Rules").
- The AskUserQuestion that asks it uses the same option names and order as the doc.

## Commands (`spell dev plan-doc ...`, from anywhere in the repo)

Every checkout's `packages/docs/content` is a link to ONE shared copy (epic `shared-content`):  run from any
checkout, a command edits the same doc.  `--here` (this checkout's copy) is no longer needed:  accepted and ignored.

| Command | Does |
|---|---|
| `new <name> [--title "..."] [--prompt "..." \| --prompt-file <path>]` | copy the template to `epics/<name>/<name>.plan.html`, fill it (the prompt that started the plan goes in the Overview), update the docs index |
| `add-phase <name> "Short Name" [--goal <html>] [--files ...] [--verify ...] [--estimate 1-2h]` | append a phase to the list and to `#phases`;  the goal a `<ul>`, the estimate the title's badge |
| `phase <name> <N> todo\|active\|done [--done <html>] [--no-open]` | set a phase's status;  `done` removes its UPDATE markers, and `--done` writes its Done field;  brings the doc forward in VS Code |
| `estimate <name> <N> "1-2h"` | change a phase's estimate (its title's badge);  the Overview's total follows |
| `add <name> question\|judgement\|caveat\|issue\|todo\|test\|decision "<title>" [--details "<html>"]` | append an item, print its id;  a `decision` is a question born answered (`Q7`) |
| `close <name> <id>` / `reopen <name> <id>` | close an item (`done`) / open it again |
| `cancel <name> <id> ["why"]` | an item made moot by another decision:  `canceled`, struck through;  logs why;  `reopen` undoes it |
| `decide <name> <Q id> "<answer>" [--details "<html>"] [--option B]` | answer a question:  the answer goes INTO it (`decided`), its details in the order it happened:  the question's text, its option cards as a folded Choices accordion (`--option`:  the chosen one), then the answer card;  answering again replaces the card in place, the old one into its Original Discussion;  prints its id |
| `commit <name> <sha> --phase N \| --item <id> "<sentence>"` | list a commit under a phase or an item (replaces its entry) |
| `commits <name> --backfill` | list every phase and item commit in the doc's git history that isn't yet (subjects `P3:  Name -- summary`, `Fix I3:  ...`) |
| `log <name> "<text>"` | add a timestamped line to the log |
| `prompt <name> "<text>"` / `prompt <name> --file <path>` | set (replace) the prompt quoted in the Overview;  `""` removes it |
| `migrate <name>` | bring an older doc (before 2026-10-01, `section.s2` markup, `D` items, answer cards first) into this layout (prints what changed;  "already current" otherwise) |
| `relayout <name> \| --all [--dry-run]` | answered questions in the order they happened (before 2026-10-05:  the answer card first):  the question, its Choices, the answer;  prints per doc the questions changed and those skipped, and why (born answered:  no answer card);  idempotent, drops nothing;  `--dry-run` writes nothing |
| `bedtime <name> start "P3-P6"` / `bedtime <name> done "summary"` | a `/bedtime` run:  bedtime mode on (`<body data-bedtime="P3-P6">`;  `summary --json`'s `bedtime`) / off;  both logged.  No report section:  the night's judgement calls and issues show red where they belong (D5 of `review-review`) |
| `overnight <name> remove` | an older doc's Overnight report section (a `/bedtime` run's, before 2026-10-05):  remove it once read |
| `review <name> <id> ["outcome"]` | mark an item reviewed today;  the outcome goes in the log |
| `defer <name> <id>` | put an item off:  dated, still not reviewed |
| `queue <name> <id> "work"` / `unqueue <name> <id>` | work a review decided on, waiting / started or dropped |
| `items <name> [--section <s>] [--filter unreviewed\|open\|reviewed\|queued\|all] [--json]` | what a review walks:  where reviews stand, the to-do list, each section's counts and items |
| `items <name> --section <s> --spec <file>` | `/epic review`'s item picker as a details page spec (`spell dev details new --from`):  a checkbox per open item, the not-reviewed ones ticked, each labelled by its id |
| `list [--json]` | every epic:  in progress / done, its worktree while it has one (`checkout`), not reviewed / all |
| `backfill <name> \| --all [--apply]` | one-off:  items not reviewed that Owen named in a past session of the epic (his message, or a modal he answered);  a dry run unless `--apply`, which marks them dated that day (`scripts/review-backfill.js`) |
| `summary <name> [--json]` | open questions, judgement calls, issues, caveats, todos, tests, and the next phase |
| `check <name>` | ids unique, every `#id` link resolves, every phase has a status, then `check-spell.js` |
| `open <name>` | show the doc rendered in VS Code's doc preview (the right side bar's "Spell Docs" tab);  needs the spell extension (`spell dev vscode`) |
| `inbox <name> [--json]` | the marks Owen left on the page (`<name>.inbox.json`), by action, with their items' titles, sent or not;  the `now` queue, agents at work, the session listening |
| `inbox <name> listen [--session <id>]` / `unlisten` | this session (`$CLAUDE_CODE_SESSION_ID`) waits on the inbox / stopped:  the page tells Owen whether anyone is listening |
| `inbox <name> wait [--timeout <s>] [--json]` | block (polls every 1s, default 3300s) until there's work, print it, exit 0;  timeout:  exit 2.  Work:  requests for now (taken off the queue, their items marked working) and a send not yet handed over (its marks by action) |
| `inbox <name> apply [ids...]` | apply the sent approve / pick / todo marks to the doc and clear them;  prints a line per item and what it left (revisits) |
| `inbox <name> working <id> on\|off` | the page's spinner on an item |
| `inbox <name> done <id>...` / `clear <id>...` | an agent finished the item:  its mark and spinner go / drop marks (a revisit talked over) |
| `details <name> <id> --file <html> [--append]` | replace an item's details with the file's HTML, or add it after them (a reply:  after an answered question's answer card);  the answer card, Original Discussion and commits stay;  on an answered question the new text is the question's, laid out again (Choices, then the answer);  replacing moves the old text into the item's Original Discussion;  logs "I1 details rewritten" / "I1 reply added" |
| `original <name> <id> --file <html> [--as-of "YYYY-MM-DD HH:MM"]` | put an item's earlier text (recovered from git) into its Original Discussion:  as first written, or dated `--as-of` (when it was replaced), in date order;  commits and an answer card the item has are left out;  prints `added` / `unchanged` / `empty`;  doesn't stamp the item |
