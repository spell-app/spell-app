/**
 * The container family:  defines `<ui-container>` and exports its component, `UIContainer`.
 * - SIDE EFFECT:  importing it defines the tag.
 * - Also the library's `@spell-app/ui/ui-container` entry (its size is in `docs/report.md`).
 */

import { UIContainer } from "./UIContainer"

UIContainer.define()

export { UIContainer }
