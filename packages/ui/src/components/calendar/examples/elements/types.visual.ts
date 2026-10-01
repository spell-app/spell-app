import { VisualOpen } from "$/ui/test/VisualOpen"
import type { VisualHooks } from "$/ui/test/test.types"

/**
 * Open states of `types.html` for `yarn test:visual`:  the popup of each field type.
 * - An empty field opens on "today", which the spec freezes (`VisualSettings.TIME`).
 */
export default {
  states: {
    "open-datetime": { open: (root) => VisualOpen.set(root, "section:nth-of-type(1) ui-calendar") },
    "open-date": { open: (root) => VisualOpen.set(root, "ui-calendar[type=date][placeholder=Date]") },
    "open-time": { open: (root) => VisualOpen.set(root, "ui-calendar[type=time][placeholder=Time]") },
    "open-range-end": { open: (root) => VisualOpen.set(root, "#range-end") }
  }
} satisfies VisualHooks
