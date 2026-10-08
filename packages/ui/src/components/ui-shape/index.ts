/**
 * The shape family:  defines `<ui-shape>` and `<ui-side>`, and exports their components, `UIShape` and `UISide`,
 * and the shape's DOM element, `DOMShapeElement`.
 * - SIDE EFFECT:  importing it defines the tags.
 * - Also the library's `@spell-app/ui/ui-shape` entry (its size is in `docs/report.md`).
 */

import { DOMShapeElement, UIShape } from "./UIShape"
import { UISide } from "./UISide"

UIShape.define()
UISide.define()

export { UIShape, UISide, DOMShapeElement }
