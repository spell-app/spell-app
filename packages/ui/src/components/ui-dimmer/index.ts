/**
 * The dimmer family:  defines `<ui-dimmer>` and exports its component, `UIDimmer`.
 * - SIDE EFFECT:  importing it defines the tag;
 *   a dimmer's first render registers the `dimmer-page` page sheet (a dimmer's parent is positioned for it).
 * - NOTE: `<ui-modal>` doesn't use it:  a modal's dimmer is its `<dialog>`'s `::backdrop`,
 *   themed by the same `--ui-dimmer-*` tokens.
 * - Also the library's `@spell-app/ui/ui-dimmer` entry (its size is in `docs/report.md`).
 */

import { UIDimmer } from "./UIDimmer"

UIDimmer.define()

export { UIDimmer }
