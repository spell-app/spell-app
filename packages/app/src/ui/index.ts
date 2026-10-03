/**
 * Barrel for `$/app/ui` (`UI`):  spell PROGRAMS' React UI kit, and the types the app's UI shares.
 * - The kit, which compiled spell draws with (React, decision D9):
 *   - `SUIPassThroughs.ts`:  `semantic-ui-react` components as `UI.Button`, `UI.Grid` ...
 *   - `forms/` (`F`):  `UI.Form`, `UI.Input` ... on `semantic-ui-react`
 *   - programs get it from the runtime (`spellRuntime.ts`, which imports those files directly), NOT this barrel
 * - `ui.types.ts`:  editor selections, the explorers' saved state -- types only.
 * - NOT the app's own UI:  that's Solid, on `@spell-app/ui`, in `$/app/solid` (P8 moved the last of it:  pages'
 *   shell, menus, layout).
 * - NOTE: deliberately left out:
 *   - `./monaco`:  Monaco's plumbing (no UI), loaded on first use through `$/app/solid`'s `LazyMonaco`
 *   - `syntax.css`:  the syntax colours, imported by the Solid viewers that use them
 * - NOTE: files in THIS folder may use `UI` too, but only inside render bodies -- the barrel imports them back, so
 *   the binding is still in its TDZ at module-evaluation time.  NEVER dereference `UI.x` at the top level of a file
 *   in this folder.
 */

export * from "./ui.types"

export * from "./SUIPassThroughs"
export * from "$/app/ui/forms"

export * as UI from "./"
