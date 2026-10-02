/**
 * `core` lib entry (`@spell-app/ui/core`):  the element core PLUS the foundation it builds on, as ONE module.
 * - Every component file imports shared code from here (`$/ui/core`), never from the pieces, so Rolldown puts all of
 *   it in `dist/core.js` and each family entry holds only its own classes, sheet, vocabulary and fallback.
 * - Pulls in:
 *   - the element core -- `UIHost`, `UIElement`, `ElementDefinition`, `ContentPart` + `PartContext` (owner
 *     context), `Controlled`, `Cell`, `SlotContent`, `HostAttribute`, `IconGlyph`
 *   - `$/ui/util`, `$/ui/vocabulary` -- foundation JS;  `$/ui/components/components.types` as the namespace `UIT` (`UIT.TRUE`, `UIT.ARIA_LABEL`, `UIT.SelectValue` ...)
 *   - from `$/ui/elements`:  `ClassBuilder`, `Shorthand`, `OwnerContext`, `NativeFallback` (the fallbacks' base),
 *     `StickyWatch` (`<ui-sticky>` and `<ui-section sticky>`)
 *   - `$/ui/runtime` -- ONLY the eager loader (`UI`, `loadUI`);  `UIRuntime` stays a lazy chunk
 *   - `$/ui/icons` -- the icon pack format (`IconName`, `BuiltInPacks`);  the packs are separate files
 *     (`dist/icon-packs/`), loaded by the runtime (`UI.icons`)
 * - NOT here:  the `forms` entry (`forms.ts`:  `FormElement`, `FormHost`, `Validator`, `MenuOptions`), loaded only
 *   by families that import it.
 * - NOTE: `$/ui/elements` LEAVES are re-exported, against `AGENTS.md`:  its barrel also exports the `forms` files, and
 *   an `export *` of it here would make them `core` exports, i.e. core bytes.
 * - NOTE: `solid-js`, `@solidjs/web` and `@spell-app/solid-element` are NOT re-exported:  peer dependencies, external
 *   in the build (`vite.config.ts`).
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

export * from "$/ui/elements/Cell"
export * from "$/ui/elements/ElementDefinition"
export * from "$/ui/elements/UIHost"
export * from "$/ui/elements/PartContext"
export * from "$/ui/elements/Controlled"
export * from "$/ui/elements/UIElement"
export * from "$/ui/elements/ContentPart"
export * from "$/ui/elements/SlotContent"
export * from "$/ui/elements/HostAttribute"
export * from "$/ui/elements/IconGlyph"
