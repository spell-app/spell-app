# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/epics`.

**READ the repo root's `AGENTS.md` and WWOD (`agents/wwod/WWOD.md`) FIRST:**  the repo's layout, and the
house style every package shares.  Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- A COMPONENT PACK:  `<epic-*>` custom elements, written as Spell UI families, that a page loads on demand
  through `<ui-root>` (its `<ui-components source>` names the pack's script):

  ```html
  <ui-root>
    <ui-components source="../../packages/epics/pack/epics.pack.js"></ui-components>
    <epic-...> ... </epic-...>
  </ui-root>
  ```

- Made by `spell dev pack new epics --prefix epic-`;  its tooling is the CLI's (`spell dev pack`,
  `packages/cli/src/dev/pack*.ts`), so every pack builds and checks the same way.
- `components/<tag>/` (`$/epics/components`) -- one folder per element family, written exactly like a Spell UI
  family (`packages/ui/AGENTS.md`, "Overview" and "Solid authoring"), every file named for its COMPONENT:
  `<Name>.tsx` (the component, on `E.UIComponent`), `<Name>.en.ts` (its tag's vocabulary:  topics + aka, skeleton
  text), `<Name>.css`, `<Name>.test.tsx`, `<Name>.types.ts` (only what several of its files share), `index.ts`
  (defines its tags:  SIDE EFFECT).  No native fallback:  only form controls have one.
  - A new one:  `spell dev pack element epics <tag>`, the tag starting `epic-`.
- `src/` (`$/epics`, `EP`) -- code the elements and the node tools share, and `pack.test.ts`, which runs
  `spell dev pack check epics`:
  - `definitions/` -- the ONE description of every element:  `Definitions.all`, each vocabulary as data plus
    `children` (the content model).  Node-safe:  imports vocabulary files, never a family's barrel
  - `markup/` -- `Markup` (make, read, set, append) and `MarkupCheck` (validate a doc):  linkedom or the browser's DOM
  - `dates/` -- `PlanDates`:  every date an element draws, `10/8/26 14:34` (`10/8/26` for a day), from whatever form
    the doc holds;  NOT the log's (`<epic-event>`).  A time alone (`saved 14:42`):  `PlanDates.clock()`
  - `review/` -- `ReviewClient`, one per page:  the review inbox's reads and writes (`/api/review/*`), token
    refresh, polling, note-draft backups (the old runtime's localStorage keys).  Touches no browser global until
    `forPage()` / `watch()`.  The `ReviewControls` of `<epic-item>`, `<epic-section>` (Overview parts),
    `<epic-phase>` and `<epic-summary>`, the new-item controls (`NewItems.tsx`:  `<epic-page>`'s `+`, the Todos and
    Questions sections) and `<epic-option>`'s Choose pill use it;  the controls show while `<epic-page reviewing>`
    is set
    - `AgentsClient`, one per page:  the epic's running agents (`/api/agents`, `packages/docs/tools/agentRoutes.ts`)
      and Owen's redirects;  `<epic-page>` draws them as its "Agents running" panel (`AgentsPanel.tsx`, in its shadow
      root before its blocks:  not a section).  Both clients POST and watch through the same code, a `ServerLink` each
      (the token, its one refresh on a 403, the poll and `spell-server:file`)
  - `convert/` -- the one-time converter, old markup => `<epic-*>` (`Converter`, `ConvertRun`), with a
    `ConversionProof` per doc:  every id, link target and word kept.  Never writes into `epics/` or `spell-app-dev`
    unless it's the switch (P12 of epic `epic-components`)
  - `tool/` -- the plan-doc tool (`spell dev plan-doc`), node only, never bundled into the pack.  It writes
    `<epic-*>` markup through `Markup`, refuses to edit a doc still in the old markup ("convert it first"), and reads
    both until the switch (`OldPlanReader`).  Its rules for a doc's DATA (ids, statuses, review marks, prose):
    `tool/PLAN-DOC.md`;  its template:  `tool/templates/plan.html`
- `pack/` -- GENERATED, committed (`spell dev pack build epics`, `yarn pack:build`).  NEVER edit:
  - `epics.catalog.ts` -- tag => family folder + skeleton, read from the vocabularies;  its second line records
    the hash of the sources it was built from
  - `epics.entry.ts` -- the script's entry:  `SpellUI.registerPack({ name, prefix, catalog, define })`, where
    `define()` imports every family barrel
  - `epics.pack.js` -- the CLASSIC script (an IIFE) a page loads, minified;  Solid and Spell UI's shared
    modules (`solid-js`, `@solidjs/web`, `$/ui/core`, `$/ui/forms`) are NOT in it:  it takes them from
    `globalThis.SpellUI.packModules`, the docs bundle's, so a page has ONE Solid and one `UIComponent`

## Rules

- Change an element -- its vocabulary above all, or any file under `components/` or `src/` -- then
  `spell dev pack build epics` (`yarn pack:build`), and commit `pack/` in the same change.
  - `yarn pack:check` exits 1 while `pack/` is stale, and `src/pack.test.ts` runs it:  so `yarn test` and
    `yarn review` fail until you build.
- Elements import Spell UI's code ONLY from `$/ui/core` / `$/ui/forms` (as a Spell UI family does), and Solid from
  `solid-js` / `@solidjs/web`:  the build fails on any other `$/ui/...` or Solid import, which the page couldn't
  share.  Another shared module:  add it to Spell UI's `packModules` AND `PACK_MODULES` in
  `packages/cli/src/dev/packBuild.ts`.
- Every tag starts `epic-`:  `<ui-root>` knows the pack's tags by that prefix.
- A pack drawn by pages EVERY checkout shows (the shared `epics/`, `guides/` ...):  those pages load `main`'s
  `pack/`, through the main checkout's page server.  So:
  - small fixes straight on `main`
  - real changes in a worktree, merged promptly:  until then, those pages show `main`'s elements

## Commands

- `yarn pack:build` ~== `spell dev pack build epics` -- the catalog, the entry and the script, into `pack/`
- `yarn pack:check` ~== `spell dev pack check epics` -- exits 1 while `pack/` is stale
- `yarn test` -- `node` (`src/`) and `browser` (`components/`, chromium);  the root's `yarn test` runs them as
  `epics:node` / `epics:browser`
- `yarn ts`, `yarn lint`, `yarn format`, `yarn review`
