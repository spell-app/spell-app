/**
 * Loose constants and types of the `ui-brand-checklist` family (`<ui-brand-checklist>`, `<ui-brand-check>`).
 * - Data only:  nothing here runs.
 */

import type { brandChecklistVocabulary } from "./ui-brand-checklist.vocabulary.en"
import type { brandCheckVocabulary } from "./ui-brand-check.vocabulary.en"

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

/** Class word of a check the user ticks. */
export const CHECKABLE = "checkable"

/** The `checked` attribute:  the alias of `selected`, read by the check (`BrandCheckHost` owns the property). */
export const CHECKED = "checked"

/** Role of a `checkable` check's button. */
export const CHECKBOX = "checkbox"

/** `aria-current` of the active check. */
export const STEP = "step"

/** Role of the checklist's live region (polite). */
export const STATUS = "status"

/** The check mark's path, in a 16 x 16 box. */
export const CHECK_PATH = "M3.75 8.5 6.6 11.25 12.25 5"

/** The check mark's `viewBox`. */
export const CHECK_VIEW_BOX = "0 0 16 16"

/** The SVG namespace, for the native fallback's mark. */
export const SVG_NS = "http://www.w3.org/2000/svg"

////////////////
// ## Owner
////////////////

/** The part noun a checklist owns (`ownsParts`), and the noun its children are found by. */
export const CHECK_NOUN = "check"

/**
 * What a `<ui-brand-checklist>` answers its checks (`PartContext` finds it).
 * - On the controller, not the host:  the check asks it from a memo, so the answer is tracked.
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
}

////////////////
// ## Events
////////////////

/** `detail` of `ui-change`, from a `checkable` `<ui-brand-check>`. */
export type BrandCheckChangeDetail = {
  /** ticked after the change */
  selected: boolean
  /** alias of `selected`, as the host's `checked` */
  checked: boolean
  originalEvent?: Event
}
