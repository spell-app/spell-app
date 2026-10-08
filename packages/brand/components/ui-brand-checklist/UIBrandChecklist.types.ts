/**
 * Constants and types of the `ui-brand-checklist` family:  what its two components share
 * (`UIBrandChecklist`, `UIBrandCheck`).
 * - Data only:  nothing here runs.
 */

import type { brandChecklistVocabulary } from "./UIBrandChecklist.vocabulary.en"
import type { brandCheckVocabulary } from "./UIBrandCheck.vocabulary.en"

////////////////
// ## Vocabularies
////////////////

/** `brandChecklistVocabulary`'s type. */
export type BrandChecklistVocabulary = typeof brandChecklistVocabulary

/** `brandCheckVocabulary`'s type. */
export type BrandCheckVocabulary = typeof brandCheckVocabulary

////////////////
// ## States
////////////////

/** How a check shows:  done (filled, a check), active (soft, pulsing) or pending (an empty ring). */
export type CheckState = "done" | "active" | "pending"

/** Done. */
export const DONE: CheckState = "done"

/** In progress. */
export const ACTIVE: CheckState = "active"

/** Not started. */
export const PENDING: CheckState = "pending"

/** A check's text face:  `sans` (14px, 20px marks) or `serif` (15px, 19px marks). */
export type CheckFont = "sans" | "serif"

/**
 * The `checked` attribute:  another name for `selected`, read by the check (`DOMBrandCheckElement` owns the property).
 */
export const CHECKED = "checked"

/** The role of a `checkable` check's button. */
export const CHECKBOX = "checkbox"

/** `aria-current` of the active check. */
export const STEP = "step"

/** The role of the checklist's live region (polite). */
export const STATUS = "status"

////////////////
// ## Owner
////////////////

/** The part noun a checklist owns (`ownsParts`), and the noun its children are found by. */
export const CHECK_NOUN = "check"

/**
 * What a `<ui-brand-checklist>` answers its checks (`PartContext` finds it).
 * - On the component, not the DOM element:  the check asks it from a memo, so the answer is tracked.
 */
export type ChecklistOwner = {
  /** How `check` shows now.  Tracked. */
  checkState(check: Element): ChecklistCheckState
}

/** The owner's say about one check. */
export type ChecklistCheckState = {
  /** from the list's `step`;  `undefined` while it has none (the check's own `state` stands) */
  state: CheckState | undefined
  /** the list is `checkable` */
  checkable: boolean
  /** the list's `font`, which a check without its own follows */
  font: CheckFont | undefined
}

////////////////
// ## Events
////////////////

/** `detail` of `ui-change`, from a `checkable` `<ui-brand-check>`. */
export type BrandCheckChangeDetail = {
  /** ticked after the change */
  selected: boolean
  /** the same as `selected`, as the DOM element's `checked` */
  checked: boolean
  originalEvent?: Event
}
