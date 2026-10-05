/**
 * Barrel for `$/ui/elements` (`E`) -- the element core every component builds on.
 * - Library-neutral:  `ClassBuilder`, `Validator`, `MenuOptions`, `OwnerContext`, `Shorthand`, `NativeFallback`
 *   (the base of the per-component `*.fallback.ts`, plain DOM when a render throws), `StickyWatch` (reports and
 *   reserves room for a `position: sticky` box).
 * - The Solid layer, on `@spell-app/solid-element`:  `UIHost` / `FormHost` (host bases), `UIElement` (the controller
 *   base), `ElementDefinition` (vocabulary => the fork's props), `FormElement`, `Controlled`, `Cell`,
 *   `SlotContent`, `HostAttribute`, `PartContext` + `ContentPart` (owner context), `IconGlyph`, `ControlLabels`,
 *   `SourceElement` + `SourceHost` (elements showing a text file), `SourceMarkup` (fetched HTML made ready for the
 *   page), `SourceBody` + `SourceBodyHost` (content loaded from `source` the first time it opens).
 * - NOTE: components never import this barrel:  they import the `$/ui/core` / `$/ui/forms` ENTRIES (`src/core.ts`,
 *   `src/forms.ts`), which split the same files into the two shared chunks of the build.
 * - NOTE: `HotDefinitions` is left out:  dev-only, and a SIDE EFFECT on import (it wraps `UIElement.define`);
 *   the HMR plugin loads it into each component barrel (`vite.config.ts`).
 * - NOTE: only `OwnerContext.find()` and the Solid layer touch the DOM, and only when called.
 */

export * from "./elements.types"

export * from "./ClassBuilder"
export * from "./Validator"
export * from "./MenuOptions"
export * from "./OwnerContext"
export * from "./Shorthand"
export * from "./NativeFallback"
export * from "./StickyWatch"
export * from "./Cell"
export * from "./ElementDefinition"
export * from "./UIHost"
export * from "./PartContext"
export * from "./Controlled"
export * from "./UIElement"
export * from "./ContentPart"
export * from "./SlotContent"
export * from "./HostAttribute"
export * from "./RootSettings"
export * from "./IconGlyph"
export * from "./SourceHost"
export * from "./SourceElement"
export * from "./SourceMarkup"
export * from "./SourceBody"
export * from "./SourceBodyHost"
export * from "./FormHost"
export * from "./FormElement"
export * from "./ControlLabels"

export * as E from "."
