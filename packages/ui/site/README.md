# `@spell-app/ui` docs site

Plain, hand-authored `.html` pages in [fomantic-ui.com](https://fomantic-ui.com)'s docs style, built ONLY from
`<ui-*>` widgets:  a left nav of every component, a masthead, Examples / Usage / API / Theming tabs, every example
live with its source a click away, and an "On this page" rail.  Where a widget can't do what a page needs, that's a
gap in the library, recorded in the plan doc of epic `spell-ui-pages` (`packages/docs/content/epics/spell-ui-pages/`).

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
    ui-<name>.html      one page per component family, named for its main tag;  plus a page of their own for the
                        sub-tags `_data/pages.json` lists under their family's `pages` (`ui-radio`, `ui-textarea`,
                        the content parts but `ui-header`)
  _parts/               layout.html:  EVERY page's chrome (top bar, nav, `<ui-root>`), written once;  footer.html
  _src/                 site.ts (the bundle's entry:  what's in it and why), snapshot.ts, SiteShell.ts (mounts the
                        layout), SiteRouter.ts (swaps pages), SiteSections.ts (sticky offsets, folds, landing on a
                        hash), site.css (layout glue only)
  _assets/              GENERATED, committed:  the bundle (`site.js`, `site.css`, a lazy chunk per family);
                        `icon-packs` is a SYMLINK to `../../src/icons/icon-packs`.  NEVER edit
  _data/                components.json, icons.json, search.json (GENERATED, committed);  pages.json (hand-kept)
  examples/             files the pages' examples load (`<ui-include source>`, `<ui-markdown source>`, an icon pack)
  images/               Fomantic's docs images, same paths as fomantic-ui.com's `/images/...`
```

Every page loads (`../` from `components/`):

```html
<link rel="stylesheet" href="_assets/site.css" />
<script type="module" src="_assets/site.js"></script>
```

A page's `<body>` is ONE `<main id="main" class="site-main">`, nothing else:

- First load:  `site.js` fetches `_parts/layout.html` and wraps the `main` in it (`SiteShell`), THEN defines
  `<ui-root display="when-ready">`, so the page stays hidden until the layout is in and every element is ready, and
  shows at once:  no flash of unstyled markup, no jump.  `site.css` hides the bare `main` until then (4s at most).
- Later clicks on links to other pages of the site:  `SiteRouter` fetches the page, loads the families it uses, then
  swaps only the `main` through a `<ui-include select="main#main">` and `pushState`s its real URL;  the chrome stays.
  Back / forward, deep links and reloads work as with plain pages.
- So:  inline scripts in `main` run again on every visit (the router re-runs them), and `<head>` styles DON'T follow
  a swap:  put page styles in `main` or `_src/site.css`.
- A page opened from disk (`file://`), or one whose layout fetch failed, shows its `main` alone.

`<ui-root>` lazy-loads every other family, the doc-only `<ui-docs-*>` elements included (`src/docs-components/`), on
first use.  The doc-only elements read `_data/components.json` (`SiteData`), never the vocabularies.

The layout's root is `<ui-root class="site" stack-with="page" ...>`:  stacking examples (`stackable`, `doubling`,
steps, form rows, items, token tables) stack by the SCREEN, as on fomantic-ui.com, not by the narrower docs column
(`docs/theming.md` "Stacking").

## Making a page

From `packages/ui`:

```sh
yarn site:new ui-card                                         # => site/components/ui-card.html
yarn site:new getting-started --title "Getting started" --summary "One line."   # => site/getting-started.html
```

- From the template, `packages/docs/content/templates/spell-ui-docs.html`;  title / summary / status from
  `_data/pages.json` (fix a summary THERE, then `yarn site:data`).  It refuses to overwrite (`--force`).
- A sub-tag gets a page of its own once its family's entry in `_data/pages.json` lists it under `pages` (title,
  summary, status), then `yarn site:data` and `yarn site:new <tag>`:  `components/<tag>.html` with ONE tag's API
  (`<ui-docs-api tag>`, where `#<tag>` lands) and a Theming tab only when a family token names it.  Its family page
  keeps the whole family's API and a one-line link to it;  the nav, search, card index and kitchen sink follow.
- How to write one (sources, examples, usage, theming, gaps):  `packages/docs/content/epics/spell-ui-pages/PAGES.md`.  The
  model page:  `components/ui-button.html`.
- Content is nested `<ui-section id header sticky collapsible dividing>`s:  a section per topic, a section per
  example inside it.  Their titles stick below the tabs' bar (which sticks too), they fold (folds remembered per
  page, everything starts open), and their ids spell out the nesting:  `#examples-types-emphasis` opens the Examples
  tab, unfolds what hides it and lands its title just below the stuck ones (`_src/SiteSections.ts`).  Old hashes
  still land (`#types`, `#emphasis`).  Write flat headers and headed examples, then `yarn site:sections` nests them
  and writes the ids (rerun it after renaming a header).
- An example is a `<ui-docs-example description>` around live markup, inside its section:  it shows the markup's own
  source, re-indented, so write the markup once.
- `<ui-*>` for everything visible;  `_src/site.css` is layout glue only (grid areas, widths, sticky offsets).

## Building

From `packages/ui`:

- `yarn site:build` -- after changing a vocabulary, a family sheet, an example or any source the site shows;  commit
  the output.  It runs:
  - `yarn site:data` -- `_data/components.json` + `icons.json` from the vocabularies and sheets (seeds `pages.json`
    for a new family), and `search.json` (every page's sections, for the site search) from the pages:  rerun after
    renaming or moving a section
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
unrendered `ui-*` tags, missing tabs, an empty "On this page", phone-width overflow, a nav flyout that won't open,
a section id that doesn't follow its nesting, a flat level 2 header, a deep link that doesn't land.
Screenshots go to `tools/results/site-check/`:  LOOK at them.

## Deploying

Not deployed yet.  A static host serves this folder as it is, except `_assets/icon-packs`:  copy through the link
(`cp -RL`).  Every bundle URL is relative (`base: "./"`), so the site works under any path.
