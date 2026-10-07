# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/brand`.

**Root conventions apply:  READ the repo root's `AGENTS.md` FIRST** -- its Documentation, Functions,
Types / Exports and Imports sections all apply here.  Only what DIFFERS is below.

## Overview

- Spell's brand, and the work of bringing it into Spell UI (epic `design-system`,
  `epics/design-system/design-system.plan.html`);  its elements in Claude Design (epic `claude-design`, P11).
- READ FIRST for the big picture:  the durable doc, `guides/design-system/design-system.html` (the Brand tab and
  Compare, the `spell-brand` theme and its brand roles, every element, making a copy, its limits).
- Two halves (epic `claude-design`, P11, 2026-10-05):
  - the PAGES are shared, in the repo root's `brand/` (a link into spell-app-dev, the same in every checkout;  root
    `AGENTS.md`, "Shared content"):  edit them at their real path, `/Users/owen/www/spell-app/spell-app-dev/brand/`,
    and never commit them
  - the CODE stays here, tracked:  `components/<tag>/`, `src/`, `scripts/`, `_assets/`, `_data/`, configs
  - so a page links this package's files from one folder deeper than before:  `../packages/brand/_assets/...` from
    `brand/`, `../../packages/brand/_assets/...` from `brand/spell-design-system/` or `brand/components/`
- `brand/spell-design-system/` (shared) -- Claude Design's output, AS EXPORTED:  `readme.md` (the brand rules),
  tokens, logo assets, and 13 top-level `*.dc.html` pages.
  - NEVER edit Claude Design's files:  they're the reference the copies are measured against, and Claude Design may
    export over them.
  - A `.dc.html` page is an `<x-dc>` template that `support.js` (Claude Design's runtime, generated) compiles into
    React at load.  React and Font Awesome come from CDNs;  four pages also fetch local files, so they need the page
    server.
  - The `sp-*` classes in `components/components.css` and the React wrappers in `components/*/` are used only by the
    specimen cards, never by the 13 pages (all inline styles).
- `brand/spell-design-system/*.spell.html` (shared) -- beside each `.dc.html`, its copy on Spell UI:  same name,
  `.spell.html` (`Brand Montage.dc.html` -> `Brand Montage.spell.html`).
- `brand/index.html` (shared) -- the Brand tab's home page:  every page, with Original / Spell / Compare links, the
  elements, and (written by `spell dev docs index`) every other page in `brand/`, e.g. ones pulled from Claude Design.
- `brand/compare.html?page=<Name>` (shared) -- an original and its copy side by side, or one over the other.
- `_assets/` -- the brand pages' own assets:
  - `brand-pages.js` / `.css` -- the index and Compare (classic script, on the docs bundle).  Its `PAGES` list is
    THE list of pages;  flip a page's `built` to `true` in the change that adds its `.spell.html`.
  - `ui/` -- GENERATED, NOT committed (git-ignored since 2026-10-07:  its hashed chunk names churned every diff):  the
    copies' bundle, `brand-ui.js` + `brand-ui.css` + lazy chunks (`yarn build`);  `icon-packs` a symlink to Spell
    UI's.  The page server builds it when it starts, if stale (`spell dev bundles build --stale`;  `$/assembler`
    `Bundle`, `.bundle.json` records the sources' hash).  NEVER edit.
- `_data/` -- GENERATED, committed (`yarn site:data`):  `components.json` (the docs pages' API and tokens, and the
  design system's Brand cards), `pages.json` (hand-kept), `custom-elements.json` and `html-custom-data.json` (VS Code
  autocomplete for `<ui-brand-*>`, loaded by the repo's `.vscode/settings.json`).
- `src/` (`$/brand`, self-namespace `B`) -- shared code:  `Palette` (the brand's colour math from Claude Design's
  `lib/palette.mjs`:  sRGB <-> OKLCH, contrast, `generateScale()` 17-step ladders, `buildPalette()`;
  `Palette.test.ts` pins it to `lib/palette.json`, copied as `Palette.fixture.json`:  a test can't read the shared
  folder), `brand.types.ts`;  and the bundles' entries `brand-ui.ts`, `brand-docs.ts`, `brand-design.ts`, `hues.ts`
  (what's in each and why).
- `components/` (`$/brand/components`) -- the `<ui-brand-*>` elements, one folder per family, written exactly like
  a Spell UI family (`packages/ui/AGENTS.md`, "Solid authoring"), importing shared code from `$/ui/core` /
  `$/ui/forms`.  Generic ones move into Spell UI later (epic decision D2).  The specimen page:
  `brand/components/components.spell.html` (shared).
- `scripts/` -- `build.ts` (the bundle), `compare.ts` (screenshot diffs) and `site-data.ts` (`_data/`).
- `vite.design.config.ts` -- the elements built for the claude.ai design bundle, `dist/brand-design.js` (git-ignored):
  `packages/docs/tools/bundle-spell-ui.js --design` runs it (`yarn design:bundle` in `packages/docs`).
- `brand/leonardo/` (shared) -- the original reference images and brief, from before Claude Design.

## A `.spell.html` copy

- Beside its original, same name.  Loads `../../packages/brand/_assets/ui/brand-ui.css` and, as a MODULE,
  `../../packages/brand/_assets/ui/brand-ui.js`:  from the page server only, not `file://`.
- Starts its `<body>` with `<spell-site-header root="../..">`.
- Colours, fonts, radii and shadows ONLY from the theme's tokens:  `--ui-*`, and the brand roles `--spell-*`
  (`spell-brand.css`, "Brand roles":  `--spell-surface-warm`, `--spell-type-eyebrow` ...), so dark mode works.
- Dark mode:  Spell UI's `color-scheme` (`ui-dark` on `<html>`), never the brand's `data-theme`.
- Anything the theme can't do:  the plan doc's "What the theme can't do today" table, and an issue.
- Spell UI's "UI rules" (`packages/ui/AGENTS.md`) apply to the pages and the `<ui-brand-*>` elements too, e.g.
  numeric fields right-aligned against their unit.

## Commands

- `yarn build` -- the copies' bundle, `_assets/ui/` (git-ignored);  `spell dev bundles build brand` runs it and
  records the sources' hash.  The page server rebuilds it when it starts if `components/`, `src/` or the Spell UI
  source it reads changed;  rerun by hand (or restart the page server) while it runs.
- `yarn site:data` -- the elements' docs data, `_data/components.json` (+ hand-kept `pages.json`), by Spell UI's
  `SiteDataBuilder` reading `components/`, and the editor manifests (`ElementManifests`);  rerun after a vocabulary or
  a sheet's tokens change, and commit all four.  Then `spell dev design build` picks the change up for claude.ai.
- `yarn compare [<page>...] [--width 1280] [--height 900] [--dark] [--full]` -- screenshots each original and its
  copy, and a diff % per page, into `.compare/` (git-ignored):  `dc.png`, `spell.png`, `side.png`, `diff.png`,
  `report.md`.  A rough guide:  LOOK at `side.png` or the Compare view (`/brand/compare.html`).
- `yarn test` -- the elements' tests, in a real browser (`vitest.config.ts`:  Vitest browser mode, chromium), with
  Spell UI's helpers (`$/ui/test/ElementFixture`, `$/ui/test/a11y`).  The root's `yarn test` runs them as `brand`.
- `yarn ts`, `yarn format`.

## The elements

- Each family has a docs page, `brand/components/<tag>.html` (shared), in Spell UI's docs format
  (`templates/spell-ui-docs.html`:  masthead, Examples / Usage / API / Theming tabs), loading
  `_assets/ui/brand-docs.js` (`src/brand-docs.ts`) and `_assets/brand-docs.css` from here.  A new family:  its
  `<tag>.vocabulary.en.ts` (topics, aka, description), `yarn site:data`, then copy a page.  The Brand index lists them.
- The claude.ai design system shows each family as a card in its "Brand" group (`packages/ui/tools/DesignBrand.ts`,
  epic `claude-design` P11):  its API from `_data/components.json`, its examples from the docs page's Examples tab
  (`<ui-docs-example>`s, titled by their `<ui-section>`, with the page's own `<style>`s).  So an example there must
  work on its own:  no page script, no file to load.

- The inspector panel is Spell UI's now:  `<ui-panel>` (`packages/ui/src/components/ui-panel/`, moved from
  `<ui-brand-panel>` 2026-10-05), a `<ui-section>` subclass;  its docs page is Spell UI's
  (`/ui/components/ui-panel.html`).  Its tokens are `--ui-panel-*`;  `color="accent"` works on the brand pages
  (`src/hues.ts` + `spell-brand`).
- `<ui-brand-field>` (`components/ui-brand-field/`) -- a label row (label, actions, value, info tip), the control,
  help and error;  `:state(field)` + `showErrors()`, so `<ui-form>` validates it as a `<ui-field>`.  Names an unnamed
  slotted control after its `label` (`aria-label`).
- `<ui-brand-composer>` (`components/ui-brand-composer/`) -- write a spell and cast it:  a form element (the text under
  `name`), `ui-cast` (cancelable) from the button or Cmd / Ctrl+Enter, `casting` set by the page, `size="large"` for a
  hero.
- `<ui-brand-checklist>` + `<ui-brand-check>` (`components/ui-brand-checklist/`) -- round-marked lines:  `step` drives
  build progress (done / active / pending, announced);  `checkable` makes each a checkbox.
- `<ui-brand-phone>` (`components/ui-brand-phone/`) -- a phone frame (status bar, `dimmed`) around a live preview.
- Page art, brand-only (never moves into Spell UI):
  - `<ui-brand-logo>` -- the logo outlined from P052 (`logoPaths.ts`, copied from Claude Design's `components/brand/lockupPaths.js`,
    `import()`ed on first use), so it needs no font.  Use it, never an `<img>` of the SVGs.
  - `<ui-brand-flourish>` -- `Flourish.ts`, a port of Claude Design's `lib/spell-flourish.js`:  same variants, same
    seeded shapes.  Fills its positioned parent.
  - `<ui-brand-blob>` -- a corner blob;  the parent must be positioned and clip.

## Imports

As the root's, plus these reaches into `ui` past its barrel, each because the barrel can't give it (until the elements
move into Spell UI, epic todo T2):
- `$/ui/core` -- the element authoring API (`UIElement`, `proto`, `Cell` ...), as a `ui` family imports it
- `$/ui/runtime`, `$/ui/icons`, `$/ui/styles`, `$/ui/styles/ui.css` -- the bundle entries (`src/`), as Spell UI's site
  entry does
- `$/ui/docs-components/...` -- the docs widgets and `SiteData` (`src/brand-docs.ts`):  not in `$/ui`'s barrel
- `$/ui/tools/SiteDataBuilder`, `$/ui/tools/ElementManifests` (`scripts/site-data.ts`) and `$/ui/test/...` (tests)
- NEVER the other way:  `ui` imports nothing of `brand`;  its design export READS `_data/components.json` and the docs
  pages as data (`DesignBrand`)

## Serving

- The page server serves the repo at `/`, so the pages are at `/brand/...` and this package's files at
  `/packages/brand/...`;  the site header's Brand tab (`PROPERTIES` in `packages/server/src/site/site.types.ts`)
  opens `/brand/index.html` and lights on every page under `/brand/`.
- Live reload:  `brand` (the pages) and `packages/brand` (the bundles) are in the root `package.json`'s
  `pageServer.watch`.
- File names with spaces are fine:  links write them `Brand%20Montage.spell.html`.
