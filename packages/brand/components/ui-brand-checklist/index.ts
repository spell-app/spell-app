/**
 * `ui-brand-checklist` family barrel:  defines `<ui-brand-checklist>` and `<ui-brand-check>` (SIDE EFFECT) and
 * exports their classes.
 * - The list first:  a check that upgrades before its list is registered finds it on its next settle anyway
 *   (`PartContext`), and a list that read its children too early re-reads them (`checkState()`).
 */
import { UIBrandChecklist } from "./UIBrandChecklist"
import { UIBrandCheck } from "./UIBrandCheck"

UIBrandChecklist.define()
UIBrandCheck.define()

export { UIBrandChecklist, UIBrandCheck }
