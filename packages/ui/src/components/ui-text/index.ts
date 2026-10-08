/**
 * The text family:  defines `<ui-text>` and exports its component, `UIText`.
 * - SIDE EFFECT:  importing it defines the tag.
 * - Also the library's `@spell-app/ui/ui-text` entry (its size is in `docs/report.md`).
 */

import { UIText } from "./UIText"

UIText.define()

export { UIText }
