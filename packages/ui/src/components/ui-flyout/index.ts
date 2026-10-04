/**
 * Barrel for the flyout -- also the `flyout` lib entry (`@spell-app/ui/ui-flyout`), measured in `docs/report.md`.
 * - SIDE EFFECTS:
 *   - defines `<ui-flyout>`, which registers as the owner of the `header`, `content`, `description` and `actions`
 *     parts
 *   - loads the modal family (`$/ui/components/ui-modal`:  `DialogElement`, `ModalFallback`), which defines
 *     `<ui-modal>`, the content parts and `<ui-button>` too -- a flyout is Fomantic's side modal
 * - NOTE: `UIFlyout` / `FlyoutFallback` import the modal's FILES, never its barrel, so a server render
 *   (`$/ui/server`) can load `UIFlyout` without `customElements`;  the barrel is imported here instead.
 */

import { UIFlyout } from "./UIFlyout"

import "$/ui/components/ui-modal"

UIFlyout.define()

export { UIFlyout }
