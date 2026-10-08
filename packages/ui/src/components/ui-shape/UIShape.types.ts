/**
 * The constants and types the `ui-shape` family's files share:  `UIShape` and `UISide`.
 * - Pure data, at the bottom of the folder's imports:  `import type` only, so node can load it (`yarn site:data`).
 * - A constant only one class reads sits below that class (epic `wwod-spell-ui`, Q18).
 */

import type { shapeVocabulary } from "./UIShape.vocabulary.en"

////////////////
// ## Vocabulary
////////////////

/** `shapeVocabulary`'s type, for brevity. */
export type ShapeVocabulary = typeof shapeVocabulary

////////////////
// ## Markup contract (`UIShape.css`)
////////////////

/** The side noun:  `<ui-side>`'s class and part, and how a shape finds its sides (a translated tag too). */
export const SIDE = "side"

/** Class of the turning box. */
export const SIDES = "sides"
