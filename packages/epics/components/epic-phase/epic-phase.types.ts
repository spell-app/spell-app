/**
 * Loose types and constants of the `epic-phase` family.
 * - Data only:  nothing here runs.
 */

import type { epicPhaseVocabulary } from "./epic-phase.vocabulary.en"
import type { epicFieldVocabulary } from "./epic-field.vocabulary.en"
import type { epicUpdatedVocabulary } from "./epic-updated.vocabulary.en"

/** `epicPhaseVocabulary`'s type. */
export type EpicPhaseVocabulary = typeof epicPhaseVocabulary

/** `epicFieldVocabulary`'s type. */
export type EpicFieldVocabulary = typeof epicFieldVocabulary

/** `epicUpdatedVocabulary`'s type. */
export type EpicUpdatedVocabulary = typeof epicUpdatedVocabulary

/** A phase's status => its icon (Spell UI's names, from the docs bundle's set). */
export const STATUS_ICONS = {
  todo: "circle outline",
  active: "circle half stroke",
  done: "circle check"
} as const

/** A phase's status. */
export type PhaseStatus = keyof typeof STATUS_ICONS

/** A phase's status => its icon's colour in the page's contents list (Spell UI's `color`), as `epic-phase.css`'s. */
export const STATUS_COLORS = {
  todo: "grey",
  active: "orange",
  done: "green"
} as const satisfies Record<PhaseStatus, string>

/** A field's `name` => its icon and its label's text key, as today's phase bodies drew them. */
export const FIELD_LOOKS = {
  symptom: { icon: "circle exclamation", label: "symptom" },
  changes: { icon: "wand magic sparkles", label: "changes" },
  goal: { icon: "bullseye", label: "goal" },
  done: { icon: "circle check", label: "done" },
  files: { icon: "folder", label: "files" },
  verify: { icon: "flask", label: "verify" },
  "to-review": { icon: "list check", label: "toReview" }
} as const

/** A field's `name`. */
export type FieldName = keyof typeof FIELD_LOOKS

/** The To review field:  its links show as chips in their items' state colours. */
export const TO_REVIEW = "to-review"

/**
 * The attribute the To review links get, their item's state (`attention`, `open` ...):  the name today's runtime
 * gave it, which the field's sheet colours by.
 */
export const LINK_STATE = "data-spell-state"

/** An item status that's closed:  its item, without a `state`, reads `old`. */
export const CLOSED_STATUSES = ["decided", "done", "canceled"]

/** Classes of the shadow markup. */
export const FIELD = "field"
export const ICON = "icon"
export const LABEL = "label"
export const TEXT = "text"
export const UPDATED = "updated"
