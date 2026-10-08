/**
 * The visibility family:  defines `<ui-visibility>` and exports its component, `UIVisibility`.
 * - SIDE EFFECT:  importing it defines the tag.
 * - NOTE: the behaviour itself is the runtime's (`UI.observeVisibility()`, `UI.visibility.lazyImage()`),
 *   usable without this element.
 * - Also the library's `@spell-app/ui/ui-visibility` entry (its size is in `docs/report.md`).
 */

import { UIVisibility } from "./UIVisibility"

UIVisibility.define()

export { UIVisibility }
