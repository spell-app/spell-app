# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/epics`.

**READ the repo root's [AGENTS.md](../../AGENTS.md) and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
the repo's layout, and the house style every package shares.
Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- A COMPONENT PACK:  `<epic-*>` custom elements, written as Spell UI families,
  that a page loads on demand through `<ui-root>`.
  - The page's `<ui-components source>` names the pack's script:

  ```html
  <ui-root>
    <ui-components source="../../packages/epics/pack/epics.pack.js"></ui-components>
    <epic-...> ... </epic-...>
  </ui-root>
  ```

- Made by `spell dev pack new epics --prefix epic-`.
  - Its tooling is the CLI's (`spell dev pack`, the `pack*.ts` files in [the CLI's dev folder](../cli/src/dev/)),
    so every pack builds and checks the same way.
- `components/<tag>/` (`$/epics/components`) -- one folder per element family.
  - Written exactly like a Spell UI family:
    [ui's AGENTS.md](../ui/AGENTS.md), "Overview" and "Solid authoring".
  - Every file named for its COMPONENT:
    - `<Name>.tsx` (the component, on `E.UIComponent`)
    - `<Name>.en.ts` (its tag's vocabulary:  topics + aka, skeleton text)
    - `<Name>.css`, `<Name>.test.tsx`, `<Name>.types.ts` (only what several of its files share)
    - `index.ts` (defines its tags:  SIDE EFFECT)
  - No native fallback:  only form controls have one.
  - A new one:  `spell dev pack element epics <tag>`, the tag starting `epic-`.
  - Every component is a family, as in Spell UI (P10 of epic `spell-element`).
    - No exported function components.
    - The lint rules hold them to it (`yarn lint`).
      They flag a hand-written effect, observer, listener, `untrack()` or timer,
      and an exported function component.
    - Those rules:  [ui's AGENTS.md](../ui/AGENTS.md), "Solid authoring", "The lint guard".
  - A piece several families draw is a family of its own.
    - It's drawn in their shadow roots, and never written in a doc.
    - Those pieces:  `<epic-review>`, `<epic-new-item>`, `<epic-agents>`.
    - Each family that draws one imports its barrel first,
      so it's defined wherever they are.
    - Unless it can't be a tag.
      The fold button and chevron every fold draws are methods of `Fold`:  `fold.button()`, `Fold.chevron()`.
      - The button is named by ids in the card's own shadow root.
      - The chevron shows in the first frame.
- `src/` (`$/epics`, `EP`) -- code the elements and the node tools share.
  Also `pack.test.ts`, which runs `spell dev pack check epics`.
  - `definitions/` -- the ONE description of every element:
    - `Definitions.all`:  each vocabulary as data, plus `children` (the content model)
    - Node-safe:  imports vocabulary files, never a family's barrel.
  - `markup/` -- `Markup` (make, read, set, append) and `MarkupCheck` (validate a doc).
    On linkedom, or the browser's DOM.
  - `dates/` -- `PlanDates`:  every date an element draws, `10/8/26 14:34` (`10/8/26` for a day),
    from whatever form the doc holds.
    - NOT the log's (`<epic-event>`).
    - A time alone (`saved 14:42`):  `PlanDates.clock()`.
  - `review/` -- `ReviewClient`, one per page:  the review inbox's reads and writes (`/api/review/*`).
    - Also token refresh, polling, and note-draft backups (the old page runtime's localStorage keys).
    - It touches no browser global until `forPage()` / `watch()`.
    - Used by:
      - `<epic-review>`:  the review controls `<epic-item>`, `<epic-section>` (Overview parts),
        `<epic-phase>` and `<epic-summary>` draw
      - `<epic-new-item>`:  `<epic-page>`'s toolbar button, and the Todos and Questions sections' New todo / question
      - `<epic-option>`'s Choose pill
      - The controls show while `<epic-page reviewing>` is set.
    - `AgentsClient`, one per page:  the epic's running agents, and Owen's redirects.
      - Served at `/api/agents`, by [agentRoutes.ts](../docs/tools/agentRoutes.ts) in the docs tools.
      - `<epic-page>` draws them as its "Agents running" panel:
        `<epic-agents>`, in its shadow root, before its blocks (not a section).
      - Both clients POST and watch through the same code, a `ServerLink` each:
        the token, its one refresh on a 403, the poll and `spell-server:file`.
  - `answers/` (`$/epics/answers`) -- the pages Claude makes for Owen to answer ON (epic `epic-workflow` P12),
    as their elements keep them;  no Solid, no Spell UI, node-safe at import:
    - `AnswerForm`, one per details page:  the questions (`<epic-ask>`) and boxes (`<epic-text-box>`) register while
      connected;  it gathers the answer, sends it (`POST /api/details/answer`, through a `ServerLink`), reads it back
      on load, and says where it stands for `<epic-send>`
      - and its DRAFT (P18):  what's typed and not sent, kept by id at once (`typed`), in `localStorage` at once, and
        on the page server 2s later (`POST /api/details/draft`);  put back on load over the answer, and into a part
        that joins later (an agent's rewrite, patched in place);  text whose id leaves the page is KEPT (`kept`),
        drawn by the notes box and sent with the rest
      - each part says the ids it holds, with their titles (`labelsInto()`), so kept text keeps its old title
      - `AnswerDraft`:  the rules, pure (what's laid over what, what's kept, which draft is newest)
    - `ChoicesForm`, one per choice page:  the rows (`<epic-choice-row>`) register;  the draft every 5s and
      as the page goes away, "Do it" (`/api/choices/*`), and bringing both back, for `<epic-choices-bar>`
    - the answers' shapes are copies of the docs routes' (`detailsRoutes.ts`, `choicesRoutes.ts`):  `epics` never
      imports `docs`
    - The elements:  `<epic-ask>`, `<epic-text-box>`, `<epic-send>`, `<epic-choice-rows>` / `<epic-choice-row>`,
      `<epic-choices-bar>`;  and `<epic-option>`'s answering mode, an option of an `<epic-ask>` (a tick box, a
      comment box).  Their pages:  Epic UI's "Pages Owen answers on".
    - `<epic-text-box>` is written in pages (the notes, a section's comment) AND drawn by others in their shadow
      roots (Other, an option's comment, the feedback):  each family drawing it imports its barrel first.
  - `links/` (`$/epics/links`) -- pointing at a saga, an epic, a phase or an item (epic `epic-workflow` P15, J32);
    pure, node-safe at import, NOT in the `$/epics` barrel (the docs runtime imports it alone):
    - `EpicAddress`:  a short address (`SAGA:/drawable-spell/python-target#T1`, the colon form read too) or
      `<epic-link>`'s attributes, as the page (`sagas/<s>/<s>.saga.html`, `epics/<e>/<e>.plan.html`), the `#id` and
      the short form a link draws;  phases by number or name (`findPhase()`);  the checkout's root URL of a page
    - `PageTargets`:  what one page's DOM holds to land on (ids, titles, phases in order, its `<epic-page saga>`),
      on the browser's DOM or linkedom's
    - used by `<epic-link>`, the docs runtime (`SAGA:/` links rewritten), and the tool's `EpicTargets`
  - `site/` -- `EpicUISite`:  the data of Epic UI, the elements' docs set (`packages/epic-components/`, at `/epic-ui/`;
    epic `epic-workflow` P10), in Spell UI's site shapes:
    - `_data/components.json`:  one entry per element from `Definitions.all`, filed by the set's hand-kept
      `_data/pages.json` groups (a new element:  under Other, `planned` until its page exists), plus the side column's
      own links;  `_data/search.json`:  every page's sections, for its search
    - written by `yarn site:data` ([its script](scripts/site-data.ts));  `EpicUISite.test.ts` fails while stale
  - `convert/` -- the converter, old markup => `<epic-*>` (`Converter`, `ConvertRun`).
    - A `ConversionProof` per doc:  every id, link target and word kept.
    - Every live doc was converted at the switch (P12 of epic `epic-components`).
    - It stays for a doc restored from an old backup, and writes only under `--out`.
  - `tool/` -- the `epic` tool (`epic`), node only, never bundled into the pack.
    - It reads and writes `<epic-*>` markup only (through `Markup`),
      and refuses a doc still in the old markup ("convert it first").
    - Its rules for a doc's DATA (ids, statuses, review marks, prose):  [PLAN-DOC.md](src/tool/PLAN-DOC.md)
    - `migrations/`:  the named, dated steps that bring an older epic page up to today's markup (`Migrations`),
      which `epic migrate` runs (`MigrateCommands`), by page kind (PLAN-DOC.md, "Migrations")
    - its template:  [plan.html](src/tool/templates/plan.html), in `tool/templates/`
    - the page server's review routes ([reviewRoutes.ts](src/tool/reviewRoutes.ts)) and what they call:
      `ReviewInbox` (the inbox file), and `ReviewStart`:  the pill's start, and WAKING the epic when Send or Do Now
      finds nobody listening (epic `epic-workflow` P16:  its session typed into, or a new session in its window)
    - the inboxes:  `ReviewInbox` (an epic page's marks and comments), `GuideInbox` (a docs page's comments and its
      Send:  epic `epic-workflow` P13), one shape of comment for both (`CommentList`)
    - `SeeAlso` (P13):  an epic's See Also, GATHERED from its files, never kept by hand
      - its guide (`<a slot="durable">`), its `details/` pages, every `guides/` page its page and parts link to
      - which epic a docs page belongs to (`ownerOf()`):  where that page's Send hands its comments
      - read by the page server (`GET /api/epics/pages`, `<epic-page>`'s See Also box;  docs' comments routes), by
        `epic inbox <name> wait` (a guide's Send wakes it), and by docs' `GuideChanges`
    - `EpicTargets` (P15):  what a link to a saga, an epic, a phase or an item finds in a checkout -- the page,
      the id, its title, what's broken (no saga, no page, no id, an epic under a saga it doesn't name)
      - read by the link check (`epic check`, docs' `doc-links.js --check`:  `problemsIn()`), the openers
        (`spell dev docs link SAGA:/...`) and the page server:  [linkRoutes.ts](src/tool/linkRoutes.ts),
        `GET /api/epics/target` (`<epic-link>`'s title and short form) and the typed `/saga/<saga>[/<epic>]`
    - The old hand-written prose shapes have ONE set of rules, `ProseShapes`:
      a `Net effect` paragraph, a code accordion, an option grid ...
      - `ProseRewrite` turns them into elements,
        for the tool's way in (`IncomingHtml`) and the converter's second pass alike.
- `pack/` -- GENERATED, committed (`spell dev pack build epics`, `yarn pack:build`).  NEVER edit:
  - `epics.catalog.ts` -- tag => family folder + skeleton, read from the vocabularies.
    Its second line records the hash of the sources it was built from.
  - `epics.entry.ts` -- the script's entry:
    `SpellUI.registerPack({ name, prefix, catalog, define })`, where `define()` imports every family barrel
  - `epics.pack.js` -- the CLASSIC script (an IIFE) a page loads, minified
    - Solid and Spell UI's shared modules are NOT in it:
      `solid-js`, `@solidjs/web`, `$/ui/core`, `$/ui/forms`.
    - It takes them from `globalThis.SpellUI.packModules`, the docs bundle's,
      so a page has ONE Solid and one `UIComponent`.

## Rules

- Change an element -- its vocabulary above all, or any file under `components/` or `src/` --
  then `spell dev pack build epics` (`yarn pack:build`), and commit `pack/` in the same change.
  - `yarn pack:check` exits 1 while `pack/` is stale, and the pack's test (`pack.test.ts`) runs it:
    so `yarn test` and `yarn review` fail until you build.
- Elements import Spell UI's code ONLY from `$/ui/core` / `$/ui/forms` (as a Spell UI family does),
  and Solid from `solid-js` / `@solidjs/web`.
  - The build fails on any other `$/ui/...` or Solid import, which the page couldn't share.
  - Another shared module:
    add it to Spell UI's `packModules` AND to `PACK_MODULES`, in [packBuild.ts](../cli/src/dev/packBuild.ts).
- Every tag starts `epic-`:  `<ui-root>` knows the pack's tags by that prefix.
- Every sheet NAME starts `epic-` too:  `elementSetup = { styleSheets: { "epic-item": itemCSS } }`.
  - Spell UI keeps ONE sheet per name for the whole page, and the first class to register a name wins.
  - So a bare `item` drew `<epic-item>` with `<ui-item>`'s sheet, on any page that had both (I9).
  - [The barrel's test](components/index.test.tsx) checks every class the barrel exports.
- A change to epic page markup (what the tool writes, or what an element reads) adds its MIGRATION STEP in the SAME
  commit (epic `epic-workflow` P8):  a class in [migrations/](src/tool/migrations/), last in `Migrations.all`, with
  its test.  Another page kind's markup:  its step in the docs tool's `STEPS` ([migrate.js](../docs/tools/migrate.js)).
  - Then `epic migrate --all --dry-run` to see what it would change, and once it's on `main`,
    `epic migrate --all --notify`:  idle epics are migrated, running ones are told (the epic skill's
    "Migrations" says what the receiving session does).
  - How a step is written:  [PLAN-DOC.md](src/tool/PLAN-DOC.md), "Migrations".
- Every element has a page in Epic UI, [`packages/epic-components/`](../epic-components/README.md), served at
  `/epic-ui/` (epic `epic-workflow` P10):  change it in the SAME commit as the element, then `yarn site:data`.
  - Its pages are tracked here, per branch:  a worktree's show at `/worktrees/<w>/epic-ui/` until it merges.
- A pack drawn by pages EVERY checkout shows (the shared `epics/`, `guides/` ...):
  those pages load `main`'s `pack/`, through the main checkout's page server.  So:
  - small fixes straight on `main`
  - real changes in a worktree, merged promptly:  until then, those pages show `main`'s elements

## Commands

- `yarn pack:build` ~== `spell dev pack build epics` -- the catalog, the entry and the script, into `pack/`
- `yarn pack:check` ~== `spell dev pack check epics` -- exits 1 while `pack/` is stale
- `yarn site:data [--check]` -- Epic UI's data (`src/site/EpicUISite.ts`, `scripts/site-data.ts`):  rerun after
  changing an element or a page's sections, and commit `packages/epic-components/_data/`
- `yarn test` -- `node` (`src/`) and `browser` (`components/`, chromium);
  the root's `yarn test` runs them as `epics:node` / `epics:browser`
- `yarn ts`, `yarn lint`, `yarn format`, `yarn review`
