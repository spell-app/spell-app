/**
 * Barrel for `$/ui/styles` -- the CSS foundation as TEXT, plus the style vocabulary it's generated from.
 * - Its own lib entry (`@spell-app/ui/styles`), PURE DATA:  no code, so `styles.js` needs none of Rolldown's helpers.
 *   Code here once split them into a `rolldown-runtime-<hash>.js` every page fetched, as `styles.js` never loads
 *   `core.js` (epic `wwod-spell-ui`, I13);  `yarn measure` builds this entry too, so its checks catch a relapse.
 * - Imports nothing of `ui`'s outside its own folder;  the runtime (`UIRuntime`) imports the sheets from here.
 * - Each sheet is a string (Vite `?inline`:  Lightning CSS-processed, `@import` / `@custom-media` resolved,
 *   minified in builds), for `new CSSStyleSheet().replaceSync()` -- the runtime's `Styles` registry adopts
 *   them into the document and into shadow roots.
 * - `foundationCSS` is the ADOPTION ORDER for every tree scope (document and each shadow root):
 *   layers first (fixes the layer order), then reset, tokens, colours, sizes, animations, utilities.
 *   `pageCSS` adds the page-only sheets (`typography`, `native`), which style light-DOM markup.
 * - NOTE: `?inline` relies on `css.lightningcss.targets` being modern browsers.  With Vite's default
 *   (`baseline-widely-available`) Lightning CSS lowers `light-dark()` to `--lightningcss-light` variables
 *   substituted where a token is DECLARED, which freezes `:root`'s scheme into `.ui-dark` subtrees.
 *   `styles.test.ts` checks for it.
 * - NOTE: `StyleGenerator` is left out -- build-time only (`yarn gen:styles`).  Import its leaf file.
 * - NOTE: `ComponentTokens` is left out too -- test / build time only (`test/componentTokens.test.ts`,
 *   `yarn tokens:alias`, the docs site's token tables).  Import its leaf file.
 * - NOTE: no namespace:  sheet names carry a `CSS` suffix and the vocabulary exports are data.
 * - NOTE: the THEMES (`themes/*.css`) are not here:  the runtime loads them lazily, one chunk per sheet, and applies
 *   one (`UI.themes.apply("material")`, `src/runtime/Themes.ts`).
 */

import layersCSS from "./layers.css?inline"
import resetCSS from "./reset.css?inline"
import tokensCSS from "./tokens.css?inline"
import colorsCSS from "./colors.css?inline"
import sizesCSS from "./sizes.css?inline"
import typographyCSS from "./typography.css?inline"
import animationsCSS from "./animations.css?inline"
import utilitiesCSS from "./utilities.css?inline"
import nativeCSS from "./native.css?inline"

export * from "./styles.types"
export * from "./styles.vocabulary.en"

export { layersCSS, resetCSS, tokensCSS, colorsCSS, sizesCSS, typographyCSS, animationsCSS, utilitiesCSS, nativeCSS }

/** Sheets every tree scope adopts, in order:  document and each shadow root. */
export const foundationCSS: readonly string[] = [
  layersCSS,
  resetCSS,
  tokensCSS,
  colorsCSS,
  sizesCSS,
  animationsCSS,
  utilitiesCSS
]

/** Sheets the PAGE adopts, in order:  the foundation plus page typography and native-markup rules. */
export const pageCSS: readonly string[] = [...foundationCSS, typographyCSS, nativeCSS]
