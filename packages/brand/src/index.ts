/**
 * `$/brand` barrel:  the brand package's shared code.
 * - `Palette`:  the brand's colour math (OKLCH, contrast, 17-step ladders), from Claude Design's `lib/palette.mjs`.
 * - NOTE:  the elements are `$/brand/components` (their own barrel, outside `src/`);  the bundles' entries
 *   (`brand-ui.ts`, `brand-docs.ts`) and `hues.ts` are not exported (they run the page).
 */
export * from "./brand.types"
export * from "./Palette"

export * as B from "."
