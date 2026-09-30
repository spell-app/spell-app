/**
 * `core` lib entry (`@spell/ui/core`):  the element core PLUS the foundation it builds on, as ONE module.
 * - Every component file imports shared code from here (`$/core`), never from the pieces, so Rolldown puts all of
 *   it in `dist/core.js` and each family entry holds only its own classes, sheet, vocabulary and fallback.
 * - Pulls in:
 *   - the element core -- `UIHost`, `UIElement`, `ElementDefinition`, `ContentPart` + `PartContext` (owner
 *     context), `Controlled`, `Cell`, `SlotContent`, `HostAttribute`, `IconGlyph`
 *   - `$/util`, `$/vocabulary`, `$/components/components.types` -- foundation JS
 *   - from `$/elements`:  `ClassBuilder`, `Shorthand`, `OwnerContext`, `NativeFallback` (the fallbacks' base)
 *   - `$/runtime` -- ONLY the eager loader (`UI`, `loadUI`);  `UIRuntime` stays a lazy chunk
 *   - `$/icons` -- the icon pack format (`IconName`, `BuiltInPacks`);  the packs are separate files
 *     (`dist/icon-packs/`), loaded by the runtime (`UI.icons`)
 * - NOT here:  the `forms` entry (`forms.ts`:  `FormElement`, `FormHost`, `Validator`, `MenuOptions`), loaded only
 *   by families that import it.
 * - NOTE: `$/elements` LEAVES are re-exported, against `AGENTS.md`:  its barrel also exports the `forms` files, and
 *   an `export *` of it here would make them `core` exports, i.e. core bytes.
 * - NOTE: `solid-js`, `@solidjs/web` and `@spell/solid-element` are NOT re-exported:  peer dependencies, external
 *   in the build (`vite.config.ts`).
 * - NOTE: nothing here may `import * as` a Solid package:  a namespace keeps every export alive, which pins ALL of
 *   Solid into any bundle (and any vendored copy) that includes `core`.  The Solid host page's identity probe
 *   lives in that page (`tools/frameworks/solid/identity.js`).
 */

export * from "$/util"
export * from "$/vocabulary"
export * from "$/elements/elements.types"
export * from "$/elements/ClassBuilder"
export * from "$/elements/Shorthand"
export * from "$/elements/OwnerContext"
export * from "$/elements/NativeFallback"
export * from "$/runtime"
export * from "$/icons"
export * from "$/components/components.types"

export * from "$/elements/Cell"
export * from "$/elements/ElementDefinition"
export * from "$/elements/UIHost"
export * from "$/elements/PartContext"
export * from "$/elements/Controlled"
export * from "$/elements/UIElement"
export * from "$/elements/ContentPart"
export * from "$/elements/SlotContent"
export * from "$/elements/HostAttribute"
export * from "$/elements/IconGlyph"
