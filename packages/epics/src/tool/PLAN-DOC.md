# Plan docs in `<epic-*>` markup

What `spell dev plan-doc` writes, and what's still DATA, once a plan doc is in the `<epic-*>` markup (epic
`epic-components`, P8).  The elements -- tags, attributes, which children go where -- are described ONCE, in
`packages/epics/src/definitions/` (each `components/<family>/<tag>.vocabulary.en.ts`);  this file holds the rest.

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
    <ui-breadcrumb class="spell-crumbs">...</ui-breadcrumb>
    <epic-page epic="seo" title="SEO" branch="seo" worktree="/.../seo" started="2026-10-01" updated="2026-10-07"
      repo="https://github.com/spell-app/spell-app">
      <a slot="durable" href="../../guides/seo.html">SEO</a>
      <epic-overview id="overview" estimate="4h-5h in all, 2h left">
        <p slot="summary">Two sentences.</p>
        <blockquote slot="prompt"><p>the kickoff prompt</p></blockquote>
        <epic-section id="o1" kind="overview-part" title="Structure">...prose...</epic-section>
      </epic-overview>
      <epic-section id="phases" kind="phases">...<epic-phase>s...</epic-section>
      <epic-section id="decisions" kind="questions">...<epic-item>s...</epic-section>
      ... judgements, caveats, todos, issues, tests ...
      <epic-section id="log" kind="log">...<epic-event>s...</epic-section>
    </epic-page>
  </main></div>
</ui-root>
```

- `<title>` reads `Epic: <title>`;  `<epic-page title>` holds the title alone and draws the h1, the meta lines, the
  step label (active phase, DONE, next, FUTURE), the bedtime label, the "Plan hung?" notice (while there's no phase)
  and a future epic's notice.  None of it is written.
- The page's data, on `<epic-page>`:
  - `branch`, `worktree`:  none for a future epic (`new --future`);  `new` on a future epic's doc, or its first
    phase, plans it (`future` goes)
  - `started`, `updated`:  `YYYY-MM-DD`;  every edit stamps `updated`
  - `recent-since`:  the commit time of `HEAD~2` in the doc's checkout (D2):  items changed since are `recent`
  - `bedtime="P3-P6"`:  a `/bedtime` run is on (`bedtime <name> start | done`)
  - `repo`:  the GitHub page every `<epic-commit sha>` links through (`commit`, `commits --backfill`)
- Sections are fixed:  each `kind` once, in that order, with its id (`questions` keeps `#decisions`).  Their titles,
  icons, notes, counts, the progress bar and the Plan changes box are drawn.

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
  <p>the question as asked ...</p><p><b>Net effect:</b></p><ul><li>...</li></ul>
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

- The order is fixed:  the item's text (prose), Choices, the answer, More Details, replies, Original Discussion,
  commits.  The element draws the chip (`Q3`, in its state's colour), the review label, "Original question" /
  "Original reply" over the text, and every card's heading.
- `title`:  WITHOUT its id;  with markup, a `<span slot="title">` child instead.  An UPDATE marker rides in the title:
  `<span slot="title">Title <epic-update phase="2"></epic-update></span>`;  `phase 2 done` removes it, and a title
  left plain goes back to `title`.
- Data, all attributes (the definitions check each value):
  - `status`:  `open`;  `decided` (an answered question:  `decide`, or `add ... decision`, born answered with
    `answered`);  `done` (closed:  fixed, passed, accepted);  `canceled` (made moot:  struck through)
  - `state`, from the rest (the tool rewrites it on every edit):  `attention` (red:  an open question;  an open
    judgement call or issue not reviewed), `progress` (orange:  `queued` or `working`), `open` (blue), `recent`
    (green:  closed or reviewed since `recent-since`, or `bedtime`), `old` (grey)
  - `changed`:  ISO local time with offset, every command that changes its status or review marks;  `bedtime`
    while a `/bedtime` run is on, until reviewed
  - `phase`:  the phase active when it was added
  - review marks:  `reviewed`, `deferred`, `queued` (`YYYY-MM-DD`), `work`, `working`, `review-as` (how Owen's mark
    was applied:  `approve`, `todo`, `revisit`)
- Options:  `<epic-choices>` of `<epic-option letter title recommended>`, the same open or answered;  `chosen` once
  answered (`decide --option B`, a pick).  Mark ONE `recommended`.  An agent may still write the old option grid
  (`ui-grid.spell-pros-cons`, labels `A · Title (recommended)`):  the tool turns it into `<epic-choices>` on the way
  in, as it turns an old `div.plan-reply` into an `<epic-reply>` (REFACTOR:  until the skills write the new shapes).
- A rewrite (`details --file`, `decide` again, `details --more` again) never drops text:  what it replaces moves into
  `<epic-original>`, one `<epic-version>` per version (the first undated, the rest `as-of` when replaced), cards as
  the prose they said (`Answer · Chrome`, `B · Chrome (recommended), chosen`);  ids inside become
  `data-original-id`.  `original <name> <id> --file` puts text recovered from git there (old markup welcome).
- `--append`:  an `<epic-reply>` goes after the replies;  other prose after the item's text.
- Owen's note, once Claude clears its mark:  `<epic-reply from="Owen" at="..." re="revisit soon">`.
- An Overview sub-section takes review marks too (Q14):  approve is logged, todo makes a todo linking `#o3`, a
  kept note is a paragraph at its end.

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
