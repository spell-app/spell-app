/**
 * Barrel for the step components -- also the `step` lib entry (`@spell-app/ui/ui-step`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-steps>` and `<ui-step>`.
 * - NOTE: slotted step content is the generic parts (`<ui-content>`, `<ui-title>`, `<ui-description>`):  load
 *   `@spell-app/ui/ui-parts` for them;  the `header` / `description` shorthands need nothing more.
 */

import { UISteps } from "./UISteps"
import { UIStep } from "./UIStep"

UISteps.define()
UIStep.define()

export { UISteps, UIStep }
