/**
 * Barrel for `$/spell-element`:  what makes a custom element on Solid, for every component set
 * (Spell UI's, the epics', the app's, the brand's, a space's).
 * - `UIComponent`, the COMPONENT base:  one instance per element, its `render()` returns JSX
 * - `DOMElement`, the DOM element base
 * - `ElementDefinition`:  a vocabulary => the DOM element's attributes
 * - `Reactive`:  the decorators of an element's reactive members (`@state`, `@controlled`, `@derived` ...)
 * - `Cell`, `SlotContent`
 * - `PartContext` and `OwnerContext`:  the generic content parts, and the elements they belong to
 * - `SpellSolid`:  the settings a set's runtime hands it as it loads (Spell UI's, as `$/ui/core` loads)
 * - the vocabulary's types (`ComponentVocabulary` ...)
 * - `timing`:  when to run something (`afterSolidUpdate()`, `after()` ...)
 * - `$/util`'s GENERIC helpers, as `$/ui/util` has them (`@proto`, `@lazy`, `camelCase()` ...):
 *   a component file reads them through `E` too (`@E.proto`)
 * - It imports only `$/util`'s generic files and Solid:  NEVER Spell UI, or any other package.
 * - NOTE: `HotDefinitions` is left out:  dev-only, and a SIDE EFFECT on import (it wraps `UIComponent.define`);
 *   Spell UI's HMR plugin loads it into each component barrel (`packages/ui/tools/HotElements.ts`).
 * - NOTE: `ShadowEvents` (Solid's events kept from leaking out of shadow roots) is left out too:
 *   only `UIComponent` uses it, directly.
 * - NOTE: the files import this barrel back, as `E`:  a cycle, on purpose (WWOD §4 › "ONE namespace per sub-system").
 *   - What a file reads while it EVALUATES (a base class, a decorator, a static initializer)
 *     comes from its own file instead (WWOD §4 › "Circular imports").
 *   - The order below puts each such file before its readers;  `tests/spell-element/src/barrel.test.ts` checks it.
 * - NOTE: Spell UI's `$/ui/core` re-exports all of it, so its `E` holds these names too, and a page has ONE copy:
 *   Spell UI's core bundle carries it, and a component pack reads it from there (`SpellUI.packModules`).
 */

export * from "$/util/class"
export * from "$/util/decorators"
export * from "$/util/dom"
export * from "$/util/string"
export * from "$/util/util.types"

export * from "./vocabulary.types"
export * from "./elements.types"
export * from "./timing"
export * from "./SpellSolid"

export * from "./Reactive"
export * from "./Cell"
export * from "./ElementDefinition"
export * from "./DOMElement"
export * from "./OwnerContext"
export * from "./PartContext"
export * from "./UIComponent"
export * from "./SlotContent"

/**
 * The package namespace (WWOD §4):
 * `import { E } from "$/spell-element"`, then `E.UIComponent`, `@E.state` (`AGENTS.md`).
 */
export * as E from "$/spell-element"
