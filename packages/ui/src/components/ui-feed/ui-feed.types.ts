/**
 * Types the `ui-feed` family's files share:  `<ui-feed>`, `<ui-event>` and their native fallback.
 * - Pure data:  `import type` only, so every file of the family may import it.
 * - Its words (`ul` / `ol`, `ordered`, `label`, the colour remap prefix) are the list and item families' too:
 *   `UIT`'s.
 */

import type { eventVocabulary } from "./ui-event.vocabulary.en"
import type { feedVocabulary } from "./ui-feed.vocabulary.en"

/** Either vocabulary:  `FeedFallback` serves both tags. */
export type Vocabulary = typeof feedVocabulary | typeof eventVocabulary
