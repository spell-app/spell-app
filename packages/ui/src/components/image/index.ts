/**
 * Barrel for the image components -- also the `image` lib entry (`@spell/ui/image`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-image>` and `<ui-images>`.
 * - NOTE: NOT the generic content part `<ui-image>` of cards / items (`plan.md`);  those land with their owners.
 */

import { UIImage } from "./UIImage"
import { UIImages } from "./UIImages"

UIImage.define()
UIImages.define()

export { UIImage, UIImages }
