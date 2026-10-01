/**
 * Barrel for the icon components -- also the `icon` lib entry (`@spell-app/ui/icon`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-icons>` (first, so it is a registered owner when icons resolve), `<ui-icon>` and
 *   `<ui-icon-set>`.
 */

import { UIIcon } from "./UIIcon"
import { UIIcons } from "./UIIcons"
import { UIIconSet } from "./UIIconSet"

UIIcons.define()
UIIcon.define()
UIIconSet.define()

export { UIIcon, UIIcons, UIIconSet }
