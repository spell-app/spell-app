/**
 * Barrel for the flag -- also the `flag` lib entry (`@spell-app/ui/flag`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-flag>`.
 * - NOTE: `FlagCountry` (the `country` resolver) is exported too, for pages that want the emoji or code alone.
 */

import { FlagCountry } from "./FlagCountry"
import { UIFlag } from "./UIFlag"

UIFlag.define()

export { FlagCountry, UIFlag }
