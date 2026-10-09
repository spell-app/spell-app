# Plan docs in `<epic-*>` markup

What `spell dev plan-doc` writes, and what's still DATA, once a plan doc is in the `<epic-*>` markup (epic
`epic-components`, P8).  The elements -- tags, attributes, which children go where -- are described ONCE, in
`packages/epics/src/definitions/` (each `components/<family>/<Name>.en.ts`);  this file holds the rest.

- Since the switch (P12, 2026-10-08) every real doc is in this markup.  A doc still in the OLD `ui-*` markup is
  READ (`summary`, `summaries`, `list`, `items`, `check`, `open`, the inbox's listings) and never edited:  "convert
  it first (spell dev plan-doc convert)".
- The template `new` copies:  `templates/plan.html` beside this file (the shared `templates/epics/plan.html`
  retired at the switch).
- How to WRITE a doc stays in `templates/epics/plan-doc.md`:  "Rules" (write for Owen cold, Net effect, never delete
  an item, never drop its text), "Ids", what phases and items say, "Prose", "Explaining a question or issue",
  "Review inbox" (the loop), the commands' table.  It points here for the markup.

## The page

```html
<ui-root>
  <ui-components source="../../packages/epics/pack/epics.pack.js"></ui-components>
  <spell-site-header root="../.."></spell-site-header>
  <div class="spell-doc"><main class="spell-doc-main">
    <epic-page epic="seo" title="SEO" branch="seo" worktree="/.../seo" started="2026-10-01" updated="2026-10-07"
      repo="https://github.com/spell-app/spell-app">
      <a slot="durable" href="../../guides/seo.html">SEO</a>
      <epic-overview id="overview" estimate="4h-5h in all, 2h left">
        <epic-summary>Two sentences.</epic-summary>
        <epic-prompt><p>the kickoff prompt</p></epic-prompt>
        <epic-section id="o1" kind="overview-part" title="Structure">...prose...</epic-section>
      </epic-overview>
      <epic-section id="overnight" kind="report" title="Overnight · 2026-10-04">...prose...</epic-section>
      <epic-section id="phases" kind="phases">...<epic-phase>s...</epic-section>
      <epic-section id="decisions" kind="questions">...<epic-item>s...</epic-section>
      ... judgements, caveats, todos, issues, tests ...
      <epic-section id="log" kind="log">...<epic-event>s...</epic-section>
    </epic-page>
  </main></div>
</ui-root>
```

- `<title>` reads `Epic: <title>`;  `<epic-page title>` holds the title alone and draws the crumbs (`Docs › Epics ›
  <title>`), the h1, the meta lines, the step label (active phase, DONE, next, FUTURE), the bedtime label, the "Plan
  hung?" notice (while there's no phase) and a future epic's notice.  None of it is written.  The page runs edge to
  edge by itself, and links `spell-doc.css` alone (no `plan-doc.css`:  P14).
- Dates are WRITTEN as below (`2026-10-08 14:34`, `2026-10-08`, ISO with an offset) and DRAWN `10/8/26 14:34` /
  `10/8/26` by every element (`$/epics/dates` `PlanDates`) but the log's `<epic-event>`:  never write the drawn form.
- The page's data, on `<epic-page>`:
  - `branch`, `worktree`:  none for a future epic (`new --future`);  `new` on a future epic's doc, or its first
    phase, plans it (`future` goes)
  - `started`, `updated`:  `YYYY-MM-DD`;  every edit stamps `updated`
  - `recent-since`:  the commit time of `HEAD~2` in the doc's checkout (D2);  since 2026-10-08 it colours nothing
    (a decided item stays green however old), kept until it's dropped (`PlanReader.recentSince`)
  - `bedtime="P3-P6"`:  a `/bedtime` run is on (`bedtime <name> start | done`)
  - `repo`:  the GitHub page every `<epic-commit sha>` links through (`commit`, `commits --backfill`)
- Sections are fixed:  each `kind` once, in that order, with its id (`questions` keeps `#decisions`).  Their titles,
  icons, notes, counts, the progress bar and the Plan changes box are drawn.
  - A REPORT (`kind="report"`, P14) is the one section that isn't:  what a run wrote for Owen to read (an overnight
    `/bedtime` report), its own `id` and `title`, right after the Overview, unnumbered, with the page's bands.
- The Overview:  `<epic-summary>` (two sentences, drawn as a lede), then `<epic-prompt>` (the kickoff prompt, folded
  under "Kickoff prompt";  `new --prompt` and `prompt <name>` write it), then its sub-sections.  An older doc's
  `<p slot="summary">` / `<blockquote slot="prompt">` still read the same until the second conversion pass;
  `prompt <name>` turns the old quote into an `<epic-prompt>` where it stood.

## Ids

As `plan-doc.md`, "Ids":  `q` question (an answered one is a decision), `j` judgement call, `c` caveat, `t` todo,
`i` issue, `v` test;  `p` phase;  `o` Overview sub-section.  An item's KIND is its id's letter (Q11):  one
`<epic-item>` for all of them, in its kind's section.  An old decision's `d7` lives on as an `<epic-answer id="d7">`
inside its question:  old `#d7` links land, `close d7` finds the question.

## Phases

```html
<epic-phase id="p2" title="Short Name" status="active" estimate="1-2h">
  <epic-field name="symptom">what's wrong today, one line</epic-field>
  <epic-field name="changes">what changes, two or three lines</epic-field>
  <epic-updated at="2026-10-06 14:30" phase="3"><p>what changed in the plan, and why</p></epic-updated>
  <epic-field name="goal"><ul><li>a bullet per outcome</li></ul></epic-field>
  <epic-field name="done"><ul><li>what was built</li></ul></epic-field>
  <epic-commit sha="2c71ac57...">one or two sentences</epic-commit>
  <epic-field name="files">...</epic-field>
  <epic-field name="verify">...</epic-field>
  <epic-field name="to-review"><a href="#j1">J1</a>, <a href="#c3">C3</a></epic-field>
</epic-phase>
```

- `title`:  2-4 words, WITHOUT `P2 · ` (drawn).  `status`:  `todo`, `active` (one at a time), `done`.
- Children in that order, always (the vocabulary's `childOrder: "listed"`):  the tool puts each where it belongs.
- `add-phase` with `--symptom` / `--changes`:  Symptom, Changes, then Goal (optional), Files, Verify;  without:  Goal,
  Files, Verify.  A field not given reads `TBD`.
- `add-phase ... --before N`:  inserted as PN;  every phase from N on moves down one, with what points at it:  its
  `id`, links (`href="#pN"` and the `PN` in their text), and `phase` / `of` on items, `<epic-update>` and
  `<epic-updated>`.  A split doc's parts follow (written under the new ids).  Prose naming a phase without a link
  isn't changed.  Refused while a phase from N on has started (done or active):  its commits and log say its number.
- `<epic-updated>`:  `updated <name> <N> "<html>"`, one per change, oldest first;  `phase` the phase active then.
  It stays once the phase is done;  while it's to do, the Phases section lists it in its Plan changes box (drawn).
- `estimate`:  wall-clock time for Claude, agents included, Owen's review not (`30m`, `2h`, `1h30m`, `1-2h`);  the
  Overview's `estimate` is the total, rewritten on every change:  `4h-5h 30m in all, 2h-3h left (P5 not estimated)`.
- `to-review`:  written by the tool on every edit, LAST:  items added while this phase was active (`phase="N"`) still
  open, not reviewed, not under way.

## Items

```html
<epic-item id="q3" title="Which browser first?" status="decided" answered state="recent" phase="3"
  changed="2026-10-04T12:46:05-04:00" reviewed="2026-10-06" review-as="approve">
  <epic-question><p>the question as asked ...</p></epic-question>
  <epic-net-effect option="B" recommended><ul><li>...</li></ul></epic-net-effect>
  <epic-choices chosen="B">
    <epic-option letter="A" title="Firefox"><ul><li>pros, cons</li></ul></epic-option>
    <epic-option letter="B" title="Chrome" recommended><ul><li>...</li></ul></epic-option>
  </epic-choices>
  <epic-answer title="Chrome"><p>why ...</p></epic-answer>
  <epic-more><p>More Details:  what the text left out</p></epic-more>
  <epic-reply from="Claude" at="2026-10-04 17:20" re="why not reuse the details route?"><p>...</p></epic-reply>
  <epic-original><epic-version><p>as first written</p></epic-version>
    <epic-version as-of="2026-10-04 20:49"><p>...</p></epic-version></epic-original>
  <epic-commit sha="...">the fix</epic-commit>
</epic-item>
```

- The order is fixed:  a question's `<epic-question>` first, then the item's text (prose, the prose elements and
  its option cards among it:  "Prose elements" below), the answer, More Details, replies, Original Discussion,
  commits;  Claude's status cards (`<epic-status slot="status">`, "Status cards" below) are slotted, so at the end,
  out of the order.  The element draws the chip (`Q3`, in its state's colour), the review label, `Question` over the
  question as asked, "Original reply" over the text, and every card's heading.
- A question's text as first asked is its `<epic-question>`, found by its tag, not its place:  `add question`, and a
  rewrite of a question's text (`details --file`), put the lead of the HTML they're given in one (the prose up to the
  first element or bold label line, `<p><b>The options:</b></p>`), unless the HTML has one;  a rewrite moves the old
  one into the Original Discussion with the rest of the old text.  `--append` never makes one.
- `title`:  WITHOUT its id;  with markup, a `<span slot="title">` child instead.  An UPDATE marker rides in the title:
  `<span slot="title">Title <epic-update phase="2"></epic-update></span>`;  `phase 2 done` removes it, and a title
  left plain goes back to `title`.
- Data, all attributes (the definitions check each value):
  - `status`:  `open`;  `decided` (an answered question:  `decide`, or `add ... decision`, born answered with
    `answered`);  `done` (closed:  fixed, passed, accepted);  `canceled` (made moot:  struck through)
  - `state`, from the rest (the tool rewrites it on every edit;  colours:  "Colours" below), first that applies:

    | `state`     | colour | when                                                                               |
    | ----------- | ------ | ---------------------------------------------------------------------------------- |
    | `progress`  | blue   | Claude is working on it:  an underway status card, or `working`                    |
    | `old`       | grey   | canceled:  no longer relevant (made moot, struck through)                          |
    | `recent`    | green  | decided or done (`decided`, `done`, an old `d7`), however long ago                 |
    | `open`      | yellow | work a review queued (`queued`), not started                                       |
    | `attention` | red    | an open question;  an open judgement call or issue not reviewed, unless `calm`     |
    | `recent`    | green  | open, settled by a review:  `review-as` `approve` or `todo` (`SETTLED_AS`)         |
    | `open`      | yellow | anything else open:  still undecided, not urgent;  a revisit or Do Now answered    |

    Green across the board for what's decided, grey only for what no longer matters (Owen, 2026-10-08);  a
    `/bedtime` run and `recent-since` no longer colour anything.

  - `changed`:  ISO local time with offset, every command that changes its status or review marks;  `bedtime`
    while a `/bedtime` run is on, until reviewed
  - `phase`:  the phase active when it was added
  - review marks:  `reviewed`, `deferred`, `queued` (`YYYY-MM-DD`), `work`, `working`, `review-as` (how Owen's mark
    was handled:  `approve`, `todo`, `revisit`, `now` -- a Do Now request done, written by `inbox done`).
    `review-as` is the record (the log, `review` outcomes, the state above), never drawn on the buttons:  once
    Claude has handled a mark they clear, and the chip shows the result
- Options:  `<epic-choices>` of `<epic-option letter title recommended>`, the same open or answered;  `chosen` once
  answered (`decide --option B`, a pick).  Mark ONE `recommended`.  On ANY item kind (P14):  a question's own after
  its text, or the options a judgement call, a reply or More Details weighs;  an item may hold several.
- Picks work on ANY of them (I8):  the mark names the set by position, `{ pick: "B", choices: 1 }` (the item's sets
  in page order, its Original Discussion's never counted:  `PlanItem.choiceSets()`;  no `choices`, an older mark:
  the item's own).  `inbox apply` sets THAT set's `chosen`;  a question is answered with the option (no other set
  stays chosen), any other item APPROVED with it (an open judgement call closed, accepted;  reviewed);  either way a
  Done card `Chose B · <title>`, and the option in the log line.
- The way in (`IncomingHtml`):  agents may still write the OLD shapes;  every command taking HTML (`add --details`,
  `decide --details`, `details --file`, `updated`, a phase's fields) turns them into elements on the way in, so a doc
  never holds them:  an option grid (`ui-grid.spell-pros-cons`, labels `A · Title (recommended)`, wherever it sits)
  -> `<epic-choices>`;  a `div.plan-reply` -> `<epic-reply>`;  a `Net effect` paragraph and its list, a
  `ui-accordion.spell-code` / `.spell-aside`, a `ui-message.plan-update` -> the prose elements below
  (`$/epics/markup` `ProseRewrite`).  Never inside code or an Original Discussion.
- A rewrite (`details --file`, `decide` again, `details --more` again) never drops text:  what it replaces moves into
  `<epic-original>`, one `<epic-version>` per version (the first undated, the rest `as-of` when replaced), cards as
  the prose they said (`Answer · Chrome`, `B · Chrome (recommended), chosen`;  the prose elements stay, an
  `<epic-question>` too);  ids inside become `data-original-id`.  `original <name> <id> --file` puts text recovered
  from git there (old markup welcome).
- `--append`:  an `<epic-reply>` goes after the replies;  other prose at the end of the item's text (after its option
  cards:  they're prose too).
- A details page has no `<epic-*>` elements:  an item's text goes there as the prose each element draws (`Net effect
  (A):` over its list, a code block's title over its `<pre>` ...:  `PlanItem.asProse({ plain })`).
- Owen's note, once Claude clears its mark:  `<epic-reply from="Owen" at="..." re="revisit soon">`.
- An Overview sub-section takes review marks too (Q14):  approve is logged, todo makes a todo linking `#o3`, a
  kept note is a paragraph at its end.

## Prose elements

The blocks prose used to shape by hand, each an element that draws its chrome around prose that stays the page's own
children (find-in-page, `#id` links and the live update keep working;  epic `epic-components` P14).  Each is `flow`:
it goes wherever prose goes (an item's text, a reply, an option card, a phase field, an Overview sub-section), but
`<epic-question>`, `<epic-summary>` and `<epic-prompt>`, which have one place each.

| element                       | example                                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| `<epic-net-effect>`           | `<epic-net-effect option="A" recommended><ul><li>...</li></ul></epic-net-effect>`:  `Net effect (A, recommended):` over its list (or a `<p>`);  no `option`:  `Net effect:` |
| `<epic-question>`             | `<epic-question><p>Which browser first?</p></epic-question>`:  a question's text as first asked, under `Question`;  FIRST in its item (or a version) |
| `<epic-summary>`              | `<epic-summary>Two sentences.</epic-summary>`:  the Overview's lede, once                 |
| `<epic-prompt>`               | `<epic-prompt><p>the prompt, as typed</p></epic-prompt>`:  folded under `Kickoff prompt`, once in the Overview |
| `<epic-code>`                 | `<epic-code title="design.ts · 12 lines" language="ts"><pre>...</pre></epic-code>`:  folded, highlighted, ONE `<pre>` of text (`&lt;` for a `<`);  `open` to start open |
| `<epic-aside>`                | `<epic-aside title="why not now"><p>...</p></epic-aside>`:  folded, headed `Aside:  why not now` |
| `<epic-note>`                 | `<epic-note state="update" title="partly fixed by J9"><p>...</p></epic-note>`:  a small orange `UPDATE` (or green `DONE`, `state="done"`) note that stays, folding by its heading;  not `<epic-update>`, a phase's marker |
| `<epic-choices>`              | as in "Items":  option cards, on any item kind                                            |
| `<epic-field label>`          | `<epic-field label="Where"><p>the inbox file</p></epic-field>`:  a labelled block, `Where:` before its prose (`What should happen`, `Step`);  a phase's fields have `name` instead |
| `<epic-section kind="report">` | `<epic-section id="overnight" kind="report" title="Overnight · 2026-10-04">...</epic-section>`:  a run's report, after the Overview (`The page`) |
| the crumbs                    | none written:  `<epic-page>` draws `Docs › Epics › <title>` from its `title` (an older doc's `.spell-crumbs` before it:  it draws none) |

## Status cards

What Claude took each of Owen's review marks to mean, and that it's done (P13):  a card per mark, on the item (or
the Overview sub-section) it's on.

```html
<epic-status slot="status" state="underway" at="2026-10-08 14:20">
  <p>Weigh one JSON file for the pack templates against a file each, and answer here.</p>
</epic-status>
<epic-status slot="status" state="done" at="2026-10-08 14:20" done-at="2026-10-08 14:34">
  <p>Weigh one JSON file for the pack templates against a file each, and answer here.</p>
  <p slot="summary">Recommended a file each:  JSON would need every template escaped.</p>
</epic-status>
<epic-status slot="status" state="done" at="2026-10-08 15:02"><p>Chose B · Keep one file per template</p></epic-status>
```

- Drawn:  `Claude • Underway` (blue) / `Claude • Done` (green) on the left of the band, the date at its right
  (`done-at` once done, else `at`);  then the reading;  then the summary, if any.
- An underway card makes its item `progress` (blue:  Claude is working on it) until it's done.
- `slot="status"`:  never ordered (written last in the item, or the section);  drawn last in the details, UNDER Owen's
  marked note and above the note box ("under my input", Owen, 2026-10-08).  A part file never holds them:  they stay
  in the skeleton with the title.
- The reading:  one or two sentences, plain words, no file names.  The summary (`slot="summary"`, one or more blocks):
  only when there's something worth saying -- a surprise, a choice made, something left undone.
- A later mark on the same item:  a new card after the old ones, which stay, as the record.
- Written by the tool only:
  - `status <name> <id> underway "<reading>"`:  a new underway card, stamped now;  the page's spinner on
  - `status <name> <id> done ["<summary>"]`:  the LATEST underway card turns done (`done-at`), the reading kept;
    spinner off;  refused with no underway card
  - `status <name> <id> done --filed "<what>"`:  a card born done (`at` alone)
  - `inbox apply`:  a card born done for each pick (`Chose B · <option>`) and todo (`Made todo T23 to follow this
    up.`) it files (Q19);  none for an approval
  - the reading and summary are HTML, as `updated` takes:  inline runs go in a `<p>`, blocks stay;  plain text works
    as it is (`&lt;` for a `<`)
- A rewrite of the item's text (`details --file`) leaves its cards where they are;  they never reach its Original
  Discussion.

## Colours

Drawn, never written:  one meaning per colour on every element (decision Q20, Owen, 2026-10-08).

| colour | means                                    | where                                                                  |
| ------ | ---------------------------------------- | ---------------------------------------------------------------------- |
| red    | needs Owen                               | `attention` chips;  the rail's count (only what needs him)             |
| yellow | open, still undecided (DARK text on it)  | `open` chips;  a `to do` review label                                  |
| blue   | do it now, or Claude is working on it    | `progress` chips;  Revisit, Do Now, Send, Review Now;  Underway cards;  the active phase |
| green  | decided or done (however long ago)       | `recent` chips;  Approve, Make Todo, a pick, the chosen option;  Done cards;  DONE |
| orange | changed since Owen looked, or a warning  | UPDATE, the Updated fence, Plan changes;  "nobody is listening";  a blocked agent |
| violet | Claude's voice                           | his reply cards;  the bedtime label                                    |
| ivory  | Owen's voice                             | his note box, marked note, reply cards, the answer card                |
| grey   | no longer relevant, inactive, not chosen | `old` chips (canceled);  a phase to do;  FUTURE;  buttons at rest      |

The FILL, on every button, pill and chip with a lifecycle (review buttons, the note box's, the pick's letter, the
Choose pill and its card, Send).  The review buttons are Owen's INPUT (Owen, 2026-10-08):

- a grey outline:  available
- DASHED in its colour:  Owen pressed it, not committed (not sent;  a Do Now not taken yet)
- OUTLINED in its colour:  recorded (sent), or in progress (a Do Now taken, its icon turning while Claude is on it)
- then CLEARED:  once Claude has handled the mark (`inbox apply` / `done`, the inbox's mark gone), every review
  button is a grey outline again;  the id chip carries the result (green decided, yellow still open, red needs Owen)
- SOLID only on chips (an item's state), the step label's DONE, and a Choose pill on its set's `chosen` option
  (applied, wherever the cards are)

An item's id chip MATCHES the chosen review button while Owen's mark is live (Owen, 2026-10-08):  that button's
colour and fill (an Approve pressed, not sent:  a dashed green chip;  a revisit sent:  an outlined blue one;  a pick:
green).  No mark, or one Claude handled:  its state's colour, solid -- the result (an approved J9 green, a revisited
J10 still open, yellow).

## Folding

EVERYTHING boxed in a section folds (Owen, 2026-10-08):  every card with a heading band folds from it, the chevron
first -- a reply (Owen's and Claude's), the answer, a status card, an `<epic-note>`, an `<epic-update>` note, an
`<epic-updated>` fence, an open question's option card -- as More Details, Choices, an aside, a code block, Original
Discussion, Plan changes and Agents running already did.  Open to start with (the text being read;  an item and an
aside start folded);  page state, never written;  folded content is `hidden="until-found"`, so find-in-page reveals
it.  A click anywhere on the band folds, but on a link or a control in it (`Fold.heading`, `<FoldButton>`).

The review buttons, at every step:  Approve, Revisit, Make Todo in one group, then Do Now apart (paper plane:  the
inbox's `details` request, or a revisit now when the note box holds a note).

## Log

`<epic-event at="2026-10-06T08:12-04:00">P2 active</epic-event>`:  local time with offset, to the minute;  `icon` only
when it isn't `pen to square`.

## Parts

As `plan-doc.md`, "Parts", with the elements as hosts (`EpicParts`, beside this):  an Overview sub-section, a
phase, an item with details, the log.  A host's body is every child but its slotted ones (the title stays in the
skeleton);  in the skeleton it carries `source="parts/<id>.html"`, `part-ids` and `commits`.  No placeholder line:
the element loads its own body.
- `.html`, not `.htm` (Q12):  a part is told from a page by its folder, and every page walker skips `parts/`.  The
  tool still READS an old doc's `.htm` parts (`PlanParts` `OLD_PART_EXT`, to be dropped now the docs are converted);
  it writes `.html` only.

## Checking

Every edit is checked against the definitions before it's written (`Markup.validate()`):  an edit that would break
the markup is refused, nothing written.  `check` reports the same, plus ids, links and parts.
