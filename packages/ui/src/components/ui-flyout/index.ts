/**
 * The flyout family:  defines `<ui-flyout>` and exports its component, `UIFlyout`.
 * - SIDE EFFECTS:
 *   - defines `<ui-flyout>`, the owner of the `header`, `content`, `description` and `actions` parts
 *   - loads the modal family (`$/ui/components/ui-modal`), which defines `<ui-modal>`,
 *     the content parts and `<ui-button>` too:  a flyout is Fomantic's side modal
 * - NOTE: `UIFlyout` imports the modal's FILES, never its barrel,
 *   so a server render (`$/ui/static`) can load `UIFlyout` without `customElements`;  the barrel is imported here.
 * - Also the library's `@spell-app/ui/ui-flyout` entry (its size is in `docs/report.md`).
 */

import { UIFlyout } from "./UIFlyout"

import "$/ui/components/ui-modal"

UIFlyout.define()

export { UIFlyout }
