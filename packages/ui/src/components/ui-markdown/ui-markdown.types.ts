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
  /** sanitize the markup (`MarkdownSanitizer`, loaded on first use) */
  sanitized: boolean
}

/** What an engine's render came to. */
export type MarkdownResult = {
  /** the markup, NOT sanitized:  the element sanitizes it when `sanitized` */
  html: string
  headings: MarkdownHeading[]
}

/** What renders markdown:  marked (`MarkdownEngine`) or spell's (`MDEngine`, `editable`). */
export type MarkdownRendering = {
  render(text: string, options: MarkdownOptions): MarkdownResult
}

/** `editable`'s tabs. */
export type MarkdownTab = "write" | "preview"

/** `editable`'s tabs, in order. */
export const MARKDOWN_TABS: readonly MarkdownTab[] = ["write", "preview"]

/** `<ui-table>`'s sheet (`UI.styles` name):  a page sheet, so `editable` adopts it into its shadow root too. */
export const TABLE_SHEET = "table"

/** `editable`'s tab roles and keys. */
export const TAB_ROLES = { list: "tablist", tab: "tab", panel: "tabpanel" } as const
export const TAB_KEYS = { previous: "ArrowLeft", next: "ArrowRight", first: "Home", last: "End" } as const

/** Task-list checkboxes:  marked's (`<input>`) and spell's engine's (`<ui-checkbox>`). */
export const TASK_BOXES = "li > input[type=checkbox], ui-item > ui-checkbox"

/** Tag a fenced code block becomes. */
export const CODE_TAG = "ui-code"

/** Attributes rewritten against `source`, so relative links and images point where they did beside the file. */
export const URL_ATTRIBUTES = ["href", "src"] as const

/** What the host asks of its controller (`UIMarkdown`). */
export type MarkdownController = {
  /** the headings of the last render */
  getHeadings(): MarkdownHeading[]
}
