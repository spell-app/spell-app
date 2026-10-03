/**
 * Loose constants and types of the `ui-code` family.
 * - Data only:  the element, its helpers and its fallback import what they need from here.
 */

import type { codeVocabulary } from "./ui-code.vocabulary.en"

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof codeVocabulary

/** `language` meaning "no colouring". */
export const TEXT = "text"

/** Class of each line's span inside `<code>`. */
export const LINE_CLASS = "line"

/** highlight.js's class prefix (`hljs-keyword`), and the class on `<code>`. */
export const HLJS_PREFIX = "hljs-"
export const HLJS_CLASS = "hljs"

/** ms the copy button says "Copied". */
export const COPIED_MS = 2000

/** What a highlight came to. */
export type Highlighted = {
  /** the code as HTML:  escaped text in `hljs-*` spans */
  html: string
  /** what it was coloured as;  `undefined` for plain text */
  language?: string
  /** guessed, not asked for */
  detected: boolean
}

/** What the host asks of its controller (`UICode`). */
export type CodeController = {
  /** what auto-detection picked, when it ran */
  detectedLanguage(): string | undefined
}
