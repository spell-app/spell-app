# packages/docs (`@spell-app/docs`)

Docs for every package:  hand-authored `.html` pages rendered with `@spell-app/ui`, their templates, the plan docs
`/epic` keeps, the experiments behind the claims, and the tooling.  As the root's `AGENTS.md` and WWOD
(`agents/wwod/WWOD.md`), plus:

## Layout

The pages live in SHARED root folders, the tooling here (epics `shared-content`, `claude-design` P4):
- the pages, plan docs and templates:  root folders of every checkout, each a folder link into the shared content
  repo, `../spell-app-dev` (the root's `AGENTS.md`, "Shared content"):  NOT tracked by spell-app.  Page paths below
  are from the checkout's root, and so are page URLs (`/guides/solid/solid-2.html`).
  - One copy for every checkout:  an edit shows in every worktree at once, and never conflicts on merge.
  - Committed by itself after every Claude turn (the `Stop` hook):  never `git add` / commit a page by hand.
  - NEVER run git inside a shared folder:  it's the shared repo there.  Tools run git in the spell-app checkout.
  - Before 2026-10-05 they were all `packages/docs/content/`:  old-path links stay there in the shared repo, for
    checkouts on older code, and the page server redirects the old URLs (`tools/relocate.js` `reorgShared()`).
- `tools/` -- the tooling:  the scripts (`tools/*.js`, see "Scripts"), `tools/_assets/` and the goals tooling
  (`tools/goals/`).  Tracked here, versioned per branch.  Run a script from `packages/docs`
  (`node tools/check-spell.js guides/x.html`) or through its `yarn` script;  a page argument is from the root, or
  from an area (`solid/solid-2.html` is a guide:  `tools/pages.js` `pageFile()`).

The shared folders (constants in `tools/pages.js`:  `PAGES`, `GUIDES`, `EPICS`, `TEMPLATES`;  `findPages()` walks them):
- `pages/index.html` -- the docs home, a routing page (P5 of `claude-design`):  one card per area, in the top bar's
  order (Epics · Guides · Brand · Spell UI · Templates · Goals · App), each with its count.  The cards between
  `<!-- areas:start -->` / `<!-- areas:end -->` are written by `spell dev docs index`;  edit only outside the markers.
  - NOT `index:start` / `index:end`:  an older checkout's `index.js` stops on the shared home instead of writing its
    three lists back into it
- `epics/index.html`, `guides/index.html`, `templates/index.html`, `brand/index.html` -- each area's LIST PAGE, its
  top-bar tab's home:  a card per page (epics open first), written by `spell dev docs index` between
  `<!-- index:start -->` / `<!-- index:end -->`;  a missing one is made from `tools/index.js` `skeleton()`.  The
  Templates page also holds the "Writing docs" notes, the Brand page its folder's files.
- `guides/` -- every other page:
  - `guides/changelog.html` -- what the repo shipped, newest first;  every `/isolate` and `/epic` adds to it (the
    root's `AGENTS.md`, "Changelog").
  - `guides/<topic>/<topic>.html` -- a doc, folder and file in lower-kebab-case, e.g. `guides/solid/solid-2.html`.
    - One-file docs with nothing beside them MAY sit at the top level:  `guides/<name>.html`.
    - `<topic>/experiments/` -- runnable scripts backing the doc's claims (see "Experiments").
    - `<topic>/<topic>.md` -- a distilled version for agents, when agents need the doc's rules (see "Agent rules").
  - `guides/spell-docs/` -- how the pages work (`spell-docs.md`) and the @spell-app/ui problems they hit
    (`spell-ui-findings.md`).
- `templates/` -- starting points, one per kind of doc (see "Templates").
- `epics/<name>/<name>.plan.html` -- plan docs, one per `/epic` session (see "Plan docs").  `<name>.html` before
  2026-10-04:  the tools find either (`tools/pages.js` `planDocIn()`), a worktree cut before keeps the old name
  until it merges `main`, and the page server redirects the old URL;  `tools/plan-rename.js` did the rename.
  - a SPLIT doc's bodies:  `epics/<name>/parts/<id>.html` (`.htm` before the switch, P12 of `epic-components`),
    loaded by the page when opened (see "Plan docs");  every page walker skips `parts/` folders (`findPages()`,
    `relocate.js`, `spell static`), so a part is never taken for a page
- `pages/details/<slug>.html` -- DETAILS PAGES:  a question Claude explains and Owen answers on the page
  (`/details`, see "Details pages").  Scratch:  ignored by the shared repo's git, swept after 14 days.  An epic's go
  in `epics/<name>/details/`, kept (auto-committed with the shared repo).  SYNTAX-CHOICES pages live there too (see
  "Syntax-choices pages").
- `brand/` -- the brand pages (the pony, from Claude Design;  the rest from P11 of `claude-design`) and the design
  system's push record.  Not in `findPages()`'s areas:  `docs update` doesn't check them (`tools/pages.js` `BRAND`).

In `tools/`:
- `_assets/` -- shared page assets (pages reach them as `<up>packages/docs/tools/_assets/`, `<up>` the way up to the
  checkout's root):
  - `spell-doc.css` -- page layout, and what UI doesn't cover;  reaches into widgets via UI tokens and `::part()`
  - `spell-doc-runtime.js` -- page behaviour (contents sidebar, sticky headers, scroll-follow, code colors);
    generic:  a plan doc's `<epic-*>` elements do their own (see "Plan docs")
  - `spell-ui.entry.js` -> `spell-ui.js` -- the ONE classic script a page loads:  Solid + @spell-app/ui + the runtime,
    GENERATED by `tools/bundle-spell-ui.js`.  NEVER edit `spell-ui.js`.
  - `spell-ui.design.entry.js` -- the same for Claude Design's `bundle.js` (`bundle-spell-ui.js --design`)
  - `emoji/<set>/<letter>.js` -- UI's emoji name chunks as classic scripts, loaded lazily by the bundle on first use
    of a name (both sets:  `cldr`, `fomantic`).  GENERATED with `spell-ui.js`;  never edit.
  - no `plan-doc.css` any more (deleted at P14 of epic `epic-components`, 2026-10-08):  plan docs style themselves
    through their `<epic-*>` elements
  - `details.css`, `details.js` -- details pages:  the option cards, Other, notes and Send `details.js` builds from
    the page's `.spell-option` markup, and the answer once sent
  - `syntax-choices.css`, `syntax-choices.js` -- syntax-choices pages:  draws their tables from `<slug>.rows.json`,
    saves what's typed, sends "Do it";  then loads `spell-ui.js` itself (loaded INSTEAD of the bundle, as
    `commands.js`)
  - `goals.css`, `goals-live.js` -- goals pages (the repo root's `goals/`, and `templates/goals/`):  their look, and
    their live buttons (thoughts, Claude sessions) when the page server serves them (goals' route module)
    - `goals.css` holds every rule the goals pages took from `plan-doc.css`, which they no longer link
  - `commands.js` -- command reference pages (`templates/commands.html`):  draws their tables from the page's JSON,
    then loads `spell-ui.js` itself (the page loads `commands.js` INSTEAD of the bundle)
- `*.js`, `*.ts` -- the scripts (see "Scripts");  `goals/` -- the goals tooling (the repo root's `goals/AGENTS.md`).

## Writing a page

- Start from a template:  `spell dev docs new durable|cheatsheet|commands <topic>/<topic>.html --title "Title"` copies
  it into `guides/` (and `commands`' JSON, as `<topic>.json`), fixes the `_assets` paths for the page's depth, and
  lists it in the index.
- Every page (templates too) starts its `<body>` with the site header, `<spell-site-header root="../..">`:  `root` is
  the path from the page's folder to the REPO root.  The template tools (`docs new`, `plan-doc new`, `goals new`)
  set it;  everything that sticks or lands starts below it (`spell-doc-runtime.js` `siteHeaderHeight()`, and its
  header's "Landing").  The element itself is `$/server/site`'s `SiteHeader`, bundled into `spell-ui.js`.
- NEVER inline copies of `_assets`:  improve the shared files instead, and every page gets it.
- Pages MUST still open straight from disk (`file://`):  no ES modules -- hence the one classic bundle.  But the
  openers (`docs open`, `plan-doc open`) show them from this checkout's PAGE SERVER (`spell dev server`, see
  `packages/server/AGENTS.md`):  live reload, edit mode, and the server-only properties (Spell UI, Editor).
  - The ONE exception:  a `commands` page fetches its JSON, so it draws its tables only from the page server;  from
    `file://` it says so where they'd go.  Its `<body data-spell-needs-server>` makes `check-spell.js` load it from
    the server.  Why:  Owen chose a plain JSON file over a JS data file or tables rendered into the HTML (epic
    `commands`, D4).
- Sections are `<ui-section>` elements (`spell-docs/spell-docs.md` "Page skeleton";  every piece of the markup:
  `spell-docs/ui-section-test.html`):
  - `<ui-section id="..." header="1. Summary" sticky collapsible dividing collapsed>`, EVERY one `sticky
    collapsible dividing collapsed` (a rule under every title, every section folds), nested for sub-sections
  - MUST start folded:  every section and sub-section `collapsed`, every code block and aside without `open`.
    The reader opens what they want (Owen, 2026-10-03:  "default to closed, open on demand").  The runtime
    remembers the reader's folds per page, and a link to an id unfolds what hides it.
  - its icon:  a `<ui-icon slot="icon" name="...">` first inside it;  a title with markup:  a
    `<span slot="header">` instead of `header`
  - a sticky page header above them, on EVERY page:  `<ui-sticky class="spell-h1"><header
    class="spell-page-head">` around the h1, so the title stays on screen (the templates have it)
  - the OLD markup -- `section.s2|s3` > `<ui-sticky class="spell-h2|spell-h3">` > `<h2|h3 id>` -- is for the goals
    pages only;  the runtime still drives it.  `node tools/to-ui-section.js <page>` converts a page.  A plan doc
    goes to `<epic-*>` markup instead:  `spell dev plan-doc convert <name>` (see "Plan docs")
- The runtime builds the page from that markup:
  - contents sidebar:  sticky right column, expandable per section, follows the scroll;  a drawer on narrow screens.
    Built at load from `main`'s sections and the h3 / h4s in them -- NEVER hand-write a contents list, or a
    "Contents" button.
  - the rail:  a strip of the top-level sections' icons at the right edge, the contents button (bars) on top, shown
    while the contents column isn't (narrow screens, or hidden by its button:  remembered for every page).  Give
    every top-level section an icon:  without one, the rail shows its number.  Hover widens it to show the names;
    the current section is the accent;  at 480px and under, only the bars button shows
  - sticky titles:  each top-level section's title sticks below the page header, nested ones stack below their
    parents' (the runtime sets the top-level `offset`s)
  - folding:  folds are remembered per page;  a link's unfold isn't.  A plan doc (`body.plan-doc`) starts EVERY
    section folded that the reader hasn't opened or closed:  Owen opens what he wants (2026-10-03).  Its `<epic-*>`
    blocks start folded by themselves;  the runtime reopens the ones the reader left open, before they first draw
    (`restoreEpicFolds()`), and saves their toggles as a section's
  - counts:  a top-level section holding `[data-status]` items (the Epics index's epic cards, the goals pages'
    items) shows `open/all` on its title (its `badge`;  open:  any status but `done`, `decided` or `canceled`), and
    in the contents and the rail a RED pill counting only the items that need Owen (state `attention`), none when
    none do (`countItems()`);  nested sections get no count of their own.  A plan doc's blocks count their own
    items:  the runtime only reads the count, and its `attention` (else the items' `state="attention"`;  see "a
    plan doc" below)
  - item states (`markItemStates()`, every page):  the Epics index's epic cards and the goals pages' items
    (`.plan-items`) get their colour from `data-state`, in the colour scheme (`templates/epics/plan-doc.md`,
    "Colours";  `spell-doc.css`'s `--spell-state-*`):  red needs Owen, blue Claude is working on it, yellow open
    (dark ink), green recent, grey older.  Without one:  an open goals question red, anything else open yellow,
    done / decided grey.  The goals pages colour their id chips by it, NOT by kind:  the kind is only the id's
    letter
  - item filter (`wireItemFilters()`):  a top-level section with such items gets a round filter button left of its
    count, stepping through all and each state the section has (coloured as it);  a filtered list says "N hidden ·
    show all" under it;  remembered per page
  - a PLAN DOC (`<epic-page>` markup, the `epics` pack, `packages/epics`):  its elements draw themselves, in their
    shadow roots:  the page header (git, Send, Review Now), the review line, the sections, phases and items, their
    counts and state filters, commits, item folds, and every review control on the page's ONE review client
    (`packages/epics/src/review`, see "Review inbox").  How they look and behave:  `packages/epics/AGENTS.md`.
    - the runtime only lists its folding blocks (`<epic-overview>`, `<epic-section>`, `<epic-phase>`) in the
      contents and the rail, from each host's `contentsEntry` (label, icon, count), after waiting for them to draw
      (`EPIC_WAIT_MS`, 5s at most:  a pack that won't load doesn't hold up the page);  remembers their folds;  and
      lands links inside them (a link to an `<epic-item>` opens it)
    - running agents (epic `skillz` P3):  `<epic-page>` draws the "Agents running" panel above its first section
      while any agent of the epic runs, each with a note box that redirects it (`packages/epics/AGENTS.md`)
  - links to any id in `main` land below the stuck titles, unfolding what hides the target and opening its panel
  - the address follows the section being read (`#id`, replaced, not pushed), so a reload lands there
  - served by the page server, an edit to the page's file updates it IN PLACE (`wireLiveUpdate()`):  scroll,
    folds, open panels and typed text stay.  Anything the runtime adds inside `main` must carry
    `data-spell-added`, so the patch steps around it.  Pages with scripts of their own still reload (inert data
    blocks, `<script type="text/plain">`, don't count);  `<body>`'s attributes are patched too
    - a plan doc's `<epic-*>` elements are patched, never replaced, keeping their page state (`open` ...,
      `carryEpicState()`):  `packages/epics/demo/check-live-epics.mjs` checks it
  - bodies from files (`<ui-section source>`, `<ui-accordion source>`, a plan doc's `<epic-*>` blocks and items:
    a split plan doc's parts, `wireSourceBodies()`):  the patch leaves what a host loaded alone;  a changed body
    file (the live client's `spell-server:file`) re-fetches its open host in place;  each body that loads re-runs
    the outline, contents, counts, item filters and code colors;  a link to an id inside an unloaded body (its
    host's `data-part-ids`, an `<epic-*>` host's `part-ids`) loads it first
  - code colors (highlight.js from cdnjs)
- Headings:
  - one `h1`;  a numbered top-level `<ui-section>` per major section (`header="2. Read-after-write"`), each with a
    stable `id` -- other docs link to them, so NEVER change an existing `id`
  - a nested `<ui-section>` for EVERY distinct sub-item, `h4` for sub-sub-items:  a list item with a bold title and
    several lines of body becomes a section, and long lists of such items are grouped under themed sections
  - titles are short labels (they're the contents entries);  the claim goes in the body
- Text:  SEE:  WWOD §6 › "Writing for people".
- Widgets (see the templates for exact markup):
  - recommendations / warnings:  `<ui-message state="positive|negative|warning|info" header="...">`
  - comparisons:  `<ui-table celled compact striped unstackable>` around a native `<table>`;  number cells
    `class="num right aligned"`, verdict cells `yes positive` / `no negative` / `meh warning`
  - small badges:  `<ui-label size="mini">`;  a legend of them:  `<ui-labels class="spell-legend" size="mini">`
  - page top:  `<ui-breadcrumb class="spell-crumbs">` back to the index;  meta lines (who it's for, status, how
    checked):  `<ui-list class="spell-meta">` of `<ui-item icon="...">`
  - headline numbers:  `<ui-statistics class="spell-stats" size="mini">` of `<ui-statistic value label>`, 2-4, each
    also stated with its caveat in the body
  - ordered flows:  `<ui-steps class="spell-steps" ordered>` of `<ui-step header description>`
  - parts side by side:  `<ui-cards class="spell-flow" stackable>` of `<ui-card><ui-content><ui-header>` +
    `<ui-description>`
  - for / against:  `<ui-grid class="spell-pros-cons" columns="2" stackable>` of `<ui-column><ui-segment>` with a
    top-`attached` `<ui-label>`
  - variants of one snippet (before / after, TS / JS):  `<ui-tabs class="spell-tabs" pointing secondary basic>` of
    `<ui-tab label>`, each holding its code block
  - a coined term:  `<dfn class="spell-term" tabindex="0">` followed by `<ui-popup header content>`
  - history of the decision:  `<ui-feed class="spell-history">` of `<ui-event icon>` + `<ui-summary>` + `<ui-date>`
  - sources:  `<ui-items class="spell-sources" divided>` of `<ui-item><ui-content>` with `<ui-header>`, `<ui-meta>`,
    `<ui-description>`
  - footer:  `<footer class="spell-doc-footer"><ui-divider>` + a `.meta` "last checked" line
  - asides / digressions:  `<ui-accordion class="spell-aside" styled>` with ONE `<ui-title>` / `<ui-content>` pair,
    collapsed (no `open`)
  - buttons:  ALWAYS the pill style with an icon that says what they do:
    `<ui-button circular icon="paper plane">Send</ui-button>`
    - icon-only buttons are circles (`circular`, no text):  they MUST have an `aria-label`, and a tooltip -- a
      `<ui-popup inverted size="mini" content="What it does">` right after the button (a popup targets its previous
      sibling).  The contents sidebar's expand / collapse / code buttons are the model (`spell-doc-runtime.js`
      `tool()`).
    - `basic` for quiet tools (sidebars, toolbars);  `primary` for the one main action in a dialog
  - an icon a page uses must be in `ICONS` in `tools/bundle-spell-ui.js` (then `spell dev docs update`):  any other
    name draws nothing
- Code:
  - ALWAYS folded and colored:  `<ui-accordion class="spell-code" styled>` + `<ui-title>What it is · N lines</ui-title>`
    + `<ui-content><pre><code class="language-ts">`.  Never `open`, however short:  see "Sections" above.
  - TypeScript by default, formatted by oxfmt:  write the snippet to a `.ts` / `.tsx` file and run
    `yarn vp fmt <file>`
  - valid code only:  no bare JSX statements after other statements -- assign them to a `const`
  - prefer excerpts pasted from a real, runnable file over hand-typed examples
- Colours:  WWOD §18 › "Colours and themes through `ui`'s tokens", plus `spell-doc.css`'s own.
  - ONE meaning per colour on every doc page (Q20 of epic `epic-components`, Owen 2026-10-08):  red needs Owen,
    yellow open (dark ink), blue do it now / Claude is working on it (every Send), green decided or done, orange
    ONLY changed-since-you-looked and warnings, violet Claude's voice, ivory Owen's, grey older.  And the fill:
    grey outline available, dashed pressed but not sent, outline sent, solid done.  The table, with examples:
    `templates/epics/plan-doc.md`, "Colours";  item states in CSS:  `spell-doc.css`'s `--spell-state-*`

## Templates

- `templates/durable.html` -- design notes, research, references:  prose sections, tables, code, callouts.
- `templates/commands.html` + `commands.json` -- a command reference:  operations by family, which CLI / skill /
  yarn command does each, in tables `_assets/commands.js` draws from the JSON (its header has the JSON's shape);
  hand-written prose around them.  E.g. `dev/commands/commands.html`.
- `templates/cheatsheet.html` -- an API reference:  a grid of cards, filtered by text and by badge
  (`ui-select[data-spell-filter-badge]`);  a card may carry `<ui-meta>` (since when) and `<ui-extra>` (a docs link).
- Plan docs have no template here (the old `templates/epics/plan.html` retired at the switch, P12 of
  `epic-components`):  `spell dev plan-doc new <name>` copies the tool's own, in `<epic-*>` markup
  (`packages/epics/src/tool/templates/plan.html`).  How to write one:  `templates/epics/plan-doc.md`.
- `templates/details.html` -- a details page.  NEVER copy by hand:  `spell dev details new <slug>`.
- `templates/syntax-choices.html` (+ `syntax-choices.rows.json`, a small working example) -- a syntax-choices page.
  NEVER copy by hand:  `spell dev choices new <slug> --rows <rows.json>`.
- `templates/review.html` -- "Review":  a details page reviewing a finished run's calls, one question each (keep,
  change, talk over), then "Where first?";  saved from `ui-docs-rework`'s morning review as the model.
- `templates/goals/` -- goals pages, laid out as a goals folder is, so their links work in place:
  `index.html` (the home page:  every goal set), `set/index.html` (a set's contents page), `set/topic/topic.html`
  and `topic.md` (a topic's page and its agent notes).  NEVER copy by hand:  `spell dev goals new-set` / `new`
  fill the `{{placeholders}}` and fix the asset paths.  Rules:  the repo root's `goals/AGENTS.md`.
- `templates/spell-ui-docs.html` -- a Spell UI docs page (the shared `ui/`):  Fomantic's docs layout in `<ui-*>`
  widgets (nav, masthead, Examples / Usage / API / Theming tabs, an "On this page" rail), loading the UI site's
  bundle, NOT `spell-ui.js`.  NEVER copy by hand:  `yarn site:new <tag|page>` in `packages/ui`;  how to write one:
  `epics/spell-ui-pages/PAGES.md`;  checked by `yarn site:check` there (`docs update` skips it).
- Every template but the goals pages and `spell-ui-docs.html` is `<ui-section>` markup (see "Writing a page");  the goals pages keep the old
  `section.s2` markup until they migrate (`agents/CODE-DEBT.md`).
- A new KIND of doc gets a template here;  `spell dev docs index` gives it a card on the Templates page.

## Plan docs

- `/epic <name>` (`.claude/skills/epic/`) runs a planning session against `epics/<name>/<name>.plan.html`.
- A plan doc is `<epic-*>` markup, drawn by the `epics` component pack (epic `epic-components`).  Its code lives
  in `packages/epics`, NOT here:
  - the elements, the review client and the plan-doc tool (`packages/epics/src/tool`, which `spell dev plan-doc`
    runs):  `packages/epics/AGENTS.md`
  - what the tool writes, and the rules for a doc's DATA in that markup (ids, phases, items, log, parts):
    `packages/epics/src/tool/PLAN-DOC.md`
  - how to write one (rules, ids, prose, explaining a question, the review loop):  `templates/epics/plan-doc.md`
  - every shared doc is in `<epic-*>` markup since the switch (P12 of `epic-components`, 2026-10-08);  a doc
    still in the OLD `ui-*` markup is read, never edited ("convert it first":  `spell dev plan-doc convert <name>`)
- Edit through `spell dev plan-doc <command>` wherever a command exists (phase status, items, log):  it keeps ids,
  icons and UPDATE markers consistent.
- SPLIT docs (P3 of `claude-design`;  new docs start split):  a skeleton plus part files, `parts/<id>.html`
  (`PlanParts`, `$/epics/tool/PlanParts`;  `EpicParts`, `$/epics/tool/EpicParts`, splits and assembles an
  `<epic-*>` doc;  rules:  `PLAN-DOC.md`, "Parts").  The tool reads either shape whole and writes it back split,
  each file once, atomically, only when changed;  `split <name>` / `split --done` / `join <name>`.
  - a reader of the skeleton alone (the docs index, the main server's epic cards, `ReviewInbox.itemIds()`) sees
    every section, phase status and item line;  anything needing bodies reads the doc through the tool
    (`PlanDocFiles` `read()`)
  - a split doc needs the page server (`<body data-spell-needs-server>`):  bodies don't load from `file://`
- What stays HERE, in `packages/docs`:
  - `spell-doc-runtime.js`'s generic parts:  the contents and rail (which list a plan doc's blocks from their
    `contentsEntry`), folds, landing, live update, bodies from files;  and, for the Epics index and the goals
    pages, `countItems()`, item states and `wireItemFilters()` (see "Writing a page")
  - `tools/check-spell.js`, which knows the `<epic-*>` elements (see "Scripts")
  - the forwarders `tools/plan-doc.js` (also `yarn plan-doc`), `plan-parts.js`, `inbox.js`, `review-backfill.js`
    (see "Scripts"):  new code imports `$/epics/tool/...` instead

### Review inbox

- Owen marks a plan doc's items ON the page (approve, todo, Add Details, revisit, pick an option card);  the marks
  wait in its INBOX FILE, `epics/<name>/<name>.inbox.json` beside the doc, until a Claude session takes them.
  - absent until the first mark, deleted once empty;  git-ignored:  per-machine pending state, never the record
  - shape and methods:  `ReviewInbox` (`packages/epics/src/tool/ReviewInbox.ts`:  `setMark()`, `requestNow()`,
    `cancelNow()`, `markSent()`, `unsentMarks`, `sentMarks`, `takeNow()`, `takeWork()`, `setWorking()`,
    `setListening()`, `touchListening()`, `liveListener()`, `clearMarks()`, `finishMarks()`, `clearApplied()`,
    `setDraft()`, `reviewNow()`);  EVERY write through `ReviewInbox.update()` / `updateAsync()`:  under the
    file's lock (`SRV.FileLock`), atomic
  - `drafts`:  a note box's text as Owen types it, kept until the mark that uses it;  never sent, counted, or work
    for a waiting session
  - `canceled`:  requests Owen called off ("nevermind", `cancelNow()`):  `wait` hands them over once (stop that
    item's agent), `plan-doc details` refuses a write for one, `inbox done | clear` or a new request ends it
  - one mark per item;  a question's pick with a remark is ONE revisit mark carrying `pick`
    (`{ action: "revisit", when, note, pick }`):  talked over, never applied by itself
  - `listening.seen`:  the session's heartbeat (`LISTEN_HEARTBEAT_MS`, 30s, from `wait`);  older than
    `LISTEN_STALE_MS` (90s), the session is gone (`liveListener()` `null`)
- The page reads and writes through ONE `ReviewClient` (`packages/epics/src/review`), on the page server's route
  module `packages/epics/src/tool/reviewRoutes.ts` (listed in the root `package.json`'s `pageServer.routes`),
  `/api/review/...`:  `GET inbox?page=`, `POST mark { page, id, mark | null }`, `POST draft { page, id, action,
  note }` (a note box's text as typed), `POST now { page, id, action, note? }` (Add Details, revisit now, which
  keeps the item's pick:  queued on `now`), `POST cancel { page, id }` ("nevermind"), `POST send { page, now? }`
  (`now: true`:  Review Now, every revisit waiting asked now too, `reviewNow()`).
  - a page whose token is stale (its server restarted) takes the new one from the page as served now and retries
    once (`ReviewClient`):  nothing typed is refused for a restart
  - `page`:  the doc's URL path (`/worktrees/<w>/...` too);  only `<name>.plan.html` (else 403), only ids of its
    items (else 400);  each answer is the whole inbox, but `listening` `null` once stale (`ReviewInbox.forPage()`);
    writes need the server's token and origin (`SRV.Guard`)
- Unsent:  marks newer than `sent` (the last "send to Claude"), never an immediate one (`details`, revisit `now`).
- `spell dev plan-doc inbox <name> [--json]` prints it:  marks by action with their items' titles, sent or not, the
  `now` queue, agents at work, the session listening.
- Claude's side, `spell dev plan-doc inbox <name> ...` (the loop, step by step:  `templates/epics/plan-doc.md`, "Review
  inbox"):
  - `listen` / `unlisten`:  a session waits on it, or stopped
  - `wait`:  run in the background;  exits 0 with work (requests for now, taken;  a send not yet handed over,
    `handedOver`), which wakes the session;  2 on timeout;  stamps the heartbeat while it waits
  - `apply [ids]`:  the sent approve / pick / todo marks, into the doc (`PlanDoc.applyMark()`), then cleared;  a
    revisit with a pick is left, "to talk over"
  - `working <id> on|off`, `done <id>...` (keeps a mark Owen changed meanwhile), `clear <id>...`;  these and
    `apply` stamp the heartbeat too
  - an agent writes into ONE item with `spell dev plan-doc details <name> <id> --file <html> [--append]`:  under the
    doc's lock, so it never races the session's other edits

## Details pages

- `/details` (`.claude/skills/details/`):  how and when Claude writes one.
- `spell dev details new | show [--wait] | wait | answer | list | sweep` (`tools/details.js`);  `show` opens a page in the side bar's "Review" tab (epic `windows-and-review` P6).
- Owen's answer:  the page posts it to the page server's route module `tools/detailsRoutes.ts`, which writes
  `<slug>.answer.json` beside the page;  `spell dev details wait`, run in the background, exits with it and so wakes the
  session.
- `findPages()` skips every `details/` folder:  not in the index, not checked by `docs update`.
- Colours (the scheme:  "Colours" above):  recommended:  a violet thumbs-up after an option's title, no word;  the chosen card
  green;  Send blue, by the fill rule (grey outline:  nothing to send;  dashed:  changes not sent;  outline:  sent);
  each question's rail badge red (nothing yet), green (picked) or blue (Claude has more to do:  more details asked,
  or only Other written);  the status label red (waiting for your answer), blue (changes not sent), green
  (answered).

## Syntax-choices pages

- A table of names (or any syntax) Claude recommends, one row per use site:  File (opens VS Code at the line) |
  Purpose | Current | Recommended (a box, pre-filled);  Owen types over the ones he'd write differently, then "Do
  it".  For a call made name by name, after a rule is picked (P13's boolean names).  How-to:
  `guides/syntax-choices.html`.
- `spell dev choices new <slug> --rows <rows.json> | show [--wait] | wait | answer | list` (`tools/choices.js`;  the
  rows' shape in its comment).  Pages go where details pages do;  `<slug>.rows.json` beside the page holds the rows.
- The page server's route module `tools/choicesRoutes.ts`:  the draft (`<slug>.draft.json`, saved 5s after typing
  stops, never wakes anyone) and the answer (`<slug>.answer.json`, which `spell dev choices wait` exits with).

## Experiments

- Claims backed by measurement:  scripts in `<topic>/experiments/` (`solid/experiments/`, `precedence/experiments/`),
  each with a header comment saying how it was run.
- They live in the shared repo, so they DON'T run in place any more:  Node runs them from their real path in
  `../spell-app-dev`, where there's no `node_modules` and no `$/` aliases.  To re-measure, copy one into the repo
  (under `packages/docs`, whose `tsconfig.json` extends `tsconfig.base.json`) and run it there.
- Tables quote medians of several runs, never a single run.  Keep the scripts:  they re-measure on upgrades.

## Links

- Every reference to a file, folder or external page is a link that opens a NEW TAB with its own named target per
  destination (re-clicks reuse that tab).
  - `yarn tsx tools/doc-links.js <page>` links `<code>path</code>` references and targets existing links
    (idempotent).  Paths resolve against the page's folder, its `experiments/`, the repo root, `packages/`, and
    `#name/...` aliases.
  - `yarn tsx tools/doc-links.js --check <page>` must pass:  every local link resolves, one target per
    destination, no nested links.
  - The rules themselves (how a path resolves, which target a link gets) live in `$/assembler` (`AS.Linker`):
    `doc-links.js` is its command line, and the plan-doc tool links through the same code.
  - Under `tsx`, never plain `node`:  it imports `$/assembler`.  The tools run it through `tools/pages.js`
    `docLinksRun()`.

## Finishing a page

In this order, from `packages/docs`:

1. `yarn tsx tools/doc-links.js <page>`
2. `yarn vp fmt <page>` (`yarn format` would reformat it anyway)
3. `yarn tsx tools/doc-links.js --check <page>`
4. `node tools/check-spell.js <page>` must pass -- and LOOK at its four screenshots:  the checks can't see
   overlap, clipping or bad wrapping
5. `spell dev docs index` when the page is new, renamed, or its `<title>` / description changed

## Scripts

- `spell dev docs update` (`tools/update.js`) -- rebuild the bundle from the LATEST UI, `docs index`, then
  `doc-links.js --check` and `check-spell.js` on every page.  `--skip-ui-build` reuses `../ui/dist`;  `--no-check` skips the browser.
- `tools/bundle-spell-ui.js` -- builds UI (fork + `yarn build`), bundles `_assets/spell-ui.js`.
  - `--design [--out <dir>]` (`yarn design:bundle`):  the claude.ai design system's `components/bundle.js` instead
    (epic `claude-design`, P8), from `_assets/spell-ui.design.entry.js`:  no page runtime, site header or saver;
    the engines and every Font Awesome Free icon inlined;  `<!--` / `</script` escaped;  fails over 6 MB.  Default
    out:  `packages/ui/build/design-system/project/components/`.
- `tools/check-design-bundle.js [bundle.js] [outDir]` (`yarn design:check`) -- Playwright:  the design bundle
  inlined into an `about:srcdoc` frame (icons, code colours, markdown, no errors), then a board under Claude
  Design's own runtime (`tools/vendor/claude-design/dc-runtime.js`, copied from claude.ai) whose `<ui-button
  onClick>` must count.  Run it after touching the design target.
- `tools/design.js` (`spell dev design pull | changed | pushed | state`) -- the local half of the `/design` skill:  a
  Claude Design board as a page, and the push record (`brand/design-system.json`, shared).
- `spell dev docs index` (`tools/index.js`) -- rewrites the docs home's area cards (`pages/index.html`) and each
  area's list page (`epics/`, `guides/`, `templates/`, `brand/` `index.html`).
- `spell dev docs new` (`tools/new-page.js`) -- a page from a template, at any depth.
- `spell dev docs open [page] [--vs | --review]` (`tools/open.js`) -- show a page (default:  the index) in Chrome,
  reusing its tab;  `--vs`:  in VS Code's doc preview, the right side bar's "Spell Docs" tab (`/spell-docs`);
  `--review`:  its "Review" tab (`/epic review`).  Each tab keeps its own page;  showing the page a tab already
  has doesn't reload it (the page updates itself).
- `spell dev details` (`tools/details.js`) -- details pages (see "Details pages");  `tools/detailsRoutes.ts`, the
  page server's route module for their answers.
- `spell dev choices` (`tools/choices.js`) -- syntax-choices pages (see "Syntax-choices pages");
  `tools/choicesRoutes.ts`, their drafts and answers.
- `tools/plan-doc.js`, `plan-parts.js`, `inbox.js`, `review-backfill.js` -- forwarders to the plan-doc tool in
  `packages/epics/src/tool/` (`PlanDoc`, `PlanParts`, `ReviewInbox`, `ReviewBackfill`), for old imports and callers
  on older code (see "Plan docs").  The review routes are `packages/epics/src/tool/reviewRoutes.ts`.
- `spell dev agents add | set | done | list | wait | told` (`tools/agents.ts`, over `tools/AgentList.ts`) -- the
  running-agents list (epic `skillz`):  every background agent a Claude session started, by name, while it runs.
  - the file:  `epics/<epic>/agents.json` in an epic (git-ignored in the shared repo), else
    `<checkout root>/.spell-agents.json` (git-ignored);  `--epic <name>`, any verb, picks the epic
  - names get a prefix:  the epic's, else the worktree's, else `main` (`add aaa` in epic `skillz` is `skillz-aaa`)
  - an entry leaves when its agent finishes (`done`);  empty, the file goes
  - every write under the file's lock (`SRV.FileLock`) and atomic, as the review inbox's
  - REDIRECTS (P3):  a plan doc's "Agents running" panel (`<epic-page>`, `packages/epics`) shows an epic's list, a
    note box per agent;  Owen's note goes through `tools/agentRoutes.ts` (`GET /api/agents?page=`, `POST
    /api/agents/redirect { page, name, note }`, guarded as the review routes) into the entry's `redirects`, untold,
    until a session's background `wait` takes it, sends it to the agent and marks it `told`
  - the verbs and an example:  `tools/agents.ts`'s header
- `spell dev docs link <page> [--hash <id>] [--text "..."] [--review] [--show]` (`tools/link.ts`) -- the markdown links
  Claude gives for a page:  side bar (`--review`:  its "Review" tab), then `(_browser_)`, both through
  `tools/showRoutes.ts` (`GET /api/docs/show`).
- `spell dev docs fuss <paths...> | --branch [--json]` (`tools/fuss.ts`) -- the writing checker under `/fussbudget`
  (epic `skillz`, P7):  lists the misses of WWOD §6 a tool can find, by file and line.
  - kinds:  `phrase-split` (a line ending in a new phrase's first 1-4 words), `dense` (3+ sentences in one
    paragraph or bullet), `jargon` (a package's banned words, `Fuss.JARGON`)
  - reads comments and docstrings in code, and Markdown;  in `.html` pages only `dense` and `jargon`
  - exits 1 on any miss;  runs in the caller's folder, so its paths are from there
- `tools/pages.js` -- shared by the scripts:  the areas (`EPICS`, `GUIDES`, `PAGES`, `TEMPLATES`, `BRAND`, `GOALS`, `HOME`, `LIST_PAGES`), `findPages()`,
  `pageFile()` (a page argument to its file), `atDepth()` (a template at a page's depth),
  `parseArgs()` (a tool's command line:  `--key value` flags and positionals), `tidy()` (link targets + oxfmt), `serialize()`, `openInChrome()`, `openInVSCode()` (plan docs:  the doc preview
  through the spell extension's `DocPreview`;  `{ view: "review" }`:  the "Review" tab).
- `tools/check-spell.js <page> [outDir]` -- Playwright, from `file://` (from the page server when the page says
  `data-spell-needs-server`):  fails on console errors, an undefined or unrendered `ui-*` or `epic-*` element (a
  plan doc's, the `epics` pack), contents vs sections (a plan doc's:  its `<epic-*>` blocks), phone-width overflow,
  a squeezed content column, top-level titles that don't stick (a plan doc's largest item section opened first), a
  section that won't fold / unfold or forgets its fold on reload, a drawer that won't open, a plan doc's open
  `<epic-item>` whose line won't stick under its section's title (Q6, desktop and phone);  writes screenshots.
- The plan-doc checks moved to `packages/epics/demo/` with the review runtime (each Playwright, on a COPY of a doc,
  never a shared one;  header comments have the details):
  - `node packages/epics/demo/check-review-epics.mjs [--stub] [--doc <name>] [outDir]` (from the root) -- clicks
    through every review flow on `<epic-*>` controls (Approve, Make Todo, Revisit and its note box, drafts across a
    reload, Later, Do Now, nevermind, Add Details Now, Send, Review Now) and reads each back from the inbox;  no
    control past the window or over a title at 280 / 900px, light and dark.  Refuses while the copy's inbox file
    exists.  Run it after touching the review controls or `ReviewClient`.
  - `node demo/check-live-epics.mjs [epic] [--item <id>] [--bundle <spell-ui.js>]` (from `packages/epics`) -- three
    live edits (an attribute, a part, a child) must patch the `<epic-*>` elements in place, keeping the open item,
    a half-typed note and its focus, and the scroll.  Run it after touching `liveClient.ts` or the runtime's "Live
    update".
  - `node packages/epics/demo/check-header-epics.mjs [--doc <name>]... [outDir]` (from the root) -- the page
    header, the review line, every section's `open/all` badge, the state filter and the Plan changes box, at 280 /
    900px, light and dark
- `tools/to-ui-section.js <page>...` -- converts old `section.s2|s3` pages to `<ui-section>` (ids kept).
  Idempotent;  refuses goals pages.
- `tools/doc-links.js` -- see "Links".  Text and regexes, not a DOM:  it edits only what it links.  Its page
  arguments are from where it runs:  from `packages/docs`, `../../guides/x.html`.  The linking itself is
  `$/assembler`'s `Linker`;  `PlanParts.formatHTML()` is `$/assembler`'s `formatHTML()` too.
- `tools/relocate.js` -- the docs' two moves (into `packages/docs/content/`, 2026-10-04;  out into the root folders,
  2026-10-05) and their repairs:  `spell dev shared repair` runs them, `spell dev shared commit` the reorg's
  (`reorgShared()`:  pages older code wrote at old paths move on, old-style links are fixed).
- A @spell-app/ui problem:  fix it in `packages/ui` when it's a real `ui` bug (the same change may touch both), else work
  around it here;  either way, add it to `spell-docs/spell-ui-findings.md`.

## Agent rules

- When agents need a doc's rules, also write a distilled `.md` beside it (bullets, `ts` code blocks), and point to it
  from the top of an `AGENTS.md` with an "if working with X, READ file" line -- the package's, or the root's when
  other packages need it too.  See `solid/solid-2.md`, pointed to from the root's.
- A doc's rules are about ITS topic (Solid's mechanics, a tool's flags).  House style -- how we write any code --
  goes in WWOD (`agents/wwod/`), not in a distilled doc.
