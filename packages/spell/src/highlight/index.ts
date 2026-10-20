/**
 * Barrel for `highlight/` -- colouring spell source outside an editor (`<ui-code language="spell">`).
 * - Flattened into `$/spell`:  `SP.SpellHighlighter`.
 * - The page's side is the app's:  its `<spell-code>` family registers it with `UI.code` (`SpellLanguage`).
 */

export * from "./SpellHighlighter"
