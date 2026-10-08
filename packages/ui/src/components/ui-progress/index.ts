/**
 * The progress family:  defines `<ui-progress>` and exports its component, `UIProgress`.
 * - SIDE EFFECT:  importing it defines the tag.
 * - Also the library's `@spell-app/ui/ui-progress` entry (its size is in `docs/report.md`).
 * - It exports `ProgressValues` (the arithmetic) too, so an app can compute the same numbers.
 */

import { UIProgress } from "./UIProgress"
import { ProgressValues } from "./ProgressValues"

UIProgress.define()

export { UIProgress, ProgressValues }
