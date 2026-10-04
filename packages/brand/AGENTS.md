# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/brand`.

**Root conventions apply:  READ the repo root's `AGENTS.md` FIRST** -- its Documentation, Functions,
Types / Exports and Imports sections all apply here.  Only what DIFFERS is below.

## Overview

- Spell's brand, and the work of bringing it into Spell UI (epic `design-system`,
  `packages/docs/epics/design-system/design-system.html`).
- `spell-design-system/` -- Claude Design's output, AS EXPORTED:  `readme.md` (the brand rules), tokens, logo
  assets, and 13 top-level `*.dc.html` pages.
  - NEVER edit Claude Design's files:  they're the reference the copies are measured against, and Claude Design may
    export over them.
  - A `.dc.html` page is an `<x-dc>` template that `support.js` (Claude Design's runtime, generated) compiles into
    React at load.  React and Font Awesome come from CDNs;  four pages also fetch local files, so they need the page
    server.
  - The `sp-*` classes in `components/components.css` and the React wrappers in `components/*/` are used only by the
    specimen cards, never by the 13 pages (all inline styles).
- `*.spell.html` -- beside each `.dc.html`, its copy on Spell UI:  same name, `.spell.html`
  (`Brand Montage.dc.html` -> `Brand Montage.spell.html`).
- `index.html` -- the Brand tab's home page:  every page, with Original / Spell / Compare links.
- `compare.html?page=<Name>` -- an original and its copy side by side, or one over the other.
- `_assets/` -- the brand pages' own assets:
  - `brand-pages.js` / `.css` -- the index and Compare (classic script, on the docs bundle).  Its `PAGES` list is
    THE list of pages;  flip a page's `built` to `true` in the change that adds its `.spell.html`.
  - `ui/` -- GENERATED, committed:  the copies' bundle, `brand-ui.js` + `brand-ui.css` + lazy chunks (`yarn build`);
    `icon-packs` a symlink to Spell UI's.  NEVER edit.
- `src/` (`$/brand`) -- shared code, and the bundle's entry `brand-ui.ts` (what's in it and why).
- `components/` (`$/brand/components`) -- the `<ui-brand-*>` elements, one folder per family, written exactly like
  a Spell UI family (`packages/ui/AGENTS.md`, "Solid authoring"), importing shared code from `$/ui/core` /
  `$/ui/forms`.  Generic ones move into Spell UI later (epic decision D2).  `components.spell.html`:  the specimen page.
- `scripts/` -- `build.ts` (the bundle) and `compare.ts` (screenshot diffs).
- `leonardo/` -- the original reference images and brief, from before Claude Design.

## A `.spell.html` copy

- Beside its original, same name.  Loads `../_assets/ui/brand-ui.css` and, as a MODULE, `../_assets/ui/brand-ui.js`:
  from the page server only, not `file://`.
- Starts its `<body>` with `<spell-site-header root="../../..">`.
- Colours, fonts, radii and shadows ONLY from the theme's tokens:  `--ui-*`, and the brand roles `--spell-*`
  (`spell-brand.css`, "Brand roles":  `--spell-surface-warm`, `--spell-type-eyebrow` ...), so dark mode works.
- Dark mode:  Spell UI's `color-scheme` (`ui-dark` on `<html>`), never the brand's `data-theme`.
- Anything the theme can't do:  the plan doc's "What the theme can't do today" table, and an issue.

## Commands

- `yarn build` -- the copies' bundle, `_assets/ui/` (commit it);  rerun after changing `components/`, `src/`, or
  Spell UI source the pages use.
- `yarn compare [<page>...] [--width 1280] [--height 900] [--dark] [--full]` -- screenshots each original and its
  copy, and a diff % per page, into `.compare/` (git-ignored):  `dc.png`, `spell.png`, `side.png`, `diff.png`,
  `report.md`.  A rough guide:  LOOK at `side.png` or the Compare view.
- `yarn ts`, `yarn format`.

## Serving

- The page server serves the repo at `/`, so these pages are at `/packages/brand/...`;  the site header's Brand tab
  (`PROPERTIES` in `packages/server/src/site/site.types.ts`) lands on `index.html`.
- Live reload:  `packages/brand` is in the root `package.json`'s `pageServer.watch`.
- File names with spaces are fine:  links write them `Brand%20Montage.spell.html`.
