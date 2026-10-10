/**
 * Barrel for `$/app/ui` (`UI`):  the types the app's UI shares.
 * - `ui.types.ts`:  editor selections, the explorers' saved state -- types only.
 * - NOT the app's own UI:  that's Solid, on `@spell-app/ui`, in `$/app/solid`.  Spell PROGRAMS draw with Spell UI's
 *   `<ui-*>` elements (epic `output-targets` P11 retired the React kit that lived here).
 * - NOTE: deliberately left out:
 *   - `./monaco`:  Monaco's plumbing (no UI), loaded on first use through `$/app/solid`'s `LazyMonaco`
 *   - `syntax.css`:  the syntax colours, imported by the Solid viewers that use them
 */

export * from "./ui.types"

export * as UI from "./"
