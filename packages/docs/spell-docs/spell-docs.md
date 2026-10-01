# How the doc pages work

The mechanics behind every page in `packages/docs`:  what loads, what the runtime builds, what the checks check.
For people:  `spell-docs.html` beside this explains the concept and `/plan-doc`;  this is the distilled version.
How to WRITE a page (headings, widgets, code, links):  `../AGENTS.md`.  The scripts are the truth where this drifts.

@spell/ui is unfinished, and these pages are also a test of it.  Work around a UI problem here when that's
reasonable, fix it in `packages/ui` when it's a real `ui` bug, and record it either way in `spell-ui-findings.md`.

## History

- Until 2026-09-30 each page was GENERATED:  a hand-written `<name>.html` (styled by `doc.css` / `doc.js`) went
  through `to-spell.mjs` (a Playwright DOM transform) into `<name>.spell.html`, and both were kept to compare.
- Since then the `ui-*` pages ARE the sources:  `to-spell.mjs`, `doc.css`, `doc.js` and the plain sources are gone,
  the runtime builds the contents sidebar that `to-spell.mjs` used to write, and pages are plain `<name>.html`
  (the docs root is `index.html`, so a browser opens it for the folder).

## Hard constraints

- Pages are opened straight from disk (`file://`).  Browsers block ES modules there, so a page loads ONE classic
  script, `_assets/spell-ui.js`:  an IIFE bundle of Solid + @spell/ui + the page runtime.  No `type="module"`, no
  `import()` at runtime, no fetches of sibling files.
- Icons:  UI's icon packs load with `import()` + `fetch`, so they can't work here.  The bundle carries the icons the
  widgets and pages use (`ICONS` in `scripts/bundle-spell-ui.js`), `UI.icons.register()`ed at start-up, and drops the
  packs (`UI.icons.reset()`) so nothing is requested.  An icon name not in `ICONS` draws nothing:  add it there.
- highlight.js from cdnjs (`11.9.0`) colors code;  offline, code stays plain monospace.
- Exactly ONE copy of Solid in the bundle (UI requires it);  the bundler fails the build otherwise.

## Files

| File | What |
|---|---|
| `scripts/update.js` (`yarn docs:update`) | bundle, `docs:index`, `doc-links.py --check`, `check-spell.js` on every page |
| `scripts/bundle-spell-ui.js` | builds UI (fork + `yarn build`), then bundles `_assets/spell-ui.entry.js` -> `_assets/spell-ui.js` |
| `scripts/index.js` (`yarn docs:index`) | rewrites the lists in `index.html` from every page's title and description |
| `scripts/pages.js` | where the docs are, `findPages()`, `tidy()` (link targets + oxfmt) -- shared by the scripts |
| `scripts/check-spell.js` | Playwright checks + four screenshots of one page |
| `scripts/doc-links.py` | links `<code>path</code>` references;  `--check` verifies every link |
| `_assets/spell-ui.entry.js` | the bundle's entry:  icons first, then UI, then the runtime |
| `_assets/spell-doc-runtime.js` | page behaviour (below) |
| `_assets/spell-doc.css` | page layout and what UI doesn't cover;  reaches into widgets via UI tokens and `::part()` |
| `_assets/plan-doc.css` | plan docs only, on top of `spell-doc.css` |

## Page skeleton

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Short Title</title>
    <meta name="description" content="One sentence:  shown in the docs index." />
    <link rel="stylesheet" href="../_assets/spell-doc.css" />
  </head>
  <body class="spell-doc-page">
    <div class="spell-doc">
      <main class="spell-doc-main">
        <h1>Short Title</h1>
        <p class="lede">One line.</p>
        <section class="s2">
          <ui-sticky class="spell-h2"><h2 id="1-summary">1. Summary</h2></ui-sticky>
          ...
          <section class="s3">
            <ui-sticky class="spell-h3"><h3 id="a-part">A part</h3></ui-sticky>
            ...  <!-- h4s stay plain:  <h4 id> -->
          </section>
        </section>
      </main>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <script src="../_assets/spell-ui.js"></script>
  </body>
</html>
```

- `../_assets/` is relative to the page's folder:  `_assets/` at the top level, `../../_assets/` two deep.
- No contents sidebar and no `.spell-toc-open` button in the markup:  the runtime adds both.

## Runtime behaviour (`_assets/spell-doc-runtime.js` + `spell-doc.css`)

- Contents sidebar (`buildContents()`), built at load from `main`'s h2 / h3 / h4 when the page has no `#spell-toc`:
  - one accordion pair per h2;  runs of h3s without h4s share a `ui-menu vertical text`;  an h3 with h4s gets a
    nested one-pair accordion
  - every link carries `data-target="{heading id}"` for scroll-follow
  - a heading's `<ui-icon>`s (a plan phase's status) are copied in front of its entry;  `ui-label` badges are not
  - a heading with no `id` gets a slug of its text -- but give headings other pages link to an explicit, stable id
- Layout:  content column (max ~880px) + ~300px contents column that scrolls on its own.  Under 1100px the contents
  become a right drawer, toggled by `.spell-toc-open` (fixed bottom-right);  clicking a contents link closes it.
- Sticky headers:  h2 sticks at the top of its `section.s2`;  h3 just below its section's h2 (the runtime sets the h3
  sticky's `offset`, re-measured on resize).  Headings get `scroll-margin-top` so anchors land below both.
- Scroll-follow:  the current heading's contents link is highlighted and its panels open;  panels the scroll opened
  close again, panels the USER opened stay open;  the active link is kept in view.
- Buttons:  `expand` / `collapse` every contents panel;  `code` folds / unfolds every `ui-accordion.spell-code`.
- Cheat sheets:  `ui-input[data-spell-filter]` filters `ui-card`s by text (every word must match), hides sections
  with no visible card, remembers the filter in `localStorage`.
- Light / dark:  follows UI's scheme (the OS);  page colors from UI's `--ui-*` tokens.

## Verification

- `yarn docs:update` must pass;  `--skip-ui-build` reuses `../ui/dist`, `--no-check` skips the browser checks.
- `node scripts/check-spell.js <page> [outDir]` checks one page and writes four screenshots -- look at them.
  - fails on:  console errors, undefined or unrendered `ui-*`, contents links that don't match the headings 1:1,
    phone-width overflow, an h2 that doesn't stick, no active contents link after scrolling, a drawer that won't open
- Open pages as `file://` URLs:  that's how they're read.
