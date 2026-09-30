/**
 * Barrel for the shape -- also the `shape` lib entry (`@spell/ui/shape`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-shape>` and `<ui-side>`.
 */

import { UIShape } from "./UIShape"
import { UISide } from "./UISide"
import { ShapeHost } from "./ShapeHost"

UIShape.define()
UISide.define()

export { UIShape, UISide, ShapeHost }
