# `@spell-app/ui` docs site

Plain, hand-authored `.html` pages in [fomantic-ui.com](https://fomantic-ui.com)'s docs style, built ONLY from
`<ui-*>` widgets:  a left nav of every component, a masthead, Examples / Usage / API / Theming tabs, every example
live with its source a click away, and an "On this page" rail.  Where a widget can't do what a page needs, that's a
gap in the library, recorded in the plan doc of epic `spell-ui-pages` (`packages/docs/epics/spell-ui-pages/`).

- No build step to VIEW a page:  pages are static files loading ONE committed bundle.
- Served at `/ui/` by the repo's page server (`packages/server`, `UI_SITE`), live-reloading.

## Viewing

From the repo root:

```sh
yarn serve                                   # starts the page server (and the editor);  prints its URL
yarn server url "$PWD/packages/ui/site/index.html"   # the URL of one page (starts the server if needed)
```

Pages are `<base>/ui/`, `<base>/ui/components/ui-button.html` ...  The page server reloads an open page when it, its
parts, its data or the bundle changes.  `yarn server stop` stops it.

## Layout

```
site/
  index.html, getting-started.html, grammar.html, theming.html, utilities.html, icons.html, kitchen-sink.html
  components/
    index.html          the component index (cards between markers, written by `yarn site:index`)
    ui-<name>.html      one page per component family, named for its main tag
  _parts/               header.html, footer.html:  shared chrome, pulled in with `<ui-include page-styles>`
  _src/                 site.ts (the bundle's entry:  what's in it and why), snapshot.ts, site.css (layout glue only)
  _assets/              GENERATED, committed:  the bundle (`site.js`, `site.css`, a lazy chunk per family);
                        `icon-packs` is a SYMLINK to `../../src/icons/icon-packs`.  NEVER edit
  _data/                components.json, icons.json (GENERATED, committed);  pages.json (hand-kept per-family facts)
  examples/             files the pages' examples load (`<ui-include source>`, `<ui-markdown source>`, an icon pack)
  images/               Fomantic's docs images, same paths as fomantic-ui.com's `/images/...`
```

Every page loads (`../` from `components/`):

```html
<link rel="stylesheet" href="_assets/site.css" />
<script type="module" src="_assets/site.js"></script>
```

`site.js` defines `<ui-root>`, which lazy-loads every other family, the doc-only `<ui-docs-*>` elements included
(`src/docs-components/`), on first use.  The doc-only elements read `_data/components.json` (`SiteData`), never the
vocabularies.

Every page's root is `<ui-root class="site" stack-with="page" ...>`:  stacking examples (`stackable`, `doubling`,
steps, form rows, items, token tables) stack by the SCREEN, as on fomantic-ui.com, not by the narrower docs column
(`docs/theming.md` "Stacking").

## Making a page

From `packages/ui`:

```sh
yarn site:new ui-card                                         # => site/components/ui-card.html
yarn site:new getting-started --title "Getting started" --summary "One line."   # => site/getting-started.html
```

- From the template, `packages/docs/templates/spell-ui-docs.html`;  title / summary / status from
  `_data/pages.json` (fix a summary THERE, then `yarn site:data`).  It refuses to overwrite (`--force`).
- How to write one (sources, examples, usage, theming, gaps):  `packages/docs/epics/spell-ui-pages/PAGES.md`.  The
  model page:  `components/ui-button.html`.
- An example is a `<ui-docs-example header description>` around live markup:  it shows the markup's own source,
  re-indented, so write the markup once.
- `<ui-*>` for everything visible;  `_src/site.css` is layout glue only (grid areas, widths, sticky offsets).

## Building

From `packages/ui`:

- `yarn site:build` -- after changing a vocabulary, a family sheet, an example or any source the site shows;  commit
  the output.  It runs:
  - `yarn site:data` -- `_data/components.json` + `icons.json` from the vocabularies and sheets (seeds `pages.json`
    for a new family)
  - `yarn site:index` -- `components/index.html`'s cards
  - `yarn site:kitchen` -- `kitchen-sink.html`'s examples, from every family's `examples/elements/types.html`
  - `yarn site:bundle` -- `_assets/`, from `_src/site.ts` (`vite.site.config.ts`), sizes printed
- `yarn site:dev` -- while working on the library or `_src/`:  `yarn site:bundle`, then the page server (started if
  needed) serves `/ui/` while a Vite watch build rebuilds `_assets/` on every source edit, and the open pages reload.
  Not watched:  data, index, kitchen sink.  A watch rebuild leaves old hashed chunks behind:  `yarn site:build`
  before committing.  `Ctrl-C` stops the watch, not the page server.

## Checking

From `packages/ui`:  `yarn site:check <page...>` or `yarn site:check --all` (`tools/SiteCheck.ts`) loads pages from
the page server in Playwright, at desktop, phone and dark, and fails on console errors, 404s, undefined or
unrendered `ui-*` tags, missing tabs, an empty "On this page", phone-width overflow, a nav flyout that won't open.
Screenshots go to `tools/results/site-check/`:  LOOK at them.

## Deploying

Not deployed yet.  A static host serves this folder as it is, except `_assets/icon-packs`:  copy through the link
(`cp -RL`).  Every bundle URL is relative (`base: "./"`), so the site works under any path.
