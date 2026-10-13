# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/spell-solid`.

**READ the repo root's [AGENTS.md](../../AGENTS.md) and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
the repo's layout, and the house style every package shares.
Only what's local is below;  a section named like a WWOD rule extends it.

**This is Solid work:  READ [the Solid 2 rules](../../guides/solid/solid-2.md) IN FULL FIRST,**
then [ui's AGENTS.md](../ui/AGENTS.md), "Solid authoring":  how an element is written on this package.

## Overview

- What makes a custom element on Solid, for EVERY component set:
  Spell UI's, the epics', the app's, the brand's, and a space's own (epic `people-and-orgs`, P17).
  - It was the element half of Spell UI's element core (`packages/ui/src/elements/`) until then.
  - Owen, round 7 of the spaces page:  "Move the code in spell/ui that creates custom components into $/spell-solid."
  - Its place in the layout:  the epic's spaces page,
    [4.3 and 7.4](../../epics/people-and-orgs/details/spaces-package.html#spell-solid).
- What's in `src/` (`$/spell-solid`, namespace `E`):
  - [UIComponent](src/UIComponent.tsx), the COMPONENT base:  one instance per element, its `render()` returns JSX
  - [DOMElement](src/DOMElement.ts), the DOM element base:  attributes, properties, the upgrade, shown or hidden
  - [ElementDefinition](src/ElementDefinition.ts):  a vocabulary => the DOM element's attributes, events, slots
  - [Reactive](src/Reactive.ts):  the reactive members' decorators, `@state`, `@controlled`, `@derived`,
    `@cssState`, `@aria`, `@onChange`, `@whileConnected`, `@watches`, `@on`, `@untracked`
  - [Cell](src/Cell.ts), [SlotContent](src/SlotContent.ts)
  - [PartContext](src/PartContext.ts) and [OwnerContext](src/OwnerContext.ts):  the generic content parts and the
    element they belong to
  - [ShadowEvents](src/ShadowEvents.ts):  Solid's events kept from leaking out of shadow roots
  - [HotDefinitions](src/HotDefinitions.ts):  hot reload of Spell UI's elements in `yarn dev` (dev-only)
  - [timing](src/timing.ts):  `afterSolidUpdate()`, `beforeNextPaint()`, `soon()`, `after()`, `every()`
  - [SpellSolid](src/SpellSolid.ts):  the settings a set's runtime hands it as it loads (below)
  - the types:  [elements.types.ts](src/elements.types.ts) (`ElementSetup`, `AttributeValues`, the settings) and
    [vocabulary.types.ts](src/vocabulary.types.ts) (`ComponentVocabulary`, `Dictionary`:  every set's schema)
- `UIComponent`, `DOMElement`, `ShadowEvents` and `HotDefinitions` are `@solidjs/element` and `component-register`,
  folded in and fixed (epic `spell-element`, 2026-10-09):  each such file carries their MIT notice.
- Tests:  in the repo's `tests/spell-solid/`, at the same paths as the code (`src/UIComponent.tsx` =>
  `tests/spell-solid/src/UIComponent.test.tsx`).
  - In a real browser (Vitest browser mode + Playwright, chromium), on Spell UI's `baseConfig()`, as Spell UI's are.
  - They draw on a page with Spell UI's runtime, as every page has:  their setup file loads `$/ui/core`,
    which installs Spell UI's settings, and they use Spell UI's test helpers (`$/ui/test/...`).
  - [The barrel test](../../tests/spell-solid/src/barrel.test.ts) pins what's below:  every export live, Spell UI's
    core carrying every name, and no import but `$/util`'s and Solid's.

## Imports

As WWOD §4, plus:

- It imports ONLY `$/util`'s generic files (`$/util/class`, `decorators`, `dom`, `string`, `util.types`, one by
  one, never the `$/util` barrel) and Solid.
  - NEVER Spell UI, or any other package:  every set's elements are written on this package, Spell UI's included.
  - The barrel re-exports those `$/util` files, so a component file reads them through `E` too (`@E.proto`).
- Its files import each other through `E` (`import { E } from "$/spell-solid"`), as Spell UI's element core does
  (ui's AGENTS.md, "Imports in component files");  what a file reads while it EVALUATES (a base class, a decorator,
  a static initializer) comes from its own file, under `// Import directly to avoid circular import`.
- Who imports it:
  - Spell UI:  its `$/ui/core` entry re-exports ALL of it, so Spell UI's `E` holds every name this `E` does.
    Spell UI's own component files keep importing `$/ui/core`.
  - Every pack's element files (`epics`, `brand`, `app`'s `components/`):  `import { E } from "$/spell-solid"`.
    - A file that also uses Spell UI's own pieces (`E.IconGlyph`, `E.LoadableBody`, `E.NativeFallback`,
      `E.Converters` ...) takes `E` from `$/ui/core` instead:  the same names, and Spell UI's on top.
- Leaves other packages may import by path (the root `tsconfig.base.json`'s header):
  - `$/spell-solid/elements.types` and `$/spell-solid/vocabulary.types`:  where a set adds its names (below),
    and for node code that mustn't load the element layer (the vocabularies, the epics' definitions)
  - `$/spell-solid/timing`:  `$/ui/util` re-exports it
  - `$/spell-solid/HotDefinitions`:  Spell UI's HMR plugin injects it by its file path

## Settings

- The element bases call the page's RUNTIME for what's a set's own:  its words, style sheets, focus and animations.
  - spell-solid can't import that runtime, so the runtime hands it over as it loads:
    `SpellSolid.install(settings)`, read as `E.SpellSolid.settings` (`SpellSolidSettings`, in
    [elements.types.ts](src/elements.types.ts)).
  - `runtime`:  is it loaded, load it;  `words`:  the vocabulary layer (names, value sets, converters, class words,
    texts);  `styles`;  `focus`;  `motion`:  the default animation, reduced motion, running one;  `warn()`.
  - Spell UI's:  [SpellUISettings](../ui/src/elements/SpellUISettings.ts), installed as `$/ui/core` loads (and `$/ui`'s
    and the root's barrels:  a bundler may drop `core`'s side-effect import).  Every page with elements has Spell UI's
    runtime.
  - A tag defined before any are installed waits for them (`UIComponent.define()` returns `undefined`, and defines it
    as they're installed):  a code-split bundle may run a family's chunk before the one that installs them.
    Still waiting after 5s:  a console warning.
  - Reading `SpellSolid.settings` before any are installed throws, naming what to import.
- A set's NAMES that spell-solid's types check against are added by augmenting its interfaces
  (`declare module "$/spell-solid/..."`):
  - `ElementAnimations` (`elementSetup.animation`):  Spell UI adds Fomantic's, in its `components.types.ts`
  - `ValueSetNames` and `TopicNames` (a vocabulary's `values` and `topics`):  Spell UI's `ValueSets`
  - Without Spell UI in a program, they hold only `none` / nothing.

## One copy per page

- Two copies of this package on a page would mean two `UIComponent`s and two registries:  it fails silently, as two
  Solids do (`guides/solid/solid-2.md`, "One Solid per page").
- So no bundle of ours carries its own:
  - Spell UI's `core` entry (`dist/core.js`, the docs bundle, the site bundles, the app's `spell-solid.js`) carries it.
  - A component pack leaves `$/spell-solid` external, as it leaves Solid and `$/ui/core`
    (`PACK_MODULES`, [the pack build](../cli/src/dev/packBuild.ts)), and reads it from the page:
    `SpellUI.packModules["$/spell-solid"]` is Spell UI's core module, which carries all of it.
  - The app's element bundles take it from `spell-solid-shared.js` likewise (`packages/app/vite.shared.ts`).

## Commands

- `yarn ts`, `yarn lint`, `yarn format`, `yarn test`, `yarn review`:  as every package's.
- No build of its own:  it's source, bundled by whoever draws with it.
