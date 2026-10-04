/**
 * Barrel for `src/styles/themes/` -- flattened into `$/ui/styles`.
 * - `ThemeSheets`:  every `*.css` here as a lazily loaded sheet, and `ThemeSheets.apply(name)`.
 * - NOTE: the sheets themselves are NOT re-exported as text (bar `classicThemeCSS` / `darkThemeCSS`, which
 *   `$/ui/styles` imports statically for older callers):  each theme is its own chunk, loaded on `apply()`.
 */

export * from "./themes"
