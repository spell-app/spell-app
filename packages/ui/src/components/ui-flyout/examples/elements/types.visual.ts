import { VisualOpen } from "$/ui/test/VisualOpen"
import type { VisualHooks } from "$/ui/test/test.types"

/**
 * Open states of `types.html` for `yarn test:visual`:  a flyout on each side.
 * - `viewport`:  a flyout is a top-layer `<dialog>` along a viewport edge.
 */
export default {
  states: {
    "open-left": { open: (root) => VisualOpen.show(root, "#flyout-types-standard"), capture: "viewport" },
    "open-right": { open: (root) => VisualOpen.show(root, "#flyout-types-right"), capture: "viewport" },
    "open-top": { open: (root) => VisualOpen.show(root, "#flyout-types-top"), capture: "viewport" },
    "open-bottom": { open: (root) => VisualOpen.show(root, "#flyout-types-bottom"), capture: "viewport" }
  }
} satisfies VisualHooks
