/**
 * The popup family:  defines `<ui-popup>` and exports its component, `UIPopup`.
 * - SIDE EFFECT:  importing it defines `<ui-popup>`, the owner of the `header` and `content` parts.
 * - NOTE: the CSS-only tooltip (`data-tooltip`) needs no script:  it's in `native.css`, a page sheet.
 * - Also the library's `@spell-app/ui/ui-popup` entry (its size is in `docs/report.md`).
 */

import { UIPopup } from "./UIPopup"

UIPopup.define()

export { UIPopup }
