/**
 * Barrel for the visibility -- also the `visibility` lib entry (`@spell-app/ui/visibility`), measured in
 * `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-visibility>`.
 * - NOTE: the behaviour itself is the runtime's (`UI.observeVisibility()`, `UI.visibility.lazyImage()`), usable
 *   without this element.
 */

import { UIVisibility } from "./UIVisibility"

UIVisibility.define()

export { UIVisibility }
