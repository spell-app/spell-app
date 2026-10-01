/**
 * Barrel for the dimmer -- also the `dimmer` lib entry (`@spell-app/ui/dimmer`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-dimmer>`;  its first render registers the `dimmer-page` page sheet (a dimmer's parent
 *   is positioned for it).
 * - NOTE: `<ui-modal>` doesn't use it:  a modal's dimmer is its `<dialog>`'s `::backdrop`, themed by the same
 *   `--ui-dimmer-*` tokens.
 */

import { UIDimmer } from "./UIDimmer"

UIDimmer.define()

export { UIDimmer }
