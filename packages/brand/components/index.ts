/**
 * `$/brand/components` barrel:  every `<brand-*>` element.
 * - SIDE EFFECT:  each is defined as its folder's barrel is imported.
 * - Elements the brand pages need that Spell UI doesn't have yet (decision D2):
 *   - generic ones (colour chips), to move into Spell UI later
 *   - brand-only page art (flourishes, blobs, the logo)
 *   - Moved already:  the panel (Spell UI's `<ui-panel>`) and the field (`<ui-field>`, epic `property-editor` P1).
 * - Each is written as a Spell UI family (`packages/ui/AGENTS.md`, "Solid authoring"), on `$/spell-solid`.
 *   Spell UI's shared code comes from `$/ui/core` (and `$/ui/forms`).
 * - A component pack (`spell dev pack`):
 *   - `__pack/`, beside the families, is GENERATED from them (`spell dev pack build brand`)
 *   - a page loads its `brand.pack.js` through `<ui-components source>`
 *   - the brand's own bundles import this barrel instead (`brand-ui.ts`, `brand-design.ts`)
 * - `brand-color` first:  the set and the range draw its chips.
 */
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
