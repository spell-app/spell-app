declare module "global" {
  const global: any
  export default global
}

/**
 * Extra globals we hang off `window`.
 * - NOTE: MUST stay an `interface` -- declaration merging into the built-in `Window` is the whole point,
 *   and `type` cannot merge.  This is the documented exception to the "always use `type`" rule.
 */
interface Window {
  /** DEBUG: current `SpellProject`, set by `store.selectPath()` for console access. */
  project?: import("~/languages/spell").SP.SpellProject
}
