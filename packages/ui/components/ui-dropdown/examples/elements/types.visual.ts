import { VisualOpen } from "$/ui/test/VisualOpen"
import type { VisualHooks } from "$/ui/test/test.types"

/**
 * Open states of `types.html` for `yarn test:visual`:  menus shown.
 * - The example's bottom padding leaves room for the last menus inside its box.
 */
export default {
  states: {
    "open-dropdown": { open: (root) => VisualOpen.set(root, "section:nth-of-type(1) ui-dropdown") },
    "open-selection": { open: (root) => VisualOpen.set(root, "section:nth-of-type(2) ui-dropdown") },
    "open-multiple": { open: (root) => VisualOpen.set(root, "section:nth-of-type(5) ui-dropdown") },
    "open-button": { open: (root) => VisualOpen.set(root, "ui-dropdown[button][color=primary]") }
  }
} satisfies VisualHooks
