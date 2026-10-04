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
- `_assets/` -- the brand pages' own scripts (`brand-pages.js`:  the index and Compare behaviour).
- `leonardo/` -- the original reference images and brief, from before Claude Design.

## Serving

- The page server serves the repo at `/`, so these pages are at `/packages/brand/...`;  the site header's Brand tab
  (`PROPERTIES` in `packages/server/src/site/site.types.ts`) lands on `index.html`.
- Live reload:  `packages/brand` is in the root `package.json`'s `pageServer.watch`.
- File names with spaces are fine:  links write them `Brand%20Montage.spell.html`.
