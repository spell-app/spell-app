import type { SP } from "@spell-app/spell"

/**
 * Globals the app hangs off `window`.
 * - NOTE: MUST stay an `interface`:  declaration merging into the built-in `Window` is the whole point,
 *   and `type` cannot merge.  This is the documented exception to the "always use `type`" rule.
 * - Here, not in the shared `types/` folder (epic `repo-split` P1):  only the app sets it, and the shared types
 *   import no package.
 */
declare global {
  interface Window {
    /** DEBUG: current `SpellProject`, set by `editor.selectPath()` for console access. */
    project?: SP.SpellProject
  }
}
