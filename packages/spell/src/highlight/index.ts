/**
 * Barrel for `highlight/` -- colouring spell source outside an editor (`<ui-code language="spell">`).
 * - Flattened into `$/spell`:  `SP.SpellHighlighter`.
 * - NOTE: `browser.ts` is left out:  it's the ENTRY `@spell-app/ui`'s `yarn gen:spell` bundles into the pre-compiled
 *   `spell.<lang>.js`, not part of the library.
 */

export * from "./SpellHighlighter"
