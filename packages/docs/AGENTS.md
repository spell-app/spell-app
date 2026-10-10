# packages/docs (`@spell-app/docs`)

Docs for every package, and their tooling:
- hand-authored `.html` pages, rendered with `@spell-app/ui`
- their templates
- the plan docs `/epic` keeps
- the experiments behind the claims
- the tooling

As the root's `AGENTS.md` and [WWOD](../../agents/wwod/WWOD.md), plus:

## Layout

The pages live in SHARED root folders;  the tooling lives here (epics `shared-content`, `claude-design` P4).
- The pages, plan docs and templates are root folders of every checkout.
  - Each is a folder link into the shared content repo, `../spell-app-dev`
    (the root's `AGENTS.md`, "Shared content").
  - They're NOT tracked by spell-app.
  - Page paths below are from the checkout's root, and so are page URLs (`/guides/solid/solid-2.html`).
  - One copy for every checkout:  an edit shows in every worktree at once, and never conflicts on merge.
  - Committed by itself after every Claude turn (the `Stop` hook):  never `git add` / commit a page by hand.
  - NEVER run git inside a shared folder:  it's the shared repo there.
    Tools run git in the spell-app checkout.
  - Before 2026-10-05 they were all in this package's `content/` folder.
    - Old-path links stay there in the shared repo, for checkouts on older code.
    - The page server redirects the old URLs ([`reorgShared()`](tools/relocate.js)).
- `tools/`:  the tooling, tracked here and versioned per branch.
  - the scripts (see "Scripts")
  - `_assets/`
  - the goals tooling, `goals/`
  - Run a script from `packages/docs`, or through its `yarn` script:

    ```sh
    node tools/check-spell.js guides/x.html
    ```

  - A page argument is from the root, or from an area:
    `solid/solid-2.html` is a guide ([`pageFile()`](tools/pages.js)).

The shared folders:
- [pages.js](tools/pages.js) has a constant for each (`PAGES`, `GUIDES`, `EPICS`, `TEMPLATES`), and `findPages()` walks them.
- [The docs home](../../pages/index.html):  a routing page (P5 of `claude-design`).
  - One card per area, in the top bar's order, each with its count:
    Epics · Guides · Brand · Spell UI · Templates · Goals · App
  - `spell dev docs index` writes the cards, between `<!-- areas:start -->` / `<!-- areas:end -->`.
    Edit only outside the markers.
  - NOT `index:start` / `index:end`:  on those, an older checkout's `index.js` would stop on the shared home,
    instead of writing its three lists back into it.
- Each area's LIST PAGE, its top-bar tab's home:  `index.html` in `epics/`, `guides/`, `templates/` and `brand/`.
  - A card per page (epics open first).
  - `spell dev docs index` writes them, between `<!-- index:start -->` / `<!-- index:end -->`.
  - A missing one is made from [`skeleton()`](tools/index.js).
  - The Epics page (epic `airplane` P8, Owen 2026-10-10) sorts its cards into five GROUPS.
    - Each group is a small heading with its count;  cards are alphabetical by title within each.
    - An empty group is hidden.
    - `$/server/site/EpicCards` draws them, for both the docs index and the page server's `RunningEpics`.
    - The groups:
      - Favorites:  starred, whatever their state.  A starred epic shows only here.
      - Active:  phases left.  In progress, and paused (its mark grey).
      - Planning:  future, or no phases yet
      - Urgent:  every phase done, items waiting on Owen (the `errors` state)
      - Done
    - Each card's STAR, top right:
      - A click stars or unstars it at once:  the runtime's `wireFavorites()` moves the card.
      - Then `POST /api/epics/favorite` ([epicRoutes.ts](../epics/src/tool/epicRoutes.ts)) writes the ONE shared file,
        `favorites.json` in `epics/`:  a JSON list of names.
      - The page server regroups by it as it serves the page.
      - From `file://` the stars show, disabled.
    - The day it was last worked on, bottom right, no year (`10/9`).
      - Its `title` is the full date and time.
      - It's the latest of:
        - the plan doc's `updated`
        - its last log line (the `log.html` part)
        - its branch's last commit (one `git for-each-ref`)
      - A running epic's card keeps the docs index's date when it's later than its doc's.
    - The docs home's Epics count is by the same groups:  `2 favorites · 5 active · 2 planning · 17 urgent · 7 done`.
  - The Templates page also holds the "Writing docs" notes;  the Brand page, its folder's files.
- `guides/`:  every other page.
  - [The changelog](../../guides/changelog.html):  what the repo shipped, newest first.
    - Every `/isolate` and `/epic` adds to it (the root's `AGENTS.md`, "Changelog").
  - `guides/<topic>/<topic>.html`:  a doc, folder and file in lower-kebab-case, e.g. `solid/solid-2.html`.
    - One-file docs with nothing beside them MAY sit at the top level:  `guides/<name>.html`.
    - `<topic>/experiments/`:  runnable scripts backing the doc's claims (see "Experiments").
    - `<topic>/<topic>.md`:  a distilled version for agents, when agents need the doc's rules (see "Agent rules").
  - `spell-docs/`:  how the pages work, and the @spell-app/ui problems they hit.
    - [spell-docs.md](../../guides/spell-docs/spell-docs.md):  how the pages work
    - [spell-ui-findings.md](../../guides/spell-docs/spell-ui-findings.md):  the problems
- `templates/`:  starting points, one per kind of doc (see "Templates").
- `epics/<name>/<name>.plan.html`:  plan docs, one per `/epic` session (see "Plan docs").
  - `<name>.html` before 2026-10-04.
    - The tools find either ([`planDocIn()`](tools/pages.js)).
    - A worktree cut before keeps the old name until it merges `main`.
    - The page server redirects the old URL.
    - [plan-rename.js](tools/plan-rename.js) did the rename.
  - A SPLIT doc's bodies are part files, `parts/<id>.html` in its folder, which the page loads when opened
    (see "Plan docs").
    - `.htm` before Q12 of `epic-components`:  read no more.
    - Every page walker skips `parts/` folders (`findPages()`, `relocate.js`, `spell static`),
      so a part is never taken for a page.
- `pages/details/<slug>.html`:  DETAILS PAGES.
  - A question Claude explains, and Owen answers on the page (`/details`, see "Details pages").
  - Scratch:  ignored by the shared repo's git, swept after 14 days.
  - An epic's go in its folder's `details/`, kept (auto-committed with the shared repo).
  - SYNTAX-CHOICES pages live there too (see "Syntax-choices pages").
- `brand/`:  the brand pages, and the design system's push record.
  - the pony, from Claude Design;  the rest from P11 of `claude-design`
  - Not in `findPages()`'s areas:  `docs update` doesn't check them (`BRAND`, in [pages.js](tools/pages.js)).

In `tools/`:
- `_assets/`:  shared page assets.
  - Pages reach them as `<up>packages/docs/tools/_assets/`, `<up>` being the way up to the checkout's root.
  - `spell-doc.css`:  page layout, and what UI doesn't cover.
    It reaches into widgets via UI tokens and `::part()`.
  - `spell-doc-runtime.js`:  page behaviour.
    - the toolbar, sticky headers, scroll-follow, code colors, comments
    - generic:  a plan doc's `<epic-*>` elements do their own (see "Plan docs")
  - `spell-ui.entry.js` -> `spell-ui.js`:  the ONE classic script a page loads.
    - Solid + @spell-app/ui + the runtime
    - GENERATED by [bundle-spell-ui.js](tools/bundle-spell-ui.js).  NEVER edit `spell-ui.js`.
  - `spell-ui.design.entry.js`:  the same, for Claude Design's `bundle.js` (`bundle-spell-ui.js --design`).
  - `emoji/<set>/<letter>.js`:  UI's emoji name chunks, as classic scripts.
    - The bundle loads one lazily, on first use of a name.
    - both sets:  `cldr`, `fomantic`
    - GENERATED with `spell-ui.js`:  never edit.
  - No `plan-doc.css` any more (deleted at P14 of epic `epic-components`, 2026-10-08).
    Plan docs style themselves through their `<epic-*>` elements.
  - `details.css`, `details.js`:  details pages.
    - `details.js` builds the option cards, Other, notes and Send from the page's `.spell-option` markup.
    - It also shows the answer once sent.
  - `syntax-choices.css`, `syntax-choices.js`:  syntax-choices pages.
    - It draws their tables from `<slug>.rows.json`, saves what's typed, and sends "Do it".
    - Then it loads `spell-ui.js` itself:  it's loaded INSTEAD of the bundle, as `commands.js` is.
  - `goals.css`, `goals-live.js`:  goals pages (the repo root's `goals/`, and `templates/goals/`).
    - their look, and their live buttons (thoughts, Claude sessions)
      when the page server serves them (goals' route module)
    - `goals.css` holds every rule the goals pages took from `plan-doc.css`, which they no longer link.
  - `commands.js`:  command reference pages ([the commands template](../../templates/commands.html)).
    - It draws their tables from the page's JSON, then loads `spell-ui.js` itself.
    - The page loads `commands.js` INSTEAD of the bundle.
- The scripts, `*.js` and `*.ts`:  see "Scripts".
- `goals/`:  the goals tooling ([goals' AGENTS.md](../../goals/AGENTS.md), at the repo root).

## Writing a page

- Start from a template:

  ```sh
  spell dev docs new durable|cheatsheet|commands <topic>/<topic>.html --title "Title"
  ```

  - It copies it into `guides/` (and for `commands`, its JSON as `<topic>.json`).
  - It fixes the `_assets` paths for the page's depth, and lists it in the index.
- Every page (templates too) starts its `<body>` with the site header, `<spell-site-header root="../..">`.
  - `root` is the path from the page's folder to the REPO root.
  - The template tools (`docs new`, `plan-doc new`, `goals new`) set it.
  - Everything that sticks or lands starts below it:
    `siteHeaderHeight()` in `spell-doc-runtime.js`, and its header's "Landing".
  - The element itself is `$/server/site`'s `SiteHeader`, bundled into `spell-ui.js`.
- NEVER inline copies of `_assets`:  improve the shared files instead, and every page gets it.
- Pages MUST still open straight from disk (`file://`):  no ES modules, hence the one classic bundle.
  - But the openers (`docs open`, `plan-doc open`) show them from this checkout's PAGE SERVER
    (`spell dev server`, see [server's AGENTS.md](../server/AGENTS.md)).
    - It adds live reload, edit mode, and the server-only properties (Spell UI, Editor).
  - The ONE exception:  a `commands` page fetches its JSON, so it draws its tables only from the page server.
    - From `file://` it says so, where they'd go.
    - Its `<body data-spell-needs-server>` makes `check-spell.js` load it from the server.
    - Why:  Owen chose a plain JSON file over a JS data file, or tables rendered into the HTML (epic `commands`, D4).
- Sections are `<ui-section>` elements.
  - The page skeleton:  [spell-docs.md](../../guides/spell-docs/spell-docs.md), "Page skeleton".
  - Every piece of the markup:  [the ui-section test page](../../guides/spell-docs/ui-section-test.html).
  - The markup, nested for sub-sections:

    ```html
    <ui-section id="..." header="1. Summary" sticky collapsible dividing collapsed>
    ```

    - EVERY one is `sticky collapsible dividing collapsed`:  a rule under every title, and every section folds.
  - They MUST start folded:  every section and sub-section `collapsed`, every code block and aside without `open`.
    - The reader opens what they want (Owen, 2026-10-03:  "default to closed, open on demand").
    - The runtime remembers the reader's folds per page, and a link to an id unfolds what hides it.
  - its icon:  a `<ui-icon slot="icon" name="...">`, first inside it
  - a title with markup:  a `<span slot="header">`, instead of `header`
  - A sticky page header above them, on EVERY page (the templates have it), so the title stays on screen:
    `<ui-sticky class="spell-h1"><header class="spell-page-head">` around the h1.
  - The OLD markup is for the goals pages only;  the runtime still drives it.
    - It's `section.s2|s3` > `<ui-sticky class="spell-h2|spell-h3">` > `<h2|h3 id>`.
    - `node tools/to-ui-section.js <page>` converts a page.
    - A plan doc goes to `<epic-*>` markup instead:  `spell dev plan-doc convert <name>` (see "Plan docs").
- The runtime builds the page from that markup:
  - NO contents list (Owen, 2026-10-08:  "remove the Contents thing entirely ... it is useless").
    - NEVER hand-write one, or a "Contents" button.
  - The TOOLBAR, the page's one navigation (`buildPageToolbar()`).
    - Epic `airplane` P8, Owen 2026-10-10:  "Make the floating sidebar in guides a sticky top toolbar like the plan doc".
      Before it, a floating right-edge rail.
    - A row of the top-level sections' buttons:  the last row of the sticky page header (`.spell-page-head`).
      So it sticks with it, and the titles stick below it.
    - An ivory band, edge to edge across the content column (out of `<main>`'s side padding), square.
      - A rule under it, and none above (Owen, 2026-10-10).
      - The same band as a plan doc's.
    - Each button:  the section's icon and its title.
      - the current one a deeper ivory (scroll-follow)
      - a red badge counting what needs Owen
    - Give every top-level section an icon:  without one, the button shows its number.
    - Titles that don't all fit end in `...`.
      - When each would get under 50px, they go:  icons only, the title as the button's tooltip (`fitTitles()`).
      - The row scrolls sideways if even that doesn't fit, never the page.
    - A page without a sticky page header:  the last row of its filter bar.
      Else a sticky bar of its own, before its first section (`.spell-toolbar-alone`:  the goals pages).
  - A PLAN DOC (`body.plan-doc`) has its own toolbar (`buildToolbar()`).
    - It's the last row of `<epic-page>`'s sticky toolbar bar (its `toolbar` slot).
    - It sticks right under the h1's row, once the epic's title between them has scrolled away.
    - One button per top-level block:  its icon ONLY, the title its tooltip (Owen, 2026-10-10:  "lose the titles").
      - the current one a deeper ivory
      - every button the same width, badges or not
    - Badges count the block's items waiting on Owen:
      - red:  urgent (`state="attention"`)
      - orange:  Claude replied with options for him to pick (`state="replied"`)
      - both kinds, both badges;  none, none
      - over the icon's top right, a third of a badge on the icon
    - At the row's right, `<epic-page>`'s own tools ([epics' AGENTS.md](../epics/AGENTS.md)):
      the page's state filter, collapse-all, the new item button.
    - Cmd / Ctrl + K asks which item to jump to (`J7`, `q3`, any id), and lands there as a link would.
      - An id that isn't there:  the dialog says so, and stays open (`wireJumpKey()`).
  - Sticky titles:  each top-level section's title sticks below the page header.
    - Nested ones stack below their parents'.
    - The runtime sets the top-level `offset`s.
  - Folding:  folds are remembered per page;  a link's unfold isn't.
    - A plan doc (`body.plan-doc`) starts EVERY section folded that the reader hasn't opened or closed:
      Owen opens what he wants (2026-10-03).
    - Its `<epic-*>` blocks start folded by themselves.
      - The runtime reopens the ones the reader left open, before they first draw (`restoreEpicFolds()`).
      - It saves their toggles as a section's.
  - Counts, on a top-level section holding `[data-status]` items
    (the Epics index's epic cards, the goals pages' items):
    - `open/all` on its title, its `badge`
      - open:  any status but `done`, `decided` or `canceled`
    - on the toolbar, a RED badge counting only the items that need Owen (state `attention`):
      none when none do (`countItems()`)
    - Nested sections get no count of their own.
    - A plan doc's blocks count their own items:  the runtime only reads the count, and its `attention`
      (else the items' `state="attention"`;  see "a plan doc" below).
  - Item states (`markItemStates()`, every page):
    the Epics index's epic cards, and the goals pages' items (`.plan-items`), get their colour from `data-state`.
    - The colour scheme:  [the plan-doc guide](../../templates/epics/plan-doc.md), "Colours";
      in CSS, `spell-doc.css`'s `--spell-state-*`.
    - red needs Owen, blue Claude is working on it, yellow open (dark ink), green recent, grey older
    - without one:  an open goals question red, anything else open yellow, done / decided grey
    - The goals pages colour their id chips by it, NOT by kind:  the kind is only the id's letter.
  - Item filter (`wireItemFilters()`):  a top-level section with such items gets a chip per state it has.
    - Each chip shows how many, left of its count.
    - solid while that state shows, outlined while hidden
    - no filter icon (Owen, 2026-10-10)
    - A click (`nextShown()`, a plan doc's rule too):
      - everything showing:  only that state
      - else a hidden one shows too, and a shown one hides
      - the only one showing:  everything again
    - A filtered list says "N hidden · show all" under it.
      Remembered per page.
  - A PLAN DOC:  `<epic-page>` markup, drawn by the `epics` pack ([epics' AGENTS.md](../epics/AGENTS.md)).
    - Its elements draw themselves, in their shadow roots:
      - the page header (git), and its toolbar's tools
      - the review line, the send bar (Send, Review Now)
      - the sections, phases and items, their counts and state filters, commits, item folds
      - every review control on the page's ONE review client
        ([the review client](../epics/src/review/), see "Review inbox")
    - How they look and behave:  [epics' AGENTS.md](../epics/AGENTS.md).
    - The runtime only:
      - lists its folding blocks (`<epic-overview>`, `<epic-section>`, `<epic-phase>`) on the toolbar
        - from each host's `contentsEntry` (label, icon, count), after waiting for them to draw
        - `EPIC_WAIT_MS`, 5s at most:  a pack that won't load doesn't hold up the page
      - remembers their folds
      - lands links inside them (a link to an `<epic-item>` opens it)
    - Running agents (epic `skillz` P3):  `<epic-page>` draws the "Agents running" panel above its first section.
      - It shows while any agent of the epic runs.
      - Each agent has a note box that redirects it ([epics' AGENTS.md](../epics/AGENTS.md)).
  - Links to any id in `main` land below the stuck titles.
    They unfold what hides the target, and open its panel.
  - The address follows the section being read (`#id`, replaced, not pushed), so a reload lands there.
  - Served by the page server, an edit to the page's file updates it IN PLACE (`wireLiveUpdate()`).
    - Scroll, folds, open panels and typed text stay.
    - Anything the runtime adds inside `main` must carry `data-spell-added`, so the patch steps around it.
    - Pages with scripts of their own still reload.
      Inert data blocks (`<script type="text/plain">`) don't count.
    - `<body>`'s attributes are patched too.
    - A plan doc's `<epic-*>` elements are patched, never replaced, keeping their page state
      (`open` ..., `carryEpicState()`).
      [check-live-epics.mjs](../epics/demo/check-live-epics.mjs) checks it.
  - Bodies from files:
    - `<ui-section source>` and `<ui-accordion source>`
    - a plan doc's `<epic-*>` blocks and items:  a split plan doc's parts (`wireSourceBodies()`)
    - The patch leaves what a host loaded alone.
    - A changed body file (the live client's `spell-server:file`) re-fetches its open host in place.
    - Each body that loads re-runs the outline, the toolbar, counts, item filters and code colors.
    - A link to an id inside an unloaded body loads it first.
      The ids are in its host's `data-part-ids`, or an `<epic-*>` host's `part-ids`.
  - Code colors:  highlight.js (`highlight.min.js`, in `_assets/`), committed so pages load offline.
    - Older pages still name cdnjs:  the page server swaps that tag for the local copy (`localHighlight()`).
- Headings:
  - One `h1`.
  - A numbered top-level `<ui-section>` per major section (`header="2. Read-after-write"`), each with a stable `id`.
    - Other docs link to them, so NEVER change an existing `id`.
  - A nested `<ui-section>` for EVERY distinct sub-item, `h4` for sub-sub-items.
    - A list item with a bold title and several lines of body becomes a section.
    - Long lists of such items are grouped under themed sections.
  - Titles are short labels (they're the toolbar's labels and the address' ids):  the claim goes in the body.
- Text:  SEE:  WWOD §6 › "Writing for people".
- Widgets (see the templates for exact markup):
  - recommendations / warnings:  `<ui-message state="positive|negative|warning|info" header="...">`
  - comparisons:  `<ui-table celled compact striped unstackable>` around a native `<table>`
    - number cells:  `class="num right aligned"`
    - verdict cells:  `yes positive` / `no negative` / `meh warning`
  - small badges:  `<ui-label size="mini">`
    - a legend of them:  `<ui-labels class="spell-legend" size="mini">`
  - page top:  `<ui-breadcrumb class="spell-crumbs">`, back to the index
    - meta lines (who it's for, status, how checked):  `<ui-list class="spell-meta">` of `<ui-item icon="...">`
  - headline numbers:  `<ui-statistics class="spell-stats" size="mini">` of `<ui-statistic value label>`
    - 2-4 of them, each also stated with its caveat in the body
  - ordered flows:  `<ui-steps class="spell-steps" ordered>` of `<ui-step header description>`
  - parts side by side:
    `<ui-cards class="spell-flow" stackable>` of `<ui-card><ui-content><ui-header>` + `<ui-description>`
  - for / against:  `<ui-grid class="spell-pros-cons" columns="2" stackable>` of `<ui-column><ui-segment>`
    - with a top-`attached` `<ui-label>`
  - variants of one snippet (before / after, TS / JS):
    `<ui-tabs class="spell-tabs" pointing secondary basic>` of `<ui-tab label>`, each holding its code block
  - a coined term:  `<dfn class="spell-term" tabindex="0">`, followed by `<ui-popup header content>`
  - history of the decision:  `<ui-feed class="spell-history">` of `<ui-event icon>` + `<ui-summary>` + `<ui-date>`
  - sources:  `<ui-items class="spell-sources" divided>` of `<ui-item><ui-content>`
    - with `<ui-header>`, `<ui-meta>`, `<ui-description>`
  - footer:  `<footer class="spell-doc-footer"><ui-divider>` + a `.meta` "last checked" line
  - asides / digressions:  `<ui-accordion class="spell-aside" styled>`
    - with ONE `<ui-title>` / `<ui-content>` pair
    - collapsed (no `open`)
  - buttons:  ALWAYS the pill style, with an icon that says what they do:
    `<ui-button circular icon="paper plane">Send</ui-button>`
    - Icon-only buttons are circles (`circular`, no text).
      They MUST have an `aria-label`, and a tooltip.
  - TOOLTIPS are the browser's own:  a `title` attribute.
    - Never a `<ui-tooltip>`, nor a `<ui-popup>` used as one.
    - Owen's standing rule, 2026-10-10:  a styled one only when he asks for "a ui-tooltip with ...".
    - Older pages still have `<ui-popup inverted size="mini">` tooltips (`circle()`, in the goals pages' `goals-live.js`).
      Turn them into `title`s when touching that code.
    - `basic` for quiet tools (sidebars, toolbars);  `primary` for the one main action in a dialog.
  - An icon a page uses must be in `ICONS`, in [bundle-spell-ui.js](tools/bundle-spell-ui.js)
    (then `spell dev docs update`):  any other name draws nothing.
- Code:
  - ALWAYS folded and colored:

    ```html
    <ui-accordion class="spell-code" styled>
      <ui-title>What it is · N lines</ui-title>
      <ui-content><pre><code class="language-ts">
    ```

    - Never `open`, however short:  see "Sections" above.
  - TypeScript by default, formatted by oxfmt:
    write the snippet to a `.ts` / `.tsx` file, and run `yarn vp fmt <file>`.
  - Valid code only:  no bare JSX statements after other statements.
    Assign them to a `const`.
  - Prefer excerpts pasted from a real, runnable file over hand-typed examples.
- Colours:  WWOD §18 › "Colours and themes through `ui`'s tokens", plus `spell-doc.css`'s own.
  - ONE meaning per colour on every doc page (Q20 of epic `epic-components`, Owen 2026-10-08):
    - red:  needs Owen
    - yellow:  open (dark ink)
    - blue:  do it now / Claude is working on it (every Send)
    - green:  decided or done
    - orange:  ONLY changed-since-you-looked, and warnings
    - violet:  Claude's voice
    - ivory:  Owen's
    - grey:  older
  - And the fill:  grey outline available, dashed pressed but not sent, outline sent, solid done.
  - The table, with examples:  [the plan-doc guide](../../templates/epics/plan-doc.md), "Colours".
  - Item states in CSS:  `spell-doc.css`'s `--spell-state-*`.

## Templates

- [durable.html](../../templates/durable.html):  design notes, research, references.
  - prose sections, tables, code, callouts
- [commands.html](../../templates/commands.html) + `commands.json`:  a command reference.
  - operations by family, and which CLI / skill / yarn command does each
  - in tables that `commands.js` (in `_assets/`) draws from the JSON;  its header has the JSON's shape
  - hand-written prose around them
  - e.g. [the commands page](../../guides/dev/commands/commands.html)
- [cheatsheet.html](../../templates/cheatsheet.html):  an API reference.
  - a grid of cards, filtered by text and by badge (`ui-select[data-spell-filter-badge]`)
  - a card may carry `<ui-meta>` (since when) and `<ui-extra>` (a docs link)
- Plan docs have no template here.
  - The old `plan.html`, in `templates/epics/`, retired at the switch (P12 of `epic-components`).
  - `spell dev plan-doc new <name>` copies the tool's own, in `<epic-*>` markup
    ([the tool's plan template](../epics/src/tool/templates/plan.html)).
  - How to write one:  [the plan-doc guide](../../templates/epics/plan-doc.md).
- [details.html](../../templates/details.html):  a details page.
  - NEVER copy by hand:  `spell dev details new <slug>`.
- [syntax-choices.html](../../templates/syntax-choices.html):  a syntax-choices page.
  - `syntax-choices.rows.json` beside it is a small working example.
  - NEVER copy by hand:  `spell dev choices new <slug> --rows <rows.json>`.
- [review.html](../../templates/review.html), "Review":  a details page reviewing a finished run's calls.
  - one question each (keep, change, talk over), then "Where first?"
  - saved from `ui-docs-rework`'s morning review, as the model
- `templates/goals/`:  goals pages, laid out as a goals folder is, so their links work in place.
  - `index.html`:  the home page, every goal set
  - `set/index.html`:  a set's contents page
  - `set/topic/topic.html` and `topic.md`:  a topic's page, and its agent notes
  - NEVER copy by hand:  `spell dev goals new-set` / `new` fill the `{{placeholders}}` and fix the asset paths.
  - The rules:  [goals' AGENTS.md](../../goals/AGENTS.md), at the repo root.
- [spell-ui-docs.html](../../templates/spell-ui-docs.html):  a Spell UI docs page, for the shared `ui/`.
  - Fomantic's docs layout in `<ui-*>` widgets:
    nav, masthead, Examples / Usage / API / Theming tabs, an "On this page" rail.
  - It loads the UI site's bundle, NOT `spell-ui.js`.
  - NEVER copy by hand:  `yarn site:new <tag|page>`, in `packages/ui`.
  - How to write one:  [PAGES.md](../../epics/spell-ui-pages/PAGES.md).
  - Checked by `yarn site:check` there (`docs update` skips it).
- Every template but the goals pages and `spell-ui-docs.html` is `<ui-section>` markup (see "Writing a page").
  - The goals pages keep the old `section.s2` markup until they migrate ([the code-debt log](../../agents/CODE-DEBT.md)).
- A new KIND of doc gets a template here.
  `spell dev docs index` gives it a card on the Templates page.

## Plan docs

- `/epic <name>` ([the epic skill](../../.claude/skills/epic/SKILL.md)) runs a planning session
  against `epics/<name>/<name>.plan.html`.
- A plan doc is `<epic-*>` markup, drawn by the `epics` component pack (epic `epic-components`).
  Its code lives in `packages/epics`, NOT here:
  - the elements, the review client, and the plan-doc tool ([the tool's folder](../epics/src/tool/),
    which `spell dev plan-doc` runs):  [epics' AGENTS.md](../epics/AGENTS.md)
  - what the tool writes, and the rules for a doc's DATA in that markup (ids, phases, items, log, parts):
    [PLAN-DOC.md](../epics/src/tool/PLAN-DOC.md)
  - how to write one (rules, ids, prose, explaining a question, the review loop):
    [the plan-doc guide](../../templates/epics/plan-doc.md)
  - Every shared doc is in `<epic-*>` markup since the switch (P12 of `epic-components`, 2026-10-08).
    - A doc still in the OLD `ui-*` markup is read, never edited.
    - "Convert it first":  `spell dev plan-doc convert <name>`.
- Edit through `spell dev plan-doc <command>` wherever a command exists (phase status, items, log).
  It keeps ids, icons and UPDATE markers consistent.
- SPLIT docs (P3 of `claude-design`;  new docs start split):  a skeleton, plus part files, `parts/<id>.html`.
  - The code:
    - `PlanParts`, `$/epics/tool/PlanParts`
    - `EpicParts`, `$/epics/tool/EpicParts`, splits and assembles an `<epic-*>` doc
    - the rules:  `PLAN-DOC.md`, "Parts"
  - The tool reads either shape whole, and writes it back split:  each file once, atomically, only when changed.
    - `split <name>` / `split --done` / `join <name>`
  - A reader of the skeleton alone sees every section, phase status and item line.
    - e.g. the docs index, the main server's epic cards, `ReviewInbox.itemIds()`
    - Anything needing bodies reads the doc through the tool (`PlanDocFiles` `read()`).
  - A split doc needs the page server (`<body data-spell-needs-server>`):  bodies don't load from `file://`.
- What stays HERE, in `packages/docs`:
  - `spell-doc-runtime.js`'s generic parts (see "Writing a page"):
    - the toolbar, which lists a plan doc's blocks from their `contentsEntry`
    - folds, landing, live update, bodies from files
    - for the Epics index and the goals pages:  `countItems()`, item states and `wireItemFilters()`
  - [check-spell.js](tools/check-spell.js), which knows the `<epic-*>` elements (see "Scripts")
  - the forwarders (see "Scripts"):  new code imports `$/epics/tool/...` instead
    - [plan-doc.js](tools/plan-doc.js), also `yarn plan-doc`
    - `plan-parts.js`, `inbox.js`, `review-backfill.js`

### Review inbox

- Owen marks a plan doc's items ON the page:  approve, todo, Add Details, revisit, pick an option card.
  - The marks wait in its INBOX FILE until a Claude session takes them.
    It's `<name>.inbox.json`, beside the doc in `epics/<name>/`.
  - Absent until the first mark;  deleted once empty.
  - Git-ignored:  per-machine pending state, never the record.
  - Its shape and methods:  [`ReviewInbox`](../epics/src/tool/ReviewInbox.ts).

    ```text
    setMark()  requestNow()  cancelNow()  markSent()  unsentMarks  sentMarks  takeNow()  takeWork()
    setWorking()  setListening()  touchListening()  liveListener()  clearMarks()  finishMarks()
    clearApplied()  setDraft()  reviewNow()
    ```

  - EVERY write goes through `ReviewInbox.update()` / `updateAsync()`:
    under the file's lock (`SRV.FileLock`), atomic.
  - `drafts`:  a note box's text as Owen types it, kept until the mark that uses it.
    - Never sent, counted, or work for a waiting session.
  - `canceled`:  requests Owen called off ("nevermind", `cancelNow()`).
    - `wait` hands them over once:  stop that item's agent.
    - `plan-doc details` refuses a write for one.
    - `inbox done | clear`, or a new request, ends it.
  - One mark per item (or phase, Overview sub-section, the summary:  `summary`).
    - A question's pick with a remark is ONE revisit mark carrying `pick`:
      `{ action: "revisit", when, note, pick }`.
    - It's talked over, never applied by itself.
  - A new todo or question asked for from the page (epic `airplane` P2):  a mark under its own key, `new1` ...
    - `setNew()`:  `{ action: "new", kind, title, note?, near? }`
    - `plan-doc inbox apply` makes the item.
  - `comments`:  Owen's comments on the doc's blocks, and on selected text (P11, see "Comments"):  `cm1` ...
    - Written through the comments route, never sent.
    - Waiting until answered (`plan-doc inbox done cm3`).
  - `listening.seen`:  the session's heartbeat (`LISTEN_HEARTBEAT_MS`, 30s, from `wait`).
    - Older than `LISTEN_STALE_MS` (90s), the session is gone:  `liveListener()` returns `null`.
- The page reads and writes through ONE `ReviewClient` ([the review client](../epics/src/review/)).
  - It's on the page server's route module, [reviewRoutes.ts](../epics/src/tool/reviewRoutes.ts), at `/api/review/...`.
  - The module is listed in the root `package.json`'s `pageServer.routes`.
  - The routes:
    - `GET inbox?page=`
    - `POST mark { page, id, mark | null }`
    - `POST draft { page, id, action, note }`:  a note box's text as typed
    - `POST now { page, id, action, note? }`:  Add Details, or revisit now, queued on `now`
      - revisit now keeps the item's pick
    - `POST cancel { page, id }`:  "nevermind"
    - `POST send { page, now? }`:  `now: true` is Review Now, every revisit waiting asked now too (`reviewNow()`)
    - `POST new { page, id?, entry | null }`:  a new item from the page;  no `id`:  the next free key
  - A page whose token is stale (its server restarted) takes the new one from the page as served now,
    and retries once (`ReviewClient`).
    So nothing typed is refused for a restart.
  - `page`:  the doc's URL path (`/worktrees/<w>/...` too).
    - only `<name>.plan.html` (else 403)
    - only ids of its items (else 400)
  - Each answer is the whole inbox, but with `listening` `null` once stale (`ReviewInbox.forPage()`).
  - Writes need the server's token and origin (`SRV.Guard`).
- Unsent:  marks newer than `sent` (the last "send to Claude").
  - Never an immediate one (`details`, revisit `now`).
- `spell dev plan-doc inbox <name> [--json]` prints it:
  - marks by action, with their items' titles, sent or not
  - the `now` queue, agents at work, the session listening
- Claude's side, `spell dev plan-doc inbox <name> ...`
  (the loop, step by step:  [the plan-doc guide](../../templates/epics/plan-doc.md), "Review inbox"):
  - `listen` / `unlisten`:  a session waits on it, or stopped
  - `wait`:  run in the background;  it stamps the heartbeat while it waits
    - exits 0 with work, which wakes the session:  requests for now, taken;  a send not yet handed over (`handedOver`)
    - exits 2 on timeout
  - `apply [ids]`:  the sent approve / pick / todo marks, into the doc (`PlanDoc.applyMark()`), then cleared
    - A revisit with a pick is left, "to talk over".
  - `working <id> on|off`
  - `done <id>...`:  keeps a mark Owen changed meanwhile
  - `clear <id>...`
  - These and `apply` stamp the heartbeat too.
  - An agent writes into ONE item with `spell dev plan-doc details <name> <id> --file <html> [--append]`.
    - It's under the doc's lock, so it never races the session's other edits.

## Details pages

- How and when Claude writes one:  `/details` ([the details skill](../../.claude/skills/details/SKILL.md)).
- The commands ([details.js](tools/details.js)):

  ```sh
  spell dev details new | show [--wait] | wait | answer | list | sweep
  ```

  - `show` opens a page in the side bar's "Review" tab (epic `windows-and-review` P6).
- Owen's answer:  the page posts it to the page server's route module, [detailsRoutes.ts](tools/detailsRoutes.ts).
  - That writes `<slug>.answer.json`, beside the page.
  - `spell dev details wait`, run in the background, exits with it, and so wakes the session.
- `findPages()` skips every `details/` folder:  not in the index, not checked by `docs update`.
- Colours (the scheme:  "Colours" above):
  - recommended:  a violet thumbs-up after an option's title, no word
  - the chosen card green
  - Send blue, by the fill rule (grey outline:  nothing to send;  dashed:  changes not sent;  outline:  sent)
  - each question's toolbar badge:
    - red:  nothing yet
    - green:  picked
    - blue:  Claude has more to do (more details asked, or only Other written)
  - the status label:
    - red:  waiting for your answer
    - blue:  changes not sent
    - green:  answered

## Syntax-choices pages

- A table of names (or any syntax) Claude recommends, one row per use site.
  - the columns:  File (opens VS Code at the line) | Purpose | Current | Recommended (a box, pre-filled)
  - Owen types over the ones he'd write differently, then "Do it".
  - For a call made name by name, after a rule is picked (P13's boolean names).
  - How-to:  [the syntax-choices guide](../../guides/syntax-choices.html).
- The commands ([choices.js](tools/choices.js);  the rows' shape is in its comment):

  ```sh
  spell dev choices new <slug> --rows <rows.json> | show [--wait] | wait | answer | list
  ```

  - Pages go where details pages do.
  - `<slug>.rows.json`, beside the page, holds the rows.
- The page server's route module, [choicesRoutes.ts](tools/choicesRoutes.ts):
  - the draft:  `<slug>.draft.json`, saved 5s after typing stops, never wakes anyone
  - the answer:  `<slug>.answer.json`, which `spell dev choices wait` exits with

## Comments

- Owen leaves a comment for Claude on any block of a docs page or plan doc the page server serves
  (epic `airplane`, P11).
  - The BULLHORN beside each major block:
    - a section (in its title), table, aside, code block, message, cards, steps, top-level list
    - a plan doc's items, phase fields, summary and Overview prose
    - the page header:  the whole page
    - Quiet until hovered.
      Always shown, with a count, once the block has comments.
  - Or on SELECTED TEXT:  ⌘ / Ctrl I, or the bullhorn floating beside the selection.
    - The comment keeps the quote, highlighted softly on the page while the comment exists.
  - The box is a small floating PANE (Owen, 2026-10-10), fixed on the screen:
    - just under the selection (or the bullhorn clicked);  above it when there's no room below
    - the page never scrolls for it;  Owen drags it by its header
    - ivory, 8px inside on every side, with no buttons below the text
    - Its header:  the first words of the selected text (else of the block;  its tooltip names the block),
      a floppy, a trash (once the comment is saved) and ×.
    - Its field has no placeholder, only an `aria-label` (Owen, 2026-10-10).
    - It saves itself as Owen types:  the floppy shows saved (its tooltip the time), or turns red.
    - × or Escape (or ⌘ Enter) closes it.  Opening another saves this one first.
  - NEVER an empty comment (Owen, 2026-10-10):
    - nothing typed, or only spaces, saves nothing
    - emptied, it goes at once (`delete` while it waits for Claude, else `clear`)
    - the server refuses an `add` or `edit` with no text (white space or zero-width characters only):  400
  - DRAFTS:  what's typed and NOT saved yet is kept in this browser (`localStorage`), to survive a reload.
    - Only while it differs from what the server holds:  under the comment's id once it has one.
    - Leaving the page (`pagehide`) sends what's unsaved at once, as a request that outlives the page.
    - Before 2026-10-10 a saved comment's text stayed as a draft under its BLOCK:  after a reload, that block's
      bullhorn opened with it, and closing the pane saved it again, as a new comment.
      A new comment's draft that copies a comment already on its block is dropped.
  - DELETE:  a trash on every comment's card, and in the pane's header (Owen, 2026-10-10).
    - Icon only, its tooltip says what it does;  two clicks, no dialog:
      the first turns it red, "Click again to delete", for 3s.
    - `delete` while the comment waits for Claude;  `clear` once Claude has it (a taken one stays in its epic).
  - A click on a highlighted quote opens its comment in the pane again:
    - still waiting for Claude:  to edit
    - taken or answered:  to read, with Claude's answers, and the trash
  - Each comment shows under its block as a card, drawn as the pane is (Owen, 2026-10-10:  "bullhorn popup looks
    good.  These are ugly"):
    - one ivory panel, the pane's outline, corners and 8px inside;  no shadow
    - its header the pane's:  the bullhorn, "Owen" (folded:  the comment's first line), its state, the date,
      then the trash, and the pen (Edit) at the far right
    - its text in a box as the pane's field;  Claude's answers in it, violet
    - The state, quiet:  "Waiting for Claude" / "Taken by Claude" / "Answered", after a dot by the fill rule
      (a ring while it waits, solid once Claude has it).
    - Its icon buttons, and the pane's (×, the trash), are plain:  no ring, a tint under the pointer.
  - Built for reading offline, with no Claude:  only the page server writes them.
- Where they're kept (git-ignored in the shared repo:  waiting work, per machine):
  - a docs page's:  its INBOX FILE, `<page>.inbox.json` beside it ([GuideInbox.ts](tools/GuideInbox.ts))
  - a plan doc's:  the epic's review inbox, under `comments` (`ReviewInbox`, see "Review inbox")
  - One shape for both, and every change:  [`CommentList`](../epics/src/tool/CommentList.ts).
  - ids `cm1`, `cm2` ... (`c1` is a caveat's)
- Where a comment is:  its ANCHOR ([BlockAnchors.js](tools/BlockAnchors.js), shared by the runtime and the tools).
  - the block's id, else `<nearest section or plan part id>#<kind>-<n>`:  `memory#table-2`, `p3#field-2`
  - plus an excerpt, to find it again if the page changed
  - a text comment also has its `quote` and `offset`
- The routes:  [commentsRoutes.ts](tools/commentsRoutes.ts)
  - `GET /api/comments?page=` (`takesComments`, every comment)
  - `POST /api/comments { page, action: add | edit | delete | clear, ... }`
    - edit and delete only while `new`;  clear whatever its state
    - add and edit need text:  blank is a 400
  - pages under `guides/`, `pages/`, `epics/` (plan docs too)
  - NOT:
    - a plan doc's `parts/`
    - details pages with questions, syntax-choices pages
    - `templates/`, goals (thoughts), Spell UI or brand pages
- Claude's side, for docs pages ([comments.ts](tools/comments.ts), [GuideChanges.ts](tools/GuideChanges.ts)):

  ```sh
  spell dev comments list [--all] [--json]
  spell dev comments answer <page> <id> --file <html>
  spell dev comments gather [<page>... | --all] [--epic <name>] [--json]
  ```

  - `gather` takes every waiting comment (and page note still `new`) into ONE epic, `guide-changes`.
    - one phase per page;  an Updated block in the page's phase while it's open
    - each comment then `taken`
    - `/airplane land` runs it.
- Claude's side, for plan docs:  `spell dev plan-doc inbox <name>` lists them.
  - Answered like a revisit's note, then `plan-doc inbox <name> done cm3` (or `clear cm3`).

## Page notes

- Before P11 (comments), Owen left notes on docs pages (epic `airplane`, P3).
  - A bubble on each section's title, and a Note pill in the page header:  both gone since.
  - The notes written still show, read only, and `spell dev notes` still answers them.
- The note is written INTO the page's HTML, so the shared repo commits it with the next turn.
  - The markup:
    - `<spell-notes for="<section id> | page">` groups
    - of `<spell-note id="n3" status="new | answered | done" at>`
    - Claude's `<spell-note-reply by at>` under one
  - The markup, and every edit to it:  [PageNotes.js](tools/PageNotes.js).
  - Plain markup, no element:  the runtime (`spell-doc-runtime.js`, "Page notes") draws each note as a folded card.
    `spell-doc.css` styles it.
  - An edit splices the page's source, every other byte kept ([`editNotes()`](tools/notesOnDisk.ts)).
    It's formatted after only if the page was formatted.
- Claude's side ([notes.ts](tools/notes.ts)):

  ```sh
  spell dev notes list [--all] [--json]
  spell dev notes answer <page> <id> --file <html>
  spell dev notes done <page> <id>
  ```

  - `spell dev comments gather` takes the `new` ones into `guide-changes`, with the comments.
- Regenerated pages keep their notes:
  `index.js` puts the groups of the part it rewrites back into their sections (`replaceBetween()`).

## Experiments

- Claims backed by measurement:  scripts in `<topic>/experiments/`, e.g. `solid/experiments/`, `precedence/experiments/`.
  - Each has a header comment, saying how it was run.
- They live in the shared repo, so they DON'T run in place any more.
  - Node runs them from their real path in `../spell-app-dev`, where there's no `node_modules` and no `$/` aliases.
  - To re-measure, copy one into the repo, under `packages/docs`, and run it there.
    (Its `tsconfig.json` extends `tsconfig.base.json`.)
- Tables quote medians of several runs, never a single run.
- Keep the scripts:  they re-measure on upgrades.
- A guide's own LIVE elements, e.g. the custom elements guide's `<ui-counter>`:
  - Their TypeScript source is in its `experiments/`, with an entry file.
  - [bundle-experiment.ts](tools/bundle-experiment.ts) builds them into ONE classic script beside it.
  - The page loads it right after `spell-ui.js`.
  - It's built as a component pack is, so the elements extend the page's own Spell UI:
    - Vite, on Spell UI's `baseConfig()`
    - Solid and `$/ui/core`, from the page's `SpellUI.packModules`
  - It may import Spell UI's doc-only families (`$/ui/docs-components/<family>`), from the checkout's source.
    - Why:  `spell-ui.js` is built from `ui`'s `dist/`, which has none.
  - Rebuild it after editing the elements, or when a doc-only family it imports changes.
  - The script is shared content too, so the last checkout to build it wins.

## Links

- Every reference to a file, folder or external page is a link that opens a NEW TAB.
  - Each destination gets its own named target, so re-clicks reuse that tab.
  - `yarn tsx tools/doc-links.js <page>` links `<code>path</code>` references, and targets existing links (idempotent).
    - Paths resolve against the page's folder, its `experiments/`, the repo root, `packages/`, and `#name/...` aliases.
  - A name with its path as its tooltip links to that path:  `<code title="path">name</code>`.
    That's how prose names a file (WWOD §6 › "Plain text, plain paths").
  - `yarn tsx tools/doc-links.js --check <page>` must pass:
    - every local link resolves
    - one target per destination
    - no nested links
  - The rules themselves live in `$/assembler` (`AS.Linker`):  how a path resolves, which target a link gets.
    - `doc-links.js` is its command line.
    - The plan-doc tool links through the same code.
  - Run it under `tsx`, never plain `node`:  it imports `$/assembler`.
    - The tools run it through `docLinksRun()`, in [pages.js](tools/pages.js).

## Finishing a page

In this order, from `packages/docs`:

1. `yarn tsx tools/doc-links.js <page>`
2. `yarn vp fmt <page>` (`yarn format` would reformat it anyway)
3. `yarn tsx tools/doc-links.js --check <page>`
4. `node tools/check-spell.js <page>` must pass, and LOOK at its four screenshots:
   the checks can't see overlap, clipping or bad wrapping
5. `spell dev docs index`, when the page is new, renamed, or its `<title>` / description changed

## Scripts

- `spell dev docs update` ([update.js](tools/update.js)):  rebuilds the bundle from the LATEST UI.
  - Then `docs index`, then `doc-links.js --check` and `check-spell.js` on every page.
  - `--skip-ui-build` reuses `../ui/dist`;  `--no-check` skips the browser.
- [bundle-spell-ui.js](tools/bundle-spell-ui.js):  builds UI (`yarn build`), and bundles `spell-ui.js`, in `_assets/`.
  - `--design [--out <dir>]` (`yarn design:bundle`, epic `claude-design` P8):
    the claude.ai design system's bundle instead, `bundle.js` in its `components/`.
    - from `spell-ui.design.entry.js`, in `_assets/`
    - no page runtime, site header or saver
    - the engines and every Font Awesome Free icon inlined
    - `<!--` / `</script` escaped
    - fails over 6 MB
    - default out:  `packages/ui/build/design-system/project/components/`
- `yarn tsx tools/bundle-experiment.ts <entry.ts> [<out.js>]`:  a guide's live elements, as one classic script.
  - See "Experiments".
  - default out:  `<name>.bundle.js`, beside `<name>.entry.ts`
- [check-design-bundle.js](tools/check-design-bundle.js) `[bundle.js] [outDir]` (`yarn design:check`), with Playwright:
  - the design bundle, inlined into an `about:srcdoc` frame:  icons, code colours, markdown, no errors
  - then a board under Claude Design's own runtime, whose `<ui-button onClick>` must count
    - the runtime:  [dc-runtime.js](tools/vendor/claude-design/dc-runtime.js), copied from claude.ai
  - Run it after touching the design target.
- [design.js](tools/design.js) (`spell dev design pull | changed | pushed | state`):  the local half of the `/design` skill.
  - a Claude Design board, as a page
  - the push record:  `design-system.json` in `brand/`, shared
- `spell dev docs index` ([index.js](tools/index.js)) rewrites:
  - the docs home's area cards
  - each area's list page:  `index.html` in `epics/`, `guides/`, `templates/`, `brand/`
- `spell dev docs new` ([new-page.js](tools/new-page.js)):  a page from a template, at any depth.
- `spell dev docs open [page] [--vs | --review]` ([open.js](tools/open.js)):  shows a page, by default the index.
  - in Chrome, reusing its tab
  - `--vs`:  in VS Code's doc preview, the right side bar's "Spell Docs" tab (`/spell-docs`)
  - `--review`:  its "Review" tab (`/epic review`)
  - Each tab keeps its own page.
    Showing the page a tab already has doesn't reload it:  the page updates itself.
- `spell dev details` ([details.js](tools/details.js)):  details pages (see "Details pages").
  - [detailsRoutes.ts](tools/detailsRoutes.ts):  the page server's route module for their answers
- `spell dev choices` ([choices.js](tools/choices.js)):  syntax-choices pages (see "Syntax-choices pages").
  - [choicesRoutes.ts](tools/choicesRoutes.ts):  their drafts and answers
- `spell dev comments list | gather | answer` ([comments.ts](tools/comments.ts)):  comments on docs pages.
  - See "Comments".
  - [commentsRoutes.ts](tools/commentsRoutes.ts):  the pages' bullhorns
- `spell dev notes list | answer | done` ([notes.ts](tools/notes.ts)):  page notes, from before comments.
  - See "Page notes".
- Forwarders to the plan-doc tool (see "Plan docs"):  `plan-doc.js`, `plan-parts.js`, `inbox.js`, `review-backfill.js`.
  - The tool:  `PlanDoc`, `PlanParts`, `ReviewInbox`, `ReviewBackfill`, in [the tool's folder](../epics/src/tool/).
  - For old imports, and callers on older code.
  - The review routes are [reviewRoutes.ts](../epics/src/tool/reviewRoutes.ts).
- `spell dev agents add | set | done | list | wait | told` ([agents.ts](tools/agents.ts), over [AgentList.ts](tools/AgentList.ts)):
  the running-agents list (epic `skillz`).
  - Every background agent a Claude session started, by name, while it runs.
  - The file:
    - in an epic:  `agents.json` in the epic's folder (git-ignored in the shared repo)
    - else:  `.spell-agents.json` at the checkout's root (git-ignored)
    - `--epic <name>`, on any verb, picks the epic
  - Names get a prefix:  the epic's, else the worktree's, else `main`.
    `add aaa` in epic `skillz` is `skillz-aaa`.
  - An entry leaves when its agent finishes (`done`).
    Empty, the file goes.
  - Every write is under the file's lock (`SRV.FileLock`) and atomic, as the review inbox's.
  - REDIRECTS (P3):  a plan doc's "Agents running" panel (`<epic-page>`, `packages/epics`) shows an epic's list,
    with a note box per agent.
    - Owen's note goes through [agentRoutes.ts](tools/agentRoutes.ts), guarded as the review routes are:
      - `GET /api/agents?page=`
      - `POST /api/agents/redirect { page, name, note }`
    - It goes into the entry's `redirects`, untold.
    - Until a session's background `wait` takes it, sends it to the agent, and marks it `told`.
  - The verbs, and an example:  the header of [agents.ts](tools/agents.ts).
- `spell dev docs link <page> [--hash <id>] [--text "..."] [--review] [--show]` ([link.ts](tools/link.ts)):
  the markdown links Claude gives for a page.
  - side bar first (`--review`:  its "Review" tab), then `(_browser_)`
  - both through [showRoutes.ts](tools/showRoutes.ts) (`GET /api/docs/show`)
- `spell dev docs fuss <paths...> | --branch [--json]` ([fuss.ts](tools/fuss.ts)):
  the writing checker under `/fussbudget` (epic `skillz`, P7).
  - It lists the misses of WWOD §6 a tool can find, by file and line.
  - kinds:
    - `phrase-split`:  a line ending in a new phrase's first 1-4 words
    - `dense`:  3+ sentences in one paragraph or bullet
    - `jargon`:  a package's banned words (`Fuss.JARGON`)
  - It reads comments and docstrings in code, and Markdown;  in `.html` pages, only `dense` and `jargon`.
  - Exits 1 on any miss.
  - Runs in the caller's folder, so its paths are from there.
- [pages.js](tools/pages.js):  shared by the scripts.
  - the areas:  `EPICS`, `GUIDES`, `PAGES`, `TEMPLATES`, `BRAND`, `GOALS`, `HOME`, `LIST_PAGES`
  - `findPages()`
  - `pageFile()`:  a page argument to its file
  - `atDepth()`:  a template at a page's depth
  - `parseArgs()`:  a tool's command line, `--key value` flags and positionals
  - `tidy()` (link targets + oxfmt), `serialize()`
  - `openInChrome()`, `openInVSCode()`
    - plan docs:  the doc preview, through the spell extension's `DocPreview`
    - `{ view: "review" }`:  the "Review" tab
- `tools/check-spell.js <page> [outDir]`, with Playwright:  writes screenshots.
  - It loads the page from `file://`, or from the page server when the page says `data-spell-needs-server`.
  - It fails on:
    - console errors
    - an undefined or unrendered `ui-*` or `epic-*` element (a plan doc's, the `epics` pack)
    - a toolbar that doesn't list every top-level section (a plan doc's:  its `<epic-*>` blocks)
    - a toolbar that isn't on screen at the top, at phone width
    - a page still drawing the old floating rail
    - phone-width overflow, a squeezed content column
    - top-level titles that don't stick (a plan doc's largest item section opened first)
    - a section that won't fold / unfold, or forgets its fold on reload
    - a plan doc's open `<epic-item>` whose line won't stick under its section's title (Q6, desktop and phone)
- The plan-doc checks moved to [epics' demo folder](../epics/demo/), with the review runtime.
  - Each runs Playwright on a COPY of a doc, never a shared one.
  - Their header comments have the details.
  - `node packages/epics/demo/check-review-epics.mjs [--stub] [--doc <name>] [outDir]`, from the root:
    - It clicks through every review flow on `<epic-*>` controls, and reads each back from the inbox:
      Approve, Make Todo, Revisit and its note box, drafts across a reload, Later, Do Now, nevermind,
      Add Details Now, Send, Review Now.
    - No control past the window, or over a title, at 280 / 900px, light and dark.
    - It refuses while the copy's inbox file exists.
    - Run it after touching the review controls or `ReviewClient`.
  - `node demo/check-live-epics.mjs [epic] [--item <id>] [--bundle <spell-ui.js>]`, from `packages/epics`:
    - Three live edits (an attribute, a part, a child) must patch the `<epic-*>` elements in place.
    - They must keep the open item, a half-typed note and its focus, and the scroll.
    - Run it after touching `liveClient.ts`, or the runtime's "Live update".
  - `node packages/epics/demo/check-header-epics.mjs [--doc <name>]... [outDir]`, from the root:
    - the page header, the review line, the Phases section's `open/all` badge (item sections show only their state chips),
      the state filter and the Plan changes box
    - at 280 / 900px, light and dark
  - `node packages/epics/demo/check-fold-epics.mjs [--doc <name>] [--item <id>] [--guide <path>] [outDir]`, from the root:
    - A fold never moves what was clicked:  the line or title stays put, within 1px, for 1.5s after the click.
    - Items a link landed on (at once, mid window, near the page's end), one opened by a click,
      a phase, a guide's section, and the next item's line clicked after a reply.
    - At 1200 and 390px.
    - Run it after touching the folds, the landing, or `holdWhileFolding()`.
- `tools/to-ui-section.js <page>...`:  converts old `section.s2|s3` pages to `<ui-section>`, ids kept.
  - Idempotent;  it refuses goals pages.
- [doc-links.js](tools/doc-links.js):  see "Links".
  - Text and regexes, not a DOM:  it edits only what it links.
  - Its page arguments are from where it runs:  from `packages/docs`, `../../guides/x.html`.
  - The linking itself is `$/assembler`'s `Linker`.
  - `PlanParts.formatHTML()` is `$/assembler`'s `formatHTML()` too.
- [relocate.js](tools/relocate.js):  the docs' two moves, and their repairs.
  - into this package's `content/`, 2026-10-04
  - out into the root folders, 2026-10-05
  - `spell dev shared repair` runs them.
  - `spell dev shared commit` runs the reorg's (`reorgShared()`):
    pages older code wrote at old paths move on, and old-style links are fixed.
- A @spell-app/ui problem:  fix it in `packages/ui` when it's a real `ui` bug (the same change may touch both).
  - Else work around it here.
  - Either way, add it to [spell-ui-findings.md](../../guides/spell-docs/spell-ui-findings.md).

## Agent rules

- When agents need a doc's rules, also write a distilled `.md` beside it:  bullets, `ts` code blocks.
  - Point to it from the top of an `AGENTS.md`, with an "if working with X, READ file" line.
  - The package's `AGENTS.md`, or the root's when other packages need it too.
  - See [solid-2.md](../../guides/solid/solid-2.md), pointed to from the root's.
- A doc's rules are about ITS topic (Solid's mechanics, a tool's flags).
  - House style, how we write any code, goes in WWOD (`agents/wwod/`), not in a distilled doc.
