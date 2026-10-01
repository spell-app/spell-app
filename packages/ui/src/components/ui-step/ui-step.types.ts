/**
 * Loose constants, types and helpers of `<ui-step>`:  its element classes and native fallback import them from here.
 */

import { PART_STATIC_CLASS_PREFIX } from "$/ui/core"
import { stepVocabulary } from "./ui-step.vocabulary.en"

////////////////
// ## UIStep
////////////////

/** Glyph of a completed step's icon. */
export const CHECK = "check"

/** Root of a plain step. */
export const BOX = "div"

/** `aria-current` of the selected step. */
export const STEP = "step"

/** The static owner class of a part in a step (`ui-parts.css`). */
export const IN_STEP = `${PART_STATIC_CLASS_PREFIX}${stepVocabulary.noun}`

/** Classes of the shorthand content block. */
export const CONTENT = `content ${IN_STEP}`

/** Classes of the `header` shorthand (Fomantic's `.title`). */
export const TITLE = `title ${IN_STEP}`

/** Classes of the `description` shorthand. */
export const DESCRIPTION = `description ${IN_STEP}`

////////////////
// ## ui-step.fallback
////////////////

/** The English "Completed", from the vocabulary:  a failed render can't count on the runtime's translations. */
export const COMPLETED = stepVocabulary.texts.find(({ key }) => key === "stepCompleted")!.text
