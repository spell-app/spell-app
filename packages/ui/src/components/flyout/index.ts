/**
 * Barrel for the flyout -- also the `flyout` lib entry (`@spell/ui/flyout`), measured in `docs/report.md`.
 * - SIDE EFFECTS:
 *   - defines `<ui-flyout>`, which registers as the owner of the `header`, `content`, `description` and `actions`
 *     parts
 *   - loads the modal family (`$/components/modal`:  `DialogElement`, `ModalFallback`), which defines
 *     `<ui-modal>`, the content parts and `<ui-button>` too -- a flyout is Fomantic's side modal
 */

import { UIFlyout } from "./UIFlyout"

UIFlyout.define()

export { UIFlyout }
