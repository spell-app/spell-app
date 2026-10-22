/**
 * Barrel for the app's Monaco editor.
 * - NOTE: NOT in the `UI` barrel, and NEVER imported statically outside this folder -- types aside.  It's loaded
 *   on first use, through `UI.LazyMonaco`, so Monaco stays out of the main bundle.
 * - NOTE: `monaco` itself is exported too, so app code imports it from here rather than `monaco-editor`.
 */
export * from "./monaco"
export * from "./LspToMonaco"
export * from "./AppAddresses"
export * from "./SpellTokensProvider"
export * from "./SpellHeadings"
export * from "./SpellModels"
export * from "./SpellLanguageFeatures"
export * from "./SpellMonaco"
