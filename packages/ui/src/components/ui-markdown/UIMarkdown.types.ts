/**
 * The types of the markdown family that the component, its renderer and its engines share.
 * - Pure data:  `import type` only, so node can load it (`yarn site:data`),
 *   and the engines (built ALONE by the docs bundler) pull in nothing with it.
 * - The constants only `UIMarkdown` reads live below that class.
 */

////////////////
// ## Rendering
////////////////

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
  /** every heading, in order */
  headings: MarkdownHeading[]
}

/** What renders markdown:  marked (`MarkdownEngine`) or spell's (`MDEngine`, `editable`). */
export type MarkdownRendering = {
  /** `text` rendered as `options` say. */
  render(text: string, options: MarkdownOptions): MarkdownResult
}
