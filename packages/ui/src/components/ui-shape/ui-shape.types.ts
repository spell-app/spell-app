/**
 * Constants and types of the `ui-shape` family that its element classes (`UIShape`, `UISide`) and its native fallback
 * (`ShapeFallback`) share.
 * - Pure data, at the bottom of the folder's imports:  `import type` only, so node can load it (`yarn site:data`).
 * - Constants only one class reads live below that class (epic `wwod-spell-ui`, Q18).
 */

import type { shapeVocabulary } from "./ui-shape.vocabulary.en"

////////////////
// ## Vocabulary
////////////////

/** `shapeVocabulary`'s type, for brevity. */
export type ShapeVocabulary = typeof shapeVocabulary

////////////////
// ## Markup contract (`ui-shape.css`)
////////////////

/** The side noun:  `<ui-side>`'s class and part, and how a shape finds its sides (a translated tag too). */
export const SIDE = "side"

/** Class of the turning box. */
export const SIDES = "sides"

/** Live-region politeness of the sides box:  the new side is read out after a flip. */
export const POLITE = "polite"
