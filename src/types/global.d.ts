declare module "global" {
  const global: any
  export default global
}

interface Window {
  /** DEBUG: current `SpellProject`, set by `store.selectPath()` for console access. */
  project?: import("~/languages/spell").SpellProject
}
