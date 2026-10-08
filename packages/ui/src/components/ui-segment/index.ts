/**
 * The segment family:  defines `<ui-segment>` and `<ui-segments>`,
 * and exports their components, `UISegment` and `UISegments`.
 * - SIDE EFFECT:  importing it defines the tags.
 * - Also the library's `@spell-app/ui/ui-segment` entry (its size is in `docs/report.md`).
 */

import { UISegment } from "./UISegment"
import { UISegments } from "./UISegments"

UISegment.define()
UISegments.define()

export { UISegment, UISegments }
