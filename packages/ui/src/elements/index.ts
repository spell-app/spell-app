/**
 * Barrel for `$/ui/elements` -- the element core every component builds on.
 * - No Solid:
 *   - `ClassBuilder`, `Validator`, `MenuOptions`, `OwnerContext`, `Shorthand`
 *   - `NativeFallback`:  the base of the per-component `*.fallback.ts`, plain DOM when a render throws
 *   - `StickyWatch`:  reports and reserves room for a `position: sticky` box
 * - The Solid layer:
 *   - `DOMElement` / `DOMFormControl` (DOM element bases), `UIComponent` (the component base), `FormComponent`
 *   - `Reactive` (its reactive members' decorators)
 *   - `ElementDefinition` (vocabulary => attribute names and conversions)
 *   - `Cell`, `SlotContent`, `IconGlyph`, `ControlLabels`
 *   - `PartContext` + `PartComponent` (owner context)
 *   - `RootSettings` (what a `<ui-root>` sets for its subtree)
 *   - `LoadableComponent` + `DOMLoadableElement` (elements showing a text file)
 *   - `SourceMarkup` (fetched HTML made ready for the page)
 *   - `LoadableBody` + `DOMLoadableBodyElement` (content loaded from `source` the first time it opens)
 * - NOTE: components never import this barrel:
 *   they import the `$/ui/core` / `$/ui/forms` ENTRIES (`src/core.ts`, `src/forms.ts`),
 *   which split the same files into the two shared chunks of the build.
 * - NOTE: `HotDefinitions` is left out:  dev-only, and a SIDE EFFECT on import (it wraps `UIComponent.define`);
 *   the HMR plugin loads it into each component barrel (`tools/HotElements.ts`).
 * - NOTE: `ShadowEvents` (Solid's events kept from leaking out of shadow roots) is left out too:
 *   only `UIComponent` uses it, directly.
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
export * from "./DOMFormControl"
export * from "./FormComponent"
export * from "./ControlLabels"
