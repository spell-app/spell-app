/**
 * The step family:  defines `<ui-steps>` and `<ui-step>`, and exports their components, `UISteps` and `UIStep`.
 * - SIDE EFFECT:  importing it defines the tags.
 * - Also the library's `@spell-app/ui/ui-step` entry (its size is in `docs/report.md`).
 * - NOTE: slotted step content is the generic parts (`<ui-content>`, `<ui-title>`, `<ui-description>`):
 *   load `@spell-app/ui/ui-parts` for them;  the `header` / `description` shorthands need nothing more.
 */

import { UISteps } from "./UISteps"
import { UIStep } from "./UIStep"

UISteps.define()
UIStep.define()

export { UISteps, UIStep }
