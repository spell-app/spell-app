import { VisualOpen } from "$/ui/test/VisualOpen"
import type { VisualHooks } from "$/ui/test/test.types"

/**
 * Open states of `types.html` for `yarn test:visual`:  popups shown on their targets.
 * - Popups chosen so they stay inside the example's box (the first one sits above the box's top edge).
 */
export default {
  states: {
    "open-titled": { open: (root) => VisualOpen.show(root, "ui-popup[for=popup-types-rating]") },
    "open-html": { open: (root) => VisualOpen.show(root, "ui-popup[for=popup-types-plan]") },
    "open-parts": { open: (root) => VisualOpen.show(root, "ui-popup[for=popup-types-parts]") }
  }
} satisfies VisualHooks
