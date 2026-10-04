/**
 * Barrel for `$/ui/styles` -- the CSS foundation as TEXT, plus the style vocabulary it's generated from.
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
 * - NOTE: `ComponentTokens` is left out too -- test / build time only (`test/component-tokens.test.ts`,
 *   `yarn tokens:alias`, the docs site's `CssTokens`).  Import its leaf file.
 * - NOTE: no namespace:  sheet names carry a `CSS` suffix and the vocabulary exports are data.
 * - Themes:  `ThemeSheets` (`./themes`) loads `themes/*.css` LAZILY, one chunk per sheet, and applies one
 *   (`ThemeSheets.apply("material")`);  only `classic` and `dark` are also here as text, statically.
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
import classicThemeCSS from "./themes/classic.css?inline"
import darkThemeCSS from "./themes/dark.css?inline"

export * from "./styles.types"
export * from "./styles.vocabulary.en"
export * from "./themes"

export {
  layersCSS,
  resetCSS,
  tokensCSS,
  colorsCSS,
  sizesCSS,
  typographyCSS,
  animationsCSS,
  utilitiesCSS,
  nativeCSS,
  classicThemeCSS,
  darkThemeCSS
}

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
