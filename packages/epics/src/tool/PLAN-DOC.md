# Epic pages in `<epic-*>` markup

What the `epic` tool (`epic`) writes, and what's still DATA,
once an epic page is in the `<epic-*>` markup (epic `epic-components`, P8).
- The elements -- tags, attributes, which children go where --
  are described ONCE, in [the definitions](../definitions/):  each family's `<Name>.en.ts`, under `components/<family>/`.
- This file holds the rest.

- Since the switch (P12, 2026-10-08), every real doc is in this markup.
- A doc still in the OLD `ui-*` markup is READ, and never edited:
  - read by `summary`, `summaries`, `list`, `items`, `check`, `open`, and the inbox's listings
  - an edit says "convert it first (epic convert)"
- The template `new` copies:  [plan.html](templates/plan.html), beside this file.
  - The shared epics template (`templates/epics/plan.html`) retired at the switch.
- How to WRITE a doc stays in [plan-doc.md](../../../../templates/epics/plan-doc.md).
  It points here for the markup.
  - "Rules":  write for Owen cold, Net effect, never delete an item, never drop its text
  - "Ids"
  - what phases and items say, "Prose"
  - "Explaining a question or issue"
  - "Review inbox" (the loop)
  - the commands' table

## The page

```html
<ui-root>
  <ui-components source="../../packages/epics/components/__pack/epics.pack.js"></ui-components>
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

- The title:  `<title>` reads `Epic: <title>`;  `<epic-page title>` holds the title alone.
- `<epic-page>` draws all of this, so none of it is written:
  - the crumbs (`Docs › Epics › <title>`), the h1, the meta lines
  - the step label:  active phase, DONE, next, FUTURE
  - the bedtime label
  - the "Plan hung?" notice (while there's no phase), and a future epic's notice
- The page runs edge to edge by itself.
  It links `spell-doc.css` alone (no `plan-doc.css`:  P14).
- Dates:  WRITTEN one way, DRAWN another.
  - Written as below:  `2026-10-08 14:34`, `2026-10-08`, or ISO with an offset.
  - Drawn `10/8/26 14:34` / `10/8/26`, by every element but the log's `<epic-event>`
    (`PlanDates`, in `$/epics/dates`).
  - Never write the drawn form.
- The page's data, on `<epic-page>`:
  - `branch`, `worktree`:  none for a future epic (`new --future`).
    - `new` on a future epic's doc, or its first phase, plans it:  `future` goes.
  - `started`, `updated`:  `YYYY-MM-DD`.
    Every edit stamps `updated`.
  - `recent-since`:  the commit time of `HEAD~2` in the doc's checkout (D2).
    - Since 2026-10-08 it colours nothing:  a decided item stays green however old.
    - Kept until it's dropped (`PlanReader.recentSince`).
  - `bedtime="P3-P6"`:  a `/bedtime` run is on (`bedtime <name> start | done`).
  - `repo`:  the GitHub page every `<epic-commit sha>` links through.
    Written by `commit`, and by `commits --backfill`.
- Sections are fixed:  each `kind` once, in that order, with its id.
  - `questions` keeps the id `#decisions`.
  - Drawn:  their titles, icons, notes, counts and the progress bar.
  - A REPORT (`kind="report"`, P14) is the one section that isn't fixed:
    - what a run wrote for Owen to read (an overnight `/bedtime` report)
    - its own `id` and `title`
    - right after the Overview, unnumbered, with the page's bands
- The Overview:  `<epic-summary>` (two sentences, drawn as a lede), then `<epic-prompt>`, then its sub-sections.
  - `<epic-prompt>`:  the kickoff prompt, folded under "Kickoff prompt".
    `new --prompt` and `prompt <name>` write it.
  - An older doc's summary and prompt still read the same, until the second conversion pass:
    - `<p slot="summary">`, `<blockquote slot="prompt">`
    - `prompt <name>` turns the old quote into an `<epic-prompt>`, where it stood.

### A saga page

A SAGA PAGE is an epic page of kind "saga" (epic `epic-workflow` P15):
one saga's page, `sagas/<id>/<id>.saga.html`, in the same markup, so the tool edits it as any epic page.

```html
<epic-page kind="saga" saga="epics" title="Epic Tooling" started="2026-10-14" updated="2026-10-14">
  <epic-overview id="overview">
    <epic-summary>The saga's purpose, from sagas/sagas.json5.</epic-summary>
    <epic-section id="o1" kind="overview-part" title="Done so far">...</epic-section>
    <epic-section id="o2" kind="overview-part" title="Ideas not done yet">...</epic-section>
  </epic-overview>
  <epic-section id="epics" kind="epics"><epic-cards saga="epics"></epic-cards></epic-section>
  <epic-section id="decisions" kind="questions">...</epic-section>
  <epic-section id="todos" kind="todos">...</epic-section>
  <epic-section id="log" kind="log">...</epic-section>
</epic-page>
```

- `saga` names it;  no `epic`, `branch` or `worktree`, and no phases.
- Made by `epic saga page <id> [--force]`, from the tool's `templates/saga.html`:  one file, not split.
- Named to every verb by its short address:  `epic add SAGA:/epics#T "..."`, `epic inbox SAGA:/epics wait`,
  `epic check SAGA:/epics`.
- `<epic-section kind="epics">` is a saga page's alone:  its `<epic-cards>` draws the epics whose
  `<epic-page saga>` names the saga, from the page server.
- Its marks and comments wait in its own inbox, `<id>.inbox.json5` beside it;
  `/epic review SAGA:/<id>` takes them.

## Ids

As `plan-doc.md`, "Ids":
- The letters:
  - `q` question (an answered one is a decision)
  - `j` judgement call, `c` caveat, `t` todo
  - `i` issue, `v` test
  - `p` phase;  `o` Overview sub-section
- An item's KIND is its id's letter (Q11):  one `<epic-item>` for all of them, in its kind's section.
- An old decision's `d7` lives on as an `<epic-answer id="d7">` inside its question:
  - old `#d7` links land
  - `close d7` finds the question
- A PHASE's id is STABLE (epic `epic-workflow` P15, I7 and J49):  made once from its name when it's added, and kept
  for good.  Its number is only its place.
  - `p-` and the name's slug:  "Epic Migrate" is `p-epic-migrate` (`PhaseIds`, in `$/epics/phases`).
    - The slug:  lower case, words joined by `-`, anything else dropped;  an apostrophe joins its word (`owens`).
    - A clash with any id on the page gets `-2`, `-3` ...
  - A rename changes the title, never the id;  an insert changes numbers, never ids.
    So links (`#p-epic-migrate`), comment anchors (`p-epic-migrate#field-1`), inbox marks and drafts, and the part
    file (`parts/p-epic-migrate.html`) stay on their phase.
  - "P7" is what people see and say:  the 7th phase, worked out as the page draws (`<epic-phase>`, the step label, the
    Epics list page) and as the tool prints.
  - The tool takes a phase as people name it, wherever it takes one:  `7`, `P7`, `seo#P7`, `#p7`, its id, its name or
    slug (`"Epic Migrate"`, `epic-migrate`;  a renamed phase by its name today too).
  - An older page's ids are numbers (`p7`):  they still read, until `stable-phase-ids` ("Migrations") converts them.
    An old address, `#p7`, still lands on the 7th phase (`PhaseIds.landing()`, the docs runtime's `addressedId()`).

## Phases

```html
<epic-phase id="p-short-name" title="Short Name" status="active" estimate="1-2h" changes="1">
  <epic-field name="symptom">what's wrong today, one line</epic-field>
  <epic-field name="changes">what changes, two or three lines</epic-field>
  <epic-field name="requests"
    ><epic-field label="r3 · 🚧 python (83d39e12)"><blockquote><p>Owen's words</p></blockquote> ...</epic-field
  ></epic-field>
  <epic-field name="goal"><ul><li>a bullet per outcome</li></ul></epic-field>
  <epic-update at="2026-10-06 14:30" phase="3" summary="Split in two"><p>what changed in the plan, and why</p></epic-update>
  <epic-field name="done"><ul><li>what was built</li></ul></epic-field>
  <epic-commit sha="2c71ac57...">one or two sentences</epic-commit>
  <epic-field name="files">...</epic-field>
  <epic-field name="verify">...</epic-field>
  <epic-field name="to-review"><a href="#j1">J1</a>, <a href="#c3">C3</a></epic-field>
</epic-phase>
```

- `id`:  stable, from the name it was added under ("Ids");  `P2`, its place, is drawn.
- `title`:  2-4 words, WITHOUT `P2 · ` (drawn).
- `status`:  `todo`, `active` (one at a time), `done`.
- Children in that order, always (the vocabulary's `childOrder: "listed"`):
  the tool puts each where it belongs.
  - Owen's kept notes (`<epic-reply>`) after Requests, before Goal;  slotted children (status cards) at the end.
- `add-phase`'s fields:
  - with `--symptom` / `--changes`:  Symptom, Changes, then Goal (optional), Files, Verify
  - without:  Goal, Files, Verify
  - A field not given reads `TBD`.
- `add-phase ... --before N`:  inserted as PN (`N` any way the tool takes a phase:  `--before epic-migrate`).
  - Every phase from N on moves down a NUMBER;  ids stay, so links, comments, marks and part files stay on them.
    What says the number follows:
    - the `PN` in the words of links to it (`<a href="#p-docs">P5 · Docs</a>` says `P6`)
    - `phase` on items and `<epic-update>`s (and `of` on an older doc's `<epic-updated>` copies)
  - Prose naming a phase without a link isn't changed.
  - Refused while a phase from N on has started (done or active):  its commits and log say its number.
- `update <name>#<P6 | id> --title "New title"` (epic `epic-workflow`):  a phase's or an item's new title.
  - Its `title`, or its `slot="title"` child's words (the UPDATE markers in it stay).
    `--html` (last):  the title has markup, so it's a title slot.
  - Links to it whose words say the old title follow:  `P6 · Old` -> `P6 · New`, `Old` -> `New`.
    Any other words stay (`P6`, "the next phase"), and so do links in an Original Discussion (history).
  - A phase:  each item queued for it (`work="P6 · Old"`) follows too;  its id stays (made from its first name).
  - An item is stamped and flagged UPDATE, as any change to it.
  - Logged:  `P6 renamed:  "Old" -> "New" (2 links)`.
- `<epic-page saga="<id>">` (epic `epic-workflow` P15):  the saga the epic serves, one of `sagas/sagas.json5`'s ids.
  `saga set <name> <saga>` sets it (`--none` clears it), logged;  `new <name> --saga <id>` at birth;  refused for a
  saga not in the list.  The page draws it in its meta lines, a link to the saga's page;  `summary --json` and
  `list --json` carry it.  No migration step:  an epic with none simply names no saga.
- `<epic-page standing>` (epic `epic-workflow`):  a STANDING epic, open for good;  each phase merges into `main` on its
  own, and every phase done is NOT done (STANDING, not DONE).  `update <name> --standing [on|off]` sets it.
- Requests (epic `epic-workflow`):  what Owen sent the phase from other sessions, one labelled block per request.
  - Written by `epic file <epic>#P<N> <rN>` (the tool's `request <name> <N> <rN> --from "..." --file f`).
  - The block:  his words quoted, what the sender was looking at, when, a link to `requests/<rN>/request.md`, and
    each screenshot.
  - Filing a request again replaces its block.
- Plan changes:  `<epic-update at summary>` blocks, one per change to the phase's plan, oldest first (see "Updates").
  - Written by `updated <name>#<N> "<html>" [--summary "..."]`.
  - At the END of the phase's description (Owen, 2026-10-11:  "The updated blocks themselves go at the end of the
    phase description"):  after Goal (and Owen's kept notes), before Done, the commits, Files, Verify, To review.
  - `phase`:  the phase active then.
  - They stay once the phase is done.
  - No box around them (Owen, 2026-10-11:  "lose the "Plan changes" surround"):  each is its own block.
  - The phase's `changes`:  how many, written by the tool on every edit, in the skeleton.
    While the phase isn't done, its title shows an orange pen and that count, folded too (its part not loaded).
  - Older docs:  `<epic-updated>` lines, in the phase's `changes` slot (P6, 2026-10-11) or in no slot, and COPIES of
    the to-do phases' first in the Phases section (`<epic-updated slot="changes" of="N">`, T14).
    - They still read, and draw:  slotted lines at the end of the phase's body, unboxed.
    - The tool's next write migrates them (`updates-as-epic-update`, "Migrations").
- `estimate`:  wall-clock time for Claude, agents included, Owen's review not.
  - E.g. `30m`, `2h`, `1h30m`, `1-2h`.
  - The Overview's `estimate` is the total, rewritten on every change:
    `4h-5h 30m in all, 2h-3h left (P5 not estimated)`.
- `to-review`:  written by the tool on every edit, LAST.
  - It lists items added while this phase was active (`phase="N"`),
    still open, not reviewed, not under way.

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

- The order is fixed:
  1. a question's `<epic-question>`
  2. the item's text:  prose, the prose elements and its option cards among it ("Prose elements" below)
  3. the answer, More Details, replies, Original Discussion, commits
  - Claude's status cards (`<epic-status slot="status">`, "Status cards" below) are slotted,
    so at the end, out of the order.
  - The element draws:
    - the chip (`Q3`, in its state's colour) and the review label
    - `Question` over the question as asked, "Original reply" over the text
    - every card's heading
- A question's text as first asked is its `<epic-question>`, found by its tag, not its place:
  - `add <name>#Q`, and a rewrite of a question's text (`details --file`), put the lead of the HTML they're given
    in one, unless the HTML has one.
    - The lead:  the prose up to the first element or bold label line (`<p><b>The options:</b></p>`).
  - A rewrite moves the old one into the Original Discussion, with the rest of the old text.
  - `--append` never makes one.
- `title`:  WITHOUT its id;  with markup, a `<span slot="title">` child instead.
  - An UPDATE label rides in the title (a bare `<epic-update>`, "Updates"):
    `<span slot="title">Title <epic-update phase="2"></epic-update></span>`.
  - `phase 2 done` removes it, and a title left plain goes back to `title`.
- Data, all attributes (the definitions check each value):
  - `status`:
    - `open`
    - `decided`:  an answered question.
      Set by `decide`, or by `add <name>#D`, born answered with `answered`.
    - `done`:  closed (fixed, passed, accepted)
    - `canceled`:  made moot (struck through)
  - `state`:  the first row below that applies.
    - The tool rewrites it on every edit;  its colours:  "Colours" below.

    | `state`     | colour | when                                                                               |
    | ----------- | ------ | ---------------------------------------------------------------------------------- |
    | `progress`  | blue   | Claude is working on it:  an underway status card, or `working`                    |
    | `old`       | grey   | canceled:  no longer relevant (made moot, struck through)                          |
    | `recent`    | green  | decided or done (`decided`, `done`, an old `d7`), however long ago                 |
    | `open`      | yellow | work a review queued (`queued`), not started                                       |
    | `replied`   | orange | open, and Claude's LAST reply holds options nothing is picked in yet:  Owen's turn |
    | `attention` | red    | an open question;  an open judgement call or issue not reviewed, unless `calm`     |
    | `recent`    | green  | open, settled by a review:  `review-as` `approve` or `todo` (`SETTLED_AS`)         |
    | `open`      | yellow | anything else open:  still undecided, not urgent;  a revisit or Do Now answered    |

    - Green across the board for what's decided, grey only for what no longer matters (Owen, 2026-10-08).
      A `/bedtime` run and `recent-since` no longer colour anything.
    - `replied` (Owen, 2026-10-09):
      - The reply is the item's last `<epic-reply>`, `from="Claude"`, holding an `<epic-choices>` without `chosen`.
      - A pick, a newer reply from Owen, or closing the item ends it.
      - A reply that asks without cards (a yes / no in prose) doesn't make it.
      - It counts as needing Owen, as `attention` does:  the rail's count, the "only what needs you" filter.

  - `changed`:  ISO local time with offset.
    - Stamped by every command that changes its status or review marks.
    - `bedtime` while a `/bedtime` run is on, until reviewed.
  - `phase`:  the phase active when it was added.
  - review marks:
    - `reviewed`, `deferred`, `queued` (`YYYY-MM-DD`), `work`, `working`
    - `review-as`:  how Owen's mark was handled
      - `approve`, `todo`, `revisit`
      - `now`:  a Do Now request done, written by `inbox done`
      - `next`, `drop`:  a todo queued into the next phase, or dropped
      - `skip`:  the note box's x, nothing to do
    - `review-as` is the record (the log, `review` outcomes, the state above), never drawn on the buttons:
      once Claude has handled a mark, they clear, and the chip shows the result.
- A TODO's review buttons (Owen, 2026-10-09):  the plane, Revisit, the x, in one group.
  No Approve, Make Todo or Do Now.
  - The plane (`next`, green):  "Do it in the next phase".
    - `inbox apply` queues it into the first phase whose status is `todo`:
      `queued`, and `work` `P10 · <name>`.
    - No such phase:  `the next phase`, and its line says so.
    - A Noted status card, `Queued for P10 · <name>`;  reviewed.
    - Its chip stays OUTLINED green while queued:  the work is due.
  - Revisit (blue):  "Revisit:  I'm adding a note for you";  answered as any revisit.
  - The x (`drop`, grey):  "Drop it".
    - `inbox apply` cancels it:  struck through, grey;  reviewed.
    - The log:  `T3 canceled:  dropped by Owen in review`.
  - Its note box matches:  the plane, Revisit Later, the x.
    - The plane or the x takes the note in the box along.
    - `inbox apply` keeps it first, as Owen's `<epic-reply re="next phase">` (or `re="drop"`).
  - Every other kind keeps Approve, Revisit, Make Todo and Do Now (the wand).
- EVERY other note box (an item's, an Overview sub-section's, a phase's, the summary's):  Revisit Later, then the x.
  - The x is `skip`, grey:  "Skip this".
  - It took Make Todo's place in the box (Owen, 2026-10-09);  Make Todo stays on the line.
  - The x means nothing to do here.
    - It takes the note in the box along, or none.
    - It replaces any other mark, a pick too.
    - No line button wears it:  the id chip alone does, grey (dashed, then outlined once sent).
  - `inbox apply`, on an item:  reviewed, and nothing else.
    - Its status stays as it was:  an open question stays open, since `skip` settles nothing.
    - No status card.
    - A note is kept first, as Owen's `<epic-reply re="skip">`.
    - The log:  `J9 skipped:  nothing to do, reviewed`.
  - On a todo, skipping it IS dropping it.
    - Its own box's x is `drop`.
    - A `skip` from a page drawn before is applied as `drop`.
  - On an Overview sub-section, a phase, or the summary:
    logged (`P3 skipped:  nothing to do`), and a note kept as for any mark of theirs.
- Options:  `<epic-choices>` of `<epic-option letter title recommended>`, the same open or answered.
  - `chosen` once answered:  `decide --option B`, or a pick.
  - Mark ONE `recommended`.
  - On ANY item kind (P14):
    - a question's own, after its text
    - or the options a judgement call, a reply or More Details weighs
    - an item may hold several
- Picks work on ANY of them (I8).
  - The mark names the set by its position:  `{ pick: "B", choices: 1 }`.
    - Counted among the item's sets in page order, its Original Discussion's never counted
      (`PlanItem.choiceSets()`).
    - No `choices` (an older mark):  the item's own.
  - `inbox apply` sets THAT set's `chosen`.
  - A question is answered with the option:  no other set stays chosen.
  - Any other item is APPROVED with it:  an open judgement call closed, accepted;  reviewed.
  - Either way:
    - a Noted card:  `Chose B · <title>:  <what was recorded>;  <what happens next>`
    - e.g. `recorded as the answer;  waiting for the next phase, P9 · <name>`
    - and the option in the log line
  - A pick riding on a revisit ("pick B, but ..."):  left for the talk.
    - Claude finishes the mark (`inbox done | clear`) without a `decide --option`:
      the pick is still written as that set's `chosen`, with a Noted card (`keepPick()`).
    - Once Owen picked, the card says Chosen (Owen, 2026-10-10).
- The way in (`IncomingHtml`):  agents may still write the OLD shapes.
  - Every command taking HTML turns them into elements on the way in, so a doc never holds them.
    - Those commands:  `add --details`, `decide --details`, `details --file`, `updated`, a phase's fields.
  - An option grid -> `<epic-choices>`:  `ui-grid.spell-pros-cons`, labels `A · Title (recommended)`, wherever it sits.
  - A `div.plan-reply` -> `<epic-reply>`.
  - These -> the prose elements below
    (`ProseRewrite`, by the converter's own rules, `ProseShapes`):
    - a `Net effect` paragraph and its list
    - a `ui-accordion.spell-code` / `.spell-aside`
    - a `ui-message.plan-update`
    - a labelled block (`<b>Where:</b>`)
  - A name and its file's path -> the name, its path its tooltip
    (`PathTooltips`;  epic `airplane`, WWOD §6 › "Plain text, plain paths").
    The linker links that name to the file:

    ```html
    BEFORE  <code>buildTsx()</code>, <code>packages/spell/src/node/buildTsx.ts:40</code>
    AFTER   <code title="packages/spell/src/node/buildTsx.ts:40">buildTsx()</code>
    ```

    - Read:
      - a path alone in brackets after a name
      - a path after a comma, when the name is the file's or its folder's
      - either as plain text, or linked (the link moves onto the name)
    - Left as they are:  a folder, a file with no folder or line, a list of names, any other wording ("in").
  - Never inside code, or an Original Discussion.
  - A shape those rules can't read for sure stays prose:
    - a Net effect worded otherwise
    - a code accordion holding a `<ui-code>`, or two blocks
    - a note headed `DEFERRED`
- A rewrite never drops text:  `details --file`, `decide` again, `details --more` again.
  - What it replaces moves into `<epic-original>`, one `<epic-version>` per version.
    The first is undated;  the rest `as-of` when replaced.
  - Cards become the prose they said:  `Answer · Chrome`, `B · Chrome (recommended), chosen`.
  - The prose elements stay, an `<epic-question>` too.
  - Ids inside become `data-original-id`.
  - `restore <name>#<id> --file` puts text recovered from git there (old markup welcome).
- `--append`:
  - an `<epic-reply>` goes after the replies
  - other prose at the end of the item's text, after its option cards (they're prose too)
- A details page has no `<epic-*>` elements:  an item's text goes there as the prose each element draws.
  - E.g. `Net effect (A):` over its list, a code block's title over its `<pre>` ...
  - `PlanItem.asProse({ plain })` does it.
- Owen's note, once Claude clears its mark:  `<epic-reply from="Owen" at="..." re="revisit soon">`.
- An Overview sub-section takes review marks too (Q14):
  - approve and skip are logged
  - todo makes a todo linking `#o3`
  - a kept note is a paragraph at its end
- So do a phase and the summary (epic `airplane` P2):  Revisit, Make Todo and Do Now on the page;  no Approve.
  - A phase (keyed by its id, `p-epic-migrate`;  a mark keyed `p3` from before `stable-phase-ids`:  the 3rd phase):
    - todo makes `Follow up:  P3 · <title>`, linking `#p-epic-migrate`, and a Noted status card on the phase
    - a kept note is Owen's `<epic-reply>` in the phase, after Requests (its plan changes come after Goal)
  - The summary, keyed `summary` in the inbox (it has no id):
    - todo makes `Follow up:  the summary`, linking `#overview`, and a Noted status card under the lede
    - a kept note is `<epic-reply slot="notes">` in `<epic-summary>`
- NEW items from the page (epic `airplane` P2).
  - Asked for with a small form:  todo or question, title, note, what it's about.
  - Opened by the page toolbar's new-item button:  comment dots (Owen, 2026-10-10).
  - Or by a New todo / New question button, at the end of the Todos and Questions sections.
  - It waits in the inbox as a mark under a key of its own, `new1`, `new2` ...:
    `{ action: "new", kind, title, note?, near? }`.
  - Drawn at the end of its section:  dashed until sent, then outlined.
    Editable and removable until Claude makes it.
  - `inbox apply` makes each sent one as `add` does:
    - the note its details (a question's lead)
    - `About <a href="#p-epic-migrate">P3</a>.` for `near` (a phase by its id, or as typed:  `p3`)
    - a Noted status card, `Made from the page:  Owen's new todo, written <time>.`
    - one log line
  - `inbox clear new1` drops one;  its note is never kept as a reply.

## Prose elements

The blocks prose used to shape by hand, now each an element (epic `epic-components` P14).
- The element draws its chrome around prose that stays the page's own children,
  so find-in-page, `#id` links and the live update keep working.
- Each is `flow`:  it goes wherever prose goes.
  - an item's text, a reply, an option card, a phase field, an Overview sub-section
  - but `<epic-question>`, `<epic-summary>` and `<epic-prompt>`, which have one place each

| element                       | example                                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| `<epic-net-effect>`           | `<epic-net-effect option="A" recommended><ul><li>...</li></ul></epic-net-effect>`:  `Net effect (A, recommended):` over its list (or a `<p>`);  no `option`:  `Net effect:` |
| `<epic-question>`             | `<epic-question><p>Which browser first?</p></epic-question>`:  a question's text as first asked, under `Question`;  FIRST in its item (or a version) |
| `<epic-summary>`              | `<epic-summary>Two sentences.</epic-summary>`:  the Overview's lede, once                 |
| `<epic-prompt>`               | `<epic-prompt><p>the prompt, as typed</p></epic-prompt>`:  folded under `Kickoff prompt`, once in the Overview |
| `<epic-code>`                 | `<epic-code title="design.ts · 12 lines" language="ts"><pre>...</pre></epic-code>`:  folded, highlighted, ONE `<pre>` of text (`&lt;` for a `<`);  `open` to start open |
| `<epic-aside>`                | `<epic-aside title="why not now"><p>...</p></epic-aside>`:  folded, headed `Aside:  why not now` |
| `<epic-note>`                 | `<epic-note state="update" title="partly fixed by J9"><p>...</p></epic-note>`:  a small orange `UPDATE` (or green `DONE`, `state="done"`) note that stays, folding by its heading;  not `<epic-update>` ("Updates") |
| `<epic-update>`               | `<epic-update at="2026-10-11 14:30" summary="Q3's answer moved to B" phase="6"><p>...</p></epic-update>`:  an update, right AFTER the block it changed ("Updates") |
| `<epic-choices>`              | as in "Items":  option cards, on any item kind                                            |
| `<epic-link>`                 | `<epic-link saga="drawable-spell" epic="python-target" item="T1"></epic-link>`:  a link to a saga page (`saga` alone), an epic page (`epic`), or an item or phase on one (`item="T1"`, `phase="7"` or `phase="epic-migrate"`);  none of `saga` / `epic`:  the page it's in.  No text:  draws the short form (`python-target T1`, `T1` here, `P7 · Epic Migrate`), the target's title its tooltip ("Links") |
| `<epic-field label>`          | `<epic-field label="Where"><p>the inbox file</p></epic-field>`:  a labelled block, `Where:` before its prose (`What should happen`, `Step`);  a phase's fields have `name` instead |
| `<epic-section kind="report">` | `<epic-section id="overnight" kind="report" title="Overnight · 2026-10-04">...</epic-section>`:  a run's report, after the Overview (`The page`) |
| the crumbs                    | none written:  `<epic-page>` draws `Docs › Epics › <title>` from its `title` (an older doc's `.spell-crumbs` before it:  it draws none) |

## Status cards

What Claude took each of Owen's review marks to mean, and that it's done or noted (P13).
- A card per mark, on what the mark is on:  the item, the Overview sub-section, the phase, the summary.

Two kinds of finished card, so a card that only RECORDS Owen's choice never reads as work done.
In Owen's words (2026-10-10):  "Claude Done entries are confusing ... you haven't apparently done anything".

| card             | when                                                                  | says, in one line                                   |
| ---------------- | --------------------------------------------------------------------- | --------------------------------------------------- |
| `Claude • Noted` | Claude RECORDED what Owen chose, nothing built yet:  a pick, a todo made or queued, a new item made, a choice talked over | what was recorded, and what happens next:  `Chose B · Bananas:  recorded as the answer;  waiting for the next phase, P9 · Build` |
| `Claude • Done`  | WORK was done:  an answer or reply written, code changed, a phase built | the reading kept, a summary when worth saying     |

```html
<epic-status slot="status" state="underway" at="2026-10-08 14:20">
  <p>Weigh one JSON file for the pack templates against a file each, and answer here.</p>
</epic-status>
<epic-status slot="status" state="done" at="2026-10-08 14:20" done-at="2026-10-08 14:34">
  <p>Weigh one JSON file for the pack templates against a file each, and answer here.</p>
  <p slot="summary">Recommended a file each:  JSON would need every template escaped.</p>
</epic-status>
<epic-status slot="status" state="noted" at="2026-10-08 15:02">
  <p>Chose B · Keep one file per template:  recorded as the answer;  waiting for the next phase, P9 · Build</p>
</epic-status>
```

- Drawn, a band:
  - on its left, the kind:
    - `Claude • Underway`:  blue fill
    - `Claude • Done`:  green fill
    - `Claude • Noted`:  no fill, a green outline (the fill rule's "recorded")
  - on its right, the date:  `done-at` once finished, else `at`
  - then the reading;  then the summary, if any
- An underway card makes its item `progress` (blue:  Claude is working on it) until it's done.
- `slot="status"`:  never ordered.
  - Written last in the item, or the section.
  - Drawn last in the details:  UNDER Owen's marked note, and above the note box
    ("under my input", Owen, 2026-10-08).
  - A part file never holds them:  they stay in the skeleton with the title.
- The reading:  one or two sentences, plain words, no file names.
- The summary (`slot="summary"`, one or more blocks):  only when there's something worth saying.
  A surprise, a choice made, something left undone.
- A later mark on the same item:  a new card after the old ones, which stay, as the record.
- Written by the tool only:
  - `status <name>#<id> underway "<reading>"`:  a new underway card, stamped now;  the page's spinner on.
  - `status <name>#<id> done ["<summary>"]`:  WORK was done.
    - The LATEST underway card turns done (`done-at`), the reading kept;  spinner off.
    - Refused with no underway card.
  - `status <name>#<id> noted "<what>"`:  Claude only RECORDED Owen's choice.
    - The latest underway card turns noted, `what` its summary.
    - None:  a card born noted (`at` alone).
    - Spinner off.
    - `done --filed "<what>"`, the older spelling, writes the same Noted card.
  - `inbox apply`:  a card born NOTED for each of these (none for an approval):
    - each pick and todo it files (Q19):
      - a pick:  `Chose B · <option>:  recorded ...;  waiting for ...`
      - a todo:  `Made todo T23 to follow this up.`
    - each todo it queues:  `Queued for P10 · <name>`
    - each new item it makes:  `Made from the page:  Owen's new todo, ...`
  - `inbox done | clear` of a mark carrying a pick:  a Noted card with the pick kept,
    `Chose B · ...:  recorded after the talk;  ...`.
    Unless a `decide --option` already chose in that set.
  - The reading and summary are HTML, as `updated` takes:
    - inline runs go in a `<p>`;  blocks stay
    - plain text works as it is (`&lt;` for a `<`)
- A rewrite of the item's text (`details --file`) leaves its cards where they are:
  they never reach its Original Discussion.

## Colours

Drawn, never written:  one meaning per colour on every element (decision Q20, Owen, 2026-10-08).

| colour | means                                    | where                                                                  |
| ------ | ---------------------------------------- | ---------------------------------------------------------------------- |
| red    | needs Owen                               | `attention` chips;  the rail's count (only what needs him)             |
| yellow | open, still undecided (DARK text on it)  | `open` chips;  a `to do` review label                                  |
| blue   | do it now, or Claude is working on it    | `progress` chips (outlined);  Revisit, Do Now and Review Now (both the wand), Send;  Underway cards;  the active phase |
| green  | decided or done (however long ago)       | `recent` chips;  Approve, Make Todo, a todo's plane (next phase), a pick, the chosen option;  Done cards (filled), Noted cards (outlined);  DONE |
| orange | changed since Owen looked, or a warning;  an item Claude answered with options, waiting for Owen's pick (Owen, 2026-10-09) | UPDATE labels, `<epic-update>` blocks, a phase's changed pen;  "nobody is listening";  a blocked agent;  `replied` chips (DARK text on them), counted on the rail as needing Owen |
| violet | Claude's voice                           | his reply cards;  the bedtime label                                    |
| ivory  | Owen's voice                             | his note box, marked note, reply cards, the answer card                |
| grey   | no longer relevant, inactive, not chosen | `old` chips (canceled);  a todo's x (drop it);  the note box's x (skip this);  a phase to do;  FUTURE;  buttons at rest |

The FILL, on every button, pill and chip with a lifecycle.
- Those are:  the review buttons, the note box's, the pick's letter, the Choose pill and its card, Send.
- The review buttons are Owen's INPUT (Owen, 2026-10-08).

The fills, in the order they come:
- a grey outline:  available
- DASHED in its colour:  Owen pressed it, not committed (not sent;  a Do Now not taken yet)
- OUTLINED in its colour:  recorded (sent), or in progress (a Do Now taken, its icon turning while Claude is on it)
- then CLEARED, once Claude has handled the mark (`inbox apply` / `done`, the inbox's mark gone):
  - every review button is a grey outline again
  - the id chip carries the result:  green decided, yellow still open, red needs Owen
- SOLID only on:
  - chips (an item's state)
  - the step label's DONE
  - a Choose pill on its set's `chosen` option (applied, wherever the cards are)

An item's id chip says WHERE OWEN'S ANSWER STANDS, by its fill.
In Owen's words (2026-10-10):
"it's not clear when an answer is queued and being addressed, so I keep filling in answers over and over".
- DASHED:  his answer given, not sent.
- OUTLINED:  sent.  Claude has it, is on it, or the work it asked for is still due.
- SOLID:  done.  Claude did it, or noted it, and nothing more is due from anyone.
- So at a glance:
  - a dashed or outlined chip is ANSWERED (don't answer again)
  - solid red or orange WAITS ON OWEN

| Owen's answer                          | colour | dashed:  not sent | outlined:  sent, Claude has it, or still due | solid:  done (the item's state) |
| -------------------------------------- | ------ | ----------------- | -------------------------------------------- | ------------------------------- |
| Approve                                | green  | pressed           | sent, until `inbox apply`                    | green:  a call accepted, a test passed;  an issue / caveat settled |
| a pick (the Choose pill)               | green  | picked            | sent;  still outlined once `apply` takes it, until the doc's `chosen` reaches the page | green:  a question answered, a call accepted (a Noted card) |
| an open question answered (Approve:  its recommended option;  or a pick) | green | as above | as above                  | green `decided` |
| Make Todo                              | green  | pressed           | sent                                         | green:  settled;  the new todo is its own item (yellow until queued) |
| a todo's plane:  "do it in the next phase" | green | pressed        | sent;  then QUEUED (`queued`):  outlined until the todo is closed | green, once done |
| a review's "do it" (`queue <id> "work"`) | green | --              | queued:  outlined until started and done     | green, once done                |
| a todo's x:  "drop it"                 | grey   | pressed           | sent                                         | grey `old` (canceled)           |
| the note box's x:  "skip this" (no line button wears it:  the chip alone does) | grey | pressed | sent              | its status as it was (`skip` settles nothing) |
| Revisit, with a note                   | blue   | pressed           | sent:  Claude talking it over                | yellow (talked over, still open);  orange if Claude answered with options (Owen's turn);  green if it got decided |
| Do Now (the wand):  Add Details, a revisit now | blue | waiting to be taken | Claude's agent on it (`working`)     | the state's colour              |
| any work Claude took (an underway status card) | blue | --          | `progress`:  outlined until the card is Done or Noted | the state's colour      |
| a new todo or question from the page   | its section's new row | not sent | sent                              | the new item's own chip (a question red, a todo yellow) |
| urgent / not urgent (the id chip itself) | red / yellow | a dashed ring | --                                    | solid red / yellow              |

- The chip of an item waiting on Owen is never outlined:
  - `attention` (red) and `replied` (orange) stay solid
  - the toolbar counts them (`state`, as the script writes it, unchanged)
- Outlined is drawn from the item's own marks, never written:
  - Owen's live mark (the inbox)
  - a pick Claude took (`ReviewClient.takenPickOf()`)
  - `queued` on an open item
  - `progress`

## Folding

EVERYTHING boxed in a section folds (Owen, 2026-10-08):  every card with a heading band folds from it, chevron first.
- Newly folding:  a reply (Owen's and Claude's), the answer, a status card, an `<epic-note>`, an `<epic-update>` block,
  an older doc's `<epic-updated>` fence, an open question's option card.
- As these already did:
  More Details, Choices, an aside, a code block, Original Discussion, Agents running.
- Open to start with:  the text being read.
  - An item and an aside start folded.
  - Page state, never written.
- Folded content is `hidden="until-found"`, so find-in-page reveals it.
- A click anywhere on the band folds, but on a link or a control in it (`Fold.heading`, `fold.button()`).

The review buttons, at every step:  Approve, Revisit, Make Todo in one group, then Do Now apart.
- Do Now is the wand:
  the inbox's `details` request, or a revisit now when the note box holds a note.
  - Nobody listening:  it stays dashed, "waiting for a session",
    and the page server wakes the epic (epic `epic-workflow` P16:  plan-doc.md, "Review inbox").
- The note box's:  Revisit Later, then the x (skip this).

## Updates

ONE element for every update (Owen, 2026-10-11:  "Make these a new `<epic-update>` web component so we can restyle
easily"), `components/epic-update/`:

```html
<epic-update at="2026-10-11 14:30" summary="Split in two" phase="6"><p>what changed, and why</p></epic-update>
<span slot="title">Title <epic-update phase="6"></epic-update></span>
```

- A BLOCK:  it has a `summary`, an `at` or children.
  - Drawn titled `**Update**: <summary>`, its date (`at`) at the right of the title row, as a comment thread's
    message shows its time;  what changed under it.  Orange:  changed since Owen looked.
  - It folds by its title row, open to start with.
  - Owen comments on it with its own bullhorn (`BlockAnchors.js`, kind `update`), even inside an item or a field.
  - `at`:  `YYYY-MM-DD HH:MM` (any form `PlanDates` reads).  `summary`:  one line, plain text.
    The tool's `updated` without `--summary`:  the first sentence of what changed (`UpdateSummary`).
  - Where it goes:
    - a PLAN CHANGE:  at the end of its phase's description (`updated`;  "Phases")
    - an update to PROSE (an agent's, by hand):  right AFTER the block it changed (Owen, 2026-10-11:  "or after the
      section which they updated"):  after the paragraph, list or code block, inside its item, field or Overview
      sub-section;  an update to a whole Overview sub-section goes last inside it
    - Before 2026-10-11 a prose update was a NOTE placed BEFORE the block (`<epic-update phase>` with children, no
      `at`):  migrated (below).
- A bare LABEL:  no summary, no date, no children.  An orange `UPDATE` inline:  an item changed while a phase is active
  (the tool puts it in the item's title), or a changed line of prose.
- `phase`:  the phase active when it was written.
  - `phase N done` removes phase N's bare labels and its updates OUTSIDE a phase (prose updates):  once the phase is
    finished, those changes are just the plan.
  - A phase's own plan changes (`epic-phase > epic-update`) stay for good:  the record of how the plan moved.

## Migrations

Named, dated, idempotent steps that bring an older page's markup up to today's, by page KIND
(`migrations/`, `Migrations`;  epic `epic-workflow` P8, J44).
- Each step names its kind (`epic` for every step here), the day it was added, and a one-line why.
  - The epic page's steps:  `Migrations.all`, here.
  - The other kinds' (guide, cheatsheet, commands page ...):  the docs tools' `packages/epics/tools/migrate.js`.
  - The kinds:  `PAGE_KINDS` (`migrations.types.ts`), the names P14 proposes;  the docs tool's `KINDS` is the same list.
- `epic migrate` runs them on command (`MigrateCommands`):

  ```text
  migrate [<kind>] [<epic>... | --all] [--file <page>] [--step <name>] [--dry-run] [--notify] [--list]
  ```

  - alone:  every kind, every page;  `<kind>`:  one kind;  `--file`:  one page (its kind found unless given)
  - `<epic>...` or `--all`:  epic pages:  those, or every one `list` lists
  - every step, oldest first (`--step`:  one), each page under its lock (`PlanDocFiles.migrate()`):
    it waits for a writer, and works on the page as the writer left it
  - a report per page:  `seo:  up to date`, or the steps that changed it and what each fixed or found;  then a total
    by step.  The docs tool lists only the pages that changed, then a total per kind.
  - `--dry-run`:  the same report, nothing written
  - a migrated epic page is logged (`migrated:  links-agree`) and recoloured, but NOT stamped `updated`:
    nobody worked on the epic
  - a migration that would break the doc refuses that page, writing nothing, as any edit does
  - `--notify` (J39):  an epic whose session is RUNNING (titled for it, found as `epic send` finds its receivers)
    is only dry-run, and printed under `TELL:` with the one line to send it;  the idle ones are migrated there and then.
    The command can't send a `SendMessage`:  the session that ran it sends each line (the epic skill's "Migrations").
- Every edit also runs the cheap markup steps (`everyEdit`), first (`PlanDocFiles.edit()` -> `PlanDoc.migrate()`),
  logged:  `migrated:  updates-as-epic-update`.  A step that reports, or rewrites more than markup, runs only on command.
- The epic page's steps:
  - `updates-as-epic-update` (2026-10-11, every edit):  every older update shape becomes `<epic-update at summary>`
    - a phase's `<epic-updated>` lines (slotted or not) -> blocks at the end of its description, children kept
    - their copies in the Phases section -> removed
    - an UPDATE note before a block -> moved after it, dated (its item's `changed`, else the page's `updated`) and
      summed up;  left where it is when the next sibling is a card with a fixed place
    - a bare label -> left alone
    - P8's goal named `plan-changes-in-phase` (P6's move of a phase's Plan changes into it):  no step of its own,
      since this one takes every `<epic-updated>` line, wherever it is
  - `owen-types-to-you-type` (2026-10-11, every edit):  prose says "You type" / "you type", not "Owen types":  the pages
    speak to whoever reads them (Owen:  "so it's not me-specific").  Never in his quoted words, code, the log or the prompt.
  - `links-agree` (2026-10-11, on command;  Owen on I7):  every `#id` link and comment anchor against today's ids and
    titles (`LinksAgree`)
    - fixes:  a link's words naming a title its target had before (the log's `renamed` lines say which), a phase link
      naming another phase's title (`#p-docs P10 · Doc Review` -> `#p-doc-review P11 · Doc Review`), a phase link
      saying an old number (an insert moved it down:  `#p-doc-review P10 · Doc Review` -> `P11 · Doc Review`), a comment
      whose block only moved (found by its excerpt, `PlanAnchors`:  BlockAnchors.js's rules, copied), moved in the
      inbox after the page
    - reports, for Claude or Owen:  a link to an id that's gone, a comment or mark on one, a comment whose block's words
      changed
    - never the log, nor an Original Discussion:  history
    - also run by `update --title` and `add-phase --before`, right after their change (what it says goes to stderr)
    - a phase's number in its words is its place (`PhaseIds.labelOf()`);  a phase's `renamed` line names the phase
      titled with its new name, else the one at that number
  - `stable-phase-ids` (2026-10-14, on command;  P15, I7 and J49):  every phase's old id (`p7`) becomes a stable one
    from its name (`p-epic-migrate`:  "Ids"), with everything that uses it (`StablePhaseIds`)
    - the page:  each `<epic-phase id>`;  every link to it (`#p7`, or `<epic>.plan.html#p7`), the log's and Original
      Discussions' too (their words stay;  they just land);  a stray `#p7` no element has, to the 7th phase
    - the part files:  written under the new ids, the old ones removed (`PlanDocFiles.writeDoc()`:  a part the doc was
      read from and no longer writes goes)
    - the inbox, after the page (`context.renames`, `ReviewInbox.renameIds()`):  marks, drafts, urgency, agents at
      work, called-off and immediate requests keyed `p7`, a new item's `near`, comment anchors (`p7`, `p7#field-1`)
    - left:  links INTO the page from other pages (guides, details pages, other epics, the changelog):  `#p7` still
      lands on the 7th phase;  what says a number as a RECORD (`phase="7"`, `taken: { phase: 7 }`, a request's
      `filed: P7`, the log's words)
    - reports:  `stable-phase-ids:  12 phase ids (p1 -> p-epic-migrate, ...), 40 links, 3 in the inbox`
  - `json5-data-files` (2026-10-14, on command;  epic `epic-workflow` P21):  the epic's DATA FILES renamed `.json` ->
    `.json5`, the name the tooling writes now (`Json5DataFiles`, `$/epics/data/DataFile`)
    - the files:  its review inbox and running agents beside the page;  in `details/`, each page's answer (an archived
      round's too), draft and rows
    - renamed after the page, each under its new name's lock (`context.files`, `DataFile.rename()`);  one whose new
      name is there too is LEFT, in the notes, for a person to merge
    - the page's links to any data file by its old name take the new one (`DataFile.linkFor()`):  its only change to
      the page
    - every other page's links, and the data files outside the epics' folders (the docs home's lists, the sagas'
      list, guides' and scratch details pages' files, the commands page's data):  the docs tool's data files pass
      (`migrate.js` `DATA_FILES`), which `epic migrate` runs with every kind, or `--step json5-data-files` alone
    - reports:  `json5-data-files:  3 links to .json5` and `json5-data-files:  12 to .json5 (agents.json, ...)`
- A new step:  a class implementing `Migration` in `migrations/`, its instance added LAST to `Migrations.all`, in the
  SAME commit as the markup change it follows (epics' `AGENTS.md`, "Rules").  Another kind's:  an entry in the docs
  tool's `STEPS`, last.  Either way:  idempotent, every word kept, and a test (a before page becomes the after page,
  and a second run changes nothing).

## Log

`<epic-event at="2026-10-06T08:12-04:00">P2 active</epic-event>`
- `at`:  local time with offset, to the minute.
- `icon` only when it isn't `pen to square`.

## Parts

As `plan-doc.md`, "Parts", with the elements as hosts (`EpicParts`, beside this file).
- The hosts:  an Overview sub-section, a phase, an item with details, the log.
- A host's body is every child but its slotted ones:  the title stays in the skeleton.
- In the skeleton, a host carries `source="parts/<id>.html"`, `part-ids` and `commits`.
- No placeholder line:  the element loads its own body.
- `.html`, not `.htm` (Q12).
  - A part is told from a page by its folder, and every page walker skips `parts/`.
  - The tool reads and writes `.html` only.
    An old doc's `.htm` parts were read until every doc was converted;  no more since P15.

## Links

Pointing at a saga, an epic, a phase or an item, the same way everywhere (epic `epic-workflow` P15, J32).
- In markup:  `<epic-link>` ("Prose elements"), written by what it points at, never by a path.
  - On the page it points into, a `#id` link;  elsewhere, the page from the checkout's root and its `#id`,
    the page server giving it the target's title and short form (`GET /api/epics/target`, [linkRoutes.ts](linkRoutes.ts)).
  - `saga` with an `epic` isn't needed;  one the epic doesn't name still links (the check flags it).
- A SHORT ADDRESS means the same, for a plain link or for Owen in chat:
  - `SAGA:/drawable-spell` -- the saga page;  `SAGA:/drawable-spell#T3` -- item T3 on it
  - `SAGA:/drawable-spell/python-target` -- the epic page;  `...#T1` -- item T1 on it
  - the colon form, `SAGA:/drawable-spell:python-target#T1`, is read too;  the tools write the slash form
  - ids in any case:  `#T1` lands on `t1`
- Who reads them:
  - the docs runtime:  `<a href="SAGA:/...">` becomes the page and its `#id`
  - the page server:  a typed `/saga/<saga>[/<epic>]` redirects to the page, the `#id` kept
  - the openers:  `spell dev docs open SAGA:/...`, `spell dev docs link SAGA:/...`
  - the check:  below
- The code:  `$/epics/links` (`EpicAddress`, `PageTargets`:  pure, browser and node), `EpicTargets` here (what's on
  disk).
- NOT a migration:  a new element, so no older page holds anything to change.

## Checking

Every edit is checked against the definitions before it's written (`Markup.validate()`).
- An edit that would break the markup is refused, and nothing is written.
- `check` reports the same, plus ids, links and parts.
  - Its links include short addresses and `<epic-link>`s (`EpicTargets.problemsIn()`):  a saga not in
    `sagas/sagas.json5`, a page that isn't there, an id not on its page, and an epic under a saga it doesn't name
    (its `<epic-page saga>`) are broken links, failing with `--links`.
