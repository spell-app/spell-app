/**
 * Barrel for the accordion -- also the `accordion` lib entry (`@spell-app/ui/ui-accordion`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines the content parts (through `$/ui/components/ui-parts`:  an accordion's children are
 *   `<ui-title>` + `<ui-content>` pairs) and `<ui-accordion>`, which registers as the owner of nested accordions.
 */

import { UIAccordion } from "./UIAccordion"

import "$/ui/components/ui-parts"

UIAccordion.define()

export { UIAccordion }
