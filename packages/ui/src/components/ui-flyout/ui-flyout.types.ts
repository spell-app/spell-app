/**
 * Constants and types the `ui-flyout` family's files share:  `<ui-flyout>` and its native fallback.
 * - Pure data:  `import type` only, so every file of the family may import it.
 * - The word widths (`thin`, `very wide`) are `<ui-sidebar>`'s too:  `UIT.WordWidths`, `UIT.WordWidthClasses`.
 */

import type { flyoutVocabulary } from "./ui-flyout.vocabulary.en"

/** The flyout's vocabulary type:  `DialogElement<Vocabulary>`, `AttributeName<Vocabulary>`. */
export type Vocabulary = typeof flyoutVocabulary

/** The attribute taking word widths beside columns. */
export const WIDTH = "width"
