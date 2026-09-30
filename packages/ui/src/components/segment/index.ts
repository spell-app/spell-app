/**
 * Barrel for the segment components -- also the `segment` lib entry (`@spell/ui/segment`),
 * measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-segment>` and `<ui-segments>`.
 */

import { UISegment } from "./UISegment"
import { UISegments } from "./UISegments"

UISegment.define()
UISegments.define()

export { UISegment, UISegments }
