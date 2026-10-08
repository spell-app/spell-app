/**
 * The flag family:  defines `<ui-flag>` and exports its component, `UIFlag`.
 * - SIDE EFFECT:  importing it defines the tag.
 * - Also the library's `@spell-app/ui/ui-flag` entry (its size is in `docs/report.md`).
 * - It exports `FlagCountry` (the `country` resolver) too, for pages that want the emoji or the code alone.
 */

import { FlagCountry } from "./FlagCountry"
import { UIFlag } from "./UIFlag"

UIFlag.define()

export { FlagCountry, UIFlag }
