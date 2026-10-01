/**
 * Loose constants and types of the `ui-comment` family:  the words, selectors and shapes its element
 * classes and its native fallback share, lifted out of their files.
 * - Data only:  nothing here runs;  the classes import what they need from `./ui-comment.types`.
 */

import type { commentVocabulary } from "./ui-comment.vocabulary.en"
import type { commentsVocabulary } from "./ui-comments.vocabulary.en"

/** Class of the reply box. */
export const REPLY = "reply"

/** Class words a thread keeps. */
export const COLLAPSED = "collapsed"

/** Either vocabulary, for brevity. */
export type Vocabulary = typeof commentsVocabulary | typeof commentVocabulary
