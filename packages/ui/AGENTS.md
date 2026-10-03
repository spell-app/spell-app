# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/ui`.

Conventions every package shares -- Solid 2, Long-term debt, Documentation, Functions, Decorators,
Types / Exports, Imports -- are in the repo root's `AGENTS.md`:  READ it FIRST.  Only what's local is below.

## Overview

- `@spell-app/ui` is Fomantic UI reborn as `ui-*` custom elements on a modern CSS foundation:  Fomantic's
  vocabulary (`ui small primary basic icon button`), shadow DOM, `@layer`s, OKLCH tokens, accessibility built in.
  Usable from any framework or plain HTML.  Built on **Solid 2** (`solid-js` / `@solidjs/web` `2.0.0-rc.13`,
  pinned exactly) through our fork of its custom-element layer, `@spell-app/solid-element`.
- The approved design is `docs/plan.md`.  Read "Decisions" and "Architecture" there BEFORE adding a component
  or runtime service.  `docs/report.md` is the generated status report (bundle, perf, hosts, HMR, fallbacks).
- `docs/status.md` is the per-component checklist (status, tests, size, keyboard, docs page, deferred items).
  MUST be updated in the same change that builds, finishes or defers anything in it.
- Layout:
  - `../solid-element/` -- `@spell-app/solid-element`, the fork of `@solidjs/element` + `component-register`
    (upgrade, forms, lifecycle, error boundary, HMR fixes;  `UPSTREAM.md` maps each to a PR).  A workspace of
    the monorepo (`workspace:*`), with its own tests (its dependencies are hoisted to the root `node_modules`, like every package's);  run its scripts with
    `yarn fork <script>`.  NEVER import its files from `src/`:  use the package name.
  - `../util/` -- `@spell-app/util` (`$/util`), shared with `spell`:  `@proto` (`decorators.ts`), `class.ts`, `string.ts`
    (case, `numberToWord`, `suggest`), `dom.ts` (`closestAcrossShadow` ...), `util.types.ts`.  `src/util/index.ts`
    (`$/ui/util`) re-exports it, so source keeps saying `from "$/ui/util"`;  its declarations ship in `dist/_util/`.
    `src/util/index.ts` imports util's GENERIC files one by one (`$/util/class` ...), never `$/util`'s barrel, which also
    holds spell's utilities (lodash, `chalk` ...):  an allowed exception to the barrel-only rule.
    A helper only `ui` uses goes in `src/util/`, one `spell` also needs moves to `$/util`.  Everything in `$/ui/util`
    lands in the `core` bundle (`core.ts` re-exports it), so keep it small
  - `src/vocabulary/` (`V`) -- the naming layer:  vocabulary schema, value sets, `Vocabulary` (registry, translated
    names, `replace()` for hot reload), `Converters`
  - `src/runtime/` (`UI`) -- the shared `UI` runtime, ONE instance per page (`globalThis.UI ??= new UIRuntime()`).
    Components call `UI.load()` on connect, which dynamic-imports this chunk once.  Services are classes:
    `Browser` (sniffing + `UI.browser.supports` flags), `Keyboard`, `Overlays`, `Focus`, `Styles`, `Vocabulary`,
    `I18n`, `Transitions`, `Ids`, `Toasts`, `Modals`, `Api`, `IconPacks` (`UI.icons`), `Sources` (`UI.sources`)
  - `src/icons/` -- the icon PACK format (`IconPackIndex`, `IconName`, `BuiltInPacks`) and the built-in packs
    (`icon-packs/<id>/`:  SVG files + `pack.js`);  loading and caching are the runtime's (`UI.icons`);  packs are built by
    `tools/IconPackBuilder.ts` (`yarn icons:pack`);  see `docs/icons.md`
  - `src/elements/` (`E`) -- the element core:
    - library-neutral:  `ClassBuilder`, `Validator`, `MenuOptions`, `OwnerContext`, `Shorthand`, `NativeFallback`
    - the Solid layer:  `UIHost` / `FormHost` (host base classes), `UIElement` (the CONTROLLER base:  one instance
      per element, `render()` returns JSX), `ElementDefinition` (vocabulary => the fork's props), `FormElement`,
      `Controlled`, `Cell`, `SlotContent`, `HostAttribute`, `PartContext` + `ContentPart` (owner context),
      `IconGlyph`, `SourceElement` + `SourceHost` (the base of the elements that show a text file:  `source`, inline
      text, loading / error look, `save()`), and the dev-only `HotDefinitions` (NOT in the barrel)
  - `src/components/ui-<name>/` -- one folder per component FAMILY, named after its main tag (`ui-button/`);  the
    family's own files carry the same name (`ui-button.css`):
    - `UI<Name>.tsx` (or `.ts` without JSX) -- one element class per file:  `UIButton.tsx`, `UIButtons.tsx`,
      `UIOr.tsx`;  family helpers beside them (`SlottedItems.ts`, `PartElement.ts`)
    - `index.ts` -- the family barrel:  calls `define()` for every tag (SIDE EFFECT), re-exports the classes.
      Also the family's lib entry (`@spell-app/ui/ui-button`) and its hot-reload boundary
    - `ui-<name>.css` -- port of Fomantic's `.less` + `.variables`
    - `<tag>.vocabulary.en.ts` -- ONE per tag (`ui-button.vocabulary.en.ts`, `ui-buttons.vocabulary.en.ts`,
      `ui-or.vocabulary.en.ts`):  EVERY name the tag uses:  tag, attributes (kind + allowed values), values, events,
      slots, parts, states, text strings.  Translations become `<tag>.vocabulary.<lang>.ts`
      - and `topics` (2+ ids from `ValueSets.topics`:  how a newcomer looks for it AND how widget libraries file it)
        + `aka` (other libraries' / everyday names:  `ui-modal`:  `dialog`, `lightbox`).  A NEW TAG MUST fill both;
        `src/components/component-definitions.ts` rolls them up (the docs' component browser) and
        `test/component-definitions.test.ts` fails on a tag without them.  A new or moved tag also needs `yarn gen:root`
        (`<ui-root>`'s catalog of tag => family;  `test/root-catalog.test.ts` fails while it's stale).  Live:  `UIButton.describe()`
    - `ui-<name>.types.ts` -- the folder's loose constants, types and shared vocabulary pieces (nothing top-level
      stays loose in an element / fallback / helper file);  a helper function becomes a private static on the one class
      that uses it, else a static on a small class here.  Constants used by SEVERAL folders live in
      `src/components/components.types.ts` and are used as `UIT.<NAME>` from `$/ui/core`.  NOTE:  a types file imports its
      vocabularies with `import type` only (vocabularies import values from it:  a value import is a cycle);
      `ui-parts.types.ts` is the exception
    - vocabularies and types files are PURE DATA:  `$/ui/core` for types only;  shared constants by value come
      straight from `components.types` (`import * as UIT from "$/ui/components/components.types"`).  Why:  core loads
      the element layer, and the docs site's server render (`astro dev`) evaluates vocabularies, where Solid's client
      APIs throw.  `test/vocabularies.test.ts` enforces it
    - `ui-<name>.fallback.ts` -- the native fallback (plain DOM, no Solid) shown when the element's render throws
    - `ui-<name>.test.tsx` (elements), `ui-<name>.css.test.ts` (the sheet on class-grammar markup),
      `ui-<name>.fallback.test.ts`, `ui-<name>.a11y.test.ts`, `ui-<name>.perf.test.tsx`
    - `examples/*.html` -- Fomantic's examples in CLASS GRAMMAR (static markup, the CSS tests and the site);
      `examples/elements/*.html` -- the same examples as `ui-*` ELEMENT markup (axe in `ui-<name>.test.tsx`,
      `yarn dev`, `yarn test:visual`);  `examples/elements/<example>.visual.ts` -- optional OPEN states for the
      visual tests (`docs/visual-testing.md`)
  - `src/core.ts`, `src/forms.ts` -- the two SHARED lib entries (`@spell-app/ui/core`, `@spell-app/ui/forms`):  `core` is
    the element core + the foundation JS every family needs;  `forms` what only form controls with a VALUE need
    (`FormElement`, `FormHost`, `Validator`, `MenuOptions`).  Component files import shared code ONLY through
    these (see "Solid authoring")
  - `src/styles/` -- `layers.css`, tokens, colours, sizes, reset, typography, animations, utilities, `native.css`,
    `themes/`;  its own lib entry (`@spell-app/ui/styles`)
  - `src/index.ts` -- `@spell-app/ui`:  registers every family (side effect) and re-exports them, plus `E`, `V`, the
    runtime, styles and icons
  - `test/` -- shared test utils and cross-family tests:  `Fixture.render(html)` (`fixture.ts`),
    `A11y.check(el)` / `expectAccessible(el)` (`a11y.ts`), `ElementFixture` (render + wait for `ready` +
    `flush()`, `breakRender()`), `StubOwner` (stand-in owners:  card, feed ...), `PerfRun` (the dropdown
    benchmark), `fallback.cases.ts`, `dictionary.es.ts`, `VisualOpen` + `test.types.ts` (visual-test hooks),
    `visual/baselines/` (screenshots, `yarn test:visual`);  `fallback` / `isolation` / `translate` / SSR / DSD
    tests.  Every test runs in a REAL browser (Vitest browser mode + Playwright, chromium by default), except
    `*.ssr.test.tsx` (node)
  - `tools/` -- package tooling (node scripts run by `tsx`, see `tools/README.md`):  bundle measurement, peer
    vendoring, import-map smoke pages (framework hosts), LOC, report tables, the HMR end-to-end test;
    `tools/demo/` is the `yarn dev` site;  `tools/visual/` the visual tests;  results go to `tools/results/`
    (git-ignored)
  - `site/` -- Astro docs site, modelled on Fomantic's docs, on the live components
  - `docs/` -- design docs (`plan.md`, `grammar.md`, `theming.md`, `translation.md`, `icons.md`, `fallback.md`,
    `runtime.md`) and the generated `report.md`
  - `scripts/` -- generators (`gen-styles.ts`, `gen-icons.ts`, `gen-root-catalog.ts`, `gen-spell.ts`)
  - `src/languages/` -- GENERATED, committed:  `spell.<lang>.js`, spell's pre-compiled highlighter for
    `<ui-code language="spell">` (`yarn gen:spell`;  the root `AGENTS.md`'s one `ui` -> spell exception).  NEVER edit;
    lint and format skip it
  - `reference/Fomantic-UI/` -- READ-ONLY, git-ignored clone of Fomantic for porting.  NEVER edit or import it.
- Commands:
  - `yarn review` -- tsc (root, node configs, the fork) + oxlint `--fix` + oxfmt + every test (`ssr`, `browser`,
    the fork's);  MUST pass before you hand work back
  - `yarn build` -- tsc + vite library build into `dist/` (entries `core`, `forms`, one per family, `styles`,
    `index`;  `dist/icon-packs/`;  `.d.ts` beside the `exports` paths, from `declarations()` in `vite.config.ts`)
  - `yarn test` -- `ssr` project first (it writes `.cache/ssr-button.html`, which `test/dsd.test.ts` reads), then
    `browser`, then `yarn test:fork`
  - `yarn test:all` -- chromium + firefox + webkit (`yarn test:browsers` once first)
  - `yarn test:visual [--os local|linux|both] [--browsers all|chrome|webkit|firefox] [--update] [--grep <family>]
    [--parity]` -- screenshot tests of every element example, light + dark, against the baselines in
    `test/visual/baselines/` (Playwright `toHaveScreenshot`;  `linux`, the default, renders in Playwright's
    Docker image).  `yarn test:visual:update` ~== `--update`.  See `docs/visual-testing.md`
    - NOT part of `yarn review` (slow, needs Docker), but MUST run before a change that alters rendering (CSS,
      markup, tokens, an example) is handed back
    - a change that alters rendering MUST update its baselines in the SAME change (`--update`), after reviewing
      every diff in the HTML report;  never update to silence a diff you haven't looked at
  - `yarn dev` -- `tools/demo/`:  every example as class grammar beside elements;  edits hot-reload
  - `yarn icons:pack <folder> --id <id> [--sanitize] [--skip-unsafe | --allow-unsafe]` -- verify a folder of SVGs
    and write its `pack.js` (keeps hand edits);  `--sanitize` strips unsafe attributes first;  files that still fail
    refuse the pack, unless skipped or allowed
  - `yarn vendor`, `yarn measure`, `yarn smoke`, `yarn report`, `yarn test:hmr` -- see `tools/README.md`;
    `yarn report` rewrites `docs/report.md`'s tables (run it twice:  no diff)
  - `yarn fork <script>`, `yarn fork:install`, `yarn fork:build` -- the fork's own scripts.  Its `dist/` is only
    needed by `yarn vendor` / `yarn measure`, which build it when stale (`tools/ForkBuild.ts`);  dev, tests,
    the site and the library build use its source
  - `yarn site:dev`, `yarn site:build`
  - Use `yarn tsc`, not `npx tsc`:  yarn picks the workspace's TypeScript 7.  (The `@typescript/typescript6` that
    `vite-plugin-dts` needs once linked `.bin/tsc` as TypeScript 6;  with hoisting the root `.bin/tsc` is 7 today,
    but that's luck of the hoister -- see the root's `PAPERCUTS.md`, `## ui`.)
  - NEVER hardcode `<package>/node_modules/<dep>`:  yarn hoists to the root.  Node code asks `tools/NodePackage.ts`.

## UI rules

- Shadow DOM EVERYWHERE, with SEMANTIC shadow markup:  `<button>`, `<dialog>`, `<input>`, `<nav>`, `<table>` ...
  NEVER a `<div>` where an element exists.
- Inside shadow roots, keep Fomantic's class grammar on those elements:  `<button class="ui small primary button">`.
  Why:  it's a mechanical port of the `.less`, and the app stylesheet / `::part` override language is the known
  vocabulary.  Translated names never touch CSS.
- Units:  NEVER `rem` -- the page stylesheet can redefine it.  Sizes derive from px-valued `--ui-font-size`
  (default `16px`) and `em` inside components.
- Sizes are ratios of 16.  `medium` is a real size meaning "default" -- a no-op that emits no class.
- Booleans:  presence / `""` / `"true"` / `"yes"` ~== true;  `"false"` / `"no"` ~== false.
- Widths:  attribute is `width`, NEVER `wide`;  accepts columns (`4` of 16), fractions (`1/4`), percentages (`25%`).
  Exception:  `<ui-sidebar>` and `<ui-flyout>` also take Fomantic's width words (`very thin`, `thin`, `wide`,
  `very wide`), which the element adds after the noun (`ui left sidebar thin`).
- Chosen state:  `selected` is canonical (checkbox, radio, toggle, items, tabs, options);
  `checked` is accepted as an alias on checkbox / radio only.
- Generic content parts (`<ui-content>`, `<ui-header>`, `<ui-meta>`, `<ui-description>`, `<ui-extra>`,
  `<ui-actions>` ...) style themselves by OWNER CONTEXT (`:state(in-card)` via `ContentPart`).
  NEVER `ui-card-header`, NEVER `:host-context`.
- Events:  `CustomEvent`s, `bubbles: true, composed: true`, lowercase kebab `ui-*` names (`ui-change`, `ui-open`);
  `detail` carries computed state (`{ value }`, `{ open }` ...) plus `originalEvent`.
- Rich data (`options`, `rows`) as JS PROPERTIES -- real accessors on the class, so frameworks find them with `key in el`.
  Primitives as REFLECTED attributes.  First paint MUST NOT need a rich property (SSR drops them).
- Vocabulary files own every name:  NEVER a string literal for an attribute / event / slot / part name in a
  template or `ClassBuilder` -- read it through the component's vocabulary.
- Class defaults (vocabulary, default settings, part names) are `@proto static` (from `$/ui/util`), so instances
  carry no per-instance copies.
- Prefer classes over loose functions for anything that coordinates:  runtime services are classes
  (`Keyboard`, `Overlays`, `Styles`), builders are classes (`ClassBuilder`).  A helper that earns a name
  becomes a private method or a small class.
- CSS layers:  `@layer ui.reset, ui.tokens, ui.base, ui.components, ui.utilities, ui.theme, ui.app;`
  - inside `ui.components` each component declares sublayers `types, content, variations, states`,
    so states beat variations without `!important`
  - NEVER `!important` unless documented with a comment saying why
  - colours / sizes by token REMAP (`--ui-color`, `--ui-scale`) and one generic rule set, not per-hue rules
  - NEVER declare a public component token (`--ui-<tag>-*`) in a component sheet:  declare its private alias
    (`--_ui-button-radius: var(--ui-button-radius, var(--ui-radius))`) and read the alias, so values set on the
    page, an ancestor, the host or `::part()` reach the box.  Owner switches are private (`--_ui-card-layout`).
    See `docs/theming.md` "Component tokens";  `test/component-tokens.test.ts` enforces it
- Libraries:  `lodash-es` only (tree-shakes).  Ask before adding any other runtime dependency.
- Platform:  ASSUME anchor positioning (no JS fallback), style container queries, popover, `<dialog>`.
  Safari gaps (`closedby`, `popover=hint`, `CloseWatcher`, customizable `<select>`) are feature-flagged through
  `UI.browser.supports`, NEVER user-agent checks at the call site.

## Solid authoring

- An element is a CONTROLLER class `UI<Name> extends UIElement<typeof nameVocabulary>` (or `FormElement`,
  `ContentPart`):  `@proto static vocabulary` / `styles` / `Fallback` (/ `formAssociated`, `delegatesFocus`),
  signals and memos as FIELDS, `render()` returning JSX.  The fork creates one per element on first connect and
  keeps it (`keepAlive`) until `host.dispose()`.  `UI<Name>.define()` in the family's `index.ts` registers it.
- Imports in component files (element classes AND `ui-<name>.fallback.ts`):  shared code ONLY from `$/ui/core` (and
  `$/ui/forms` for form controls), never `$/ui/util`, `$/ui/vocabulary`, `$/ui/elements` ... directly;  the family's own
  vocabulary, fallback, helpers and sheet as peers (`./ui-button.vocabulary.en`, `./ui-button.css?inline`).  Why:  the
  lib build puts everything `$/ui/core` re-exports into `dist/core.js`;  a leaf imported by a family AND by `core`
  splits into a hashed third chunk.  For the same reason `core.ts` / `forms.ts` re-export `$/ui/elements` LEAVES, and
  `FormHost` / `FormElement` import the core through `$/ui/core` (`yarn measure`'s checks catch a violation).
  Shared constants and types come as `UIT.<NAME>` from `$/ui/core` (`import { UIT } from "$/ui/core"`), never bare.
- **Memos compute EAGERLY** on creation.  Base-class memos that call overridable methods take `{ lazy: true }`;
  effects that call overridables are created in `mount()`, after every subclass field exists.
- **`Cell` field order:**  class fields initialize in declaration order, before the subclass constructor body.
  Declare every signal as a `Cell` field ABOVE the memos that read it;  compute a starting value into the initial
  value (`new Cell(untrack(() => ...))`), never by writing during setup.
- **No signal writes in an owned scope** (component body, `render()`, memo, effect COMPUTE):  dev throws
  `REACTIVE_WRITE_IN_OWNED_SCOPE`, and `untrack` does not exempt it.  Write from event handlers, `onSettled`,
  promise callbacks, the effect's APPLY function, or the fork's hooks;  hooks that can run inside a Solid render
  (`onConnect`, the `onFormDisabled` replay) defer with `queueMicrotask`.  Element PROPERTY writes are always legal.
- **Writes land on a microtask:**  a read right after a write sees the old value;  keep the new value in a local.
  Tests `await ElementFixture.settle()` / `tick()` (which `flush()`), never sleep.
- **Effects take two functions:**  `createEffect(compute, apply)`.
- **Events:**  dispatch through `this.emit("ui-change", detail)` (vocabulary-checked, localized on translated
  tags).  Solid 2 has no `on:` namespace:  inside a component, `onClick={...}` for native events;  a Solid APP
  listening for `ui-*` events uses a `ref` callback + `addEventListener` (see `tools/frameworks/solid/app.tsx`),
  and binds rich data with `prop:options`.
  - Listeners OUTSIDE a component see `event.target === host` (`composedPath()[0]` is the inner element), and an
    app's delegated `onClick` on a `ui-*` tag runs once.  The fork's `events.ts` guarantees it by undoing what
    Solid's shadow-root delegation leaves on the event (`target`, `currentTarget`, its handled marker);  NEVER
    work around a wrong `target` in a component -- fix it there (`packages/solid-element/UPSTREAM.md`, PR 10).
- **`keepAlive`:**  a removed element keeps its reactive root (until `dispose()` or garbage collection), so
  anything page-wide (overlay entries, document listeners) follows `connected()`, never disposal.
- **Slots carry no Solid context:**  an element's root is owned by whoever CREATED it, never by the `<slot>` it's
  assigned to (fork PR 11), so a `<slot>` may live in any `<Show>` / `<Dynamic>` branch, but context provided
  around it never reaches slotted elements.  Owner data goes through `PartContext` / `OwnerContext`.
- **Native fallback:**  every family sets `@proto static Fallback = <Name>Fallback` (plain DOM on
  `NativeFallback`, same class grammar, no Solid).  When a render throws, the element logs once, dispatches a
  cancelable `ui-error`, gets `:state(errored)` and shows the fallback;  siblings keep working
  (`docs/fallback.md`).
- **Hot reload** (`yarn dev`, `yarn site:dev`):  edits to a family's classes, vocabulary, fallback or sheet
  update live instances in place;  internal state (a query, an open menu) resets.  Changes the platform reads
  once (observed attributes, `formAssociated`, the host base class, shadow options) and edits to shared code
  (`core`, `forms`, `src/elements/`, the runtime) reload the page.  `yarn test:hmr` MUST pass after touching
  `HotDefinitions`, `UIElement.define()` or the fork's HMR.
- **One Solid per page:**  every Vite config dedupes `solid-js` / `@solidjs/web` (`SOLID_DEDUPE`);  NEVER
  `import * as` a Solid package in shipped code (it pins every export into bundles and vendored copies).
- SSR:  anything that reads the DOM in a constructor needs an `isServer` guard (`test/ssr.ssr.test.tsx`).

## Decorators

As the root's, plus:

- `vite.decorators.ts` (repo root) is used by `vite.config.ts` (`baseConfig()`, shared with `vitest.config.ts`) and
  the Astro config.
- The decorator pre-pass MUST run BEFORE the Solid plugin (both are `enforce: "pre"`;  `baseConfig()` orders them):
  the Solid compiler must see decorator-free code.

## Types / Exports

As the root's, plus our self-namespaces:

- `UI` ~== the runtime singleton from `$/ui/runtime`
- `E` ~== `$/ui/elements`
- `UIT` ~== `$/ui/components/components.types` -- the constants, types and `ToggleCommands` several families share:
  `UIT.TRUE`, `UIT.ARIA_LABEL`, `UIT.ToggleCommands.action(...)`, `UIT.SelectValue`.  Exported from `$/ui/core` and `$/ui`,
  never flat;  inside the folder itself, plain named imports
- the components barrel exports classes by name (`UIButton`, `UIDropdown`), no namespace

## Imports

As the root's, with `$/ui` / `$/ui/*` as our alias, plus:

- Test helpers come from `$/ui/test/...` (`$/ui/test/fixture`, `$/ui/test/a11y`, `$/ui/test/ElementFixture`), the only other
  entry point (`$/ui/test/*` is longer than `$/ui/*`, so it wins).
- Exceptions:  component files import shared code from `$/ui/core` / `$/ui/forms` ("Solid authoring");  `tools/` are
  node scripts:  relative imports with `.ts` extensions, no aliases.
- The root's examples, in `ui`:
  - `import { E } from "$/ui/elements"` => `E.UIElement`, `new E.ClassBuilder(...)`
  - tests may mix:  `import { E, UIElement } from "$/ui/elements"`
  - side-effect imports:  `import "$/ui/components/ui-button"`
  - css files:  `./ui-button.css` if in same folder, else `$/ui/styles/tokens.css`
