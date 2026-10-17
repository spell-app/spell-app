/**
 * The brand checklist family:  defines `<brand-checklist>` and `<brand-check>`, and exports their components
 * and the check's DOM element class, `DOMBrandCheckElement`.
 * - SIDE EFFECT:  importing it defines the tags.
 * - The list first:  a check that upgrades before its list is registered finds it on its next settle anyway
 *   (`PartContext`), and a list that read its children too early reads them again (`checkState()`).
 */
import { BrandChecklist } from "./BrandChecklist"
import { DOMBrandCheckElement, BrandCheck } from "./BrandCheck"

BrandChecklist.define()
BrandCheck.define()

export { BrandChecklist, BrandCheck, DOMBrandCheckElement }
