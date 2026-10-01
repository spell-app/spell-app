import type { VisualHooks } from "$/ui/test/test.types"

/**
 * `types.html` for `yarn test:visual`.
 * - WebKit draws an empty `<input type="date">`'s placeholder from the SYSTEM clock (`10/01/2026`), which
 *   Playwright's clock doesn't reach, so the baseline would change every day:  painted over.
 */
export default {
  mask: ["ui-input[type=date] input"]
} satisfies VisualHooks
