/**
 * Barrel for the app's Monaco editors, in Solid:  `<MonacoEditor>` and `<FileEditor>` (the React ones went in P6).
 * - NOTE: NOT in the `$/app/solid` barrel, and NEVER imported statically outside this folder (or `$/app/ui/monaco`)
 *   -- types aside.  It's loaded on first use, through `LazyMonaco` and `<spell-editor>`'s `loadMonaco()`, so
 *   Monaco stays out of the main bundle.
 * - NOTE: the plumbing under them -- `monaco`, `SpellMonaco`, `SpellModels`, `LspToMonaco` ... -- is NOT copied:  it
 *   stays in `$/app/ui/monaco` (no React in it), and is re-exported here, so code loading this lazily gets it from
 *   the same module (see `LazyMonaco`'s `loadMonaco()`).
 */
export * from "$/app/ui/monaco"

export * from "./MonacoEditor"
export * from "./FileEditor"
