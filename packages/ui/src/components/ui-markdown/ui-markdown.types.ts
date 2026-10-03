/**
 * Loose constants and types of the `ui-markdown` family.
 * - Data only:  the element, its helpers and its fallback import what they need from here.
 */

import type { markdownVocabulary } from "./ui-markdown.vocabulary.en"

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof markdownVocabulary

/** One heading of the rendered markdown. */
export type MarkdownHeading = {
  /** `1` ... `6`, after `heading-offset` */
  level: number
  /** its text */
  text: string
  /** its `id` (GitHub's slug), so `#id` links reach it */
  id: string
}

/** How to render. */
export type MarkdownOptions = {
  /** a single newline is a `<br>` */
  breaks: boolean
  /** levels to shift headings by */
  headingOffset: number
  /** skip sanitizing */
  trusted: boolean
}

/** What a render came to. */
export type MarkdownResult = {
  /** the markup, sanitized unless `trusted` */
  fragment: DocumentFragment
  headings: MarkdownHeading[]
}

/** Tag a fenced code block becomes. */
export const CODE_TAG = "ui-code"

/** Attributes rewritten against `source`, so relative links and images point where they did beside the file. */
export const URL_ATTRIBUTES = ["href", "src"] as const

/** What the host asks of its controller (`UIMarkdown`). */
export type MarkdownController = {
  /** the headings of the last render */
  getHeadings(): MarkdownHeading[]
}
