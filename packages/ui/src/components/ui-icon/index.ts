/**
 * The icon family:  defines `<ui-icons>` and `<ui-icon>`, and exports their components, `UIIcons` and `UIIcon`.
 * - SIDE EFFECT:  importing it defines the tags;  `<ui-icons>` first, so it's a registered owner when icons resolve.
 * - Also the library's `@spell-app/ui/ui-icon` entry (its size is in `docs/report.md`).
 * - Icon packs:  `UI.icons.use()` for the page, `<ui-root icons="…">` for a subtree (`docs/icons.md`).
 */

import { UIIcon } from "./UIIcon"
import { UIIcons } from "./UIIcons"

UIIcons.define()
UIIcon.define()

export { UIIcon, UIIcons }
