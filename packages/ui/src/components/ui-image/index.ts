/**
 * The image family:  defines `<ui-image>` and `<ui-images>`, and exports their components, `UIImage` and `UIImages`.
 * - SIDE EFFECT:  importing it defines the tags.
 * - Also the library's `@spell-app/ui/ui-image` entry (its size is in `docs/report.md`).
 * - NOT the generic content part `<ui-image>` of cards and items (`plan.md`):  those come with their owners.
 */

import { UIImage } from "./UIImage"
import { UIImages } from "./UIImages"

UIImage.define()
UIImages.define()

export { UIImage, UIImages }
