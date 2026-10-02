/**
 * Barrel for the icon components -- also the `icon` lib entry (`@spell-app/ui/ui-icon`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-icons>` (first, so it is a registered owner when icons resolve) and `<ui-icon>`.
 * - Packs:  `UI.icons.use()` for the page, `<ui-root icons="...">` for a subtree (`docs/icons.md`).
 */

import { UIIcon } from "./UIIcon"
import { UIIcons } from "./UIIcons"

UIIcons.define()
UIIcon.define()

export { UIIcon, UIIcons }
