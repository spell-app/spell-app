# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/brand`.

**Root conventions apply:  READ the repo root's `AGENTS.md` and [WWOD](../../agents/wwod/WWOD.md) FIRST.**
- the root's:  the repo's layout
- WWOD:  the house style every package shares (comments, functions, types / exports, imports ...)
- Only what DIFFERS is below.

## Overview

- This package is Spell's brand, and the work of bringing it into Spell UI.
  - epic `design-system`:  [its plan doc](../../epics/design-system/design-system.plan.html)
  - its elements in Claude Design:  epic `claude-design`, P11
- READ FIRST for the big picture:  the durable doc, [the design system guide](../../guides/design-system/design-system.html).
  - the Brand tab and Compare
  - the `spell-brand` theme and its brand roles
  - every element, making a copy, its limits
- Two halves (epic `claude-design`, P11, 2026-10-05):
  - The PAGES are shared, in the repo root's `brand/`.
    - It's a link into spell-app-dev, the same in every checkout (the root's `AGENTS.md`, "Shared content").
    - Edit them at their real path, `/Users/owen/www/spell-app/spell-app-dev/brand/`.
    - Never commit them.
  - The CODE stays here, tracked:  `components/<tag>/`, `src/`, `scripts/`, `_assets/`, `_data/`, configs.
  - So a page links this package's files from one folder deeper than before:
    - from `brand/`:  `../packages/brand/_assets/...`
    - from `brand/spell-design-system/` or `brand/components/`:  `../../packages/brand/_assets/...`
- `brand/spell-design-system/` (shared):  Claude Design's output, AS EXPORTED.
  - `readme.md` (the brand rules), tokens, logo assets, and 13 top-level `*.dc.html` pages
  - NEVER edit Claude Design's files.
    - They're the reference the copies are measured against.
    - Claude Design may export over them.
  - A `.dc.html` page is an `<x-dc>` template, which `support.js` compiles into React at load.
    - `support.js` is Claude Design's runtime, generated.
    - React and Font Awesome come from CDNs.
    - Four pages also fetch local files, so they need the page server.
  - Used only by the specimen cards, never by the 13 pages (all inline styles):
    - the `sp-*` classes, in `components.css` in `components/`
    - the React wrappers, in `components/*/`
- The copies on Spell UI (shared):  beside each `.dc.html`, its `.spell.html`, same name.
  - e.g. `Brand Montage.dc.html` -> `Brand Montage.spell.html`
- [The Brand tab's home page](../../brand/index.html) (shared):
  - every page, with Original / Spell / Compare links
  - the elements
  - every other page in `brand/`, e.g. ones pulled from Claude Design (written by `spell dev docs index`)
- `brand/compare.html?page=<Name>` (shared):  an original and its copy, side by side, or one over the other.
- `_assets/`:  the brand pages' own assets.
  - `brand-pages.js` / `.css`:  the index and Compare (a classic script, on the docs bundle).
    - Its `PAGES` list is THE list of pages.
    - Flip a page's `built` to `true` in the change that adds its `.spell.html`.
  - `ui/`:  GENERATED, NOT committed.
    - Git-ignored since 2026-10-07:  its hashed chunk names churned every diff.
    - It's the copies' bundle (`yarn build`):  `brand-ui.js` + `brand-ui.css` + lazy chunks.
    - `icon-packs` is a symlink to Spell UI's.
    - The page server builds it when it starts, if stale (`spell dev bundles build --stale`).
      - That's `$/assembler`'s `Bundle`:  `.bundle.json` records the sources' hash.
    - NEVER edit.
- `_data/`:  GENERATED, committed (`yarn site:data`).
  - `components.json`:  the docs pages' API and tokens, and the design system's Brand cards
  - `pages.json`:  hand-kept
  - `custom-elements.json` and `html-custom-data.json`:  VS Code autocomplete for `<ui-brand-*>`,
    loaded by [the repo's VS Code settings](../../.vscode/settings.json)
- `src/` (`$/brand`, self-namespace `B`):  shared code.
  - `Palette`:  the brand's colour math, from Claude Design's `palette.mjs` (in its `lib/`).
    - sRGB <-> OKLCH, contrast
    - `generateScale()`:  17-step ladders
    - `buildPalette()`
    - `Palette.test.ts` pins it to Claude Design's `palette.json` (in `lib/`), copied as `Palette.fixture.json`:
      a test can't read the shared folder.
  - `brand.types.ts`
  - the bundles' entries:  `brand-ui.ts`, `brand-docs.ts`, `brand-design.ts`, `hues.ts` (what's in each, and why)
- `components/` (`$/brand/components`):  the `<ui-brand-*>` elements, one folder per family.
  - Written exactly like a Spell UI family ([ui's AGENTS.md](../ui/AGENTS.md), "Solid authoring").
  - They import shared code from `$/ui/core` / `$/ui/forms`.
  - `yarn lint` holds them to it:  the `spell-ui/*` rules (ui's "Solid authoring", "The lint guard").
  - Generic ones move into Spell UI later (epic decision D2).
  - The specimen page:  [components.spell.html](../../brand/components/components.spell.html) (shared).
- `scripts/`:
  - `build.ts`:  the bundle
  - `compare.ts`:  screenshot diffs
  - `site-data.ts`:  `_data/`
- `vite.design.config.ts`:  the elements, built for the claude.ai design bundle.
  - The output:  `brand-design.js`, in `dist/` (git-ignored).
  - [bundle-spell-ui.js](../docs/tools/bundle-spell-ui.js) `--design` runs it (`yarn design:bundle`, in `packages/docs`).
- `brand/leonardo/` (shared):  the original reference images and brief, from before Claude Design.

## A `.spell.html` copy

- It sits beside its original, with the same name.
- It loads the copies' bundle, from the page server only, not `file://`:
  - `../../packages/brand/_assets/ui/brand-ui.css`
  - and, as a MODULE, `../../packages/brand/_assets/ui/brand-ui.js`
- It starts its `<body>` with `<spell-site-header root="../..">`.
- Colours, fonts, radii and shadows come ONLY from the theme's tokens, so dark mode works:
  - `--ui-*`
  - the brand roles, `--spell-*`:  `spell-brand.css`, "Brand roles" (`--spell-surface-warm`, `--spell-type-eyebrow` ...)
- Dark mode:  Spell UI's `color-scheme` (`ui-dark` on `<html>`), never the brand's `data-theme`.
- Anything the theme can't do:  the plan doc's "What the theme can't do today" table, and an issue.
- Spell UI's "UI rules" ([ui's AGENTS.md](../ui/AGENTS.md)) apply to the pages and the `<ui-brand-*>` elements too.
  - e.g. numeric fields right-aligned against their unit

## Commands

- `yarn build`:  the copies' bundle, `_assets/ui/` (git-ignored).
  - `spell dev bundles build brand` runs it, and records the sources' hash.
  - The page server rebuilds it when it starts, if any of these changed:
    `components/`, `src/`, or the Spell UI source it reads.
  - While the page server runs, rerun it by hand (or restart the page server).
- `yarn site:data`:  the elements' docs data, `components.json` in `_data/` (+ the hand-kept `pages.json`).
  - It's Spell UI's `SiteDataBuilder`, reading `components/`.
  - It also writes the editor manifests (`ElementManifests`).
  - Rerun it after a vocabulary or a sheet's tokens change, and commit all four.
  - Then `spell dev design build` picks the change up for claude.ai.
- `yarn compare [<page>...] [--width 1280] [--height 900] [--dark] [--full]`:
  screenshots of each original and its copy, and a diff % per page.
  - into `.compare/` (git-ignored):  `dc.png`, `spell.png`, `side.png`, `diff.png`, `report.md`
  - A rough guide:  LOOK at `side.png`, or the Compare view (`/brand/compare.html`).
- `yarn test`:  the elements' tests, in a real browser.
  - Vitest browser mode, chromium (`vitest.config.ts`)
  - with Spell UI's helpers:  `$/ui/test/ElementFixture`, `$/ui/test/a11y`
  - The root's `yarn test` runs them as `brand`.
- `yarn ts`, `yarn format`.

## The elements

- Each family has a docs page, `brand/components/<tag>.html` (shared), in Spell UI's docs format.
  - The format:  [the Spell UI docs template](../../templates/spell-ui-docs.html), with masthead and Examples / Usage / API / Theming tabs.
  - It loads, from here:
    - `brand-docs.js` in `_assets/ui/` (its entry:  [brand-docs.ts](src/brand-docs.ts))
    - `brand-docs.css` in `_assets/`
  - A new family:  its `UI<Name>.en.ts` (topics, aka, description), `yarn site:data`, then copy a page.
  - The Brand index lists them.
- The claude.ai design system shows each family as a card in its "Brand" group
  ([DesignBrand.ts](../ui/tools/DesignBrand.ts), epic `claude-design` P11).
  - its API:  from `components.json` in `_data/`
  - its examples:  from the docs page's Examples tab
    - `<ui-docs-example>`s, titled by their `<ui-section>`, with the page's own `<style>`s
  - So an example there must work on its own:  no page script, no file to load.

- The inspector panel is Spell UI's now:  `<ui-panel>`, a `<ui-section>` subclass.
  - Its source:  [ui-panel](../ui/src/components/ui-panel/), moved from `<ui-brand-panel>` 2026-10-05.
  - Its docs page is Spell UI's:  `/ui/components/ui-panel.html`.
  - Its tokens are `--ui-panel-*`.
  - `color="accent"` works on the brand pages:  [hues.ts](src/hues.ts) + `spell-brand`.
- `<ui-brand-field>` (`components/ui-brand-field/`):  a form field.
  - a label row (label, actions, value, info tip), the control, help and error
  - `:state(field)` + `showErrors()`, so `<ui-form>` validates it as a `<ui-field>`
  - It names an unnamed slotted control after its `label` (`aria-label`).
- `<ui-brand-composer>` (`components/ui-brand-composer/`):  write a spell, and cast it.
  - a form element:  the text under `name`
  - `ui-cast` (cancelable), from the button or Cmd / Ctrl+Enter
  - `casting`, set by the page
  - `size="large"`, for a hero
- `<ui-brand-checklist>` + `<ui-brand-check>` (`components/ui-brand-checklist/`):  round-marked lines.
  - `step` drives build progress:  done / active / pending, announced
  - `checkable` makes each a checkbox
- `<ui-brand-phone>` (`components/ui-brand-phone/`):  a phone frame (status bar, `dimmed`) around a live preview.
- Page art, brand-only (never moves into Spell UI):
  - `<ui-brand-logo>`:  the logo outlined from P052, so it needs no font.
    - Its paths:  `logoPaths.ts`, `import()`ed on first use.
      Copied from Claude Design's `lockupPaths.js`, in `components/brand/`.
    - Use it, never an `<img>` of the SVGs.
  - `<ui-brand-flourish>`:  `Flourish.ts`, a port of Claude Design's `spell-flourish.js` (in its `lib/`).
    - same variants, same seeded shapes
    - It fills its positioned parent.
  - `<ui-brand-blob>`:  a corner blob.
    The parent must be positioned, and clip.

## Imports

As the root's, plus these reaches into `ui` past its barrel, each because the barrel can't give it
(until the elements move into Spell UI, epic todo T2):
- `$/ui/core` (and `$/ui/forms`):  the element authoring API.
  - Imported as a `ui` family imports it, through its namespaces:
    `import { E, UI, UIT } from "$/ui/core"` (+ `import { F } from "$/ui/forms"`)
  - then `E.UIComponent`, `@E.state`, `@E.controlled("value")`, `F.FormComponent`
- the bundle entries (`src/`), as Spell UI's site entry does:
  - `$/ui/runtime`, `$/ui/icons`, `$/ui/styles`, `$/ui/styles/ui.css`
- `$/ui/docs-components/...`:  the docs widgets and `SiteData` ([brand-docs.ts](src/brand-docs.ts)).
  Not in `$/ui`'s barrel.
- `$/ui/tools/SiteDataBuilder` and `$/ui/tools/ElementManifests` ([site-data.ts](scripts/site-data.ts))
- `$/ui/test/...`, in tests
- NEVER the other way:  `ui` imports nothing of `brand`.
  - Its design export READS `components.json` (in `_data/`) and the docs pages, as data (`DesignBrand`).

## Serving

- The page server serves the repo at `/`.
  - So the pages are at `/brand/...`, and this package's files at `/packages/brand/...`.
  - The site header's Brand tab opens `/brand/index.html`, and lights on every page under `/brand/`.
    - Its entry:  `PROPERTIES`, in [site.types.ts](../server/src/site/site.types.ts).
- Live reload:  the root `package.json`'s `pageServer.watch` lists both:
  - `brand`:  the pages
  - `packages/brand`:  the bundles
- File names with spaces are fine:  links write them `Brand%20Montage.spell.html`.
