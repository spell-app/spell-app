/**
 * The accordion family:  defines `<ui-accordion>` and exports its component, `UIAccordion`.
 * - SIDE EFFECT:  importing it defines the tag, and the content parts (`$/ui/components/ui-parts`):
 *   an accordion's children are `<ui-title>` + `<ui-content>` pairs.
 *   An accordion owns the accordions nested in it.
 * - Also the library's `@spell-app/ui/ui-accordion` entry (its size is in `docs/report.md`).
 */

import { UIAccordion } from "./UIAccordion"

import "$/ui/components/ui-parts"

UIAccordion.define()

export { UIAccordion }
