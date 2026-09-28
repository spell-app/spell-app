/**
 * Barrel for the app's Monaco editor, flattened into `UI`.
 * - NOTE: `monaco` itself is exported too, so app code imports it from here rather than `monaco-editor`.
 */
export * from "./monaco"
export * from "./LspToMonaco"
export * from "./AppAddresses"
export * from "./SpellTokensProvider"
export * from "./SpellModels"
export * from "./SpellLanguageFeatures"
export * from "./SpellMonaco"
export * from "./MonacoEditor"
