/**
 * Loose constants, types and helpers of `<ui-statistic>`:  its element classes and native fallback import them from here.
 */

// pure data (vocabularies / types) never import `$/ui/core` by value:  it loads the element layer, which node
// can't (`yarn site:data` / `yarn gen:root` import every vocabulary through tsx:  no `?inline` css, no JSX)
import * as UIT from "$/ui/components/components.types"
import { statisticVocabulary } from "./ui-statistic.vocabulary.en"

////////////////
// ## UIStatistic
////////////////

/** The static owner class of a part in a statistic (`ui-parts.css`). */
export const IN_STATISTIC = `${UIT.PART_STATIC_CLASS_PREFIX}${statisticVocabulary.noun}`

/** Classes of the `value` shorthand. */
export const VALUE_CLASS = `value ${IN_STATISTIC}`

/** Classes of the `label` shorthand. */
export const LABEL_CLASS = `label ${IN_STATISTIC}`
