/**
 * `$/brand/components` barrel:  every `<ui-brand-*>` element, each defined (SIDE EFFECT) as its folder's barrel is
 * imported.
 * - Elements the brand pages need that Spell UI doesn't have yet (decision D2):  generic ones (panel, field, colour
 *   chips) to move into `packages/ui` later, and brand-only page art (flourishes, blobs, the logo).
 * - Each is a Spell UI element, written as `packages/ui/AGENTS.md` "Solid authoring" says, importing shared code
 *   from `$/ui/core` (and `$/ui/forms`).
 * - NOTE:  empty until P3 (`ui-brand-panel`, `ui-brand-field`).
 */
export {}
