/**
 * Barrel for `$/ui/elements` -- the element core every component builds on.
 * - Library-neutral:  `ClassBuilder`, `Validator`, `MenuOptions`, `OwnerContext`, `Shorthand`, `NativeFallback`
 *   (the base of the per-component `*.fallback.ts`, plain DOM when a render throws), `StickyWatch` (reports and
 *   reserves room for a `position: sticky` box).
 * - The Solid layer, on `@spell-app/solid-element`:  `DOMElement` / `DOMFormControlElement` (DOM element bases),
 *   `UIComponent` (the component base), `Reactive` (its reactive members' decorators), `ElementDefinition`
 *   (vocabulary => solid-element's props), `FormComponent`, `Controlled` (compatibility, for `brand`), `Cell`,
 *   `SlotContent`, `PartContext` + `PartComponent` (owner context), `RootSettings`
 *   (what a `<ui-root>` sets for its subtree), `IconGlyph`, `ControlLabels`,
 *   `LoadableComponent` + `DOMLoadableElement` (elements showing a text file), `SourceMarkup`
 *   (fetched HTML made ready for the page), `LoadableBody` + `DOMLoadableBodyElement`
 *   (content loaded from `source` the first time it opens).
 * - NOTE: components never import this barrel:  they import the `$/ui/core` / `$/ui/forms` ENTRIES (`src/core.ts`,
 *   `src/forms.ts`), which split the same files into the two shared chunks of the build.
 * - NOTE: `HotDefinitions` is left out:  dev-only, and a SIDE EFFECT on import (it wraps `UIComponent.define`);
 *   the HMR plugin loads it into each component barrel (`vite.config.ts`).
 * - NOTE: only `OwnerContext.find()`, `StickyWatch` and the Solid layer touch the DOM, and only when called.
 */

export * from "./elements.types"

export * from "./ClassBuilder"
export * from "./Validator"
export * from "./MenuOptions"
export * from "./OwnerContext"
export * from "./Shorthand"
export * from "./NativeFallback"
export * from "./StickyWatch"
export * from "./Reactive"
export * from "./Cell"
export * from "./ElementDefinition"
export * from "./DOMElement"
export * from "./PartContext"
export * from "./Controlled"
export * from "./UIComponent"
export * from "./PartComponent"
export * from "./SlotContent"
export * from "./RootSettings"
export * from "./IconGlyph"
export * from "./DOMLoadableElement"
export * from "./LoadableComponent"
export * from "./SourceMarkup"
export * from "./LoadableBody"
export * from "./DOMLoadableBodyElement"
export * from "./DOMFormControlElement"
export * from "./FormComponent"
export * from "./ControlLabels"
