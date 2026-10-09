/**
 * `core` lib entry (`@spell-app/ui/core`):  the element core PLUS the foundation it builds on, as ONE module.
 * - Every component file imports shared code from here (`$/ui/core`), never from the pieces, so Rolldown puts all of
 *   it in `dist/core.js` and each family entry holds only its own classes, sheet, vocabulary and fallback.
 * - Pulls in:
 *   - `$/ui/util`, `$/ui/vocabulary` -- foundation JS (`proto`, `Warnings`, `ValueSets`, `Converters` ...)
 *   - `$/ui/components/components.types` as the namespace `UIT` (`UIT.FLUID`, `UIT.ToggleCommands`, `UIT.SelectValue` ...)
 *   - from `$/ui/elements`, library-neutral:  `elements.types` (the element core's shared types and constants),
 *     `ClassBuilder`, `Shorthand`, `OwnerContext`, `NativeFallback` (the fallbacks' base), `StickyWatch`
 *     (`<ui-sticky>` and `<ui-section sticky>`)
 *   - from `$/ui/elements`, the Solid layer:  `Reactive` (the decorators:  `state`, `controlled`, `derived`,
 *     `cssState`, `cssStates`, `aria`, `onChange`, `whileConnected`, `fromContent`), `Cell`, `ElementDefinition`,
 *     `DOMElement`, `PartContext` + `PartComponent` (owner context), `Controlled` (compatibility, for `brand`),
 *     `UIComponent`, `SlotContent`, `RootSettings`
 *     (what each `<ui-root>` sets for its subtree:  icon packs, emoji), `IconGlyph`, and the source layer:
 *     `DOMLoadableElement` + `LoadableComponent` (the elements that show a text file), `SourceMarkup`, `LoadableBody`,
 *     `DOMLoadableBodyElement`
 *     (`<ui-section source>` / `<ui-accordion source>`)
 *   - `$/ui/runtime` -- the eager loader (`UI`, `loadUI`), `runtime.types` and the services' TYPES;  `UIRuntime`
 *     itself stays a lazy chunk
 *   - `$/ui/icons` -- the icon pack format (`IconName`, `BuiltInPacks`);  the packs are separate files
 *     (`dist/icon-packs/`), loaded by the runtime (`UI.icons`)
 * - NOT here:  the `forms` entry (`forms.ts`:  `FormComponent`, `DOMFormControl`, `Validator`, `MenuOptions`,
 *   `ControlLabels`), loaded only by families that import it.
 * - NOTE: `$/ui/elements` LEAVES are re-exported, one by one, as `AGENTS.md` ("Solid authoring") says:  its barrel
 *   also exports the `forms` files, and an `export *` of it here would make them `core` exports, i.e. core bytes.
 * - NOTE: those leaves import this entry back, as `E` / `UI` / `UIT`:  a cycle, on purpose (WWOD §4 › "ONE namespace
 *   per sub-system").  What a leaf reads while it EVALUATES (a base class, `@proto`, a static initializer) comes from
 *   its own file instead (WWOD §4 › "Circular imports"), and the order below puts each such file before its readers.
 *   `src/elements/barrel.test.ts` checks every export is live.
 * - NOTE: `solid-js` and `@solidjs/web` are NOT re-exported:  peer dependencies, external in the build
 *   (`vite.config.ts`).  The custom-element layer is `ui`'s own code (`DOMElement`,
 *   `UIComponent`, `ShadowEvents`), bundled here.
 * - NOTE: nothing here may `import * as` a Solid package:  a namespace keeps every export alive, which pins ALL of
 *   Solid into any bundle (and any vendored copy) that includes `core`.  The Solid host page's identity probe
 *   lives in that page (`tools/frameworks/solid/identity.js`).
 */

export * from "$/ui/util"
export * from "$/ui/vocabulary"
export * from "$/ui/elements/elements.types"
export * from "$/ui/elements/ClassBuilder"
export * from "$/ui/elements/Shorthand"
export * from "$/ui/elements/OwnerContext"
export * from "$/ui/elements/NativeFallback"
export * from "$/ui/elements/StickyWatch"
export * from "$/ui/runtime"
export * from "$/ui/icons"
export * as UIT from "$/ui/components/components.types"

export * from "$/ui/elements/Reactive"
export * from "$/ui/elements/Cell"
export * from "$/ui/elements/ElementDefinition"
export * from "$/ui/elements/DOMElement"
export * from "$/ui/elements/PartContext"
export * from "$/ui/elements/Controlled"
export * from "$/ui/elements/UIComponent"
export * from "$/ui/elements/PartComponent"
export * from "$/ui/elements/SlotContent"
export * from "$/ui/elements/RootSettings"
export * from "$/ui/elements/IconGlyph"
export * from "$/ui/elements/DOMLoadableElement"
export * from "$/ui/elements/LoadableComponent"
export * from "$/ui/elements/SourceMarkup"
export * from "$/ui/elements/LoadableBody"
export * from "$/ui/elements/DOMLoadableBodyElement"

/**
 * The package namespace (WWOD §4):  `import { E, UI, UIT } from "$/ui/core"`,
 * then `E.UIComponent`, `@E.proto` (`AGENTS.md`).
 */
export * as E from "$/ui/core"
