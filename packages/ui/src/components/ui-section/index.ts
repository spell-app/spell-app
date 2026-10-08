/**
 * The section family:  defines `<ui-sections>` and `<ui-section>`,
 * and exports their components, `UISections` and `UISection`.
 * - SIDE EFFECT:  importing it defines the tags.
 * - Also the library's `@spell-app/ui/ui-section` entry (its size is in `docs/report.md`).
 * - The group is defined FIRST:  a group already in the page then has its component
 *   when its sections upgrade and look it up.
 * - Both own `section` parts:  a nested `<ui-section>` finds the section or group around it through `PartContext`
 *   (for its level, depth, sticky stack and default `collapsible`).
 */

import { UISections } from "./UISections"
import { UISection } from "./UISection"

UISections.define()
UISection.define()

export { UISection, UISections }
