import { VisualOpen } from "$/ui/test/VisualOpen"
import type { VisualHooks } from "$/ui/test/test.types"

/**
 * Open states of `sidebar.html` for `yarn test:visual`:  the sidebars shown inside their pushables.
 */
export default {
  states: {
    "open-left": { open: (root) => VisualOpen.set(root, "#sidebar-demo-left", "visible") },
    "open-right-overlay": { open: (root) => VisualOpen.set(root, "#sidebar-demo-right", "visible") }
  }
} satisfies VisualHooks
