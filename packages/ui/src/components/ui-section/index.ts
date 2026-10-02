/**
 * Barrel for the section -- also the `section` lib entry (`@spell-app/ui/ui-section`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-section>`, which registers it as the owner of `section` parts:  a nested
 *   `<ui-section>` finds the enclosing one through `PartContext` (its level, depth and sticky stack).
 */

import { UISection } from "./UISection"

UISection.define()

export { UISection }
