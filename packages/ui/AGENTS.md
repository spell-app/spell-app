# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this repository.

## Overview

- `@spell/ui` is Fomantic UI reborn as `ui-*` custom elements on a modern CSS foundation:  Fomantic's
  vocabulary (`ui small primary basic icon button`), shadow DOM, `@layer`s, OKLCH tokens, accessibility built in.
  Usable from any framework or plain HTML.  Built on **Solid 2** (`solid-js` / `@solidjs/web` `2.0.0-rc.11`,
  pinned exactly) through our fork of its custom-element layer, `@spell/solid-element`.
- The approved design is `docs/plan.md`.  Read "Decisions" and "Architecture" there BEFORE adding a component
  or runtime service.  `docs/report.md` is the generated status report (bundle, perf, hosts, HMR, fallbacks).
- `docs/status.md` is the per-component checklist (status, tests, size, keyboard, docs page, deferred items).
  MUST be updated in the same change that builds, finishes or defers anything in it.
- Layout:
  - `packages/solid-element/` -- `@spell/solid-element`, the fork of `@solidjs/element` + `component-register`
    (upgrade, forms, lifecycle, error boundary, HMR fixes;  `UPSTREAM.md` maps each to a PR).  Its OWN yarn
    project (own `yarn.lock`, `node_modules`, tests), linked into the root with `link:`;  run its scripts with
    `yarn fork <script>`.  NEVER import its files from `src/`:  use the package name.
  - `src/util/` -- general utilities with no dependency on the rest of the package:  `@proto` (`decorators.ts`),
    `class.ts`, `string.ts` (case, `numberToWord`, `suggest`), `dom.ts` (`closestAcrossShadow` ...), `util.types.ts`
  - `src/vocabulary/` (`V`) -- the naming layer:  vocabulary schema, value sets, `Vocabulary` (registry, translated
    names, `replace()` for hot reload), `Converters`
  - `src/runtime/` (`UI`) -- the shared `UI` runtime, ONE instance per page (`globalThis.UI ??= new UIRuntime()`).
    Components call `UI.load()` on connect, which dynamic-imports this chunk once.  Services are classes:
    `Browser` (sniffing + `UI.browser.supports` flags), `Keyboard`, `Overlays`, `Focus`, `Styles`, `Vocabulary`,
    `I18n`, `Transitions`, `Ids`, `Toasts`, `Modals`, `Api`, `IconPacks` (`UI.icons`)
  - `src/icons/` -- the icon PACK format (`IconPackIndex`, `IconName`, `BuiltInPacks`) and the built-in packs
    (`icon-packs/<id>/`:  SVG files + `pack.js`);  loading and caching are the runtime's (`UI.icons`);  packs are built by
    `tools/IconPackBuilder.ts` (`yarn icons:pack`);  see `docs/icons.md`
  - `src/elements/` (`E`) -- the element core:
    - library-neutral:  `ClassBuilder`, `Validator`, `MenuOptions`, `OwnerContext`, `Shorthand`, `NativeFallback`
    - the Solid layer:  `UIHost` / `FormHost` (host base classes), `UIElement` (the CONTROLLER base:  one instance
      per element, `render()` returns JSX), `ElementDefinition` (vocabulary => the fork's props), `FormElement`,
      `Controlled`, `Cell`, `SlotContent`, `HostAttribute`, `PartContext` + `ContentPart` (owner context),
      `IconGlyph`, and the dev-only `HotDefinitions` (NOT in the barrel)
  - `src/components/<name>/` -- one folder per component FAMILY:
    - `UI<Name>.tsx` (or `.ts` without JSX) -- one element class per file:  `UIButton.tsx`, `UIButtons.tsx`,
      `UIOr.tsx`;  family helpers beside them (`SlottedItems.ts`, `PartElement.ts`)
    - `index.ts` -- the family barrel:  calls `define()` for every tag (SIDE EFFECT), re-exports the classes.
      Also the family's lib entry (`@spell/ui/button`) and its hot-reload boundary
    - `<name>.css` -- port of Fomantic's `.less` + `.variables`
    - `<name>.vocabulary.en.ts` -- EVERY name the component uses:  tag, attributes (kind + allowed values),
      values, events, slots, parts, states, text strings.  Translations become `<name>.vocabulary.<lang>.ts`
    - `<name>.fallback.ts` -- the native fallback (plain DOM, no Solid) shown when the element's render throws
    - `<name>.test.tsx` (elements), `<name>.css.test.ts` (the sheet on class-grammar markup),
      `<name>.fallback.test.ts`, `<name>.a11y.test.ts`, `<name>.perf.test.tsx`
    - `examples/*.html` -- Fomantic's examples in CLASS GRAMMAR (static markup, the CSS tests and the site);
      `examples/elements/*.html` -- the same examples as `ui-*` ELEMENT markup (axe in `<name>.test.tsx`,
      `yarn dev`, `yarn test:visual`);  `examples/elements/<name>.visual.ts` -- optional OPEN states for the
      visual tests (`docs/visual-testing.md`)
  - `src/core.ts`, `src/forms.ts` -- the two SHARED lib entries (`@spell/ui/core`, `@spell/ui/forms`):  `core` is
    the element core + the foundation JS every family needs;  `forms` what only form controls with a VALUE need
    (`FormElement`, `FormHost`, `Validator`, `MenuOptions`).  Component files import shared code ONLY through
    these (see "Solid authoring")
  - `src/styles/` -- `layers.css`, tokens, colours, sizes, reset, typography, animations, utilities, `native.css`,
    `themes/`;  its own lib entry (`@spell/ui/styles`)
  - `src/index.ts` -- `@spell/ui`:  registers every family (side effect) and re-exports them, plus `E`, `V`, the
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
  - `scripts/` -- generators (`gen-styles.ts`, `gen-icons.ts`)
  - `reference/Fomantic-UI/` -- READ-ONLY, git-ignored clone of Fomantic for porting.  NEVER edit or import it.
- Commands:
  - `yarn review` -- tsc (root, node configs, the fork) + oxlint `--fix` + oxfmt + every test (`ssr`, `browser`,
    the fork's);  MUST pass before you hand work back
  - `yarn build` -- tsc + vite library build into `dist/` (entries `core`, `forms`, one per family, `styles`,
    `index`;  `dist/icon-packs/`;  `.d.ts`)
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
  - NEVER `npx tsc`:  `node_modules/.bin/tsc` is TypeScript 6 (see `PAPERCUTS.md`).  Use `yarn tsc`.

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
- Class defaults (vocabulary, default settings, part names) are `@proto static` (from `$/util`), so instances
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
- Imports in component files (element classes AND `<name>.fallback.ts`):  shared code ONLY from `$/core` (and
  `$/forms` for form controls), never `$/util`, `$/vocabulary`, `$/elements` ... directly;  the family's own
  vocabulary, fallback, helpers and sheet as peers (`./button.vocabulary.en`, `./button.css?inline`).  Why:  the
  lib build puts everything `$/core` re-exports into `dist/core.js`;  a leaf imported by a family AND by `core`
  splits into a hashed third chunk.  For the same reason `core.ts` / `forms.ts` re-export `$/elements` LEAVES, and
  `FormHost` / `FormElement` import the core through `$/core` (`yarn measure`'s checks catch a violation).
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

## Long-term debt

- `CODE-DEBT.md` tracks structural debt we have knowingly chosen NOT to fix yet.
- Add an entry when a problem is structural, too big to fix in passing, and being tolerated
  deliberately -- especially when a test or lint rule is pinned, skipped or widened to
  accommodate it.  Record the mechanism, not a guess, so nobody rediscovers it.
- NOT for local cleanups (inline `REFACTOR:` marker), suspected bugs (`SUSPECTED-BUGS.md`)
  or tooling papercuts (`PAPERCUTS.md`).
- See that file's header for the entry format.

## Documentation

- Create and maintain a markdown docstring comments before:
  - types and each property in a type
  - classes and class methods/fields
  - loose methods
- Explain _why_, don't just restate the code.
- Make sure to note side effects and unexpected conventions.
- Format:
  - informal style, one line and then `-` bullets
  - DO NOT use jsdoc `@param` etc
  - terse text, e.g. `last server version`, not `the last known server version`
  - two spaces after a period
  - backticked identifiers/types
  - format lists as bullets rather than inline commas
  - `~==` for "equivalent to" and `===` for exactly equals
- Marker vocabulary / invariants: NOTE, TODO, SIDE EFFECT, HACK, NEVER, MUST, DOCME, RENAME, DEPRECATED
- Wrap comments at english phrase boundaries, not mid-clause. Avoid single or double widow words,
  wrap `e.g.` clauses if they don't fit on the original line, etc.
  and drop filler articles (`the`, `a`) that don't earn their place
- Write or clarify docstrings and comments where you see marker `DOCME`.
- Always place a blank line before a group header like the below.
- Separate function code groups like so:

```

////////////////
// ## Group Name
////////////////
```

- Separate custom element classes with a header like so:

```

/****************
 * ### `<ui-component-name>`
 * Description of the component.
 ****************/
```

## Functions

- An inner helper that doesn't use `this` is NOT an inline arrow (`const visit = (...) => ...`).  Either:
  - make it a private helper function, or
  - declare it `function visit(...) {...}` at the BOTTOM of the enclosing function, after any `return`,
    with a docstring saying what it does -- hoisting makes it callable from above.
- Arrow functions stay fine for short callbacks passed inline, e.g. `tokens.map((token) => token.value)`.

## Decorators

- Use STANDARD (TC39 2023-11) decorators, NEVER `experimentalDecorators`.  General-purpose ones live in `$/util/decorators.ts`.
- Lowered by esbuild via `vite.decorators.ts`, used by `vite.config.ts` (`baseConfig()`, shared with
  `vitest.config.ts`) and the Astro config -- vite 8's own transformer (oxc) doesn't do it yet.
- A decorator MUST be the first thing on its line (`@proto static parts = [...]` is fine,
  and preferred) or that plugin won't notice the file.
- The decorator pre-pass MUST run BEFORE the Solid plugin (both are `enforce: "pre"`;  `baseConfig()` orders them):
  the Solid compiler must see decorator-free code.

## Types / Exports

- ALWAYS use `type` rather than `interface`. Wrap with `Prettify` (from `$/util`) when combining types.
- One exported class per file, file named for the class.  e.g. `Keyboard.ts`, `Overlays.ts`
  rather than both living in `services.ts`.
- Types and helper functions appear AFTER the durable JS structure that uses them,
  e.g. `UIElementProps` goes directly below `class UIElement`.
- Centralize shared types in a single `<folder>.types.ts` per folder, e.g. `runtime.types.ts`, `elements.types.ts`.
  - NEVER bare `types.ts` or `constants.ts` -- constants, small error classes
    and pure helpers for those types live in `<folder>.types.ts` too.
  - Group with `// ## Group Name` headers.
  - MUST be runtime-light:  `import type` only, apart from `$/util`.
  - Exception: class constructor props (`XProps`) live in the defining file.
    Move to `<folder>.types.ts` once a second file needs them.
- Create barrel `index.ts` for each folder:
  - header comment block explaining the barrel, with `NOTE:` for anything deliberately left out or namespaced
  - `export * from "./<folder>.types"` first, then leaf files base-classes-first
  - sub-folder barrels are flattened in:  `export * from "./services"`
- Each sub-system has ONE self-namespace, exported from its top barrel:  `export * as E from "."`
  - `UI` ~== the runtime singleton from `$/runtime`
  - `E` ~== `$/elements`
  - the components barrel exports classes by name (`UIButton`, `UIDropdown`), no namespace
  - NEVER create a second namespace for a sub-folder -- flatten into parent.
  - Exception: namespace a file whose names would collide when flattened.
  - Prefer a disambiguating affix over a namespace when the names allow it.
  - NOTE: `export *` through a circular barrel is riskier than a named re-export -- it must read the
    leaf's key list EAGERLY, so a mid-body leaf contributes nothing.
- Barrels MUST NOT pull in optional sub-systems.  Make them opt-in via side-effect import.
- When refactoring imports and exports, if you encounter circular import problems
  create smoke tests (`barrel.test.ts`)  ensuring no circular import problems in
  TS/rollup/browser for various entry points.

## Imports

- ALWAYS import starting from `$`, NEVER start import from `../`.
  - Test helpers come from `$test/...` (`$test/fixture`, `$test/a11y`, `$test/ElementFixture`), the only other
    alias.
  - Exceptions:  component files import shared code from `$/core` / `$/forms` ("Solid authoring");  `tools/` are
    node scripts:  relative imports with `.ts` extensions, no aliases.
- OK to import from direct peers: `import { UIElement } from "./UIElement"`, but not subdirectories -- use `$/...` instead.
- Prefer ONE namespace import per sub-system and qualify at use site:
  `import { E } from "$/elements"` => `E.UIElement`, `new E.ClassBuilder(...)`.
  - Applies INSIDE the sub-system as well.
  - Self-import uses full path too, even from same folder as the barrel:
    `import { E } from "$/elements"`, NEVER `import { E } from "."`.
    Only the barrel itself says `"."`:  `export * as E from "."`.
  - NEVER reach into another sub-system's leaf file for something its barrel exports.
  - OK to refer to file's own class unqualified.
  - Tests may mix: `import { E, UIElement } from "$/elements"`.
- Circularity rules for files inside a barrel:
  - `E.X` as a VALUE is fine inside function / method bodies -- resolved at call time.
  - NEVER use `E.X` at module-evaluation time:  `extends` clauses, static initializers,
    top-level `new`.  Circular reentry silently yields `undefined` / broken `instanceof`.
  - Import base classes directly from the defining file, with comment:
    `// Import directly to avoid circular import`
  - Use `import type { E }` when file only needs types, e.g. `*.types.ts`.
- Import order:
  - node_modules
  - (blank line)
  - `$/util` and other general utilities, general-to-specific
  - other sub-system barrels
  - own barrel
  - direct peer files, base classes first
  - (blank line)
  - side-effect imports (`import "$/components/button"`)
  - css files (`./button.css` if in same folder, else `$/styles/tokens.css`)
- One import statement per module.  Inline type imports:  `import { E, type ClassKind } from "$/elements"`.
