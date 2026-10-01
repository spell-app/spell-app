/**
 * Loose constants, types and helpers of `<ui-statistic>`:  its element classes and native fallback import them from here.
 */

import { PART_STATIC_CLASS_PREFIX } from "$/ui/core"
import { statisticVocabulary } from "./ui-statistic.vocabulary.en"

////////////////
// ## UIStatistic
////////////////

/** The static owner class of a part in a statistic (`ui-parts.css`). */
export const IN_STATISTIC = `${PART_STATIC_CLASS_PREFIX}${statisticVocabulary.noun}`

/** Classes of the `value` shorthand. */
export const VALUE_CLASS = `value ${IN_STATISTIC}`

/** Classes of the `label` shorthand. */
export const LABEL_CLASS = `label ${IN_STATISTIC}`
