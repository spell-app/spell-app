/**
 * Barrel for the include -- also the `include` lib entry (`@spell-app/ui/ui-include`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-include>`, plus `<ui-loader>` and `<ui-message>` (its loading and error looks) and
 *   `<ui-root>` (whose `RootLoader` loads the families the included markup uses).
 */

import { UIInclude } from "./UIInclude"
import { UIIncludeHost } from "./UIIncludeHost"

import "$/ui/components/ui-loader"
import "$/ui/components/ui-message"

UIInclude.define()

export { UIInclude, UIIncludeHost }
