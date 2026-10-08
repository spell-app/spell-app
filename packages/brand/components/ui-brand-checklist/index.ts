/**
 * The brand checklist family:  defines `<ui-brand-checklist>` and `<ui-brand-check>`, and exports their components
 * and the check's DOM element class, `DOMBrandCheckElement`.
 * - SIDE EFFECT:  importing it defines the tags.
 * - The list first:  a check that upgrades before its list is registered finds it on its next settle anyway
 *   (`PartContext`), and a list that read its children too early reads them again (`checkState()`).
 */
import { UIBrandChecklist } from "./UIBrandChecklist"
import { DOMBrandCheckElement, UIBrandCheck } from "./UIBrandCheck"

UIBrandChecklist.define()
UIBrandCheck.define()

export { UIBrandChecklist, UIBrandCheck, DOMBrandCheckElement }
