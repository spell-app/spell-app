/**
 * The reveal family:  defines `<ui-reveal>` and exports its component, `UIReveal`.
 * - SIDE EFFECT:  importing it defines the tag.
 * - Also the library's `@spell-app/ui/ui-reveal` entry (its size is in `docs/report.md`).
 */

import { UIReveal } from "./UIReveal"

UIReveal.define()

export { UIReveal }
