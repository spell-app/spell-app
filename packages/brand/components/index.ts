/**
 * `$/brand/components` barrel:  every `<brand-*>` element, each defined (SIDE EFFECT) as its folder's barrel is
 * imported.
 * - Elements the brand pages need that Spell UI doesn't have yet (decision D2):  generic ones (field, colour chips) to
 *   move into `packages/ui` later, and brand-only page art (flourishes, blobs, the logo).  The panel moved first:
 *   `<ui-panel>`, Spell UI's (`packages/ui/components/ui-panel/`).
 * - Each is written as a Spell UI family (`packages/ui/AGENTS.md`, "Solid authoring"), on `$/spell-solid`, importing
 *   Spell UI's shared code from `$/ui/core` (and `$/ui/forms`).
 * - A component pack (`spell dev pack`):  `__pack/` beside the families is GENERATED from them
 *   (`spell dev pack build brand`), and a page loads its `brand.pack.js` through `<ui-components source>`.
 *   This barrel is what the brand's own bundles import (`brand-ui.ts`, `brand-design.ts`).
 * - `brand-color` first:  the set and the range draw its chips.
 */
export * from "./brand-field"
export * from "./brand-color"
export * from "./brand-color-set"
export * from "./brand-color-range"
export * from "./brand-color-picker"
export * from "./brand-logo"
export * from "./brand-flourish"
export * from "./brand-blob"
export * from "./brand-composer"
export * from "./brand-checklist"
export * from "./brand-phone"
