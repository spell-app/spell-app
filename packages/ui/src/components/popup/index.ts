/**
 * Barrel for the popup -- also the `popup` lib entry (`@spell/ui/popup`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-popup>`, which registers as the owner of the `header` and `content` parts.
 * - NOTE: the CSS-only tooltip (`data-tooltip`) needs no script:  it's in `native.css`, a page sheet.
 */

import { UIPopup } from "./UIPopup"

UIPopup.define()

export { UIPopup }
