# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/epics`.

**READ the repo root's [AGENTS.md](../../AGENTS.md) and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
the repo's layout, and the house style every package shares.
Only what's local is below;  a section named like a WWOD rule extends it.

`$/epics` holds TWO things (Q23 of epic `people-and-orgs`, 2026-10-13):
- the epic pages' elements and tool:  the `<epic-*>` component pack, and `epic` ("Overview", "Rules", "Epic pages")
- EVERY docs page's tooling, not only the epics' ("Layout" onwards):
  `tools/`, the scripts and the `_assets` every page loads
  - That was the docs package (`@spell-app/docs`, its own folder in `packages/`) until P16 of `people-and-orgs`.
  - The pages themselves are shared root folders, tracked by no package (the root's `AGENTS.md`, "Shared content").

## Overview

- A COMPONENT PACK:  `<epic-*>` custom elements, written as Spell UI families,
  that a page loads on demand through `<ui-root>`.
  - The page's `<ui-components source>` names the pack's script:

  ```html
  <ui-root>
    <ui-components source="../../packages/epics/components/__pack/epics.pack.js"></ui-components>
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
    - `<Name>.tsx`:  the component, on [`$/spell-solid`](../spell-solid/AGENTS.md)'s `E.UIComponent`
    - `<Name>.en.ts`:  its tag's vocabulary (topics + aka, skeleton text)
    - `<Name>.css`
    - `<Name>.types.ts`:  only what several of its files share
    - its test, `<Name>.test.tsx`, at the same path in the repo's `tests/epics/`:
      `tests/epics/components/<tag>/`
    - `index.ts`:  defines its tags (SIDE EFFECT)
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
      The fold button and chevron every fold draws are methods of `Fold`:
      `fold.button()` and `Fold.chevron()`.
      - The button is named by ids in the card's own shadow root.
      - The chevron shows in the first frame.
  - Every element with a TITLE ROW has an `actions` slot in it (epic `epic-workflow` P25):
    `<epic-section>`, `<epic-overview>`, `<epic-phase>`, `<epic-item>`, `<epic-aside>`, `<epic-code>`, `<epic-update>`.
    - What a page puts there (`<ui-button slot="actions">`) sits after the title, before the element's own buttons.
    - The title (Owen, 2026-10-18, J183:  "ellipsis when collapsed, wrap when expanded"):
      - folded:  ONE line, cut with "…", its full text the tooltip (`title`)
      - open (or an item with nothing to unfold):  as many lines as it needs
      - a phase's plan-changed pen comes after it, never cut (`FoldPieces.mark`)
      - everything in the row sits on the title's FIRST line, so neither the title's first line nor a button moves
        as it switches (`--_epic-fold-line` in `EpicFold.css`;  the item's line was one-line cells already)
      - collapse-all still shows only while open, before the chevron, as it did:  it moves the buttons before it
      - NOT `<ui-section>` on guides:  their titles are short labels, and the tooltip would mean reaching into
        Spell UI's shadow root
    - A click on it never folds:  `CONTROLS` in `Fold.tsx` takes the slot and its box (`Fold.actions()`).
    - The slot, its child spec and its part:  [Fold.types.ts](components/epic-item/Fold.types.ts), which each
      vocabulary imports.
    - The docs runtime puts a block's bullhorn there (see "Comments").
    - NOT the cards with a heading band (a reply, a status card, a note ...):  nothing needs it there yet.
- `src/` (`$/epics`, `EP`) -- code the elements and the node tools share.
  - Its test, [pack.test.ts](../../tests/epics/src/pack.test.ts), runs `spell dev pack check epics`.
  - `definitions/` -- the ONE description of every element:
    - `Definitions.all`:  each vocabulary as data, plus `children` (the content model)
    - Node-safe:  imports vocabulary files, never a family's barrel.
  - `markup/` -- making, reading and checking a doc's markup, on linkedom or the browser's DOM.
    - `Markup`:  make, read, set, append
    - `MarkupCheck`:  validate a doc
  - `dates/` -- `PlanDates`:  every date an element draws, from whatever form the doc holds.
    - `10/8/26 14:34`;  `10/8/26` for a day
    - NOT the log's (`<epic-event>`).
    - A time alone (`saved 14:42`):  `PlanDates.clock()`.
  - `phases/` -- `PhaseIds`:  a phase's STABLE id and the number people see (epic `epic-workflow` P15).
    - The id is made once from the phase's name, `p-epic-migrate`, and kept through renames and inserts.
    - "P7" is its place in the list, worked out as it's drawn or printed:  never written, never its id.
    - Finding a phase as people name it (`7`, `P7`, its id, name or slug), and an old `#p7` landing on the 7th phase.
  - `review/` -- `ReviewClient`, one per page:  the review inbox's reads and writes (`/api/epics/review/*`).
    - Also token refresh, polling, and note-draft backups (the old page runtime's localStorage keys).
    - It touches no browser global until `forPage()` / `watch()`.
    - Used by:
      - `<epic-review>`:  the review controls drawn by items, sections (Overview parts), phases and the summary
        - `<epic-item>`, `<epic-section>`, `<epic-phase>`, `<epic-summary>`
      - `<epic-new-item>`:  the page's toolbar button, and the Todos and Questions sections' New todo / question
      - `<epic-option>`'s Choose pill
      - The controls show while `<epic-page reviewing>` is set.
    - `AgentsClient`, one per page:  the epic's running agents, and Owen's redirects.
      - Served at `/api/epics/agents`, by [agentRoutes.ts](tools/agentRoutes.ts), in the docs tools.
      - `<epic-page>` draws them as its "Agents running" panel:
        `<epic-agents>`, in its shadow root, before its blocks (not a section).
      - Both clients POST and watch through the same code, a `ServerLink` each:
        the token, its one refresh on a 403, the poll and `spell-server:file`.
  - `answers/` (`$/epics/answers`) -- the pages Claude makes for Owen to answer ON (epic `epic-workflow` P12),
    as their elements keep them.
    - No Solid, no Spell UI:  node-safe at import.
    - `AnswerForm`, one per details page:
      - the questions (`<epic-ask>`) and boxes (`<epic-text-box>`) register while connected
      - it gathers the answer, sends it (`POST /api/docs/details/answer`, through a `ServerLink`),
        reads it back on load, and says where it stands for `<epic-send>`
      - and its DRAFT (P18):  what's typed and not sent
        - kept by id at once (`typed`), in `localStorage` at once, and on the page server 2s later
          (`POST /api/docs/details/draft`)
        - put back on load over the answer, and into a part that joins later (an agent's rewrite, patched in place)
        - text whose id leaves the page is KEPT (`kept`):  drawn by the notes box, and sent with the rest
      - each part says the ids it holds, with their titles (`labelsInto()`), so kept text keeps its old title
      - `AnswerDraft`:  the rules, pure (what's laid over what, what's kept, which draft is newest)
    - `ChoicesForm`, one per choice page:
      - the rows (`<epic-choice-row>`) register
      - the draft every 5s and as the page goes away, "Do it" (`/api/docs/choices/*`), and bringing both back,
        for `<epic-choices-bar>`
    - the answers' shapes are copies of the docs tools' routes':
      [detailsRoutes.ts](tools/detailsRoutes.ts), [choicesRoutes.ts](tools/choicesRoutes.ts)
    - The elements:
      - `<epic-ask>`, `<epic-text-box>`, `<epic-send>`, `<epic-choice-rows>` / `<epic-choice-row>`, `<epic-choices-bar>`
      - and `<epic-option>`'s answering mode, an option of an `<epic-ask>` (a tick box, a comment box)
      - Their pages:  Epic UI's "Pages Owen answers on".
    - `<epic-text-box>` is written in pages (the notes, a section's comment)
      AND drawn by others in their shadow roots (Other, an option's comment, the feedback).
      - Each family drawing it imports its barrel first.
  - `links/` (`$/epics/links`) -- pointing at a saga, an epic, a phase or an item (epic `epic-workflow` P15, J32).
    - pure, node-safe at import, NOT in the `$/epics` barrel (the docs runtime imports it alone)
    - `EpicAddress`:  a short address (`SAGA:/drawable-spell/python-target#T1`, the colon form read too)
      or `<epic-link>`'s attributes, as the page (`sagas/<s>/<s>.saga.html`, `epics/<e>/<e>.plan.html`),
      the `#id` and the short form a link draws
      - phases by number or name (`findPhase()`);  the checkout's root URL of a page
    - `PageTargets`:  what one page's DOM holds to land on (ids, titles, phases in order, its `<epic-page saga>`),
      on the browser's DOM or linkedom's
    - used by `<epic-link>`, the docs runtime (`SAGA:/` links rewritten), and the tool's `EpicTargets`
  - `site/` -- `EpicUISite`:  the data of Epic UI, the elements' docs set, in Spell UI's site shapes.
    - the set:  `docs/`, at `/components/epics/` (see "Epic UI, the docs set")
    - `components.json5`, in `__data/`:  one entry per element from `Definitions.all`, plus the side column's own links
      - filed by the groups in the set's hand-kept `pages.json5`
      - a new element:  under Other, `planned` until its page exists
    - `search.json5`, in `__data/`:  every page's sections, for its search
    - written by `yarn site:data` ([its script](scripts/site-data.ts));  `EpicUISite.test.ts` fails while stale
  - `list/` -- [the Epics list](../../epics/index.html), out of the page server since P16 of `people-and-orgs`:
    - `EpicState`:  an epic's state, the ONE rule every list and page draws it by
    - `EpicCards`:  the list's cards and groups, drawn alike by `spell dev docs index` and the page server
      - each card's saga label, and the saga chips above the groups (epic `epic-workflow` P15):  the sagas come from
        the caller (`docs index`);  `RunningEpics` takes a running card's saga from the written card's `data-saga*`
      - `docs index`:  [index.js](tools/index.js)
    - `RunningEpics`:  the running epics, still in their worktrees, on the main checkout's page server
    - [runningRoutes.ts](src/list/runningRoutes.ts):  its route module
      - `GET /api/epics/running`
      - the list page's running cards, as it's served
    - `EpicState` and `EpicCards` load in plain `node` too (`docs index`):  their headers say what that forbids
  - `data/` -- `DataFile`:  the tooling's DATA FILES in the shared folders, as JSON5 (epic `epic-workflow` P21).
    - review inboxes, details pages' answers and drafts, choice pages' rows, running agents, the docs home's lists
      (`home.json5`, `favorites.json5`), the sagas' list, the commands page's data
    - written keeping a comment Owen adds by hand:  spaces' `json5Edited()` (json5-writer), laid out as
      `JSON.stringify()` would, in JSON5's JSON-compatible part (keys and text in double quotes)
    - read by the `.json5` name first, then the old `.json`, written as `.json5` only (the old `.json` removed):
      a checkout on older code keeps reading its files until it merges, and `epic migrate` renames the rest
      (`json5-data-files`, and the docs tool's data files pass)
    - node only, NOT in the `$/epics` barrel;  loads in plain `node` too (the docs tools' `details.js` ...):  it
      imports spaces' editor by its relative path
  - `convert/` -- the converter, old markup => `<epic-*>` (`Converter`, `ConvertRun`).
    - A `ConversionProof` per doc:  every id, link target and word kept.
    - Every live doc was converted at the switch (P12 of epic `epic-components`).
    - It stays for a doc restored from an old backup, and writes only under `--out`.
  - `tool/` -- the `epic` tool (`epic`), node only, never bundled into the pack.
    - It reads and writes `<epic-*>` markup only (through `Markup`),
      and refuses a doc still in the old markup ("convert it first").
    - Its rules for a doc's DATA (ids, statuses, review marks, prose):  [PLAN-DOC.md](src/tool/PLAN-DOC.md)
    - `migrations/`:  the named, dated steps that bring an older epic page up to today's markup (`Migrations`)
      - `epic migrate` runs them, by page kind (`MigrateCommands`;  PLAN-DOC.md, "Migrations")
    - its template:  [plan.html](src/tool/templates/plan.html), in `tool/templates/`
    - SAGA PAGES (epic `epic-workflow` P15):  `sagas/<id>/<id>.saga.html`, an epic page of kind "saga"
      (`<epic-page kind="saga" saga="<id>">`), so every verb edits it, named `SAGA:/<id>` (`PlanDocFiles.findDoc()`)
      - made by `epic saga page <id> [--force]` (`SagaPage`) from [saga.html](src/tool/templates/saga.html):
        its Overview (the saga's purpose, Done so far, Ideas not done yet), Epics, Questions, Todos, Log;  one file
      - its Epics:  `<epic-cards saga>`, the epics whose page names the saga, drawn from the page server
        (`GET /api/epics/saga`, `SagaEpics`), asked again as epic pages change
      - reviewed as an epic page is:  marks and comments in its own inbox beside it (`ReviewInbox.pathFor()`), the
        review routes and comments routes take it (`SAGA_PAGE`), and its Send wakes `/epic review SAGA:/<id>`
    - the page server's review routes ([reviewRoutes.ts](src/tool/reviewRoutes.ts)) and what they call:
      - `ReviewInbox`:  the inbox file
      - `ReviewStart`:  the pill's start, and WAKING the epic when Send or Do Now finds nobody listening
        (epic `epic-workflow` P16:  its session typed into, or a new session in its window)
    - the inboxes, one shape of comment for both (`CommentList`):
      - `ReviewInbox`:  an epic page's marks and comments
      - `GuideInbox`:  a docs page's comments and its Send (epic `epic-workflow` P13)
    - SAGAS (P15):  `Sagas`, the shared list in Owen's order (`sagas/sagas.json5`, node only, loaded by path by the
      docs index too), and each guide's saga meta (`guides()`, `sagaOf()`, `withSaga()`)
      - `SagaCommands`:  `epic saga list | set | new | move | title | rename | page`
      - `epicRoutes`' `GET /api/epics/pages` answers the epic's saga too (`<epic-page>`'s meta line)
    - `SeeAlso` (P13):  an epic's See Also, GATHERED from its files, never kept by hand
      - its guide (`<a slot="durable">`), its `details/` pages, every `guides/` page its page and parts link to
      - which epic a docs page belongs to (`ownerOf()`):  where that page's Send hands its comments
      - read by:
        - the page server:  `GET /api/epics/pages` (`<epic-page>`'s See Also box), and the docs tools' comments routes
        - `epic inbox <name> wait`:  a guide's Send wakes it
        - the docs tools' `GuideChanges`
    - `EpicTargets` (P15):  what a link to a saga, an epic, a phase or an item finds in a checkout
      - the page, the id, its title, what's broken (no saga, no page, no id, an epic under a saga it doesn't name)
      - read by:
        - the link check (`epic check`, the docs tools' `doc-links.js --check`:  `problemsIn()`)
        - the openers (`spell dev docs link SAGA:/...`)
        - the page server:  [linkRoutes.ts](src/tool/linkRoutes.ts), `GET /api/epics/target` (`<epic-link>`'s title
          and short form) and the typed `/saga/<saga>[/<epic>]`
    - The old hand-written prose shapes have ONE set of rules, `ProseShapes`:
      a `Net effect` paragraph, a code accordion, an option grid ...
      - `ProseRewrite` turns them into elements,
        for the tool's way in (`IncomingHtml`) and the converter's second pass alike.
- `components/__pack/` -- GENERATED, committed.  NEVER edit.
  - Built by `spell dev pack build epics` (`yarn pack:build`).
  - `pack/` until P18 of `people-and-orgs`:  every pack is built inside its families' folder, `__` marking it as no family.
  - `epics.catalog.ts` -- tag => family folder + skeleton, read from the vocabularies.
    Its second line records the hash of the sources it was built from.
  - `epics.entry.ts` -- the script's entry:
    `SpellUI.registerPack({ name, prefix, catalog, define })`, where `define()` imports every family barrel
  - `epics.pack.js` -- the CLASSIC script (an IIFE) a page loads, minified
    - Solid, spell-solid and Spell UI's shared modules are NOT in it:
      `solid-js`, `@solidjs/web`, `$/spell-solid`, `$/ui/core`, `$/ui/forms`.
    - It takes them from the docs bundle's `globalThis.SpellUI.packModules`,
      so a page has ONE Solid and one `UIComponent`.
      - `$/spell-solid` there is Spell UI's core, which carries it.
- `tools/` -- every docs page's tooling:  the scripts, their route modules, and `_assets/` (see "Layout", "Scripts").
  - Plain `node` scripts (`.js`) beside `tsx` ones (`.ts`).
    `tsconfig.json` takes both (`allowJs`).
  - The tools and `src/` import each other directly, by relative path.
  - Their tests:  in the repo's `tests/epics/tools/`, run by the `node` project (`yarn test`).

## Rules

- Change an element -- its vocabulary above all, or any file under `components/` or `src/` -- then:
  1. `spell dev pack build epics` (`yarn pack:build`)
  2. in the same change, commit the pack, `components/__pack/`, and the docs data the build writes too, `docs/__data/`
  - `yarn pack:check` exits 1 while either is stale, and the pack's test (`pack.test.ts`) runs it:
    so `yarn test` and `yarn review` fail until you build.
- Elements are written on `$/spell-solid`:  `import { E } from "$/spell-solid"` (`E.UIComponent`, `@E.state` ...).
  - A file that also uses Spell UI's own pieces (`E.IconGlyph`, `E.LoadableBody`, `E.Converters` ...)
    takes `E` from `$/ui/core` instead:  the same names, and Spell UI's on top (epic `people-and-orgs` P17).
- They import Spell UI's code ONLY from `$/ui/core` / `$/ui/forms`, as a Spell UI family does.
  - Solid only from `solid-js` / `@solidjs/web`.
  - The build fails on any other Spell UI, spell-solid or Solid import, which the page couldn't share:
    a deeper `$/ui/...` or `$/spell-solid/...`, say.
  - Another shared module:
    add it to Spell UI's `packModules` AND to `PACK_MODULES`, in [packBuild.ts](../cli/src/dev/packBuild.ts).
- Every tag starts `epic-`:  `<ui-root>` knows the pack's tags by that prefix.
- Every sheet NAME starts `epic-` too:  `elementSetup = { styleSheets: { "epic-item": itemCSS } }`.
  - Spell UI keeps ONE sheet per name for the whole page, and the first class to register a name wins.
  - So a bare `item` drew `<epic-item>` with `<ui-item>`'s sheet, on any page that had both (I9).
  - [The barrel's test](../../tests/epics/components/index.test.tsx) checks every class the barrel exports.
- The tooling's data files are JSON5, read and written through `DataFile` (`$/epics/data/DataFile`, see "Overview"):
  never `JSON.parse()` / `JSON.stringify()` on one, which would refuse or drop Owen's comments.
  - A new one:  `<name>.json5`, its path given to `DataFile`;  a browser reader drops comments before `JSON.parse()`
    (`commands.js`' `parseData()`).
- A change to epic page markup adds its MIGRATION STEP in the SAME commit (epic `epic-workflow` P8).
  - epic page markup:  what the tool writes, or what an element reads
  - the step:  a class in [migrations/](src/tool/migrations/), last in `Migrations.all`, with its test
  - another page kind's markup:  its step in the docs tools' `STEPS` ([migrate.js](tools/migrate.js))
  - Then `epic migrate --all --dry-run`, to see what it would change.
  - Once it's on `main`, `epic migrate --all --notify`:  idle epics are migrated, running ones are told.
    - What the receiving session does:  the epic skill's "Migrations".
  - How a step is written:  [PLAN-DOC.md](src/tool/PLAN-DOC.md), "Migrations".
- Every element has a page in Epic UI, [`docs/`](docs/index.html), served at `/components/epics/`.
  - Change it in the SAME commit as the element, then `yarn site:data` (see "Epic UI, the docs set").
  - Its pages are tracked here, per branch:  a worktree's show at `/worktrees/<w>/components/epics/` until it merges.
- A pack drawn by pages EVERY checkout shows (the shared `epics/`, `guides/` ...):
  those pages load `main`'s pack, through the main checkout's page server.  So:
  - small fixes straight on `main`
  - real changes in a worktree, merged promptly:  until then, those pages show `main`'s elements

## Commands

- `yarn pack:build` ~== `spell dev pack build epics`
  - the catalog, the entry and the script, into `components/__pack/`
  - then Epic UI's data, `docs/__data/` (`yarn site:data`)
- `yarn pack:check` ~== `spell dev pack check epics` -- exits 1 while either is stale
- `yarn site:data [--check]` -- Epic UI's data ([EpicUISite.ts](src/site/EpicUISite.ts), [its script](scripts/site-data.ts))
  - rerun after changing an element or a page's sections, and commit `docs/__data/`
- `yarn test` -- `node` (`src/`) and `browser` (`components/`, chromium)
  - the root's `yarn test` runs them as `epics:node` / `epics:browser`
- `yarn ts`, `yarn lint`, `yarn format`, `yarn review`
- the docs tools' own (see "Scripts"):

  ```text
  yarn docs:update | docs:index | docs:new | docs:open | docs:link   ~==  spell dev docs update | index | new | open | link
  yarn plan-doc,  yarn details
  yarn design:bundle,  yarn design:check
  ```

## Epic UI, the docs set

`docs/`:  the pages of the `<epic-*>` elements, a COMPONENT SET (epic `epic-workflow` P10).
Laid out as every set is since P18 of `people-and-orgs` (the root's `AGENTS.md`).
- Served by the page server (`COMPONENT_SETS`, [page.types.ts](../server/src/page/page.types.ts)):
  - at `/components/epics/`
  - and at `/worktrees/<w>/components/epics/` for a worktree's
  - The top bar's Epic/UI tab opens it.
  - Its folder's own address (`/packages/epics/docs/...`) is NOT a way in:
    its pages load their site bundle from `_assets/` beside them, which only the set's address has.
- Tracked and versioned with the branch, like code:  an element's page changes in the same commit as the element.
- In Spell UI's page shape:
  - the top bar, a side column of every element by group, the page's contents list, the theme switch
  - The pages load the sets' build of Spell UI's site (`_assets/`, laid over the folder by the page server).
    It loads the epics pack for the live examples.
- ONE flat folder:

  | Path | What |
  | --- | --- |
  | `index.html` | the set's home, The Epic Elements:  how they nest |
  | `<tag>.html` | one page per element, `epic-item.html`;  every page but the home is an element's |
  | `__parts/layout.html` | every page's chrome, written once:  the brand, the side column, the epics pack's `<ui-components>` |
  | `__parts/footer.html` | every page's footer |
  | `__data/pages.json5` | HAND-KEPT:  the side column's groups, the elements with no page, the side column's own links |
  | `__data/components.json5`, `__data/search.json5` | GENERATED, committed:  `yarn site:data` |

- A new page:
  1. copy a page like it, or the shared template once it's been moved on at the merge
     ([the component set docs template](../../templates/component-set-docs.html))
  2. `yarn site:data`
  - An element added to the pack shows in the side column by itself (under Other, `planned`) once the data is rebuilt.
- Links are written as from the page's SERVED address (`/components/epics/x.html`):

  ```text
  ../../                   the checkout's root
  x.html                   a sibling
  ../ui/ui-button.html     a Spell UI page
  ../app/spell-app.html    an App UI page
  ```

  - The layout and footer are served from `__parts/`:  one level deeper, `../../../` to the root.
  - `doc-links.js` checks them that way:  `yarn tsx tools/doc-links.js --check ../epics/docs/<tag>.html`.
- Check a page:  `node tools/check-spell.js docs/<tag>.html`, which loads it from the page server at its address.
- Comments:  the comment route takes them, but no bullhorn draws on these pages yet.
  - kept in `<page>.inbox.json5` beside a page, git-ignored
  - why no bullhorn:  they load Spell UI's site, not the docs bundle that draws them
- The epic's write-up and how-to guides stay in the shared guides:
  [Epic Pages as Components](../../guides/epic-components/epic-components.html),
  [Reviewing an Epic Page](../../guides/epic-components/review.html),
  [The Epic Tool](../../guides/epic-components/tool.html),
  [Epic Page Colours](../../guides/epic-components/colours.html).

## Layout

The pages live in SHARED root folders;  the tooling lives here, in `tools/`.
- epics `shared-content` and `claude-design` P4
- the tooling was in the docs package's own `tools/` until P16 of `people-and-orgs`
- The pages, epic pages and templates are root folders of every checkout.
  - Each is a folder link into the shared content repo, `../spell-app-dev`
    (the root's `AGENTS.md`, "Shared content").
  - They're NOT tracked by spell-app.
  - Page paths below are from the checkout's root, and so are page URLs (`/guides/solid/solid-2.html`).
  - One copy for every checkout:  an edit shows in every worktree at once, and never conflicts on merge.
  - Committed by itself after every Claude turn (the `Stop` hook):  never `git add` / commit a page by hand.
  - NEVER run git inside a shared folder:  it's the shared repo there.
    Tools run git in the spell-app checkout.
  - Before 2026-10-05 they were all in the docs package's `content/` folder.
    - Old-path links stay there in the shared repo, for checkouts on older code ([`reorgShared()`](tools/relocate.js)).
    - The old URLs answer "not found":  the page server redirects none (Q30 of `people-and-orgs`).
- `tools/`:  the tooling, tracked here and versioned per branch.
  - the scripts (see "Scripts")
  - their tests:  in the repo's `tests/epics/tools/`, by the same names ([fuss.test.ts](../../tests/epics/tools/fuss.test.ts))
  - `_assets/`
  - Run a script from `packages/epics`, or through its `yarn` script:

    ```sh
    node tools/check-spell.js guides/x.html
    ```

  - A page argument is from the root, or from an area ([`pageFile()`](tools/pages.js)):
    `solid/solid-2.html` is a guide.

The shared folders:
- [pages.js](tools/pages.js) has a constant for each, and `findPages()` walks them.
  - `PAGES`, `GUIDES`, `EPICS`, `TEMPLATES`
- [The docs' home page](../../pages/index.html):  a routing page (P5 of `claude-design`).
  - One card per area, in the top bar's order, each with its count:
    Guides · Sagas · Epics · Epic/UI · Spell/UI · App · App/UI · Brand · Templates
    - Owen's order (2026-10-11, epic `epic-workflow` J40);  the slashed names are the tabs' labels (J41).
    - Sagas was Goals until P15 of `epic-workflow`:  its tab opens the Sagas list page,
      and lights on the saga pages and the parked goal sets (`goals/`) too.
    - Spell/UI, Epic/UI and App/UI are COMPONENT SETS (`COMPONENT_SETS` in `$/server/page`), in Spell UI's page shape.
      Their cards link the sets' addresses:

      ```text
      packages/ui/docs/      served at  /components/ui/
      packages/epics/docs/   served at  /components/epics/
      packages/app/docs/     served at  /components/app/
      ```

    - NEVER run `spell dev docs index` from a branch whose sets' addresses `main` doesn't serve yet:
      it writes the shared home, which `main`'s page server shows too.
  - `spell dev docs index` writes the cards, between the `areas:start` / `areas:end` markers.
    Edit only outside the markers.
  - NOT `index:start` / `index:end`:  on those, an older checkout's `index.js` would stop on the shared home,
    instead of writing its three lists back into it.
- Each area's LIST PAGE, its top-bar tab's home:
  `index.html` in `epics/`, `guides/`, `sagas/`, `templates/` and `brand/`.
  - A card per page (epics open first).
  - `spell dev docs index` writes them, between the `index:start` / `index:end` markers.
  - A missing one is made from [`skeleton()`](tools/index.js).
  - The Epics page (epic `airplane` P8, Owen 2026-10-10) sorts its cards into five GROUPS.
    - Each group is a small heading with its count;  cards are alphabetical by title within each.
    - Or newest first:  the page header's sort buttons, A–Z and Date (`wireEpicSort()`;  Owen, 2026-10-13).
      - They sort the cards inside each group by title, or by when each was last worked on.
      - Remembered in this browser.
    - An empty group is hidden.
    - `$/epics/list/EpicCards` draws them, for both `spell dev docs index` and the page server.
      - On the page server, the running epics' route module adds the running epics' cards
        ([runningRoutes.ts](src/list/runningRoutes.ts), `RunningEpics`).
    - The groups:
      - Favorites:  starred, whatever their state.  A starred epic shows only here.
      - Active:  phases left.  In progress, and paused (its mark grey).
      - Planning:  future, or no phases yet
      - Urgent:  every phase done, items waiting on Owen (the `errors` state)
      - Done
    - Each card's STAR, top right:
      - Yellow when starred (the page's yellow, `--spell-favorite`), else its outline, grey.
        - Owen, 2026-10-10 (`airplane` J22):  "make it yellow".  The brand's gold-brown before.
        - The one yellow that doesn't mean "open".
      - A click stars or unstars it at once:  the runtime's `wireFavorites()` moves the card.
      - Then the page posts it to [epicRoutes.ts](src/tool/epicRoutes.ts) (`POST /api/epics/favorite`).
        - That writes the ONE shared file, `favorites.json5` in `epics/`:  a JSON list of names.
        - through `SRV.FileOperations.save()`, as every route module's save
      - The page server regroups by it as it serves the page.
      - From `file://` the stars show, disabled.
    - The day it was last worked on, bottom right, no year (`10/9`).
      - Its `title` is the full date and time.
      - It's the latest of:
        - the epic page's `updated`
        - its last log line (the `log.html` part)
        - its branch's last commit (one `git for-each-ref`)
      - A running epic's card keeps the date `spell dev docs index` wrote when it's later than its doc's.
    - SAGAS (epic `epic-workflow` P15):  each card names its saga, a small label
      (the saga's title, its purpose the tooltip).
      - Above the groups, a row of SAGA CHIPS, one per saga in Owen's order, then "No saga", each with its count.
      - A click shows only that saga's epics, by the state chips' rule (`nextShown()`):  the runtime's
        `wireSagaChips()`;  remembered in this browser (`spell-epics-sagas`), for every Epics page.
      - The groups count only the cards that show.
      - `$/epics/list/EpicCards` draws both (`epicSagaHtml()`, `epicSagaChipsHtml()`), the sagas passed in by
        `docs index`;  each card carries its saga in `data-saga*` attributes, for the page server.
    - The docs' home page's Epics count is by the same groups:
      `2 favorites · 5 active · 2 planning · 17 urgent · 7 done`.
  - The GUIDES page (epic `epic-workflow` P15):  a section per saga, in Owen's order,
    each headed by the saga's title linking its saga page (made or not yet), its purpose under it;  then "Misc", last.
    - A guide names its saga in its head, right after its description meta:
      `<meta name="spell-saga" content="<id>">` (`Sagas.withSaga()` writes it, `sagaOf()` reads it).
    - None, or a saga not in the list:  Misc.  `docs index` prints both kinds.
    - `epic saga rename` rewrites the metas.
  - The SAGAS page:  a card per saga, in Owen's order (`sagas/sagas.json5`).
    - its title linking its saga page, its purpose, how many epics and guides name it
    - a note on the parked first sagas (`goals/`)
  - The Templates page also holds the "Writing docs" notes;  the Brand page, its folder's files.
- `guides/`:  every other page.
  - [The changelog](../../guides/changelog.html):  what the repo shipped, newest first.
    - Every `/isolate` and `/epic` adds to it (the root's `AGENTS.md`, "Changelog").
  - A doc:  `<topic>/<topic>.html`, folder and file in lower-kebab-case, e.g. `solid/solid-2.html`.
    - One-file docs with nothing beside them MAY sit at the top level:  `<name>.html`.
    - `<topic>/experiments/`:  runnable scripts backing the doc's claims (see "Experiments").
    - `<topic>/<topic>.md`:  a distilled version for agents, when agents need the doc's rules (see "Agent rules").
  - `spell-docs/`:  how the pages work, and the @spell-app/ui problems they hit.
    - [spell-docs.md](../../guides/spell-docs/spell-docs.md):  how the pages work
    - [spell-ui-findings.md](../../guides/spell-docs/spell-ui-findings.md):  the problems
- `templates/`:  starting points, one per kind of doc (see "Templates").
- `epics/`:  epic pages, one per `/epic` session, each `<name>/<name>.plan.html` (see "Epic pages").
  - `<name>.html` before 2026-10-04.
    - The tools find either ([`planDocIn()`](tools/pages.js)).
    - A worktree cut before keeps the old name until it merges `main`.
    - The old URL answers "not found":  no redirect (Q30 of `people-and-orgs`).
    - [plan-rename.js](tools/plan-rename.js) did the rename.
  - A SPLIT doc's bodies are part files, `<id>.html` in its folder's `parts/`:
    the page loads them when opened (see "Epic pages").
    - `.htm` before Q12 of `epic-components`:  read no more.
    - Every page walker skips `parts/` folders, so a part is never taken for a page.
      - `findPages()`, `relocate.js`, `spell static`
- `pages/details/`:  DETAILS PAGES, each `<slug>.html`.
  - A question Claude explains, and Owen answers on the page (`/details`, see "Details pages").
  - Scratch:  ignored by the shared repo's git, swept after 14 days.
  - An epic's go in its folder's `details/`, kept (auto-committed with the shared repo).
  - CHOICE pages live there too (see "Choice pages").
- `brand/`:  the brand pages, and the design system's push record.
  - the pony, from Claude Design;  the rest from P11 of `claude-design`
  - Not in `findPages()`'s areas:  `docs update` doesn't check them.
    - its constant:  `BRAND`, in [pages.js](tools/pages.js)

In `tools/`:
- `_assets/`:  shared page assets.
  - Pages reach them from the checkout's root:  `<up>packages/epics/tools/_assets/`, `<up>` being the way up.
  - `spell-doc.css`:  page layout, and what UI doesn't cover.
    It reaches into widgets via UI tokens and `::part()`.
  - `spell-doc-runtime.js`:  page behaviour.
    - the toolbar, sticky headers, scroll-follow, code colors, comments
    - generic:  an epic page's `<epic-*>` elements do their own (see "Epic pages")
  - `spell-ui.entry.js` -> `spell-ui.js`:  the ONE classic script a page loads.
    - Solid + @spell-app/ui + the runtime
    - GENERATED by [bundle-spell-ui.js](tools/bundle-spell-ui.js).  NEVER edit `spell-ui.js`.
  - `spell-ui.design.entry.js`:  the same, for Claude Design's `bundle.js`.
    - built by `bundle-spell-ui.js --design`
  - `emoji/`:  UI's emoji name chunks, as classic scripts, `<set>/<letter>.js`.
    - The bundle loads one lazily, on first use of a name.
    - both sets:  `cldr`, `fomantic`
    - GENERATED with `spell-ui.js`:  never edit.
  - No `plan-doc.css` any more (deleted at P14 of epic `epic-components`, 2026-10-08).
    Epic pages style themselves through their `<epic-*>` elements.
  - No page script for details and choice pages since epic `epic-workflow` P12.
    - They're written in the epics pack's elements, which draw and send them (see "Details pages").
    - `details.css`, `details.js` and `syntax-choices.js` are gone.
    - `spell-doc.css` has their pages' few own lines ("Pages Owen answers on").
  - `syntax-choices.css`:  the spell syntax guide's boxes and bar (`spell-syntax.js`).
    - A choice page drew with it before P12.
  - `goals.css`, `goals-live.js`:  saga pages, in the repo root's `goals/` and in `templates/goals/`.
    - their look, and their live buttons:  PARKED since 2026-10-11, each says "TODO:  this will ..." (`parked()`)
    - `goals.css` holds every rule the saga pages took from `plan-doc.css`, which they no longer link.
  - `commands.js`:  command reference pages ([the commands template](../../templates/commands.html)).
    - It draws their tables from the page's JSON, then loads `spell-ui.js` itself.
    - The page loads `commands.js` INSTEAD of the bundle.
  - `spell-syntax.js`, `spell-syntax.css`:  [the spell syntax guide](../../guides/spell-syntax/spell-syntax.html).
    - It draws one table per module of the base spell language, a row per rule class.
      - from spell's generated [spellSyntax.json](../spell/spellSyntax.json) (`yarn gen:syntax`, in spell)
    - Each row:
      - the class's name, opening its source
      - its syntaxes and aliases
      - an example of each syntax in each writer
      - its purpose
    - Every section starts open, with Expand all and Collapse all in the toolbar.
    - Built from elements, never markup in strings.
    - Its boxes and toolbar are the old choice page's (`syntax-choices.css`, `choicesRoutes.ts`).
      The page names its rows on `<body data-choices-rows>`.
    - Each row's wand adds a comment on it ("Provide more details here"):  see "Comments".
    - Then it loads `spell-ui.js` itself, as `commands.js` does.
  - `core-reference.js`:  [the core reference page](../../guides/targets/core-reference.html), epic `python-target` P29.
    - It draws one table per core file, from two lists:
      - core's [core.declarations.json5](../core/core.declarations.json5)
      - py's [not_ported_yet.json5](../py/core/not_ported_yet.json5)
    - Both are read from the checkout serving the page, so each branch shows its own core.
    - Then it loads `spell-ui.js` itself, as `commands.js` does.
- The scripts, `*.js` and `*.ts`:  see "Scripts".
- The goals tooling:  PARKED (epic `epic-workflow` P6), in [goals.zip](../goals.zip).
  - Epic `epic-goals` rebuilds it ([goals' AGENTS.md](../../goals/AGENTS.md), at the repo root).

## Writing a page

- Start from a template:

  ```sh
  spell dev docs new durable|cheatsheet|commands <topic>/<topic>.html --title "Title"
  ```

  - It copies it into `guides/` (and for `commands`, its data as `<topic>.json5`).
  - It fixes the `_assets` paths for the page's depth, and lists it in the index.
- Every page (templates too) starts its `<body>` with the site header, `<spell-site-header root="../..">`.
  - `root` is the path from the page's folder to the REPO root.
  - The template tools (`docs new`, `epic new`, `goals new`) set it.
  - Everything that sticks or lands starts below it:
    `siteHeaderHeight()` in `spell-doc-runtime.js`, and its header's "Landing".
  - The element itself is `$/server/site`'s `SiteHeader`, bundled into `spell-ui.js`.
- NEVER inline copies of `_assets`:  improve the shared files instead, and every page gets it.
- Pages MUST still open straight from disk (`file://`):  no ES modules, hence the one classic bundle.
  - But the openers (`docs open`, `epic open`) show them from this checkout's PAGE SERVER
    (`spell dev server`, see [server's AGENTS.md](../server/AGENTS.md)).
    - It adds live reload, edit mode, and the server-only properties (Spell UI, Editor).
  - The exceptions fetch their JSON, so they draw their tables only from the page server:
    a `commands` page, the core reference page and the spell syntax guide.
    - From `file://` each says so, where they'd go.
    - Its `<body data-spell-needs-server>` makes `check-spell.js` load it from the server.
    - Why:  Owen chose a plain JSON file over a JS data file, or tables rendered into the HTML (epic `commands`, D4).
- The MEASURE:  a page's reading column is `--spell-measure` wide, centred (`spell-doc.css`, "Layout").
  - 880px, its 16px side padding included
  - Today it holds EVERYTHING in `<main>`:  nice for prose, "horrible for tables" (Owen, 2026-10-12).
  - The WIDE LAYOUT, opt-in while Owen tries it:  `<body class="... spell-wide">`.
    - On the spell syntax guide and `epic-workflow`'s epic page so far.
    - Every page's once he approves (that epic's todo, "Make the wide layout the default on every page").
    - `<main>` runs the window's full width, and each kind of block places itself:
      - BARS (the sticky page header and its toolbar, section titles, the footer, a bottom bar):
        background and rule edge to edge, their contents in the column
      - TABLES (`ui-table`, a bare `table`):  in the column, as prose (Owen, 2026-10-13)
        - an EXPAND button above each one's top-left corner runs it the full width, less a 16px gutter
        - remembered per table, in this browser (`spell-table-wide:<path>`):
          by the table's id, else the nearest id above it and which table it is under that (`p14#table-1`)
        - the runtime's `wireTableWidths()` measures how far in a table starts,
          so one inside a list item or an epic item's details goes out to the gutter too
        - no button at phone width:  the column is the page already
      - the page's HEAD (breadcrumb, title, toolbar):  one ivory band from the site header down
        - an epic page's header and subtitle too (`EpicPage.css`)
      - everything else, prose and insets (paragraphs, lists, asides, code, messages, cards, comment threads):
        the column, centred
      - a block that should run full width anyway:  `class="spell-full-width"`
    - A bare `<table>` is celled like a `ui-table celled compact`.
      - both draw their cells in `--spell-table-rule`
      - at phone width a bare table scrolls inside its own box
    - An epic page:  `<epic-page>`'s `--epic-inset` becomes the column's inset,
      so its bands run edge to edge and everything in them sits in the column.
      The pack itself doesn't change.
    - `--spell-column-inset`:  from the window's edge to the column, at least 16px.
      Worked out once in px, on `<main>`, so a block at any depth (shadow roots too) inherits the same number.
    - Phone width looks as before:  a 16px gutter, nothing wider than the window.
    - Not tried yet:  the saga pages' old `section.s2` markup, a cheatsheet's filter bar, `.spell-toolbar-alone`.
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
    - The ONE exception:  the spell syntax guide starts with everything open (Owen, 2026-10-12), a comment in it says so.
    - The runtime remembers the reader's folds per page, and a link to an id unfolds what hides it.
  - its icon:  a `<ui-icon slot="icon" name="...">`, first inside it
  - a title with markup:  a `<span slot="header">`, instead of `header`
  - A sticky page header above them, on EVERY page (the templates have it), so the title stays on screen:
    `<ui-sticky class="spell-h1"><header class="spell-page-head">` around the h1.
    - The runtime draws it on ONE line, as an epic page's (`oneLineHead()`;  Owen, 2026-10-13):
      - a copy of the breadcrumb goes into the h1:  `DOCS / SPELL SYNTAX`
      - the title in the crumbs' type (mono capitals), twice their size and bold
      - the breadcrumb above it hides
      - a lighter ivory than the toolbar under it
    - While a sub-section's title is stuck under its parent's, the two are one row (`wireStuckTrail()`):
      `2. Files on disk › 2.1 The repo`.
  - The OLD markup is for the saga pages only;  the runtime still drives it.
    - It's `section.s2|s3` > `<ui-sticky class="spell-h2|spell-h3">` > `<h2|h3 id>`.
    - `node tools/to-ui-section.js <page>` converts a page.
    - An epic page goes to `<epic-*>` markup instead:  `epic convert <name>` (see "Epic pages").
- The runtime builds the page from that markup:
  - NO contents list (Owen, 2026-10-08:  "remove the Contents thing entirely ... it is useless").
    - NEVER hand-write one, or a "Contents" button.
  - The TOOLBAR, the page's one navigation (`buildPageToolbar()`).
    - Epic `airplane` P8, Owen 2026-10-10:
      "Make the floating sidebar in guides a sticky top toolbar like the epic page".
      Before it, a floating right-edge rail.
    - A row of the top-level sections' buttons:  the last row of the sticky page header (`.spell-page-head`).
      So it sticks with it, and the titles stick below it.
    - An ivory band, edge to edge across the content column (out of `<main>`'s side padding), square.
      - A rule under it, and none above (Owen, 2026-10-10).
      - The same band as an epic page's.
    - Each button:  the section's icon and its title.
      - the current one a deeper ivory (scroll-follow)
      - a red badge counting what needs Owen
    - Give every top-level section an icon:  without one, the button shows its number.
    - Titles that don't all fit end in `...`.
      - When each would get under 50px, they go:  icons only, the title as the button's tooltip (`fitTitles()`).
      - The row scrolls sideways if even that doesn't fit, never the page.
    - The spell syntax guide adds Expand all and Collapse all at the band's right (`spell-syntax.js`, Owen 2026-10-12).
    - A page without a sticky page header:  the last row of its filter bar.
      Else a sticky bar of its own, before its first section (`.spell-toolbar-alone`:  the saga pages).
  - An EPIC PAGE (`body.plan-doc`) has its own toolbar (`buildToolbar()`).
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
    - At the row's right, `<epic-page>`'s own tools (see "Overview"):
      the page's state filter, collapse-all, the new item button.
    - Cmd / Ctrl + K asks which item to jump to (`J7`, `q3`, any id), and lands there as a link would.
      - An id that isn't there:  the dialog says so, and stays open (`wireJumpKey()`).
      - A comment's id too, `M3`:  see "Jumping to comments" below.
  - JUMPING TO COMMENTS (epic `epic-workflow` P23;  Owen, 2026-10-10:  "⌘K taking comment ids", "Is there a way to
    jump to comments in replies?"), on every page that takes comments (an epic page's and a guide's alike):
    - a BULLHORN at the right of the toolbar, an orange badge counting the threads waiting on Owen (Claude spoke last)
      - each click lands on the next, in page order, round again after the last:  opened, below the stuck titles
      - hidden while none waits;  `PageComments.drawWaiting()`, its place in `waitingHome()`
    - Cmd / Ctrl + K takes a comment's id (`M3`, `m3` or the old `cm3`) and lands on its thread, opened
      - under its box, the threads waiting on Owen, a line each, "M3 · his first words", that lands there
      - a guide's dialog asks "Jump to which comment?", and takes any other id on the page too
    - [check-comment-jump.mjs](demo/check-comment-jump.mjs) checks both, on stubbed comments
  - Sticky titles:  each top-level section's title sticks below the page header.
    - Nested ones stack below their parents'.
    - The runtime sets the top-level `offset`s.
  - Folding:  folds are remembered per page;  a link's unfold isn't.
    - An epic page (`body.plan-doc`) starts EVERY section folded that the reader hasn't opened or closed:
      Owen opens what he wants (2026-10-03).
    - Its `<epic-*>` blocks start folded by themselves.
      - The runtime reopens the ones the reader left open, before they first draw (`restoreEpicFolds()`).
      - It saves their toggles as a section's.
    - Below the last line, a window's worth of empty ground (`--spell-doc-pad-end`, on `.spell-doc-main`):
      so folding near the page's end never leaves the page shorter than where it's scrolled to,
      and what was clicked stays put (Owen, 2026-10-10, `airplane` J10).
  - Counts, on a top-level section holding `[data-status]` items
    (the Epics list page's epic cards, the saga pages' items):
    - `open/all` on its title, its `badge`
      - open:  any status but `done`, `decided` or `canceled`
    - on the toolbar, a RED badge counting only the items that need Owen (state `attention`):
      none when none do (`countItems()`)
    - Nested sections get no count of their own.
    - An epic page's blocks count their own items:  the runtime only reads the count, and its `attention`
      (else the items' `state="attention"`;  see "an epic page" below).
  - Item states (`markItemStates()`, every page):
    the Epics list page's epic cards, and the saga pages' items (`.plan-items`), get their colour from `data-state`.
    - The colour scheme:  [the plan-doc guide](../../templates/epics/plan-doc.md), "Colours";
      in CSS, `spell-doc.css`'s `--spell-state-*`.
    - red needs Owen, blue Claude is working on it, yellow open (dark ink), green recent, grey older
    - without one:  an open goals question red, anything else open yellow, done / decided grey
    - The saga pages colour their id chips by it, NOT by kind:  the kind is only the id's letter.
  - Item filter (`wireItemFilters()`):  a top-level section with such items gets a chip per state it has.
    - Each chip shows how many, left of its count.
    - solid while that state shows, outlined while hidden
    - no filter icon (Owen, 2026-10-10)
    - A click (`nextShown()`, an epic page's rule too):
      - everything showing:  only that state
      - else a hidden one shows too, and a shown one hides
      - the only one showing:  everything again
    - A filtered list says "N hidden · show all" under it.
      Remembered per page.
  - An EPIC PAGE:  `<epic-page>` markup, drawn by the `epics` pack (see "Overview").
    - Its elements draw themselves, in their shadow roots:
      - the page header (Send and Review Now while reviewed, the step label, git), and its toolbar's tools
      - the review line, and the nobody-listening pill under it
      - the sections, phases and items, their counts and state filters, commits, item folds
      - every review control on the page's ONE review client
        ([the review client](src/review/), see "Review inbox")
    - How they look and behave:  "Overview" above, and each element's Epic UI page.
    - The runtime only:
      - lists its folding blocks (`<epic-overview>`, `<epic-section>`, `<epic-phase>`) on the toolbar
        - from each host's `contentsEntry` (label, icon, count), after waiting for them to draw
        - `EPIC_WAIT_MS`, 5s at most:  a pack that won't load doesn't hold up the page
      - remembers their folds
      - lands links inside them (a link to an `<epic-item>` opens it)
    - Running agents (epic `skillz` P3):  `<epic-page>` draws the "Agents running" panel above its first section.
      - It shows while any agent of the epic runs.
      - Each agent has a note box that redirects it (see "Overview").
  - Links to any id in `main` land below the stuck titles.
    They unfold what hides the target, and open its panel.
  - The address follows the section being read (`#id`, replaced, not pushed), so a reload lands there.
  - Served by the page server, an edit to the page's file updates it IN PLACE (`wireLiveUpdate()`).
    - Scroll, folds, open panels and typed text stay.
    - Anything the runtime adds inside `main` must carry `data-spell-added`, so the patch steps around it.
    - Pages with scripts of their own still reload.
      Inert data blocks (`<script type="text/plain">`) don't count.
  - The page's CODE changing hot-reloads it (the live client's `liveAction()`, epic `epic-workflow` P24):
    - a stylesheet it uses (`spell-doc.css` ...):  swapped in place, no reload
    - a script it loaded (`spell-ui.js` and its lazy chunks, the runtime, `epics.pack.js`, an experiment's bundle),
      or the page server restarting (a merge changed its code):  ONE reload, half a second after the last change
    - it keeps its place:  the scroll (the live client), the folds and comment drafts (this runtime, `localStorage`)
    - not while you type in a field:  an "Updated:  reload" pill waits, and it reloads once you leave the field
    - so a merge's new widgets show up by themselves:  VS Code's window needs reloading only when the EXTENSION changes
    - `<body>`'s attributes are patched too.
    - An epic page's `<epic-*>` elements are patched, never replaced, keeping their page state
      (`open` ..., `carryEpicState()`).
      [check-live-epics.mjs](demo/check-live-epics.mjs) checks it.
  - Bodies from files:
    - `<ui-section source>` and `<ui-accordion source>`
    - an epic page's `<epic-*>` blocks and items:  a split epic page's parts (`wireSourceBodies()`)
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
    - Older pages still have `<ui-popup inverted size="mini">` tooltips:
      `circle()`, in the saga pages' `goals-live.js`.
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

## Page kinds

Each kind of page has ONE name, written everywhere a person reads it.
- Owen, 2026-10-14, epic `epic-workflow` P14:
  [the page kinds he settled](../../epics/epic-workflow/details/page-kinds.html)
- The older words he may still say:  the root's [AGENTS.md](../../AGENTS.md), "Words".

| Name | What it's for | Where | Template |
| --- | --- | --- | --- |
| epic page | an epic's plan:  its phases, items and log | `epics/<epic-id>/<epic-id>.plan.html` | [the tool's](src/tool/templates/plan.html) |
| saga page | a saga (an epic of epics):  what its epics did, ideas not done yet, its epics' cards;  commented on and sent from as an epic page is (epic `epic-workflow` P15) | `sagas/<saga-id>/<saga-id>.saga.html` | [the tool's](src/tool/templates/saga.html) (`epic saga page <id>`);  the parked goal sets in `goals/`:  [goals/](../../templates/goals/) |
| details page | one question explained with a picture, answered on the page | `pages/details/`, `epics/<epic-id>/details/` | [details.html](../../templates/details.html) |
| review page | several calls to go through at once:  keep, change, talk over | same as details pages | [review.html](../../templates/review.html) |
| choice page | a table of names Claude recommends, typed over, then "Do it" | same, with `<slug>.rows.json5` | [syntax-choices.html](../../templates/syntax-choices.html) |
| guide | explains a topic;  an epic's own write-up is "the epic's guide" | `guides/` | [durable.html](../../templates/durable.html) |
| cheatsheet | an API at a glance, as cards you filter | `guides/` | [cheatsheet.html](../../templates/cheatsheet.html) |
| commands page | which command, skill or script does what | `guides/dev/commands/` | [commands.html](../../templates/commands.html) |
| components page | one element:  its examples, attributes and look | a component set's `docs/`:  `packages/ui/docs/`, `packages/epics/docs/`, `packages/app/docs/`, `packages/brand/docs/` | [spell-ui-docs.html](../../templates/spell-ui-docs.html) |
| components guide | a component set's pages that aren't one element:  home, getting started, theming, icons | beside its components pages | [component-set-docs.html](../../templates/component-set-docs.html) |
| brand page | Claude Design's brand pages, and their Spell UI copies | `brand/` | none:  Claude Design's exports |
| home page | the docs' front page:  a card per area | `pages/index.html` | none:  `spell dev docs index` writes its cards |
| list page | a card per page of one area:  each top-bar tab's own page | `<area>/index.html` | none:  `spell dev docs index` writes it |
| changelog | what the repo shipped, newest first | `guides/changelog.html` | none:  its header comment has an entry's markup |
| template | the starting point for one kind of page | `templates/` | -- |

- Not pages, so not named here:  an epic page's part files, inbox files, answer and draft files.
- File names keep their old words (`<epic-id>.plan.html`, `durable.html`, `syntax-choices.html`):
  links and tools depend on them.

## Templates

- [durable.html](../../templates/durable.html):  a guide -- design notes, research, references.
  - prose sections, tables, code, callouts
- [commands.html](../../templates/commands.html) + `commands.json5`:  a command reference.
  - operations by family, and which CLI / skill / yarn command does each
  - in tables that `commands.js` (in `_assets/`) draws from the JSON;  its header has the JSON's shape
  - hand-written prose around them
  - e.g. [the commands page](../../guides/dev/commands/commands.html)
- [cheatsheet.html](../../templates/cheatsheet.html):  an API reference.
  - a grid of cards, filtered by text and by badge (`ui-select[data-spell-filter-badge]`)
  - a card may carry `<ui-meta>` (since when) and `<ui-extra>` (a docs link)
- Epic pages have no template here.
  - The old `plan.html`, in `templates/epics/`, retired at the switch (P12 of `epic-components`).
  - `epic new <name>` copies the tool's own, in `<epic-*>` markup
    ([the tool's plan template](src/tool/templates/plan.html)).
  - How to write one:  [the epic-page notes](../../templates/epics/plan-doc.md).
- [details.html](../../templates/details.html):  a details page.
  - NEVER copy by hand:  `epic ask new <slug>`.
  - The tool reads its OWN copy since epic `epic-workflow` P12:  [tools/templates/details.html](tools/templates/details.html).
    - tracked with each branch, as the elements it's written in are
    - The shared one becomes a copy of it when the migration step `answer-elements` runs
      (see "Scripts", `migrate.js`).
- [syntax-choices.html](../../templates/syntax-choices.html):  a choice page.
  - `syntax-choices.rows.json5` beside it is a small working example.
  - NEVER copy by hand:  `epic choices new <slug> --rows <rows.json5>`.
  - The tool's own copy, as details.html's:  [tools/templates/syntax-choices.html](tools/templates/syntax-choices.html).
- [review.html](../../templates/review.html), "Review":  a review page, going through a finished run's calls.
  - one question each (keep, change, talk over), then "Where first?"
  - saved from `ui-docs-rework`'s morning review, as the model
- `templates/goals/`:  saga pages, laid out as a goals folder is, so their links work in place.
  - the saga set's home, every saga:  `index.html`
  - a set's contents page:  `index.html` in `set/`
  - a topic's page, and its agent notes:  `topic.html` and `topic.md` in `set/topic/`
  - Parked with goals:  `spell dev goals new-set` / `new` filled them.
    A copy is in [goals.zip](../goals.zip).
  - The rules:  [goals' AGENTS.md](../../goals/AGENTS.md), at the repo root.
- [spell-ui-docs.html](../../templates/spell-ui-docs.html):  a components page (one element's), for Spell UI's set
  ([its docs](../ui/docs/)).
  - Fomantic's docs layout in `<ui-*>` widgets:
    nav, masthead, Examples / Usage / API / Theming tabs, an "On this page" rail.
  - It loads the UI site's bundle, NOT `spell-ui.js`.
  - NEVER copy by hand:  `yarn site:new <tag|page>`, in `packages/ui`.
  - How to write one:  [PAGES.md](../../epics/spell-ui-pages/PAGES.md).
  - Checked by `yarn site:check` there (`docs update` skips it).
- Every template but the saga pages and `spell-ui-docs.html` is `<ui-section>` markup (see "Writing a page").
  - The saga pages keep the old `section.s2` markup
    until they migrate ([the code-debt log](../../agents/CODE-DEBT.md)).
- A new KIND of doc gets a template here.
  `spell dev docs index` gives it a card on the Templates list page.

## Epic pages

- `/epic <name>` ([the epic skill](../../.claude/skills/epic/SKILL.md)) runs a planning session
  against the epic's epic page, `<name>.plan.html` in `epics/<name>/`.
- An epic page is `<epic-*>` markup, drawn by the epics component pack (epic `epic-components`).
  Its code is in `src/` and `components/`, beside the docs tools:
  - the elements, the review client, and the `epic` tool ([the tool's folder](src/tool/), which `epic` runs):
    "Overview" above
  - what the tool writes, and the rules for a doc's DATA in that markup (ids, phases, items, log, parts):
    [PLAN-DOC.md](src/tool/PLAN-DOC.md)
  - how to write one (rules, ids, prose, explaining a question, the review loop):
    [the plan-doc guide](../../templates/epics/plan-doc.md)
  - Every shared doc is in `<epic-*>` markup since the switch (P12 of `epic-components`, 2026-10-08).
    - A doc still in the OLD `ui-*` markup is read, never edited.
    - "Convert it first":  `epic convert <name>`.
- Edit through `epic <verb>` wherever a command exists (phase status, items, log).
  It keeps ids, icons and UPDATE markers consistent.
- SPLIT docs (P3 of `claude-design`;  new docs start split):  a skeleton, plus part files, `<id>.html` in `parts/`.
  - The code:
    - `PlanParts`, `$/epics/tool/PlanParts`
    - `EpicParts`, `$/epics/tool/EpicParts`, splits and assembles an `<epic-*>` doc
    - the rules:  [PLAN-DOC.md](src/tool/PLAN-DOC.md), "Parts"
  - The tool reads either shape whole, and writes it back split:  each file once, atomically, only when changed.
    - `split <name>` / `split --done` / `join <name>`
  - A reader of the skeleton alone sees every section, phase status and item line.
    - e.g. `spell dev docs index`, the main server's epic cards, `ReviewInbox.itemIds()`
    - Anything needing bodies reads the doc through the tool (`PlanDocFiles` `read()`).
  - A split doc needs the page server (`<body data-spell-needs-server>`):  bodies don't load from `file://`.
- What the docs tools (`tools/`) add for epic pages, as for every page:
  - `spell-doc-runtime.js`'s generic parts (see "Writing a page"):
    - the toolbar, which lists an epic page's blocks from their `contentsEntry`
    - folds, landing, live update, bodies from files
    - for the Epics list page and the saga pages:  `countItems()`, item states and `wireItemFilters()`
  - [check-spell.js](tools/check-spell.js), which knows the `<epic-*>` elements (see "Scripts")
  - the forwarders (see "Scripts"):  new code imports `src/tool/` (`$/epics/tool/...`) instead
    - [plan-doc.js](tools/plan-doc.js), also `yarn plan-doc`
    - `plan-parts.js`, `inbox.js`, `review-backfill.js`
  - the tool, in turn, uses the docs tools' own code rather than a copy:
    - `BlockAnchors.js`, in `PlanAnchors`
    - `pages.js`'s `atDepth()` and `planDocIn()`, in `PlanDocCommands` and `PlanDocFiles`

### Review inbox

- Owen marks an epic page's items ON the page:  approve, todo, Add Details, revisit, pick an option card.
  - The marks wait in its INBOX FILE until a Claude session takes them.
    It's `<name>.inbox.json5`, beside the doc in `epics/<name>/`.
  - Absent until the first mark;  deleted once empty.
  - Git-ignored:  per-machine pending state, never the record.
  - Its shape and methods:  [`ReviewInbox`](src/tool/ReviewInbox.ts).

    ```text
    setMark()  requestNow()  cancelNow()  markSent()  unsentMarks  sentMarks  takeNow()  takeWork()
    setWorking()  setListening()  touchListening()  liveListener()  clearMarks()  finishMarks()
    clearApplied()  setDraft()  reviewNow()  unsentComments  sentComments  hasUnsent  claimWake()  recordWake()
    ```

  - EVERY write goes through `ReviewInbox.update()` / `updateAsync()`:
    under the file's lock (`SRV.FileLock`), atomic (`updateAsync()` through `SRV.FileOperations.writeAtomic()`).
  - `drafts`:  a note box's text as Owen types it, kept until the mark that uses it.
    - Never sent, counted, or work for a waiting session.
  - `canceled`:  requests Owen called off ("nevermind", `cancelNow()`).
    - `wait` hands them over once:  stop that item's agent.
    - `epic details` refuses a write for one.
    - `inbox done | clear`, or a new request, ends it.
  - One mark per item (or phase, Overview sub-section, the summary:  `summary`).
    - A question's pick with a remark is ONE revisit mark carrying `pick`:
      `{ action: "revisit", when, note, pick }`.
    - It's talked over, never applied by itself.
  - A new todo or question asked for from the page (epic `airplane` P2):  a mark under its own key, `new1` ...
    - `setNew()`:  `{ action: "new", kind, title, note?, near? }`
    - `epic inbox <name> apply` makes the item.
  - `comments`:  Owen's comments on the doc's blocks, and on selected text (P11, see "Comments"):  `M1` ...
    - Written through the comments route.
    - Sent with Send, as marks are (Owen, 2026-10-10:  he keeps Send as the way comments reach Claude).
      - Unsent (`unsentComments`):  waiting for Claude, and Owen's last words on the thread newer than `sent`.
      - A new comment, or his reply on a thread, turns Send blue;  its tooltip counts both ("2 marks, 1 comment").
      - `wait` hands each over once (`takeWork()`'s `sent.comments`), until Owen speaks on its thread again.
    - Waiting until answered (`epic inbox <name>#M3 done`).
  - `listening.seen`:  the session's heartbeat (`LISTEN_HEARTBEAT_MS`, 30s, from `wait`).
    - Older than `LISTEN_STALE_MS` (90s), the session is gone:  `liveListener()` returns `null`.
  - `woken`:  the page server's last WAKE of the epic (epic `epic-workflow` P16), `{ at, state, did, message }`.
    - Send, Review Now or Do Now with nobody listening wakes it, inside the request:
      `/epic review <epic>` typed into its session, or a new session in its window (`ReviewStart`).
    - Claimed under the inbox's lock (`claimWake()`):  two Sends at once wake once.
    - It stands 10 minutes (`WAKE_COOLDOWN_MS`), or until a session listens (`setListening()` clears it).
    - No wake with several sessions titled for the epic, in airplane mode, or for a Send with nothing new.
- The page reads and writes through ONE `ReviewClient` ([the review client](src/review/)).
  - It's on the page server's route module, [reviewRoutes.ts](src/tool/reviewRoutes.ts), at `/api/epics/review/...`.
  - The module is listed in the root `package.json`'s `pageServer.routes`.
  - The routes:
    - `GET inbox?page=`
    - `POST mark { page, id, mark | null }`
    - `POST draft { page, id, action, note }`:  a note box's text as typed
    - `POST now { page, id, action, note? }`:  Add Details, or revisit now, queued on `now`
      - revisit now keeps the item's pick
    - `POST cancel { page, id }`:  "nevermind"
    - `POST send { page, now? }`:  `now: true` is Review Now, every revisit waiting asked now too (`reviewNow()`)
    - `send` and `now` answer `wake` too:  what waking the epic did (`WakeResult`), `null` while a session listens
    - `POST start { page }`:  the pill's click, `/epic review <epic>` typed into the epic's session (`StartResult`)
    - `POST new { page, id?, entry | null }`:  a new item from the page;  no `id`:  the next free key
  - A page whose token is stale (its server restarted) takes the new one from the page as served now,
    and retries once (`ReviewClient`).
    So nothing typed is refused for a restart.
  - `page`:  the doc's URL path (`/worktrees/<w>/...` too).
    - only `<name>.plan.html` (else 403)
    - only ids of its items (else 400)
  - Each answer is the whole inbox, but with `listening` `null` once stale (`ReviewInbox.forPage()`).
    - Plus `unsentComments`:  the ids of the comments Send would hand over.
      The page counts them for Send, and keeps no rule of its own for a thread.
  - Writes need the server's token and origin (`SRV.Guard`).
- Unsent:  marks newer than `sent` (the last "send to Claude").
  - Never an immediate one (`details`, revisit `now`).
  - And waiting comments whose last words from Owen are newer than `sent` (`unsentComments`).
- `epic inbox <name> [--json]` prints it:
  - marks by action, with their items' titles, sent or not
  - the `now` queue, agents at work, the session listening
- Claude's side, `epic inbox <name>[#<id>] ...`
  (the loop, step by step:  [the plan-doc guide](../../templates/epics/plan-doc.md), "Review inbox"):
  - `listen` / `unlisten`:  a session waits on it, or stopped
  - `wait`:  run in the background;  it stamps the heartbeat while it waits
    - exits 0 with work, which wakes the session:  requests for now, taken;  a send not yet handed over (`handedOver`)
      - a send with only comments too:  it prints them, each with Owen's latest reply
      - a Send on a docs page the epic owns (epic `epic-workflow` P13, see "Comments"):  each comment under its page
    - exits 2 on timeout
  - `epic inbox <name>` lists the comments waiting on the pages the epic owns too (`guides` in its JSON)
  - `apply [ids]`:  the sent approve / pick / todo marks, into the doc (`PlanDoc.applyMark()`), then cleared
    - A revisit with a pick is left, "to talk over".
  - `<name>#<id> working on|off`
  - `<name>#<id> done`:  keeps a mark Owen changed meanwhile
  - `<name>#<id> clear`
  - These and `apply` stamp the heartbeat too.
  - An agent writes into ONE item with `epic details <name>#<id> --file <html> [--append]`.
    - It's under the doc's lock, so it never races the session's other edits.

## Details pages

- How and when Claude writes one:  `/details` ([the details skill](../../.claude/skills/details/SKILL.md)).
- The commands ([details.js](tools/details.js)):

  ```sh
  epic ask new | show [--wait] | wait | answer | draft | list | sweep
  ```

  - `show` opens a page in the side bar's "Review" tab (epic `windows-and-review` P6).
  - `draft` prints what Owen typed and hasn't sent (below):  read it before rewriting a page he may have open.
- Written in the epics pack's `<epic-*>` elements (epic `epic-workflow` P12), so a question reads as an epic page's.
  - Each element has its page in Epic UI (`/components/epics/`, "Pages Owen answers on").
  - a question:  a `<ui-section id>` holding an `<epic-ask>` of an `<epic-question>` and an `<epic-choices>`
    of `<epic-option>`s
    - the section's id is its answer's key
  - the boxes Owen types in:  `<epic-text-box>`es
    - the notes, a section's comment
    - Other and each option's comment are drawn by the question
  - Send:  `<epic-send>`, in the sticky page header
  - what they hold and send:  the page's `AnswerForm` (`$/epics/answers`)
  - The tools build them as elements, never markup in strings ([answerPages.js](tools/answerPages.js)).
    - the template:  the tool's own, [tools/templates/details.html](tools/templates/details.html)
  - Before P12:  `ui-section.spell-question` > `.spell-option`, which a page script (`_assets/details.js`, gone) drew.
    - The migration step `answer-elements` converts such a page once ([to-answer-elements.js](tools/to-answer-elements.js)).
- Owen's answer:  the page posts it to the page server's route module, [detailsRoutes.ts](tools/detailsRoutes.ts)
  (`POST /api/docs/details/answer`).
  - That writes `<slug>.answer.json5`, beside the page (`SRV.FileOperations.save()`).
  - `epic ask wait`, run in the background, exits with it, and so wakes the session.
- What he typed and hasn't sent is a DRAFT (epic `epic-workflow` P18).
  - Why:  agents rewrote a page under him twice, and everything he hadn't sent was lost (request r4).
  - `<slug>.draft.json5` beside the page, through the same route module (`POST /api/docs/details/draft`)
    - saved 2s after he stops typing, and as the page goes away
    - a copy in the browser's `localStorage` too, written at once, for when the page server can't take it
  - It wakes nobody:  `epic ask wait` watches the answer only.  Send deletes it.
  - The page's `AnswerForm` (`$/epics/answers`) keeps it, by question / option / section id, with each id's title
    (`labels`).
    - It puts it back on load over the answer sent, when it's newer:  Send says "Changes not sent",
      the draft's save shows beside it ("draft from 06:12 put back").
  - An agent's rewrite reloads the page, or patches it in place:
    either way a question that's still there gets back what was typed in it.
  - Text whose id the rewrite removed is KEPT:  a box of its own above the notes, "Kept from before the page changed".
    - drawn by the notes box (`<epic-text-box type="notes">`), each under its old title with a × to drop it
    - sent with the rest (`kept`, `[{ id, label, text }]`)
    - `epic ask answer` / `wait` print it last, "Kept from before the page changed:"
  - The rules (what's laid over what, what's kept):  `AnswerDraft`, in `$/epics/answers`.
- `findPages()` skips every `details/` folder:  not in the index, not checked by `docs update`.
- Colours (the scheme:  "Colours" above):
  - recommended:  a violet thumbs-up after an option's title, no word
  - the ticked card framed green
  - Send blue, by the fill rule (grey outline:  nothing to send;  dashed:  changes not sent;  outline:  sent)
  - each question's chip, and its section's toolbar badge:
    - red:  nothing yet
    - green:  picked
    - blue:  Claude has more to do (more details asked, or only Other written)
  - No status label in the meta lines any more (P12):  Send's line says where the answer stands.
    - `Not sent`, `Changes not sent`, `Sent 10/8/26 14:34 · 5 of 17 decided`

## Choice pages

- A table of names (or any syntax) Claude recommends, one row per use site.
  - the columns:  File (opens VS Code at the line) | Purpose | Current | Recommended (a box, pre-filled)
    - The rows' `fileColumn: false` drops File, for rows whose place in the code doesn't matter to the reader
      (a list of commands;  epic `epic-workflow`, CM4).
    - A section's `reorder: true` lets Owen put its rows in ORDER (epic `epic-workflow` P15, the sagas review page).
      - an Order column first, each row's place with move up / move down
      - The order he leaves goes with the draft and "Do it" (`order`, by section id).
      - `answer` prints it against Claude's.
  - Owen types over the ones he'd write differently, then "Do it".
  - For a call made name by name, after a rule is picked (P13's boolean names).
  - How-to:  [the syntax-choices guide](../../guides/syntax-choices.html).
- The commands ([choices.js](tools/choices.js);  the rows' shape is in its comment):

  ```sh
  epic choices new <slug> --rows <rows.json5> | show [--wait] | wait | answer | list
  ```

  - Pages go where details pages do.
  - `<slug>.rows.json5`, beside the page, holds the rows.
  - `new` writes them into the page too, as elements (epic `epic-workflow` P12):
    - a `<ui-section>` per section holding an `<epic-choice-rows>` of `<epic-choice-row>`s
    - an `<epic-choices-bar>` at the end:  feedback, "Do it", the draft (`ChoicesForm`, `$/epics/answers`)
    - So the page draws from `file://` too;  saving and sending need the page server.
  - Before P12 a page script (`_assets/syntax-choices.js`, gone) fetched the rows and drew them.
    - The migration step `answer-elements` writes such a page's rows in once.
- A DOCS page may take choices too:  one that names its own rows on `<body data-choices-rows="...">`.
  - The spell syntax guide does:  its rows are generated from the code, its boxes keyed `<Class>.<field>` (`IsGtLt.py`).
  - Its draft and answer go beside it, as a choices page's;  its box ids aren't checked against the rows.
  - `epic choices show | wait | answer <page>` take its path;  `list` covers only the `details/` folders.
  - It still takes comments:  only a page with `<slug>.rows.json5` beside it doesn't.
- The page server's route module, [choicesRoutes.ts](tools/choicesRoutes.ts), at `/api/docs/choices/...`
  (each save through `SRV.FileOperations.save()`):
  - the draft:  `<slug>.draft.json5`, saved 5s after typing stops, never wakes anyone
  - the answer:  `<slug>.answer.json5`, which `epic choices wait` exits with

## Comments

- Owen leaves a comment for Claude on any block of a docs page or epic page the page server serves
  (epic `airplane`, P11).
  - The BULLHORN beside each major block:
    - a section (in its title), table, aside, code block, message, cards, steps, top-level list
    - an epic page's items, phase fields, summary and Overview prose
    - an epic page's updates (`<epic-update>` blocks), even inside an item or a field:  each has its own bullhorn
      (Owen, 2026-10-11:  "Those items are bullhorn-able")
    - the page header:  the whole page
    - Quiet until hovered, ALWAYS:  it only starts a new comment ("Comment on this item").
    - No count, whatever the block has:  each comment is a thread on the page, right there.
      Owen, 2026-10-10:  "Bullhorn to the far right is unnecessary".
      - Before 2026-10-10 a block with comments showed "📢 N" always, sitting at the end of its thread's header row,
        with an orange dot for news;  its click listed them (`openPicker()`, gone).
      - The toolbar's signals stay as they were.
    - WHERE it sits (epic `epic-workflow` P25;  Owen, 2026-10-17:  "an `actions` slot which puts additional buttons
      in the right spot, to the left of the 'default' buttons like collapse"):
      - a block with a TITLE ROW:  in that row, its `actions` slot, never over a button
        - a docs section:  `<ui-section>`'s own slot (`.at-section`)
        - an epic page's item, update (with a date), aside and code block (`.at-title`, `TITLE_ROW_BLOCKS`):
          after the title, before the block's own buttons (review pills, Do Now, the date, the fold)
        - every epic element with a title row has the slot:  [Fold.types.ts](components/epic-item/Fold.types.ts)
      - a block with NO title row (a paragraph, a table, a list, a message, cards, a phase's field, the summary):
        a line of no height just before it, the button over its top right corner (`.at-block`)
      - the page header:  in it (`.at-page`)
    - A corner bullhorn makes room rather than cover what's there (`makeRoom()`;  Owen, 2026-10-10:  "Overlap in
      bullhorn buttons"):  a thread right under a short block, which it would cover, leaves room on its header's right.
      - Before P25 it also moved an item's corner bullhorn left of its review pills, and an update's left of its date
        (`MAKES_ROOM`, gone);  and a CSS rule shortened an aside's or code block's fold button by 34px (28e350907).
    - A click on a comment's highlighted quote opens its thread.
  - Or on SELECTED TEXT:  ⌘ / Ctrl I, or the bullhorn floating beside the selection.
    - The comment keeps the quote, highlighted softly on the page while the comment exists.
  - The box is a small floating PANE (Owen, 2026-10-10), fixed on the screen, for writing a NEW comment.
    Once saved and closed, the comment is a THREAD (below).
    - just under the selection (or the bullhorn clicked);  above it when there's no room below
    - the page never scrolls for it;  Owen drags it by its header
    - ivory, 8px inside on every side, with no buttons below the text
    - Its header:  the first words of the selected text (else of the block;  its tooltip names the block),
      a floppy, a trash (once the comment is saved) and ×.
    - Its field has no placeholder, only an `aria-label` (Owen, 2026-10-10).
    - It saves itself as Owen types:  the floppy shows saved (its tooltip the time), or turns red.
    - × or Escape (or ⌘ Enter) closes it.  Opening another saves this one first.
    - So does the FOCUS LEAVING it (Owen, 2026-10-10:  "Tabbing out of a bullhorn modal saves it automatically.
      If it's empty, delete it"):  Tab, a click elsewhere on the page.
      - What's typed is saved;  nothing typed saves nothing;  emptied, the comment goes, with no Undo.
      - Another window or tab doesn't count:  the cursor is still in it there.
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
  - DELETE:  a trash on every comment's thread, and in the pane's header (Owen, 2026-10-10).
    - Icon only, its tooltip says what it does;  ONE click deletes at once, no dialog.
    - A toast says "Comment deleted", with Undo for 6s (`UNDO_MS`).
      - Undo puts it back as it was:  same block, quote and highlight, text, dates, state, Claude's answers.
      - Its id stays, unless a new comment took it meanwhile (`restore`, below).
      - Before 2026-10-10 the trash took two clicks, the first turning it red:
        Owen clicked once, and thought it broken.
    - `delete` while the comment waits for Claude;  `clear` once Claude has it (a taken one stays in its epic).
  - THREADS (Owen, 2026-10-10:  "the entire comment thread should be in one collapsable/accordion pane").
    EVERY comment shows as one, the runtime's `thread()`:
    - A thread is the comment, then its `replies` in order (Claude's answers, Owen's replies), then maybe `done`.
    - WHOSE TURN (`CommentList.turnOf()`, sent by the GET as each comment's `turn`):
      - `owen`:  Claude spoke last.  Also an epic page's comment answered in the doc, with no words on the thread.
      - `claude`:  Owen spoke last, his comment or his reply.  Claude may have taken it, not answered yet.
      - `done`:  Owen closed it.
    - Where (Owen, 2026-10-10:  "show them under the paragraph where they were defined"):
      - right after the smallest paragraph, list item, cell ... holding its quote (`holderOf()`)
      - inside a list item or cell:  at its end
      - else under its block;  a docs section's comes first in its body
    - Folded to its header, except while:
      - it's Owen's turn, or Claude is thinking about it
      - he opened it on this visit, or he's writing in it
      - Before threads, a comment had a card only while it had news Owen hadn't read.
    - Its EDGES (Owen, 2026-10-10:  "same indent as comment box"):
      - under an epic page's item:  its note box's ("Your note:  a question ..."), the item's details' padding
        (`--epic-item-indent` left, 6px right);  so is a thread under a paragraph inside the item
      - else the block's it's under:  a guide's paragraph (its 72ch measure too), table, code ...;  a phase's field
      - Before 2026-10-10:  32px in from the text on each side.
  - A thread's LOOK (the mockup, `comment-thread-mock.html`, a scratch details page, and Owen's notes on it):
    - ALL ivory, whoever spoke last ("Make the entire thing ivory"):
      the pane's `--spell-rail-bg`, outline and corners;  no shadow.
    - ORANGE while it's Owen's turn:  Claude spoke last, and he hasn't answered (✓, a reply, ×) (`unseen()`).
      - Owen, 2026-10-10:  "make the background of the entire bullhorn thread + the last claude reply orange".
        Then, on one that went ivory once looked at:  "I was expecting this to be orange, not ivory".
      - Looking at it no longer clears it:  the SEEN rule below only marks the reply read.
      - Orange is our colour for "changed since you looked".
      - The whole thread's ground:  `--ui-orange` mixed into the ivory, 13% (22% in the dark, where less reads brown).
      - Claude's latest reply (`data-latest`):  a stronger mix, 30% (40% dark), with a faint orange ring.
      - Its outline and header stay as on any thread (before 2026-10-10, only those turned orange).
      - SEEN:  he unfolds it (or opens it from its quote),
        or it's open with half of it (or half the screen) on screen for 1.2s (`SEEN_MS`) while the page is in view.
      - Remembered in this browser, per page, in the store the news-only cards kept before threads:
        `spell-comment-read:<path>`, `{ [comment id]: time of the latest Claude reply seen }`.
        A NEWER reply makes it orange again;  a closed thread never is.
    - Its header:
      - a chevron
      - the bullhorn (a green check circle once done)
      - its id, `M3`:  small and muted, an outline and no fill (epic `epic-workflow` P23)
      - the pane's summary (`headline()`):  the quote's first words, else the block's;  its tooltip the full place
      - No date:  each message has its time.
    - Then OWEN'S ANSWER, while it's his turn:  an epic page item's review pills
      ("same semantics/look as pills in item header").
      - They're `<epic-review>`'s (the pack's), drawn by the docs runtime with the same markup and look,
        since a guide doesn't load that pack.
      - ONE grouped pill of 24px square icon buttons, grey outlined, on the page's ground;
        each button its colour under the pointer.
      - Tooltips (Owen, 2026-10-10:  "No tooltip on those same buttons"):
        "That's good:  done", "Reply", "Skip it:  done, nothing more to do".
        - Each `title` is copied onto the button inside the `<ui-button>` (`titleInside()`), where the pointer lands,
          as the bullhorn's is.
        - See TOOLTIPS, below.
      - Approve's check (green):  "that's good".  The thread is done:  it folds, a check circle in its header.
      - Revisit's history (blue):  reply.  The cursor goes into the reply box at the thread's end.
      - The note box's x (grey):  "skip it".  Done, nothing more to do.
      - A toast says it's done, with Undo (`reopen`).  A closed thread shows Reopen in their place.
    - The pen, while his FIRST words wait and Claude hasn't had them:  they come back in a box to change.
      His pending reply needs none:  it's in the reply box.
    - The trash, always.
    - The MESSAGES:  the colour says who, and a bold "You:" / "Claude:" starts each one's first line.
      - Owen, 2026-10-10:  "Put You in bold, same line, before me and Claude: before yours".
        Earlier he'd dropped a separate name line.
    - Tight:  2px / 6px inside a message, 2px between them.
    - SMALLER than the page's text (Owen, 2026-10-10:  "Make text in comments smaller"):
      the last message 0.9em, as are the reply box and the pane's field.
      - Every message but the LAST smaller still, 0.8em, and quieter.
        - Owen, 2026-10-10:  "Make font smaller for "not current" things -- everything other than last message".
        - The "thinking…" stub and the Done line count as the last.
        - The times keep their size.
      - Owen's:  plain on the ivory, no box, but the same padding as a boxed one ("my text doesn't get bordered").
      - Claude's:  a light violet box (`--ui-violet` mixed light), no side bar.
        - Its outline only a faint violet ring drawn as a shadow, its border clear, so nothing moves.
          Owen, 2026-10-10:  "lighten border around your replies, make it just border-as-shadow".
        - Also "Taken into <epic> P<n>", and "Answered in the epic page" for an answer with no words here.
      - A green Done line once closed:  a check, "That's good." or "Skipped", the commit Claude named.
        A faint green ring, the same way.
      - While Claude THINKS about it (the comment's `working`):  "Claude: thinking…" last, in Claude's box.
        - its words violet and italic, a turning `circle notch`, its time when he started
        - His answer takes its place.
        - Owen, 2026-10-10:
          "What does it look like when you're thinking?  You could put in a stub and replace that when you've thought".
      - Each one's time in its top right corner, `position: absolute`:
        - The first's carries the day (`10/10 09:12`), the rest only the time, unless the day changed.
        - The full date and time is its tooltip.
        - A hidden copy floats there, so the first line's text stops short of it.
  - The REPLY BOX (`replyBoxFor()`):  last in EVERY open thread, no Revisit needed;  none once done, until Reopen.
    - Owen, 2026-10-10:  "How do I reply?  Probably should have a comment box at the bottom for me".
    - The pane's field (no placeholder, an `aria-label`), its floppy in the corner:
      a line or two, growing with its words.
    - It saves itself as he types (`reply`):  his PENDING reply (the last entry, his, not taken since) changes,
      rather than adding another.
    - Claude's turn:  it still shows, holding his pending reply to change or add to.
      - Once Claude is thinking about it (`working`), his words are read:  the box is empty again, and what he
        types is a new reply after them.
    - FOCUS LEAVING it (Tab, a click elsewhere) saves at once;  emptied, his pending reply goes.
    - Escape or ⌘ Enter saves, and the cursor leaves it.
    - Kept across redraws while he's in it, or it holds words not saved yet, the cursor with it.
      Else it's made again from what the server holds.
    - The pen's box edits his first words while the comment is `new` (`edit`), standing in for the reply box.
      - Focus leaving it, Escape or ⌘ Enter:  saved and closed.
      - Emptied, the comment goes only as the box closes, with Undo:  clearing it to type afresh never loses it.
    - A draft is kept in this browser while it differs from what's saved.
  - Owen's icon buttons outside the pill (the pen, the trash, the pane's ×) are plain:
    no ring, a tint under the pointer.
  - TOOLTIPS:  the browser's own (`title`), a few words each;  the longer wording is the `aria-label`.
    - Owen, 2026-10-10:  "The buttons don't have browser tooltips -- unclear what they do".
    - Each button's:
      - ✓ "That's good:  done"
      - Revisit "Reply"
      - × "Skip it:  done, nothing more to do"
      - Reopen
      - the trash "Delete this comment"
      - the pen "Edit your last words"
      - the pane's × "Close"
    - Why they didn't show in VS Code's side bar:  the pointer was on each button's icon.
      - Electron 38 and up, on macOS, mostly shows a `title`'s tooltip
        only while the pointer is on the titled element ITSELF, not on a child of it.
      - [electron/electron#49843](https://github.com/electron/electron/issues/49843), open;
        VS Code 1.141 runs Electron 43.
    - So every icon inside a comment's buttons takes no pointer, and the pointer lands on the titled button:
      - the pill's, the pen, the trash, the fold, the pane's × and floppy, the bullhorn
      - `pointer-events: none`, in spell-doc.css's "TOOLTIPS that show"
      - Keep it so for any new comment button.
    - A plain browser shows them either way.
      Headless Playwright can't show a native tooltip, only check what's under the pointer.
  - Built for reading offline, with no Claude:  only the page server writes them.
- SEND on a docs page (epic `epic-workflow` P13), as on an epic page:
  Owen comments, presses Send, and the session working the epic the page BELONGS to gets them.
  - The page header's right:  a pill, the paper plane, "Send" and how many comments aren't sent yet.
    - blue by the fill rule (grey outline:  nothing waiting;  dashed:  some not sent;  outlined:  sent)
    - then who is listening:  "python-target is listening" (a green dot), "nobody is listening",
      or "no epic owns this page";  each says more in its tooltip
    - The runtime's `drawSend()`.
      It asks again every 30s, since a session that stops leaves only an old heartbeat.
    - Not on an epic page:  its Send is `<epic-page>`'s.
  - Which epic:  `SeeAlso.ownerOf()` ([SeeAlso.ts](src/tool/SeeAlso.ts)), from the epics' See Also:
    - a page in `epics/<name>/details/`:  epic `<name>`
    - else the epic whose See Also lists it:  its guide's epic first (J88), then an open one,
      then the one updated last (Owen's Q12)
    - none:  `guide-changes`, as before
  - A click:  `POST /api/docs/comments/send`;  the comments waiting are sent (`GuideInbox` `sent`).
  - The epic's `epic inbox <name> wait` wakes on it, and prints each comment under its page.
    - The session answers each with `epic comments working` / `answer` (below), one at a time.
  - Nobody listening:  the Send WAKES the epic, as an epic page's does (P16, `ReviewStart.wakeFor()`).
    - `/epic review` typed into its session, or a new session in its window;  the toast says what it did
    - The comments wait, sent, for that review (its first `wait` takes them), or `/airplane land`.
    - Never for `guide-changes`.
- Where they're kept (git-ignored in the shared repo:  waiting work, per machine):
  - a docs page's:  its INBOX FILE, `<page>.inbox.json5` beside it, with its `sent` and `handedOver`
    - [GuideInbox.ts](src/tool/GuideInbox.ts), in the `epic` tool since P13:  the tool's `wait` reads it
  - an epic page's:  the epic's review inbox, under `comments` (`ReviewInbox`, see "Review inbox")
  - One shape for both, and every change:  [`CommentList`](src/tool/CommentList.ts).
  - IDS (epic `epic-workflow` P23):  shown `M1`, `M2` ... ("M" for mark;  Owen, 2026-10-10:  "use `M3` for mark 1")
    - small and muted in each thread's header, before its summary
    - every tool prints `M3`, and takes `M3`, `m3` or the old `cm3` (`CommentList.idOf()`, `label()`)
    - the inbox files KEY them `m1`, `m2` ... too (Owen, 2026-10-17, J178:  "Switch to m3 now";  `cm1` before)
      - an older file's `cm3` is read as `m3`, and written so at its next write (`CommentList.migrate()`)
      - a checkout on older code finds a comment by its key as it is:  until it merges `main`, it misses the
        comments written as `m3`, and its new ones are `cm1` ... again (read as `m` by this code, a clash renumbered)
    - `c1` is a caveat's
- Where a comment is:  its ANCHOR ([BlockAnchors.js](tools/BlockAnchors.js), shared by the runtime and the tools).
  - the block's id, else `<nearest section or plan part id>#<kind>-<n>`
    - e.g. `memory#table-2`, `p3#field-2`, `p3#update-1`
    - An item counts as a container for the updates inside it:  `q3#update-1`.
  - plus an excerpt, to find it again if the page changed
  - a text comment also has its `quote` and `offset`
- The routes:  [commentsRoutes.ts](tools/commentsRoutes.ts)
  - `GET /api/docs/comments?page=` (`takesComments`, every comment)
    - a docs page's `send` too:  `{ epic, owned, listening, sent, unsent, waiting }`
  - `POST /api/docs/comments/send { page }`:  a docs page's Send (an epic page:  400)
  - `POST /api/docs/comments { page, action: add | edit | delete | clear | restore | reply | resolve | reopen, ... }`
    - edit and delete only while `new`;  clear whatever its state
    - add and edit need text:  blank is a 400
    - `restore { id, comment }`:  the trash's Undo, the comment as the GET gave it (`CommentList.restore()`)
    - the thread:
      - `reply { id, text }`:  Owen's reply, as he types (blank empties his pending one;  none pending, a 400)
      - `resolve { id, how: good | skip }`:  "that's good" / "skip it" close it
      - `reopen { id }`
  - The GET adds each comment's `turn`.
    The runtime works it out itself from a server started before threads (`withTurns()`).
  - It carries the comment's `working` too, as the inbox holds it:  any server shows the thinking stub.
  - A page served under `/worktrees/<w>/` redraws on its inbox's change too:  the server announces a shared
    folder's files without that prefix (`inboxPaths`).
  - pages under `guides/`, `pages/`, `epics/` (epic pages too), `sagas/` (saga pages, in their own review inbox)
  - a component set's pages, at its address (`/components/epics/...`), never its `__parts/`
    - their inbox beside each, in the set's tracked `docs/` folder, git-ignored there
    - NOTE:  no bullhorn draws on them yet (epic `epic-workflow` P10):
      the route takes their comments, the page can't make one.
      Those pages load Spell UI's site bundle, not `spell-ui.js`.
  - NOT:
    - an epic page's `parts/`
    - details pages with questions, choice pages
    - `templates/`, the parked goal sets in `goals/` (thoughts), the Brand tab's own pages (`brand/`)
- Claude's side, for docs pages ([comments.ts](tools/comments.ts), [GuideChanges.ts](tools/GuideChanges.ts)):

  ```sh
  epic comments list [--all] [--json]
  epic comments wait [<page>...] [--timeout 8h]
  epic comments answer <page>#<id> --file <html> [--commit <sha>]
  epic comments working <page>#<id> on | off
  epic comments gather [<page>... | --all] [--epic <name>] [--json]
  ```

  - `wait`, run in the background, wakes the session with a comment that starts waiting (on those pages, else any):
    a new one, or Owen's reply on one.  It exits 2 on timeout.
    - e.g. the spell syntax guide's wand, a comment on its row:  "Provide more details here:  `IsGtLt`."
  - `working ... on` as Claude starts on a comment:  its thread shows "Claude: thinking…".
    - It sets the comment's `working`, since when (`CommentList.setWorking()`).
    - `answer` turns it off.
    - Not WAITING meanwhile, and Owen's words before it count as read.
  - WAITING (`CommentList.waiting`):  Claude's turn, not taken since Owen last spoke.
    So Owen's reply on a thread is new work, as a new comment is:  `list` shows it under the comment.
  - `answer` puts Claude's answer on the thread:  Owen's turn.  `--commit`:  the Done line shows it.
  - `list <epic>`:  the comments on the pages that epic owns, and those taken into it.
  - `working` and `answer` stamp the heartbeat of the session listening to the page's epic, if any.
  - `gather` takes every waiting comment (and page note still `new`) into ONE epic, `guide-changes`.
    - Only on pages NO epic owns (P13):  an owned page's go to its epic, unless the page is named.
    - one phase per page;  an Updated block in the page's phase while it's open
    - a reply rides along under its comment ("Owen replied on the thread")
    - each comment then `taken`
    - `/airplane land` runs it.
- Claude's side, for epic pages:  `epic inbox <name>` lists them, and Owen's replies under them.
  - They reach Claude with the page's SEND, as marks do (see "Review inbox"):
    a send with only comments wakes `wait`, which prints them.
  - `epic inbox <name>#M3 working on | off`:  the thinking stub, as `comments working`.
    With an item's id:  its spinner, as before.
  - Answered like a revisit's note, then:
    - `epic inbox <name>#M3 done [--file <html>] [--commit <sha>]`, or `<name>#M3 clear`
    - `done` turns `working` off.
  - `--file`:  the answer on the thread too.  Without it, "Answered in the epic page".

## Page notes

- Before P11 (comments), Owen left notes on docs pages (epic `airplane`, P3).
  - A bubble on each section's title, and a Note pill in the page header:  both gone since.
  - The notes written still show, read only, and `epic notes` still answers them.
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
  epic notes list [--all] [--json]
  epic notes answer <page>#<id> --file <html>
  epic notes done <page>#<id>
  ```

  - `epic comments gather` takes the `new` ones into `guide-changes`, with the comments.
- Regenerated pages keep their notes:
  `index.js` puts the groups of the part it rewrites back into their sections (`replaceBetween()`).

## Experiments

- Claims backed by measurement:
  scripts in `<topic>/experiments/`, e.g. `solid/experiments/`, `precedence/experiments/`.
  - Each has a header comment, saying how it was run.
- They live in the shared repo, so they DON'T run in place any more.
  - Node runs them from their real path in `../spell-app-dev`, where there's no `node_modules` and no `$/` aliases.
  - To re-measure, copy one into the repo, under `packages/epics`, and run it there.
    (Its `tsconfig.json` extends `tsconfig.base.json`.)
- Tables quote medians of several runs, never a single run.
- Keep the scripts:  they re-measure on upgrades.
- A guide's own LIVE elements, e.g. the custom elements guide's `<ui-counter>`:
  - Their TypeScript source is in its `experiments/`, with an entry file.
  - [bundle-experiment.ts](tools/bundle-experiment.ts) builds them into ONE classic script beside it.
  - The page loads it right after `spell-ui.js`.
  - It's built as a component pack is, so the elements extend the page's own Spell UI:
    - Vite, on Spell UI's `baseConfig()`
    - Solid, `$/spell-solid` and `$/ui/core`, from the page's `SpellUI.packModules`
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
    - The `epic` tool links through the same code.
  - Run it under `tsx`, never plain `node`:  it imports `$/assembler`.
    - The tools run it through `docLinksRun()`, in [pages.js](tools/pages.js).
- A link to a SAGA, an EPIC, a PHASE or an ITEM is written by what it points at, never by a path
  (epic `epic-workflow` P15):
  - `<epic-link epic="seo" item="J3"></epic-link>`:  draws `seo J3` with J3's title as its tooltip;
    `saga`, `epic`, `item`, `phase` (rules:  [PLAN-DOC.md](src/tool/PLAN-DOC.md), "Links").
    - It's the epics pack's:  a guide using it loads the pack in its `<ui-root>`,
      `<ui-components source="<up>packages/epics/components/__pack/epics.pack.js">`, as epic and details pages do.
  - Or a plain link to a SHORT ADDRESS, on any page:  `<a href="SAGA:/drawable-spell/python-target#T1">`.
    - The runtime rewrites it to the page and its `#id` (`wireAddresses()`), in that epic's tab.
    - `doc-links.js` gives it no target and leaves it alone.
  - `doc-links.js --check` fails on a saga, page or id that isn't there, and on an epic under a saga it doesn't name
    (the epics tool's `EpicTargets`:  `Linker`, in `$/assembler`, imports no package and skips them).

## Finishing a page

In this order, from `packages/epics`:

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
    - default out:  `project/components/`, in Spell UI's `build/design-system/`
- `yarn tsx tools/bundle-experiment.ts <entry.ts> [<out.js>]`:  a guide's live elements, as one classic script.
  - See "Experiments".
  - default out:  `<name>.bundle.js`, beside `<name>.entry.ts`
- [check-design-bundle.js](tools/check-design-bundle.js) `[bundle.js] [outDir]` (`yarn design:check`), with Playwright:
  - the design bundle, inlined into an `about:srcdoc` frame:  icons, code colours, markdown, no errors
  - then a board under Claude Design's own runtime, whose `<ui-button onClick>` must count
    - the runtime:  [dc-runtime.js](tools/vendor/claude-design/dc-runtime.js), copied from claude.ai
  - Run it after touching the design target.
- [design.js](tools/design.js) (`spell dev design pull | changed | pushed | state`):
  the local half of the `/design` skill.
  - a Claude Design board, as a page
  - the push record:  `design-system.json` in `brand/`, shared
- `spell dev docs index` ([index.js](tools/index.js)) rewrites:
  - the docs' home page's area cards
  - each area's list page:  `index.html` in `epics/`, `guides/`, `sagas/`, `templates/`, `brand/`
  - it reads the sagas through `Sagas` ([Sagas.ts](src/tool/Sagas.ts), by path)
- `spell dev docs new` ([new-page.js](tools/new-page.js)):  a page from a template, at any depth.
- `spell dev docs open [page] [--vs | --review]` ([open.js](tools/open.js)):  shows a page, by default the index.
  - `page` may be a short address:  `SAGA:/drawable-spell`, `SAGA:/drawable-spell/python-target#T1` (landing on T1)
  - in Chrome, reusing its tab
  - `--vs`:  in VS Code's doc preview, the right side bar's "Spell Docs" tab (`/spell-docs`)
  - `--review`:  its "Review" tab (`/epic review`)
  - Each tab keeps its own page.
    Showing the page a tab already has doesn't reload it:  the page updates itself.
- `epic ask` ([details.js](tools/details.js)):  details pages (see "Details pages").
  - [detailsRoutes.ts](tools/detailsRoutes.ts):  the page server's route module for their answers
- `epic choices` ([choices.js](tools/choices.js)):  choice pages (see "Choice pages").
  - [choicesRoutes.ts](tools/choicesRoutes.ts):  their drafts and answers
- `epic comments list | wait | gather | answer` ([comments.ts](tools/comments.ts)):  comments on docs pages.
  - See "Comments".
  - [commentsRoutes.ts](tools/commentsRoutes.ts):  the pages' bullhorns
- `epic notes list | answer | done` ([notes.ts](tools/notes.ts)):  page notes, from before comments.
  - See "Page notes".
- Forwarders to the `epic` tool (see "Epic pages"):  `plan-doc.js`, `plan-parts.js`, `inbox.js`, `review-backfill.js`.
  - The tool:  `PlanDoc`, `PlanParts`, `ReviewInbox`, `ReviewBackfill`, in [the tool's folder](src/tool/).
  - For old imports, and callers on older code.
  - The review routes are [reviewRoutes.ts](src/tool/reviewRoutes.ts).
- `epic agents add | set | done | list | wait | told` ([agents.ts](tools/agents.ts)):
  the running-agents list (epic `skillz`), on [AgentList.ts](tools/AgentList.ts).
  - Every background agent a Claude session started, by name, while it runs.
  - The file:
    - in an epic:  `agents.json5` in the epic's folder (git-ignored in the shared repo)
    - else:  `.spell-agents.json5` at the checkout's root (git-ignored)
    - `--epic <name>`, on any verb, picks the epic
  - Names get a prefix:  the epic's, else the worktree's, else `main`.
    `add aaa` in epic `skillz` is `skillz-aaa`.
  - An entry leaves when its agent finishes (`done`).
    Empty, the file goes.
  - Every write is under the file's lock (`SRV.FileLock`) and atomic, as the review inbox's.
  - REDIRECTS (P3):  an epic page's "Agents running" panel (`<epic-page>`, `packages/epics`) shows an epic's list,
    with a note box per agent.
    - Owen's note goes through [agentRoutes.ts](tools/agentRoutes.ts), guarded as the review routes are:
      - `GET /api/epics/agents?page=`
      - `POST /api/epics/agents/redirect { page, name, note }`
    - It goes into the entry's `redirects`, untold.
    - Until a session's background `wait` takes it, sends it to the agent, and marks it `told`.
  - The verbs, and an example:  the header of [agents.ts](tools/agents.ts).
- `spell dev docs link <page> [--hash <id>] [--text "..."] [--review] [--show]` ([link.ts](tools/link.ts)):
  the markdown links Claude gives for a page.
  - side bar first (`--review`:  its "Review" tab), then `• 🌐`, the browser link (Owen, 2026-10-11)
  - `<page>` may be a short address (`SAGA:/drawable-spell/python-target#T1`):  its `--hash`, and its text the short
    form and the item's title (`python-target T1 · ...`)
  - both through [showRoutes.ts](tools/showRoutes.ts) (`GET /api/docs/show`)
- `spell dev docs fuss <paths...> | --branch [--json]` ([fuss.ts](tools/fuss.ts)):
  the writing checker under `/fussbudget` (epic `skillz`, P7).
  - It lists the misses of WWOD §6 a tool can find, by file and line.
  - kinds:
    - `phrase-split`:  a line ending in a new phrase's first 1-4 words
    - `dense`:  3+ sentences in one paragraph or bullet
    - `jargon`:  a package's banned words (`Fuss.JARGON`)
    - `path-in-prose`:  a file path in a page's or Markdown's running text
    - `code-dense`:  a sentence of 3+ code spans, in a page or Markdown
  - It reads comments and docstrings in code, and Markdown.
    In `.html` pages, everything but `phrase-split`:  the formatter wraps their lines.
  - Exits 1 on any miss.
  - Runs in the caller's folder, so its paths are from there.
- [pages.js](tools/pages.js):  shared by the scripts.
  - the areas:  `EPICS`, `GUIDES`, `PAGES`, `TEMPLATES`, `BRAND`, `GOALS`, `SAGAS`, `HOME`, `LIST_PAGES`
  - `findPages()`
  - `pageFile()`:  a page argument to its file
  - `atDepth()`:  a template at a page's depth
  - `parseArgs()`:  a tool's command line, `--key value` flags and positionals
  - `tidy()` (link targets + oxfmt), `serialize()`
  - `openInChrome()`, `openInVSCode()`
    - epic pages:  the doc preview, through the spell extension's `DocPreview`
    - `{ view: "review" }`:  the "Review" tab
- `tools/check-spell.js <page> [outDir]`, with Playwright:  writes screenshots.
  - It loads the page from `file://`, or from the page server when the page says `data-spell-needs-server`.
  - It fails on:
    - console errors
    - an undefined or unrendered `ui-*` or `epic-*` element (an epic page's, the `epics` pack)
    - a toolbar that doesn't list every top-level section (an epic page's:  its `<epic-*>` blocks)
    - a toolbar that isn't on screen at the top, at phone width
    - a page still drawing the old floating rail
    - phone-width overflow, a squeezed content column
    - top-level titles that don't stick (an epic page's largest item section opened first)
    - a section that won't fold / unfold, or forgets its fold on reload
    - an epic page's open `<epic-item>` whose line won't stick under its section's title (Q6, desktop and phone)
- The plan-doc checks are in [the demo folder](demo/), with the review runtime.
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
    - the page header and the review line
    - the Phases section's `open/all` badge (item sections show only their state chips)
    - the state filter
    - each phase's title pen and plan changes (`<epic-update>` blocks, no box)
    - at 280 / 900px, light and dark
  - `node packages/epics/demo/check-comment-jump.mjs [--guide <page>] [--doc <epic>] [outDir]`, from the root:
    - comment ids (`M1` ...), the toolbar's bullhorn and its count, Cmd-K on a comment's id and its waiting list,
      on a guide and an epic page (epic `epic-workflow` P23)
    - their comments stubbed in the browser, every POST aborted:  no inbox read or written, nobody woken
    - Run it after touching the comments' runtime, the toolbar or the jump dialog.
  - `node packages/epics/demo/check-fold-epics.mjs [--doc <name>] [--item <id>] [--guide <path>] [outDir]`, from the root:
    - A fold never moves what was clicked:  the line or title stays put, within 1px, for 1.5s after the click.
    - Items a link landed on (at once, mid window, near the page's end), one opened by a click,
      a phase, a guide's section, and the next item's line clicked after a reply.
    - At 1200 and 390px.
    - Run it after touching the folds, the landing, or `holdWhileFolding()`.
- `tools/to-ui-section.js <page>...`:  converts old `section.s2|s3` pages to `<ui-section>`, ids kept.
  - Idempotent;  it refuses saga pages.
  - Also the migration step `ui-section` (below).
- [migrate.js](tools/migrate.js):  the MIGRATION steps of every page kind but the epic page's (epic `epic-workflow` P8).
  - `epic migrate [<kind>] [--file <page>]` runs it as a child, beside the epic page's own steps
    ([PLAN-DOC.md](src/tool/PLAN-DOC.md), "Migrations").
  - `KINDS`:  the page kinds, the same list as the `epic` tool's `PAGE_KINDS` (its test checks).
  - `pageKind()`:  a page's kind, from where it lives and what it loads.
  - `STEPS`, oldest first, each named and dated, each page under its lock (`withLocks()`, from `relocate.js`).
    Today:
    - `ui-section` (`to-ui-section.js`)
    - `answer-elements` (`to-answer-elements.js`, epic `epic-workflow` P12):
      - details and choice pages (and `templates/review.html`) in the epics pack's elements
      - the old shared `details.html` and `syntax-choices.html` templates become copies of the tools' own
      - `pagesFor()` lists every `details/` page for it
    - A step's `run(document, { file })` gets the page's path:  a choices page's rows file is beside it.
  - The shared-content repair (`relocate.js`) is NOT a step:  it moves files between folders, and
    `spell dev shared commit` runs its reorg every turn.
  - A change to a page kind's markup adds its step here, in the same commit.
- [doc-links.js](tools/doc-links.js):  see "Links".
  - Text and regexes, not a DOM:  it edits only what it links.
  - Its page arguments are from where it runs:  a guide, from epics' folder, is `../../guides/x.html`.
  - `--root <checkout>`:  links resolve in another checkout (a copy of the pages beside a copy of the code).
  - The linking itself is `$/assembler`'s `Linker`.
  - `PlanParts.formatHTML()` is `$/assembler`'s `formatHTML()` too.
- [relocate.js](tools/relocate.js):  the docs' moves, and their repairs.
  - into the docs package's `content/`, 2026-10-04
  - out into the root folders, 2026-10-05
  - the docs package's end, 2026-10-13 (`people-and-orgs` P16;  `relinkDocsPackage()`):
    its tools moved into epics' `tools/`
    - The shared pages' links to the old tools and `_assets`, their tab names, and path mentions in prose.
    - Run ONCE when `people-and-orgs` merges into `main`, from the main checkout:

      ```sh
      node packages/epics/tools/relocate.js relink --shared ../spell-app-dev [--dry-run]
      ```

  - the component sets' layout, 2026-10-13 (`people-and-orgs` P18;  `relinkSets()`):
    `relink-sets`, ONCE at that merge, after `relink`;  never by `repair` (the script's header says why)
  - `spell dev shared repair` runs them all.
  - `spell dev shared commit` runs the reorg's (`reorgShared()`):
    pages older code wrote at old paths move on, and old-style links are fixed (the old tools' too).
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
