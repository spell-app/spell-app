# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/brand`.

**Root conventions apply:  READ the repo root's `AGENTS.md` and [WWOD](../../agents/wwod/WWOD.md) FIRST.**
- the root's:  the repo's layout
- WWOD:  the house style every package shares (comments, functions, types / exports, imports ...)
- Only what DIFFERS is below.

## Overview

- This package is Spell's brand, and the work of bringing it into Spell UI.
  - epic `design-system`:  [its epic page](../../../spell-app.epics/epics/design-system/design-system.plan.html)
  - its elements in Claude Design:  epic `claude-design`, P11
- READ FIRST for the big picture:  the guide, [the design system guide](../../../spell-app.epics/guides/design-system/design-system.html).
  - the Brand tab and Compare
  - the `spell-brand` theme and its brand roles
  - every element, making a copy, its limits
- A COMPONENT PACK (epic `people-and-orgs` P18, Q26):  its elements are `<brand-*>`.
  - A page loads them through `<ui-root>`, as it loads the epics pack's ([ui's AGENTS.md](../ui/AGENTS.md), "Component packs").
  - They were `<ui-brand-*>`, Spell UI's prefix, before P18.
  - Made one by `spell dev pack new brand --prefix brand-`.
    The pack's tooling is the CLI's (`spell dev pack`).
- Two halves (epic `claude-design`, P11, 2026-10-05):
  - The Brand tab's PAGES are shared, in the repo root's `brand/`.
    - It's a link into spell-app-dev, the same in every checkout (the root's `AGENTS.md`, "Shared content").
    - Edit them at their real path, `/Users/owen/www/spell-app/spell-app-dev/brand/`.
    - Never commit them.
  - The CODE stays here, tracked:
    - the elements (`components/<tag>/`), `src/`, `scripts/`, `_assets/`, configs
    - the elements' own docs pages, `docs/` (P18:  they live with the code they describe, per branch)
  - So a Brand tab page links this package's files from one folder deeper than before:

    ```text
    from brand/                       ../packages/brand/_assets/...
    from brand/spell-design-system/   ../../packages/brand/_assets/...
    ```
- `brand/spell-design-system/` (shared):  Claude Design's output, AS EXPORTED.
  - `readme.md` (the brand rules), tokens, logo assets, and 13 top-level `*.dc.html` pages
  - NEVER edit Claude Design's files.
    - They're the reference the copies are measured against.
    - Claude Design may export over them.
  - A `.dc.html` page is an `<x-dc>` template, compiled into React at load by `support.js`.
    - `support.js` is Claude Design's runtime, generated.
    - React and Font Awesome come from CDNs.
    - Four pages also fetch local files, so they need the page server.
  - Used only by the specimen cards, never by the 13 pages (all inline styles):
    - the `sp-*` classes, in its components sheet (`components.css`, in `components/`)
    - the React wrappers, in `components/*/`
- The copies on Spell UI (shared):  beside each `.dc.html`, its `.spell.html`, same name.
  - e.g. `Brand Montage.dc.html` -> `Brand Montage.spell.html`
- [The Brand tab's home page](../../../spell-app.epics/brand/index.html) (shared):
  - every page, with Original / Spell / Compare links
  - the elements
  - every other page in `brand/`, e.g. ones pulled from Claude Design (written by `spell dev docs index`)
- `brand/compare.html?page=<Name>` (shared):  an original and its copy, side by side, or one over the other.
- `_assets/`:  the brand pages' own assets.
  - `brand-pages.js` / `.css`:  the index and Compare (a classic script, on the docs bundle).
    - Its `PAGES` list is THE list of pages.
    - In the change that adds a page's `.spell.html`, flip its `built` to `true`.
  - `ui/`:  GENERATED, NOT committed.
    - Git-ignored since 2026-10-07:  its hashed chunk names churned every diff.
    - It's the copies' bundle (`yarn build`):  `brand-ui.js`, its CSS and lazy chunks.
    - `icon-packs` is a symlink to Spell UI's.
    - The page server builds it when it starts, if stale (`spell dev bundles build --stale`).
      - That's `$/assembler`'s `Bundle`:  `.bundle.json` records the sources' hash.
    - NEVER edit.
- `docs/`:  Brand UI, the elements' docs set, served at `/components/brand/`.
  - A COMPONENT SET:  the root's `AGENTS.md`, "Packages".
  - One flat folder, in Spell UI's component page shape (Examples / Usage / API / Theming):
    - `index.html`:  the set's home, with the specimen that was the shared `components.spell.html`
    - one page per family, `<tag>.html`
    - Copied from the shared `brand/components/` at P18 (`ui-brand-<x>.html`).
      `yarn rename:shared` deletes those at the merge.
  - `__parts/`:  `layout.html` and `footer.html`.
    - The layout is every page's frame, as Epic UI's:  it loads the pack through `<ui-components source>`.
  - The page server lays Spell UI's sets bundle over the folder at `_assets/`:  a page loads its `site.js`.
    - The site swaps only a page's `main` between pages.
      So what an example needs, styles and scripts, goes INSIDE `main`.
    - A script adds its listeners once (`window.<flag>`), as the site runs it again.
  - `__data/`:
    - `pages.json5`:  HAND-KEPT.
      - Spell UI's per-family facts (title, summary, status)
      - the set's own `groups` (the side column's) and `nav` (its own links)
    - GENERATED, committed (`yarn site:data`):
      - `components.json5`:  the pages' API and tokens, and the design system's Brand cards
      - `search.json5`:  every page's sections, for the side column's search
      - VS Code autocomplete for `<brand-*>`, loaded by [the repo's VS Code settings](../../.vscode/settings.json):
        `custom-elements.json` and `html-custom-data.json`
- `src/` (`$/brand`, self-namespace `B`):  shared code.
  - `Palette`:  the brand's colour math, ported from Claude Design's palette script.
    - its source:  `palette.mjs`, in Claude Design's `lib/`
    - sRGB <-> OKLCH, contrast
    - `generateScale()`:  17-step ladders
    - `buildPalette()`
    - Its test pins it to Claude Design's palette data (`palette.json`, in `lib/`).
      - copied as `Palette.fixture.json`, beside the test in `tests/brand/src/`
      - why:  a test can't read the shared folder
  - `brand.types.ts`
  - the bundles' entries, each saying what's in it, and why:
    - `brand-ui.ts`
    - `brand-design.ts`
    - `hues.ts`
    - The old docs pages' bundle went at P18 (`brand-docs.ts`, with its `brand-docs.css`):
      the docs set loads Spell UI's site bundle and the pack instead.
- `components/` (`$/brand/components`):  the `<brand-*>` elements, one folder per family.
  - Written exactly like a Spell UI family ([ui's AGENTS.md](../ui/AGENTS.md), "Solid authoring").
  - Written on `$/spell-solid`:  `import { E } from "$/spell-solid"`.
    - Spell UI's shared code comes from `$/ui/core` / `$/ui/forms`.
    - A file using Spell UI's own pieces (`E.IconGlyph` ...) takes `E` from `$/ui/core` instead,
      which carries spell-solid's names too ([spell-solid's AGENTS.md](../spell-solid/AGENTS.md), "Imports").
  - `yarn lint` holds them to it:  the `spell-ui/*` rules (ui's "Solid authoring", "The lint guard").
  - Generic ones move into Spell UI later (epic decision D2).
  - `__pack/`:  GENERATED, committed (`spell dev pack build brand`, `yarn pack:build`).  NEVER edit:
    - `brand.catalog.ts`:  tag => family folder + skeleton, read from the vocabularies
      - its second line records the sources' hash
    - `brand.entry.ts`:  `SpellUI.registerPack({ name, prefix, catalog, define })`
    - `brand.pack.js`:  the CLASSIC script a page loads
      - Solid, spell-solid and Spell UI's shared modules are NOT in it (`SpellUI.packModules`)
  - A pack's events keep their own names:
    - the composer's own:  `brand-cast`
    - the ones Spell UI's controls send too keep Spell UI's (`ui-change`, `ui-input`, `ui-copy`),
      so a form and a page hear them the same way
- `scripts/`:
  - `build.ts`:  the bundle
  - `compare.ts`:  screenshot diffs
  - `site-data.ts`:  `docs/__data/`
  - `rename-shared.ts`:  the shared Brand tab pages' rename to `brand-`, once, at the merge (see "Commands")
- `vite.design.config.ts`:  the elements, built for the claude.ai design bundle.
  - The output:  `brand-design.js`, in `dist/` (git-ignored).
  - The design bundle's build runs it:  [bundle-spell-ui.js](../epics/tools/bundle-spell-ui.js) `--design`.
    That's `yarn design:bundle`, in epics.
- `brand/leonardo/` (shared):  the original reference images and brief, from before Claude Design.

## A `.spell.html` copy

- It sits beside its original, with the same name.
- It loads the copies' bundle, from the page server only, not `file://`:
  its CSS, and its script as a MODULE.

  ```html
  <link rel="stylesheet" href="../../packages/brand/_assets/ui/brand-ui.css" />
  <script type="module" src="../../packages/brand/_assets/ui/brand-ui.js"></script>
  ```

- It starts its `<body>` with `<spell-site-header root="../..">`.
- Colours, fonts, radii and shadows come ONLY from the theme's tokens, so dark mode works:
  - `--ui-*`
  - the brand roles, `--spell-*`:  `spell-brand.css`, "Brand roles"
    - e.g. `--spell-surface-warm`, `--spell-type-eyebrow`
- Dark mode:  Spell UI's `color-scheme` (`ui-dark` on `<html>`).
  Never the brand's `data-theme`.
- Anything the theme can't do:  the epic page's "What the theme can't do today" table, and an issue.
- Spell UI's "UI rules" ([ui's AGENTS.md](../ui/AGENTS.md)) apply to the pages and the `<brand-*>` elements too.
  - e.g. numeric fields right-aligned against their unit

## Commands

- `yarn build`:  the copies' bundle, `_assets/ui/` (git-ignored).
  - `spell dev bundles build brand` runs it, and records the sources' hash.
  - The page server rebuilds it when it starts, if any of these changed:
    `components/`, `src/`, or the Spell UI source it reads.
  - While the page server runs, rerun it by hand (or restart the page server).
- `yarn pack:build` ~== `spell dev pack build brand`:  the pack, `components/__pack/`.
  - then `yarn site:data`
  - `yarn pack:check` ~== `spell dev pack check brand`:  exits 1 while the pack or the docs data is stale.
  - [The pack's test](../../tests/brand/src/pack.test.ts) runs the check, so `yarn test` fails on a stale pack.
- `yarn site:data [--check]`:  the docs set's data, `docs/__data/` (see "Overview").
  - It's Spell UI's `SiteDataBuilder`, reading `components/`, made the set's:
    - flat page links
    - the set's groups as topics
    - its `nav`
  - It also writes the search file (the pages' sections) and the editor manifests (`ElementManifests`).
  - `--check`:  writes nothing, exits 1 while a file is stale.
  - Rerun it after a vocabulary, a sheet's tokens or a page's sections change, and commit what it writes.
  - Then `spell dev design build` picks the change up for claude.ai.
- `yarn rename:shared --shared <dir> [--dry-run]`:  the shared Brand tab pages' rename to `brand-`.
  - ONCE, as epic `people-and-orgs` merges into `main` (its todo T3)
  - `<dir>`:  the shared `brand/` folder.
  - Only the brand's own pages, never Claude Design's files:
    - `index.html`, `compare.html`, `README.md`
    - the `*.spell.html` copies
  - What it renames:  tags, tokens, `ui-cast`, and links to the old element pages (now `/components/brand/`).
  - Then it deletes the old pages' folder, `brand/components/`.
  - Idempotent.
- `yarn compare [<page>...] [--width 1280] [--height 900] [--dark] [--full]`:
  screenshots of each original and its copy, and a diff % per page.
  - into `.compare/` (git-ignored):  `dc.png`, `spell.png`, `side.png`, `diff.png`, `report.md`
  - A rough guide:  LOOK at `side.png`, or the Compare view (`/brand/compare.html`).
- `yarn test`:  two projects (`vitest.config.ts`), from the repo's `tests/brand/`, at the same paths as the code.
  - e.g. `BrandLogo`'s test:  [BrandLogo.test.tsx](../../tests/brand/components/brand-logo/BrandLogo.test.tsx)
  - `node`:  `src/`, `Palette.test.ts` and `pack.test.ts`
  - `browser`:  the elements, Vitest browser mode, chromium
    - with Spell UI's helpers:  `$/ui/test/ElementFixture`, `$/ui/test/a11y`
  - The root's `yarn test` runs them as `brand:node` / `brand:browser`.
- `yarn ts`, `yarn lint`, `yarn format`, `yarn review`.

## The elements

- Each family has a page in the docs set, `<tag>.html` in `docs/`, at `/components/brand/<tag>.html`.
  - Spell UI's components page shape:  masthead, then Examples / Usage / API / Theming tabs.
  - A new family:
    1. `spell dev pack element brand brand-<name>`
    2. fill in its vocabulary, `<Name>.en.ts` (topics, aka, description)
    3. `yarn pack:build`
    4. copy a page, and file it in the `groups` of [the hand-kept facts](docs/__data/pages.json5)
  - The set's home and side column list them.
  - NOTE:  its Theming tab's token table is EMPTY for now.
    - Spell UI's token readers (`FamilyTokens`, `ComponentTokens`) find only `--ui-*` tokens.
    - The brand's are `--brand-*` since P18 (people-and-orgs issue, at P18).
- The claude.ai design system shows each family as a card in its "Brand" group
  ([DesignBrand.ts](../ui/tools/DesignBrand.ts), epic `claude-design` P11).
  - its API:  from `components.json5` in `docs/__data/`
  - its examples:  from its docs page's Examples tab
    - each `<ui-docs-example>`, titled by its section, with the page's own styles
  - So an example there must work on its own:  no page script, no file to load.

- The inspector panel is Spell UI's now:  `<ui-panel>`, a `<ui-section>` subclass.
  - Its source:  [ui-panel](../ui/components/ui-panel/), moved from `<ui-brand-panel>` 2026-10-05.
  - Its docs page is Spell UI's:  `/components/ui/ui-panel.html`.
  - Its tokens are `--ui-panel-*`.
  - `color="accent"` works on the brand pages:  [hues.ts](src/hues.ts) + `spell-brand`.
- `<brand-field>` (`components/brand-field/`):  a form field.
  - a label row (label, actions, value, info tip), the control, help and error
  - `<ui-form>` validates it as a `<ui-field>`:  `:state(field)` + `showErrors()`
  - It names an unnamed slotted control after its `label` (`aria-label`).
- `<brand-composer>` (`components/brand-composer/`):  write a spell, and cast it.
  - a form element:  the text under `name`
  - `brand-cast` (cancelable), from the button or Cmd / Ctrl+Enter
  - `casting`, set by the page
  - `size="large"`, for a hero
- `<brand-checklist>` + `<brand-check>`:  round-marked lines, in one folder, `brand-checklist/`.
  - `step` drives build progress:  done / active / pending, announced
  - `checkable` makes each a checkbox
- `<brand-phone>` (`components/brand-phone/`):  a phone frame around a live preview.
  - a status bar;  `dimmed`
- Page art, brand-only (never moves into Spell UI):
  - `<brand-logo>`:  the logo outlined from P052, so it needs no font.
    - Its paths:  `logoPaths.ts`, `import()`ed on first use.
      Copied from Claude Design's `lockupPaths.js`, in `components/brand/`.
    - Use it, never an `<img>` of the SVGs.
  - `<brand-flourish>`:  drawn by `Flourish.ts`, a port of Claude Design's flourish script.
    - its source:  `spell-flourish.js`, in Claude Design's `lib/`
    - same variants, same seeded shapes
    - It fills its positioned parent.
  - `<brand-blob>`:  a corner blob.
    The parent must be positioned, and clip.

## Imports

As the root's, plus these reaches into `ui` past its barrel, each because the barrel can't give it
(until the elements move into Spell UI, epic todo T2):
- `$/ui/core` (and `$/ui/forms`):  Spell UI's half of the element authoring API, beside `$/spell-solid`'s.
  - Imported as a `ui` family imports it, through its namespaces:

    ```ts
    import { E, UI, UIT } from "$/ui/core"
    import { F } from "$/ui/forms"
    ```

  - then `E.IconGlyph`, `UI.browser`, `F.FormComponent` ...
  - `E.UIComponent` and `@E.state` are spell-solid's:
    a file that needs nothing more takes `E` from `$/spell-solid`
- the bundle entries (`src/`), as Spell UI's site entry does:
  - `$/ui/runtime`, `$/ui/icons`, `$/ui/styles`, `$/ui/styles/ui.css`
- [site-data.ts](scripts/site-data.ts):  Spell UI's site-data tools, and the site data's types
  - `$/ui/tools/SiteDataBuilder`
  - `$/ui/tools/SiteSearchBuilder`
  - `$/ui/tools/ElementManifests`
  - `$/ui/docs-components/docs-components.types`
- `$/ui/test/...`, in tests
- NEVER the other way:  `ui` imports nothing of `brand`.
  - Its design export (`DesignBrand`) READS the docs set's `components.json5` and its pages, as data.
- The pack's script may import only what a page shares (`PACK_MODULES` in the CLI's pack build):
  - `$/spell-solid`, `$/ui/core`, `$/ui/forms`, Solid
  - `$/brand` (`src/`) is bundled into it

## Serving

- The page server serves the repo at `/`.
  - So the Brand tab's pages are at `/brand/...`, and this package's files at `/packages/brand/...`.
  - The site header's Brand tab opens `/brand/index.html`, and lights on every page under `/brand/`.
    - Its entry:  `PROPERTIES`, in [site.types.ts](../server/src/site/site.types.ts).
  - The docs set, `docs/`, at `/components/brand/` (the page server's `componentSets` setting).
    - Spell UI's sets bundle is laid over it at `_assets/`.
    - `/brand/components/` (the old element pages) answers "not found".
- Live reload:  the root `package.json`'s `pageServer.watch` lists them:
  - `brand`:  the Brand tab's pages
  - `packages/brand`:  the bundles, the pack and the docs set
- File names with spaces are fine:  links write them `Brand%20Montage.spell.html`.
