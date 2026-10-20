# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/spell-element`.

**READ the repo root's [AGENTS.md](../../AGENTS.md) and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
the repo's layout, and the house style every package shares.
Only what's local is below;  a section named like a WWOD rule extends it.

**This is Solid work:  READ [the Solid 2 rules](../../../spell-app.epics/guides/solid/solid-2.md) IN FULL FIRST,**
then [ui's AGENTS.md](../ui/AGENTS.md), "Solid authoring":  how an element is written on this package.

## Overview

- What makes a custom element on Solid, for EVERY component set:
  Spell UI's, the epics', the app's, the brand's, and a space's own (epic `people-and-orgs`, P17).
  - Until then it was the element half of Spell UI's element core, in [its elements folder](../ui/src/elements/).
  - Owen, round 7 of the spaces page:  "Move the code in spell/ui that creates custom components into $/spell-solid."
  - Named `spell-solid` (`$/spell-solid`) until epic `repo-split` P3 renamed it, package and alias, as Owen asked.
    - Its class `SpellSolid` (the settings, below) and the app's `spell-solid.js` chunks keep the old word:
      the app's runner already has a `SpellElement`, and those chunks carry Solid itself.
    - REFACTOR: [`packages/spell-solid/`](../spell-solid/) is a stand-in under the old name, for spell-epic:
      it only re-exports this package, until spell-epic follows the rename (epic `repo-split` T6).
  - Its place in the layout:
    the epic's spaces page, [4.3 and 7.4](../../../spell-app.epics/epics/people-and-orgs/details/spaces-package.html#spell-solid).
- What's in `src/`, imported as `$/spell-element`, namespace `E`:
  - [UIComponent](src/UIComponent.tsx), the COMPONENT base:  one instance per element, its `render()` returns JSX
  - [DOMElement](src/DOMElement.ts), the DOM element base:  attributes, properties, the upgrade, shown or hidden
  - [ElementDefinition](src/ElementDefinition.ts):  a vocabulary => the DOM element's attributes, events, slots
  - [Reactive](src/Reactive.ts):  the decorators of an element's reactive members:
    - `@state`, `@controlled`, `@derived`
    - `@cssState`, `@aria`
    - `@onChange`, `@whileConnected`, `@watches`, `@on`, `@untracked`
  - [Cell](src/Cell.ts), [SlotContent](src/SlotContent.ts)
  - [PartContext](src/PartContext.ts) and [OwnerContext](src/OwnerContext.ts):
    the generic content parts, and the element they belong to
  - [ShadowEvents](src/ShadowEvents.ts):  Solid's events kept from leaking out of shadow roots
  - [HotDefinitions](src/HotDefinitions.ts):  hot reload of Spell UI's elements in `yarn dev` (dev-only)
  - [timing](src/timing.ts):  when to run something
    - `afterSolidUpdate()`, `beforeNextPaint()`
    - `soon()`, `after()`, `every()`
  - [SpellSolid](src/SpellSolid.ts):  the settings a set's runtime hands it as it loads (below)
  - the types:
    - [elements.types.ts](src/elements.types.ts):  `ElementSetup`, `AttributeValues`, the settings
    - [vocabulary.types.ts](src/vocabulary.types.ts):  `ComponentVocabulary`, `Dictionary`:  every set's schema
- Four of those files began as `@solidjs/element` and `component-register`,
  folded in and fixed (epic `spell-element`, 2026-10-09):
  - `UIComponent`, `DOMElement`, `ShadowEvents`, `HotDefinitions`
  - each carries their MIT notice
- Tests:  in the repo's [`tests/spell-element/`](../../tests/spell-element/), at the same paths as the code.
  - [`UIComponent`](src/UIComponent.tsx)'s test is
    [`UIComponent.test.tsx`](../../tests/spell-element/src/UIComponent.test.tsx), at the same path under `tests/spell-element/`.
  - In a real browser (Vitest browser mode + Playwright, chromium), as Spell UI's are,
    on the package's own plugins ([its Vitest config](vitest.config.ts)):  the decorator pre-pass, then Solid's.
  - With NO Spell UI on the page (epic `repo-split` P3):  its tsconfig, Vitest config and dev dependencies name none.
    - Their setup file, [TestSettings](test/TestSettings.ts), installs stand-in settings:
      English names, the shared attributes, no styles, every animation over at once.
    - Their helpers are the package's own, in [`test/`](test/) (`$/spell-element/test/...`):
      `Fixture`, `ElementFixture`, with the same API as Spell UI's.
    - What needs Spell UI's real runtime is tested in Spell UI's tests:
      `<ui-root>`'s `appContext`, Spell UI's settings and translations, its core carrying every name,
      no vocabulary attribute named like a base's member (`$/ui/test/MemberClashes`, run by each set over its own).
  - [The barrel test](../../tests/spell-element/src/barrel.test.ts) pins what "Imports" says:
    - every export live
    - no import but `$/util`'s and Solid's

## Imports

As WWOD §4, plus:

- It imports ONLY Solid, and `$/util`'s generic files, one by one, never the `$/util` barrel:
  - `$/util/class`, `decorators`, `dom`, `string`, `util.types`
  - NEVER Spell UI, or any other package:  every set's elements are written on this package, Spell UI's included.
  - The barrel re-exports those `$/util` files,
    so a component file reads them through `E` too (`@E.proto`).
- Its files import each other through `E`, as Spell UI's element core does
  (ui's AGENTS.md, "Imports in component files"):
  - `import { E } from "$/spell-element"`
  - Except what a file reads while it EVALUATES (a base class, a decorator, a static initializer):
    that comes from its own file, under `// Import directly to avoid circular import`.
- Who imports it:
  - Spell UI:  its `$/ui/core` entry re-exports ALL of it, so Spell UI's `E` holds every name this `E` does.
    Spell UI's own component files keep importing `$/ui/core`.
  - Every pack's element files, `import { E } from "$/spell-element"`:
    - `epics`, `brand`, and `app`'s `components/`
    - A file that also uses Spell UI's own pieces takes `E` from `$/ui/core` instead:
      the same names, and Spell UI's on top.
      Those pieces:  `E.IconGlyph`, `E.LoadableBody`, `E.NativeFallback`, `E.Converters` ...
- Leaves other packages may import by path (the header of the root's [tsconfig.base.json](../../tsconfig.base.json)):
  - `$/spell-element/elements.types` and `$/spell-element/vocabulary.types`:
    - where a set adds its names (below)
    - for node code that mustn't load the element layer (the vocabularies, the epics' definitions)
  - `$/spell-element/timing`:  `$/ui/util` re-exports it
  - `$/spell-element/HotDefinitions`:  Spell UI's HMR plugin injects it by its file path

## Settings

- The element bases call the page's RUNTIME for what's a set's own:  its words, style sheets, focus and animations.
  - spell-element can't import that runtime, so the runtime hands them over as it loads.
    - It calls `SpellSolid.install(settings)`.
    - The bases read them as `E.SpellSolid.settings`.
    - Their type:  `SpellSolidSettings`, in [elements.types.ts](src/elements.types.ts).
  - What the settings hold:
    - `runtime`:  is it loaded, load it
    - `words`:  the vocabulary layer (names, value sets, converters, class words, texts)
    - `styles`, `focus`
    - `motion`:  the default animation, reduced motion, running one
    - `warn()`
  - Spell UI's:  [SpellUISettings](../ui/src/elements/SpellUISettings.ts), installed as `$/ui/core` loads.
    - `$/ui`'s barrel and the root's install them too:  a bundler may drop `core`'s side-effect import.
    - Every page with elements has Spell UI's runtime.
  - A tag defined before any are installed waits for them:
    a code-split bundle may run a family's chunk before the one that installs them.
    - `UIComponent.define()` returns `undefined`, and defines the tag as they're installed.
    - Still waiting after 5s:  a console warning.
  - Reading `SpellSolid.settings` before any are installed throws, naming what to import.
- A set adds the NAMES spell-element's types check against by augmenting its interfaces
  (`declare module "$/spell-element/..."`):
  - `ElementAnimations` (`elementSetup.animation`):  Spell UI adds Fomantic's, in its `components.types.ts`
  - `ValueSetNames` and `TopicNames` (a vocabulary's `values` and `topics`):  Spell UI's `ValueSets`
  - Without Spell UI in a program, they hold only `none` / nothing.

## One copy per page

- Two copies of this package on a page would mean two `UIComponent`s and two registries.
  - It fails silently, as two Solids do
    ([the Solid 2 rules](../../../spell-app.epics/guides/solid/solid-2.md), "One Solid per page").
- So no bundle of ours carries its own:
  - Spell UI's `core` entry carries it, and so everything built on that entry:
    - Spell UI's built `core.js`
    - the docs bundle, the site bundles
    - the app's `spell-solid.js`
  - A component pack leaves `$/spell-element` external, as it leaves Solid and `$/ui/core`.
    - The list:  `PACK_MODULES`, in [Spell UI's pack tooling](../ui/tools/ComponentPack.ts).
    - It reads it from the page:
      `SpellUI.packModules["$/spell-element"]` is Spell UI's core module, which carries all of it.
  - The app's element bundles likewise take it from `spell-solid-shared.js`
    ([the app's shared build](../app/vite.shared.ts)).

## Commands

- As every package's:  `yarn ts`, `yarn lint`, `yarn format`, `yarn test`, `yarn review`.
- No build of its own:  it's source, bundled by whoever draws with it.
