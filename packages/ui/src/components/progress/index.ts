/**
 * Barrel for the progress component -- also the `progress` lib entry (`@spell-app/ui/progress`), measured in
 * `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-progress>`.
 * - NOTE: `ProgressValues` (the arithmetic) is exported too:  an app can compute the same numbers.
 */

import { UIProgress } from "./UIProgress"
import { ProgressValues } from "./ProgressValues"

UIProgress.define()

export { UIProgress, ProgressValues }
