/**
 * Constants and types the `ui-comment` family's files share:  `<ui-comments>`, `<ui-comment>` and their native
 * fallback.
 * - Pure data:  `import type` only, so every file of the family may import it.
 */

import type { commentVocabulary } from "./ui-comment.vocabulary.en"
import type { commentsVocabulary } from "./ui-comments.vocabulary.en"

////////////////
// ## Class words
////////////////

/** Class, part and slot of the reply box. */
export const REPLY = "reply"

/** Class word a thread of replies keeps (`collapsed comments`). */
export const COLLAPSED = "collapsed"

////////////////
// ## Types
////////////////

/** Either vocabulary:  `CommentFallback` serves both tags. */
export type Vocabulary = typeof commentsVocabulary | typeof commentVocabulary
